import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PORTAS } from '@/lib/carrelio/tipos';
import { simplificarPorGrade } from './colisao';
import type { PecaPorRegiao } from './contrato';
import { ajusteDoModelo, caixaDosNos, lerGlb, matrizesDosNos, noCarro, transformar } from './manifesto';
import { MODELO_JAECOO_5 } from './modelos';
import { dentroDaPeca, dentroDoContorno, dentroDoPoligono, distanciaAPeca, ehPecaPorRegiao, espelharPeca, pecaDoPonto, pecaValida, refinarNaFronteira } from './pecas';

/** Uma porta da esquerda (x > 0,7), de lado: um retângulo de z −0,16 a 0,92 e y de 0,37 a 1,25. */
const PORTA: PecaPorRegiao = {
  contornos: [{ plano: 'zy', pontos: [[0.92, 0.37], [0.92, 1.25], [-0.16, 1.25], [-0.16, 0.37]], faixa: [0.7, 1.2] }],
  dobradica: [0.9, 0.8, 0.92],
  eixo: 'y',
  graus: -65,
};

describe('as peças recortadas da malha', () => {
  it('acha o ponto dentro de um polígono côncavo', () => {
    // Um "L": o canto de dentro fica fora.
    const ele = [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]] as const;
    expect(dentroDoPoligono(0.5, 0.5, ele)).toBe(true);
    expect(dentroDoPoligono(1.5, 0.5, ele)).toBe(true);
    expect(dentroDoPoligono(0.5, 1.5, ele)).toBe(true);
    expect(dentroDoPoligono(1.5, 1.5, ele)).toBe(false);
    expect(dentroDoPoligono(-0.1, 0.5, ele)).toBe(false);
  });

  it('mede cada plano com a faixa da coordenada que sobra', () => {
    expect(dentroDoContorno([0.9, 0.8, 0.3], PORTA.contornos[0]!)).toBe(true);
    // O banco (x 0,4) está atrás da porta, de lado, mas fora da faixa.
    expect(dentroDoContorno([0.4, 0.8, 0.3], PORTA.contornos[0]!)).toBe(false);
    const tampa = { plano: 'xy' as const, pontos: [[-0.6, 0.7], [0.6, 0.7], [0.6, 1.7], [-0.6, 1.7]] as const, faixa: [-2.5, -1.7] as const };
    expect(dentroDoContorno([0.2, 1.2, -2.1], tampa)).toBe(true);
    expect(dentroDoContorno([0.2, 1.2, -1.5], tampa)).toBe(false);
    const teto = { plano: 'xz' as const, pontos: [[-0.5, -1.5], [0.5, -1.5], [0.5, 0.4], [-0.5, 0.4]] as const, faixa: [1.6, 1.8] as const };
    expect(dentroDoContorno([0, 1.7, 0], teto)).toBe(true);
    expect(dentroDoContorno([0, 1.2, 0], teto)).toBe(false);
  });

  it('acha a peça de um ponto: a primeira da lista que o contém', () => {
    expect(pecaDoPonto([0.9, 0.8, 0.3], [{ contornos: [] }, PORTA])).toBe(2);
    expect(pecaDoPonto([0.4, 0.8, 0.3], [PORTA])).toBe(0);
  });

  it('mede a distância com sinal à borda: negativa dentro, positiva fora, e a faixa conta', () => {
    // Dentro, o mais perto é a face de dentro da faixa (x 0,7), a 0,2 m.
    expect(distanciaAPeca([0.9, 0.8, 0.3], PORTA)).toBeCloseTo(-0.2, 9);
    expect(distanciaAPeca([0.9, 0.8, 0.95], PORTA)).toBeCloseTo(0.03, 9);
    expect(distanciaAPeca([0.6, 0.8, 0.3], PORTA)).toBeCloseTo(0.1, 9);
    expect(distanciaAPeca([0.9, 1.25, 0.3], PORTA)).toBeCloseTo(0, 9);
    for (const p of [[0.9, 0.8, 0.3], [0.4, 0.8, 0.3], [0.9, 0.3, 0], [1.0, 1.0, -0.5]]) expect(distanciaAPeca(p, PORTA) < 0).toBe(dentroDaPeca(p, PORTA));
  });

  it('refina a malha só na emenda e corta exatamente na borda, sem fresta nem junta em T', () => {
    // Um quadrado de 1 m na lateral (x 0,9), em dois triângulos, cortado pela borda de uma peça (z > 0,013).
    const pontos = [0.9, 0.4, -0.5, 0.9, 0.4, 0.5, 0.9, 1.4, 0.5, 0.9, 1.4, -0.5];
    const indices = [0, 1, 2, 0, 2, 3];
    const borda = 0.013;
    const peca = { contornos: [{ plano: 'zy' as const, pontos: [[borda, 0], [1, 0], [1, 2], [borda, 2]] as const, faixa: [0.7, 1.2] as const }] };
    const aresta = 0.05;
    const r = refinarNaFronteira(pontos, indices, [peca], aresta);
    expect(r.pesos).toHaveLength(r.pais.length / 2);
    // As posições de todos os vértices: cada novo fica entre os pais, no peso dado.
    const p = [...pontos];
    for (let k = 0; k < r.pais.length / 2; k += 1) {
      const a = r.pais[k * 2]!;
      const b = r.pais[k * 2 + 1]!;
      const t = r.pesos[k]!;
      for (let e = 0; e < 3; e += 1) p.push(p[a * 3 + e]! + (p[b * 3 + e]! - p[a * 3 + e]!) * t);
    }
    const ponto = (i: number) => [p[i * 3]!, p[i * 3 + 1]!, p[i * 3 + 2]!] as const;
    let area = 0;
    let areaDaPeca = 0;
    const arestas = new Map<string, number>();
    for (let t = 0; t < r.indices.length; t += 3) {
      const [a, b, c] = [r.indices[t]!, r.indices[t + 1]!, r.indices[t + 2]!];
      const [pa, pb, pc] = [ponto(a), ponto(b), ponto(c)];
      // Na lateral (x constante), a área com sinal no plano zy: o sentido de cada triângulo é o do original.
      const dobro = (pb[2] - pa[2]) * (pc[1] - pa[1]) - (pc[2] - pa[2]) * (pb[1] - pa[1]);
      expect(dobro).toBeGreaterThan(0);
      area += dobro / 2;
      // Cada triângulo fica todo de um lado da borda, e é da peça só se fica do lado de dentro.
      const dono = r.dono[t / 3]!;
      const zs = [pa[2], pb[2], pc[2]];
      if (dono === 1) {
        expect(Math.min(...zs)).toBeGreaterThanOrEqual(borda - 1e-12);
        areaDaPeca += dobro / 2;
      } else {
        expect(dono).toBe(0);
        expect(Math.max(...zs)).toBeLessThanOrEqual(borda + 1e-12);
      }
      // Perto da emenda, só triângulos pequenos.
      const lados = [[pa, pb], [pb, pc], [pc, pa]].map(([u, w]) => Math.hypot(u![1] - w![1], u![2] - w![2]));
      if (zs.some((z) => Math.abs(z - borda) < 1e-12)) expect(Math.max(...lados)).toBeLessThanOrEqual(aresta);
      for (const [u, w] of [[a, b], [b, c], [c, a]] as const) {
        const k = u < w ? `${u}-${w}` : `${w}-${u}`;
        arestas.set(k, (arestas.get(k) ?? 0) + 1);
      }
    }
    expect(area).toBeCloseTo(1, 9);
    // A peça leva exatamente a faixa de z 0,013 a 0,5: a borda é uma linha, não uma escada.
    expect(areaDaPeca).toBeCloseTo(0.5 - borda, 9);
    // Fechada: toda aresta de dentro é de dois triângulos; as de um só ficam na borda do quadrado.
    for (const [k, n] of arestas) {
      if (n === 2) continue;
      const [u, w] = k.split('-').map(Number) as [number, number];
      const naBorda = (i: number, j: number) => ([1, 2] as const).some((eixo) => ponto(i)[eixo] === ponto(j)[eixo] && [0.4, 1.4, -0.5, 0.5].includes(ponto(i)[eixo]));
      expect(n).toBe(1);
      expect(naBorda(u, w)).toBe(true);
    }
  });

  it('corta só onde a borda passa, e o corte quase no canto fica no canto', () => {
    // Um triângulo grande com um canto 0,1 mm dentro da peça: nada de lasca de 0,1 mm.
    const pontos = [0.9, 0.5, -0.0001, 0.9, 0.5, -0.3, 0.9, 0.8, -0.0001];
    const r = refinarNaFronteira(pontos, [0, 1, 2], [{ contornos: [{ plano: 'zy', pontos: [[-0.0002, 0], [1, 0], [1, 2], [-0.0002, 2]], faixa: [0.7, 1.2] }] }], 0.5);
    expect(r.indices).toHaveLength(3);
    expect(Array.from(r.dono)).toEqual([0]);
  });

  it('não mexe na malha longe das peças', () => {
    const pontos = [0.9, 0.4, 1.5, 0.9, 0.4, 2.0, 0.9, 1.0, 2.0];
    const r = refinarNaFronteira(pontos, [0, 1, 2], [PORTA], 0.02);
    expect(Array.from(r.indices)).toEqual([0, 1, 2]);
    expect(r.pais).toHaveLength(0);
    expect(Array.from(r.dono)).toEqual([0]);
  });

  it('espelha a peça para o outro lado, invertendo o giro em volta do eixo vertical', () => {
    const direita = espelharPeca(PORTA);
    expect(direita.contornos[0]!.faixa).toEqual([-1.2, -0.7]);
    expect(direita.dobradica).toEqual([-0.9, 0.8, 0.92]);
    expect(direita.graus).toBe(65);
    expect(dentroDaPeca([-0.9, 0.8, 0.3], direita)).toBe(true);
    expect(dentroDaPeca([0.9, 0.8, 0.3], direita)).toBe(false);
    const tampa: PecaPorRegiao = { ...PORTA, eixo: 'x', graus: 75, contornos: [{ plano: 'xy', pontos: [[0.1, 0], [0.6, 0], [0.6, 1]], faixa: [-3, -1] }] };
    const espelhada = espelharPeca(tampa);
    expect(espelhada.graus).toBe(75);
    expect(espelhada.contornos[0]!.pontos[1]).toEqual([-0.6, 0]);
  });

  it('confere a peça e distingue a peça por região da peça por nó', () => {
    expect(pecaValida(PORTA)).toBe(true);
    expect(pecaValida({ ...PORTA, contornos: [] })).toBe(false);
    expect(pecaValida({ ...PORTA, contornos: [{ ...PORTA.contornos[0]!, faixa: [1, 0] }] })).toBe(false);
    expect(pecaValida({ ...PORTA, graus: Number.NaN })).toBe(false);
    expect(ehPecaPorRegiao(PORTA)).toBe(true);
    expect(ehPecaPorRegiao({ no: 'Porta', eixo: 'z', graus: 60 })).toBe(false);
  });
});

