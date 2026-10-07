import type { PortaId, Vista } from '@/lib/carrelio/tipos';
import type { ManifestoDoModelo, PecaPorNo, PecaPorRegiao } from './contrato';
import { hexValido } from './cores';
import type { Caixa } from './orbita';
import { ehPecaPorRegiao, pecaValida } from './pecas';
import { regiaoValida } from './regioes';

/**
 * O manifesto do modelo contra o arquivo, sem three.js: lê o GLB (cabeçalho, JSON e binário),
 * confere se os nós e materiais citados existem, calcula a caixa do modelo e o ajuste que põe o
 * carro no espaço do manifesto (comprimento real, frente para +Z, centrado, rodas em y = 0).
 *
 * A cena usa a validação para avisar no console; os testes a usam contra o próprio `.glb`, e a
 * caixa para provar que os pontos de toque caem no carro.
 */

// ------------------------------------------------------------------------- GLB

export type GltfNo = {
  name?: string;
  children?: number[];
  mesh?: number;
  matrix?: number[];
  translation?: number[];
  rotation?: number[];
  scale?: number[];
};

export type GltfPrimitiva = { attributes: Record<string, number>; indices?: number; material?: number; extensions?: Record<string, unknown> };

export type GltfJson = {
  asset?: { version?: string; copyright?: string };
  scene?: number;
  scenes?: { nodes?: number[] }[];
  nodes?: GltfNo[];
  meshes?: { name?: string; primitives: GltfPrimitiva[] }[];
  materials?: { name?: string }[];
  accessors?: { bufferView?: number; byteOffset?: number; componentType: number; count: number; type: string; normalized?: boolean; min?: number[]; max?: number[] }[];
  bufferViews?: { buffer: number; byteOffset?: number; byteLength: number; byteStride?: number }[];
  extensions?: { KHR_materials_variants?: { variants?: { name?: string }[] } };
};

export type Glb = { json: GltfJson; binario: Uint8Array | null };

const MAGICO = 0x46546c67; // "glTF"
const PEDACO_JSON = 0x4e4f534a;
const PEDACO_BIN = 0x004e4942;

/** Lê um `.glb` (glTF 2.0 binário): o JSON e o primeiro pedaço binário. */
export function lerGlb(dados: ArrayBuffer | Uint8Array): Glb {
  const bytes = dados instanceof Uint8Array ? dados : new Uint8Array(dados);
  const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 20 || vista.getUint32(0, true) !== MAGICO) throw new Error('O arquivo não é um GLB.');
  if (vista.getUint32(4, true) !== 2) throw new Error('Só glTF 2.0.');
  let posicao = 12;
  let json: GltfJson | null = null;
  let binario: Uint8Array | null = null;
  while (posicao + 8 <= bytes.byteLength) {
    const tamanho = vista.getUint32(posicao, true);
    const tipo = vista.getUint32(posicao + 4, true);
    const inicio = posicao + 8;
    if (tipo === PEDACO_JSON) json = JSON.parse(new TextDecoder().decode(bytes.subarray(inicio, inicio + tamanho))) as GltfJson;
    else if (tipo === PEDACO_BIN && !binario) binario = bytes.subarray(inicio, inicio + tamanho);
    posicao = inicio + tamanho;
  }
  if (!json) throw new Error('GLB sem JSON.');
  return { json, binario };
}

export type NomesDoGltf = { nos: ReadonlySet<string>; materiais: ReadonlySet<string>; variantes: readonly string[] };

export function nomesDoGltf(json: GltfJson): NomesDoGltf {
  return {
    nos: new Set((json.nodes ?? []).map((n) => n.name ?? '').filter(Boolean)),
    materiais: new Set((json.materials ?? []).map((m) => m.name ?? '')),
    variantes: (json.extensions?.KHR_materials_variants?.variants ?? []).map((v) => v.name ?? ''),
  };
}

// ------------------------------------------------------------------ validação

const finito = (v: readonly number[]) => v.every((x) => Number.isFinite(x));

/**
 * Os problemas do manifesto contra o arquivo (vazio = tudo certo). Nomes de nó são os do glTF
 * (antes de o three.js trocar espaço por sublinhado).
 */
