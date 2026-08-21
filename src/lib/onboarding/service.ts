import { randomUUID } from 'node:crypto';
import { getOnboardingSchema } from './schema';
import { calculateProgress } from './progress';
import { assertTransition, isCustomerEditable } from './state-machine';
import { createCustomerToken, decryptCustomerToken, encryptCustomerToken, hashCustomerToken } from './security';
import { exportConfiguration } from './exporters';
import { sanitizeAnswer, validateAnswers } from './validation';
import { notifyOnboardingSubmission } from './notifications';
import {
  addAssetRecord, addEventRecord, addReviewRecord, createProjectRecord, deleteAssetRecord,
  findProjectBySourceItem, findProjectByTokenHash, getProjectBundle, replaceProjectToken,
  resolveReviewRecord, saveProjectAnswers, updateAssetRecord, updateProjectStatus,
} from './repository';
import { removeStoredFile, storeUpload, validateUpload } from './storage';
import type {
  AnswerMap, CreateOnboardingInput, JsonValue, OnboardingAsset, OnboardingBundle,
  OnboardingReview, OnboardingStatus,
} from './types';

function ttlDate(): string {
  const configured = Number(process.env.ONBOARDING_TOKEN_TTL_DAYS ?? '30');
  const days = Number.isFinite(configured) && configured > 0 ? Math.min(configured, 365) : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function tokenValues(expiresAt = ttlDate()) {
  const token = createCustomerToken();
  return { token, hash: hashCustomerToken(token), encrypted: encryptCustomerToken(token), expiresAt };
}

async function event(projectId: string, type: string, actor: string, metadata: Record<string, JsonValue> = {}) {
  await addEventRecord({ id: randomUUID(), projectId, type, actor, metadata, createdAt: new Date().toISOString() });
}

export function onboardingUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  return `${base}/onboarding/${token}`;
}

export async function createOnboarding(input: CreateOnboardingInput): Promise<{ bundle: OnboardingBundle; token: string; url: string; created: boolean }> {
  if (input.sourceOrderItemId) {
    const existing = await findProjectBySourceItem(input.sourceOrderItemId);
    if (existing) {
      const bundle = await getProjectBundle(existing.id);
      if (!bundle) throw new Error('Onboarding relacionado ao pedido não foi encontrado.');
      const token = decryptCustomerToken(existing.tokenEncrypted);
      return { bundle, token, url: onboardingUrl(token), created: false };
    }
  }
  const generated = tokenValues(input.tokenExpiresAt);
  const project = await createProjectRecord(input, generated);
  await event(project.id, 'CREATED', 'admin', { projectType: project.projectType });
  const bundle = await getProjectBundle(project.id);
  if (!bundle) throw new Error('Onboarding criado, mas não pôde ser carregado.');
  return { bundle, token: generated.token, url: onboardingUrl(generated.token), created: true };
}

export async function getCustomerBundle(token: string): Promise<OnboardingBundle> {
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) throw new Error('Link inválido.');
  const project = await findProjectByTokenHash(hashCustomerToken(token));
  if (!project || project.tokenRevokedAt) throw new Error('Este link não está mais disponível.');
  if (new Date(project.tokenExpiresAt).getTime() <= Date.now()) throw new Error('Este link expirou. Solicite um novo acesso à Blajeen.');
  const bundle = await getProjectBundle(project.id);
  if (!bundle) throw new Error('Onboarding não encontrado.');
  return bundle;
}

