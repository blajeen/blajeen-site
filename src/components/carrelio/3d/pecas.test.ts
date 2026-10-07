import { describe, expect, it } from 'vitest';
import type { PecaPorRegiao } from './contrato';
import { dentroDaPeca, dentroDoContorno, dentroDoPoligono, ehPecaPorRegiao, espelharPeca, pecaDoPonto, pecaValida, refinarNaFronteira } from './pecas';

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

  it('refina a malha só na emenda, sem fresta nem junta em T, e separa pelo centróide', () => {
    // Um quadrado de 1 m na lateral (x 0,9), em dois triângulos, cortado ao meio pela borda de uma peça (z > 0).
    const pontos = [0.9, 0.4, -0.5, 0.9, 0.4, 0.5, 0.9, 1.4, 0.5, 0.9, 1.4, -0.5];
    const indices = [0, 1, 2, 0, 2, 3];
    const peca = { contornos: [{ plano: 'zy' as const, pontos: [[0, 0], [1, 0], [1, 2], [0, 2]] as const, faixa: [0.7, 1.2] as const }] };
    const aresta = 0.05;
    const r = refinarNaFronteira(pontos, indices, [peca], aresta);
    // As posições de todos os vértices: os novos são o meio dos pais.
    const p = [...pontos];
    for (let k = 0; k < r.pais.length / 2; k += 1) {
      const a = r.pais[k * 2]!;
      const b = r.pais[k * 2 + 1]!;
      p.push((p[a * 3]! + p[b * 3]!) / 2, (p[a * 3 + 1]! + p[b * 3 + 1]!) / 2, (p[a * 3 + 2]! + p[b * 3 + 2]!) / 2);
    }
    const ponto = (i: number) => [p[i * 3]!, p[i * 3 + 1]!, p[i * 3 + 2]!] as const;
    let area = 0;
    const arestas = new Map<string, number>();
    for (let t = 0; t < r.indices.length; t += 3) {
      const [a, b, c] = [r.indices[t]!, r.indices[t + 1]!, r.indices[t + 2]!];
      const [pa, pb, pc] = [ponto(a), ponto(b), ponto(c)];
      // Na lateral (x constante), a área com sinal no plano zy: o sentido de cada triângulo é o do original.
      const dobro = (pb[2] - pa[2]) * (pc[1] - pa[1]) - (pc[2] - pa[2]) * (pb[1] - pa[1]);
      expect(dobro).toBeGreaterThan(0);
      area += dobro / 2;
      const centroZ = (pa[2] + pb[2] + pc[2]) / 3;
      const dono = r.dono[t / 3]!;
      expect(dono).toBe(centroZ > 0 ? 1 : 0);
      // Perto da emenda (z = 0), só triângulos pequenos.
      const lados = [[pa, pb], [pb, pc], [pc, pa]].map(([u, w]) => Math.hypot(u![1] - w![1], u![2] - w![2]));
      if (Math.min(pa[2], pb[2], pc[2]) < 0 && Math.max(pa[2], pb[2], pc[2]) > 0) expect(Math.max(...lados)).toBeLessThanOrEqual(aresta);
      for (const [u, w] of [[a, b], [b, c], [c, a]] as const) {
        const k = u < w ? `${u}-${w}` : `${w}-${u}`;
        arestas.set(k, (arestas.get(k) ?? 0) + 1);
      }
    }
    expect(area).toBeCloseTo(1, 6);
    // Fechada: toda aresta de dentro é de dois triângulos; as de um só ficam na borda do quadrado.
    for (const [k, n] of arestas) {
      if (n === 2) continue;
      const [u, w] = k.split('-').map(Number) as [number, number];
      const naBorda = (i: number, j: number) => ([1, 2] as const).some((eixo) => ponto(i)[eixo] === ponto(j)[eixo] && [0.4, 1.4, -0.5, 0.5].includes(ponto(i)[eixo]));
      expect(n).toBe(1);
      expect(naBorda(u, w)).toBe(true);
    }
    expect(r.dono.some((d) => d === 1) && r.dono.some((d) => d === 0)).toBe(true);
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