export function validarManifesto(m: ManifestoDoModelo, json: GltfJson): string[] {
  const nomes = nomesDoGltf(json);
  const problemas: string[] = [];
  const no = (campo: string, nome: string) => {
    if (!nomes.nos.has(nome)) problemas.push(`${campo}: o nó "${nome}" não existe no arquivo.`);
  };
  const material = (campo: string, nome: string) => {
    if (!nomes.materiais.has(nome)) problemas.push(`${campo}: o material "${nome}" não existe no arquivo.`);
  };
  if (!(m.comprimentoM > 0.5 && m.comprimentoM < 12)) problemas.push(`comprimentoM: ${m.comprimentoM} m não é medida de carro.`);
  for (const nome of m.pintura) material('pintura', nome);
  for (const nome of m.farois) material('farois', nome);
  for (const nome of m.lanternas) material('lanternas', nome);
  for (const nome of m.telas ?? []) material('telas', nome);
  for (const nome of Object.keys(m.semMarcas ?? {})) material('semMarcas', nome);
  for (const nome of Object.keys(m.acabamentos ?? {})) material('acabamentos', nome);
  for (const nome of m.teto) no('teto', nome);
  for (const nome of m.rack) no('rack', nome);
  for (const nome of m.esconder) no('esconder', nome);
  for (const [porta, peca] of Object.entries(m.portas) as [PortaId, PecaPorNo | PecaPorRegiao][]) {
    if (ehPecaPorRegiao(peca)) {
      if (!pecaValida(peca)) problemas.push(`portas.${porta}: contorno ou dobradiça inválidos.`);
    } else {
      no(`portas.${porta}`, peca.no);
    }
    if (!Number.isFinite(peca.graus) || Math.abs(peca.graus) > 120) problemas.push(`portas.${porta}: ${peca.graus}° não é abertura de porta.`);
  }
  for (const [id, ponto] of Object.entries(m.pontos)) if (!finito(ponto)) problemas.push(`pontos.${id}: posição inválida.`);
  for (const id of m.pontosDeDentro ?? []) if (!(id in m.pontos)) problemas.push(`pontosDeDentro: "${id}" não está em pontos.`);
  for (const [ponto, camera] of Object.entries(m.interior)) {
    if (camera && (!finito(camera.olho) || !finito(camera.alvo))) problemas.push(`interior.${ponto}: câmera inválida.`);
  }
  if (m.variante !== undefined && !nomes.variantes.includes(m.variante)) problemas.push(`variante: "${m.variante}" não existe no arquivo.`);
  if (m.rotacao && !finito(m.rotacao)) problemas.push('rotacao: ângulos inválidos.');
  for (const [nome, a] of Object.entries(m.acabamentos ?? {})) {
    if (a.cor !== undefined && !hexValido(a.cor)) problemas.push(`acabamentos.${nome}: cor "${a.cor}" não é #rrggbb.`);
  }
  const mascara = m.pinturaPorMascara;
  if (m.pintura.length === 0 && !mascara) problemas.push('pintura: sem materiais de pintura e sem pinturaPorMascara, a cor não muda.');
  if (mascara) {
    if (!hexValido(mascara.corBase)) problemas.push(`pinturaPorMascara.corBase: "${mascara.corBase}" não é #rrggbb.`);
    if (!(mascara.tolerancia > 0 && mascara.tolerancia <= 1)) problemas.push('pinturaPorMascara.tolerancia: fica entre 0 e 1.');
    for (const nome of mascara.excluirMateriais ?? []) material('pinturaPorMascara.excluirMateriais', nome);
    if (!(mascara.excluirRegioes ?? []).every(regiaoValida)) problemas.push('pinturaPorMascara.excluirRegioes: região inválida.');
  }
  if (!(m.vidrosPorRegiao ?? []).every(regiaoValida)) problemas.push('vidrosPorRegiao: região inválida.');
  if (![...(m.regioesDeLuz?.farois ?? []), ...(m.regioesDeLuz?.lanternas ?? [])].every(regiaoValida)) problemas.push('regioesDeLuz: região inválida.');
  if (m.verniz && !(m.verniz.intensidade >= 0 && m.verniz.intensidade <= 1 && m.verniz.rugosidade >= 0 && m.verniz.rugosidade <= 1)) {
    problemas.push('verniz: intensidade e rugosidade ficam entre 0 e 1.');
  }
  return problemas;
}

