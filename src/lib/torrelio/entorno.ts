import { cota, LARGURA_DO_VAO, NORMAL_DA_FACHADA, TORRE } from './predio';
import type { Fachada, Quarto, Trecho, Unidade } from './tipos';

/**
 * O entorno fictício de Porto Lume, em volta do Residencial Vértice: o que se vê de cada andar e
 * de cada fachada. É a fonte do texto da vista ("Ver a vista desta unidade") e do 3D da paisagem,
 * para os dois nunca se contradizerem: o 3D desenha as mesmas caixas que tampam a vista aqui.
 *
 * - Frente (norte): avenida com canteiro arborizado, uma fileira de prédios de 20 a 32 m do outro
 *   lado e, entre 300 e 700 m, as torres do centro.
 * - Fundos (sul): parque linear com lago, casas baixas, a orla e o mar ao fundo; morros e farol a
 *   sudeste.
 * - Lateral leste: uma torre vizinha, a 20 m, que fecha a vista até o 13º andar.
 * - Lateral oeste: rua lateral e casario; é o lado do pôr do sol.
 *
 * A visibilidade é geométrica: do olho de quem está na varanda saem raios até pontos de cada marco,
 * dentro de um cone de ±70° em volta da fachada, e cada raio é testado contra as caixas (prédios).
 * As copas das árvores não contam como oclusão. O mar é amostrado na distância em que a névoa do 3D
 * já o apaga (`Z_AMOSTRA_DO_MAR`): ver o mar é ver o mar daí para perto.
 *
 * Coordenadas em metros, y para cima, −z para o norte e +x para o leste, como em `predio.ts`.
 */

export type MarcoId =
  | 'avenida' | 'predios-da-avenida' | 'centro' | 'parque' | 'lago' | 'mar' | 'morros' | 'farol' | 'torre-vizinha' | 'casario';

export type Visibilidade = 'visivel' | 'parcial' | 'oculto';

export const NOMES_DOS_MARCOS: Readonly<Record<MarcoId, string>> = {
  avenida: 'a avenida arborizada',
  'predios-da-avenida': 'os prédios do outro lado da avenida',
  centro: 'as torres do centro',
  parque: 'o parque',
  lago: 'o lago',
  mar: 'o mar',
  morros: 'os morros',
  farol: 'o farol',
  'torre-vizinha': 'a torre vizinha',
  casario: 'o casario',
};

/** A partir deste andar, a lateral leste vê por cima da torre vizinha. Um teste confere com a geometria. */
export const ANDAR_ACIMA_DO_VIZINHO = 14;
/** A partir deste andar, a frente vê o centro por cima dos prédios do outro lado da avenida. */
export const ANDAR_VISTA_CENTRO = 6;

export type Vetor3 = readonly [number, number, number];

// ------------------------------------------------------------------ o próprio prédio

/**
 * As varandas de canto do Residencial Vértice: cada uma envolve 2 vãos da fachada longa e 1 da
 * lateral, com laje de 1,6 m e guarda-corpo de vidro de 1,1 m. Todos os pavimentos com vãos (2º ao
 * 21º) têm as quatro. Os vãos seguem a convenção de `predio.ts`.
 */
export const VARANDA = { profundidade: 1.6, guardaCorpo: 1.1 } as const;
export const VAOS_DE_VARANDA: Readonly<Record<Fachada, readonly number[]>> = {
  norte: [0, 1, 6, 7],
  sul: [0, 1, 6, 7],
  leste: [0, 3],
  oeste: [0, 3],
};

// --------------------------------------------------------------------- a paisagem

/** O lote do prédio, com a calçada. */
export const LOTE = { xMin: -20, xMax: 20, zMin: -17, zMax: 17 } as const;
/** A avenida da frente, com o canteiro central arborizado. Calçadas de 3 m dos dois lados. */
export const AVENIDA = { zMin: -50, zMax: -20, canteiroZMin: -37, canteiroZMax: -33 } as const;
/** A rua lateral, a oeste do lote. */
export const RUA_OESTE = { xMin: -28, xMax: -20 } as const;
/** O lote da torre vizinha, a leste. */
export const LOTE_VIZINHO = { xMin: 24, xMax: 58, zMin: -17, zMax: 46 } as const;
/** O parque linear dos fundos. */
export const PARQUE = { xMin: -240, xMax: 460, zMin: 22, zMax: 140 } as const;
/** O lago do parque: uma elipse. */
export const LAGO = { x: -35, z: 84, raioX: 62, raioZ: 27 } as const;
/** A orla: um gabarito de 26 m na quadra da praia, que esconde o mar dos andares baixos. */
export const ORLA = { zMin: 345, zMax: 372, gabarito: 26 } as const;
/** A faixa de areia e o começo do mar. */
export const AREIA = { zMin: 392, zMax: 455 } as const;
export const NIVEL_DO_MAR = -0.8;
/**
 * Onde o mar é amostrado para a vista: daqui para longe, a névoa do 3D já o apaga. Quem vê o mar
 * nesta linha, por cima da orla, vê o mar.
 */
