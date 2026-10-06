import {
  comprimentoDaParede,
  direcaoDaParede,
  formatarMedida,
  ladosDaAbertura,
  norteDaUnidade,
  parede,
  PLANTA,
  pontoNaParede,
  type Abertura,
  type Ponto,
} from '@/lib/torrelio/planta';

/**
 * O desenho da planta técnica, puro: orientação (espelhada e girada em passos de 90°), a caixa do
 * desenho e a geometria das portas. A planta em SVG e os rótulos por cima dela usam as mesmas
 * contas, então o rótulo nunca sai do cômodo, girando ou espelhando.
 */

export type Giro = 0 | 90 | 180 | 270;
export type Orientacao = { espelhada: boolean; giro: Giro };

/** Centro do contorno (com a varanda): o desenho gira e espelha em volta dele. */
const CENTRO: Ponto = [3.9, 2.65];
/** Caixa do desenho, com as cotas e a folga dos rótulos delas. */
const CAIXA: readonly Ponto[] = [
  [-2.85, -2.85],
  [9.65, -2.85],
  [9.65, 7.1],
  [-2.85, 7.1],
];

/** Matriz afim do desenho (a, b, c, d, e, f), como no `matrix()` do SVG. */
export function matrizDoDesenho({ espelhada, giro }: Orientacao): readonly [number, number, number, number, number, number] {
  const s = espelhada ? -1 : 1;
  const rad = (giro * Math.PI) / 180;
  const cos = Math.round(Math.cos(rad));
  const sen = Math.round(Math.sin(rad));
  const a = s * cos;
  const b = s * sen;
  const c = -sen;
  const d = cos;
  const [cx, cy] = CENTRO;
  return [a, b, c, d, cx - a * cx - c * cy, cy - b * cx - d * cy];
}

export function transformar([x, y]: Ponto, o: Orientacao): Ponto {
  const [a, b, c, d, e, f] = matrizDoDesenho(o);
  return [a * x + c * y + e, b * x + d * y + f];
}

/** A caixa do desenho já orientada: x, y, largura e altura, em metros. */
export function caixaDoDesenho(o: Orientacao): { x: number; y: number; largura: number; altura: number } {
  const pontos = CAIXA.map((p) => transformar(p, o));
  const xs = pontos.map((p) => p[0]);
  const ys = pontos.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, largura: Math.max(...xs) - x, altura: Math.max(...ys) - y };
}

/** Onde um ponto da planta cai na caixa do desenho, em porcentagem (para os rótulos em HTML). */
export function emPorcentagem(p: Ponto, o: Orientacao): { esquerda: number; topo: number } {
  const caixa = caixaDoDesenho(o);
  const [x, y] = transformar(p, o);
  return { esquerda: ((x - caixa.x) / caixa.largura) * 100, topo: ((y - caixa.y) / caixa.altura) * 100 };
}

/** Para onde aponta o norte no desenho orientado, em graus no sentido horário a partir do alto. */
export function norteNoDesenho(o: Orientacao): number {
  return (norteDaUnidade(o.espelhada) + o.giro) % 360;
}

/** A folha de uma porta de giro: dobradiça, ponta fechada e ponta aberta, na face do lado para onde abre. */
export type FolhaDaPorta = { dobradica: Ponto; fechada: Ponto; aberta: Ponto; raio: number; horario: boolean };

export function folhaDaPorta(a: Abertura): FolhaDaPorta | null {
  if (!a.abre) return null;
  const p = parede(a.parede);
  const [dx, dy] = direcaoDaParede(p);
  const [esquerda] = ladosDaAbertura(a);
  const sinal = esquerda === a.abre.para ? 1 : -1;
  const n: Ponto = [-dy * sinal, dx * sinal];
  const face = p.espessura / 2;
  const noEixo = (s: number): Ponto => {
    const [x, y] = pontoNaParede(p, s);
    return [x + n[0] * face, y + n[1] * face];
  };
  const inicio = a.centro - a.largura / 2;
  const fim = a.centro + a.largura / 2;
  const dobradica = noEixo(a.abre.dobradica === 'de' ? inicio : fim);
  const fechada = noEixo(a.abre.dobradica === 'de' ? fim : inicio);
  const aberta: Ponto = [dobradica[0] + n[0] * a.largura, dobradica[1] + n[1] * a.largura];
  const v1: Ponto = [fechada[0] - dobradica[0], fechada[1] - dobradica[1]];
  const v2: Ponto = [aberta[0] - dobradica[0], aberta[1] - dobradica[1]];
  // Com y para baixo, produto vetorial positivo é giro no sentido horário da tela.
  return { dobradica, fechada, aberta, raio: a.largura, horario: v1[0] * v2[1] - v1[1] * v2[0] > 0 };
}

/** Os dois pontos de um trecho do eixo da parede, deslocados `afastamento` metros para o lado esquerdo. */
export function trechoNaParede(a: Pick<Abertura, 'parede'>, de: number, ate: number, afastamento = 0): readonly [Ponto, Ponto] {
  const p = parede(a.parede);
  const [dx, dy] = direcaoDaParede(p);
  const deslocar = ([x, y]: Ponto): Ponto => [x - dy * afastamento, y + dx * afastamento];
  return [deslocar(pontoNaParede(p, de)), deslocar(pontoNaParede(p, Math.min(ate, comprimentoDaParede(p))))];
}

/** As cotas externas já com a linha, os traços de chamada e o ponto do texto. */
export type CotaDesenhada = { de: Ponto; ate: Ponto; texto: string; meio: Ponto; vertical: boolean };

const AFASTAMENTO_DA_COTA = { 1: 0.6, 2: 1.2 } as const;

export function cotasDesenhadas(): readonly CotaDesenhada[] {
  const borda = { norte: -1.2, oeste: -1.2 };
  return PLANTA.cotas.map((c) => {
    const linha = borda[c.lado] - AFASTAMENTO_DA_COTA[c.nivel];
    const de: Ponto = c.lado === 'norte' ? [c.de, linha] : [linha, c.de];
    const ate: Ponto = c.lado === 'norte' ? [c.ate, linha] : [linha, c.ate];
    const meio: Ponto = c.lado === 'norte' ? [(c.de + c.ate) / 2, linha - 0.28] : [linha - 0.28, (c.de + c.ate) / 2];
    return { de, ate, meio, vertical: c.lado === 'oeste', texto: formatarMedida(c.ate - c.de) };
  });
}
