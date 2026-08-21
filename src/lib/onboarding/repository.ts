import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type {
  AnswerMap,
  CreateOnboardingInput,
  JsonValue,
  OnboardingAsset,
  OnboardingBundle,
  OnboardingEvent,
  OnboardingProject,
  OnboardingReview,
  OnboardingStatus,
  ProjectType,
} from './types';

type DatabaseState = {
  projects: OnboardingProject[];
  answers: Record<string, AnswerMap>;
  assets: OnboardingAsset[];
  reviews: OnboardingReview[];
  events: OnboardingEvent[];
};

type ProjectFilters = { query?: string; status?: OnboardingStatus; projectType?: ProjectType; assignedTo?: string };

const localPath = resolve(process.cwd(), '.data', 'onboarding.json');
let writeQueue = Promise.resolve();

const emptyState = (): DatabaseState => ({ projects: [], answers: {}, assets: [], reviews: [], events: [] });

async function readLocal(): Promise<DatabaseState> {
  try {
    return JSON.parse(await readFile(localPath, 'utf8')) as DatabaseState;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyState();
    throw error;
  }
}

async function mutateLocal<T>(mutator: (state: DatabaseState) => T | Promise<T>): Promise<T> {
  let result!: T;
  const operation = writeQueue.then(async () => {
    const state = await readLocal();
    result = await mutator(state);
    await mkdir(dirname(localPath), { recursive: true });
    const temporary = `${localPath}.${randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
    await rename(temporary, localPath);
  });
  writeQueue = operation.catch(() => undefined);
  await operation;
  return result;
}

function connectionString(): string | null {
  return process.env.DATABASE_URL?.trim() || null;
}

function assertLocalAllowed(): void {
  if (!connectionString() && process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL não configurado para o portal de onboarding.');
  }
}

type NeonResult = { fields?: Array<{ name: string }>; rows?: unknown[][]; rowCount?: number };

async function neonQuery<T extends Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T[]> {
  const databaseUrl = connectionString();
  if (!databaseUrl) throw new Error('DATABASE_URL não configurado.');
  const url = new URL(databaseUrl);
  const response = await fetch(`https://${url.hostname}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': databaseUrl,
      'Neon-Raw-Text-Output': 'false',
      'Neon-Array-Mode': 'true',
    },
    body: JSON.stringify({ query, params }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Falha no banco de dados (${response.status}).`);
  const payload = (await response.json()) as NeonResult;
  const names = payload.fields?.map((field) => field.name) ?? [];
  return (payload.rows ?? []).map((row) => Object.fromEntries(names.map((name, index) => [name, row[index]])) as T);
}

function iso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function nullableIso(value: unknown): string | null {
  return value === null || value === undefined ? null : iso(value);
}

function projectFromRow(row: Record<string, unknown>): OnboardingProject {
  return {
    id: String(row.id),
    customerName: String(row.customer_name),
    customerEmail: String(row.customer_email),
    customerPhone: String(row.customer_phone),
    companyName: String(row.company_name),
    projectType: row.project_type as ProjectType,
    status: row.status as OnboardingStatus,
    tokenHash: String(row.token_hash),
    tokenEncrypted: String(row.token_encrypted),
    tokenExpiresAt: iso(row.token_expires_at),
    tokenRevokedAt: nullableIso(row.token_revoked_at),
    progress: Number(row.progress),
    currentStep: Number(row.current_step),
    assignedTo: row.assigned_to === null ? null : String(row.assigned_to),
    sourceOrderId: row.source_order_id === null ? null : String(row.source_order_id),
    sourceOrderItemId: row.source_order_item_id === null ? null : String(row.source_order_item_id),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    submittedAt: nullableIso(row.submitted_at),
    approvedAt: nullableIso(row.approved_at),
    publishedAt: nullableIso(row.published_at),
    schemaVersion: Number(row.schema_version),
  };
}

function assetFromRow(row: Record<string, unknown>): OnboardingAsset {
  return {
    id: String(row.id), projectId: String(row.project_id), slot: String(row.slot), originalName: String(row.original_name),
    storageKey: String(row.storage_key), mimeType: String(row.mime_type), size: Number(row.size),
    width: row.width === null ? null : Number(row.width), height: row.height === null ? null : Number(row.height),
    altText: String(row.alt_text ?? ''), caption: String(row.caption ?? ''), sortOrder: Number(row.sort_order),
    consentConfirmed: Boolean(row.consent_confirmed), createdAt: iso(row.created_at),
  };
}

function reviewFromRow(row: Record<string, unknown>): OnboardingReview {
  return {
    id: String(row.id), projectId: String(row.project_id), section: String(row.section),
    field: row.field === null ? null : String(row.field), message: String(row.message),
    status: row.status as 'OPEN' | 'RESOLVED', author: String(row.author), createdAt: iso(row.created_at),
    resolvedAt: nullableIso(row.resolved_at),
  };
}

function eventFromRow(row: Record<string, unknown>): OnboardingEvent {
  const metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) as Record<string, JsonValue> : row.metadata as Record<string, JsonValue>;
  return { id: String(row.id), projectId: String(row.project_id), type: String(row.type), actor: String(row.actor), metadata, createdAt: iso(row.created_at) };
}

export async function createProjectRecord(
  input: CreateOnboardingInput,
  token: { hash: string; encrypted: string; expiresAt: string },
): Promise<OnboardingProject> {
  const now = new Date().toISOString();
  const project: OnboardingProject = {
    id: randomUUID(), customerName: input.customerName, customerEmail: input.customerEmail,
    customerPhone: input.customerPhone, companyName: input.companyName, projectType: input.projectType,
    status: 'WAITING_FOR_CUSTOMER', tokenHash: token.hash, tokenEncrypted: token.encrypted,
    tokenExpiresAt: token.expiresAt, tokenRevokedAt: null, progress: 0, currentStep: 0,
    assignedTo: input.assignedTo ?? null, sourceOrderId: input.sourceOrderId ?? null,
    sourceOrderItemId: input.sourceOrderItemId ?? null, createdAt: now, updatedAt: now,
    submittedAt: null, approvedAt: null, publishedAt: null, schemaVersion: 1,
  };
  if (!connectionString()) {
    assertLocalAllowed();
    return mutateLocal((state) => {
      if (project.sourceOrderItemId && state.projects.some((entry) => entry.sourceOrderItemId === project.sourceOrderItemId)) {
        throw new Error('Já existe onboarding para este item do pedido.');
      }
      state.projects.push(project);
      state.answers[project.id] = {};
      return project;
    });
  }
  const rows = await neonQuery<Record<string, unknown>>(
    `INSERT INTO onboarding_projects (
      id, customer_name, customer_email, customer_phone, company_name, project_type, status,
      token_hash, token_encrypted, token_expires_at, assigned_to, source_order_id, source_order_item_id, schema_version
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,1) RETURNING *`,
    [project.id, project.customerName, project.customerEmail, project.customerPhone, project.companyName, project.projectType,
      project.status, project.tokenHash, project.tokenEncrypted, project.tokenExpiresAt, project.assignedTo,
      project.sourceOrderId, project.sourceOrderItemId],
  );
  const row = rows[0];
  if (!row) throw new Error('Falha ao criar onboarding.');
  return projectFromRow(row);
}

export async function findProjectBySourceItem(sourceOrderItemId: string): Promise<OnboardingProject | null> {
  if (!connectionString()) {
    assertLocalAllowed();
    return (await readLocal()).projects.find((project) => project.sourceOrderItemId === sourceOrderItemId) ?? null;
  }
  const rows = await neonQuery<Record<string, unknown>>('SELECT * FROM onboarding_projects WHERE source_order_item_id = $1 LIMIT 1', [sourceOrderItemId]);
  return rows[0] ? projectFromRow(rows[0]) : null;
}

export async function findProjectByTokenHash(tokenHash: string): Promise<OnboardingProject | null> {
  if (!connectionString()) {
    assertLocalAllowed();
    return (await readLocal()).projects.find((project) => project.tokenHash === tokenHash) ?? null;
  }
  const rows = await neonQuery<Record<string, unknown>>('SELECT * FROM onboarding_projects WHERE token_hash = $1 LIMIT 1', [tokenHash]);
  return rows[0] ? projectFromRow(rows[0]) : null;
}

export async function getProjectBundle(projectId: string): Promise<OnboardingBundle | null> {
  if (!connectionString()) {
    assertLocalAllowed();
    const state = await readLocal();
    const project = state.projects.find((entry) => entry.id === projectId);
    if (!project) return null;
    return {
      project, answers: state.answers[projectId] ?? {},
      assets: state.assets.filter((entry) => entry.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder),
      reviews: state.reviews.filter((entry) => entry.projectId === projectId),
      events: state.events.filter((entry) => entry.projectId === projectId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  }
  const projects = await neonQuery<Record<string, unknown>>('SELECT * FROM onboarding_projects WHERE id = $1 LIMIT 1', [projectId]);
  if (!projects[0]) return null;
  const [answerRows, assetRows, reviewRows, eventRows] = await Promise.all([
    neonQuery<Record<string, unknown>>('SELECT section, field, value FROM onboarding_answers WHERE project_id = $1', [projectId]),
    neonQuery<Record<string, unknown>>('SELECT * FROM onboarding_assets WHERE project_id = $1 ORDER BY slot, sort_order', [projectId]),
    neonQuery<Record<string, unknown>>('SELECT * FROM onboarding_reviews WHERE project_id = $1 ORDER BY created_at DESC', [projectId]),
    neonQuery<Record<string, unknown>>('SELECT * FROM onboarding_events WHERE project_id = $1 ORDER BY created_at DESC', [projectId]),
  ]);
  const answers = Object.fromEntries(answerRows.map((row) => [`${String(row.section)}.${String(row.field)}`, (typeof row.value === 'string' ? JSON.parse(row.value) : row.value) as JsonValue]));
  return { project: projectFromRow(projects[0]), answers, assets: assetRows.map(assetFromRow), reviews: reviewRows.map(reviewFromRow), events: eventRows.map(eventFromRow) };
}

export async function listProjects(filters: ProjectFilters = {}): Promise<OnboardingProject[]> {
  if (!connectionString()) {
    assertLocalAllowed();
    const query = filters.query?.toLowerCase();
    return (await readLocal()).projects
      .filter((project) => !filters.status || project.status === filters.status)
      .filter((project) => !filters.projectType || project.projectType === filters.projectType)
      .filter((project) => !filters.assignedTo || project.assignedTo === filters.assignedTo)
      .filter((project) => !query || [project.customerName, project.customerEmail, project.companyName].some((value) => value.toLowerCase().includes(query)))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  const rows = await neonQuery<Record<string, unknown>>(
    `SELECT * FROM onboarding_projects
     WHERE ($1::text IS NULL OR status = $1)
       AND ($2::text IS NULL OR project_type = $2)
       AND ($3::text IS NULL OR assigned_to = $3)
       AND ($4::text IS NULL OR customer_name ILIKE '%' || $4 || '%' OR customer_email ILIKE '%' || $4 || '%' OR company_name ILIKE '%' || $4 || '%')
     ORDER BY updated_at DESC`,
    [filters.status ?? null, filters.projectType ?? null, filters.assignedTo ?? null, filters.query ?? null],
  );
  return rows.map(projectFromRow);
}

export async function saveProjectAnswers(projectId: string, patch: AnswerMap, progress: number, currentStep: number): Promise<void> {
  const now = new Date().toISOString();
  if (!connectionString()) {
    assertLocalAllowed();
    await mutateLocal((state) => {
      const project = state.projects.find((entry) => entry.id === projectId);
      if (!project) throw new Error('Onboarding não encontrado.');
      state.answers[projectId] = { ...(state.answers[projectId] ?? {}), ...patch };
      project.progress = progress;
      project.currentStep = currentStep;
      project.updatedAt = now;
      if (project.status === 'WAITING_FOR_CUSTOMER') project.status = 'IN_PROGRESS';
    });
    return;
  }
  for (const [key, value] of Object.entries(patch)) {
    const [section, ...fieldParts] = key.split('.');
    if (!section || fieldParts.length === 0) continue;
    await neonQuery(
      `INSERT INTO onboarding_answers (id, project_id, section, field, value)
       VALUES ($1,$2,$3,$4,$5::jsonb)
       ON CONFLICT (project_id, section, field) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [randomUUID(), projectId, section, fieldParts.join('.'), JSON.stringify(value)],
    );
  }
  await neonQuery(
    `UPDATE onboarding_projects SET progress=$2, current_step=$3, updated_at=now(),
      status=CASE WHEN status = 'WAITING_FOR_CUSTOMER' THEN 'IN_PROGRESS' ELSE status END
     WHERE id=$1`, [projectId, progress, currentStep],
  );
}

