import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { DIMENSOES_DOS_MOVEIS, type Movel } from '@/lib/torrelio/planta';

/**
 * O mobiliário de referência da maquete: volumes simples, de caixas e cilindros, com a cor em
 * cada vértice para tudo caber num material só (uma chamada de desenho). A frente de cada peça
 * olha para +z local, como a frente (+y) do desenho; o giro e o lugar vêm de `planta.ts`.
 */

const linear = (hex: number) => new T.Color().setHex(hex, T.SRGBColorSpace);

export const CORES_DOS_MOVEIS = {
  tecido: linear(0xb7b2a8),
  almofada: linear(0xcfcac0),
  madeira: linear(0xa48b70),
  madeiraClara: linear(0xc8b9a2),
  branco: linear(0xe6e5df),
  louca: linear(0xf1f0eb),
  escuro: linear(0x3b3f39),
  lencol: linear(0xe9e6de),
  manta: linear(0x9aa39a),
  tapete: linear(0xc4bdb0),
  vaso: linear(0x9c8f80),
  folha: linear(0x7b8a6c),
} as const;

/** Uma peça: caixa (ou cilindro) com centro em (x, y, z) local e uma cor. */
function peca(geometria: T.BufferGeometry, cor: T.Color, x: number, y: number, z: number): T.BufferGeometry {
  const g = geometria.index ? geometria.toNonIndexed() : geometria;
  if (g !== geometria) geometria.dispose();
  g.deleteAttribute('uv');
  g.translate(x, y, z);
  const cores = new Float32Array(g.getAttribute('position').count * 3);
  for (let i = 0; i < cores.length; i += 3) {
    cores[i] = cor.r;
    cores[i + 1] = cor.g;
    cores[i + 2] = cor.b;
  }
  g.setAttribute('color', new T.BufferAttribute(cores, 3));
  return g;
}

const caixa = (w: number, h: number, d: number, cor: T.Color, x: number, y0: number, z: number) =>
  peca(new T.BoxGeometry(w, h, d), cor, x, y0 + h / 2, z);
const cilindro = (r: number, h: number, cor: T.Color, x: number, y0: number, z: number, lados = 14) =>
  peca(new T.CylinderGeometry(r, r, h, lados), cor, x, y0 + h / 2, z);

