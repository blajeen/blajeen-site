import { describe, expect, it } from 'vitest';
import { atmosferaPara, fatorDeNoite, linear } from './ceu';

const luminancia = (c: readonly number[]) => 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;

describe('o céu e a luz de cada hora', () => {
  it('é noite às 20h30 do verão e dia às 10h, com o fator de noite entre 0 e 1', () => {
    expect(atmosferaPara(20.5, 'verao').noite).toBe(1);
    expect(atmosferaPara(10, 'equinocio').noite).toBe(0);
    expect(fatorDeNoite(-6)).toBe(1);
    expect(fatorDeNoite(3)).toBe(0);
    const crepusculo = fatorDeNoite(-1.5);
    expect(crepusculo).toBeGreaterThan(0);
    expect(crepusculo).toBeLessThan(1);
  });

  it('acende o luar sem sol à noite e apaga o sol abaixo do horizonte', () => {
    const noite = atmosferaPara(20.5, 'verao');
    expect(noite.intensidadeDoSol).toBe(0);
    expect(noite.intensidadeDoLuar).toBeGreaterThan(0.3);
    expect(noite.sombra).toBe(false);
    expect(noite.estrelas).toBeGreaterThan(0.9);
    const dia = atmosferaPara(10, 'equinocio');
    expect(dia.intensidadeDoSol).toBeGreaterThan(2);
    expect(dia.intensidadeDoLuar).toBe(0);
    expect(dia.sombra).toBe(true);
    expect(dia.estrelas).toBe(0);
  });

  it('faz o céu do dia mais claro que o da noite, e o horizonte do lado do sol mais quente no fim da tarde', () => {
    const dia = atmosferaPara(10, 'equinocio');
    const noite = atmosferaPara(20.5, 'verao');
    expect(luminancia(dia.zenite)).toBeGreaterThan(luminancia(noite.zenite) * 10);
    const tarde = atmosferaPara(17.5, 'equinocio');
    const [r, , b] = tarde.horizonte;
    expect(r).toBeGreaterThan(b);
    const [ro, , bo] = tarde.horizonteOposto;
    expect(bo / ro).toBeGreaterThan(b / r);
  });

  it('muda de forma contínua ao longo do dia, sem saltos de cor nem de exposição', () => {
    // Passo de 36 s: no crepúsculo o céu muda depressa, mas sem degrau.
    let anterior = atmosferaPara(5, 'equinocio');
    for (let h = 5.01; h <= 23; h += 0.01) {
      const atual = atmosferaPara(h, 'equinocio');
      expect(Math.abs(luminancia(atual.horizonte) - luminancia(anterior.horizonte)), `${h}`).toBeLessThan(0.01);
      expect(Math.abs(atual.exposicao - anterior.exposicao), `${h}`).toBeLessThan(0.01);
      expect(Number.isFinite(atual.nevoa) && atual.nevoa > 0).toBe(true);
      anterior = atual;
    }
  });

  it('converte as cores do site para o espaço linear como o three', () => {
    expect(linear('#ffffff')).toEqual([1, 1, 1]);
    expect(linear('#000000')).toEqual([0, 0, 0]);
    expect(linear('#808080')[0]).toBeCloseTo(0.2158, 3);
  });
});
