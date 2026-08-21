import type { AnswerMap, JsonValue, OnboardingAsset, OnboardingBundle, ProjectType } from './types';

export type ConfigurationPackage = {
  schemaVersion: 1;
  projectType: ProjectType;
  generatedAt: string;
  customer: Record<string, JsonValue>;
  business: Record<string, JsonValue>;
  brand: Record<string, JsonValue>;
  content: Record<string, JsonValue>;
  contacts: Record<string, JsonValue>;
  assets: Array<Pick<OnboardingAsset, 'slot' | 'originalName' | 'storageKey' | 'mimeType' | 'altText' | 'caption' | 'sortOrder'>>;
  specific: Record<string, JsonValue>;
};

function valuesByPrefix(answers: AnswerMap, prefixes: readonly string[]): Record<string, JsonValue> {
  return Object.fromEntries(Object.entries(answers).filter(([key]) => prefixes.some((prefix) => key.startsWith(`${prefix}.`))));
}

const specificSections: Record<ProjectType, readonly string[]> = {
  ECOMMERCE: ['imagensLoja', 'catalogo', 'comercial', 'institucional'],
  BARBERSHOP: ['fotosBarbearia', 'conteudoBarbearia', 'unidadesBarbearia', 'servicosBarbearia', 'barbeiros', 'agendaBarbearia', 'clubeAvaliacoes'],
  PERSONAL_TRAINER: ['modeloPersonal', 'identidadePersonal', 'conteudoPersonal', 'profissionaisPersonal', 'ofertaPersonal', 'operacaoPersonal'],
  BEAUTY_STUDIO: ['fotosEstetica', 'conteudoEstetica', 'modulosEstetica', 'unidadesEstetica', 'profissionaisEstetica', 'catalogoEstetica', 'extrasEstetica', 'politicasEstetica'],
};

export function exportConfiguration(bundle: OnboardingBundle, generatedAt = new Date().toISOString()): ConfigurationPackage {
  const { project, answers, assets } = bundle;
  return {
    schemaVersion: 1,
    projectType: project.projectType,
    generatedAt,
    customer: {
      name: project.customerName,
      email: project.customerEmail,
      phone: project.customerPhone,
    },
    business: valuesByPrefix(answers, ['responsavel', 'dominio']),
    brand: valuesByPrefix(answers, ['marca']),
    content: valuesByPrefix(answers, ['conteudoBarbearia', 'conteudoPersonal', 'conteudoEstetica', 'institucional']),
    contacts: valuesByPrefix(answers, ['contatos']),
    assets: assets
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ slot, originalName, storageKey, mimeType, altText, caption, sortOrder }) => ({ slot, originalName, storageKey, mimeType, altText, caption, sortOrder })),
    specific: valuesByPrefix(answers, specificSections[project.projectType]),
  };
}

