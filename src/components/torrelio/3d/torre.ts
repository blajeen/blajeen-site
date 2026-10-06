import { Color, DoubleSide, Group, Mesh, type BufferGeometry, type Float32BufferAttribute, type Material, type Texture } from 'three';
import { VARANDA, VAOS_DE_VARANDA } from '@/lib/torrelio/entorno';
import { cota, indiceDoVao, PAVIMENTOS, TORRE } from '@/lib/torrelio/predio';
import type { Fachada } from '@/lib/torrelio/tipos';
import { Construtor, type Rgb } from './malha';
import { materialComBrilho, padrao, texturaDeMadeira, texturaDePedra, type Comuns } from './materiais';

/**
 * A arquitetura do Residencial Vértice (fictício), toda procedural:
 *
 * - embasamento de 32 × 26 × 7,5 m em pedra cinza-quente: térreo de pé-direito duplo com o lobby de
 *   vidro recuado 1,5 m atrás de pilotis, faixa de pedra no alto, marquise na entrada da avenida e
 *   jardineiras no terraço;
 * - torre de 24 × 16 m: frisos de laje (0,48 m) em concreto off-white, pilares de canto finos,
 *   caixilhos de bronze escuro entre os vãos e, em cada canto, a varanda que envolve 2 vãos da
 *   fachada longa e 1 da lateral, com laje de 1,6 m, guarda-corpo de vidro de 1,1 m e forro de
 *   madeira que acende quente quando a unidade está acesa;
 * - coberturas duplex no 20º e 21º e, no topo, rooftop com piscina, deque, pergolado e o coroamento
 *   de aletas, banhado de luz à noite.
 *
 * Uma malha por material, em ordem de pavimento (1 = térreo, 2 a 21, 22 = cobertura e rooftop), para
 * o modo obra recortar com `setDrawRange`.
 */

/** Camadas da cena: o entorno sempre; a torre some na vista da varanda, que mostra só a laje própria. */
export const CAMADA = { entorno: 0, torre: 1, vista: 2 } as const;

const MEIA_LARGURA = TORRE.largura / 2;
const MEIA_PROFUNDIDADE = TORRE.profundidade / 2;
const B = VARANDA.profundidade;
/** Quanto o friso da laje sai do plano do vidro. */
const FRISO = 0.22;
const VIGA = 0.38;
const PISO = 0.1;
const TOPO_DO_TERREO = 6.0;
const COBERTURA = 22;
const COTA_DO_TOPO = cota(COBERTURA);
const TOPO_DO_ROOFTOP = COTA_DO_TOPO + 0.5;
const TOPO_DO_COROAMENTO = TOPO_DO_ROOFTOP + 5.2;

/** O contorno da laje de um pavimento: o retângulo da torre com as quatro varandas de canto. */
export const CONTORNO_DA_LAJE: readonly (readonly [number, number])[] = (() => {
  const x = MEIA_LARGURA;
  const z = MEIA_PROFUNDIDADE;
  const fimLongo = TORRE.largura / 2 - 6; // a varanda leva os 2 vãos de 3 m do canto
  const fimLateral = MEIA_PROFUNDIDADE - 4; // e o vão de 4 m da lateral
  return [
    [-x - B, -z - B], [-fimLongo, -z - B], [-fimLongo, -z - FRISO], [fimLongo, -z - FRISO], [fimLongo, -z - B], [x + B, -z - B],
    [x + B, -fimLateral], [x + FRISO, -fimLateral], [x + FRISO, fimLateral], [x + B, fimLateral],
    [x + B, z + B], [fimLongo, z + B], [fimLongo, z + FRISO], [-fimLongo, z + FRISO], [-fimLongo, z + B], [-x - B, z + B],
    [-x - B, fimLateral], [-x - FRISO, fimLateral], [-x - FRISO, -fimLateral], [-x - B, -fimLateral],
  ];
})();

export type Canto = 'NO' | 'NE' | 'SO' | 'SE';
const CANTOS: readonly Canto[] = ['NO', 'NE', 'SO', 'SE'];
const sinais = (canto: Canto) => ({ sx: canto.endsWith('O') ? -1 : 1, sz: canto.startsWith('N') ? -1 : 1 });

/** O vão de referência da varanda: o da fachada longa, no canto. A luz do forro segue o dono dele. */
export function vaoDaVaranda(pavimento: number, canto: Canto): number {
  const { sx, sz } = sinais(canto);
  return indiceDoVao(pavimento, sz < 0 ? 'norte' : 'sul', sx < 0 ? 0 : 7);
}

