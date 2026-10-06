import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { blocosDaPlanta, type BlocoNaPlanta } from '@/lib/torrelio/paredes';
import { DIMENSOES_DOS_MOVEIS, IDS_DOS_COMODOS, PLANTA, type Ponto } from '@/lib/torrelio/planta';
import { cotasDesenhadas, folhaDaPorta, trechoNaParede } from '../desenho';

/**
 * A arquitetura da maquete, construída de `planta.ts` e `paredes.ts`. O desenho tem x para a
 * direita e y para baixo; no 3D, y do desenho vira z, e o apartamento fica centrado na origem
 * (para o espelho do final 03, `scale.x = −1`, girar em volta do meio).
 */

export const CENTRO_DO_DESENHO: Ponto = [3.9, 2.65];
export const paraMundo = (x: number, y: number) => [x - CENTRO_DO_DESENHO[0], y - CENTRO_DO_DESENHO[1]] as const;

const linear = (hex: number) => new T.Color().setHex(hex, T.SRGBColorSpace);
export const CORES = {
  parede: linear(0xecebe4),
  aco: linear(0x30352d),
  pisoSeco: linear(0xd9d2c4),
  pisoMolhado: linear(0xcfd1cb),
  deque: linear(0xb9ad99),
  linhaEscura: linear(0x30352d),
  linhaClara: linear(0xa5ada1),
} as const;

const MOLHADOS = new Set(['cozinha', 'servico', 'banho-suite', 'banho-social']);

function pintar(g: T.BufferGeometry, cor: T.Color): T.BufferGeometry {
  const n = g.getAttribute('position').count;
  const cores = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 1) cores.set([cor.r, cor.g, cor.b], i * 3);
  g.setAttribute('color', new T.BufferAttribute(cores, 3));
  return g;
}

function comAtributo(g: T.BufferGeometry, nome: string, valor: number): T.BufferGeometry {
  g.setAttribute(nome, new T.BufferAttribute(new Float32Array(g.getAttribute('position').count).fill(valor), 1));
  return g;
}

/** Caixa de um bloco de parede, no lugar, com o topo de aço quando o bloco é cortado. */
function caixaDoBloco(b: BlocoNaPlanta, comTopoDeAco: boolean): T.BufferGeometry {
  const g = new T.BoxGeometry(b.comprimento, b.altura, b.espessura).toNonIndexed();
  g.deleteAttribute('uv');
  pintar(g, CORES.parede);
  if (comTopoDeAco && b.cortada) {
    // Na BoxGeometry, a face +y são os vértices 12 a 17 (depois de desindexar).
    const cor = g.getAttribute('color') as T.BufferAttribute;
    for (let i = 12; i < 18; i += 1) cor.setXYZ(i, CORES.aco.r, CORES.aco.g, CORES.aco.b);
  }
  comAtributo(g, 'aBase', b.base);
  g.rotateY(-b.angulo);
  const [x, z] = paraMundo(b.centro[0], b.centro[1]);
  g.translate(x, b.centro[2], z);
  return g;
}

/** As paredes da maquete, cortadas a 2,20 m. O shader baixa todas juntas para a planta. */
export function geometriaDasParedes(): T.BufferGeometry {
  return mergeGeometries(blocosDaPlanta(PLANTA.alturaDoCorte).map((b) => caixaDoBloco(b, true)), false)!;
}

/**
 * Só para a sombra do sol: paredes inteiras até o teto e a laje de cima. Ficam numa camada que a
 * câmera não vê; assim a luz entra só pelas janelas e portas, como num apartamento de verdade.
 */
export function geometriaDaSombra(): T.BufferGeometry {
  const paredes = blocosDaPlanta(PLANTA.peDireito).map((b) => {
    const g = caixaDoBloco(b, false);
    g.deleteAttribute('color');
    g.deleteAttribute('aBase');
    return g;
  });
  const teto = new T.ExtrudeGeometry(formaDoPoligono(PLANTA.contorno), { depth: 0.14, bevelEnabled: false });
  teto.deleteAttribute('uv');
  teto.rotateX(-Math.PI / 2);
  teto.translate(0, PLANTA.peDireito, 0);
  return mergeGeometries([...paredes, teto], false)!;
}

