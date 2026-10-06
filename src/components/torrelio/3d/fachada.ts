import {
  BufferGeometry, Float32BufferAttribute, InstancedBufferAttribute, InstancedMesh, Matrix4, PlaneGeometry, Quaternion, ShapeUtils, Vector2,
  Vector3, type Material,
} from 'three';
import { LUZ } from '@/lib/torrelio/luz';
import {
  cota, geometriaDoVao, itensDoModo, LARGURA_DO_VAO, mapaDeVaos, PISO_A_PISO, TORRE, TOTAL_DE_VAOS, vaoDoIndice, VIDRO,
} from '@/lib/torrelio/predio';
import type { Fachada, Modo } from '@/lib/torrelio/tipos';
import { CAMADA, CONTORNO_DA_LAJE, fachadaEfetiva, type Forro } from './torre';

/**
 * A fachada viva: o vidro dos 480 vãos (uma chamada), os halos das janelas acesas (uma chamada,
 * com o mesmo atributo de luz), o contorno das disponíveis com o marcador da selecionada (uma
 * chamada) e o anel da laje com a faixa do andar em destaque (uma chamada).
 *
 * A luz de cada vão é animada no shader a partir de três números por instância (alvo, anterior,
 * início): a CPU só escreve quando algo muda. Uma mudança isolada acende em 400 ms; um lote
 * cascateia de baixo para cima, 90 ms por andar; sem movimento, é instantâneo.
 */

/** O nível de luz de cada valor de `LUZ`. */
export const NIVEL_DA_LUZ: Readonly<Record<number, number>> = {
  [LUZ.apagada]: 0,
  [LUZ.baixa]: 0.3,
  [LUZ.acesa]: 1,
  [LUZ.bloqueada]: 0,
};

export const DURACAO_DA_LUZ = 0.4;
export const PASSO_DA_CASCATA = 0.09;

const ROTACAO: Readonly<Record<Fachada, Quaternion>> = {
  sul: new Quaternion(),
  norte: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI),
  leste: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2),
  oeste: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2),
};

const NORMAL: Readonly<Record<Fachada, readonly [number, number]>> = { norte: [0, -1], sul: [0, 1], leste: [1, 0], oeste: [-1, 0] };

