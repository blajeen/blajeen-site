import { describe, expect, it } from 'vitest';
import { getOnboardingSchema, isFieldVisible } from './schema';
import { calculateProgress } from './progress';

describe('schemas de onboarding', () => {
  it.each([
    ['ECOMMERCE', 'E-commerce'],
    ['BARBERSHOP', 'Barbearia'],
    ['PERSONAL_TRAINER', 'Personal Trainer / Studio'],
    ['BEAUTY_STUDIO', 'Estética / Beauty Studio'],
  ] as const)('seleciona o formulário correto para %s', (type, title) => {
    expect(getOnboardingSchema(type).title).toBe(title);
    expect(getOnboardingSchema(type).sections.length).toBeGreaterThan(5);
  });

  it('aplica perguntas condicionais do personal autônomo', () => {
    const schema = getOnboardingSchema('PERSONAL_TRAINER');
    const field = schema.sections.find((section) => section.key === 'modeloPersonal')?.fields.find((entry) => entry.key === 'habilitarRecursosStudio');
    expect(field).toBeDefined();
    expect(isFieldVisible(field!, { 'modeloPersonal.modelo': 'Personal autônomo' })).toBe(true);
    expect(isFieldVisible(field!, { 'modeloPersonal.modelo': 'Studio com equipe' })).toBe(false);
  });

  it('calcula progresso e pendências somente sobre campos obrigatórios visíveis', () => {
    const schema = getOnboardingSchema('ECOMMERCE');
    const empty = calculateProgress(schema, {});
    expect(empty.total).toBeGreaterThan(10);
    expect(empty.progress).toBe(0);
    const firstRequired = schema.sections.flatMap((section) => section.fields.map((field) => ({ section, field }))).find(({ field }) => field.required)!;
    const answer = { [`${firstRequired.section.key}.${firstRequired.field.key}`]: 'Preenchido' };
    const partial = calculateProgress(schema, answer);
    expect(partial.completed).toBe(1);
    expect(partial.progress).toBeGreaterThan(0);
  });
});