function formaDoPoligono(poligono: readonly Ponto[]): T.Shape {
  // A forma fica no plano XY; ao girar −90° em x, o y da forma vira −z: por isso o sinal.
  return new T.Shape(poligono.map(([x, y]) => new T.Vector2(...[paraMundo(x, y)[0], -paraMundo(x, y)[1]] as [number, number])));
}

/** Os pisos de todos os cômodos numa malha, com `aComodo` (índice) para o destaque no shader. */
export function geometriaDosPisos(): T.BufferGeometry {
  const pecas = PLANTA.comodos.map((c, i) => {
    const g = new T.ShapeGeometry(formaDoPoligono(c.poligono)).toNonIndexed();
    g.deleteAttribute('uv');
    g.rotateX(-Math.PI / 2);
    pintar(g, c.id === 'varanda' ? CORES.deque : MOLHADOS.has(c.id) ? CORES.pisoMolhado : CORES.pisoSeco);
    return comAtributo(g, 'aComodo', i);
  });
  return mergeGeometries(pecas, false)!;
}

/** A laje sob o apartamento: o contorno da área privativa, com 18 cm de espessura. */
export function geometriaDaLaje(): T.BufferGeometry {
  const g = new T.ExtrudeGeometry(formaDoPoligono(PLANTA.contorno), { depth: 0.18, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -0.183, 0);
  return g;
}

/** Vidros: janelas, portas de correr e o guarda-corpo da varanda (baixam junto com as paredes). */
export function geometriaDosVidros(extras: readonly T.BufferGeometry[]): T.BufferGeometry {
  const pecas: T.BufferGeometry[] = [];
  for (const a of PLANTA.aberturas.filter((x) => x.tipo === 'janela' || x.tipo === 'porta-de-correr')) {
    const [p0, p1] = trechoNaParede(a, a.centro - a.largura / 2, a.centro + a.largura / 2);
    pecas.push(painel(p0, p1, a.peitoril, a.peitoril + a.altura));
  }
  const borda = PLANTA.guardaCorpo;
  for (let i = 1; i < borda.length; i += 1) pecas.push(painel(borda[i - 1]!, borda[i]!, 0.02, PLANTA.alturaDoGuardaCorpo));
  const todas = [...pecas, ...extras].map((g) => {
    const n = g.index ? g.toNonIndexed() : g;
    n.deleteAttribute('uv');
    return comAtributo(n, 'aBase', 0);
  });
  return mergeGeometries(todas, false)!;
}

/** Uma folha de vidro de `de` a `ate` (desenho), entre duas alturas. */
function painel(de: Ponto, ate: Ponto, base: number, topo: number): T.BufferGeometry {
  const [x0, z0] = paraMundo(de[0], de[1]);
  const [x1, z1] = paraMundo(ate[0], ate[1]);
  const comprimento = Math.hypot(x1 - x0, z1 - z0);
  const angulo = Math.atan2(z1 - z0, x1 - x0);
  const g = new T.BoxGeometry(comprimento, topo - base, 0.012);
  g.translate(0, (base + topo) / 2, 0);
  g.rotateY(-angulo);
  g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  return g;
}

/**
 * As linhas da planta, numa chamada só, com cor por vértice: folhas e arcos de porta, vidros e o
 * guarda-corpo em aço (sobre o piso claro) e as cotas em mineral (sobre o fundo escuro).
 */
export function geometriaDasLinhas(): T.BufferGeometry {
  const pontos: number[] = [];
  const cores: number[] = [];
  const segmento = (a: Ponto, b: Ponto, y: number, cor: T.Color) => {
    const [ax, az] = paraMundo(a[0], a[1]);
    const [bx, bz] = paraMundo(b[0], b[1]);
    pontos.push(ax, y, az, bx, y, bz);
    cores.push(cor.r, cor.g, cor.b, cor.r, cor.g, cor.b);
  };
  const ALTURA = 0.135;
  for (const a of PLANTA.aberturas) {
    const folha = folhaDaPorta(a);
    if (folha) {
      segmento(folha.dobradica, folha.aberta, ALTURA, CORES.linhaEscura);
      const inicio = Math.atan2(folha.fechada[1] - folha.dobradica[1], folha.fechada[0] - folha.dobradica[0]);
      const fim = Math.atan2(folha.aberta[1] - folha.dobradica[1], folha.aberta[0] - folha.dobradica[0]);
      let delta = fim - inicio;
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      const passos = 14;
      for (let i = 0; i < passos; i += 1) {
        const t0 = inicio + (delta * i) / passos;
        const t1 = inicio + (delta * (i + 1)) / passos;
        const ponto = (t: number): Ponto => [folha.dobradica[0] + Math.cos(t) * folha.raio, folha.dobradica[1] + Math.sin(t) * folha.raio];
        segmento(ponto(t0), ponto(t1), 0.02, CORES.linhaEscura);
      }
    }
    if (a.tipo === 'janela' || a.tipo === 'porta-de-correr') {
      for (const desvio of [-0.025, 0.025]) {
        const [p0, p1] = trechoNaParede(a, a.centro - a.largura / 2, a.centro + a.largura / 2, desvio);
        segmento(p0, p1, ALTURA, CORES.linhaEscura);
      }
    }
  }
  for (const { de, ate, vertical } of cotasDesenhadas()) {
    segmento(de, ate, -0.17, CORES.linhaClara);
    for (const p of [de, ate]) {
      segmento([p[0] - 0.09, p[1] + 0.09], [p[0] + 0.09, p[1] - 0.09], -0.17, CORES.linhaClara);
      segmento(vertical ? [p[0] - 0.12, p[1]] : [p[0], p[1] - 0.12], vertical ? [p[0] + 0.3, p[1]] : [p[0], p[1] + 0.3], -0.17, CORES.linhaClara);
    }
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pontos, 3));
  g.setAttribute('color', new T.Float32BufferAttribute(cores, 3));
  return g;
}

