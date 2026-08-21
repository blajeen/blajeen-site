import { PROJECT_TYPES, type AnswerMap, type JsonValue, type OnboardingAsset, type OnboardingField, type OnboardingSchema, type ProjectType } from './types';
import { isFieldVisible } from './schema';

export type ValidationIssue = { field: string; message: string };

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function allEqual(value: string): boolean {
  return /^([0-9])\1+$/.test(value);
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || allEqual(cpf)) return false;
  for (let digit = 9; digit < 11; digit += 1) {
    let sum = 0;
    for (let index = 0; index < digit; index += 1) sum += Number(cpf[index]) * (digit + 1 - index);
    const check = ((sum * 10) % 11) % 10;
    if (check !== Number(cpf[digit])) return false;
  }
  return true;
}

export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || allEqual(cnpj)) return false;
  const calculate = (length: number) => {
    const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((total, weight, index) => total + Number(cnpj[index]) * weight, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calculate(12) === Number(cnpj[12]) && calculate(13) === Number(cnpj[13]);
}

export function isValidCpfCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  return digits.length === 11 ? isValidCpf(digits) : isValidCnpj(digits);
}

export function isValidPhone(value: string): boolean {
  const phone = onlyDigits(value);
  return phone.length === 10 || phone.length === 11;
}

export function isValidDomain(value: string): boolean {
  const domain = value.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0] ?? '';
  return domain.length <= 253 && /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain);
}

export function isProjectType(value: unknown): value is ProjectType {
  return typeof value === 'string' && PROJECT_TYPES.includes(value as ProjectType);
}

export function hasValue(value: unknown, field?: OnboardingField): boolean {
  if (value === true) return true;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.length >= (field?.minItems ?? 1);
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return false;
}

export function validateValue(field: OnboardingField, value: unknown): string | null {
  if (!hasValue(value, field)) return field.required ? 'Este campo é obrigatório.' : null;
  if (typeof value !== 'string') return null;
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Informe um e-mail válido.';
  if (field.type === 'tel' && !isValidPhone(value)) return 'Informe um telefone com DDD.';
  if (field.type === 'cpfCnpj' && !isValidCpfCnpj(value)) return 'Informe um CPF ou CNPJ válido.';
  if (field.type === 'cep' && onlyDigits(value).length !== 8) return 'Informe um CEP válido.';
  if (field.type === 'domain' && !isValidDomain(value)) return 'Informe um domínio válido, como exemplo.com.br.';
  if (field.type === 'url') {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) return 'Use um endereço iniciado por http:// ou https://.';
    } catch {
      return 'Informe um endereço completo e válido.';
    }
  }
  if (field.type === 'color' && !/^#[0-9a-f]{6}$/i.test(value)) return 'Escolha uma cor válida.';
  return null;
}

export function validateAnswers(schema: OnboardingSchema, answers: AnswerMap, assets: readonly Pick<OnboardingAsset, 'slot'>[] = []): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const section of schema.sections) {
    for (const field of section.fields) {
      const key = `${section.key}.${field.key}`;
      if (!isFieldVisible(field, answers)) continue;
      if (field.type === 'file' || field.type === 'files') {
        const count = assets.filter((asset) => asset.slot === key).length;
        if (field.required && count < (field.minItems ?? 1)) issues.push({ field: key, message: 'Este arquivo é obrigatório.' });
        continue;
      }
      const message = validateValue(field, answers[key]);
      if (message) issues.push({ field: key, message });
    }
  }
  return issues;
}

export function sanitizeAnswer(value: unknown): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.slice(0, 100).map(sanitizeAnswer);
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 100).map(([key, entry]) => [key.slice(0, 100), sanitizeAnswer(entry)]));
  }
  return null;
}