/** A planta de uma varanda de canto (o L para fora do vidro) e as arestas do guarda-corpo. */
export function plantaDaVaranda(canto: Canto) {
  const { sx, sz } = sinais(canto);
  const fimLongo = MEIA_LARGURA - 6;
  const fimLateral = MEIA_PROFUNDIDADE - 4;
  const ox = sx * (MEIA_LARGURA + B);
  const oz = sz * (MEIA_PROFUNDIDADE + B);
  const piso: [number, number][] = [
    [ox, oz], [sx * fimLongo, oz], [sx * fimLongo, sz * MEIA_PROFUNDIDADE], [sx * MEIA_LARGURA, sz * MEIA_PROFUNDIDADE],
    [sx * MEIA_LARGURA, sz * fimLateral], [ox, sz * fimLateral],
  ];
  const r = 0.06;
  const ix = sx * (MEIA_LARGURA + B - r);
  const iz = sz * (MEIA_PROFUNDIDADE + B - r);
  const arestas: [[number, number], [number, number]][] = [
    [[ix, iz], [sx * (fimLongo + r), iz]],
    [[ix, iz], [ix, sz * (fimLateral + r)]],
    [[sx * (fimLongo + r), iz], [sx * (fimLongo + r), sz * (MEIA_PROFUNDIDADE + FRISO + 0.02)]],
    [[ix, sz * (fimLateral + r)], [sx * (MEIA_LARGURA + FRISO + 0.02), sz * (fimLateral + r)]],
  ];
  return { piso, arestas };
}

export type MateriaisDaTorre = {
  concreto: Material;
  pedra: Material;
  bronze: Material;
  guardaCorpo: Material;
  madeira: Material;
  lobby: Material;
  texturas: Texture[];
};

export function criarMateriaisDaTorre(comuns: Comuns): MateriaisDaTorre {
  const pedraMapa = texturaDePedra();
  const madeiraMapa = texturaDeMadeira();
  return {
    concreto: materialComBrilho(comuns, 'concreto', { color: new Color('#d9d8cf'), roughness: 0.84, metalness: 0 }, {
      atributo: 'aBanho', cor: new Color('#ffd2a0'), forca: 0.42, curva: true, banhoDaBase: true,
    }),
    pedra: padrao(comuns, 'pedra', { color: new Color('#cfc6b8'), map: pedraMapa, roughness: 0.9, metalness: 0 }),
    // Bronze acetinado: sem mapa de ambiente, metal demais vira preto; aqui ele ainda pega o céu.
    bronze: padrao(comuns, 'bronze', { color: new Color('#4b4038'), roughness: 0.5, metalness: 0.28 }),
    guardaCorpo: padrao(comuns, 'guarda', { color: new Color('#a9bcb6'), roughness: 0.08, metalness: 0, transparent: true, opacity: 0.2, depthWrite: false, side: DoubleSide }),
    madeira: materialComBrilho(comuns, 'forro', { color: new Color('#a69a8e'), map: madeiraMapa, roughness: 0.72, metalness: 0 }, {
      atributo: 'aLuzForro', cor: new Color('#ffb070'), forca: 1.35,
    }),
    lobby: materialComBrilho(comuns, 'lobby', { color: new Color('#0f1312'), roughness: 0.12, metalness: 0.1 }, {
      atributo: 'aAceso', cor: new Color('#ffc58a'), forca: 1.25,
    }),
    texturas: [pedraMapa, madeiraMapa],
  };
}

/** Um forro de varanda: os vértices dele na malha da madeira e o vão cuja luz ele segue. */
export type Forro = { vao: number; de: number; ate: number };

/** Uma luz pontual pequena para o desenho aditivo (downlights, pergolado). */
export type Lampada = { x: number; y: number; z: number; tamanho: number; cor: Rgb };

export type Torre = {
  grupo: Group;
  concreto: Mesh;
  pedra: Mesh;
  bronze: Mesh;
  guardaCorpo: Mesh;
  madeira: Mesh;
  lobby: Mesh;
  piscina: Mesh;
  /** Onde termina cada pavimento (índice), por malha: `fim[malha][pavimento]`. */
  fim: Record<'concreto' | 'pedra' | 'bronze' | 'guardaCorpo' | 'madeira', number[]>;
  forros: readonly Forro[];
  luzDoForro: Float32BufferAttribute;
  lampadas: readonly Lampada[];
  /** Recorta a torre para o modo obra (`null` = prédio pronto). */
  recortar(obra: { estruturaAte: number; fachadaAte: number } | null): void;
  descartar(): void;
};