export const Z_AMOSTRA_DO_MAR = 1250;

export type TipoDeCaixa =
  | 'embasamento' | 'avenida' | 'quadra' | 'centro' | 'fundo' | 'orla' | 'casa' | 'bairro' | 'vizinho' | 'equipamento';

/** Uma caixa da paisagem: um prédio, ou parte dele, que tampa a vista e que o 3D desenha. */
export type Caixa = {
  id: string;
  tipo: TipoDeCaixa;
  min: Vetor3;
  max: Vetor3;
  /** Para variar janelas e cor no 3D de forma estável. */
  semente: number;
};

/** Telhado de duas águas sobre uma casa; a cumeeira corre ao longo do eixo mais comprido. */
export type Telhado = { caixa: string; min: Vetor3; max: Vetor3; cumeeiraEmX: boolean };
export type Arvore = { x: number; z: number; altura: number; raio: number; tipo: 'copa' | 'palmeira'; semente: number; noLote: boolean };
export type Poste = { x: number; z: number; altura: number; /** Rumo do braço, em radianos a partir de +x. */ braco: number };
/** Um morro: um monte suave, de base submersa quando entra no mar. */
export type Morro = { x: number; z: number; raio: number; altura: number };

export type Paisagem = {
  caixas: readonly Caixa[];
  telhados: readonly Telhado[];
  arvores: readonly Arvore[];
  postes: readonly Poste[];
  morros: readonly Morro[];
  farol: { x: number; z: number; base: number; altura: number };
};

/** Os morros a sudeste (o último, mais longe, é a serra que fecha o leste) e o promontório do farol. */
const MORROS: readonly Morro[] = [
  { x: 860, z: 240, raio: 330, altura: 104 },
  { x: 720, z: 520, raio: 260, altura: 86 },
  { x: 640, z: 760, raio: 170, altura: 42 },
  { x: 1320, z: -40, raio: 520, altura: 160 },
];

/** A altura do terreno de um morro, a uma distância `r` do centro: um monte com o pé suave. */
export function alturaDoMorro(morro: Morro, r: number): number {
  const t = Math.min(1, r / morro.raio);
  const perfil = (1 - t * t) ** 1.6;
  return morro.altura * perfil;
}

