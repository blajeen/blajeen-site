import type { ContornoDaPeca, PecaPorNo, PecaPorRegiao } from './contrato';

/**
 * As peças recortadas da malha única (o modelo de IA não tem nós separados): o teste de um ponto do
 * carro contra os contornos de uma peça, o refino da malha na borda das peças (e a separação dos
 * triângulos) e o espelho de uma peça para o outro lado do carro. Puro, sem three.js, para os testes.
 */

export const ehPecaPorRegiao = (p: PecaPorNo | PecaPorRegiao): p is PecaPorRegiao => 'contornos' in p;

type Ponto2 = readonly [number, number];

/** O ponto (u, v) está dentro do polígono? Regra par-ímpar: serve para polígono côncavo. */
export function dentroDoPoligono(u: number, v: number, pontos: readonly Ponto2[]): boolean {
  let dentro = false;
  for (let i = 0, j = pontos.length - 1; i < pontos.length; j = i, i += 1) {
    const [ui, vi] = pontos[i]!;
    const [uj, vj] = pontos[j]!;
    if (vi > v !== vj > v && u < ((uj - ui) * (v - vi)) / (vj - vi) + ui) dentro = !dentro;
  }
  return dentro;
}

/** Os índices (u, v, faixa) de cada plano no vetor (x, y, z) do carro. */
const EIXOS_DO_PLANO: Readonly<Record<ContornoDaPeca['plano'], readonly [number, number, number]>> = {
  zy: [2, 1, 0],
  xy: [0, 1, 2],
  xz: [0, 2, 1],
};

export function dentroDoContorno(p: readonly number[], c: ContornoDaPeca): boolean {
  const [iu, iv, iw] = EIXOS_DO_PLANO[c.plano];
  const w = p[iw]!;
  if (w < c.faixa[0] || w > c.faixa[1]) return false;
  return dentroDoPoligono(p[iu]!, p[iv]!, c.pontos);
}

export const dentroDaPeca = (p: readonly number[], peca: Pick<PecaPorRegiao, 'contornos'>): boolean => peca.contornos.some((c) => dentroDoContorno(p, c));

/** A peça (índice + 1) que contém o ponto, ou 0 (a carroceria). A primeira da lista ganha. */
export function pecaDoPonto(p: readonly number[], pecas: readonly Pick<PecaPorRegiao, 'contornos'>[]): number {
  for (let i = 0; i < pecas.length; i += 1) if (dentroDaPeca(p, pecas[i]!)) return i + 1;
  return 0;
}

export type Refino = {
  /** Os triângulos depois do refino, com índices no espaço de vértices estendido (os originais e os novos). */
  indices: Uint32Array;
  /** De quem é cada triângulo: 0 (a carroceria) ou i + 1 (a peça i), pelo centróide. */
  dono: Uint8Array;
  /** Os vértices novos, na ordem em que nasceram: os dois pais de cada um (o novo é o meio deles). */
  pais: Uint32Array;
};

/** A caixa (mínimos e máximos no espaço do carro) de uma peça, com folga. */
function caixaDaPeca(peca: Pick<PecaPorRegiao, 'contornos'>, folga: number): [number, number, number, number, number, number] {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const c of peca.contornos) {
    const [iu, iv, iw] = EIXOS_DO_PLANO[c.plano];
    for (const [u, v] of c.pontos) {
      min[iu] = Math.min(min[iu]!, u);
      max[iu] = Math.max(max[iu]!, u);
      min[iv] = Math.min(min[iv]!, v);
      max[iv] = Math.max(max[iv]!, v);
    }
    min[iw] = Math.min(min[iw]!, c.faixa[0]);
    max[iw] = Math.max(max[iw]!, c.faixa[1]);
  }
  return [min[0]! - folga, min[1]! - folga, min[2]! - folga, max[0]! + folga, max[1]! + folga, max[2]! + folga];
}

/**
 * Refina a malha onde ela atravessa a borda de uma peça: a malha gerada por IA tem triângulos de até
 * meio metro, e um triângulo grande que cruza a emenda arrancaria uma lasca da lataria junto com a
 * porta (ou deixaria um buraco nela). Cada aresta longa de um triângulo que atravessa a borda é
 * dividida no meio, e os vizinhos que dividem a mesma aresta também se repartem (refino
 * vermelho-verde), até a borda ficar só com triângulos de até `arestaMaxima`. O vértice do meio de
 * uma aresta é um só para os dois triângulos que a dividem: a malha continua fechada, sem fresta nem
 * junta em T, e fechada a peça fica idêntica ao arquivo. Depois, cada triângulo vai para a peça do
 * seu centróide.
 *
 * `pontos` no espaço do carro (três por vértice). Os vértices novos só dizem quem são os pais: os
 * atributos (posição, normal, UV) de cada um são a média dos pais, na ordem de `pais`.
 */
