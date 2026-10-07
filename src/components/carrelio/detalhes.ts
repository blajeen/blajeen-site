/**
 * As fotos de detalhe dos pontos de toque: aparecem no balão do ponto, por fora (no 3D) e por dentro
 * (na foto do interior). São fotos de divulgação da marca, trazidas pelo titular em 07/10/2026, e
 * `tools/carrelio-interior.mjs` as grava em `public/produtos/carrelio/detalhes/`.
 *
 * A chave é o id do ponto no catálogo (`JAECOO_5.pontos`).
 */

const PASTA = '/produtos/carrelio/detalhes';

/** Uma foto do ponto. O rótulo só aparece com mais de uma foto: é o nome da aba. */
export type FotoDoPonto = { src: string; rotulo?: string };

export type DetalheDoPonto = {
  largura: number;
  altura: number;
  /**
   * Uma foto, ou mais de uma em abas, do mesmo tamanho; a primeira abre selecionada. O porta-malas
   * abre vazio, e a segunda aba é ele cheio (pedido do titular, 07/10/2026).
   */
  fotos: readonly FotoDoPonto[];
};

export const DETALHES_DO_JAECOO_5: Readonly<Record<string, DetalheDoPonto>> = {
  multimidia: { largura: 640, altura: 360, fotos: [{ src: `${PASTA}/multimidia.webp` }] },
  teto: { largura: 960, altura: 540, fotos: [{ src: `${PASTA}/teto.webp` }] },
  cambio: { largura: 960, altura: 540, fotos: [{ src: `${PASTA}/cambio.webp` }] },
  portaMalas: {
    largura: 960,
    altura: 640,
    fotos: [
      { src: `${PASTA}/porta-malas-vazio.webp`, rotulo: 'Vazio' },
      { src: `${PASTA}/porta-malas-cheio.webp`, rotulo: 'Cheio' },
    ],
  },
};