/** Sorteio determinístico (mulberry32): a cidade é sempre a mesma. */
function sorteador(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * As torres do centro, à mão: [x, z, largura, profundidade, altura]. Entre 300 e 700 m ao norte,
 * de 25 a 110 m de altura.
 */
const CENTRO: readonly (readonly [number, number, number, number, number])[] = [
  [-440, -660, 28, 24, 80], [-380, -520, 26, 22, 64], [-300, -380, 22, 22, 42], [-250, -610, 30, 26, 88],
  [-180, -450, 24, 20, 56], [-120, -650, 28, 28, 110], [-92, -340, 20, 18, 36], [-30, -520, 26, 24, 76],
  [-20, -700, 30, 26, 58], [30, -400, 22, 22, 48], [80, -600, 30, 26, 96], [130, -330, 20, 20, 32],
  [170, -480, 26, 22, 70], [230, -680, 32, 26, 104], [262, -380, 22, 20, 44], [320, -560, 26, 24, 62],
  [400, -440, 24, 22, 40], [460, -650, 26, 24, 72], [-330, -300, 20, 18, 28], [350, -310, 22, 18, 26],
];

/**
 * A fileira do outro lado da avenida, perto do prédio: [x0, x1, altura, profundidade]. Na frente da
 * torre ela fica entre 20 e 22 m, o que abre o centro a partir do 6º andar; mais longe, até 32 m.
 */
const FILEIRA_PERTO: readonly (readonly [number, number, number, number])[] = [
  [-124, -98, 29, 20], [-92, -60, 24, 22], [-54, -27, 21.5, 24], [-21, 3, 20.5, 22],
  [9, 35, 21, 20], [41, 67, 22, 24], [73, 101, 31, 22], [107, 128, 26, 20],
];

function gerarPaisagem(): Paisagem {
  const caixas: Caixa[] = [];
  const telhados: Telhado[] = [];
  const arvores: Arvore[] = [];
  const postes: Poste[] = [];
  const sorte = sorteador(20_261_006);
  const entre = (a: number, b: number) => a + (b - a) * sorte();
  let contador = 0;
  const caixa = (tipo: TipoDeCaixa, x0: number, x1: number, z0: number, z1: number, altura: number, y0 = 0): Caixa => {
    const nova: Caixa = {
      id: `${tipo}-${contador++}`,
      tipo,
      min: [Math.min(x0, x1), y0, Math.min(z0, z1)],
      max: [Math.max(x0, x1), y0 + altura, Math.max(z0, z1)],
      semente: Math.floor(sorte() * 1_000_000),
    };
    caixas.push(nova);
    return nova;
  };
  const casa = (x: number, z: number, largura: number, profundidade: number, paredes: number) => {
    const corpo = caixa('casa', x - largura / 2, x + largura / 2, z - profundidade / 2, z + profundidade / 2, paredes);
    telhados.push({
      caixa: corpo.id,
      min: [corpo.min[0] - 0.4, paredes, corpo.min[2] - 0.4],
      max: [corpo.max[0] + 0.4, paredes + Math.min(largura, profundidade) * 0.32, corpo.max[2] + 0.4],
      cumeeiraEmX: largura >= profundidade,
    });
  };

  // O nosso embasamento tampa a vista dos andares baixos; quem o desenha é a cena da torre.
  caixas.push({ id: 'embasamento', tipo: 'embasamento', min: [-16, 0, -13], max: [16, 7.5, 13], semente: 0 });

  // ---------------------------------------------------------------- norte
  const frenteDaFileira = AVENIDA.zMin - 6; // calçada de 3 m e recuo de 3 m
  for (const [x0, x1, altura, profundidade] of FILEIRA_PERTO) {
    const predio = caixa('avenida', x0, x1, frenteDaFileira, frenteDaFileira - profundidade, altura);
    // Casa de máquinas recuada para o fundo do telhado, longe da linha de visão do prédio.
    const meio = (predio.min[0] + predio.max[0]) / 2;
    caixa('equipamento', meio - 3.5, meio + 3.5, predio.min[2] + 2, predio.min[2] + 8, 3.2, altura);
  }
  for (const lado of [-1, 1] as const) {
    let x = lado < 0 ? -130 : 134;
    while (Math.abs(x) < 470) {
      const largura = entre(18, 34);
      const x0 = x;
      const x1 = x + lado * largura;
      const altura = entre(20, 32);
      const predio = caixa('avenida', x0, x1, frenteDaFileira, frenteDaFileira - entre(18, 26), altura);
      if (sorte() < 0.6) {
        const meio = (predio.min[0] + predio.max[0]) / 2;
        caixa('equipamento', meio - 3, meio + 3, predio.min[2] + 2, predio.min[2] + 7, 3, altura);
      }
      x = x1 + lado * (sorte() < 0.3 ? 12 : 6);
    }
  }
  // Quadras baixas entre a fileira e o centro.
  for (let z = -98; z > -290; z -= 46) {
    for (let x = -460; x < 460; x += entre(30, 52)) {
      if (sorte() < 0.18) continue;
      caixa('quadra', x, x + entre(18, 30), z, z - entre(18, 32), entre(8, 16));
    }
  }
  for (const [x, z, largura, profundidade, altura] of CENTRO) {
    caixa('centro', x - largura / 2, x + largura / 2, z - profundidade / 2, z + profundidade / 2, altura);
  }
  // O fundo: silhuetas na névoa, ao norte, a leste e a oeste (nunca na direção do mar e dos morros).
  for (let i = 0; i < 64; i += 1) {
    const rumo = (-100 + sorte() * 200) * (Math.PI / 180);
    const distancia = entre(820, 2300);
    const x = Math.sin(rumo) * distancia;
    const z = -Math.cos(rumo) * distancia;
    if (x > 400 && z > -300) continue;
    const largura = entre(26, 70);
    caixa('fundo', x - largura / 2, x + largura / 2, z - largura / 2, z + largura / 2, entre(16, 72));
  }

  // ------------------------------------------------------------------ leste
  // A torre vizinha: uma lâmina de 43 m a 20 m da fachada leste. A casa de máquinas fica na ponta
  // norte do telhado, fora da linha de visão para os morros.
  caixa('vizinho', 32, 52, -16, 40, 43);
  caixa('equipamento', 36, 48, -15, -6, 3.4, 43);
  // O bairro a leste: prédios de 3 a 7 andares.
  for (let x = 66; x < 430; x += entre(30, 46)) {
    caixa('bairro', x, x + entre(16, 26), -14, -14 + entre(14, 24), entre(10, 22));
  }

  // ------------------------------------------------------------------ oeste
  // Casario: duas fileiras de casas ao longo da rua lateral e das ruas para o oeste.
  for (let x = -36; x > -420; x -= entre(11, 14)) {
    if (sorte() < 0.12) continue;
    casa(x - 5, -9, entre(8.5, 11), entre(9, 12), entre(3.4, 6.8));
    if (sorte() < 0.8) casa(x - 5, 9, entre(8.5, 11), entre(9, 12), entre(3.4, 6.8));
  }
  for (let z = 30; z < 330; z += entre(12, 16)) {
    for (let x = -262; x > -420; x -= entre(13, 18)) {
      if (sorte() < 0.25) continue;
      casa(x, z, entre(8, 11), entre(9, 12), entre(3.4, 7));
    }
  }

  // ------------------------------------------------------------------- sul
  // Casas baixas entre o parque e a orla, em quadras.
  for (const zQuadra of [158, 197, 221, 258, 281, 318]) {
    for (let x = -240; x < 430; x += entre(12, 15)) {
      if (sorte() < 0.16 || Math.abs(((x + 240) % 92) - 46) > 40) continue;
      casa(x, zQuadra, entre(8, 11), entre(9, 13), entre(3.4, 7.5));
    }
  }
  // A orla: quadra contínua de prédios no gabarito, sem vão até o chão (o gabarito é a regra da
  // praia). Alguns passam do gabarito com a casa de máquinas.
  for (let x = -980; x < 540; ) {
    const largura = entre(20, 36);
    const altura = sorte() < 0.82 ? entre(ORLA.gabarito, ORLA.gabarito + 0.5) : entre(ORLA.gabarito + 1, ORLA.gabarito + 4.5);
    caixa('orla', x, x + largura, ORLA.zMin + entre(0, 2), ORLA.zMax - entre(0, 3), altura);
    x += largura;
  }

  // ---------------------------------------------------------------- árvores
  // Canteiro central da avenida: fileira dupla e regular.
  for (let x = -400; x <= 400; x += 9) {
    for (const z of [AVENIDA.canteiroZMin + 1, AVENIDA.canteiroZMax - 1]) {
      arvores.push({ x: x + entre(-1, 1), z, altura: entre(8, 10.5), raio: entre(2.6, 3.4), tipo: 'copa', semente: Math.floor(sorte() * 1e6), noLote: false });
    }
  }
  // Calçadas da avenida.
  for (let x = -260; x <= 260; x += 12) {
    if (Math.abs(x) > 22) arvores.push({ x, z: AVENIDA.zMax + 1.4, altura: entre(6, 8), raio: entre(2, 2.6), tipo: 'copa', semente: Math.floor(sorte() * 1e6), noLote: false });
    arvores.push({ x: x + 6, z: AVENIDA.zMin - 1.4, altura: entre(6, 8), raio: entre(2, 2.6), tipo: 'copa', semente: Math.floor(sorte() * 1e6), noLote: false });
  }
  // Rua lateral.
  for (let z = -12; z <= 14; z += 9) {
    arvores.push({ x: RUA_OESTE.xMin - 1.4, z, altura: entre(6, 7.5), raio: entre(1.8, 2.4), tipo: 'copa', semente: Math.floor(sorte() * 1e6), noLote: false });
  }
  // Parque: copas de 10 a 14 m, soltas, fora do lago e das trilhas.
  for (let i = 0; i < 260; i += 1) {
    const x = entre(PARQUE.xMin + 6, PARQUE.xMax - 6);
    const z = entre(PARQUE.zMin + 5, PARQUE.zMax - 5);
    const dx = (x - LAGO.x) / (LAGO.raioX + 8);
    const dz = (z - LAGO.z) / (LAGO.raioZ + 8);
    if (dx * dx + dz * dz < 1) continue;
    if (x > LOTE_VIZINHO.xMin - 4 && x < LOTE_VIZINHO.xMax + 4 && z < LOTE_VIZINHO.zMax + 4) continue;
    if (Math.abs(z - 112) < 3) continue; // trilha
    arvores.push({ x, z, altura: entre(10, 14), raio: entre(3.2, 5), tipo: 'copa', semente: Math.floor(sorte() * 1e6), noLote: false });
  }
  // Palmeiras da avenida da praia.
  for (let x = -900; x <= 500; x += 22) {
    arvores.push({ x: x + entre(-2, 2), z: AREIA.zMin - 3, altura: entre(9, 12), raio: 2.4, tipo: 'palmeira', semente: Math.floor(sorte() * 1e6), noLote: false });
  }
  // O paisagismo do lote, por último: no modo obra, ele some e vira terra.
  for (const [x, z] of [[-17.5, -15], [-9, -15.5], [9, -15.5], [17.5, -15], [-18, 0], [-18, 10], [18, 10], [-10, 15.5], [10, 15.5], [0, 15.5]] as const) {
    arvores.push({ x, z, altura: entre(6.5, 8.5), raio: entre(1.9, 2.5), tipo: 'copa', semente: Math.floor(sorte() * 1e6), noLote: true });
  }

  // ----------------------------------------------------------------- postes
  for (let x = -330; x <= 330; x += 30) {
    postes.push({ x, z: AVENIDA.zMax + 0.6, altura: 9, braco: -Math.PI / 2 });
    postes.push({ x: x + 15, z: AVENIDA.zMin - 0.6, altura: 9, braco: Math.PI / 2 });
    postes.push({ x: x + 7, z: (AVENIDA.canteiroZMin + AVENIDA.canteiroZMax) / 2, altura: 10, braco: 0 });
  }
  for (let z = -10; z <= 40; z += 25) postes.push({ x: RUA_OESTE.xMax - 0.6, z, altura: 7.5, braco: Math.PI });
  for (let x = -220; x <= 440; x += 34) postes.push({ x, z: 112 + 2.5, altura: 4.5, braco: 0 });
  for (let x = -880; x <= 500; x += 28) postes.push({ x, z: AREIA.zMin - 6, altura: 8, braco: -Math.PI / 2 });

  const farolBase = alturaDoMorro(MORROS[2]!, 0);
  return { caixas, telhados, arvores, postes, morros: MORROS, farol: { x: MORROS[2]!.x, z: MORROS[2]!.z, base: farolBase, altura: 19 } };
}

let paisagemPronta: Paisagem | null = null;

/** A paisagem inteira, gerada uma vez (é determinística) e só quando alguém pede. */
export function paisagem(): Paisagem {
  paisagemPronta ??= gerarPaisagem();
  return paisagemPronta;
}

// ------------------------------------------------------------------- os marcos

type Amostra = { ponto: Vetor3; /** A caixa do próprio marco, que não tampa a si mesma. */ dono: string | null };

function amostrasDeCaixa(c: Caixa, normalDaFace: 'sul' | 'oeste' | 'leste' | 'norte', altura = 0.75): Amostra[] {
  const meio = (a: number, b: number) => (a + b) / 2;
  const topo = c.max[1];
  const y = c.min[1] + (topo - c.min[1]) * altura;
  const face: Vetor3 =
    normalDaFace === 'sul' ? [meio(c.min[0], c.max[0]), y, c.max[2] + 0.3]
      : normalDaFace === 'norte' ? [meio(c.min[0], c.max[0]), y, c.min[2] - 0.3]
        : normalDaFace === 'oeste' ? [c.min[0] - 0.3, y, meio(c.min[2], c.max[2])]
          : [c.max[0] + 0.3, y, meio(c.min[2], c.max[2])];
  const centroDoTopo: Vetor3 = [meio(c.min[0], c.max[0]), topo + 0.3, meio(c.min[2], c.max[2])];
  return [{ ponto: face, dono: c.id }, { ponto: centroDoTopo, dono: c.id }];
}

function gerarMarcos(): Readonly<Record<MarcoId, readonly Amostra[]>> {
  const { caixas, telhados, morros, farol } = paisagem();
  const marcos: Record<MarcoId, Amostra[]> = {
    avenida: [], 'predios-da-avenida': [], centro: [], parque: [], lago: [], mar: [], morros: [], farol: [], 'torre-vizinha': [], casario: [],
  };
  for (let x = -150; x <= 150; x += 15) marcos.avenida.push({ ponto: [x, 0.4, (AVENIDA.zMin + AVENIDA.zMax) / 2 + (x % 2 ? 6 : -6)], dono: null });
  for (const c of caixas) {
    if (c.tipo === 'avenida' && Math.abs((c.min[0] + c.max[0]) / 2) < 180) marcos['predios-da-avenida'].push(...amostrasDeCaixa(c, 'sul', 0.5));
    if (c.tipo === 'centro') marcos.centro.push(...amostrasDeCaixa(c, 'sul', 0.8));
    if (c.tipo === 'vizinho') {
      for (const y of [8, 22, 36]) for (const z of [-8, 10, 28]) marcos['torre-vizinha'].push({ ponto: [c.min[0] - 0.3, y, z], dono: c.id });
    }
  }
  for (const t of telhados) {
    // O casario: as cumeeiras das casas a oeste do lote, até 250 m.
    if (t.max[0] < RUA_OESTE.xMin && t.max[0] > -260 && t.min[2] < 60) {
      marcos.casario.push({ ponto: [(t.min[0] + t.max[0]) / 2, t.max[1] + 0.3, (t.min[2] + t.max[2]) / 2], dono: t.caixa });
    }
  }
  for (let x = PARQUE.xMin + 20; x < 380; x += 40) {
    for (let z = PARQUE.zMin + 10; z < PARQUE.zMax; z += 30) {
      const dx = (x - LAGO.x) / LAGO.raioX;
      const dz = (z - LAGO.z) / LAGO.raioZ;
      if (dx * dx + dz * dz > 1.2) marcos.parque.push({ ponto: [x, 0.4, z], dono: null });
    }
  }
  for (let i = 0; i < 12; i += 1) {
    const angulo = (i / 12) * Math.PI * 2;
    for (const r of [0.35, 0.75]) {
      marcos.lago.push({ ponto: [LAGO.x + Math.cos(angulo) * LAGO.raioX * r, 0.3, LAGO.z + Math.sin(angulo) * LAGO.raioZ * r], dono: null });
    }
  }
  // O mar na linha da névoa, do sul-sudeste ao sudoeste (o leste disso é morro).
  for (let rumo = 150; rumo <= 230; rumo += 2.5) {
    const x = Math.tan((180 - rumo) * (Math.PI / 180)) * Z_AMOSTRA_DO_MAR;
    marcos.mar.push({ ponto: [x, NIVEL_DO_MAR + 0.5, Z_AMOSTRA_DO_MAR], dono: null });
  }
  // Os morros: o cume e a encosta virada para o prédio.
  for (const morro of morros) {
    const paraOPredio = Math.atan2(-morro.z, -morro.x);
    marcos.morros.push({ ponto: [morro.x, morro.altura + 2, morro.z], dono: null });
    for (const desvio of [-0.6, 0, 0.6]) {
      const r = morro.raio * 0.42;
      const x = morro.x + Math.cos(paraOPredio + desvio) * r;
      const z = morro.z + Math.sin(paraOPredio + desvio) * r;
      marcos.morros.push({ ponto: [x, alturaDoMorro(morro, r) + 2, z], dono: null });
    }
  }
  marcos.farol.push({ ponto: [farol.x, farol.base + farol.altura - 1, farol.z], dono: null });
  return marcos;
}

let marcosProntos: Readonly<Record<MarcoId, readonly Amostra[]>> | null = null;
const marcos = () => (marcosProntos ??= gerarMarcos());

/** Os pontos que representam cada marco, para o 3D e para os testes. */
export function amostrasDoMarco(id: MarcoId): readonly Vetor3[] {
  return marcos()[id].map((a) => a.ponto);
}

// ---------------------------------------------------------------- visibilidade

/** O segmento de `a` a `b` atravessa a caixa? (Teste de placas, sem as pontas.) */
function cruza(a: Vetor3, b: Vetor3, c: Caixa): boolean {
  let t0 = 1e-4;
  let t1 = 1 - 1e-4;
  for (let eixo = 0; eixo < 3; eixo += 1) {
    const origem = a[eixo]!;
    const passo = b[eixo]! - origem;
    const min = c.min[eixo]!;
    const max = c.max[eixo]!;
    if (Math.abs(passo) < 1e-9) {
      if (origem < min || origem > max) return false;
      continue;
    }
    let ta = (min - origem) / passo;
    let tb = (max - origem) / passo;
    if (ta > tb) [ta, tb] = [tb, ta];
    if (ta > t0) t0 = ta;
    if (tb < t1) t1 = tb;
    if (t0 > t1) return false;
  }
  return true;
}

/** Nada entre o olho e o ponto, fora a caixa do próprio marco? */
export function raioLivre(olho: Vetor3, ponto: Vetor3, ignorar: string | null = null): boolean {
  const xMin = Math.min(olho[0], ponto[0]);
  const xMax = Math.max(olho[0], ponto[0]);
  const yMin = Math.min(olho[1], ponto[1]);
  const zMin = Math.min(olho[2], ponto[2]);
  const zMax = Math.max(olho[2], ponto[2]);
  for (const c of paisagem().caixas) {
    if (c.id === ignorar) continue;
    // Corte rápido: a caixa fora do envelope do raio não pode tampá-lo.
    if (c.max[0] < xMin || c.min[0] > xMax || c.max[2] < zMin || c.min[2] > zMax || c.max[1] < yMin) continue;
    if (cruza(olho, ponto, c)) return false;
  }
  return true;
}

/** O cone de quem olha pela fachada: ±70° em volta da normal, no plano. */
export const CONE_DA_VISTA = 70;

export type PontoDeVista = {
  pavimento: number;
  fachada: Fachada;
  /**
   * Olho de quem está na varanda: no meio do trecho de varanda da fachada, 1,55 m acima da laje e
   * 0,6 m para fora do vidro. Sem varanda naquele trecho (quartos do meio, no hotel), o olho fica
   * 0,6 m para dentro, atrás da janela.
   */
  olho: readonly [number, number, number];
  direcao: readonly [number, number, number];
  /** Se o olho está numa varanda (e não atrás de uma janela). */
  naVaranda: boolean;
};

const ALTURA_DO_OLHO = 1.55;
const PARA_FORA = 0.6;

/** O trecho de vãos (contíguo) da varanda de canto dentro do trecho, o mais perto do meio dele. */
export function vaosDaVarandaNoTrecho(trecho: Trecho): { de: number; ate: number } | null {
  const daVaranda = VAOS_DE_VARANDA[trecho.fachada].filter((v) => v >= trecho.de && v < trecho.ate);
  if (daVaranda.length === 0) return null;
  const grupos: { de: number; ate: number }[] = [];
  for (const v of daVaranda) {
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.ate === v) ultimo.ate = v + 1;
    else grupos.push({ de: v, ate: v + 1 });
  }
  const meio = (trecho.de + trecho.ate) / 2;
  const distancia = (g: { de: number; ate: number }) => Math.abs((g.de + g.ate) / 2 - meio);
  return grupos.reduce((melhor, g) => (distancia(g) < distancia(melhor) ? g : melhor));
}

