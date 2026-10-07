import {
  Bone, Box3, BufferAttribute, BufferGeometry, DoubleSide, Euler, Group, Matrix3, Matrix4, Mesh, MeshBasicMaterial, Object3D, Skeleton, SkinnedMesh, Vector2, Vector3,
  Quaternion, type Material, type MeshPhysicalMaterial, type MeshStandardMaterial, type Texture,
} from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PORTAS, type PortaId } from '@/lib/carrelio/tipos';
import { simplificarPorGrade } from './colisao';
import type { ManifestoDoModelo, PecaPorRegiao, RegiaoDoCarro } from './contrato';
import { hexParaLinear } from './cores';
import { ajusteDoModelo, comprimentoEmZ, noModelo, type AjusteDoModelo } from './manifesto';
import { direcoesNaEsfera, silhuetaDosPontos } from './orbita';
import {
  COR_DA_LANTERNA, COR_DO_FAROL, criarTinta, criarVidro, injetarMascara, luzDeMaterial, paraFisico, VERNIZ_DE_FABRICA, type UniformesDaPintura, type Verniz,
} from './materiais';
import { ehPecaPorRegiao, pecaDoPonto, refinarNaFronteira } from './pecas';
import { tamanhoDaRegiao } from './regioes';

/**
 * A montagem do carro a partir do glTF carregado: aplica a rotação e o ajuste do manifesto, esconde
 * o que deve sumir, junta as malhas por material (uma chamada de desenho por material, em vez de uma
 * por peça) e troca os materiais pelos da cena.
 *
 * Peças que abrem (portas, porta-malas) viram ossos de um esqueleto: tudo continua numa malha por
 * material, e abrir uma porta é girar o osso dela na dobradiça. Sem peças que abrem (o modelo de
 * IA), as malhas são comuns, sem esqueleto. Para os toques e para os pontos atrás da lataria, cada
 * peça ganha uma malha de colisão invisível e simplificada, presa ao osso dela.
 */

/** O maior lado de um triângulo na emenda de uma peça recortada (m): a borda da peça sai com essa precisão. */
const ARESTA_NA_EMENDA = 0.025;

/** Quanto o meio do vidro de `janelas` recua para dentro (m) e em quantas faixas ele é dividido. */
const CURVA_DA_JANELA = 0.02;
const LINHAS_DA_JANELA = 8;

export type PecaQueAbre = { id: PortaId; osso: Object3D; repouso: Quaternion; eixo: Vector3; graus: number };

export type FonteDeLuz = {
  tipo: 'farol' | 'lanterna';
  /** Posição no espaço do carro (com a peça fechada) e na peça (para o halo andar com ela). */
  noCarro: Vector3;
  naPeca: Vector3;
  /** Para onde a luz aponta, no espaço da peça. */
  normal: Vector3;
  tamanho: number;
  parte: number;
};

export type CarroMontado = {
  /** O grupo do carro, com o ajuste (escala e posição); filho direto da cena. */
  grupo: Group;
  /** Os ossos de cada parte (0 é a carroceria); sem peças que abrem, só o próprio grupo. */
  partes: Object3D[];
  pecas: PecaQueAbre[];
  ajuste: AjusteDoModelo;
  /** A caixa do carro no espaço do carro (rodas em y = 0). */
  caixa: Box3;
  /** Os pontos extremos da malha no espaço do carro, para o enquadramento justo. */
  silhueta: [number, number, number][];
  materiais: {
    tinta: MeshPhysicalMaterial | null;
    tetoTinta: MeshPhysicalMaterial | null;
    vidro: { material: MeshPhysicalMaterial; opacidade: { value: number } };
    luzes: { tipo: 'farol' | 'lanterna'; acender(fator: number): void }[];
    /** Materiais pintados por máscara (a cor vem dos uniforms compartilhados). */
    mascarados: MeshPhysicalMaterial[];
    todos: Material[];
  };
  teto: { tinta: Mesh; vidro: Mesh } | null;
  /** O teto é uma região da textura (modelo de malha única): os uniforms da pintura o controlam. */
  tetoPorRegiao: boolean;
  rack: Mesh[];
  colisao: { malha: Mesh; parte: number }[];
  fontesDeLuz: FonteDeLuz[];
  triangulos: number;
  descartar(): void;
};

type Papel = 'pintura' | 'teto' | 'rack' | 'vidro' | 'farol' | 'lanterna' | 'comum';

type Fonte = { malha: Mesh; material: Material; parte: number; matriz: Matrix4; papel: Papel };

const nomeDe = (o: Object3D) => (o.userData['name'] as string | undefined) ?? o.name;

function ehVidro(m: Material): boolean {
  const fisico = m as MeshPhysicalMaterial;
  return (fisico.transmission ?? 0) > 0 || (m.transparent && m.opacity < 0.98);
}

/**
 * Aplica uma variante do `KHR_materials_variants` (o GLTFLoader carrega só a padrão): troca o
 * material de cada primitiva que tem mapeamento para ela.
 */
export async function aplicarVariante(gltf: GLTF, nome: string): Promise<boolean> {
  const json = gltf.parser.json as { extensions?: { KHR_materials_variants?: { variants?: { name?: string }[] } }; meshes?: { primitives: { extensions?: { KHR_materials_variants?: { mappings?: { material: number; variants: number[] }[] } } }[] }[] };
  const indice = (json.extensions?.KHR_materials_variants?.variants ?? []).findIndex((v) => v.name === nome);
  if (indice < 0) return false;
  const trocas: Promise<void>[] = [];
  gltf.scene.traverse((o) => {
    const malha = o as Mesh;
    if (!malha.isMesh) return;
    const associacao = gltf.parser.associations.get(malha) as { meshes?: number; primitives?: number } | undefined;
    if (associacao?.meshes === undefined || associacao.primitives === undefined) return;
    const mapeamentos = json.meshes?.[associacao.meshes]?.primitives[associacao.primitives]?.extensions?.KHR_materials_variants?.mappings ?? [];
    const mapeamento = mapeamentos.find((m) => m.variants.includes(indice));
    if (!mapeamento) return;
    trocas.push(
      (gltf.parser.getDependency('material', mapeamento.material) as Promise<Material>).then((material) => {
        malha.material = material;
        // Como o GLTFLoader faz: sem tangentes, o normal map usa as derivadas e o Y inverte.
        (gltf.parser as unknown as { assignFinalMaterial(m: Mesh): void }).assignFinalMaterial(malha);
      }),
    );
  });
  await Promise.all(trocas);
  return true;
}