export async function saveCustomerAnswers(token: string, patch: AnswerMap, currentStep: number): Promise<OnboardingBundle> {
  const bundle = await getCustomerBundle(token);
  if (!isCustomerEditable(bundle.project.status)) throw new Error('Este onboarding está bloqueado para edição.');
  const cleaned = Object.fromEntries(Object.entries(patch).slice(0, 100).map(([key, value]) => [key.slice(0, 180), sanitizeAnswer(value)])) as AnswerMap;
  if (bundle.project.status === 'CHANGES_REQUESTED') {
    const openReviews = bundle.reviews.filter((review) => review.status === 'OPEN');
    for (const key of Object.keys(cleaned)) {
      const allowed = openReviews.some((review) => review.field ? key === `${review.section}.${review.field}` : key.startsWith(`${review.section}.`));
      if (!allowed) throw new Error('Edite somente os campos indicados pela Blajeen.');
    }
  }
  const answers = { ...bundle.answers, ...cleaned };
  const progress = calculateProgress(getOnboardingSchema(bundle.project.projectType), answers, bundle.assets);
  await saveProjectAnswers(bundle.project.id, cleaned, progress.progress, Math.max(0, currentStep));
  await event(bundle.project.id, 'AUTOSAVED', 'customer', { fields: Object.keys(cleaned).length, progress: progress.progress });
  const updated = await getProjectBundle(bundle.project.id);
  if (!updated) throw new Error('Não foi possível recarregar o onboarding.');
  return updated;
}

export async function submitCustomerOnboarding(token: string, termsAccepted: boolean): Promise<OnboardingBundle> {
  const bundle = await getCustomerBundle(token);
  if (!isCustomerEditable(bundle.project.status)) throw new Error('Este onboarding não pode ser enviado agora.');
  if (!termsAccepted) throw new Error('Confirme a autorização de uso das imagens e informações.');
  const issues = validateAnswers(getOnboardingSchema(bundle.project.projectType), bundle.answers, bundle.assets);
  if (issues.length) throw new Error(`Ainda existem ${issues.length} campos obrigatórios ou inválidos.`);
  assertTransition(bundle.project.status, 'SUBMITTED');
  await updateProjectStatus(bundle.project.id, 'SUBMITTED');
  await event(bundle.project.id, 'SUBMITTED', 'customer', { consentAccepted: true });
  const updated = await getProjectBundle(bundle.project.id);
  if (!updated) throw new Error('Não foi possível recarregar o onboarding.');
  try {
    const delivery = await notifyOnboardingSubmission(updated);
    await event(bundle.project.id, `EMAIL_${delivery}`, 'system', { recipient: process.env.ONBOARDING_NOTIFICATION_EMAIL?.trim() || 'brg.ftw@gmail.com' });
  } catch (error) {
    await event(bundle.project.id, 'EMAIL_FAILED', 'system', { reason: error instanceof Error ? error.message.slice(0, 300) : 'Falha desconhecida' });
  }
  return updated;
}

export async function regenerateCustomerLink(projectId: string): Promise<{ token: string; url: string }> {
  const generated = tokenValues();
  await replaceProjectToken(projectId, generated);
  await event(projectId, 'LINK_REGENERATED', 'admin');
  return { token: generated.token, url: onboardingUrl(generated.token) };
}

export async function uploadCustomerAsset(token: string, slot: string, file: File, altText: string, caption: string, consentConfirmed: boolean): Promise<OnboardingAsset> {
  const bundle = await getCustomerBundle(token);
  if (!isCustomerEditable(bundle.project.status)) throw new Error('Este onboarding está bloqueado para edição.');
  if (bundle.project.status === 'CHANGES_REQUESTED') {
    const allowed = bundle.reviews.some((review) => review.status === 'OPEN' && (review.section === slot.split('.')[0]) && (!review.field || slot === `${review.section}.${review.field}`));
    if (!allowed) throw new Error('Envie arquivos somente nos campos indicados pela Blajeen.');
  }
  const upload = await validateUpload(file);
  const storageKey = await storeUpload(bundle.project.id, upload);
  const asset: OnboardingAsset = {
    id: randomUUID(), projectId: bundle.project.id, slot: slot.slice(0, 180), originalName: upload.originalName,
    storageKey, mimeType: upload.mimeType, size: upload.size, width: upload.width, height: upload.height,
    altText: altText.slice(0, 300), caption: caption.slice(0, 500),
    sortOrder: bundle.assets.filter((entry) => entry.slot === slot).length, consentConfirmed,
    createdAt: new Date().toISOString(),
  };
  await addAssetRecord(asset);
  const withAsset = await getProjectBundle(bundle.project.id);
  if (withAsset) {
    const progress = calculateProgress(getOnboardingSchema(bundle.project.projectType), withAsset.answers, withAsset.assets);
    await saveProjectAnswers(bundle.project.id, {}, progress.progress, bundle.project.currentStep);
  }
  await event(bundle.project.id, 'ASSET_UPLOADED', 'customer', { slot: asset.slot, mimeType: asset.mimeType, size: asset.size });
  return asset;
}