// ------------------------------------------------------------------ no arquivo de verdade

/** Os triângulos do Jaecoo 5 no espaço do carro, como a montagem os vê (a malha única do arquivo). */
function malhaDoJaecoo() {
  const m = MODELO_JAECOO_5;
  const glb = lerGlb(readFileSync(join(process.cwd(), 'public', m.url)));
  const rotacao = m.rotacao ? { rotacao: m.rotacao } : {};
  const ajuste = ajusteDoModelo(caixaDosNos(glb, { excluir: m.esconder, ...rotacao })!, m.comprimentoM);
  const mundo = matrizesDosNos(glb.json, m.rotacao);
  const bin = glb.binario!;
  const dados = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
  const inicioDo = (i: number) => {
    const a = glb.json.accessors![i]!;
    const v = glb.json.bufferViews![a.bufferView!]!;
    return { a, inicio: (v.byteOffset ?? 0) + (a.byteOffset ?? 0), passo: v.byteStride };
  };
  const pontos: number[] = [];
  const indices: number[] = [];
  glb.json.nodes!.forEach((no, n) => {
    if (no.mesh === undefined || m.esconder.includes(no.name ?? '')) return;
    for (const primitiva of glb.json.meshes![no.mesh]!.primitives) {
      const base = pontos.length / 3;
      const pos = inicioDo(primitiva.attributes['POSITION']!);
      for (let i = 0; i < pos.a.count; i += 1) {
        const o = pos.inicio + i * (pos.passo ?? 12);
        pontos.push(...noCarro(transformar(mundo.get(n)!, [dados.getFloat32(o, true), dados.getFloat32(o + 4, true), dados.getFloat32(o + 8, true)]), ajuste));
      }
      const ind = inicioDo(primitiva.indices!);
      for (let i = 0; i < ind.a.count; i += 1) indices.push(base + (ind.a.componentType === 5125 ? dados.getUint32(ind.inicio + i * 4, true) : dados.getUint16(ind.inicio + i * 2, true)));
    }
  });
  return { pontos, indices };
}

