/**
 * Rotas públicas.
 *
 * Esta lista é a fonte de verdade do sitemap, do rodapé, da gaveta de navegação e do teste de
 * cobertura de rotas. Uma rota nova só existe depois de entrar aqui.
 */
export const ROTAS = {
  home: '/',
  projetos: '/projects',
  barbearia: '/projects/barbearia',
  personalStudio: '/projects/personal-studio',
  salaoEstetica: '/projects/salao-estetica',
  ecommerce: '/projects/ecommerce',
  projetoRevalio: '/projects/revalio',
  projetoDocalio: '/projects/docalio',
  projetoGramelio: '/projects/gramelio',
  novidades: '/novidades',
  sobre: '/about',
  contato: '/contact',
  privacidade: '/privacy',
  termos: '/terms',
  suporte: '/support',
  revalioPrivacidade: '/revalio/privacy',
  revalioTermos: '/revalio/terms',
  revalioSuporte: '/revalio/support',
  revalioExclusao: '/revalio/delete-account',
  docalioPrivacidade: '/docalio/privacy',
  docalioTermos: '/docalio/terms',
  docalioSuporte: '/docalio/support',
  docalioExclusao: '/docalio/delete-account',
  gramelioPrivacidade: '/gramelio/privacy',
  gramelioTermos: '/gramelio/terms',
  gramelioSuporte: '/gramelio/support',
  gramelioExclusao: '/gramelio/delete-account',
} as const;

export type RotaId = keyof typeof ROTAS;
export type Rota = (typeof ROTAS)[RotaId];

export const TODAS_AS_ROTAS: readonly Rota[] = Object.values(ROTAS);

/** Rotas exigidas pelas lojas: precisam responder em HTTPS, sem login e sem JavaScript. */
export const ROTAS_DE_LOJA: readonly Rota[] = [
  ROTAS.privacidade,
  ROTAS.termos,
  ROTAS.suporte,
  ROTAS.revalioPrivacidade,
  ROTAS.revalioTermos,
  ROTAS.revalioSuporte,
  ROTAS.revalioExclusao,
  ROTAS.docalioPrivacidade,
  ROTAS.docalioTermos,
  ROTAS.docalioSuporte,
  ROTAS.docalioExclusao,
  ROTAS.gramelioPrivacidade,
  ROTAS.gramelioTermos,
  ROTAS.gramelioSuporte,
  ROTAS.gramelioExclusao,
];

/** Prioridade de sitemap por rota. Home e produtos primeiro; jurídico estável e indexável. */
export function prioridadeSitemap(rota: Rota): number {
  if (rota === ROTAS.home) return 1;
  if (
    rota === ROTAS.projetoRevalio ||
    rota === ROTAS.projetoDocalio ||
    rota === ROTAS.projetoGramelio ||
    rota === ROTAS.barbearia ||
    rota === ROTAS.personalStudio ||
    rota === ROTAS.salaoEstetica ||
    rota === ROTAS.ecommerce
  )
    return 0.9;
  if (rota === ROTAS.novidades) return 0.8;
  if (rota === ROTAS.sobre || rota === ROTAS.contato || rota === ROTAS.suporte) return 0.7;
  return 0.5;
}

/** A rota atual, para `aria-current="page"`, ignorando barra final e query. */
export function rotaAtiva(pathname: string, href: string): boolean {
  const normalizar = (valor: string) => (valor !== '/' && valor.endsWith('/') ? valor.slice(0, -1) : valor);
  return normalizar(pathname) === normalizar(href);
}