export async function editCustomerAsset(token: string, assetId: string, patch: Pick<OnboardingAsset, 'altText' | 'caption' | 'sortOrder' | 'consentConfirmed'>): Promise<void> {
  const bundle = await getCustomerBundle(token);
  if (!isCustomerEditable(bundle.project.status)) throw new Error('Este onboarding está bloqueado para edição.');
  await updateAssetRecord(bundle.project.id, assetId, patch);
  await event(bundle.project.id, 'ASSET_UPDATED', 'customer', { assetId });
}

export async function removeCustomerAsset(token: string, assetId: string): Promise<void> {
  const bundle = await getCustomerBundle(token);
  if (!isCustomerEditable(bundle.project.status)) throw new Error('Este onboarding está bloqueado para edição.');
  const asset = await deleteAssetRecord(bundle.project.id, assetId);
  if (asset) await removeStoredFile(asset.storageKey);
  const withoutAsset = await getProjectBundle(bundle.project.id);
  if (withoutAsset) {
    const progress = calculateProgress(getOnboardingSchema(bundle.project.projectType), withoutAsset.answers, withoutAsset.assets);
    await saveProjectAnswers(bundle.project.id, {}, progress.progress, bundle.project.currentStep);
  }
  await event(bundle.project.id, 'ASSET_REMOVED', 'customer', { assetId });
}

export async function adminTransition(projectId: string, nextStatus: OnboardingStatus): Promise<OnboardingBundle> {
  const bundle = await getProjectBundle(projectId);
  if (!bundle) throw new Error('Onboarding não encontrado.');
  assertTransition(bundle.project.status, nextStatus);
  await updateProjectStatus(projectId, nextStatus);
  await event(projectId, nextStatus, 'admin');
  const updated = await getProjectBundle(projectId);
  if (!updated) throw new Error('Onboarding não encontrado.');
  return updated;
}

export async function requestChanges(projectId: string, input: { section: string; field?: string | null; message: string; author: string }): Promise<OnboardingReview> {
  const bundle = await getProjectBundle(projectId);
  if (!bundle) throw new Error('Onboarding não encontrado.');
  if (bundle.project.status !== 'SUBMITTED') throw new Error('Correções só podem ser solicitadas depois do envio.');
  const review: OnboardingReview = {
    id: randomUUID(), projectId, section: input.section.slice(0, 120), field: input.field?.slice(0, 120) ?? null,
    message: input.message.trim().slice(0, 2000), status: 'OPEN', author: input.author.trim().slice(0, 120) || 'Blajeen',
    createdAt: new Date().toISOString(), resolvedAt: null,
  };
  if (!review.message) throw new Error('Escreva a correção solicitada.');
  await addReviewRecord(review);
  await updateProjectStatus(projectId, 'CHANGES_REQUESTED');
  await event(projectId, 'CHANGES_REQUESTED', 'admin', { section: review.section, field: review.field });
  return review;
}

export async function resolveReview(projectId: string, reviewId: string): Promise<void> {
  await resolveReviewRecord(projectId, reviewId);
  await event(projectId, 'REVIEW_RESOLVED', 'admin', { reviewId });
}

export async function exportProject(projectId: string) {
  const bundle = await getProjectBundle(projectId);
  if (!bundle) throw new Error('Onboarding não encontrado.');
  if (!['APPROVED', 'IMPLEMENTING', 'PUBLISHED', 'ARCHIVED'].includes(bundle.project.status)) throw new Error('A exportação exige aprovação do projeto.');
  const configuration = exportConfiguration(bundle);
  await event(projectId, 'PACKAGE_EXPORTED', 'admin', { schemaVersion: configuration.schemaVersion });
  return configuration;
}