/** O raio (origem, direção) acerta o triângulo? A distância, ou null (Möller–Trumbore, dos dois lados). */
function raioNoTriangulo(o: readonly number[], d: readonly number[], a: readonly number[], b: readonly number[], c: readonly number[]): number | null {
  const e1 = [b[0]! - a[0]!, b[1]! - a[1]!, b[2]! - a[2]!];
  const e2 = [c[0]! - a[0]!, c[1]! - a[1]!, c[2]! - a[2]!];
  const p = [d[1]! * e2[2]! - d[2]! * e2[1]!, d[2]! * e2[0]! - d[0]! * e2[2]!, d[0]! * e2[1]! - d[1]! * e2[0]!];
  const det = e1[0]! * p[0]! + e1[1]! * p[1]! + e1[2]! * p[2]!;
  if (Math.abs(det) < 1e-12) return null;
  const s = [o[0]! - a[0]!, o[1]! - a[1]!, o[2]! - a[2]!];
  const u = (s[0]! * p[0]! + s[1]! * p[1]! + s[2]! * p[2]!) / det;
  if (u < 0 || u > 1) return null;
  const q = [s[1]! * e1[2]! - s[2]! * e1[1]!, s[2]! * e1[0]! - s[0]! * e1[2]!, s[0]! * e1[1]! - s[1]! * e1[0]!];
  const v = (d[0]! * q[0]! + d[1]! * q[1]! + d[2]! * q[2]!) / det;
  if (v < 0 || u + v > 1) return null;
  const t = (e2[0]! * q[0]! + e2[1]! * q[1]! + e2[2]! * q[2]!) / det;
  return t > 0 ? t : null;
}