export function pontoDeVista(alvo: { pavimento: number; trecho: Trecho }): PontoDeVista {
  const { pavimento, trecho } = alvo;
  const { fachada } = trecho;
  const varanda = vaosDaVarandaNoTrecho(trecho);
  const faixa = varanda ?? trecho;
  const meio = (LARGURA_DO_VAO[fachada] * (faixa.de + faixa.ate)) / 2;
  const normal = NORMAL_DA_FACHADA[fachada];
  const fora = varanda ? PARA_FORA : -PARA_FORA;
  const x0 = fachada === 'norte' || fachada === 'sul' ? -TORRE.largura / 2 + meio : (normal[0] * TORRE.largura) / 2;
  const z0 = fachada === 'leste' || fachada === 'oeste' ? -TORRE.profundidade / 2 + meio : (normal[2] * TORRE.profundidade) / 2;
  const olho: [number, number, number] = [x0 + normal[0] * fora, cota(pavimento) + ALTURA_DO_OLHO, z0 + normal[2] * fora];
  return { pavimento, fachada, olho, direcao: normal, naVaranda: varanda !== null };
}

/** Os marcos que cada fachada pode mostrar, de perto para longe. */
const MARCOS_DA_FACHADA: Readonly<Record<Fachada, readonly MarcoId[]>> = {
  norte: ['avenida', 'predios-da-avenida', 'centro'],
  sul: ['parque', 'lago', 'mar', 'morros', 'farol'],
  leste: ['torre-vizinha', 'morros', 'farol', 'mar'],
  oeste: ['casario', 'centro'],
};

