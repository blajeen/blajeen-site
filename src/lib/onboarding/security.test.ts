import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAdminSession, createCustomerToken, decryptCustomerToken, encryptCustomerToken, hashCustomerToken, verifyAdminPassword, verifyAdminSession } from './security';

describe('segurança do onboarding', () => {
  beforeEach(() => {
    process.env.ONBOARDING_SESSION_SECRET = 'segredo-de-teste-com-tamanho-suficiente-123';
    process.env.ONBOARDING_ADMIN_PASSWORD = 'senha-de-teste';
  });
  afterEach(() => {
    delete process.env.ONBOARDING_SESSION_SECRET;
    delete process.env.ONBOARDING_ADMIN_PASSWORD;
  });

  it('gera token imprevisível, armazena hash e permite cópia administrativa criptografada', () => {
    const token = createCustomerToken();
    expect(token.length).toBeGreaterThan(40);
    expect(hashCustomerToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(decryptCustomerToken(encryptCustomerToken(token))).toBe(token);
  });

  it('autentica administrador e rejeita sessão adulterada', () => {
    expect(verifyAdminPassword('senha-de-teste')).toBe(true);
    expect(verifyAdminPassword('errada')).toBe(false);
    const session = createAdminSession();
    expect(verifyAdminSession(session)).toBe(true);
    expect(verifyAdminSession(`${session}x`)).toBe(false);
  });
});