export function refinarNaFronteira(
  pontos: ArrayLike<number>,
  indices: ArrayLike<number>,
  pecas: readonly Pick<PecaPorRegiao, 'contornos'>[],
  arestaMaxima = 0.02,
  passadas = 8,
): Refino {
  const p: number[] = Array.from(pontos);
  const pais: number[] = [];
  const donoDoVertice: number[] = new Array<number>(p.length / 3).fill(-1);
  // A caixa de cada peça descarta de cara quase todos os pontos: o polígono só é medido dentro dela.
  const caixas = pecas.map((peca) => caixaDaPeca(peca, 0));
  const perto = pecas.map((peca) => caixaDaPeca(peca, arestaMaxima));
  const ponto = [0, 0, 0];
  const donoNoPonto = (x: number, y: number, z: number) => {
    for (let i = 0; i < pecas.length; i += 1) {
      const c = caixas[i]!;
      if (x < c[0] || x > c[3] || y < c[1] || y > c[4] || z < c[2] || z > c[5]) continue;
      ponto[0] = x;
      ponto[1] = y;
      ponto[2] = z;
      if (dentroDaPeca(ponto, pecas[i]!)) return i + 1;
    }
    return 0;
  };
  const donoDe = (i: number) => {
    let d = donoDoVertice[i]!;
    if (d < 0) {
      d = donoNoPonto(p[i * 3]!, p[i * 3 + 1]!, p[i * 3 + 2]!);
      donoDoVertice[i] = d;
    }
    return d;
  };
  const pertoDeUmaPeca = (a: number, b: number, c: number) => {
    for (const cx of perto) {
      let fora = false;
      for (let k = 0; k < 3 && !fora; k += 1) {
        const pa = p[a * 3 + k]!;
        const pb = p[b * 3 + k]!;
        const pc = p[c * 3 + k]!;
        if (Math.max(pa, pb, pc) < cx[k]! || Math.min(pa, pb, pc) > cx[k + 3]!) fora = true;
      }
      if (!fora) return true;
    }
    return false;
  };
  const comprimento = (a: number, b: number) => Math.hypot(p[a * 3]! - p[b * 3]!, p[a * 3 + 1]! - p[b * 3 + 1]!, p[a * 3 + 2]! - p[b * 3 + 2]!);
  const meioTem = (i: number, j: number, d: number) => donoNoPonto((p[i * 3]! + p[j * 3]!) / 2, (p[i * 3 + 1]! + p[j * 3 + 1]!) / 2, (p[i * 3 + 2]! + p[j * 3 + 2]!) / 2) === d;
  /** O triângulo cruza a borda de uma peça? Os cantos, e nos grandes também os meios das arestas e o centro. */
  const atravessa = (a: number, b: number, c: number) => {
    const d = donoDe(a);
    if (donoDe(b) !== d || donoDe(c) !== d) return true;
    if (Math.max(comprimento(a, b), comprimento(b, c), comprimento(c, a)) <= arestaMaxima || !pertoDeUmaPeca(a, b, c)) return false;
    if (!meioTem(a, b, d) || !meioTem(b, c, d) || !meioTem(c, a, d)) return true;
    return donoNoPonto((p[a * 3]! + p[b * 3]! + p[c * 3]!) / 3, (p[a * 3 + 1]! + p[b * 3 + 1]! + p[c * 3 + 1]!) / 3, (p[a * 3 + 2]! + p[b * 3 + 2]! + p[c * 3 + 2]!) / 3) !== d;
  };
  const chave = (a: number, b: number) => (a < b ? a * 4194304 + b : b * 4194304 + a);

  let tris: number[] = Array.from(indices);
  // Só os triângulos que nasceram na passada anterior podem precisar de outra (na primeira, todos).
  let candidatos: number[] | null = null;
  for (let passada = 0; passada < passadas; passada += 1) {
    const dividir = new Set<number>();
    const conferir = (t: number) => {
      const a = tris[t]!;
      const b = tris[t + 1]!;
      const c = tris[t + 2]!;
      if (!atravessa(a, b, c)) return;
      if (comprimento(a, b) > arestaMaxima) dividir.add(chave(a, b));
      if (comprimento(b, c) > arestaMaxima) dividir.add(chave(b, c));
      if (comprimento(c, a) > arestaMaxima) dividir.add(chave(c, a));
    };
    if (candidatos) for (const t of candidatos) conferir(t);
    else for (let t = 0; t < tris.length; t += 3) conferir(t);
    if (dividir.size === 0) break;
    const meio = new Map<number, number>();
    const meioDe = (a: number, b: number) => {
      const k = chave(a, b);
      if (!dividir.has(k)) return -1;
      let m = meio.get(k);
      if (m === undefined) {
        m = p.length / 3;
        p.push((p[a * 3]! + p[b * 3]!) / 2, (p[a * 3 + 1]! + p[b * 3 + 1]!) / 2, (p[a * 3 + 2]! + p[b * 3 + 2]!) / 2);
        donoDoVertice.push(-1);
        pais.push(a, b);
        meio.set(k, m);
      }
      return m;
    };
    const novos: number[] = [];
    const nascidos: number[] = [];
    const nascer = (...v: number[]) => {
      for (let i = 0; i < v.length; i += 3) {
        nascidos.push(novos.length);
        novos.push(v[i]!, v[i + 1]!, v[i + 2]!);
      }
    };
    for (let t = 0; t < tris.length; t += 3) {
      const a = tris[t]!;
      const b = tris[t + 1]!;
      const c = tris[t + 2]!;
      const mab = meioDe(a, b);
      const mbc = meioDe(b, c);
      const mca = meioDe(c, a);
      // Os triângulos novos mantêm o sentido do original (a, b, c).
      if (mab >= 0 && mbc >= 0 && mca >= 0) nascer(a, mab, mca, mab, b, mbc, mca, mbc, c, mab, mbc, mca);
      else if (mab >= 0 && mbc >= 0) nascer(mab, b, mbc, a, mab, mbc, a, mbc, c);
      else if (mbc >= 0 && mca >= 0) nascer(mca, mbc, c, a, b, mbc, a, mbc, mca);
      else if (mca >= 0 && mab >= 0) nascer(a, mab, mca, mab, b, c, mab, c, mca);
      else if (mab >= 0) nascer(a, mab, c, mab, b, c);
      else if (mbc >= 0) nascer(a, b, mbc, a, mbc, c);
      else if (mca >= 0) nascer(a, b, mca, mca, b, c);
      else novos.push(a, b, c);
    }
    tris = novos;
    candidatos = nascidos;
  }

  const dono = new Uint8Array(tris.length / 3);
  for (let t = 0; t < tris.length; t += 3) {
    const a = tris[t]!;
    const b = tris[t + 1]!;
    const c = tris[t + 2]!;
    // Longe de toda peça, o canto já responde; perto, o centróide decide.
    const d = donoDe(a);
    dono[t / 3] = d === donoDe(b) && d === donoDe(c) && !pertoDeUmaPeca(a, b, c)
      ? d
      : donoNoPonto((p[a * 3]! + p[b * 3]! + p[c * 3]!) / 3, (p[a * 3 + 1]! + p[b * 3 + 1]! + p[c * 3 + 1]!) / 3, (p[a * 3 + 2]! + p[b * 3 + 2]! + p[c * 3 + 2]!) / 3);
  }
  return { indices: Uint32Array.from(tris), dono, pais: Uint32Array.from(pais) };
}

