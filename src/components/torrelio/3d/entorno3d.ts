import {
  BoxGeometry, BufferGeometry, Color, DoubleSide, Group, IcosahedronGeometry, InstancedBufferAttribute,
  InstancedMesh, Matrix4, Mesh, PlaneGeometry, Quaternion, SphereGeometry, Vector3, type Material,
} from 'three';
import {
  alturaDoMorro, AREIA, AVENIDA, LAGO, LOTE, LOTE_VIZINHO, NIVEL_DO_MAR, paisagem, PARQUE, RUA_OESTE, type Caixa,
} from '@/lib/torrelio/entorno';
import { linear } from './ceu';
import { Construtor, type Rgb } from './malha';
import {
  materialComBrilho, materialDaAgua, materialDasLuzes, materialDoCeu, materialDosPredios, padrao, type Comuns,
} from './materiais';
import { CAMADA, type Lampada } from './torre';

/**
 * A paisagem de Porto Lume em 3D, a partir de `entorno.ts`: as mesmas caixas que tampam a vista são
 * os prédios desenhados aqui. Cerca de 12 chamadas: céu, chão, água, morros, prédios, telhados,
 * copas, palmeiras, postes e luzes (mais a praça do lote, que vira terra no modo obra).
 */

const cor = (hex: string): Rgb => linear(hex);

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

const PALETA_DO_CHAO = {
  terra: cor('#55564f'),
  asfalto: cor('#2b2c2d'),
  calcada: cor('#8a857b'),
  canteiro: cor('#3c4532'),
  grama: cor('#47553a'),
  trilha: cor('#9c9483'),
  praca: cor('#a7a093'),
  vizinho: cor('#77736b'),
  areia: cor('#c4b493'),
  faixa: cor('#cfcbbd'),
  borda: cor('#8d877b'),
  lote: cor('#6b5d4e'),
} as const;

type Estilo = { andar: number; modulo: number; acesas: number; terreo: number; tipo: number; cores: readonly string[] };

const ESTILOS: Readonly<Record<Caixa['tipo'], Estilo>> = {
  embasamento: { andar: 3, modulo: 3, acesas: 0, terreo: 0, tipo: 2, cores: ['#999999'] },
  avenida: { andar: 3.0, modulo: 3.2, acesas: 0.36, terreo: 4.5, tipo: 0, cores: ['#bdb6aa', '#a9a49a', '#c7c0b2', '#948f86', '#b4ad9f', '#a29a8c'] },
  quadra: { andar: 3.0, modulo: 3.5, acesas: 0.3, terreo: 0, tipo: 0, cores: ['#a39d92', '#8f8a82', '#b1aa9d', '#9b958b'] },
  centro: { andar: 3.6, modulo: 1.6, acesas: 0.4, terreo: 5, tipo: 3, cores: ['#8a9096', '#a19f98', '#7c8286', '#b4b0a6', '#939798'] },
  fundo: { andar: 3.4, modulo: 3.4, acesas: 0.3, terreo: 0, tipo: 0, cores: ['#8a8a86', '#7e7f7c', '#94928c'] },
  orla: { andar: 3.0, modulo: 1.5, acesas: 0.32, terreo: 4, tipo: 4, cores: ['#d6cfc1', '#c8c3b8', '#bdb6a9', '#d1c9ba'] },
  casa: { andar: 3.2, modulo: 3.6, acesas: 0.5, terreo: 0, tipo: 1, cores: ['#d8d2c4', '#c9b79c', '#b9a58a', '#cfc6b5', '#a8a297', '#c2ae92'] },
  bairro: { andar: 3.0, modulo: 3.2, acesas: 0.36, terreo: 0, tipo: 0, cores: ['#b3ab9e', '#a19a8e', '#c0b8aa'] },
  vizinho: { andar: 43 / 14, modulo: 1.5, acesas: 0.34, terreo: 0, tipo: 4, cores: ['#c9c2b4'] },
  equipamento: { andar: 3, modulo: 3, acesas: 0, terreo: 0, tipo: 2, cores: ['#9a968d', '#8b877f'] },
};

export type Entorno = {
  grupo: Group;
  ceu: Mesh;
  predios: InstancedMesh;
  copas: InstancedMesh;
  /** Quantas copas ficam de fora no modo obra (o paisagismo do lote vem por último). */
  copasDoLote: number;
  praca: Mesh;
  terra: Mesh;
  luzes: InstancedMesh;
  materiais: Material[];
  geometrias: BufferGeometry[];
  /** No modo obra, a praça vira terra e as árvores do lote somem. */
  obra(ativa: boolean): void;
  descartar(): void;
};