/** Gira o ponto em volta da dobradiça da peça (aberta), pela regra da mão direita. */
function abrir(p: readonly number[], peca: PecaPorRegiao): [number, number, number] {
  const r = (peca.graus * Math.PI) / 180;
  const [cos, sen] = [Math.cos(r), Math.sin(r)];
  const [x, y, z] = [p[0]! - peca.dobradica[0], p[1]! - peca.dobradica[1], p[2]! - peca.dobradica[2]];
  const g = peca.eixo === 'x' ? [x, y * cos - z * sen, y * sen + z * cos] : peca.eixo === 'y' ? [x * cos + z * sen, y, -x * sen + z * cos] : [x * cos - y * sen, x * sen + y * cos, z];
  return [g[0]! + peca.dobradica[0], g[1]! + peca.dobradica[1], g[2]! + peca.dobradica[2]];
}

describe('as peças do Jaecoo 5, recortadas do arquivo de verdade', () => {
  const ids = PORTAS.filter((id) => MODELO_JAECOO_5.portas[id] && ehPecaPorRegiao(MODELO_JAECOO_5.portas[id]!));
  const pecas = ids.map((id) => MODELO_JAECOO_5.portas[id] as PecaPorRegiao);
  const { pontos, indices } = malhaDoJaecoo();
  const r = refinarNaFronteira(pontos, indices, pecas);
  // As posições de todos os vértices, os novos entre os pais.
  const p = [...pontos];
  for (let k = 0; k < r.pais.length / 2; k += 1) {
    const a = r.pais[k * 2]!;
    const b = r.pais[k * 2 + 1]!;
    for (let e = 0; e < 3; e += 1) p.push(p[a * 3 + e]! + (p[b * 3 + e]! - p[a * 3 + e]!) * r.pesos[k]!);
  }
  const ponto = (i: number) => [p[i * 3]!, p[i * 3 + 1]!, p[i * 3 + 2]!] as const;
  const area = (a: number, b: number, c: number) => {
    const [pa, pb, pc] = [ponto(a), ponto(b), ponto(c)];
    const u = [pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]];
    const w = [pc[0] - pa[0], pc[1] - pa[1], pc[2] - pa[2]];
    return Math.hypot(u[1]! * w[2]! - u[2]! * w[1]!, u[2]! * w[0]! - u[0]! * w[2]!, u[0]! * w[1]! - u[1]! * w[0]!) / 2;
  };
  /** O comprimento das arestas de um triângulo só (a borda aberta da malha). */
  const bordaAberta = (tris: ArrayLike<number>) => {
    const arestas = new Map<number, number>();
    for (let t = 0; t < tris.length; t += 3) {
      for (let j = 0; j < 3; j += 1) {
        const [u, w] = [tris[t + j]!, tris[t + ((j + 1) % 3)]!];
        const k = u < w ? u * 4194304 + w : w * 4194304 + u;
        arestas.set(k, (arestas.get(k) ?? 0) + 1);
      }
    }
    let total = 0;
    for (const [k, n] of arestas) {
      if (n !== 1) continue;
      const [u, w] = [Math.floor(k / 4194304), k % 4194304];
      total += Math.hypot(...[0, 1, 2].map((e) => ponto(u)[e]! - ponto(w)[e]!));
    }
    return total;
  };
  const triangulosDa = (parte: number) => {
    const lista: number[] = [];
    r.dono.forEach((d, t) => {
      if (d === parte) lista.push(r.indices[t * 3]!, r.indices[t * 3 + 1]!, r.indices[t * 3 + 2]!);
    });
    return lista;
  };
  const areaDa = (tris: readonly number[]) => {
    let soma = 0;
    for (let t = 0; t < tris.length; t += 3) soma += area(tris[t]!, tris[t + 1]!, tris[t + 2]!);
    return soma;
  };

  it('tem as cinco peças por região, cada uma com a sua parte da malha', () => {
    expect(ids).toEqual(['dianteiraEsquerda', 'dianteiraDireita', 'traseiraEsquerda', 'traseiraDireita', 'portaMalas']);
    const areas = ids.map((_, i) => areaDa(triangulosDa(i + 1)));
    for (const a of areas) expect(a).toBeGreaterThan(0.3);
    // O arquivo não é simétrico, mas as portas dos dois lados levam quase a mesma área.
    expect(areas[0]! / areas[1]!).toBeCloseTo(1, 1);
    expect(areas[2]! / areas[3]!).toBeCloseTo(1, 1);
  });

  it('recorta sem perder nem abrir a malha: a mesma área e a mesma borda aberta', () => {
    let antes = 0;
    for (let t = 0; t < indices.length; t += 3) antes += area(indices[t]!, indices[t + 1]!, indices[t + 2]!);
    let depois = 0;
    for (let t = 0; t < r.indices.length; t += 3) depois += area(r.indices[t]!, r.indices[t + 1]!, r.indices[t + 2]!);
    expect(depois / antes).toBeCloseTo(1, 9);
    expect(bordaAberta(r.indices) / bordaAberta(indices)).toBeCloseTo(1, 9);
  });

  it('corta na linha dos contornos: o vértice da emenda fica na borda da peça', () => {
    const donos = new Map<number, Set<number>>();
    r.dono.forEach((d, t) => {
      for (let j = 0; j < 3; j += 1) {
        const v = r.indices[t * 3 + j]!;
        const s = donos.get(v) ?? new Set<number>();
        s.add(d);
        donos.set(v, s);
      }
    });
    const erros: number[] = [];
    for (const [v, ds] of donos) {
      if (ds.size < 2) continue;
      for (const d of ds) if (d > 0) erros.push(Math.abs(distanciaAPeca(ponto(v), pecas[d - 1]!)));
    }
    erros.sort((a, b) => a - b);
    expect(erros.length).toBeGreaterThan(1000);
    // Na linha reta, o corte é exato; nos cantos e nas curvas, a aresta de 2,5 cm deixa uns milímetros.
    expect(erros[Math.floor(erros.length / 2)]).toBeLessThan(1e-9);
    expect(erros[Math.floor(erros.length * 0.99)]).toBeLessThan(0.003);
    expect(erros.at(-1)).toBeLessThan(0.01);
  });

  it('deixa a cabine na carroceria: bancos, painel e assoalho do meio não vão com as portas', () => {
    for (let t = 0; t < r.indices.length; t += 3) {
      const d = r.dono[t / 3]!;
      if (d === 0 || d === 5) continue;
      const x = (ponto(r.indices[t]!)[0] + ponto(r.indices[t + 1]!)[0] + ponto(r.indices[t + 2]!)[0]) / 3;
      expect(Math.abs(x)).toBeGreaterThan(0.68);
    }
  });

  it('abre cada peça para fora (as portas) ou para cima (a tampa), sem entrar na cabine', () => {
    pecas.forEach((peca, i) => {
      const tris = triangulosDa(i + 1);
      const vertices = [...new Set(tris)];
      const abertos = vertices.map((v) => abrir(ponto(v), peca));
      if (peca.eixo === 'y') {
        const lado = Math.sign(peca.dobradica[0]);
        const media = (lista: readonly (readonly number[])[]) => lista.reduce((s, q) => s + q[0]! * lado, 0) / lista.length;
        expect(media(abertos)).toBeGreaterThan(media(vertices.map(ponto)) + 0.3);
      } else {
        // A tampa sobe e vai para trás: nenhum ponto dela passa da dobradiça para a frente.
        for (const q of abertos) expect(q[2]).toBeLessThan(peca.dobradica[2] + 0.01);
        const alturaMedia = abertos.reduce((s, q) => s + q[1], 0) / abertos.length;
        expect(alturaMedia).toBeGreaterThan(1.5);
      }
    });
  });

  it('o toque acha a peça: o primeiro triângulo no raio, na colisão simplificada de cada parte, fechada e aberta', () => {
    // Como a montagem: uma colisão por parte, simplificada numa grade de 5 cm, com os vidros das portas.
    const colisoes = [0, 1, 2, 3, 4, 5].map((parte) => {
      const tris = triangulosDa(parte);
      const usados = [...new Set(tris)];
      const novo = new Map(usados.map((v, i) => [v, i]));
      const posicoes = new Float32Array(usados.flatMap((v) => [...ponto(v)]));
      const simples = simplificarPorGrade(posicoes, Uint32Array.from(tris.map((v) => novo.get(v)!)), 0.05);
      const lista: (readonly [number, number, number])[][] = [];
      for (let t = 0; t < simples.indices.length; t += 3) {
        lista.push([0, 1, 2].map((j) => {
          const v = simples.indices[t + j]!;
          return [simples.posicoes[v * 3]!, simples.posicoes[v * 3 + 1]!, simples.posicoes[v * 3 + 2]!] as const;
        }));
      }
      for (const quad of MODELO_JAECOO_5.janelas ?? []) {
        const meio = [0, 1, 2].map((e) => quad.reduce((s, q) => s + q[e]!, 0) / 4);
        if (pecaDoPonto(meio, pecas) !== parte || parte === 0) continue;
        lista.push([quad[0], quad[1], quad[2]], [quad[0], quad[2], quad[3]]);
      }
      return lista;
    });
    const tocar = (o: readonly number[], d: readonly number[], abertas: readonly number[] = []) => {
      let melhor = { t: Infinity, parte: -1 };
      colisoes.forEach((lista, parte) => {
        const aberta = abertas.includes(parte);
        for (const tri of lista) {
          const [a, b, c] = aberta ? tri.map((q) => abrir(q, pecas[parte - 1]!)) : tri;
          const t = raioNoTriangulo(o, d, a!, b!, c!);
          if (t !== null && t < melhor.t) melhor = { t, parte };
        }
      });
      return melhor.parte;
    };
    // Fechadas, de lado: no meio de cada porta, na janela dela e no para-lama da frente.
    expect(tocar([3, 0.8, 0.35], [-1, 0, 0])).toBe(1);
    expect(tocar([-3, 0.8, 0.35], [1, 0, 0])).toBe(2);
    expect(tocar([3, 0.8, -0.6], [-1, 0, 0])).toBe(3);
    expect(tocar([-3, 0.8, -0.6], [1, 0, 0])).toBe(4);
    expect(tocar([3, 1.4, 0.3], [-1, 0, 0])).toBe(1);
    expect(tocar([-3, 1.4, -0.6], [1, 0, 0])).toBe(4);
    expect(tocar([3, 0.8, 1.45], [-1, 0, 0])).toBe(0);
    // De trás: a tampa, no vidro e embaixo da placa; o para-choque fica.
    expect(tocar([0, 1.4, -4], [0, 0, 1])).toBe(5);
    expect(tocar([0, 0.95, -4], [0, 0, 1])).toBe(5);
    expect(tocar([0, 0.5, -4], [0, 0, 1])).toBe(0);
    // Aberta, a porta da frente sai para o lado e para a frente: o toque nela continua sendo dela.
    const centro = abrir([0.9, 0.8, 0.35], pecas[0]!);
    expect(tocar([centro[0] + 2, centro[1], centro[2] + 1], [-2, 0, -1], [1])).toBe(1);
    // E o vão dela mostra a cabine: o raio (de trás, por fora da porta aberta) que acertava a porta
    // fechada passa pelo vão e acerta o banco.
    expect(tocar([3, 0.6, -1.5], [-2.6, 0, 2.1])).toBe(1);
    expect(tocar([3, 0.6, -1.5], [-2.6, 0, 2.1], [1])).toBe(0);
    // A tampa aberta fica no alto, atrás do teto: o raio que passa por cima do carro fechado acerta a
    // tampa aberta.
    const tampa = abrir([0, 1.3, -2.1], pecas[4]!);
    const paraATampa = [tampa[0], tampa[1] - 0.5, tampa[2] + 4];
    expect(tocar([0, 0.5, -4], paraATampa)).toBe(-1);
    expect(tocar([0, 0.5, -4], paraATampa, [5])).toBe(5);
  });
});