export async function updateProjectStatus(projectId: string, status: OnboardingStatus): Promise<OnboardingProject> {
  const now = new Date().toISOString();
  if (!connectionString()) {
    assertLocalAllowed();
    return mutateLocal((state) => {
      const project = state.projects.find((entry) => entry.id === projectId);
      if (!project) throw new Error('Onboarding não encontrado.');
      project.status = status;
      project.updatedAt = now;
      if (status === 'SUBMITTED') project.submittedAt = now;
      if (status === 'APPROVED') project.approvedAt = now;
      if (status === 'PUBLISHED') project.publishedAt = now;
      return project;
    });
  }
  const rows = await neonQuery<Record<string, unknown>>(
    `UPDATE onboarding_projects SET status=$2, updated_at=now(),
       submitted_at=CASE WHEN $2='SUBMITTED' THEN now() ELSE submitted_at END,
       approved_at=CASE WHEN $2='APPROVED' THEN now() ELSE approved_at END,
       published_at=CASE WHEN $2='PUBLISHED' THEN now() ELSE published_at END
     WHERE id=$1 RETURNING *`, [projectId, status],
  );
  if (!rows[0]) throw new Error('Onboarding não encontrado.');
  return projectFromRow(rows[0]);
}

export async function replaceProjectToken(projectId: string, token: { hash: string; encrypted: string; expiresAt: string }): Promise<OnboardingProject> {
  if (!connectionString()) {
    assertLocalAllowed();
    return mutateLocal((state) => {
      const project = state.projects.find((entry) => entry.id === projectId);
      if (!project) throw new Error('Onboarding não encontrado.');
      project.tokenHash = token.hash; project.tokenEncrypted = token.encrypted; project.tokenExpiresAt = token.expiresAt;
      project.tokenRevokedAt = null; project.updatedAt = new Date().toISOString();
      return project;
    });
  }
  const rows = await neonQuery<Record<string, unknown>>(
    `UPDATE onboarding_projects SET token_hash=$2, token_encrypted=$3, token_expires_at=$4, token_revoked_at=NULL, updated_at=now()
     WHERE id=$1 RETURNING *`, [projectId, token.hash, token.encrypted, token.expiresAt],
  );
  if (!rows[0]) throw new Error('Onboarding não encontrado.');
  return projectFromRow(rows[0]);
}