/**
 * A mesma peça do outro lado do carro (espelho em x = 0): os contornos e a dobradiça trocam o sinal
 * de x, e o giro troca de sentido (uma porta da esquerda que abre com −65° abre, na direita, com
 * +65° em volta do mesmo eixo vertical).
 */
export function espelharPeca(peca: PecaPorRegiao): PecaPorRegiao {
  const contornos = peca.contornos.map((c): ContornoDaPeca => {
    if (c.plano === 'zy') return { ...c, faixa: [-c.faixa[1], -c.faixa[0]] };
    return { ...c, pontos: c.pontos.map(([u, v]) => [-u, v] as const) };
  });
  // Espelhar em x inverte o sentido do giro em volta de y e de z; em volta de x, o sentido fica.
  const graus = peca.eixo === 'x' ? peca.graus : -peca.graus;
  return { ...peca, contornos, dobradica: [-peca.dobradica[0], peca.dobradica[1], peca.dobradica[2]], graus };
}

export function pecaValida(peca: PecaPorRegiao): boolean {
  const numeros = [...peca.dobradica, peca.graus, ...peca.contornos.flatMap((c) => [...c.faixa, ...c.pontos.flat()])];
  if (!numeros.every((n) => Number.isFinite(n))) return false;
  return peca.contornos.length > 0 && peca.contornos.every((c) => c.pontos.length >= 3 && c.faixa[0] < c.faixa[1]);
}
