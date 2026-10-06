import { describe, expect, it } from 'vitest';
import {
  ANDAR_VISTA_MAR, cota, geometriaDoVao, indiceDoVao, mapaDeVaos, PAVIMENTOS, QUARTOS, TOTAL_DE_VAOS, UNIDADES, vaoDoIndice,
} from './predio';

describe('o prédio fictício', () => {
  it('tem 20 pavimentos com vãos, 24 vãos cada, e as cotas da tabela', () => {
    expect(PAVIMENTOS[0]).toBe(2);
    expect(PAVIMENTOS.at(-1)).toBe(21);
    expect(TOTAL_DE_VAOS).toBe(480);
    expect(cota(2)).toBe(7.5);
    expect(cota(18)).toBe(53.58);
    expect(cota(ANDAR_VISTA_MAR)).toBe(36.3);
  });

  it('converte o índice do vão nos dois sentidos', () => {
    for (let i = 0; i < TOTAL_DE_VAOS; i += 1) {
      const { pavimento, fachada, posicao } = vaoDoIndice(i);
      expect(indiceDoVao(pavimento, fachada, posicao)).toBe(i);
    }
  });

  it('põe cada vão no plano da sua fachada, dentro da torre', () => {
    const norte = geometriaDoVao(indiceDoVao(2, 'norte', 0));
    expect(norte.centro[0]).toBe(-10.5);
    expect(norte.centro[1]).toBeCloseTo(8.8, 6);
    expect(norte.centro[2]).toBe(-8);
    expect(norte.altura).toBeCloseTo(2.4, 6);
    expect(norte.normal).toEqual([0, 0, -1]);
    const leste = geometriaDoVao(indiceDoVao(18, 'leste', 3));
    expect(leste.centro[0]).toBe(12);
    expect(leste.centro[2]).toBe(6);
    expect(leste.largura).toBe(4);
  });

  it('tem 74 unidades e 146 quartos, com números no formato do andar e do final', () => {
    expect(UNIDADES).toHaveLength(74);
    expect(QUARTOS).toHaveLength(146);
    expect(new Set(UNIDADES.map((u) => u.id)).size).toBe(74);
    expect(new Set(QUARTOS.map((q) => q.id)).size).toBe(146);
    expect(UNIDADES.find((u) => u.id === '1803')).toMatchObject({ final: '03', tipologia: 'tipo-2d', fachadas: ['sul', 'oeste'] });
    expect(UNIDADES.find((u) => u.id === '201')).toMatchObject({ pavimentos: [2], final: '01' });
    expect(UNIDADES.filter((u) => u.tipologia === 'cobertura').map((u) => u.id)).toEqual(['2001', '2002']);
    expect(UNIDADES.every((u, i) => u.indice === i) && QUARTOS.every((q, i) => q.indice === i)).toBe(true);
  });

  it('dá a vista do mar aos quartos dos fundos a partir do andar em que o mar aparece', () => {
    expect(QUARTOS.find((q) => q.id === '1106')?.categoria).toBe('vista-parque');
    expect(QUARTOS.find((q) => q.id === '1206')?.categoria).toBe('vista-mar');
    expect(QUARTOS.find((q) => q.id === '1802')?.categoria).toBe('cidade');
    expect(QUARTOS.find((q) => q.id === '1801')?.categoria).toBe('canto-cidade');
  });

  it('cobre todos os vãos, sem sobra e sem dono duplicado, nos dois modos', () => {
    for (const modo of ['incorporadora', 'hotel'] as const) {
      const mapa = mapaDeVaos(modo);
      expect(mapa).toHaveLength(TOTAL_DE_VAOS);
      expect([...mapa].every((dono) => dono >= 0)).toBe(true);
      const total = modo === 'incorporadora' ? UNIDADES.length : QUARTOS.length;
      expect(new Set(mapa).size).toBe(total);
    }
    // Contagem de vãos por unidade: a de 3 dormitórios leva 7, a de 2 leva 5, a cobertura 2 × 12.
    const contar = (indice: number) => [...mapaDeVaos('incorporadora')].filter((d) => d === indice).length;
    expect(contar(UNIDADES.find((u) => u.id === '1801')!.indice)).toBe(7);
    expect(contar(UNIDADES.find((u) => u.id === '1803')!.indice)).toBe(5);
    expect(contar(UNIDADES.find((u) => u.id === '2001')!.indice)).toBe(24);
  });
});