function geometriaDaCopa(detalhada: boolean): BufferGeometry {
  const c = new Construtor({ cor: true });
  c.pintar(cor('#4a3f35')).cilindro(0, 0, 0.07, 0.05, 0, 0.5, detalhada ? 5 : 4, false);
  // Uma copa principal e, no nível alto, um lóbulo menor ao lado: silhueta menos de bola.
  const bolhas: [number, number, number, number, number][] = detalhada
    ? [[0, 0.66, 0, 0.64, 1], [0.3, 0.74, -0.16, 0.4, 0]]
    : [[0, 0.66, 0, 0.64, 1]];
  const escura = cor('#263020');
  const clara = cor('#5b6b47');
  for (const [bx, by, bz, r, detalhe] of bolhas) {
    const esfera = new IcosahedronGeometry(1, detalhe);
    const pos = esfera.getAttribute('position');
    const base = c.totalDeVertices;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const yy = by + y * r * 0.82;
      const t = Math.min(1, Math.max(0, (yy - 0.3) / 0.62));
      c.pintar([escura[0] + (clara[0] - escura[0]) * t, escura[1] + (clara[1] - escura[1]) * t, escura[2] + (clara[2] - escura[2]) * t]);
      // Normal da esfera (suave), um pouco puxada para cima: a copa recebe o céu por cima.
      const l = Math.hypot(x, y + 0.25, z) || 1;
      c.vertice([bx + x * r, yy, bz + z * r], [x / l, (y + 0.25) / l, z / l], 0, 0);
    }
    for (let i = 0; i < pos.count; i += 3) c.triangulo(base + i, base + i + 1, base + i + 2);
    esfera.dispose();
  }
  return c.geometria();
}

function geometriaDaPalmeira(): BufferGeometry {
  const c = new Construtor({ cor: true });
  c.pintar(cor('#6b5a48'));
  // Tronco levemente curvo e afinando: anéis ao longo de uma curva.
  const curva = (t: number): [number, number, number] => [0.12 * t * t, 0.85 * t, 0];
  const lados = 6;
  const aneis = 6;
  for (let k = 0; k < aneis; k += 1) {
    const t0 = k / aneis;
    const t1 = (k + 1) / aneis;
    const [x0, y0] = curva(t0);
    const [x1, y1] = curva(t1);
    const r0 = 0.045 - 0.018 * t0;
    const r1 = 0.045 - 0.018 * t1;
    for (let j = 0; j < lados; j += 1) {
      const a0 = (j / lados) * Math.PI * 2;
      const a1 = ((j + 1) / lados) * Math.PI * 2;
      const n0: [number, number, number] = [Math.cos(a0), 0, Math.sin(a0)];
      const n1: [number, number, number] = [Math.cos(a1), 0, Math.sin(a1)];
      const i = c.vertice([x0 + n0[0] * r0, y0, n0[2] * r0], n0, 0, 0);
      c.vertice([x1 + n0[0] * r1, y1, n0[2] * r1], n0, 0, 1);
      c.vertice([x1 + n1[0] * r1, y1, n1[2] * r1], n1, 1, 1);
      c.vertice([x0 + n1[0] * r0, y0, n1[2] * r0], n1, 1, 0);
      c.triangulo(i, i + 1, i + 2);
      c.triangulo(i, i + 2, i + 3);
    }
  }
  const topo = curva(1);
  const verde = cor('#3f4f35');
  const ponta = cor('#56653f');
  for (let f = 0; f < 8; f += 1) {
    const a = (f / 8) * Math.PI * 2 + 0.3;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const px = -dz * 0.06;
    const pz = dx * 0.06;
    let anterior: [number, number, number] = topo;
    for (let s = 1; s <= 3; s += 1) {
      const t = s / 3;
      const ponto: [number, number, number] = [topo[0] + dx * 0.4 * t, topo[1] + 0.08 * t - 0.26 * t * t, topo[2] + dz * 0.4 * t];
      const largura = 1 - t * 0.6;
      c.pintar(s === 3 ? ponta : verde);
      c.quad(
        [anterior[0] - px * largura, anterior[1], anterior[2] - pz * largura],
        [anterior[0] + px * largura, anterior[1], anterior[2] + pz * largura],
        [ponto[0] + px * largura * 0.7, ponto[1], ponto[2] + pz * largura * 0.7],
        [ponto[0] - px * largura * 0.7, ponto[1], ponto[2] - pz * largura * 0.7],
        [0, 1, 0],
      );
      anterior = ponto;
    }
  }
  return c.geometria();
}

