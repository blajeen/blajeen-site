import { comprimentoDaParede, direcaoDaParede, PLANTA, type Abertura, type Parede } from './planta';

/**
 * As paredes da maquete, cortadas em volta das aberturas: um bloco cheio entre duas aberturas, um
 * abaixo do peitoril e um acima da verga. A maquete corta tudo a 2,20 m para se ver dentro; o que
 * passar disso some. Puro: a cena 3D só transforma os blocos em caixas.
 */

/** Um bloco de parede: o trecho ao longo do eixo (metros a partir de `de`) e a faixa de altura. */
export type Bloco = { de: number; ate: number; base: number; topo: number };

/** Menor pedaço que vale a pena desenhar: 1 mm. */
const MINIMO = 0.001;

type Vao = Pick<Abertura, 'centro' | 'largura' | 'peitoril' | 'altura'>;

/**
 * Corta uma parede de `comprimento` metros, com as aberturas dadas, na altura `alturaDoCorte`.
 * Devolve os blocos em ordem ao longo da parede. Aberturas que passam do comprimento são aparadas.
 */
export function cortarParede(comprimento: number, aberturas: readonly Vao[], alturaDoCorte: number): Bloco[] {
  const blocos: Bloco[] = [];
  const empurrar = (de: number, ate: number, base: number, topo: number) => {
    const topoCortado = Math.min(topo, alturaDoCorte);
    if (ate - de > MINIMO && topoCortado - base > MINIMO) blocos.push({ de, ate, base, topo: topoCortado });
  };
  const ordenadas = [...aberturas].sort((a, b) => a.centro - b.centro);
  let cursor = 0;
  for (const a of ordenadas) {
    const inicio = Math.max(cursor, a.centro - a.largura / 2);
    const fim = Math.min(comprimento, a.centro + a.largura / 2);
    if (fim <= inicio) continue;
    empurrar(cursor, inicio, 0, alturaDoCorte);
    empurrar(inicio, fim, 0, a.peitoril);
    empurrar(inicio, fim, a.peitoril + a.altura, alturaDoCorte);
    cursor = fim;
  }
  empurrar(cursor, comprimento, 0, alturaDoCorte);
  return blocos;
}

/** Um bloco já posto na planta: caixa com centro, giro e medidas, pronta para virar geometria. */
export type BlocoNaPlanta = {
  parede: string;
  /** Centro da caixa: x e y do desenho (y vira z no 3D) e a altura do meio. */
  centro: readonly [number, number, number];
  comprimento: number;
  espessura: number;
  altura: number;
  /** Base da caixa, para a maquete esconder vergas quando as paredes baixam. */
  base: number;
  /** Ângulo do eixo da parede no desenho, em radianos (0 = para a direita). */
  angulo: number;
  /** O topo é o corte da maquete (pinta-se de aço) e não o peitoril de uma janela. */
  cortada: boolean;
  externa: boolean;
};

export function blocosDaParede(p: Parede, aberturas: readonly Abertura[], alturaDoCorte: number): BlocoNaPlanta[] {
  const [dx, dy] = direcaoDaParede(p);
  const angulo = Math.atan2(dy, dx);
  const nela = aberturas.filter((a) => a.parede === p.id);
  return cortarParede(comprimentoDaParede(p), nela, alturaDoCorte).map((b) => {
    const meio = (b.de + b.ate) / 2;
    return {
      parede: p.id,
      centro: [p.de[0] + dx * meio, p.de[1] + dy * meio, (b.base + b.topo) / 2],
      comprimento: b.ate - b.de,
      espessura: p.espessura,
      altura: b.topo - b.base,
      base: b.base,
      angulo,
      cortada: Math.abs(b.topo - alturaDoCorte) < MINIMO,
      externa: p.externa,
    };
  });
}

/** Todas as paredes da planta, cortadas na altura da maquete. */
export function blocosDaPlanta(alturaDoCorte: number = PLANTA.alturaDoCorte): BlocoNaPlanta[] {
  return PLANTA.paredes.flatMap((p) => blocosDaParede(p, PLANTA.aberturas, alturaDoCorte));
}