/** O contorno de cada cômodo (1 px), com `aComodo`: o shader mostra só o do cômodo em foco. */
export function geometriaDosContornos(): T.BufferGeometry {
  const pontos: number[] = [];
  const indices: number[] = [];
  PLANTA.comodos.forEach((c, i) => {
    c.poligono.forEach((p, k) => {
      const q = c.poligono[(k + 1) % c.poligono.length]!;
      const [ax, az] = paraMundo(p[0], p[1]);
      const [bx, bz] = paraMundo(q[0], q[1]);
      pontos.push(ax, 0.018, az, bx, 0.018, bz);
      indices.push(i, i);
    });
  });
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pontos, 3));
  g.setAttribute('aComodo', new T.Float32BufferAttribute(indices, 1));
  return g;
}

/** Onde vão as sombras de contato: sob cada móvel e ao pé de cada parede (centro, tamanho, giro). */
export function sombrasDeContato(): { x: number; z: number; largura: number; profundidade: number; angulo: number }[] {
  const lista = PLANTA.moveis
    .filter((m) => m.tipo !== 'tapete')
    .map((m) => {
      const { largura, profundidade } = DIMENSOES_DOS_MOVEIS[m.tipo];
      const [x, z] = paraMundo(m.posicao[0], m.posicao[1]);
      return { x, z, largura: largura + 0.22, profundidade: profundidade + 0.22, angulo: (-m.rotacao * Math.PI) / 180 };
    });
  for (const b of blocosDaPlanta(PLANTA.alturaDoCorte).filter((x) => x.base === 0)) {
    const [x, z] = paraMundo(b.centro[0], b.centro[1]);
    lista.push({ x, z, largura: b.comprimento + 0.1, profundidade: b.espessura + 0.34, angulo: -b.angulo });
  }
  return lista;
}

/** Textura do degradê das sombras de contato: retângulo de cantos suaves, preto com alfa. */
export function texturaDaSombra(): T.CanvasTexture {
  const tela = document.createElement('canvas');
  tela.width = 64;
  tela.height = 64;
  const ctx = tela.getContext('2d')!;
  const imagem = ctx.createImageData(64, 64);
  for (let y = 0; y < 64; y += 1) {
    for (let x = 0; x < 64; x += 1) {
      const dx = Math.max(0, Math.abs(x - 31.5) - 14) / 18;
      const dy = Math.max(0, Math.abs(y - 31.5) - 14) / 18;
      const a = Math.max(0, 1 - Math.hypot(dx, dy));
      imagem.data[(y * 64 + x) * 4 + 3] = Math.round(255 * a * a);
    }
  }
  ctx.putImageData(imagem, 0, 0);
  const textura = new T.CanvasTexture(tela);
  textura.colorSpace = T.NoColorSpace;
  return textura;
}

export const INDICE_DO_COMODO = new Map(IDS_DOS_COMODOS.map((id, i) => [id, i] as const));