function geometriaDoPoste(): BufferGeometry {
  const c = new Construtor({ extras: { aAceso: 1 } });
  c.cilindro(0, 0, 0.11, 0.08, 0, 9, 6, false);
  c.caixa(0, 8.82, -0.05, 1.7, 8.92, 0.05);
  c.caixa(1.35, 8.74, -0.17, 2.05, 8.9, 0.17, 'b');
  c.extra('aAceso', 1).caixa(1.38, 8.72, -0.15, 2.02, 8.74, 0.15, 't');
  return c.geometria();
}

function geometriaDoTelhado(): BufferGeometry {
  const c = new Construtor();
  const n1: [number, number, number] = [0, 0.707, 0.707];
  const n2: [number, number, number] = [0, 0.707, -0.707];
  c.quad([-0.5, 0, 0.5], [0.5, 0, 0.5], [0.5, 1, 0], [-0.5, 1, 0], n1);
  c.quad([0.5, 0, -0.5], [-0.5, 0, -0.5], [-0.5, 1, 0], [0.5, 1, 0], n2);
  const e = c.vertice([-0.5, 0, -0.5], [-1, 0, 0], 0, 0);
  c.vertice([-0.5, 0, 0.5], [-1, 0, 0], 1, 0);
  c.vertice([-0.5, 1, 0], [-1, 0, 0], 0.5, 1);
  c.triangulo(e, e + 1, e + 2);
  const d = c.vertice([0.5, 0, 0.5], [1, 0, 0], 0, 0);
  c.vertice([0.5, 0, -0.5], [1, 0, 0], 1, 0);
  c.vertice([0.5, 1, 0], [1, 0, 0], 0.5, 1);
  c.triangulo(d, d + 1, d + 2);
  return c.geometria();
}

/** O chão por zonas, sem sobreposição longe da câmera (só o detalhe perto sobe uns centímetros). */
function geometriaDoChao(): BufferGeometry {
  const c = new Construtor({ cor: true });
  const zona = (x0: number, z0: number, x1: number, z1: number, y: number, tinta: Rgb) => {
    c.pintar(tinta).quad([x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], [0, 1, 0]);
  };
  const p = PALETA_DO_CHAO;
  zona(-3200, -3200, 3200, AREIA.zMin, 0, p.terra);
  zona(-3200, AREIA.zMin, 3200, AREIA.zMax, 0, p.areia);
  // Rampa da areia para dentro d'água: a linha do mar sai natural.
  c.pintar(p.areia).quad([-3200, -1.6, AREIA.zMax + 22], [3200, -1.6, AREIA.zMax + 22], [3200, 0, AREIA.zMax], [-3200, 0, AREIA.zMax], [0, 0.997, 0.072]);
  // Ruas e calçadas perto do prédio.
  zona(-3200, AVENIDA.zMin, 3200, AVENIDA.zMax, 0.04, p.asfalto);
  zona(-3200, AVENIDA.zMax, 3200, AVENIDA.zMax + 3, 0.07, p.calcada);
  zona(-3200, AVENIDA.zMin - 3, 3200, AVENIDA.zMin, 0.07, p.calcada);
  zona(-1200, AVENIDA.canteiroZMin, 1200, AVENIDA.canteiroZMax, 0.18, p.canteiro);
  zona(-1200, AVENIDA.canteiroZMin - 0.3, 1200, AVENIDA.canteiroZMin, 0.16, p.borda);
  zona(-1200, AVENIDA.canteiroZMax, 1200, AVENIDA.canteiroZMax + 0.3, 0.16, p.borda);
  zona(RUA_OESTE.xMin, AVENIDA.zMax + 3, RUA_OESTE.xMax, 520, 0.05, p.asfalto);
  zona(RUA_OESTE.xMax, LOTE.zMin, LOTE.xMin, 160, 0.07, p.calcada);
  zona(-430, -3, RUA_OESTE.xMin, 3, 0.05, p.asfalto);
  zona(LOTE_VIZINHO.xMin, LOTE_VIZINHO.zMin, LOTE_VIZINHO.xMax, LOTE_VIZINHO.zMax, 0.06, p.vizinho);
  zona(LOTE.xMax, LOTE.zMin, LOTE_VIZINHO.xMin, LOTE.zMax, 0.06, p.calcada);
  // Parque, com trilha e borda de pedra em volta do lago.
  zona(PARQUE.xMin, PARQUE.zMin, PARQUE.xMax, PARQUE.zMax, 0.03, p.grama);
  zona(PARQUE.xMin, 110.5, PARQUE.xMax, 113.5, 0.06, p.trilha);
  zona(-20, LOTE.zMax, 20, PARQUE.zMin, 0.07, p.calcada);
  const segmentos = 48;
  const borda = (escala: number) => Array.from({ length: segmentos }, (_, i) => {
    const a = (i / segmentos) * Math.PI * 2;
    return [LAGO.x + Math.cos(a) * LAGO.raioX * escala, LAGO.z + Math.sin(a) * LAGO.raioZ * escala] as [number, number];
  });
  c.pintar(p.trilha).poligono(borda(1.07), 0.05, true);
  // Ruas do bairro dos fundos e da orla.
  for (const [z0, z1] of [[140, 150], [205, 213], [265, 273], [325, 345], [375, AREIA.zMin]] as const) zona(-1200, z0, 1200, z1, 0.05, p.asfalto);
  // Faixas da avenida e a faixa de pedestres em frente ao prédio.
  for (const z of [-24.3, -28.7, -41.3, -45.7]) {
    for (let x = -420; x < 420; x += 9) zona(x, z - 0.08, x + 3, z + 0.08, 0.09, p.faixa);
  }
  for (let x = -4.2; x <= 4.2; x += 1.2) {
    zona(x - 0.25, AVENIDA.zMin + 0.6, x + 0.25, AVENIDA.canteiroZMin - 0.4, 0.09, p.faixa);
    zona(x - 0.25, AVENIDA.canteiroZMax + 0.4, x + 0.25, AVENIDA.zMax - 0.6, 0.09, p.faixa);
  }
  return c.geometria();
}