export async function addAssetRecord(asset: OnboardingAsset): Promise<void> {
  if (!connectionString()) {
    assertLocalAllowed();
    await mutateLocal((state) => { state.assets.push(asset); });
    return;
  }
  await neonQuery(
    `INSERT INTO onboarding_assets (id,project_id,slot,original_name,storage_key,mime_type,size,width,height,alt_text,caption,sort_order,consent_confirmed,created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [asset.id, asset.projectId, asset.slot, asset.originalName, asset.storageKey, asset.mimeType, asset.size, asset.width,
      asset.height, asset.altText, asset.caption, asset.sortOrder, asset.consentConfirmed, asset.createdAt],
  );
}

export async function updateAssetRecord(projectId: string, assetId: string, patch: Pick<OnboardingAsset, 'altText' | 'caption' | 'sortOrder' | 'consentConfirmed'>): Promise<void> {
  if (!connectionString()) {
    assertLocalAllowed();
    await mutateLocal((state) => {
      const asset = state.assets.find((entry) => entry.id === assetId && entry.projectId === projectId);
      if (!asset) throw new Error('Arquivo não encontrado.');
      Object.assign(asset, patch);
    });
    return;
  }
  await neonQuery('UPDATE onboarding_assets SET alt_text=$3,caption=$4,sort_order=$5,consent_confirmed=$6 WHERE id=$2 AND project_id=$1',
    [projectId, assetId, patch.altText, patch.caption, patch.sortOrder, patch.consentConfirmed]);
}

export async function deleteAssetRecord(projectId: string, assetId: string): Promise<OnboardingAsset | null> {
  if (!connectionString()) {
    assertLocalAllowed();
    return mutateLocal((state) => {
      const index = state.assets.findIndex((entry) => entry.id === assetId && entry.projectId === projectId);
      if (index < 0) return null;
      return state.assets.splice(index, 1)[0] ?? null;
    });
  }
  const rows = await neonQuery<Record<string, unknown>>('DELETE FROM onboarding_assets WHERE id=$2 AND project_id=$1 RETURNING *', [projectId, assetId]);
  return rows[0] ? assetFromRow(rows[0]) : null;
}

export async function addReviewRecord(review: OnboardingReview): Promise<void> {
  if (!connectionString()) {
    assertLocalAllowed();
    await mutateLocal((state) => { state.reviews.push(review); });
    return;
  }
  await neonQuery(
    'INSERT INTO onboarding_reviews (id,project_id,section,field,message,status,author,created_at,resolved_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [review.id, review.projectId, review.section, review.field, review.message, review.status, review.author, review.createdAt, review.resolvedAt],
  );
}

export async function resolveReviewRecord(projectId: string, reviewId: string): Promise<void> {
  if (!connectionString()) {
    assertLocalAllowed();
    await mutateLocal((state) => {
      const review = state.reviews.find((entry) => entry.id === reviewId && entry.projectId === projectId);
      if (!review) throw new Error('Comentário não encontrado.');
      review.status = 'RESOLVED'; review.resolvedAt = new Date().toISOString();
    });
    return;
  }
  await neonQuery("UPDATE onboarding_reviews SET status='RESOLVED',resolved_at=now() WHERE id=$2 AND project_id=$1", [projectId, reviewId]);
}

export async function addEventRecord(event: OnboardingEvent): Promise<void> {
  if (!connectionString()) {
    assertLocalAllowed();
    await mutateLocal((state) => { state.events.push(event); });
    return;
  }
  await neonQuery('INSERT INTO onboarding_events (id,project_id,type,actor,metadata,created_at) VALUES ($1,$2,$3,$4,$5::jsonb,$6)',
    [event.id, event.projectId, event.type, event.actor, JSON.stringify(event.metadata), event.createdAt]);
}