/** A fração de pontos do marco a partir da qual ele conta como visível (abaixo dela, parcial). */
const FRACAO_VISIVEL = 0.5;

const memoria = new Map<string, readonly { id: MarcoId; nome: string; estado: Visibilidade }[]>();

/** O que aparece, para quem olha pela fachada, e em que estado. Na ordem de perto para longe. */
export function marcosVisiveis(p: PontoDeVista): readonly { id: MarcoId; nome: string; estado: Visibilidade }[] {
  const chave = `${p.fachada}:${p.olho.map((v) => v.toFixed(3)).join(',')}`;
  const guardado = memoria.get(chave);
  if (guardado) return guardado;
  const [nx, , nz] = NORMAL_DA_FACHADA[p.fachada];
  const limite = Math.cos(CONE_DA_VISTA * (Math.PI / 180));
  const lista = MARCOS_DA_FACHADA[p.fachada].map((id) => {
    let noCone = 0;
    let livres = 0;
    for (const { ponto, dono } of marcos()[id]) {
      const dx = ponto[0] - p.olho[0];
      const dz = ponto[2] - p.olho[2];
      const plano = Math.hypot(dx, dz);
      if (plano < 1e-6 || (dx * nx + dz * nz) / plano < limite) continue;
      noCone += 1;
      if (raioLivre(p.olho, ponto, dono)) livres += 1;
    }
    const fracao = noCone === 0 ? 0 : livres / noCone;
    const estado: Visibilidade = fracao >= FRACAO_VISIVEL ? 'visivel' : fracao > 0 ? 'parcial' : 'oculto';
    return { id, nome: NOMES_DOS_MARCOS[id], estado };
  });
  memoria.set(chave, lista);
  return lista;
}

