import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
function chave() {
  const segredo = process.env.SOCIAL_TOKEN_SECRET;
  if (!segredo || segredo.length < 32) throw new Error('Configure SOCIAL_TOKEN_SECRET com pelo menos 32 caracteres no servidor.');
  return createHash('sha256').update(segredo).digest();
}
export function cifrar(texto: string): string {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', chave(), iv);
  const bytes = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), bytes].map((b) => b.toString('base64url')).join('.');
}
export function decifrar(texto: string): string {
  const [iv, tag, bytes] = texto.split('.').map((x) => Buffer.from(x, 'base64url'));
  if (!iv || !tag || !bytes) throw new Error('Credencial inválida. Reconecte a conta.');
  const cipher = createDecipheriv('aes-256-gcm', chave(), iv); cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(bytes), cipher.final()]).toString('utf8');
}
export function hash(texto: string): string { return createHash('sha256').update(texto).digest('hex'); }
