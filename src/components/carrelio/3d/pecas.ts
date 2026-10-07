import type { ContornoDaPeca, PecaPorNo, PecaPorRegiao } from './contrato';

/**
 * As peças recortadas da malha única (o modelo de IA não tem nós separados): o teste de um ponto do
 * carro contra os contornos de uma peça, o refino e o corte da malha na borda das peças (e a
 * separação dos triângulos) e o espelho de uma peça para o outro lado do carro. Puro, sem three.js,
 * para os testes.
 */

export const ehPecaPorRegiao = (p: PecaPorNo | PecaPorRegiao): p is PecaPorRegiao => 'contornos' in p;

type Ponto2 = readonly [number, number];

/** O ponto (u, v) está dentro do polígono? Regra par-ímpar: serve para polígono côncavo. */
export function dentroDoPoligono(u: number, v: number, pontos: readonly Ponto2[]): boolean {
  let dentro = false;
  for (let i = 0, j = pontos.length - 1; i < pontos.length; j = i, i += 1) {
    const a = pontos[i]!;
    const b = pontos[j]!;
    if (a[1] > v !== b[1] > v && u < ((b[0] - a[0]) * (v - a[1])) / (b[1] - a[1]) + a[0]) dentro = !dentro;
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

/**
 * A distância com sinal do ponto à borda do contorno, em metros: negativa dentro, positiva fora, zero
 * na borda. No plano, a distância ao polígono; na terceira coordenada, à faixa; o contorno é a
 * interseção dos dois (o maior). O sinal é o de `dentroDoContorno`.
 */
export function distanciaAoContorno(p: readonly number[], c: ContornoDaPeca): number {
  const eixos = EIXOS_DO_PLANO[c.plano];
  const u = p[eixos[0]]!;
  const v = p[eixos[1]]!;
  const w = p[eixos[2]]!;
  // Uma volta só: a menor distância (ao quadrado) a um lado e a regra par-ímpar de `dentroDoPoligono`.
  let menor = Infinity;
  let dentro = false;
  for (let i = 0, j = c.pontos.length - 1; i < c.pontos.length; j = i, i += 1) {
    const a = c.pontos[i]!;
    const b = c.pontos[j]!;
    if (a[1] > v !== b[1] > v && u < ((b[0] - a[0]) * (v - a[1])) / (b[1] - a[1]) + a[0]) dentro = !dentro;
    const du = a[0] - b[0];
    const dv = a[1] - b[1];
    const l2 = du * du + dv * dv;
    const t = l2 > 0 ? Math.min(1, Math.max(0, ((u - b[0]) * du + (v - b[1]) * dv) / l2)) : 0;
    const eu = u - b[0] - du * t;
    const ev = v - b[1] - dv * t;
    menor = Math.min(menor, eu * eu + ev * ev);
  }
  const noPlano = dentro ? -Math.sqrt(menor) : Math.sqrt(menor);
  return Math.max(noPlano, c.faixa[0] - w, w - c.faixa[1]);
}

/** A distância com sinal à borda da peça (a união dos contornos: o menor). */
export function distanciaAPeca(p: readonly number[], peca: Pick<PecaPorRegiao, 'contornos'>): number {
  let menor = Infinity;
  for (const c of peca.contornos) menor = Math.min(menor, distanciaAoContorno(p, c));
  return menor;
}

/** A peça (índice + 1) que contém o ponto, ou 0 (a carroceria). A primeira da lista ganha. */
export function pecaDoPonto(p: readonly number[], pecas: readonly Pick<PecaPorRegiao, 'contornos'>[]): number {
  for (let i = 0; i < pecas.length; i += 1) if (dentroDaPeca(p, pecas[i]!)) return i + 1;
  return 0;
}

export type Refino = {
  /** Os triângulos depois do refino e do corte, com índices no espaço de vértices estendido (os originais e os novos). */
  indices: Uint32Array;
  /** De quem é cada triângulo: 0 (a carroceria) ou i + 1 (a peça i). */
  dono: Uint8Array;
  /** Os vértices novos, na ordem em que nasceram: os dois pais de cada um (um pai pode ser um vértice novo mais velho). */
  pais: Uint32Array;
  /** Onde cada vértice novo fica entre os pais a e b: a + (b − a)·t. No refino, o meio (0,5); no corte, a borda. */
  pesos: Float64Array;
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
 * O maior lado de um triângulo na emenda de uma peça (m): a borda curva e os cantos da peça saem com
 * essa precisão (o corte em si é exato). Menor, mais triângulos e mais tempo de montagem.
 */
export const ARESTA_NA_EMENDA = 0.025;
/** Um ponto de corte mais perto que isto (em fração da aresta) de um canto fica no canto: sem lasca fina. */
const FRACAO_MINIMA = 1e-3;
/** Na borda, em metros: o vértice a menos que isto da borda conta como na borda. */
const NA_BORDA = 1e-7;

/**
 * Refina e corta a malha na borda das peças. A malha gerada por IA tem triângulos de até meio metro,
 * e um triângulo grande que cruza a emenda arrancaria uma lasca da lataria junto com a porta (ou
 * deixaria um buraco nela).
 *
 * 1. Refino: cada aresta longa de um triângulo que atravessa a borda é dividida no meio, e os
 *    vizinhos que dividem a mesma aresta também se repartem (refino vermelho-verde), até a borda
 *    ficar só com triângulos de até `arestaMaxima`. Assim a borda curva (o arco da roda) e os cantos
 *    ficam com a resolução de `arestaMaxima`.
 * 2. Corte: para cada peça, a aresta cujos cantos ficam de lados opostos da borda ganha um vértice
 *    exatamente na borda (pela distância com sinal, `distanciaAPeca`), e os triângulos se repartem
 *    nele. A borda vira uma linha, não uma escada de triângulos.
 * 3. Cada triângulo fica todo de um lado e vai para a primeira peça que o contém.
 *
 * O vértice novo de uma aresta é um só para os dois triângulos que a dividem: a malha continua
 * fechada, sem fresta nem junta em T, e fechada a peça fica idêntica ao arquivo.
 *
 * `pontos` no espaço do carro (três por vértice). Os vértices novos só dizem quem são os pais e onde
 * ficam entre eles (`pais` e `pesos`): os atributos (posição, normal, UV) de cada um se interpolam
 * dos pais, na ordem de `pais`.
 */
export function refinarNaFronteira(
  pontos: ArrayLike<number>,
  indices: ArrayLike<number>,
  pecas: readonly Pick<PecaPorRegiao, 'contornos'>[],
  arestaMaxima = ARESTA_NA_EMENDA,
  passadas = 8,
): Refino {
  const etapas = etapasDoRecorte(pontos, indices, pecas, arestaMaxima, passadas);
  for (;;) {
    const etapa = etapas.next();
    if (etapa.done) return etapa.value;
  }
}

/** Quantos triângulos uma etapa confere antes de devolver a vez (uns poucos milissegundos). */
const TRIANGULOS_POR_ETAPA = 12000;

/**
 * `refinarNaFronteira` em etapas: o gerador para (`yield`) a cada bloco de triângulos, para quem
 * monta o carro devolver a vez ao navegador entre um bloco e outro, e devolve o resultado no fim.
 */
export function* etapasDoRecorte(
  pontos: ArrayLike<number>,
  indices: ArrayLike<number>,
  pecas: readonly Pick<PecaPorRegiao, 'contornos'>[],
  arestaMaxima = ARESTA_NA_EMENDA,
  passadas = 8,
): Generator<void, Refino, void> {
  const p: number[] = Array.from(pontos);
  const pais: number[] = [];
  const pesos: number[] = [];
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
  const naCaixa = (cx: readonly number[], a: number, b: number, c: number) => {
    for (let k = 0; k < 3; k += 1) {
      const pa = p[a * 3 + k]!;
      const pb = p[b * 3 + k]!;
      const pc = p[c * 3 + k]!;
      if (Math.max(pa, pb, pc) < cx[k]! || Math.min(pa, pb, pc) > cx[k + 3]!) return false;
    }
    return true;
  };
  const pertoDeUmaPeca = (a: number, b: number, c: number) => perto.some((cx) => naCaixa(cx, a, b, c));
  const comprimento = (a: number, b: number) => {
    const dx = p[a * 3]! - p[b * 3]!;
    const dy = p[a * 3 + 1]! - p[b * 3 + 1]!;
    const dz = p[a * 3 + 2]! - p[b * 3 + 2]!;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };
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
  /** Um vértice novo entre a e b, a + (b − a)·t. */
  const entre = (a: number, b: number, t: number) => {
    const n = p.length / 3;
    for (let k = 0; k < 3; k += 1) p.push(p[a * 3 + k]! + (p[b * 3 + k]! - p[a * 3 + k]!) * t);
    donoDoVertice.push(-1);
    pais.push(a, b);
    pesos.push(t);
    return n;
  };
  /**
   * Reparte o triângulo (a, b, c) nos vértices novos das arestas (−1 onde a aresta fica inteira),
   * mantendo o sentido do original, e entrega cada pedaço a `um`. O quadrilátero que sobra de um
   * canto cortado se divide pela diagonal mais curta.
   */
  const repartir = (a: number, b: number, c: number, mab: number, mbc: number, mca: number, um: (a: number, b: number, c: number) => void) => {
    if (mab >= 0 && mbc >= 0 && mca >= 0) {
      um(a, mab, mca);
      um(mab, b, mbc);
      um(mca, mbc, c);
      um(mab, mbc, mca);
    } else if (mab >= 0 && mbc >= 0) {
      um(mab, b, mbc);
      if (comprimento(a, mbc) <= comprimento(mab, c)) {
        um(a, mab, mbc);
        um(a, mbc, c);
      } else {
        um(a, mab, c);
        um(mab, mbc, c);
      }
    } else if (mbc >= 0 && mca >= 0) {
      um(mca, mbc, c);
      if (comprimento(a, mbc) <= comprimento(b, mca)) {
        um(a, b, mbc);
        um(a, mbc, mca);
      } else {
        um(a, b, mca);
        um(b, mbc, mca);
      }
    } else if (mca >= 0 && mab >= 0) {
      um(a, mab, mca);
      if (comprimento(mab, c) <= comprimento(b, mca)) {
        um(mab, b, c);
        um(mab, c, mca);
      } else {
        um(mab, b, mca);
        um(b, c, mca);
      }
    } else if (mab >= 0) {
      um(a, mab, c);
      um(mab, b, c);
    } else if (mbc >= 0) {
      um(a, b, mbc);
      um(a, mbc, c);
    } else if (mca >= 0) {
      um(a, b, mca);
      um(mca, b, c);
    } else um(a, b, c);
  };

  // ------------------------------------------------------------------ 1. refino
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
    const lista = candidatos ?? Array.from({ length: tris.length / 3 }, (_, i) => i * 3);
    for (let i = 0; i < lista.length; i += 1) {
      conferir(lista[i]!);
      if (i % TRIANGULOS_POR_ETAPA === TRIANGULOS_POR_ETAPA - 1) yield;
    }
    if (dividir.size === 0) break;
    const meio = new Map<number, number>();
    const meioDe = (a: number, b: number) => {
      const k = chave(a, b);
      if (!dividir.has(k)) return -1;
      let m = meio.get(k);
      if (m === undefined) {
        m = entre(a, b, 0.5);
        meio.set(k, m);
      }
      return m;
    };
    const novos: number[] = [];
    const nascidos: number[] = [];
    const nascer = (a: number, b: number, c: number) => {
      nascidos.push(novos.length);
      novos.push(a, b, c);
    };
    for (let t = 0; t < tris.length; t += 3) {
      const a = tris[t]!;
      const b = tris[t + 1]!;
      const c = tris[t + 2]!;
      const mab = meioDe(a, b);
      const mbc = meioDe(b, c);
      const mca = meioDe(c, a);
      if (mab < 0 && mbc < 0 && mca < 0) novos.push(a, b, c);
      else repartir(a, b, c, mab, mbc, mca, nascer);
    }
    tris = novos;
    candidatos = nascidos;
    yield;
  }

  // ------------------------------------------------------- 2. corte e 3. donos
  let donos: number[] = new Array<number>(tris.length / 3).fill(0);
  for (let k = 0; k < pecas.length; k += 1) {
    const peca = pecas[k]!;
    const total = p.length / 3;
    // Fora da caixa da peça, o vértice está fora dela: o triângulo sem nenhum canto na caixa não muda.
    const cx = caixas[k]!;
    const naCaixaDaPeca = new Uint8Array(total);
    for (let i = 0; i < total; i += 1) {
      const x = p[i * 3]!;
      const y = p[i * 3 + 1]!;
      const z = p[i * 3 + 2]!;
      if (x >= cx[0] && x <= cx[3] && y >= cx[1] && y <= cx[4] && z >= cx[2] && z <= cx[5]) naCaixaDaPeca[i] = 1;
    }
    // A distância com sinal de cada vértice à borda da peça (NaN: ainda não medida). Os vértices
    // novos deste corte estão na borda.
    const s = new Float64Array(total).fill(Number.NaN);
    const distancia = (i: number) => {
      if (i >= total) return 0;
      let d = s[i]!;
      if (Number.isNaN(d)) {
        ponto[0] = p[i * 3]!;
        ponto[1] = p[i * 3 + 1]!;
        ponto[2] = p[i * 3 + 2]!;
        d = distanciaAPeca(ponto, peca);
        if (Math.abs(d) < NA_BORDA) d = 0;
        s[i] = d;
      }
      return d;
    };
    const relevantes: number[] = [];
    for (let t = 0; t < tris.length; t += 3) if (naCaixaDaPeca[tris[t]!] || naCaixaDaPeca[tris[t + 1]!] || naCaixaDaPeca[tris[t + 2]!]) relevantes.push(t);
    const opostos = (a: number, b: number) => {
      const da = distancia(a);
      const db = distancia(b);
      return (da < 0 && db > 0) || (da > 0 && db < 0);
    };
    // O corte quase no canto fica no canto (o vértice passa a contar como na borda).
    for (const t of relevantes) {
      for (let j = 0; j < 3; j += 1) {
        const a = tris[t + j]!;
        const b = tris[t + ((j + 1) % 3)]!;
        if (!opostos(a, b)) continue;
        const f = distancia(a) / (distancia(a) - distancia(b));
        if (f < FRACAO_MINIMA) s[a] = 0;
        else if (f > 1 - FRACAO_MINIMA) s[b] = 0;
      }
    }
    const corte = new Map<number, number>();
    const corteDe = (a: number, b: number) => {
      if (!opostos(a, b)) return -1;
      const k2 = chave(a, b);
      let m = corte.get(k2);
      if (m === undefined) {
        // O mesmo vértice para os dois triângulos da aresta, nos dois sentidos.
        const u = Math.min(a, b);
        const w = Math.max(a, b);
        m = entre(u, w, distancia(u) / (distancia(u) - distancia(w)));
        corte.set(k2, m);
      }
      return m;
    };
    const novos: number[] = [];
    const novosDonos: number[] = [];
    let dono = 0;
    const decidir = (a: number, b: number, c: number) => {
      novos.push(a, b, c);
      if (dono !== 0) {
        novosDonos.push(dono);
        return;
      }
      // Depois do corte, os cantos de cada triângulo ficam todos de um lado (ou na borda).
      const sa = distancia(a);
      const sb = distancia(b);
      const sc = distancia(c);
      if (sa < 0 || sb < 0 || sc < 0) novosDonos.push(k + 1);
      else if (sa > 0 || sb > 0 || sc > 0) novosDonos.push(0);
      else {
        // Deitado na borda: o centróide decide.
        ponto[0] = (p[a * 3]! + p[b * 3]! + p[c * 3]!) / 3;
        ponto[1] = (p[a * 3 + 1]! + p[b * 3 + 1]! + p[c * 3 + 1]!) / 3;
        ponto[2] = (p[a * 3 + 2]! + p[b * 3 + 2]! + p[c * 3 + 2]!) / 3;
        novosDonos.push(dentroDaPeca(ponto, peca) ? k + 1 : 0);
      }
    };
    let r = 0;
    for (let t = 0; t < tris.length; t += 3) {
      const a = tris[t]!;
      const b = tris[t + 1]!;
      const c = tris[t + 2]!;
      dono = donos[t / 3]!;
      if (relevantes[r] !== t) {
        novos.push(a, b, c);
        novosDonos.push(dono);
        continue;
      }
      r += 1;
      repartir(a, b, c, corteDe(a, b), corteDe(b, c), corteDe(c, a), decidir);
    }
    tris = novos;
    donos = novosDonos;
    yield;
  }
  return { indices: Uint32Array.from(tris), dono: Uint8Array.from(donos), pais: Uint32Array.from(pais), pesos: Float64Array.from(pesos) };
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
