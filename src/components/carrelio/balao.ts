import type { PontoNoPalco } from './PalcoCarro';

/**
 * Onde o balão de um ponto aberto cabe no palco: em cima do ponto, embaixo ou, sem espaço nos dois
 * (o balão com foto e abas é alto), de lado, centrado no ponto e preso entre o alto do palco e a
 * barra do pé. Sem DOM: o laço de quadros chama a cada projeção, para todos os pontos.
 */

export type PosicaoDoBalao = {
  /** Na horizontal: perto da borda, o balão abre para dentro; de lado, para o lado com espaço. */
  lado: 'inicio' | 'meio' | 'fim';
  vertical: 'acima' | 'abaixo' | 'lado';
  /** De lado: quanto o balão desce (ou sobe, negativo) para não sair do palco, em px. */
  ajuste: number;
};

/** A distância do centro do ponto à borda do balão (o `1.75rem` do CSS). */
const DISTANCIA = 28;
const MARGEM = 10;
/** A largura útil da foto no balão: os 16rem dele, menos o recuo dos lados. */
const LARGURA_DA_FOTO = 232;

/** A altura do balão aberto, em px, sem medir: o texto, a foto e a fileira de abas. */
export function alturaDoBalao(ponto: PontoNoPalco): number {
  const texto = 62;
  if (!ponto.detalhe) return texto;
  const abas = ponto.detalhe.fotos.length > 1 ? 46 : 0;
  return texto + abas + (LARGURA_DA_FOTO * ponto.detalhe.altura) / ponto.detalhe.largura + 8;
}

/**
 * A posição do balão de um ponto em `(x, y)`, num palco de `largura` × `altura`, com `base` px
 * cobertos embaixo (a barra do pé e, por dentro, a fileira de cores).
 */
export function posicaoDoBalao(
  ponto: { x: number; y: number },
  palco: { largura: number; altura: number; base: number },
  alturaDoBalaoAberto: number,
): PosicaoDoBalao {
  const { x, y } = ponto;
  const limiteDeBaixo = palco.altura - palco.base - MARGEM;
  const lado = !palco.largura ? 'meio' : x < palco.largura * 0.3 ? 'inicio' : x > palco.largura * 0.7 ? 'fim' : 'meio';
  if (y - DISTANCIA - alturaDoBalaoAberto >= MARGEM) return { lado, vertical: 'acima', ajuste: 0 };
  if (y + DISTANCIA + alturaDoBalaoAberto <= limiteDeBaixo) return { lado, vertical: 'abaixo', ajuste: 0 };
  const topo = y - alturaDoBalaoAberto / 2;
  const ajuste = topo < MARGEM ? MARGEM - topo : topo + alturaDoBalaoAberto > limiteDeBaixo ? limiteDeBaixo - (topo + alturaDoBalaoAberto) : 0;
  return { lado: x > palco.largura / 2 ? 'fim' : 'inicio', vertical: 'lado', ajuste: Math.round(ajuste) };
}