/** Para cada material, o que tirar: texturas com marcas de terceiros e emissivos que não são luz. */
function limparMaterial(m: MeshStandardMaterial, manifesto: ManifestoDoModelo, papel: Papel): void {
  const nome = m.name;
  for (const mapa of manifesto.semMarcas?.[nome] ?? []) {
    const atual = m[mapa];
    if (atual) m[mapa] = null;
  }
  // Emissivo com textura só fica nas telas: nos modelos de amostra, é onde moram os logotipos.
  const tela = (manifesto.telas ?? []).includes(nome);
  if (!tela && papel !== 'farol' && papel !== 'lanterna' && m.emissiveMap) {
    m.emissiveMap = null;
    m.emissive.setRGB(0, 0, 0);
  }
  const acabamento = manifesto.acabamentos?.[nome];
  if (acabamento?.cor) m.color.set(acabamento.cor);
  if (acabamento?.rugosidade !== undefined) m.roughness = acabamento.rugosidade;
  if (acabamento?.metalico !== undefined) m.metalness = acabamento.metalico;
  m.needsUpdate = true;
}

type Juncao = { geometria: BufferGeometry; tangentes: boolean };

/**
 * Junta as geometrias das fontes no espaço do modelo (ou da peça, com `paraPeca`), com o índice do
 * osso em cada vértice quando há esqueleto. Atributos que nem todas têm saem (sem tangente, o
 * normal map usa as derivadas).
 */
function juntar(fontes: readonly Fonte[], comOssos: boolean): Juncao {
  const geometrias = fontes.map((f) => f.malha.geometry);
  const todasTem = (nome: string) => geometrias.every((g) => g.getAttribute(nome) !== undefined);
  const tangentes = todasTem('tangent');
  const uv = todasTem('uv');
  const uv1 = todasTem('uv1');
  let vertices = 0;
  let indices = 0;
  for (const g of geometrias) {
    vertices += g.getAttribute('position').count;
    indices += g.index ? g.index.count : g.getAttribute('position').count;
  }
  const posicao = new Float32Array(vertices * 3);
  const normal = new Float32Array(vertices * 3);
  const tangente = tangentes ? new Float32Array(vertices * 4) : null;
  const coordenadas = uv ? new Float32Array(vertices * 2) : null;
  const coordenadas1 = uv1 ? new Float32Array(vertices * 2) : null;
  const ossos = comOssos ? new Uint8Array(vertices * 4) : null;
  const pesos = comOssos ? new Uint8Array(vertices * 4) : null;
  const indice = vertices > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
  const normalDaMatriz = new Matrix3();
  const v = new Vector3();
  let base = 0;
  let k = 0;
  for (const fonte of fontes) {
    const g = fonte.malha.geometry;
    const m = fonte.matriz;
    normalDaMatriz.getNormalMatrix(m);
    const espelhada = m.determinant() < 0;
    const p = g.getAttribute('position');
    const n = g.getAttribute('normal');
    const t = tangentes ? g.getAttribute('tangent') : null;
    const u = uv ? g.getAttribute('uv') : null;
    const u1 = uv1 ? g.getAttribute('uv1') : null;
    for (let i = 0; i < p.count; i += 1) {
      const o = base + i;
      v.fromBufferAttribute(p, i).applyMatrix4(m);
      posicao[o * 3] = v.x;
      posicao[o * 3 + 1] = v.y;
      posicao[o * 3 + 2] = v.z;
      if (n) {
        v.fromBufferAttribute(n, i).applyMatrix3(normalDaMatriz).normalize();
        normal[o * 3] = v.x;
        normal[o * 3 + 1] = v.y;
        normal[o * 3 + 2] = v.z;
      }
      if (t && tangente) {
        v.set(t.getX(i), t.getY(i), t.getZ(i)).transformDirection(m);
        tangente[o * 4] = v.x;
        tangente[o * 4 + 1] = v.y;
        tangente[o * 4 + 2] = v.z;
        tangente[o * 4 + 3] = t.getW(i) * (espelhada ? -1 : 1);
      }
      if (u && coordenadas) {
        coordenadas[o * 2] = u.getX(i);
        coordenadas[o * 2 + 1] = u.getY(i);
      }
      if (u1 && coordenadas1) {
        coordenadas1[o * 2] = u1.getX(i);
        coordenadas1[o * 2 + 1] = u1.getY(i);
      }
      if (ossos && pesos) {
        ossos[o * 4] = fonte.parte;
        pesos[o * 4] = 255;
      }
    }
    const indiceDaFonte = g.index;
    const total = indiceDaFonte ? indiceDaFonte.count : p.count;
    for (let i = 0; i < total; i += 3) {
      const a = indiceDaFonte ? indiceDaFonte.getX(i) : i;
      const b = indiceDaFonte ? indiceDaFonte.getX(i + 1) : i + 1;
      const c = indiceDaFonte ? indiceDaFonte.getX(i + 2) : i + 2;
      // Peça espelhada: inverte a ordem para a face da frente continuar a da frente.
      indice[k] = base + a;
      indice[k + 1] = base + (espelhada ? c : b);
      indice[k + 2] = base + (espelhada ? b : c);
      k += 3;
    }
    base += p.count;
  }
  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new BufferAttribute(posicao, 3));
  geometria.setAttribute('normal', new BufferAttribute(normal, 3));
  if (tangente) geometria.setAttribute('tangent', new BufferAttribute(tangente, 4));
  if (coordenadas) geometria.setAttribute('uv', new BufferAttribute(coordenadas, 2));
  if (coordenadas1) geometria.setAttribute('uv1', new BufferAttribute(coordenadas1, 2));
  if (ossos && pesos) {
    geometria.setAttribute('skinIndex', new BufferAttribute(ossos, 4));
    geometria.setAttribute('skinWeight', new BufferAttribute(pesos, 4, true));
  }
  geometria.setIndex(new BufferAttribute(indice, 1));
  geometria.computeBoundingBox();
  geometria.computeBoundingSphere();
  return { geometria, tangentes };
}