/** Caixa com um atributo em degradê vertical (1 embaixo, `topo` em cima): o banho de luz das aletas. */
function caixaEmDegrade(c: Construtor, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, base: number, topo: number) {
  const valor = (y: number) => (Math.abs(y - y0) < 1e-6 ? base : topo);
  const quad = (a: [number, number, number], b: [number, number, number], cc: [number, number, number], d: [number, number, number], n: [number, number, number]) => {
    const i = c.extra('aBanho', valor(a[1])).vertice(a, n, 0, 0);
    c.extra('aBanho', valor(b[1])).vertice(b, n, 1, 0);
    c.extra('aBanho', valor(cc[1])).vertice(cc, n, 1, 1);
    c.extra('aBanho', valor(d[1])).vertice(d, n, 0, 1);
    c.triangulo(i, i + 1, i + 2);
    c.triangulo(i, i + 2, i + 3);
  };
  quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
  quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]);
  quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]);
  quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
  quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]);
  c.extra('aBanho', 0);
}

/** Painel de vidro vertical entre dois pontos do plano. */
function painel(c: Construtor, a: readonly [number, number], b: readonly [number, number], y0: number, y1: number) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const l = Math.hypot(dx, dz);
  const n: [number, number, number] = [dz / l, 0, -dx / l];
  c.quad([a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]], n);
}

/** Barra ao longo de uma aresta do plano (corrimão, rodapé). */
function barra(c: Construtor, a: readonly [number, number], b: readonly [number, number], y0: number, y1: number, espessura: number) {
  const meia = espessura / 2;
  // Sem a face de baixo: ninguém vê o corrimão por baixo, e são milhares deles.
  c.caixa(Math.min(a[0], b[0]) - meia, y0, Math.min(a[1], b[1]) - meia, Math.max(a[0], b[0]) + meia, y1, Math.max(a[1], b[1]) + meia, 'b');
}

/**
 * O guarda-corpo de uma varanda (vidro + corrimão de bronze) sobre a laje do pavimento. Na vista da
 * própria varanda, a um braço de distância, o corrimão é mais fino para não virar uma barra na tela.
 */
function guardaCorpoDaVaranda(vidro: Construtor, bronze: Construtor, canto: Canto, pavimento: number, corrimao = 0.03) {
  const { arestas } = plantaDaVaranda(canto);
  const piso = cota(pavimento) + PISO;
  for (const [a, b] of arestas) {
    painel(vidro, a, b, piso + 0.02, piso + VARANDA.guardaCorpo - corrimao);
    barra(bronze, a, b, piso + VARANDA.guardaCorpo - corrimao, piso + VARANDA.guardaCorpo, corrimao + 0.01);
  }
}

/** Montantes de bronze entre os vãos de um pavimento (os cantos ficam com o pilar). */
function caixilhos(bronze: Construtor, pavimento: number) {
  const y0 = cota(pavimento) + PISO;
  const y1 = cota(pavimento) + 2.88 - VIGA;
  for (let k = 1; k < 8; k += 1) {
    const x = -MEIA_LARGURA + 3 * k;
    bronze.caixa(x - 0.05, y0, -MEIA_PROFUNDIDADE - 0.2, x + 0.05, y1, -MEIA_PROFUNDIDADE + 0.04, 'bt');
    bronze.caixa(x - 0.05, y0, MEIA_PROFUNDIDADE - 0.04, x + 0.05, y1, MEIA_PROFUNDIDADE + 0.2, 'bt');
  }
  for (let k = 1; k < 4; k += 1) {
    const z = -MEIA_PROFUNDIDADE + 4 * k;
    bronze.caixa(MEIA_LARGURA - 0.04, y0, z - 0.05, MEIA_LARGURA + 0.2, y1, z + 0.05, 'bt');
    bronze.caixa(-MEIA_LARGURA - 0.2, y0, z - 0.05, -MEIA_LARGURA + 0.04, y1, z + 0.05, 'bt');
  }
}

