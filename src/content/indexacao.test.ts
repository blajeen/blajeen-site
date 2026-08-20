import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * O portão de indexação.
 *
 * Enquanto houver bloqueador humano aberto, os textos jurídicos são versões de trabalho. Deixar
 * um buscador indexá-los criaria resultado permanente para política e termos não aprovados —
 * possivelmente sob uma URL temporária de revisão. Estes testes impedem que isso volte por
 * descuido de configuração.
 *
 * `SITE_INDEXAVEL` é avaliado na carga do módulo, então cada caso reimporta com o ambiente limpo.
 */
async function carregarSite() {
  vi.resetModules();
  return import('./site');
}

const DOMINIO = 'https://www.blajeen-labs.com.br';

describe('portão de indexação', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('usa o domínio definitivo do estúdio por padrão', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');

    const { SITE_URL, SITE_URL_DEFINIDO } = await carregarSite();
    expect(SITE_URL).toBe(DOMINIO);
    expect(SITE_URL_DEFINIDO).toBe(true);
  });

  it('não se oferece à indexação enquanto a publicação não for liberada', async () => {
    vi.stubEnv('SITE_PUBLICACAO', '');

    const { SITE_INDEXAVEL } = await carregarSite();
    expect(SITE_INDEXAVEL).toBe(false);
  });

  it('trata variável em branco como ausente', async () => {
    // Um campo vazio no painel de deploy não pode virar base de URL vazia.
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '   ');
    vi.stubEnv('SITE_PUBLICACAO', '  ');

    const { SITE_URL, SITE_INDEXAVEL } = await carregarSite();
    expect(SITE_URL).toBe(DOMINIO);
    expect(SITE_INDEXAVEL).toBe(false);
  });

  it('só libera indexação quando a publicação é liberada explicitamente', async () => {
    vi.stubEnv('SITE_PUBLICACAO', '1');

    const { SITE_INDEXAVEL, SITE_URL } = await carregarSite();
    expect(SITE_INDEXAVEL).toBe(true);
    expect(SITE_URL).toBe(DOMINIO);
  });

  it('permite sobrescrever o domínio para ambientes de teste', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://revisao.exemplo.test');

    const { SITE_URL } = await carregarSite();
    expect(SITE_URL).toBe('https://revisao.exemplo.test');
  });

  it('monta URLs absolutas das rotas de loja sobre o domínio definitivo', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');

    const { urlAbsoluta } = await carregarSite();
    expect(urlAbsoluta('/revalio/delete-account')).toBe(`${DOMINIO}/revalio/delete-account`);
    expect(urlAbsoluta('/sitemap.xml')).toBe(`${DOMINIO}/sitemap.xml`);
  });
});