/** Os ids de `pontos` de uma vista. */
export function pontosDaVista(m: ManifestoDoModelo, vista: Vista): string[] {
  const dentro = new Set(m.pontosDeDentro ?? []);
  return Object.keys(m.pontos).filter((id) => dentro.has(id) === (vista === 'dentro'));
}

// ------------------------------------------------------------ matrizes e caixa

/** Matriz 4×4 em colunas (como o glTF e o three.js). */
export type Matriz = number[];

export const identidade = (): Matriz => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export function multiplicar(a: Matriz, b: Matriz): Matriz {
  const r = new Array<number>(16).fill(0);
  for (let c = 0; c < 4; c += 1) {
    for (let l = 0; l < 4; l += 1) {
      let s = 0;
      for (let k = 0; k < 4; k += 1) s += a[k * 4 + l]! * b[c * 4 + k]!;
      r[c * 4 + l] = s;
    }
  }
  return r;
}

/** Translação, rotação (quatérnio x, y, z, w) e escala numa matriz. */
export function compor(t: readonly number[], q: readonly number[], s: readonly number[]): Matriz {
  const [x, y, z, w] = [q[0]!, q[1]!, q[2]!, q[3]!];
  const [sx, sy, sz] = [s[0]!, s[1]!, s[2]!];
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    t[0]!, t[1]!, t[2]!, 1,
  ];
}

/** A rotação do manifesto (graus, X, Y e Z na ordem XYZ do three.js: R = Rx · Ry · Rz). */
export function matrizDaRotacao(graus: readonly [number, number, number] | undefined): Matriz {
  if (!graus) return identidade();
  const [a, b, c] = graus.map((g) => (g * Math.PI) / 180) as [number, number, number];
  const [ca, sa, cb, sb, cc, sc] = [Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b), Math.cos(c), Math.sin(c)];
  // Igual a Matrix4.makeRotationFromEuler com a ordem 'XYZ'.
  return [
    cb * cc, ca * sc + sa * sb * cc, sa * sc - ca * sb * cc, 0,
    -cb * sc, ca * cc - sa * sb * sc, sa * cc + ca * sb * sc, 0,
    sb, -sa * cb, ca * cb, 0,
    0, 0, 0, 1,
  ];
}

export function transformar(m: Matriz, p: readonly number[]): [number, number, number] {
  const [x, y, z] = [p[0]!, p[1]!, p[2]!];
  return [m[0]! * x + m[4]! * y + m[8]! * z + m[12]!, m[1]! * x + m[5]! * y + m[9]! * z + m[13]!, m[2]! * x + m[6]! * y + m[10]! * z + m[14]!];
}

function matrizDoNo(n: GltfNo): Matriz {
  if (n.matrix) return [...n.matrix];
  return compor(n.translation ?? [0, 0, 0], n.rotation ?? [0, 0, 0, 1], n.scale ?? [1, 1, 1]);
}

/** A matriz de mundo de cada nó da cena padrão, já com a rotação do manifesto por fora. */
export function matrizesDosNos(json: GltfJson, rotacao?: readonly [number, number, number]): Map<number, Matriz> {
  const mundo = new Map<number, Matriz>();
  const nos = json.nodes ?? [];
  const visitar = (indice: number, pai: Matriz) => {
    const n = nos[indice];
    if (!n || mundo.has(indice)) return;
    const m = multiplicar(pai, matrizDoNo(n));
    mundo.set(indice, m);
    for (const filho of n.children ?? []) visitar(filho, m);
  };
  const raizes = json.scenes?.[json.scene ?? 0]?.nodes ?? [];
  for (const r of raizes) visitar(r, matrizDaRotacao(rotacao));
  return mundo;
}

/** As posições (x, y, z) de um acessor de floats do binário. */
function posicoesDoAcessor(glb: Glb, indice: number): Float32Array | null {
  const acessor = glb.json.accessors?.[indice];
  if (!acessor || acessor.bufferView === undefined || !glb.binario || acessor.componentType !== 5126 || acessor.type !== 'VEC3') return null;
  const vistaDoBuffer = glb.json.bufferViews?.[acessor.bufferView];
  if (!vistaDoBuffer) return null;
  const passo = vistaDoBuffer.byteStride ?? 12;
  const inicio = glb.binario.byteOffset + (vistaDoBuffer.byteOffset ?? 0) + (acessor.byteOffset ?? 0);
  const dados = new DataView(glb.binario.buffer);
  const r = new Float32Array(acessor.count * 3);
  for (let i = 0; i < acessor.count; i += 1) {
    for (let k = 0; k < 3; k += 1) r[i * 3 + k] = dados.getFloat32(inicio + i * passo + k * 4, true);
  }
  return r;
}

