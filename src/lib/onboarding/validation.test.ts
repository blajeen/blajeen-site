import { describe, expect, it } from 'vitest';
import { getOnboardingSchema } from './schema';
import { isValidCnpj, isValidCpf, isValidDomain, isValidPhone, validateAnswers } from './validation';

describe('validação do onboarding', () => {
  it('valida CPF e CNPJ por dígitos verificadores', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCnpj('04.252.011/0001-10')).toBe(true);
    expect(isValidCnpj('00.000.000/0000-00')).toBe(false);
  });

  it('valida telefone e domínio', () => {
    expect(isValidPhone('(11) 99999-9999')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
    expect(isValidDomain('blajeen.com.br')).toBe(true);
    expect(isValidDomain('http://sem-ponto')).toBe(false);
  });

  it('rejeita campos obrigatórios ausentes', () => {
    const issues = validateAnswers(getOnboardingSchema('BARBERSHOP'), {});
    expect(issues.length).toBeGreaterThan(10);
    expect(issues.every((issue) => issue.message.includes('obrigatório'))).toBe(true);
  });
});