const trechoDa = (alvo: Unidade | Quarto, fachada: Fachada): Trecho =>
  alvo.trechos.find((t) => t.fachada === fachada) ?? alvo.trechos[0]!;
/** As coberturas duplex olham do andar de baixo. */
const pavimentoDa = (alvo: Unidade | Quarto): number => alvo.pavimentos[0]!;

/** O ponto de vista de uma unidade (ou quarto) por uma das fachadas dela. */
export function pontoDeVistaDa(alvo: Unidade | Quarto, fachada: Fachada): PontoDeVista {
  return pontoDeVista({ pavimento: pavimentoDa(alvo), trecho: trechoDa(alvo, fachada) });
}

function estados(alvo: Unidade | Quarto, fachada: Fachada) {
  const lista = marcosVisiveis(pontoDeVistaDa(alvo, fachada));
  return (id: MarcoId): Visibilidade => lista.find((m) => m.id === id)?.estado ?? 'oculto';
}

/**
 * A vista em uma frase, para a faixa da vista e para leitores de tela.
 * Ex.: "O parque e o lago em primeiro plano, o mar ao fundo, por cima da orla. Morros e farol à esquerda."
 */
export function descricaoDaVista(alvo: Unidade | Quarto, fachada: Fachada): string {
  const estado = estados(alvo, fachada);
  switch (fachada) {
    case 'norte':
      return estado('centro') === 'visivel'
        ? 'A avenida arborizada e, por cima dos prédios do outro lado, as torres do centro.'
        : 'A avenida arborizada e a fileira de prédios do outro lado; o centro aparece só nos andares mais altos.';
    case 'sul':
      return estado('mar') === 'visivel'
        ? 'O parque e o lago em primeiro plano e o mar ao fundo, por cima da orla. Morros e farol à esquerda.'
        : 'O parque e o lago em primeiro plano; a orla esconde o mar, que aparece do 12º andar para cima. Morros e farol à esquerda.';
    case 'leste':
      return estado('morros') === 'oculto'
        ? 'A torre vizinha, a 20 m: a lateral leste fica fechada até o 13º andar.'
        : 'Por cima da torre vizinha, os morros e o farol, com um pedaço de mar à direita.';
    case 'oeste':
      return estado('centro') === 'oculto'
        ? 'A rua lateral e o casario; é o lado do pôr do sol.'
        : 'O casario e, à direita, as torres do centro ao longe; é o lado do pôr do sol.';
  }
}

/** A vista em poucas palavras, para a ficha do cartão: "mar e parque", "avenida e centro". */
export function resumoDaVista(alvo: Unidade | Quarto, fachada: Fachada): string {
  const estado = estados(alvo, fachada);
  switch (fachada) {
    case 'norte':
      return estado('centro') === 'visivel' ? 'avenida e centro' : 'avenida';
    case 'sul':
      return estado('mar') === 'visivel' ? 'mar e parque' : 'parque e lago';
    case 'leste':
      return estado('morros') === 'oculto' ? 'torre vizinha' : 'morros e farol';
    case 'oeste':
      return 'casario e pôr do sol';
  }
}
