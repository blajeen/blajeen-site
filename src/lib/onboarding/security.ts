import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const ADMIN_COOKIE = 'blajeen_admin_session';

function secret(): string {
  const value = process.env.ONBOARDING_SESSION_SECRET;
  if (!value) {
    if (process.env.NODE_ENV === 'production') throw new Error('ONBOARDING_SESSION_SECRET não configurado.');
    return 'blajeen-development-only-session-secret-change-me';
  }
  return value;
}

function safeCompare(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createCustomerToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashCustomerToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function encryptCustomerToken(token: string): string {
  const key = createHash('sha256').update(secret()).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.');
}

export function decryptCustomerToken(payload: string): string {
  const [ivText, tagText, dataText] = payload.split('.');
  if (!ivText || !tagText || !dataText) throw new Error('Token criptografado inválido.');
  const key = createHash('sha256').update(secret()).digest();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataText, 'base64url')), decipher.final()]).toString('utf8');
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ONBOARDING_ADMIN_PASSWORD;
  return Boolean(expected) && safeCompare(createHash('sha256').update(password).digest('hex'), createHash('sha256').update(expected ?? '').digest('hex'));
}

export function createAdminSession(): string {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyAdminSession(value: string | undefined): boolean {
  if (!value) return false;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return false;
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
  if (!safeCompare(signature, expected)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { role?: string; exp?: number };
    return parsed.role === 'admin' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export const adminCookie = {
  name: ADMIN_COOKIE,
  options: { httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 8 * 60 * 60 },
};
