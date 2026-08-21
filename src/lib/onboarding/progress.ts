import { isFieldVisible } from './schema';
import { hasValue } from './validation';
import type { AnswerMap, OnboardingAsset, OnboardingSchema } from './types';

export type ProgressResult = { progress: number; completed: number; total: number; pending: string[] };

export function calculateProgress(schema: OnboardingSchema, answers: AnswerMap, assets: readonly Pick<OnboardingAsset, 'slot'>[] = []): ProgressResult {
  const required = schema.sections.flatMap((section) =>
    section.fields
      .filter((field) => field.required && isFieldVisible(field, answers))
      .map((field) => ({ key: `${section.key}.${field.key}`, label: field.label, field })),
  );
  const filled = ({ key, field }: (typeof required)[number]) =>
    field.type === 'file' || field.type === 'files'
      ? assets.filter((asset) => asset.slot === key).length >= (field.minItems ?? 1)
      : hasValue(answers[key], field);
  const completed = required.filter(filled).length;
  const total = required.length;
  return {
    progress: total === 0 ? 100 : Math.round((completed / total) * 100),
    completed,
    total,
    pending: required.filter((entry) => !filled(entry)).map(({ label }) => label),
  };
}