function pilaresDeCanto(concreto: Construtor, de: number, ate: number) {
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      concreto.caixa(sx * MEIA_LARGURA - 0.21, de, sz * MEIA_PROFUNDIDADE - 0.21, sx * MEIA_LARGURA + 0.21, ate, sz * MEIA_PROFUNDIDADE + 0.21, 'bt');
    }
  }
}

function construirEmbasamento(c: { concreto: Construtor; pedra: Construtor; bronze: Construtor; madeira: Construtor; lobby: Construtor }, lampadas: Lampada[]) {
  const { pedra, bronze, concreto, madeira, lobby } = c;
  const X = 16;
  const Z = 13;
  const recuo = 1.5;
  // Faixa de pedra no alto do térreo e a laje do terraço.
  pedra.caixa(-X, TOPO_DO_TERREO, -Z, X, 7.5, -Z + recuo);
  pedra.caixa(-X, TOPO_DO_TERREO, Z - recuo, X, 7.5, Z);
  pedra.caixa(-X, TOPO_DO_TERREO, -Z + recuo, -X + recuo, 7.5, Z - recuo);
  pedra.caixa(X - recuo, TOPO_DO_TERREO, -Z + recuo, X, 7.5, Z - recuo);
  pedra.caixa(-X + recuo, 6.7, -Z + recuo, X - recuo, 7.5, Z - recuo, 'b');
  // Pilotis na frente (vão livre na entrada) e na metade norte da lateral oeste.
  for (const x of [-15.65, -10.4, -5.2, 5.2, 10.4, 15.65]) pedra.bloco(x, -Z + 0.35, 0.7, 0.7, 0, TOPO_DO_TERREO, 't');
  for (const z of [-6.4, -0.4]) pedra.bloco(-X + 0.35, z, 0.7, 0.7, 0, TOPO_DO_TERREO, 't');
  // Paredes cegas de pedra ao sul e a leste, com rasgos estreitos; a oeste, a garagem.
  for (let x = -X; x < X - 0.01; x += 4) {
    pedra.caixa(x, 0, Z - 0.3, Math.min(X, x + 3.4), TOPO_DO_TERREO, Z, 't');
    if (x + 4 < X) bronze.caixa(x + 3.4, 0.4, Z - 0.22, x + 4, TOPO_DO_TERREO - 0.4, Z - 0.12);
  }
  for (let z = -Z; z < Z - 0.01; z += 5.2) {
    pedra.caixa(X - 0.3, 0, z, X, TOPO_DO_TERREO, Math.min(Z, z + 4.6), 't');
    if (z + 5.2 < Z) bronze.caixa(X - 0.22, 0.4, z + 4.6, X - 0.12, TOPO_DO_TERREO - 0.4, z + 5.2);
  }
  pedra.caixa(-X, 0, 0, -X + 0.3, TOPO_DO_TERREO, 4, 't');
  pedra.caixa(-X, 3.4, 4, -X + 0.3, TOPO_DO_TERREO, 9.5);
  pedra.caixa(-X, 0, 9.5, -X + 0.3, TOPO_DO_TERREO, Z, 't');
  bronze.caixa(-X + 0.3, 0, 4, -X + 0.42, 3.4, 9.5);
  // Lobby de vidro recuado, aceso à noite, com montantes e travessa no meio do pé-direito duplo.
  lobby.extra('aAceso', 1);
  lobby.quad([X - recuo, 0, -Z + recuo], [-X + recuo, 0, -Z + recuo], [-X + recuo, TOPO_DO_TERREO, -Z + recuo], [X - recuo, TOPO_DO_TERREO, -Z + recuo], [0, 0, -1]);
  lobby.quad([-X + recuo, 0, -Z + recuo], [-X + recuo, 0, 0], [-X + recuo, TOPO_DO_TERREO, 0], [-X + recuo, TOPO_DO_TERREO, -Z + recuo], [-1, 0, 0]);
  for (let x = -X + recuo; x <= X - recuo + 0.01; x += 1.45) bronze.caixa(x - 0.04, 0, -Z + recuo - 0.1, x + 0.04, TOPO_DO_TERREO, -Z + recuo + 0.02, 'bt');
  for (let z = -Z + recuo; z <= 0.01; z += 1.45) bronze.caixa(-X + recuo - 0.1, 0, z - 0.04, -X + recuo + 0.02, TOPO_DO_TERREO, z + 0.04, 'bt');
  for (const y of [0.04, 3.0, TOPO_DO_TERREO - 0.06]) {
    bronze.caixa(-X + recuo, y - 0.05, -Z + recuo - 0.1, X - recuo, y + 0.05, -Z + recuo + 0.02);
    bronze.caixa(-X + recuo - 0.1, y - 0.05, -Z + recuo, -X + recuo + 0.02, y + 0.05, 0);
  }
  // Marquise na entrada: laje fina com borda de bronze e forro de madeira com spots.
  concreto.caixa(-7, 4.2, -Z - 4.2, 7, 4.48, -Z + recuo, 'b');
  madeira.caixa(-6.9, 4.16, -Z - 4.1, 6.9, 4.2, -Z + recuo, 't');
  bronze.caixa(-7.05, 4.14, -Z - 4.28, 7.05, 4.52, -Z - 4.18);
  for (const x of [-4.5, -1.5, 1.5, 4.5]) {
    for (const z of [-Z - 2.8, -Z - 0.6]) lampadas.push({ x, y: 4.1, z, tamanho: 0.9, cor: [1, 0.78, 0.5] });
  }
  // Jardineiras no terraço do embasamento.
  pedra.caixa(-X + 0.4, 7.5, -Z + 0.1, X - 0.4, 8.35, -Z + 1.1);
  pedra.caixa(-X + 0.4, 7.5, Z - 1.1, X - 0.4, 8.35, Z - 0.1);
  pedra.caixa(-X + 0.1, 7.5, -Z + 1.1, -X + 1.1, 8.35, Z - 1.1);
  pedra.caixa(X - 1.1, 7.5, -Z + 1.1, X - 0.1, 8.35, Z - 1.1);
}

