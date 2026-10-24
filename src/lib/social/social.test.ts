import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { validarArquivo, validarPublicacao } from './validation';
import { cifrar, decifrar } from './crypto';
import { assinaturaValida, urlDaMidia } from './media';
import { urlDeUpload } from './publish';
import type { ArquivoSocial, ContaSocial } from './types';

const conta: ContaSocial = { id: 'instagram:123', rede: 'instagram', nome: 'Teste', disponivel: true, motivo: null };
describe('validação de publicação comum', () => {
  it('recusa extensões falsas, tamanho inválido e arquivos fora dos limites', () => {
    expect(() => validarArquivo('video.mp4', 'image/jpeg', 100)).toThrow();
    expect(() => validarArquivo('x.jpg', 'image/jpeg', 6 * 1024 * 1024)).toThrow();
    expect(() => validarArquivo('x.mp4', 'video/mp4', 0)).toThrow();
    expect(validarArquivo('Foto.PNG', 'image/png', 100)).toBe('image');
  });
  it('bloqueia YouTube para imagens, contas não autorizadas e conta duplicada', () => {
    const input = { id: randomUUID(), arquivoId: randomUUID(), legenda: 'Olá', contas: ['youtube:1'] };
    expect(() => validarPublicacao(input, 'image', [{ ...conta, id: 'youtube:1', rede: 'youtube' }])).toThrow('YouTube');
    expect(() => validarPublicacao({ ...input, contas: ['invasor'] }, 'video', [conta])).toThrow('reconectada');
    expect(() => validarPublicacao({ ...input, contas: [conta.id, conta.id] }, 'video', [conta])).toThrow();
  });
  it('mantém a legenda sem cortar para caber no X', () => {
    const input = { id: randomUUID(), arquivoId: randomUUID(), legenda: 'a'.repeat(281), contas: ['twitter:1'] };
    expect(() => validarPublicacao(input, 'video', [{ ...conta, id: 'twitter:1', rede: 'twitter' }])).toThrow('280');
    expect(validarPublicacao({ ...input, contas: [conta.id] }, 'video', [conta]).legenda).toHaveLength(281);
  });
});

describe('credenciais e destinos de mídia', () => {
  beforeEach(() => { vi.stubEnv('SOCIAL_TOKEN_SECRET', 'segredo-exclusivo-para-teste-de-criptografia'); vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://blajeen.example'); });
  afterEach(() => vi.unstubAllEnvs());
  it('cifra com autenticação e recusa adulteração', () => {
    const token = cifrar('token-privado'); expect(token).not.toContain('token-privado'); expect(decifrar(token)).toBe('token-privado');
    const partes = token.split('.'); partes[1] = Buffer.alloc(16).toString('base64url'); expect(() => decifrar(partes.join('.'))).toThrow();
  });
  it('assina URLs temporárias e recusa assinatura, arquivo ou prazo trocados', () => {
    const id = randomUUID(); const url = new URL(urlDaMidia(id)); const exp = url.searchParams.get('exp')!; const sig = url.searchParams.get('sig')!;
    expect(assinaturaValida(id, exp, sig)).toBe(true);
    expect(assinaturaValida(randomUUID(), exp, sig)).toBe(false);
    expect(assinaturaValida(id, String(Date.now() - 10), sig)).toBe(false);
  });
  it('não envia credenciais para URL retornada com host inesperado', () => {
    expect(() => urlDeUpload('https://www.googleapis.com.evil.test/upload', 'www.googleapis.com')).toThrow();
    expect(() => urlDeUpload('http://www.googleapis.com/upload', 'www.googleapis.com')).toThrow();
    expect(() => urlDeUpload('https://user:pass@www.googleapis.com/upload', 'www.googleapis.com')).toThrow();
  });
});

describe('outbox e autorizações de uso único', () => {
  let pasta: string;
  beforeEach(async () => {
    pasta = await mkdtemp(resolve(tmpdir(), 'blajeen-social-'));
    vi.spyOn(process, 'cwd').mockReturnValue(pasta); vi.stubEnv('DATABASE_URL', ''); vi.resetModules();
  });
  afterEach(async () => {
    vi.restoreAllMocks(); vi.unstubAllEnvs();
    if (!resolve(pasta).startsWith(resolve(tmpdir(), 'blajeen-social-'))) throw new Error('Diretório de teste inválido.');
    await rm(pasta, { recursive: true, force: true });
  });
  it('registra uma vez, reserva atomicamente e nunca reenvia estado incerto', async () => {
    const repo = await import('./repository'); const id = randomUUID();
    const arquivo: ArquivoSocial = { id: randomUUID(), pathname: 'social/test.jpg', url: 'https://example.test/test.jpg', nome: 'test.jpg', mime: 'image/jpeg', tipo: 'image', tamanho: 100, criadoEm: new Date().toISOString() };
    await repo.salvarArquivo(arquivo);
    await Promise.all([repo.criarPublicacao(id, arquivo, 'Legenda', [conta]), repo.criarPublicacao(id, arquivo, 'Legenda', [conta])]);
    const historico = await repo.historico(); expect(historico).toHaveLength(1); expect(historico[0]!.envios).toHaveLength(1);
    await expect(repo.criarPublicacao(id, arquivo, 'Outra legenda', [conta])).rejects.toThrow('identificador');
    const envio = historico[0]!.envios[0]!;
    const reservas = await Promise.all([repo.reservarEnvio(envio.id), repo.reservarEnvio(envio.id)]);
    expect(reservas.filter(Boolean)).toHaveLength(1);
    await repo.atualizarEnvio(envio.id, { estado: 'incerto', remotoId: null, erro: 'Interrupção' });
    expect(await repo.reservarEnvio(envio.id)).toBeNull();
  });
  it('não consome estado com nonce incorreto e impede repetição/expiração', async () => {
    const repo = await import('./repository');
    await repo.guardarOAuth({ id: 'state', provedor: 'youtube', nonceHash: 'nonce', verificador: 'encrypted', sessao: 'encrypted', expiraEm: Date.now() + 60_000 });
    expect(await repo.consumirOAuth('state', 'invasor')).toBeUndefined();
    expect(await repo.consumirOAuth('state', 'nonce')).toBeDefined();
    expect(await repo.consumirOAuth('state', 'nonce')).toBeUndefined();
    await repo.guardarOAuth({ id: 'expired', provedor: 'youtube', nonceHash: 'nonce', verificador: 'encrypted', sessao: 'encrypted', expiraEm: Date.now() - 1 });
    expect(await repo.consumirOAuth('expired', 'nonce')).toBeUndefined();
  });
});
