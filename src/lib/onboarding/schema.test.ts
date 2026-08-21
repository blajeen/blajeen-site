import { describe, expect, it } from 'vitest';
import { getOnboardingSchema } from './schema';
import { calculateProgress } from './progress';

describe('schemas de onboarding', () => {
  it.each([
    ['ECOMMERCE', 'E-commerce'],
    ['BARBERSHOP', 'Barbearia'],
    ['PERSONAL_TRAINER', 'Personal'],
    ['BEAUTY_STUDIO', 'Studio Beauty'],
  ] as const)('seleciona o formulário correto para %s', (type, title) => {
    expect(getOnboardingSchema(type).title).toBe(title);
    expect(getOnboardingSchema(type).sections).toHaveLength(4);
  });

  it('mantém todos os briefings curtos e focados', () => {
    for (const type of ['ECOMMERCE', 'BARBERSHOP', 'PERSONAL_TRAINER', 'BEAUTY_STUDIO'] as const) {
      const fields = getOnboardingSchema(type).sections.flatMap((section) => section.fields);
      expect(fields.length).toBeLessThanOrEqual(30);
      expect(fields.filter((field) => field.required).length).toBeLessThanOrEqual(13);
    }
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