function construirRooftop(c: { concreto: Construtor; pedra: Construtor; bronze: Construtor; madeira: Construtor; guarda: Construtor; piscina: Construtor }, lampadas: Lampada[]) {
  const { concreto, pedra, bronze, madeira, guarda, piscina } = c;
  const y = TOPO_DO_ROOFTOP;
  // Casa de máquinas e caixa d'água, escondidas pelo coroamento.
  concreto.caixa(4.2, y, -7.2, 10.8, y + 3.2, -2.6, 'b');
  // Piscina com borda de pedra, deque de madeira em volta.
  piscina.extra('aCorDaAgua', [0.05, 0.2, 0.21]).extra('aBrilho', 1);
  piscina.quad([-8, y - 0.06, 5.8], [4, y - 0.06, 5.8], [4, y - 0.06, 2.2], [-8, y - 0.06, 2.2], [0, 1, 0]);
  pedra.caixa(-8.3, y, 1.9, 4.3, y + 0.1, 2.2);
  pedra.caixa(-8.3, y, 5.8, 4.3, y + 0.1, 6.1);
  pedra.caixa(-8.3, y, 2.2, -8, y + 0.1, 5.8);
  pedra.caixa(4, y, 2.2, 4.3, y + 0.1, 5.8);
  madeira.caixa(-11.2, y, 0.6, 11.2, y + 0.06, 1.9, 'b');
  madeira.caixa(-11.2, y, 6.1, 11.2, y + 0.06, 7.4, 'b');
  madeira.caixa(-11.2, y, 1.9, -8.3, y + 0.06, 6.1, 'b');
  madeira.caixa(4.3, y, 1.9, 11.2, y + 0.06, 6.1, 'b');
  for (const x of [5.4, 7.0, 8.6, 10.2]) bronze.caixa(x - 0.35, y + 0.06, 2.6, x + 0.35, y + 0.36, 4.6);
  // Pergolado de bronze e réguas de madeira, com luzes quentes por baixo.
  for (const [px, pz] of [[-10.6, -6.9], [-3.6, -6.9], [-10.6, -1.8], [-3.6, -1.8]] as const) bronze.caixa(px - 0.09, y, pz - 0.09, px + 0.09, y + 2.8, pz + 0.09, 'b');
  bronze.caixa(-10.7, y + 2.72, -7, -3.5, y + 2.86, -6.8);
  bronze.caixa(-10.7, y + 2.72, -1.9, -3.5, y + 2.86, -1.7);
  for (let x = -10.5; x <= -3.7; x += 0.42) madeira.caixa(x - 0.05, y + 2.86, -7.1, x + 0.05, y + 3.06, -1.6);
  for (const x of [-9, -7, -5]) lampadas.push({ x, y: y + 2.6, z: -4.4, tamanho: 0.7, cor: [1, 0.74, 0.46] });
  // Guarda-corpo de vidro na borda do terraço.
  const r = 0.35;
  const cantos: [number, number][] = [[-MEIA_LARGURA + r, -MEIA_PROFUNDIDADE + r], [MEIA_LARGURA - r, -MEIA_PROFUNDIDADE + r], [MEIA_LARGURA - r, MEIA_PROFUNDIDADE - r], [-MEIA_LARGURA + r, MEIA_PROFUNDIDADE - r]];
  for (let i = 0; i < 4; i += 1) {
    const a = cantos[i]!;
    const b = cantos[(i + 1) % 4]!;
    painel(guarda, a, b, y + 0.05, y + 1.1);
    barra(bronze, a, b, y + 1.08, y + 1.13, 0.05);
  }
  // Coroamento: aletas verticais em toda a volta, ligadas por uma viga no topo, banhadas de luz de baixo.
  const alto = TOPO_DO_COROAMENTO;
  const aleta = (x: number, z: number, ao: 'x' | 'z') => {
    if (ao === 'x') caixaEmDegrade(concreto, x - 0.07, y, z - 0.38, x + 0.07, alto, z + 0.38, 1, 0);
    else caixaEmDegrade(concreto, x - 0.38, y, z - 0.07, x + 0.38, alto, z + 0.07, 1, 0);
  };
  for (let x = -MEIA_LARGURA + 0.6; x <= MEIA_LARGURA - 0.59; x += 1.2) {
    aleta(x, -MEIA_PROFUNDIDADE - 0.15, 'x');
    aleta(x, MEIA_PROFUNDIDADE + 0.15, 'x');
  }
  for (let z = -MEIA_PROFUNDIDADE + 0.6; z <= MEIA_PROFUNDIDADE - 0.59; z += 1.2) {
    aleta(-MEIA_LARGURA - 0.15, z, 'z');
    aleta(MEIA_LARGURA + 0.15, z, 'z');
  }
  concreto.extra('aBanho', 0.25);
  const e = 0.55;
  concreto.caixa(-MEIA_LARGURA - e, alto - 0.32, -MEIA_PROFUNDIDADE - e, MEIA_LARGURA + e, alto, -MEIA_PROFUNDIDADE + 0.25);
  concreto.caixa(-MEIA_LARGURA - e, alto - 0.32, MEIA_PROFUNDIDADE - 0.25, MEIA_LARGURA + e, alto, MEIA_PROFUNDIDADE + e);
  concreto.caixa(-MEIA_LARGURA - e, alto - 0.32, -MEIA_PROFUNDIDADE + 0.25, -MEIA_LARGURA + 0.25, alto, MEIA_PROFUNDIDADE - 0.25);
  concreto.caixa(MEIA_LARGURA - 0.25, alto - 0.32, -MEIA_PROFUNDIDADE + 0.25, MEIA_LARGURA + e, alto, MEIA_PROFUNDIDADE - 0.25);
  concreto.extra('aBanho', 0);
}

