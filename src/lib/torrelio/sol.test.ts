import { describe, expect, it } from 'vitest';
import { direcaoDoSol, horasDeSol, nascerEPorDoSol, posicaoDoSol } from './sol';

describe('o sol de Porto Lume (latitude fictícia de 20° S)', () => {
  it('fica ao norte ao meio-dia, menos no verão, quando passa quase a pino pelo sul', () => {
    expect(posicaoDoSol(12, 'equinocio').elevacao).toBeCloseTo(70, 1);
    expect(posicaoDoSol(12, 'equinocio').azimute).toBeCloseTo(0, 1);
    expect(posicaoDoSol(12, 'verao').elevacao).toBeCloseTo(86.56, 1);
    expect(posicaoDoSol(12, 'verao').azimute).toBeCloseTo(180, 1);
    expect(posicaoDoSol(12, 'inverno').elevacao).toBeCloseTo(46.56, 1);
    expect(posicaoDoSol(12, 'inverno').azimute).toBeCloseTo(0, 1);
  });

  it('nasce a leste e se põe a oeste, com dias mais longos no verão', () => {
    expect(posicaoDoSol(7, 'equinocio').azimute).toBeGreaterThan(45);
    expect(posicaoDoSol(7, 'equinocio').azimute).toBeLessThan(135);
    expect(posicaoDoSol(17.5, 'equinocio').azimute).toBeGreaterThan(225);
    expect(posicaoDoSol(17.5, 'equinocio').azimute).toBeLessThan(315);
    const verao = nascerEPorDoSol('verao');
    const inverno = nascerEPorDoSol('inverno');
    expect(nascerEPorDoSol('equinocio')).toEqual({ nascer: 6, por: 18 });
    expect(verao.por - verao.nascer).toBeGreaterThan(inverno.por - inverno.nascer);
    expect(posicaoDoSol(20.5, 'verao').elevacao).toBeLessThan(-6);
  });

  it('dá a direção da luz no sistema da cena, com −z para o norte', () => {
    const [x, y, z] = direcaoDoSol(12, 'inverno');
    expect(Math.hypot(x, y, z)).toBeCloseTo(1, 6);
    expect(z).toBeLessThan(0);
    expect(direcaoDoSol(8, 'equinocio')[0]).toBeGreaterThan(0);
    expect(direcaoDoSol(16, 'equinocio')[0]).toBeLessThan(0);
  });

  it('diz em que horas cada fachada recebe sol direto', () => {
    // Leste só de manhã, oeste só à tarde, em qualquer estação.
    for (const estacao of ['verao', 'equinocio', 'inverno'] as const) {
      expect(horasDeSol('leste', estacao).every((h) => h.ate <= 12)).toBe(true);
      expect(horasDeSol('oeste', estacao).every((h) => h.de >= 12)).toBe(true);
    }
    // A frente (norte) tem sol o ano todo, menos no alto verão; os fundos (sul), só no verão.
    expect(horasDeSol('norte', 'inverno')).toHaveLength(1);
    expect(horasDeSol('norte', 'equinocio')).toHaveLength(1);
    expect(horasDeSol('norte', 'verao')).toHaveLength(0);
    expect(horasDeSol('sul', 'inverno')).toHaveLength(0);
    const sulNoVerao = horasDeSol('sul', 'verao');
    expect(sulNoVerao).toHaveLength(2);
    expect(sulNoVerao[0]!.ate).toBeLessThan(10);
    expect(sulNoVerao[1]!.de).toBeGreaterThan(14);
  });
});
