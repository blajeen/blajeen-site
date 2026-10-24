import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErroConexaoSocial } from '@/lib/social/oauth-feedback';
const mocks = vi.hoisted(() => ({ concluir: vi.fn() }));
vi.mock('@/lib/social/oauth', () => ({ concluirOAuth: mocks.concluir, provedor: (p: string) => p }));
import { GET } from './route';

beforeEach(() => { vi.resetAllMocks(); });
describe('retorno da autorização social', () => {
  const contexto = { params: Promise.resolve({ provedor: 'meta' }) };
  const requisicao = () => new Request('https://blajeen.com.br/api/admin/social/oauth/meta/callback?code=codigo-privado&state=estado-privado');
  it('estabelece documento local antes de voltar ao painel, sem alterar a sessão Strict', async () => {
    mocks.concluir.mockResolvedValue(undefined);
    const r = await GET(requisicao(), contexto); const html = await r.text();
    expect(r.status).toBe(200);
    expect(r.headers.get('location')).toBeNull();
    expect(r.headers.get('set-cookie')).toBeNull();
    expect(r.headers.get('cache-control')).toBe('no-store');
    expect(r.headers.get('referrer-policy')).toBe('no-referrer');
    expect(html).toContain('window.location.replace("/admin/redes-sociais?conexao=ok")');
    const nonce = html.match(/<script nonce="([^"]+)"/)?.[1];
    expect(nonce).toBeTruthy();
    expect(r.headers.get('content-security-policy')).toContain(`script-src 'nonce-${nonce}'`);
    expect(html).not.toContain('codigo-privado'); expect(html).not.toContain('estado-privado');
  });
  it.each(['expirada', 'sem-pagina'] as const)('informa somente o motivo controlado %s', async (motivo) => {
    mocks.concluir.mockRejectedValue(new ErroConexaoSocial(motivo));
    const r = await GET(requisicao(), contexto);
    expect(await r.text()).toContain(`conexao=${motivo}`);
  });
  it('não expõe erros externos nem valores recebidos na URL', async () => {
    mocks.concluir.mockRejectedValue(new Error('token-secreto <script>alert(1)</script>'));
    const html = await (await GET(requisicao(), contexto)).text();
    expect(html).toContain('conexao=erro'); expect(html).not.toContain('token-secreto');
  });
  it('identifica cancelamento sem tentar trocar um código por token', async () => {
    const r = await GET(new Request('https://blajeen.com.br/api/admin/social/oauth/meta/callback?error=access_denied&error_description=segredo'), contexto);
    const html = await r.text();
    expect(html).toContain('conexao=cancelada'); expect(html).not.toContain('segredo');
    expect(mocks.concluir).not.toHaveBeenCalled();
  });
});