/**
 * Normais suaves, soldando os vértices de mesma posição (a malha de IA corta a superfície em ilhas
 * da textura, e cada corte separa as normais): a média, pesada pela área das faces, de todas as faces
 * que tocam a posição. Tira o serrilhado do reflexo nas costuras e o ruído das normais geradas.
 */
export function suavizarNormais(geometria: BufferGeometry, passo = 1e-4): void {
  const p = geometria.getAttribute('position');
  const indice = geometria.index;
  if (!indice) return;
  const chave = (i: number) => `${Math.round(p.getX(i) / passo)},${Math.round(p.getY(i) / passo)},${Math.round(p.getZ(i) / passo)}`;
  const grupos = new Map<string, number>();
  const grupoDoVertice = new Int32Array(p.count);
  for (let i = 0; i < p.count; i += 1) {
    const k = chave(i);
    let g = grupos.get(k);
    if (g === undefined) {
      g = grupos.size;
      grupos.set(k, g);
    }
    grupoDoVertice[i] = g;
  }
  const somas = new Float32Array(grupos.size * 3);
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  for (let t = 0; t < indice.count; t += 3) {
    const ia = indice.getX(t);
    const ib = indice.getX(t + 1);
    const ic = indice.getX(t + 2);
    a.fromBufferAttribute(p, ia);
    b.fromBufferAttribute(p, ib).sub(a);
    c.fromBufferAttribute(p, ic).sub(a);
    // O produto vetorial já pesa pela área.
    const n = b.cross(c);
    for (const i of [ia, ib, ic]) {
      const g = grupoDoVertice[i]! * 3;
      somas[g] = somas[g]! + n.x;
      somas[g + 1] = somas[g + 1]! + n.y;
      somas[g + 2] = somas[g + 2]! + n.z;
    }
  }
  const normal = geometria.getAttribute('normal') as BufferAttribute;
  for (let i = 0; i < p.count; i += 1) {
    const g = grupoDoVertice[i]! * 3;
    a.set(somas[g]!, somas[g + 1]!, somas[g + 2]!).normalize();
    normal.setXYZ(i, a.x, a.y, a.z);
  }
  normal.needsUpdate = true;
}

/** Acerta o sinal do Y do normal map quando a junção mudou o jeito de achar as tangentes. */
function acertarNormalMap(m: MeshStandardMaterial, fonteTinhaTangente: boolean, juncaoTemTangente: boolean): void {
  if (fonteTinhaTangente === juncaoTemTangente) return;
  if (m.normalScale) m.normalScale.y *= -1;
  const fisico = m as MeshPhysicalMaterial;
  if (fisico.clearcoatNormalScale) fisico.clearcoatNormalScale.y *= -1;
}

/**
 * A geometria com os vértices novos do refino (`refinarNaFronteira`): cada um é o meio dos dois pais,
 * em todos os atributos (as direções voltam a ter comprimento 1). Sem índice: quem usa é
 * `extrairTriangulos`, com os índices do refino.
 */
function estenderVertices(origem: BufferGeometry, pais: Uint32Array): Record<string, BufferAttribute> {
  const total = origem.getAttribute('position').count + pais.length / 2;
  const atributos: Record<string, BufferAttribute> = {};
  for (const [nome, atributo] of Object.entries(origem.attributes)) {
    const tamanho = atributo.itemSize;
    const dados = new Float32Array(total * tamanho);
    for (let i = 0; i < atributo.count; i += 1) {
      for (let c = 0; c < tamanho; c += 1) dados[i * tamanho + c] = atributo.getComponent(i, c);
    }
    // Normal e tangente: a média de duas direções é refeita unitária (a tangente guarda o sinal em w).
    const direcao = nome === 'normal' || nome === 'tangent' ? 3 : 0;
    for (let k = 0; k < pais.length / 2; k += 1) {
      const n = atributo.count + k;
      const a = pais[k * 2]!;
      const b = pais[k * 2 + 1]!;
      for (let c = 0; c < tamanho; c += 1) dados[n * tamanho + c] = (dados[a * tamanho + c]! + dados[b * tamanho + c]!) / 2;
      if (direcao) {
        const l = Math.hypot(dados[n * tamanho]!, dados[n * tamanho + 1]!, dados[n * tamanho + 2]!) || 1;
        for (let c = 0; c < 3; c += 1) dados[n * tamanho + c] = dados[n * tamanho + c]! / l;
        if (tamanho === 4) dados[n * tamanho + 3] = dados[a * tamanho + 3]!;
      }
    }
    atributos[nome] = new BufferAttribute(dados, tamanho);
  }
  return atributos;
}

