import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('next/headers', () => ({ cookies: vi.fn() }));
vi.mock('./repository', () => ({ consumirOAuth: vi.fn(), contasPrivadas: vi.fn(), guardarOAuth: vi.fn(), salvarConta: vi.fn() }));
import { codigoErro, formTikTok, paginasMeta } from './oauth';

const resposta = (corpo: unknown) => new Response(JSON.stringify(corpo), { status: 200, headers: { 'content-type': 'application/json' } });
describe('Páginas autorizadas na Meta', () => {
  beforeEach(() => vi.stubEnv('SOCIAL_META_API_VERSION', 'v26.0'));
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('usa /me/accounts quando a Meta lista a Página diretamente', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(resposta({ data: [{ id: '1', name: 'Blajeen Lab', access_token: 'tp' }] }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await paginasMeta('tu', 'app', 'segredo')).toEqual([{ id: '1', name: 'Blajeen Lab', access_token: 'tp' }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('busca pelos escopos granulares a Página acessada só pelo portfólio empresarial', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(resposta({ data: [] }))
      .mockResolvedValueOnce(resposta({ data: { granular_scopes: [{ scope: 'pages_show_list', target_ids: ['1339357169265966'] }, { scope: 'pages_manage_posts', target_ids: ['1339357169265966'] }, { scope: 'instagram_basic', target_ids: ['17841436097423068'] }] } }))
      .mockResolvedValueOnce(resposta({ id: '1339357169265966', name: 'Blajeen Lab', access_token: 'tp', instagram_business_account: { id: '17841436097423068', username: 'blajeenlab' } }));
    vi.stubGlobal('fetch', fetchMock);
    const paginas = await paginasMeta('tu', 'app', 'segredo');
    expect(paginas).toHaveLength(1);
    expect(paginas[0]?.instagram_business_account?.username).toBe('blajeenlab');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    for (const [url] of fetchMock.mock.calls) expect(String(url)).not.toContain('segredo');
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain('/v26.0/1339357169265966?');
  });

  it('retorna vazio quando nenhuma Página foi autorizada', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(resposta({ data: [] })).mockResolvedValueOnce(resposta({ data: { granular_scopes: [] } })));
    expect(await paginasMeta('tu', 'app', 'segredo')).toEqual([]);
  });

  it('registra só o código curto do erro da rede, sem descrições livres', () => {
    expect(codigoErro({ error: 'invalid_grant', error_description: 'segredo' })).toBe('invalid_grant');
    expect(codigoErro({ error: { code: 190, message: 'token expirado' } })).toBe('190');
    expect(codigoErro({ error: { code: 'access_token_invalid' } })).toBe('access_token_invalid');
    expect(codigoErro({ error: 'texto com espaços e <script>' })).toBe('');
    expect(codigoErro(null)).toBe('');
  });

  it('envia ao TikTok o Content-Type exato, sem charset', () => {
    const init = formTikTok({ code: 'a*b!c', redirect_uri: 'https://blajeen.com.br/x' });
    expect(new Headers(init.headers).get('content-type')).toBe('application/x-www-form-urlencoded');
    expect(typeof init.body).toBe('string');
    expect(new URLSearchParams(init.body as string).get('code')).toBe('a*b!c');
  });
});