/**
 * A caixa dos vértices dos nós (e descendentes) no espaço do modelo, com a rotação do manifesto.
 * Sem `nomes`, a cena inteira; `excluir` tira nós (e o que está embaixo deles).
 */
export function caixaDosNos(glb: Glb, opcoes: { nomes?: readonly string[]; excluir?: readonly string[]; rotacao?: readonly [number, number, number] } = {}): Caixa | null {
  const json = glb.json;
  const nos = json.nodes ?? [];
  const mundo = matrizesDosNos(json, opcoes.rotacao);
  const excluir = new Set(opcoes.excluir ?? []);
  const incluir = opcoes.nomes ? new Set(opcoes.nomes) : null;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  const visitar = (indice: number, dentro: boolean) => {
    const n = nos[indice];
    if (!n || excluir.has(n.name ?? '')) return;
    const conta = dentro || (incluir?.has(n.name ?? '') ?? true);
    if (conta && n.mesh !== undefined) {
      const m = mundo.get(indice)!;
      for (const primitiva of json.meshes?.[n.mesh]?.primitives ?? []) {
        const posicoes = primitiva.attributes['POSITION'] === undefined ? null : posicoesDoAcessor(glb, primitiva.attributes['POSITION']);
        if (!posicoes) continue;
        for (let i = 0; i < posicoes.length; i += 3) {
          const p = transformar(m, [posicoes[i]!, posicoes[i + 1]!, posicoes[i + 2]!]);
          for (let k = 0; k < 3; k += 1) {
            min[k] = Math.min(min[k]!, p[k]!);
            max[k] = Math.max(max[k]!, p[k]!);
          }
        }
      }
    }
    for (const filho of n.children ?? []) visitar(filho, conta);
  };
  for (const r of json.scenes?.[json.scene ?? 0]?.nodes ?? []) visitar(r, false);
  if (!Number.isFinite(min[0]!)) return null;
  return { min: [min[0]!, min[1]!, min[2]!], max: [max[0]!, max[1]!, max[2]!] };
}

// ---------------------------------------------------------------------- ajuste

/** Carro = modelo × escala + deslocamento (a rotação do manifesto já aplicada ao modelo). */
export type AjusteDoModelo = { escala: number; deslocamento: [number, number, number] };

/**
 * O ajuste que leva a caixa do modelo ao espaço do carro: comprimento (em Z) igual a
 * `comprimentoM`, centrado em X e em Z, e o ponto mais baixo (as rodas) em y = 0.
 */
export function ajusteDoModelo(caixa: Caixa, comprimentoM: number): AjusteDoModelo {
  const comprimento = caixa.max[2] - caixa.min[2];
  const escala = comprimento > 1e-6 ? comprimentoM / comprimento : 1;
  return {
    escala,
    deslocamento: [-((caixa.min[0] + caixa.max[0]) / 2) * escala, -caixa.min[1] * escala, -((caixa.min[2] + caixa.max[2]) / 2) * escala],
  };
}

export function noCarro(p: readonly number[], a: AjusteDoModelo): [number, number, number] {
  return [p[0]! * a.escala + a.deslocamento[0], p[1]! * a.escala + a.deslocamento[1], p[2]! * a.escala + a.deslocamento[2]];
}

export function noModelo(p: readonly number[], a: AjusteDoModelo): [number, number, number] {
  return [(p[0]! - a.deslocamento[0]) / a.escala, (p[1]! - a.deslocamento[1]) / a.escala, (p[2]! - a.deslocamento[2]) / a.escala];
}

export function caixaNoCarro(c: Caixa, a: AjusteDoModelo): Caixa {
  return { min: noCarro(c.min, a), max: noCarro(c.max, a) };
}

/**
 * Aviso de orientação: depois da rotação, o comprimento precisa estar em Z (o carro é mais comprido
 * que largo). Se não estiver, a frente veio de lado e o manifesto precisa de `rotacao`.
 */
export function comprimentoEmZ(caixa: Caixa): boolean {
  return caixa.max[2] - caixa.min[2] >= caixa.max[0] - caixa.min[0];
}