function hash(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

/** Um retângulo de contorno: um trecho de fachada de uma unidade, em um ou dois pavimentos. */
export type Retangulo = {
  dono: number;
  fachada: Fachada;
  /** Centro, no plano do vidro. */
  centro: [number, number, number];
  largura: number;
  altura: number;
};

/** Os retângulos de contorno de cada dono, no modo. */
export function retangulosDoModo(modo: Modo): Retangulo[] {
  const lista: Retangulo[] = [];
  for (const item of itensDoModo(modo)) {
    const p0 = Math.min(...item.pavimentos);
    const p1 = Math.max(...item.pavimentos);
    const y0 = cota(p0) + VIDRO.acimaDaLaje;
    const y1 = cota(p1) + PISO_A_PISO - VIDRO.abaixoDaViga;
    for (const { fachada, de, ate } of item.trechos) {
      const largura = (ate - de) * LARGURA_DO_VAO[fachada];
      const inicio = (fachada === 'norte' || fachada === 'sul' ? -TORRE.largura : -TORRE.profundidade) / 2 + de * LARGURA_DO_VAO[fachada];
      const meio = inicio + largura / 2;
      const [nx, nz] = NORMAL[fachada];
      const centro: [number, number, number] = fachada === 'norte' || fachada === 'sul'
        ? [meio, (y0 + y1) / 2, (nz * TORRE.profundidade) / 2]
        : [(nx * TORRE.largura) / 2, (y0 + y1) / 2, meio];
      lista.push({ dono: item.indice, fachada, centro, largura, altura: y1 - y0 });
    }
  }
  return lista;
}

/** O anel: uma fita vertical de altura 1 em volta do contorno da laje, um pouco para fora. */
function geometriaDoAnel(afastamento: number): BufferGeometry {
  const pontos = ShapeUtils.isClockWise(CONTORNO_DA_LAJE.map(([x, z]) => new Vector2(x, z))) ? [...CONTORNO_DA_LAJE].reverse() : [...CONTORNO_DA_LAJE];
  const n = pontos.length;
  const normalDa = (i: number) => {
    const [xa, za] = pontos[i % n]!;
    const [xb, zb] = pontos[(i + 1) % n]!;
    const l = Math.hypot(xb - xa, zb - za);
    return [(zb - za) / l, -(xb - xa) / l] as const;
  };
  const deslocados = pontos.map(([x, z], i) => {
    const a = normalDa((i + n - 1) % n);
    const b = normalDa(i);
    const igual = Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
    return igual ? [x + a[0] * afastamento, z + a[1] * afastamento] : [x + (a[0] + b[0]) * afastamento, z + (a[1] + b[1]) * afastamento];
  });
  const posicoes: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i < n; i += 1) {
    const [xa, za] = deslocados[i]!;
    const [xb, zb] = deslocados[(i + 1) % n]!;
    const base = posicoes.length / 3;
    posicoes.push(xa!, 0, za!, xb!, 0, zb!, xb!, 1, zb!, xa!, 1, za!);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(posicoes, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeBoundingSphere();
  return g;
}

export type FachadaViva = {
  vidro: InstancedMesh;
  halos: InstancedMesh;
  contornos: InstancedMesh;
  anel: InstancedMesh;
  /** O dono (unidade ou quarto) de um vão, no modo atual. */
  donoDoVao(vao: number): number;
  /**
   * Troca as luzes. `jeito`: 'instantaneo' (sem movimento), 'fade' (uma unidade, 400 ms),
   * 'cascata' (lote, de baixo para cima) ou 'onda' (troca de modo: a fachada apaga e reacende
   * andar por andar). Devolve quando a animação termina, no relógio da cena.
   */
  aplicarLuzes(luzes: Uint8Array, agora: number, jeito: 'instantaneo' | 'fade' | 'cascata' | 'onda'): number;
  definirModo(modo: Modo): void;
  aplicarDisponiveis(disponiveis: Uint8Array, luzes: Uint8Array): void;
  selecionar(indice: number | null): void;
  destacarAndar(pavimento: number | null): void;
  recortar(obra: { estruturaAte: number; fachadaAte: number } | null): void;
  /** Os retângulos do dono (para o marcador na tela e para "mostrar unidade"). */
  retangulos(dono: number): readonly Retangulo[];
  descartar(): void;
};

export function construirFachada(
  materiais: { vidro: Material; halos: Material; contorno: Material; anel: Material },
  forros: readonly Forro[],
  luzDoForro: Float32BufferAttribute,
  halosLigados: boolean,
): FachadaViva {
  // ---------------------------------------------------------------- vidro
  const plano = new PlaneGeometry(1, 1);
  const vidro = new InstancedMesh(plano, materiais.vidro, TOTAL_DE_VAOS);
  vidro.name = 'vidro';
  const luz = new Float32Array(TOTAL_DE_VAOS * 4);
  const atributoDeLuz = new InstancedBufferAttribute(luz, 4);
  const dono = new Float32Array(TOTAL_DE_VAOS);
  const atributoDeDono = new InstancedBufferAttribute(dono, 1);
  plano.setAttribute('aLuz', atributoDeLuz);
  plano.setAttribute('aDono', atributoDeDono);
  const m = new Matrix4();
  const escala = new Vector3();
  const posicao = new Vector3();
  for (let i = 0; i < TOTAL_DE_VAOS; i += 1) {
    const g = geometriaDoVao(i);
    posicao.set(g.centro[0], g.centro[1], g.centro[2]);
    escala.set(g.largura, g.altura, 1);
    m.compose(posicao, ROTACAO[g.fachada], escala);
    vidro.setMatrixAt(i, m);
    luz[i * 4 + 2] = -1e6;
    luz[i * 4 + 3] = hash(i * 7 + 3);
  }
  vidro.layers.set(CAMADA.torre);
  vidro.castShadow = true;
  vidro.computeBoundingSphere();

  // ---------------------------------------------------------------- halos
  const quadDoHalo = new PlaneGeometry(1, 1);
  quadDoHalo.setAttribute('aLuz', atributoDeLuz);
  const halos = new InstancedMesh(quadDoHalo, materiais.halos, TOTAL_DE_VAOS);
  halos.name = 'halos';
  for (let i = 0; i < TOTAL_DE_VAOS; i += 1) {
    const g = geometriaDoVao(i);
    posicao.set(g.centro[0] + g.normal[0] * 0.32, g.centro[1], g.centro[2] + g.normal[2] * 0.32);
    escala.set(g.largura * 1.55, g.altura * 1.6, 1);
    m.compose(posicao, ROTACAO[g.fachada], escala);
    halos.setMatrixAt(i, m);
  }
  halos.layers.set(CAMADA.torre);
  halos.renderOrder = 4;
  halos.frustumCulled = false;
  halos.visible = halosLigados;

  // ------------------------------------------------------------- contornos
  const porModo: Record<Modo, Retangulo[]> = { incorporadora: retangulosDoModo('incorporadora'), hotel: retangulosDoModo('hotel') };
  const capacidade = Math.max(porModo.incorporadora.length, porModo.hotel.length);
  const quadDoContorno = new PlaneGeometry(1, 1);
  const tamanho = new InstancedBufferAttribute(new Float32Array(capacidade * 2), 2);
  const donoDoContorno = new InstancedBufferAttribute(new Float32Array(capacidade), 1);
  const estado = new InstancedBufferAttribute(new Float32Array(capacidade * 2), 2);
  quadDoContorno.setAttribute('aTamanho', tamanho);
  quadDoContorno.setAttribute('aDono', donoDoContorno);
  quadDoContorno.setAttribute('aEstado', estado);
  const contornos = new InstancedMesh(quadDoContorno, materiais.contorno, capacidade);
  contornos.name = 'contornos';
  contornos.layers.set(CAMADA.torre);
  contornos.renderOrder = 2;
  contornos.frustumCulled = false;

  // ------------------------------------------------------------------ anel
  const anel = new InstancedMesh(geometriaDoAnel(0.03), materiais.anel, 2);
  anel.name = 'anel';
  anel.layers.set(CAMADA.torre);
  anel.renderOrder = 3;
  anel.frustumCulled = false;
  const esconder = new Matrix4().makeScale(0, 0, 0);
  anel.setMatrixAt(0, esconder);
  anel.setMatrixAt(1, esconder);

  // --------------------------------------------------------------- estado
  let modo: Modo = 'incorporadora';
  let mapa = mapaDeVaos(modo);
  let retangulos = porModo[modo];
  const porDono = new Map<number, Retangulo[]>();
  const alvo = new Float32Array(TOTAL_DE_VAOS);

  const nivelEm = (i: number, t: number) => {
    const p = Math.min(1, Math.max(0, (t - luz[i * 4 + 2]!) / DURACAO_DA_LUZ));
    const s = p * p * (3 - 2 * p);
    return luz[i * 4 + 1]! + (luz[i * 4]! - luz[i * 4 + 1]!) * s;
  };

  const escreverForros = () => {
    const dados = luzDoForro.array as Float32Array;
    for (const forro of forros) {
      const i = forro.vao;
      for (let v = forro.de; v < forro.ate; v += 1) {
        dados[v * 3] = luz[i * 4]!;
        dados[v * 3 + 1] = luz[i * 4 + 1]!;
        dados[v * 3 + 2] = luz[i * 4 + 2]!;
      }
    }
    luzDoForro.needsUpdate = true;
  };

  const montarContornos = () => {
    porDono.clear();
    retangulos.forEach((r, i) => {
      const lista = porDono.get(r.dono) ?? [];
      lista.push(r);
      porDono.set(r.dono, lista);
      const [nx, nz] = NORMAL[r.fachada];
      posicao.set(r.centro[0] + nx * 0.24, r.centro[1], r.centro[2] + nz * 0.24);
      escala.set(r.largura, r.altura, 1);
      m.compose(posicao, ROTACAO[r.fachada], escala);
      contornos.setMatrixAt(i, m);
      tamanho.setXY(i, r.largura, r.altura);
      donoDoContorno.setX(i, r.dono);
    });
    contornos.count = retangulos.length;
    contornos.instanceMatrix.needsUpdate = true;
    tamanho.needsUpdate = true;
    donoDoContorno.needsUpdate = true;
    for (let i = 0; i < TOTAL_DE_VAOS; i += 1) dono[i] = mapa[i]!;
    atributoDeDono.needsUpdate = true;
  };
  montarContornos();

  return {
    vidro,
    halos,
    contornos,
    anel,
    donoDoVao: (vao) => mapa[vao] ?? -1,
    aplicarLuzes(luzes, agora, jeito) {
      let fim = agora;
      let pavimentoMinimo = Infinity;
      if (jeito === 'cascata') {
        for (let i = 0; i < TOTAL_DE_VAOS; i += 1) {
          const novo = NIVEL_DA_LUZ[luzes[mapa[i]!] ?? 0] ?? 0;
          if (novo !== luz[i * 4]) pavimentoMinimo = Math.min(pavimentoMinimo, vaoDoIndice(i).pavimento);
        }
      }
      for (let i = 0; i < TOTAL_DE_VAOS; i += 1) {
        const novo = NIVEL_DA_LUZ[luzes[mapa[i]!] ?? 0] ?? 0;
        alvo[i] = novo;
        if (jeito === 'instantaneo') {
          luz[i * 4] = novo;
          luz[i * 4 + 1] = novo;
          luz[i * 4 + 2] = -1e6;
          continue;
        }
        const pavimento = Math.floor(i / 24) + 2;
        if (jeito === 'onda') {
          const inicio = agora + (pavimento - 2) * PASSO_DA_CASCATA;
          luz[i * 4 + 1] = 0;
          luz[i * 4] = novo;
          luz[i * 4 + 2] = inicio;
          fim = Math.max(fim, inicio + DURACAO_DA_LUZ);
          continue;
        }
        if (novo === luz[i * 4]) continue;
        const inicio = jeito === 'cascata' ? agora + (pavimento - pavimentoMinimo) * PASSO_DA_CASCATA : agora;
        luz[i * 4 + 1] = nivelEm(i, inicio);
        luz[i * 4] = novo;
        luz[i * 4 + 2] = inicio;
        fim = Math.max(fim, inicio + DURACAO_DA_LUZ);
      }
      atributoDeLuz.needsUpdate = true;
      escreverForros();
      // Na hora: nada para animar (sem movimento, o relógio da cena nem anda).
      return jeito === 'instantaneo' ? Number.NEGATIVE_INFINITY : fim;
    },
    definirModo(novo) {
      modo = novo;
      mapa = mapaDeVaos(modo);
      retangulos = porModo[modo];
      montarContornos();
    },
    aplicarDisponiveis(disponiveis, luzes) {
      retangulos.forEach((r, i) => {
        estado.setXY(i, disponiveis[r.dono] === 1 ? 1 : 0, luzes[r.dono] === LUZ.bloqueada ? 1 : 0);
      });
      estado.needsUpdate = true;
    },
    selecionar(indice) {
      if (indice === null || !porDono.has(indice)) {
        anel.setMatrixAt(0, esconder);
      } else {
        const item = itensDoModo(modo)[indice]!;
        const p = Math.min(...item.pavimentos);
        m.makeScale(1, 0.07, 1).setPosition(0, cota(p) + VIDRO.acimaDaLaje - 0.075, 0);
        anel.setMatrixAt(0, m);
      }
      anel.instanceMatrix.needsUpdate = true;
    },
    destacarAndar(pavimento) {
      if (pavimento === null) anel.setMatrixAt(1, esconder);
      else anel.setMatrixAt(1, m.makeScale(1.002, PISO_A_PISO, 1.002).setPosition(0, cota(pavimento) - 0.38, 0));
      anel.instanceMatrix.needsUpdate = true;
    },
    recortar(obra) {
      const ate = fachadaEfetiva(obra);
      vidro.count = Math.max(0, (ate - 1) * 24);
      halos.count = vidro.count;
    },
    retangulos: (d) => porDono.get(d) ?? [],
    descartar() {
      plano.dispose();
      quadDoHalo.dispose();
      quadDoContorno.dispose();
      anel.geometry.dispose();
      vidro.dispose();
      halos.dispose();
      contornos.dispose();
      anel.dispose();
    },
  };
}
