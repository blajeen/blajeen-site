import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { prioridadeSitemap, rotaAtiva, ROTAS, ROTAS_DE_LOJA, TODAS_AS_ROTAS } from './routes';

describe('rotaAtiva', () => {
  it('marca a rota atual', () => {
    expect(rotaAtiva('/about', '/about')).toBe(true);
  });

  it('ignora barra final', () => {
    expect(rotaAtiva('/about/', '/about')).toBe(true);
    expect(rotaAtiva('/about', '/about/')).toBe(true);
  });

  it('não confunde a home com outras rotas', () => {
    expect(rotaAtiva('/', '/about')).toBe(false);
    expect(rotaAtiva('/projects/revalio', '/')).toBe(false);
  });

  it('não marca rota por prefixo', () => {
    expect(rotaAtiva('/revalio/privacy', '/revalio')).toBe(false);
  });
});

describe('rotas públicas', () => {
  it('cobre as rotas exigidas pelo plano mestre, mais Novidades e o terceiro projeto', () => {
    // 16 do plano original + `/novidades` (18/08/2026) + as 5 do Gramelio (19/08/2026).
    expect(TODAS_AS_ROTAS).toHaveLength(27);
    expect(TODAS_AS_ROTAS).toContain('/projects');
    expect(TODAS_AS_ROTAS).toContain('/projects/barbearia');
    expect(TODAS_AS_ROTAS).toContain('/projects/personal-studio');
    expect(TODAS_AS_ROTAS).toContain('/projects/salao-estetica');
    expect(TODAS_AS_ROTAS).toContain('/projects/ecommerce');
    expect(TODAS_AS_ROTAS).toContain('/novidades');
    expect(TODAS_AS_ROTAS).toContain('/projects/gramelio');
  });

  it('tem um arquivo de página para cada rota', () => {
    const faltando = TODAS_AS_ROTAS.filter((rota) => {
      const relativo = rota === '/' ? '' : rota;
      return !existsSync(path.join(process.cwd(), 'src', 'app', relativo, 'page.tsx'));
    });
    expect(faltando).toEqual([]);
  });

  it('mantém as URLs exigidas pelas lojas estáveis', () => {
    // Estas strings vão para App Store Connect e Google Play Console: mudar quebra a distribuição.
    expect(ROTAS_DE_LOJA).toEqual([
      '/privacy',
      '/terms',
      '/support',
      '/revalio/privacy',
      '/revalio/terms',
      '/revalio/support',
      '/revalio/delete-account',
      '/docalio/privacy',
      '/docalio/terms',
      '/docalio/support',
      '/docalio/delete-account',
      '/gramelio/privacy',
      '/gramelio/terms',
      '/gramelio/support',
      '/gramelio/delete-account',
    ]);
  });

  it('dá prioridade máxima à home e alta aos produtos', () => {
    expect(prioridadeSitemap(ROTAS.home)).toBe(1);
    expect(prioridadeSitemap(ROTAS.projetoRevalio)).toBe(0.9);
    expect(prioridadeSitemap(ROTAS.projetoGramelio)).toBe(0.9);
    expect(prioridadeSitemap(ROTAS.barbearia)).toBe(0.9);
    expect(prioridadeSitemap(ROTAS.salaoEstetica)).toBe(0.9);
    expect(prioridadeSitemap(ROTAS.ecommerce)).toBe(0.9);
    expect(prioridadeSitemap(ROTAS.revalioExclusao)).toBe(0.5);
  });
});
