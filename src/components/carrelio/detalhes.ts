/**
 * As fotos de detalhe dos pontos de toque: aparecem no balão do ponto, por fora (no 3D) e por dentro
 * (na foto do interior). São fotos de divulgação da marca, trazidas pelo titular em 07/10/2026, e
 * `tools/carrelio-interior.mjs` as grava em `public/produtos/carrelio/detalhes/`.
 *
 * A chave é o id do ponto no catálogo (`JAECOO_5.pontos`).
 */

const PASTA = '/produtos/carrelio/detalhes';

export type DetalheDoPonto = {
  src: string;
  largura: number;
  altura: number;
  /** Um selo sobre a foto (quando ela se alterna com outra, diz qual é qual). */
  legenda?: string;
  /** Uma segunda foto, do mesmo tamanho, que se alterna com a primeira (só com movimento). */
  alternativa?: { src: string; legenda: string };
};

export const DETALHES_DO_JAECOO_5: Readonly<Record<string, DetalheDoPonto>> = {
  multimidia: { src: `${PASTA}/multimidia.webp`, largura: 640, altura: 360 },
  teto: { src: `${PASTA}/teto.webp`, largura: 960, altura: 540 },
  cambio: { src: `${PASTA}/cambio.webp`, largura: 960, altura: 540 },
  portaMalas: {
    src: `${PASTA}/porta-malas-cheio.webp`,
    largura: 960,
    altura: 640,
    legenda: 'Cheio',
    alternativa: { src: `${PASTA}/porta-malas-vazio.webp`, legenda: 'Vazio' },
  },
};