export function construirTorre(materiais: MateriaisDaTorre, agua: Material): Torre {
  const concreto = new Construtor({ extras: { aBanho: 1 } });
  const pedra = new Construtor();
  pedra.escalaUv = 4.8;
  const bronze = new Construtor();
  const guarda = new Construtor();
  const madeira = new Construtor({ extras: { aLuzForro: 3 } });
  madeira.escalaUv = 2;
  const lobby = new Construtor({ extras: { aAceso: 1 } });
  const piscina = new Construtor({ extras: { aCorDaAgua: 3, aBrilho: 1 } });
  const lampadas: Lampada[] = [];
  const forros: Forro[] = [];
  const fim = { concreto: [] as number[], pedra: [] as number[], bronze: [] as number[], guardaCorpo: [] as number[], madeira: [] as number[] };
  const marcar = (pavimento: number) => {
    fim.concreto[pavimento] = concreto.marca();
    fim.pedra[pavimento] = pedra.marca();
    fim.bronze[pavimento] = bronze.marca();
    fim.guardaCorpo[pavimento] = guarda.marca();
    fim.madeira[pavimento] = madeira.marca();
  };
  fim.concreto[0] = fim.pedra[0] = fim.bronze[0] = fim.guardaCorpo[0] = fim.madeira[0] = 0;

  construirEmbasamento({ concreto, pedra, bronze, madeira, lobby }, lampadas);
  marcar(1);

  for (const pavimento of PAVIMENTOS) {
    const laje = cota(pavimento);
    concreto.extrudar(CONTORNO_DA_LAJE, laje - VIGA, laje + PISO);
    if (pavimento > PAVIMENTOS[0]!) pilaresDeCanto(concreto, cota(pavimento - 1) + PISO, laje - VIGA);
    caixilhos(bronze, pavimento);
    for (const canto of CANTOS) {
      guardaCorpoDaVaranda(guarda, bronze, canto, pavimento);
      // O deque de madeira (visto de cima) e o forro (visto de baixo, sob a laje de cima) da
      // varanda deste pavimento seguem a luz da unidade daqui: acesa, a varanda fica quente.
      const de = madeira.totalDeVertices;
      const { piso } = plantaDaVaranda(canto);
      madeira.poligono(piso, laje + PISO + 0.02, true);
      madeira.poligono(piso, cota(pavimento + 1) - VIGA - 0.006, false);
      forros.push({ vao: vaoDaVaranda(pavimento, canto), de, ate: madeira.totalDeVertices });
    }
    marcar(pavimento);
  }

  // Cobertura: a laje do topo (com o teto das varandas do 21º), os pilares do último andar e o rooftop.
  concreto.extrudar(CONTORNO_DA_LAJE, COTA_DO_TOPO - VIGA, TOPO_DO_ROOFTOP);
  pilaresDeCanto(concreto, cota(COBERTURA - 1) + PISO, COTA_DO_TOPO - VIGA);
  construirRooftop({ concreto, pedra, bronze, madeira, guarda, piscina }, lampadas);
  marcar(COBERTURA);

  const malha = (c: Construtor, material: Material, nome: string, sombra: boolean) => {
    const m = new Mesh(c.geometria(), material);
    m.name = nome;
    m.castShadow = sombra;
    m.receiveShadow = true;
    m.layers.set(CAMADA.torre);
    return m;
  };
  const grupo = new Group();
  grupo.name = 'torre';
  const malhas = {
    concreto: malha(concreto, materiais.concreto, 'concreto', true),
    pedra: malha(pedra, materiais.pedra, 'pedra', true),
    bronze: malha(bronze, materiais.bronze, 'bronze', false),
    guardaCorpo: malha(guarda, materiais.guardaCorpo, 'guarda-corpo', false),
    madeira: malha(madeira, materiais.madeira, 'madeira', false),
    lobby: malha(lobby, materiais.lobby, 'lobby', false),
    piscina: malha(piscina, agua, 'piscina', false),
  };
  malhas.guardaCorpo.renderOrder = 1;
  malhas.guardaCorpo.receiveShadow = false;
  for (const m of Object.values(malhas)) grupo.add(m);
  const luzDoForro = malhas.madeira.geometry.getAttribute('aLuzForro') as Float32BufferAttribute;

  return {
    grupo,
    ...malhas,
    fim,
    forros,
    luzDoForro,
    lampadas,
    recortar(obra) {
      const tudo = (m: Mesh) => m.geometry.setDrawRange(0, Number.POSITIVE_INFINITY);
      if (!obra) {
        for (const m of [malhas.concreto, malhas.pedra, malhas.bronze, malhas.guardaCorpo, malhas.madeira]) tudo(m);
        malhas.piscina.visible = true;
        return;
      }
      const estrutura = Math.max(1, Math.min(COBERTURA, obra.estruturaAte));
      // O vidro nunca passa da estrutura: o último andar com laje ainda não tem a de cima.
      const fachada = Math.max(1, Math.min(obra.fachadaAte, estrutura - 1, COBERTURA - 1));
      const pronto = estrutura >= COBERTURA && obra.fachadaAte >= COBERTURA - 1;
      malhas.concreto.geometry.setDrawRange(0, fim.concreto[estrutura]!);
      malhas.pedra.geometry.setDrawRange(0, pronto ? Number.POSITIVE_INFINITY : fim.pedra[1]!);
      malhas.bronze.geometry.setDrawRange(0, pronto ? Number.POSITIVE_INFINITY : fim.bronze[fachada]!);
      malhas.guardaCorpo.geometry.setDrawRange(0, pronto ? Number.POSITIVE_INFINITY : fim.guardaCorpo[fachada]!);
      malhas.madeira.geometry.setDrawRange(0, pronto ? Number.POSITIVE_INFINITY : fim.madeira[fachada]!);
      malhas.piscina.visible = pronto;
    },
    descartar() {
      for (const m of Object.values(malhas)) m.geometry.dispose();
    },
  };
}