function partes(m: Movel): T.BufferGeometry[] {
  const { largura: w, profundidade: d, altura: h } = DIMENSOES_DOS_MOVEIS[m.tipo];
  const c = CORES_DOS_MOVEIS;
  const fundo = -d / 2;
  switch (m.tipo) {
    case 'sofa':
      return [
        caixa(w, 0.4, d, c.tecido, 0, 0, 0),
        caixa(w, 0.42, 0.2, c.tecido, 0, 0.38, fundo + 0.1),
        caixa(0.17, 0.22, d, c.tecido, -w / 2 + 0.085, 0.4, 0),
        caixa(0.17, 0.22, d, c.tecido, w / 2 - 0.085, 0.4, 0),
        caixa(w / 2 - 0.2, 0.1, d - 0.26, c.almofada, -(w / 4 - 0.02), 0.4, 0.1),
        caixa(w / 2 - 0.2, 0.1, d - 0.26, c.almofada, w / 4 - 0.02, 0.4, 0.1),
      ];
    case 'mesa-de-jantar': {
      const lista = [caixa(1.2, 0.04, 0.8, c.madeira, 0, 0.71, 0)];
      for (const x of [-0.54, 0.54]) for (const z of [-0.34, 0.34]) lista.push(caixa(0.05, 0.71, 0.05, c.madeira, x, 0, z));
      for (const x of [-0.3, 0.3]) {
        for (const lado of [-1, 1]) {
          lista.push(caixa(0.42, 0.05, 0.4, c.madeiraClara, x, 0.42, lado * 0.55));
          lista.push(caixa(0.42, 0.42, 0.04, c.madeiraClara, x, 0.47, lado * 0.73));
        }
      }
      return lista;
    }
    case 'cama-casal':
    case 'cama-solteiro': {
      const travesseiros = m.tipo === 'cama-casal' ? [-w / 4, w / 4] : [0];
      return [
        caixa(w, 0.3, d, c.madeiraClara, 0, 0, 0),
        caixa(w - 0.04, 0.2, d - 0.06, c.lencol, 0, 0.3, 0.02),
        caixa(w + 0.06, 1.0, 0.06, c.madeira, 0, 0, fundo - 0.03),
        caixa(w - 0.02, 0.06, d * 0.58, c.manta, 0, 0.5, d / 2 - d * 0.29),
        ...travesseiros.map((x) => caixa(m.tipo === 'cama-casal' ? w / 2 - 0.14 : w - 0.2, 0.12, 0.34, c.almofada, x, 0.5, fundo + 0.26)),
      ];
    }
    case 'guarda-roupa':
      return [caixa(w, h, d, c.madeiraClara, 0, 0, 0), caixa(0.012, h - 0.12, 0.012, c.madeira, 0, 0.06, d / 2)];
    case 'bancada':
      return [caixa(w, 0.86, d, c.branco, 0, 0, 0), caixa(w, 0.04, d, c.escuro, 0, 0.86, 0)];
    case 'pia':
      return [caixa(w, 0.86, d, c.branco, 0, 0, 0), caixa(w, 0.04, d, c.madeiraClara, 0, 0.86, 0), caixa(w * 0.5, 0.02, d * 0.5, c.escuro, 0, 0.895, 0.02)];
    case 'geladeira':
      return [caixa(w, h, d, c.louca, 0, 0, 0), caixa(0.03, 0.5, 0.03, c.escuro, w / 2 - 0.08, 1.0, d / 2 + 0.015)];
    case 'vaso':
      return [caixa(0.36, 0.38, 0.18, c.louca, 0, 0.36, fundo + 0.09), cilindro(0.17, 0.4, c.louca, 0, 0, 0.08)];
    case 'box':
      return [caixa(w, 0.04, d, c.louca, 0, 0, 0)];
    case 'maquina':
      return [caixa(w, h, d, c.louca, 0, 0, 0), peca(new T.CylinderGeometry(0.19, 0.19, 0.02, 20).rotateX(Math.PI / 2), c.escuro, 0, 0.45, d / 2 + 0.01)];
    case 'tapete':
      return [caixa(w, 0.012, d, c.tapete, 0, 0, 0)];
    case 'planta':
      return [cilindro(0.17, 0.4, c.vaso, 0, 0, 0), peca(new T.IcosahedronGeometry(0.3, 0), c.folha, 0, 0.72, 0)];
    case 'mesa-da-varanda':
      return [
        cilindro(0.34, 0.03, c.madeira, 0, 0.72, 0, 24),
        cilindro(0.04, 0.72, c.escuro, 0, 0, 0),
        caixa(0.36, 0.05, 0.38, c.madeiraClara, -0.52, 0.42, 0),
        caixa(0.36, 0.05, 0.38, c.madeiraClara, 0.52, 0.42, 0),
      ];
  }
}

/** Uma peça montada e já posta na planta (coordenadas do desenho → mundo, pelo `paraMundo`). */
export function geometriaDoMovel(m: Movel, paraMundo: (x: number, y: number) => readonly [number, number]): T.BufferGeometry {
  const g = mergeGeometries(partes(m), false)!;
  g.rotateY((-m.rotacao * Math.PI) / 180);
  const [x, z] = paraMundo(m.posicao[0], m.posicao[1]);
  g.translate(x, 0, z);
  return g;
}

/** O vidro do box do banheiro: uma folha na frente da peça, para a malha de vidro. */
export function vidroDoBox(m: Movel, paraMundo: (x: number, y: number) => readonly [number, number]): T.BufferGeometry {
  const { largura: w, profundidade: d } = DIMENSOES_DOS_MOVEIS.box;
  const g = new T.BoxGeometry(w, 1.86, 0.012);
  g.translate(0, 0.04 + 0.93, d / 2 - 0.006);
  g.rotateY((-m.rotacao * Math.PI) / 180);
  const [x, z] = paraMundo(m.posicao[0], m.posicao[1]);
  g.translate(x, 0, z);
  return g;
}