function geometriaDaAgua(): BufferGeometry {
  const c = new Construtor({ extras: { aCorDaAgua: 3, aBrilho: 1 } });
  c.extra('aCorDaAgua', cor('#21515c')).extra('aBrilho', 0);
  c.quad([-4600, NIVEL_DO_MAR, 4600], [4600, NIVEL_DO_MAR, 4600], [4600, NIVEL_DO_MAR, AREIA.zMax], [-4600, NIVEL_DO_MAR, AREIA.zMax], [0, 1, 0]);
  c.extra('aCorDaAgua', cor('#24382f'));
  const segmentos = 48;
  const pontos = Array.from({ length: segmentos }, (_, i) => {
    const a = (i / segmentos) * Math.PI * 2;
    return [LAGO.x + Math.cos(a) * LAGO.raioX, LAGO.z + Math.sin(a) * LAGO.raioZ] as [number, number];
  });
  c.poligono(pontos, 0.07, true);
  return c.geometria();
}

function geometriaDosMorros(): BufferGeometry {
  const { morros, farol } = paisagem();
  const c = new Construtor({ cor: true });
  const s = sorteador(404);
  const mato = cor('#36402f');
  const mato2 = cor('#424c38');
  const pedra = cor('#5c5a54');
  for (const morro of morros) {
    const aneis = 12;
    const segmentos = 40;
    const ruido = Array.from({ length: 9 }, () => 0.84 + s() * 0.32);
    // Ruído angular suave (cosseno entre 9 nós), que some no cume para não fazer bico.
    const ondulacao = (a: number) => {
      const u = ((a / (Math.PI * 2)) * ruido.length + ruido.length) % ruido.length;
      const i = Math.floor(u);
      const f = (1 - Math.cos((u - i) * Math.PI)) / 2;
      return ruido[i]! * (1 - f) + ruido[(i + 1) % ruido.length]! * f;
    };
    const altura = (x: number, z: number) => {
      const r = Math.hypot(x - morro.x, z - morro.z);
      if (r > morro.raio) return -4 * Math.min(1, (r - morro.raio) / (morro.raio * 0.12));
      const a = Math.atan2(z - morro.z, x - morro.x);
      return alturaDoMorro(morro, r) * (1 + (ondulacao(a) - 1) * Math.min(1, r / morro.raio) * 1.6);
    };
    const normal = (x: number, z: number): [number, number, number] => {
      const e = 2;
      const nx = -(altura(x + e, z) - altura(x - e, z)) / (2 * e);
      const nz = -(altura(x, z + e) - altura(x, z - e)) / (2 * e);
      const l = Math.hypot(nx, 1, nz);
      return [nx / l, 1 / l, nz / l];
    };
    const base = c.totalDeVertices;
    const indice = (k: number, j: number) => (k === 0 ? base : base + 1 + (k - 1) * segmentos + (j % segmentos));
    for (let k = 0; k <= aneis; k += 1) {
      const r = (k / aneis) ** 0.85 * morro.raio * 1.12;
      const voltas = k === 0 ? 1 : segmentos;
      for (let j = 0; j < voltas; j += 1) {
        const a = (j / segmentos) * Math.PI * 2;
        const x = morro.x + Math.cos(a) * r;
        const z = morro.z + Math.sin(a) * r;
        const n = normal(x, z);
        c.pintar(n[1] < 0.8 ? pedra : (j + k) % 4 === 0 ? mato2 : mato);
        c.vertice([x, altura(x, z), z], n, 0, 0);
      }
    }
    for (let k = 0; k < aneis; k += 1) {
      for (let j = 0; j < segmentos; j += 1) {
        const a = indice(k, j);
        const b = indice(k + 1, j);
        const cc = indice(k + 1, j + 1);
        const d = indice(k, j + 1);
        // Vista de cima, anti-horário: o ângulo cresce de x para z.
        c.triangulo(a, cc, b);
        if (k > 0) c.triangulo(a, d, cc);
      }
    }
  }
  // O farol: torre branca com uma faixa, lanterna escura e capuz.
  c.pintar(cor('#e6e1d6')).cilindro(farol.x, farol.z, 2.1, 1.5, farol.base - 1, farol.base + farol.altura - 3, 12, false);
  c.pintar(cor('#7d3a2f')).cilindro(farol.x, farol.z, 1.62, 1.58, farol.base + farol.altura * 0.55, farol.base + farol.altura * 0.62, 12, false);
  c.pintar(cor('#1c2022')).cilindro(farol.x, farol.z, 1.35, 1.35, farol.base + farol.altura - 3, farol.base + farol.altura - 0.8, 12, false);
  c.pintar(cor('#7d3a2f')).cilindro(farol.x, farol.z, 1.7, 0.2, farol.base + farol.altura - 0.8, farol.base + farol.altura + 0.8, 12, false);
  return c.geometria();
}

