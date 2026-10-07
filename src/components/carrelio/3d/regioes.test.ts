import { describe, expect, it } from 'vitest';
import { BORDA_DA_REGIAO, empacotarRegioes, pesoDaRegiao, pesoDasRegioes, regiaoValida, tamanhoDaRegiao } from './regioes';

describe('as regiões do manifesto', () => {
  it('pesa uma caixa: 1 dentro, 0 fora, meio na borda', () => {
    const caixa = { centro: [0, 1, 0] as const, meias: [0.5, 0.2, 1] as const };
    expect(pesoDaRegiao(caixa, [0, 1, 0])).toBe(1);
    expect(pesoDaRegiao(caixa, [0.45, 1.15, 0.9])).toBe(1);
    expect(pesoDaRegiao(caixa, [0.6, 1, 0])).toBe(0);
    expect(pesoDaRegiao(caixa, [0.5, 1, 0])).toBeCloseTo(0.5, 6);
    expect(pesoDaRegiao(caixa, [0.5 + BORDA_DA_REGIAO, 1, 0])).toBe(0);
  });

  it('inclina a caixa em torno de X, como o para-brisa', () => {
    // Uma placa fina deitada 45°: o ponto na diagonal está dentro; o mesmo ponto sem inclinação, fora.
    const placa = { centro: [0, 0, 0] as const, meias: [1, 0.05, 1] as const, inclinacao: 45 };
    const naDiagonal = [0, -0.5, 0.5];
    expect(pesoDaRegiao(placa, naDiagonal)).toBe(1);
    expect(pesoDaRegiao({ ...placa, inclinacao: 0 }, naDiagonal)).toBe(0);
    expect(pesoDaRegiao(placa, [0, 0.5, 0.5])).toBe(0);
  });

  it('pesa um cilindro deitado em X, como a roda', () => {
    const roda = { centro: [0.82, 0.375, 1.37] as const, raio: 0.39, meiaLargura: 0.18 };
    expect(pesoDaRegiao(roda, [0.9, 0.375, 1.37])).toBe(1);
    expect(pesoDaRegiao(roda, [0.82, 0.375 + 0.3, 1.37 + 0.2])).toBe(1);
    // O para-lama em cima da roda fica fora.
    expect(pesoDaRegiao(roda, [0.82, 0.375 + 0.42, 1.37])).toBe(0);
    expect(pesoDaRegiao(roda, [0.5, 0.375, 1.37])).toBe(0);
    expect(pesoDasRegioes([roda, { ...roda, centro: [-0.82, 0.375, 1.37] }], [-0.9, 0.375, 1.37])).toBe(1);
    expect(pesoDasRegioes([], [0, 0, 0])).toBe(0);
  });

  it('empacota oito floats por região para o shader', () => {
    const dados = empacotarRegioes([{ centro: [1, 2, 3], meias: [4, 5, 6], inclinacao: 90 }, { centro: [7, 8, 9], raio: 0.4, meiaLargura: 0.2 }]);
    expect(Array.from(dados.slice(0, 7))).toEqual([1, 2, 3, 0, 4, 5, 6]);
    expect(dados[7]).toBeCloseTo(Math.PI / 2, 6);
    expect(Array.from(dados.slice(8, 16))).toEqual([7, 8, 9, 1, Math.fround(0.4), Math.fround(0.2), 0, 0]);
    // Sem regiões, um bloco vazio (o shader não aceita array de tamanho 0).
    expect(empacotarRegioes([])).toHaveLength(8);
    expect(tamanhoDaRegiao({ centro: [0, 0, 0], meias: [0.2, 0.05, 0.1] })).toBeCloseTo(0.4, 6);
    expect(regiaoValida({ centro: [0, 0, 0], raio: 0, meiaLargura: 1 })).toBe(false);
    expect(regiaoValida({ centro: [0, Number.NaN, 0], meias: [1, 1, 1] })).toBe(false);
  });
});