/** Uma geometria só com alguns triângulos de `indices` (os vértices que eles usam, com todos os atributos). */
function extrairTriangulos(atributos: Record<string, BufferAttribute>, indices: Uint32Array, triangulos: readonly number[]): BufferGeometry {
  const novoDoVelho = new Int32Array(atributos['position']!.count).fill(-1);
  const velhos: number[] = [];
  const novoIndice = new Uint32Array(triangulos.length * 3);
  let k = 0;
  for (const t of triangulos) {
    for (let j = 0; j < 3; j += 1) {
      const v = indices[t * 3 + j]!;
      let n = novoDoVelho[v]!;
      if (n < 0) {
        n = velhos.length;
        novoDoVelho[v] = n;
        velhos.push(v);
      }
      novoIndice[k] = n;
      k += 1;
    }
  }
  const geometria = new BufferGeometry();
  for (const [nome, atributo] of Object.entries(atributos)) {
    const tamanho = atributo.itemSize;
    const origem = atributo.array as Float32Array;
    const dados = new Float32Array(velhos.length * tamanho);
    velhos.forEach((v, i) => dados.set(origem.subarray(v * tamanho, v * tamanho + tamanho), i * tamanho));
    geometria.setAttribute(nome, new BufferAttribute(dados, tamanho));
  }
  geometria.setIndex(new BufferAttribute(velhos.length > 65535 ? novoIndice : new Uint16Array(novoIndice), 1));
  return geometria;
}

/**
 * Recorta da malha as peças que abrem por região (modelo de malha única): os triângulos de cada peça
 * saem para uma malha nova, filha de um nó na dobradiça. Assim a montagem trata a peça como trata a
 * de um arquivo com nós (osso, colisão, junção por material). Os vértices não se movem: fechada, a
 * peça fica idêntica ao arquivo, sem emenda nem sobreposição. Devolve o nó de cada peça.
 */
function recortarPecas(gltf: GLTF, escondidos: Set<Object3D>, manifesto: ManifestoDoModelo, ancestral: (o: Object3D, alvos: Set<Object3D>) => boolean): Map<PortaId, Object3D> {
  const nos = new Map<PortaId, Object3D>();
  const recortes = PORTAS.flatMap((id) => {
    const peca = manifesto.portas[id];
    return peca && ehPecaPorRegiao(peca) ? [{ id, peca }] : [];
  });
  if (recortes.length === 0) return nos;

  const malhas: Mesh[] = [];
  gltf.scene.traverse((o) => {
    if ((o as Mesh).isMesh && !ancestral(o, escondidos)) malhas.push(o as Mesh);
  });
  // O ajuste (escala e posição) sai da caixa do modelo, que o recorte não muda: a conta vem antes.
  const caixa = new Box3();
  const v = new Vector3();
  for (const malha of malhas) {
    const p = malha.geometry.getAttribute('position');
    for (let i = 0; i < p.count; i += 1) caixa.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(malha.matrixWorld));
  }
  if (caixa.isEmpty()) return nos;
  const ajuste = ajusteDoModelo({ min: caixa.min.toArray() as [number, number, number], max: caixa.max.toArray() as [number, number, number] }, manifesto.comprimentoM);
  const doModelo = new Matrix4().compose(new Vector3(...ajuste.deslocamento), new Quaternion(), new Vector3(ajuste.escala, ajuste.escala, ajuste.escala));
  const doCarroParaOModelo = doModelo.clone().invert();

  const raiz = gltf.scene;
  const inversaDaRaiz = raiz.matrixWorld.clone().invert();
  const noDa = (id: PortaId, peca: PecaPorRegiao): Object3D => {
    let no = nos.get(id);
    if (no) return no;
    no = new Object3D();
    no.name = `carrelio:peca:${id}`;
    // O nó fica na dobradiça (no espaço do modelo), sem rotação: o eixo local é o do carro.
    const naDobradica = new Vector3(...peca.dobradica).applyMatrix4(doCarroParaOModelo);
    new Matrix4().multiplyMatrices(inversaDaRaiz, new Matrix4().makeTranslation(naDobradica)).decompose(no.position, no.quaternion, no.scale);
    raiz.add(no);
    no.updateMatrixWorld(true);
    nos.set(id, no);
    return no;
  };

  const pecas = recortes.map((r) => r.peca);
  for (const malha of malhas) {
    const geometria = malha.geometry;
    const p = geometria.getAttribute('position');
    const paraOCarro = new Matrix4().multiplyMatrices(doModelo, malha.matrixWorld);
    const noCarro = new Float64Array(p.count * 3);
    for (let i = 0; i < p.count; i += 1) {
      v.fromBufferAttribute(p, i).applyMatrix4(paraOCarro);
      noCarro[i * 3] = v.x;
      noCarro[i * 3 + 1] = v.y;
      noCarro[i * 3 + 2] = v.z;
    }
    const indices = geometria.index ? Array.from({ length: geometria.index.count }, (_, i) => geometria.index!.getX(i)) : Array.from({ length: p.count }, (_, i) => i);
    const refino = refinarNaFronteira(noCarro, indices, pecas, ARESTA_NA_EMENDA);
    if (refino.dono.every((d) => d === 0)) continue;
    const atributos = estenderVertices(geometria, refino.pais);
    const listas = new Map<number, number[]>();
    refino.dono.forEach((d, t) => {
      const lista = listas.get(d) ?? [];
      lista.push(t);
      listas.set(d, lista);
    });
    for (const [d, lista] of listas) {
      if (d === 0) continue;
      const { id, peca } = recortes[d - 1]!;
      const no = noDa(id, peca);
      const pedaco = new Mesh(extrairTriangulos(atributos, refino.indices, lista), malha.material);
      pedaco.name = `${malha.name}:${id}`;
      pedaco.userData['name'] = pedaco.name;
      // A mesma posição no mundo: a matriz da malha original, vista do nó.
      new Matrix4().multiplyMatrices(no.matrixWorld.clone().invert(), malha.matrixWorld).decompose(pedaco.position, pedaco.quaternion, pedaco.scale);
      no.add(pedaco);
    }
    const daCarroceria = listas.get(0);
    if (daCarroceria?.length) {
      malha.geometry = extrairTriangulos(atributos, refino.indices, daCarroceria);
    } else {
      malha.removeFromParent();
    }
    geometria.dispose();
  }
  raiz.updateMatrixWorld(true);
  return nos;
}

