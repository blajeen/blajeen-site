import { describe, expect, it } from 'vitest';
import { blocosDaParede, blocosDaPlanta, cortarParede } from './paredes';
import { comprimentoDaParede, parede, PLANTA } from './planta';

const CORTE = 2.2;

describe('cortarParede', () => {
  it('deixa a parede inteira quando não há abertura', () => {
    expect(cortarParede(3, [], CORTE)).toEqual([{ de: 0, ate: 3, base: 0, topo: CORTE }]);
  });

  it('abre a porta até a verga e fecha acima dela', () => {
    const blocos = cortarParede(4, [{ centro: 1, largura: 0.8, peitoril: 0, altura: 2.1 }], CORTE);
    expect(blocos).toHaveLength(3);
    expect(blocos[0]).toEqual({ de: 0, ate: 0.6, base: 0, topo: CORTE });
    expect(blocos[1]!.de).toBeCloseTo(0.6);
    expect(blocos[1]!.ate).toBeCloseTo(1.4);
    expect(blocos[1]!.base).toBeCloseTo(2.1);
    expect(blocos[1]!.topo).toBe(CORTE);
    expect(blocos[2]).toEqual({ de: 1.4, ate: 4, base: 0, topo: CORTE });
  });

  it('põe um bloco abaixo do peitoril e outro acima da verga numa janela', () => {
    const blocos = cortarParede(3, [{ centro: 1.5, largura: 1.2, peitoril: 1, altura: 1 }], CORTE);
    const noVao = blocos.filter((b) => b.de > 0.8 && b.ate < 2.2);
    expect(noVao.map((b) => [b.base, b.topo])).toEqual([
      [0, 1],
      [2, CORTE],
    ]);
  });

  it('não desenha verga quando ela passa do corte', () => {
    const blocos = cortarParede(3, [{ centro: 1.5, largura: 1, peitoril: 1.2, altura: 1.2 }], CORTE);
    expect(blocos.every((b) => b.topo <= CORTE)).toBe(true);
    expect(blocos.filter((b) => b.base >= 2.2)).toHaveLength(0);
  });

  it('separa duas aberturas com um montante cheio entre elas', () => {
    const blocos = cortarParede(
      5,
      [
        { centro: 3.5, largura: 1, peitoril: 0, altura: 2.1 },
        { centro: 1, largura: 1, peitoril: 1, altura: 1 },
      ],
      CORTE,
    );
    const cheios = blocos.filter((b) => b.base === 0 && b.topo === CORTE);
    expect(cheios.map((b) => [b.de, b.ate])).toEqual([
      [0, 0.5],
      [1.5, 3],
      [4, 5],
    ]);
  });

  it('com as paredes baixas da planta, some com as portas e mantém o peitoril', () => {
    const blocos = cortarParede(
      4,
      [
        { centro: 1, largura: 0.8, peitoril: 0, altura: 2.1 },
        { centro: 3, largura: 1, peitoril: 1, altura: 1 },
      ],
      0.12,
    );
    expect(blocos.map((b) => [b.de, b.ate])).toEqual([
      [0, 0.6],
      [1.4, 2.5],
      [2.5, 3.5],
      [3.5, 4],
    ]);
    expect(blocos.every((b) => b.topo === 0.12)).toBe(true);
  });
});

describe('blocos da planta', () => {
  it('cobre o comprimento de cada parede, menos os vãos de passagem', () => {
    for (const p of PLANTA.paredes) {
      const baixos = blocosDaParede(p, PLANTA.aberturas, 0.12);
      const coberto = baixos.reduce((soma, b) => soma + b.comprimento, 0);
      const vaos = PLANTA.aberturas
        .filter((a) => a.parede === p.id && a.peitoril === 0)
        .reduce((soma, a) => soma + a.largura, 0);
      expect(coberto, p.id).toBeCloseTo(comprimentoDaParede(p) - vaos, 6);
    }
  });

  it('assenta os blocos sobre o eixo da parede, com o topo de aço só no corte', () => {
    const norte = blocosDaParede(parede('norte'), PLANTA.aberturas, CORTE);
    expect(norte.every((b) => b.centro[1] === 0.075 && b.angulo === 0)).toBe(true);
    const sobPeitoril = norte.filter((b) => b.base === 0 && b.altura < 1.5);
    expect(sobPeitoril.length).toBeGreaterThan(0);
    expect(sobPeitoril.every((b) => !b.cortada)).toBe(true);
    expect(norte.filter((b) => b.altura === CORTE).every((b) => b.cortada)).toBe(true);
  });

  it('gira os blocos das paredes verticais do desenho', () => {
    const oeste = blocosDaParede(parede('oeste'), PLANTA.aberturas, CORTE);
    expect(oeste.every((b) => Math.abs(b.angulo - Math.PI / 2) < 1e-9)).toBe(true);
  });

  it('cabe no orçamento da maquete', () => {
    // Cada bloco vira uma caixa de 12 triângulos; a planta inteira fica em poucas centenas.
    expect(blocosDaPlanta().length).toBeLessThan(80);
  });
});