/** Até que pavimento o vidro vai, com a obra: nunca além da estrutura. */
export function fachadaEfetiva(obra: { estruturaAte: number; fachadaAte: number } | null): number {
  if (!obra) return 21;
  return Math.max(1, Math.min(obra.fachadaAte, obra.estruturaAte - 1, 21));
}

/**
 * O que fica na tela na vista da varanda: só a laje, o guarda-corpo e o pilar de canto da própria
 * unidade (ou, sem varanda, a moldura da janela). Gerado sob demanda, na camada da vista.
 */
export function construirVarandaPropria(
  materiais: MateriaisDaTorre,
  alvo: { pavimento: number; fachada: Fachada; naVaranda: boolean; olho: readonly number[] },
): { grupo: Group; geometrias: BufferGeometry[] } {
  const concreto = new Construtor({ extras: { aBanho: 1 } });
  const bronze = new Construtor();
  const guarda = new Construtor();
  const laje = cota(alvo.pavimento);
  if (alvo.naVaranda) {
    const sx = alvo.olho[0]! < 0 ? -1 : 1;
    const sz = alvo.olho[2]! < 0 ? -1 : 1;
    const canto = `${sz < 0 ? 'N' : 'S'}${sx < 0 ? 'O' : 'E'}` as Canto;
    const { piso } = plantaDaVaranda(canto);
    concreto.extrudar(piso, laje - VIGA, laje + PISO);
    guardaCorpoDaVaranda(guarda, bronze, canto, alvo.pavimento, 0.016);
    concreto.caixa(sx * MEIA_LARGURA - 0.21, laje + PISO, sz * MEIA_PROFUNDIDADE - 0.21, sx * MEIA_LARGURA + 0.21, laje + 2.5, sz * MEIA_PROFUNDIDADE + 0.21, 'b');
  } else {
    // A janela: peitoril, viga e os montantes dos lados, no plano do vidro.
    const vertical = alvo.fachada === 'leste' || alvo.fachada === 'oeste';
    const [ox, , oz] = alvo.olho;
    const plano = vertical ? Math.sign(ox!) * MEIA_LARGURA : Math.sign(oz!) * MEIA_PROFUNDIDADE;
    const meia = vertical ? 2 : 1.5;
    const centro = vertical ? oz! : ox!;
    const caixa = (a: number, b: number, y0: number, y1: number, alcance: number, c: Construtor) => {
      if (vertical) c.caixa(plano - alcance, y0, a, plano + alcance, y1, b);
      else c.caixa(a, y0, plano - alcance, b, y1, plano + alcance);
    };
    caixa(centro - meia - 1, centro + meia + 1, laje - VIGA, laje + PISO, 0.25, concreto);
    caixa(centro - meia - 1, centro + meia + 1, laje + 2.5, laje + 2.98, 0.25, concreto);
    caixa(centro - meia - 0.06, centro - meia + 0.06, laje + PISO, laje + 2.5, 0.12, bronze);
    caixa(centro + meia - 0.06, centro + meia + 0.06, laje + PISO, laje + 2.5, 0.12, bronze);
    caixa(centro - meia, centro + meia, laje + PISO, laje + PISO + 0.06, 0.08, bronze);
  }
  const grupo = new Group();
  grupo.name = 'varanda-propria';
  const geometrias: BufferGeometry[] = [];
  for (const [c, material] of [[concreto, materiais.concreto], [bronze, materiais.bronze], [guarda, materiais.guardaCorpo]] as const) {
    if (c.vazio) continue;
    const g = c.geometria();
    geometrias.push(g);
    const m = new Mesh(g, material);
    m.layers.set(CAMADA.vista);
    m.renderOrder = material === materiais.guardaCorpo ? 1 : 0;
    grupo.add(m);
  }
  grupo.layers.set(CAMADA.vista);
  return { grupo, geometrias };
}

/** As quatro fachadas e o lado de cada uma, para a cena saber de que lado a unidade está. */
export const LADO_DA_FACHADA: Readonly<Record<Fachada, readonly [number, number]>> = {
  norte: [0, -1],
  sul: [0, 1],
  leste: [1, 0],
  oeste: [-1, 0],
};

export { VAOS_DE_VARANDA };