export type OpcoesDaMontagem = {
  manifesto: ManifestoDoModelo;
  uniformes: UniformesDaPintura;
  fatia: () => Promise<void>;
};

export async function montarCarro(gltf: GLTF, opcoes: OpcoesDaMontagem): Promise<CarroMontado> {
  const { manifesto, uniformes, fatia } = opcoes;
  const verniz: Verniz = manifesto.verniz ?? VERNIZ_DE_FABRICA;

  // -------------------------------------------------------- rotação e índices
  const modelo = new Group();
  const graus = manifesto.rotacao ?? [0, 0, 0];
  modelo.rotation.copy(new Euler((graus[0] * Math.PI) / 180, (graus[1] * Math.PI) / 180, (graus[2] * Math.PI) / 180, 'XYZ'));
  modelo.add(gltf.scene);
  modelo.updateMatrixWorld(true);

  const porNome = new Map<string, Object3D>();
  gltf.scene.traverse((o) => {
    const nome = nomeDe(o);
    if (nome && !porNome.has(nome)) porNome.set(nome, o);
  });
  const conjunto = (nomes: readonly string[]) => new Set(nomes.map((n) => porNome.get(n)).filter((o): o is Object3D => Boolean(o)));
  const escondidos = conjunto(manifesto.esconder);
  const tetos = conjunto(manifesto.teto);
  const racks = conjunto(manifesto.rack);
  const ancestral = (o: Object3D, alvos: Set<Object3D>): boolean => {
    for (let p: Object3D | null = o; p; p = p.parent) if (alvos.has(p)) return true;
    return false;
  };
  // Peças por região (malha única): recortadas agora, cada uma vira um nó na dobradiça.
  const recortadas = recortarPecas(gltf, escondidos, manifesto, ancestral);
  modelo.updateMatrixWorld(true);
  const pecasDoManifesto = PORTAS.flatMap((id) => {
    const peca = manifesto.portas[id];
    if (!peca) return [];
    if (ehPecaPorRegiao(peca)) {
      const no = recortadas.get(id);
      if (!no) console.warn(`[carrelio] A peça ${id} não pegou nenhum triângulo: confira os contornos.`);
      return no ? [{ id, no, eixo: peca.eixo, graus: peca.graus }] : [];
    }
    const no = porNome.get(peca.no);
    if (!no) {
      console.warn(`[carrelio] A peça ${id} aponta para o nó "${peca.no}", que não existe.`);
      return [];
    }
    return [{ id, no, eixo: peca.eixo, graus: peca.graus }];
  });
  const nosDasPartes = pecasDoManifesto.map((p) => p.no);
  /** Peças por região, com o índice da parte (1 em diante), para achar a peça de um ponto do carro. */
  const regioesDasPartes = pecasDoManifesto.flatMap((p, i) => {
    const peca = manifesto.portas[p.id];
    return peca && ehPecaPorRegiao(peca) ? [{ parte: i + 1, contornos: peca.contornos }] : [];
  });
  const parteDoPonto = (p: readonly number[]): number => {
    const k = pecaDoPonto(p, regioesDasPartes);
    return k > 0 ? regioesDasPartes[k - 1]!.parte : 0;
  };
  const parteDe = (o: Object3D): number => {
    for (let p: Object3D | null = o; p; p = p.parent) {
      const i = nosDasPartes.indexOf(p);
      if (i >= 0) return i + 1;
    }
    return 0;
  };

  // -------------------------------------------------------------- as fontes
  const fontes: Fonte[] = [];
  const nomesDaPintura = new Set(manifesto.pintura);
  const nomesDosFarois = new Set(manifesto.farois);
  const nomesDasLanternas = new Set(manifesto.lanternas);
  const descartadas = new Set<BufferGeometry>();
  // Toda textura do arquivo, usada ou não, sai no descarte (as que a cena usa também estão aqui).
  const texturasDoArquivo = new Set<Texture>();
  gltf.scene.traverse((o) => {
    const malha = o as Mesh;
    if (!malha.isMesh) return;
    descartadas.add(malha.geometry);
    for (const m of Array.isArray(malha.material) ? malha.material : [malha.material]) {
      for (const valor of Object.values(m as unknown as Record<string, unknown>)) {
        if (valor && typeof valor === 'object' && 'isTexture' in valor) texturasDoArquivo.add(valor as Texture);
      }
    }
    if (ancestral(malha, escondidos)) return;
    const material = Array.isArray(malha.material) ? malha.material[0]! : malha.material;
    let papel: Papel = 'comum';
    if (ancestral(malha, tetos)) papel = 'teto';
    else if (ancestral(malha, racks)) papel = 'rack';
    else if (ehVidro(material)) papel = 'vidro';
    else if (nomesDaPintura.has(material.name)) papel = 'pintura';
    else if (nomesDosFarois.has(material.name)) papel = 'farol';
    else if (nomesDasLanternas.has(material.name)) papel = 'lanterna';
    fontes.push({ malha, material, parte: parteDe(malha), matriz: malha.matrixWorld.clone(), papel });
  });
  if (fontes.length === 0) throw new Error('O modelo não tem malhas visíveis.');
  await fatia();

  // ------------------------------------------------------------ caixa e ajuste
  const caixaDoModelo = new Box3();
  const v = new Vector3();
  for (const f of fontes) {
    const p = f.malha.geometry.getAttribute('position');
    for (let i = 0; i < p.count; i += 1) caixaDoModelo.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(f.matriz));
  }
  const caixaComum = { min: caixaDoModelo.min.toArray() as [number, number, number], max: caixaDoModelo.max.toArray() as [number, number, number] };
  if (!comprimentoEmZ(caixaComum)) console.warn('[carrelio] O comprimento do modelo não está em Z: confira `rotacao` no manifesto.');
  const ajuste = ajusteDoModelo(caixaComum, manifesto.comprimentoM);
  const grupo = new Group();
  grupo.name = `carrelio:${manifesto.id}`;
  grupo.scale.setScalar(ajuste.escala);
  grupo.position.set(...ajuste.deslocamento);
  grupo.updateMatrixWorld(true);
  const caixa = caixaDoModelo.clone().applyMatrix4(grupo.matrixWorld);
  // A silhueta (o ponto mais longe em 96 direções), no espaço do carro: um vértice em cada quatro
  // basta, a malha é densa.
  const amostra: number[] = [];
  for (const f of fontes) {
    const p = f.malha.geometry.getAttribute('position');
    for (let i = 0; i < p.count; i += 4) {
      v.fromBufferAttribute(p, i).applyMatrix4(f.matriz).applyMatrix4(grupo.matrixWorld);
      amostra.push(v.x, v.y, v.z);
    }
  }
  const silhueta = silhuetaDosPontos(amostra, direcoesNaEsfera(96));
  await fatia();

  // ------------------------------------------------------------------ ossos
  const comOssos = pecasDoManifesto.length > 0;
  const partes: Object3D[] = [];
  const pecas: PecaQueAbre[] = [];
  const repousos: Matrix4[] = [new Matrix4()];
  if (comOssos) {
    const raiz = new Bone();
    raiz.name = 'carroceria';
    grupo.add(raiz);
    partes.push(raiz);
    pecasDoManifesto.forEach((p) => {
      const repouso = p.no.matrixWorld.clone();
      repousos.push(repouso);
      const osso = new Bone();
      osso.name = p.id;
      // Peça dentro de outra peça: o osso fica no da mãe.
      const mae = parteDe(p.no.parent ?? p.no);
      const local = mae > 0 ? repousos[mae]!.clone().invert().multiply(repouso) : repouso.clone();
      local.decompose(osso.position, osso.quaternion, osso.scale);
      (mae > 0 ? partes[mae]! : raiz).add(osso);
      partes.push(osso);
      const eixo = new Vector3(p.eixo === 'x' ? 1 : 0, p.eixo === 'y' ? 1 : 0, p.eixo === 'z' ? 1 : 0);
      pecas.push({ id: p.id, osso, repouso: osso.quaternion.clone(), eixo, graus: p.graus });
    });
    grupo.updateMatrixWorld(true);
  } else {
    partes.push(grupo);
  }
  const esqueleto = comOssos ? new Skeleton(partes as Bone[]) : null;

  // --------------------------------------------------- grupos por material
  const grupos = new Map<string, Fonte[]>();
  const indiceDoMaterial = (m: Material) => (gltf.parser.associations.get(m) as { materials?: number } | undefined)?.materials ?? m.name;
  for (const f of fontes) {
    const chave = f.papel === 'pintura' || f.papel === 'teto' || f.papel === 'vidro' ? f.papel : `${f.papel}:${indiceDoMaterial(f.material)}`;
    const lista = grupos.get(chave) ?? [];
    lista.push(f);
    grupos.set(chave, lista);
  }

  const mascara = manifesto.pintura.length === 0 ? manifesto.pinturaPorMascara : undefined;
  const regioes = {
    excluir: mascara?.excluirRegioes ?? [],
    vidro: manifesto.vidrosPorRegiao ?? [],
    // O teto por região só vale sem nó de teto (o modelo de malha única).
    teto: manifesto.teto.length === 0 ? (manifesto.tetoPorRegiao ?? []) : [],
    metal: manifesto.metalPorRegiao ?? [],
    farol: manifesto.regioesDeLuz?.farois ?? [],
    lanterna: manifesto.regioesDeLuz?.lanternas ?? [],
  };
  // As regiões são do espaço do carro; o shader mede no mundo, que é o espaço do carro (o grupo
  // fica na origem da cena com o ajuste).
  const comRegioes = Boolean(mascara) || Object.values(regioes).some((lista) => lista.length > 0);
  const comInterior = regioesDasPartes.length > 0 || Object.keys(manifesto.interior).length > 0;
  const baseDaMascara = hexParaLinear(mascara?.corBase ?? '#808080');

  const vidro = criarVidro();
  const todos: Material[] = [vidro.material];
  const luzes: CarroMontado['materiais']['luzes'] = [];
  const mascarados: MeshPhysicalMaterial[] = [];
  let tinta: MeshPhysicalMaterial | null = null;
  let tetoTinta: MeshPhysicalMaterial | null = null;
  let teto: CarroMontado['teto'] = null;
  const rack: Mesh[] = [];
  const geometrias: BufferGeometry[] = [];
  let triangulos = 0;

  const flocosDa = (fontesDoGrupo: readonly Fonte[], juncao: Juncao): { mapa: Texture; escala: Vector2 } | null => {
    const comMapa = fontesDoGrupo.find((f) => (f.material as MeshStandardMaterial).normalMap);
    const m = comMapa?.material as MeshStandardMaterial | undefined;
    if (!m?.normalMap) return null;
    const escala = new Vector2(Math.abs(m.normalScale.x), Math.abs(m.normalScale.y) * (juncao.tangentes ? 1 : -1));
    return { mapa: m.normalMap, escala };
  };

  const criarMalha = (geometria: BufferGeometry, material: Material): Mesh => {
    const malha = esqueleto ? new SkinnedMesh(geometria, material) : new Mesh(geometria, material);
    if (esqueleto) {
      const pele = malha as SkinnedMesh;
      grupo.add(pele);
      grupo.updateMatrixWorld(true);
      pele.bind(esqueleto);
      // O carro está sempre no quadro; a esfera de repouso serve para ordenar o vidro.
      pele.frustumCulled = false;
      pele.boundingSphere = geometria.boundingSphere!.clone();
      pele.boundingBox = geometria.boundingBox!.clone();
    } else {
      grupo.add(malha);
    }
    return malha;
  };

  for (const [chave, lista] of grupos) {
    const juncao = juntar(lista, comOssos);
    if (manifesto.suavizarNormais && (lista[0]!.papel === 'comum' || lista[0]!.papel === 'pintura')) suavizarNormais(juncao.geometria);
    geometrias.push(juncao.geometria);
    triangulos += (juncao.geometria.index?.count ?? 0) / 3;
    const papel = lista[0]!.papel;
    const original = lista[0]!.material as MeshStandardMaterial;
    let material: Material;
    if (papel === 'pintura') {
      tinta ??= criarTinta(flocosDa(lista, juncao), verniz);
      material = tinta;
    } else if (papel === 'teto') {
      tetoTinta = criarTinta(flocosDa(lista, juncao), verniz);
      todos.push(tetoTinta);
      const malhaDaTinta = criarMalha(juncao.geometria, tetoTinta);
      const malhaDoVidro = criarMalha(juncao.geometria, vidro.material);
      malhaDoVidro.visible = false;
      teto = { tinta: malhaDaTinta, vidro: malhaDoVidro };
      continue;
    } else if (papel === 'vidro') {
      material = vidro.material;
    } else if (papel === 'farol' || papel === 'lanterna') {
      limparMaterial(original, manifesto, papel);
      const luz = luzDeMaterial(original, papel === 'farol' ? COR_DO_FAROL : COR_DA_LANTERNA, papel === 'farol' ? 9 : 5);
      acertarNormalMap(luz.material, lista[0]!.malha.geometry.getAttribute('tangent') !== undefined, juncao.tangentes);
      luzes.push({ tipo: papel, acender: luz.acender });
      material = luz.material;
    } else {
      limparMaterial(original, manifesto, papel);
      let final: MeshStandardMaterial = original;
      if (comRegioes) {
        const fisico = paraFisico(original);
        if (mascara) {
          fisico.clearcoat = verniz.intensidade;
          fisico.clearcoatRoughness = verniz.rugosidade;
        } else {
          fisico.clearcoat = Math.max(fisico.clearcoat, 1);
          fisico.clearcoatRoughness = 0.03;
        }
        const excluido = (mascara?.excluirMateriais ?? []).includes(original.name);
        // Com portas que abrem ou câmeras de dentro, a malha de casca única aparece por dentro: o verso
        // vira forro escuro, e o do vidro some (a vista atravessa o para-brisa e o teto de vidro).
        if (comInterior) fisico.side = DoubleSide;
        injetarMascara(fisico, {
          base: baseDaMascara, tolerancia: mascara?.tolerancia ?? 0.1, regioes, uniformes, tingir: Boolean(mascara) && !excluido, tingirMetal: mascara?.tingirMetal ?? false,
          verso: comInterior,
        });
        mascarados.push(fisico);
        final = fisico;
      }
      acertarNormalMap(final, lista[0]!.malha.geometry.getAttribute('tangent') !== undefined, juncao.tangentes);
      material = final;
    }
    if (!todos.includes(material)) todos.push(material);
    const malha = criarMalha(juncao.geometria, material);
    malha.name = `carrelio:${chave}`;
    if (papel === 'rack') rack.push(malha);
    await fatia();
  }
  if (tinta && !todos.includes(tinta)) todos.push(tinta);

  // ------------------------------------------------------------------ janelas
  // Vidro onde o arquivo deixou a janela vazada: quadriláteros no espaço do modelo, presos à
  // carroceria, com o vidro da cena. O vidro faz curva subindo pela janela (a primeira aresta do
  // quadrilátero), com o meio recuado para dentro: chato, ele refletia uma faixa de luz do estúdio
  // inteira, numa mancha clara que tomava a janela; curvo, a faixa vira uma linha, como num carro.
  // Para dentro, e não para fora, porque a moldura da lataria fica a 1 ou 2 cm do vidro.
  if (manifesto.janelas?.length) {
    const posicoes: number[] = [];
    const indices: number[] = [];
    // A parte de cada vértice: a janela da porta vai junto com a porta (a do centro do quadrilátero).
    const partesDosVertices: number[] = [];
    const centroDoCarro = caixa.getCenter(new Vector3());
    for (const quad of manifesto.janelas) {
      const [a, b, c, d] = quad.map((p) => new Vector3(...p)) as [Vector3, Vector3, Vector3, Vector3];
      const meio = new Vector3().add(a).add(b).add(c).add(d).multiplyScalar(0.25);
      const parte = parteDoPonto(meio.toArray());
      const paraDentro = new Vector3().subVectors(b, a).cross(new Vector3().subVectors(d, a)).normalize();
      if (paraDentro.dot(new Vector3().subVectors(centroDoCarro, meio)) < 0) paraDentro.negate();
      const base = posicoes.length / 3;
      const p = new Vector3();
      for (let i = 0; i <= LINHAS_DA_JANELA; i += 1) {
        const v = i / LINHAS_DA_JANELA;
        const recuo = CURVA_DA_JANELA * 4 * v * (1 - v);
        for (const [inicio, fim] of [[a, b], [d, c]] as const) {
          p.lerpVectors(inicio, fim, v).addScaledVector(paraDentro, recuo);
          posicoes.push(...noModelo([p.x, p.y, p.z], ajuste));
          partesDosVertices.push(parte);
        }
      }
      // Linha i: (a-b na linha i, d-c na linha i) = (k, k + 1); a ordem dos cantos é a do manifesto.
      for (let i = 0; i < LINHAS_DA_JANELA; i += 1) {
        const k = base + i * 2;
        indices.push(k, k + 2, k + 3, k, k + 3, k + 1);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(posicoes), 3));
    if (comOssos) {
      const n = posicoes.length / 3;
      const pesos = new Uint8Array(n * 4);
      const ossos = new Uint8Array(n * 4);
      for (let i = 0; i < n; i += 1) {
        pesos[i * 4] = 255;
        ossos[i * 4] = partesDosVertices[i]!;
      }
      g.setAttribute('skinIndex', new BufferAttribute(ossos, 4));
      g.setAttribute('skinWeight', new BufferAttribute(pesos, 4, true));
    }
    g.setIndex(indices);
    g.computeVertexNormals();
    g.computeBoundingBox();
    g.computeBoundingSphere();
    geometrias.push(g);
    triangulos += indices.length / 3;
    criarMalha(g, vidro.material).name = 'carrelio:janelas';
  }

  // ---------------------------------------------------------------- colisão
  const invisivel = new MeshBasicMaterial({ visible: false, side: 2 });
  todos.push(invisivel);
  const colisao: CarroMontado['colisao'] = [];
  const porParte = new Map<number, Fonte[]>();
  for (const f of fontes) porParte.set(f.parte, [...(porParte.get(f.parte) ?? []), f]);
  for (const [parte, lista] of porParte) {
    const juncao = juntar(
      lista.map((f) => ({ ...f, matriz: repousos[parte]!.clone().invert().multiply(f.matriz) })),
      false,
    );
    const simples = simplificarPorGrade(juncao.geometria.getAttribute('position').array as Float32Array, juncao.geometria.index!.array as Uint16Array | Uint32Array, 0.05 / ajuste.escala);
    juncao.geometria.dispose();
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(simples.posicoes, 3));
    g.setIndex(new BufferAttribute(simples.indices, 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    geometrias.push(g);
    const malha = new Mesh(g, invisivel);
    malha.visible = false;
    malha.name = `carrelio:colisao:${parte}`;
    partes[parte]!.add(malha);
    colisao.push({ malha, parte });
    await fatia();
  }

  // --------------------------------------------------------- fontes de luz
  const fontesDeLuz: FonteDeLuz[] = [];
  const noCarro = (p: Vector3) => p.clone().applyMatrix4(grupo.matrixWorld);
  for (const tipo of ['farol', 'lanterna'] as const) {
    // Luzes de material: um aglomerado de cada lado (x < 0, x ≥ 0).
    const lado = [new Box3(), new Box3()];
    const normais = [new Vector3(), new Vector3()];
    const partesDoLado = [new Map<number, number>(), new Map<number, number>()];
    const n = new Vector3();
    for (const f of fontes.filter((f) => f.papel === tipo)) {
      const p = f.malha.geometry.getAttribute('position');
      const normal = f.malha.geometry.getAttribute('normal');
      const nm = new Matrix3().getNormalMatrix(f.matriz);
      for (let i = 0; i < p.count; i += 1) {
        v.fromBufferAttribute(p, i).applyMatrix4(f.matriz);
        const s = v.x >= 0 ? 1 : 0;
        lado[s]!.expandByPoint(v);
        if (normal) normais[s]!.add(n.fromBufferAttribute(normal, i).applyMatrix3(nm));
        partesDoLado[s]!.set(f.parte, (partesDoLado[s]!.get(f.parte) ?? 0) + 1);
      }
    }
    lado.forEach((caixaDoLado, s) => {
      if (caixaDoLado.isEmpty()) return;
      const centro = caixaDoLado.getCenter(new Vector3());
      const parte = [...partesDoLado[s]!.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
      const repousoInverso = repousos[parte]!.clone().invert();
      const normal = normais[s]!.lengthSq() > 0 ? normais[s]!.clone().normalize() : new Vector3(0, 0, tipo === 'farol' ? 1 : -1);
      fontesDeLuz.push({
        tipo,
        noCarro: noCarro(centro),
        naPeca: centro.clone().applyMatrix4(repousoInverso),
        normal: normal.transformDirection(repousoInverso),
        tamanho: caixaDoLado.getSize(new Vector3()).length() * ajuste.escala,
        parte,
      });
    });
    // Luzes por região (modelo de IA): o centro de cada região, apontando para a frente ou para trás.
    const regioesDoTipo: readonly RegiaoDoCarro[] = tipo === 'farol' ? regioes.farol : regioes.lanterna;
    for (const r of regioesDoTipo) {
      const centroNoCarro = new Vector3(...r.centro);
      // A lanterna da tampa traseira vai com a tampa: o halo fica no osso da peça que contém a região.
      const parte = parteDoPonto(r.centro);
      const repousoInverso = repousos[parte]!.clone().invert();
      const lateral = Math.sign(r.centro[0]) * 0.32;
      fontesDeLuz.push({
        tipo,
        noCarro: centroNoCarro,
        naPeca: new Vector3(...noModelo(r.centro, ajuste)).applyMatrix4(repousoInverso),
        normal: new Vector3(lateral, 0, tipo === 'farol' ? 1 : -1).normalize().transformDirection(repousoInverso),
        tamanho: tamanhoDaRegiao(r),
        parte,
      });
    }
  }

  // O glTF original não é mais usado: as geometrias juntadas já têm tudo.
  modelo.remove(gltf.scene);
  for (const g of descartadas) g.dispose();

  return {
    grupo,
    partes,
    pecas,
    ajuste,
    caixa,
    silhueta,
    materiais: { tinta, tetoTinta, vidro, luzes, mascarados, todos },
    teto,
    tetoPorRegiao: regioes.teto.length > 0 && Boolean(mascara),
    rack,
    colisao,
    fontesDeLuz,
    triangulos,
    descartar() {
      const texturas = new Set<Texture>(texturasDoArquivo);
      for (const m of todos) {
        for (const valor of Object.values(m as unknown as Record<string, unknown>)) {
          if (valor && typeof valor === 'object' && 'isTexture' in valor) texturas.add(valor as Texture);
        }
        m.dispose();
      }
      for (const t of texturas) t.dispose();
      for (const g of geometrias) g.dispose();
      esqueleto?.dispose();
      grupo.removeFromParent();
    },
  };
}