export function construirEntorno(
  comuns: Comuns,
  opcoes: { reduzido: boolean; lampadasDaTorre: readonly Lampada[]; arvoresDoTerraco: readonly { x: number; y: number; z: number; altura: number; raio: number }[] },
): Entorno {
  const { caixas, telhados, arvores, postes, farol } = paisagem();
  const grupo = new Group();
  grupo.name = 'entorno';
  const materiais: Material[] = [];
  const geometrias: BufferGeometry[] = [];
  const guardar = <G extends BufferGeometry>(g: G) => {
    geometrias.push(g);
    return g;
  };
  const m = new Matrix4();
  const q = new Quaternion();
  const s = new Vector3();
  const p = new Vector3();
  const eixoY = new Vector3(0, 1, 0);

  // ------------------------------------------------------------------ céu
  const materialCeu = materialDoCeu(comuns);
  materiais.push(materialCeu);
  const ceu = new Mesh(guardar(new SphereGeometry(4500, 32, 16)), materialCeu);
  ceu.name = 'ceu';
  ceu.renderOrder = -10;
  ceu.frustumCulled = false;
  grupo.add(ceu);

  // ----------------------------------------------------------------- chão
  const materialDoChao = padrao(comuns, 'chao', { vertexColors: true, roughness: 0.96, metalness: 0 });
  materiais.push(materialDoChao);
  const chao = new Mesh(guardar(geometriaDoChao()), materialDoChao);
  chao.name = 'chao';
  chao.receiveShadow = true;
  grupo.add(chao);
  const quadDoLote = (tinta: Rgb) => {
    const c = new Construtor({ cor: true });
    c.pintar(tinta).quad([LOTE.xMin, 0.08, LOTE.zMax], [LOTE.xMax, 0.08, LOTE.zMax], [LOTE.xMax, 0.08, LOTE.zMin], [LOTE.xMin, 0.08, LOTE.zMin], [0, 1, 0]);
    // Calçada em volta, um pouco mais alta.
    c.pintar(PALETA_DO_CHAO.calcada).quad([LOTE.xMin, 0.1, LOTE.zMin], [LOTE.xMax, 0.1, LOTE.zMin], [LOTE.xMax, 0.1, LOTE.zMin - 3], [LOTE.xMin, 0.1, LOTE.zMin - 3], [0, 1, 0]);
    const malha = new Mesh(guardar(c.geometria()), materialDoChao);
    malha.receiveShadow = true;
    grupo.add(malha);
    return malha;
  };
  const praca = quadDoLote(PALETA_DO_CHAO.praca);
  praca.name = 'praca';
  const terra = quadDoLote(PALETA_DO_CHAO.lote);
  terra.name = 'terra';
  terra.visible = false;

  // ----------------------------------------------------------------- água
  const materialAgua = materialDaAgua(comuns);
  materiais.push(materialAgua);
  const agua = new Mesh(guardar(geometriaDaAgua()), materialAgua);
  agua.name = 'agua';
  grupo.add(agua);

  // --------------------------------------------------------------- morros
  const materialMorro = padrao(comuns, 'morros', { vertexColors: true, roughness: 0.95, metalness: 0 });
  materiais.push(materialMorro);
  const morros = new Mesh(guardar(geometriaDosMorros()), materialMorro);
  morros.name = 'morros';
  grupo.add(morros);

  // -------------------------------------------------------------- prédios
  const desenhadas = caixas.filter((c) => c.tipo !== 'embasamento' && !(opcoes.reduzido && c.tipo === 'fundo' && Math.hypot(c.min[0], c.min[2]) > 1500));
  const caixaUnitaria = guardar(new BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
  const janela = new Float32Array(desenhadas.length * 4);
  const estilo = new Float32Array(desenhadas.length * 2);
  caixaUnitaria.setAttribute('aJanela', new InstancedBufferAttribute(janela, 4));
  caixaUnitaria.setAttribute('aEstilo', new InstancedBufferAttribute(estilo, 2));
  const materialPredios = materialDosPredios(comuns);
  materiais.push(materialPredios);
  const predios = new InstancedMesh(caixaUnitaria, materialPredios, desenhadas.length);
  predios.name = 'predios';
  const tom = new Color();
  desenhadas.forEach((c, i) => {
    const e = ESTILOS[c.tipo];
    p.set((c.min[0] + c.max[0]) / 2, c.min[1], (c.min[2] + c.max[2]) / 2);
    s.set(c.max[0] - c.min[0], c.max[1] - c.min[1], c.max[2] - c.min[2]);
    m.compose(p, q.identity(), s);
    predios.setMatrixAt(i, m);
    tom.set(e.cores[c.semente % e.cores.length]!);
    predios.setColorAt(i, tom);
    janela.set([e.andar, e.modulo, e.acesas * (0.7 + ((c.semente >> 4) % 60) / 100), (c.semente % 997) + 0.5], i * 4);
    estilo.set([e.terreo, e.tipo], i * 2);
  });
  predios.castShadow = true;
  predios.receiveShadow = true;
  predios.computeBoundingSphere();
  grupo.add(predios);

  // ------------------------------------------------------------- telhados
  const materialTelhado = padrao(comuns, 'telhados', { roughness: 0.88, metalness: 0 });
  materiais.push(materialTelhado);
  const telhado = new InstancedMesh(guardar(geometriaDoTelhado()), materialTelhado, telhados.length);
  telhado.name = 'telhados';
  const coresDoTelhado = ['#7a5d50', '#6e5a4e', '#6a6763', '#7c6656', '#5f5c58'];
  telhados.forEach((t, i) => {
    p.set((t.min[0] + t.max[0]) / 2, t.min[1], (t.min[2] + t.max[2]) / 2);
    const comprimento = t.cumeeiraEmX ? t.max[0] - t.min[0] : t.max[2] - t.min[2];
    const largura = t.cumeeiraEmX ? t.max[2] - t.min[2] : t.max[0] - t.min[0];
    q.setFromAxisAngle(eixoY, t.cumeeiraEmX ? 0 : Math.PI / 2);
    s.set(comprimento, t.max[1] - t.min[1], largura);
    m.compose(p, q, s);
    telhado.setMatrixAt(i, m);
    telhado.setColorAt(i, tom.set(coresDoTelhado[i % coresDoTelhado.length]!));
  });
  telhado.receiveShadow = true;
  telhado.computeBoundingSphere();
  grupo.add(telhado);

  // ---------------------------------------------------------------- copas
  // As de perto projetam sombra; as de longe não (a sombra delas cairia fora do mapa de sombra).
  const sorte = sorteador(9);
  const RAIO_DAS_SOMBRAS = 170;
  const daRua = arvores.filter((a) => a.tipo === 'copa' && !a.noLote).filter((a, i) => !opcoes.reduzido || a.z < PARQUE.zMin || i % 2 === 0);
  const perto = daRua.filter((a) => Math.hypot(a.x, a.z) < RAIO_DAS_SOMBRAS);
  const longe = daRua.filter((a) => Math.hypot(a.x, a.z) >= RAIO_DAS_SOMBRAS);
  const doLote = [
    ...arvores.filter((a) => a.tipo === 'copa' && a.noLote).map((a) => ({ x: a.x, y: 0, z: a.z, altura: a.altura, raio: a.raio })),
    ...opcoes.arvoresDoTerraco,
  ];
  const materialCopa = padrao(comuns, 'copas', { vertexColors: true, roughness: 0.92, metalness: 0 });
  materiais.push(materialCopa);
  const geometriaCopa = guardar(geometriaDaCopa(!opcoes.reduzido));
  const plantarEm = (malha: InstancedMesh, n: number, x: number, y: number, z: number, altura: number, raio: number) => {
    p.set(x, y, z);
    q.setFromAxisAngle(eixoY, sorte() * Math.PI * 2);
    s.set(raio, altura, raio);
    m.compose(p, q, s);
    malha.setMatrixAt(n, m);
    const k = 0.82 + sorte() * 0.36;
    malha.setColorAt(n, tom.setRGB(k * (0.95 + sorte() * 0.1), k, k * (0.85 + sorte() * 0.15)));
  };
  const totalDeCopas = perto.length + doLote.length;
  const copas = new InstancedMesh(geometriaCopa, materialCopa, totalDeCopas);
  copas.name = 'copas';
  perto.forEach((a, i) => plantarEm(copas, i, a.x, 0, a.z, a.altura, a.raio));
  doLote.forEach((a, i) => plantarEm(copas, perto.length + i, a.x, a.y, a.z, a.altura, a.raio));
  copas.castShadow = true;
  copas.receiveShadow = true;
  copas.computeBoundingSphere();
  grupo.add(copas);
  const copasLonge = new InstancedMesh(geometriaCopa, materialCopa, longe.length);
  copasLonge.name = 'copas-longe';
  longe.forEach((a, i) => plantarEm(copasLonge, i, a.x, 0, a.z, a.altura, a.raio));
  copasLonge.receiveShadow = true;
  copasLonge.computeBoundingSphere();
  grupo.add(copasLonge);

  // ------------------------------------------------------------ palmeiras
  const palmas = arvores.filter((a) => a.tipo === 'palmeira').filter((_, i) => !opcoes.reduzido || i % 2 === 0);
  const materialPalmeira = padrao(comuns, 'palmeiras', { vertexColors: true, roughness: 0.9, metalness: 0, side: DoubleSide });
  materiais.push(materialPalmeira);
  const palmeiras = new InstancedMesh(guardar(geometriaDaPalmeira()), materialPalmeira, palmas.length);
  palmeiras.name = 'palmeiras';
  palmas.forEach((a, i) => {
    p.set(a.x, 0, a.z);
    q.setFromAxisAngle(eixoY, sorte() * Math.PI * 2);
    s.setScalar(a.altura);
    m.compose(p, q, s);
    palmeiras.setMatrixAt(i, m);
  });
  palmeiras.computeBoundingSphere();
  grupo.add(palmeiras);

  // ---------------------------------------------------------------- postes
  const materialPoste = materialComBrilho(comuns, 'postes', { color: new Color('#3a3d3a'), roughness: 0.55, metalness: 0.4 }, {
    atributo: 'aAceso', cor: new Color('#ffd9a8'), forca: 3.2,
  });
  materiais.push(materialPoste);
  const poste = new InstancedMesh(guardar(geometriaDoPoste()), materialPoste, postes.length);
  poste.name = 'postes';
  postes.forEach((ponto, i) => {
    p.set(ponto.x, 0, ponto.z);
    q.setFromAxisAngle(eixoY, ponto.braco);
    s.setScalar(ponto.altura / 9);
    m.compose(p, q, s);
    poste.setMatrixAt(i, m);
  });
  poste.computeBoundingSphere();
  grupo.add(poste);

  // ----------------------------------------------------------------- luzes
  type Luz = { x: number; y: number; z: number; tamanho: number; cor: Rgb; tipo: 0 | 1 | 2 };
  const listaDeLuzes: Luz[] = [];
  const sodio: Rgb = [1, 0.72, 0.42];
  for (const ponto of postes) {
    const k = ponto.altura / 9;
    const hx = ponto.x + Math.cos(ponto.braco) * 1.7 * k;
    const hz = ponto.z - Math.sin(ponto.braco) * 1.7 * k;
    listaDeLuzes.push({ x: hx, y: 0.14, z: hz, tamanho: 9 * k, cor: [sodio[0] * 0.28, sodio[1] * 0.28, sodio[2] * 0.28], tipo: 0 });
    listaDeLuzes.push({ x: hx, y: 8.7 * k, z: hz, tamanho: 1.5 * k, cor: sodio, tipo: 1 });
  }
  for (const l of opcoes.lampadasDaTorre) listaDeLuzes.push({ ...l, tipo: 1 });
  listaDeLuzes.push({ x: farol.x, y: farol.base + farol.altura - 1.9, z: farol.z, tamanho: 9, cor: [1, 0.92, 0.75], tipo: 2 });
  const quadDaLuz = guardar(new PlaneGeometry(1, 1));
  const corDaLuz = new Float32Array(listaDeLuzes.length * 3);
  const tipoDaLuz = new Float32Array(listaDeLuzes.length);
  quadDaLuz.setAttribute('aCorDaLuz', new InstancedBufferAttribute(corDaLuz, 3));
  quadDaLuz.setAttribute('aTipo', new InstancedBufferAttribute(tipoDaLuz, 1));
  const materialLuzes = materialDasLuzes(comuns);
  materiais.push(materialLuzes);
  const luzes = new InstancedMesh(quadDaLuz, materialLuzes, listaDeLuzes.length);
  luzes.name = 'luzes';
  const deitado = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
  listaDeLuzes.forEach((l, i) => {
    p.set(l.x, l.y, l.z);
    s.setScalar(l.tamanho);
    m.compose(p, l.tipo === 0 ? deitado : q.identity(), s);
    luzes.setMatrixAt(i, m);
    corDaLuz.set(l.cor, i * 3);
    tipoDaLuz[i] = l.tipo;
  });
  luzes.renderOrder = 5;
  luzes.frustumCulled = false;
  grupo.add(luzes);

  for (const objeto of grupo.children) objeto.layers.set(CAMADA.entorno);

  return {
    grupo,
    ceu,
    predios,
    copas,
    copasDoLote: doLote.length,
    praca,
    terra,
    luzes,
    materiais,
    geometrias,
    obra(ativa) {
      praca.visible = !ativa;
      terra.visible = ativa;
      copas.count = ativa ? totalDeCopas - doLote.length : totalDeCopas;
    },
    descartar() {
      for (const g of geometrias) g.dispose();
      for (const objeto of [predios, telhado, copas, copasLonge, palmeiras, poste, luzes]) objeto.dispose();
    },
  };
}

/** As árvores pequenas das jardineiras do terraço do embasamento (paisagismo do lote). */
export function arvoresDoTerraco(): { x: number; y: number; z: number; altura: number; raio: number }[] {
  const lista: { x: number; y: number; z: number; altura: number; raio: number }[] = [];
  for (const x of [-13.5, -9, -4.5, 4.5, 9, 13.5]) {
    lista.push({ x, y: 8.3, z: -12.4, altura: 2.6, raio: 0.95 });
    lista.push({ x, y: 8.3, z: 12.4, altura: 2.4, raio: 0.9 });
  }
  for (const z of [-7, 0, 7]) {
    lista.push({ x: -15.4, y: 8.3, z, altura: 2.5, raio: 0.9 });
    lista.push({ x: 15.4, y: 8.3, z, altura: 2.3, raio: 0.85 });
  }
  return lista;
}
