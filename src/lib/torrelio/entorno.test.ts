import { describe, expect, it } from 'vitest';
import { ANDAR_ACIMA_DO_VIZINHO, descricaoDaVista, marcosVisiveis, pontoDeVista, resumoDaVista } from './entorno';
import { ANDAR_VISTA_MAR, cota, QUARTOS, UNIDADES } from './predio';
import type { Fachada, Trecho } from './tipos';

const estadoDe = (pavimento: number, trecho: Trecho, id: string) =>
  marcosVisiveis(pontoDeVista({ pavimento, trecho })).find((m) => m.id === id)?.estado ?? 'oculto';

const fundos: Trecho = { fachada: 'sul', de: 0, ate: 3 };
const frente: Trecho = { fachada: 'norte', de: 3, ate: 8 };
const leste: Trecho = { fachada: 'leste', de: 0, ate: 2 };

describe('o entorno fictício', () => {
  it('põe o olho na varanda, no centro do trecho, 1,55 m acima da laje', () => {
    const ponto = pontoDeVista({ pavimento: 18, trecho: fundos });
    expect(ponto.olho[0]).toBeCloseTo(-7.5, 6);
    expect(ponto.olho[1]).toBeCloseTo(cota(18) + 1.55, 6);
    expect(ponto.olho[2]).toBeCloseTo(8.6, 6);
    expect(ponto.direcao).toEqual([0, 0, 1]);
  });

  it('mostra o mar pelos fundos a partir do andar da tabela, e não antes', () => {
    expect(estadoDe(ANDAR_VISTA_MAR - 1, fundos, 'mar')).toBe('oculto');
    expect(estadoDe(ANDAR_VISTA_MAR, fundos, 'mar')).toBe('visivel');
    expect(estadoDe(19, fundos, 'mar')).toBe('visivel');
  });

  it('fecha a lateral leste com a torre vizinha até o 13º', () => {
    expect(ANDAR_ACIMA_DO_VIZINHO).toBe(14);
    expect(estadoDe(13, leste, 'morros')).toBe('oculto');
    expect(estadoDe(14, leste, 'morros')).not.toBe('oculto');
  });

  it('mostra o centro pela frente só a partir do 6º', () => {
    expect(estadoDe(2, frente, 'centro')).not.toBe('visivel');
    expect(estadoDe(6, frente, 'centro')).toBe('visivel');
  });

  it('concorda com as categorias do hotel: vista mar é exatamente quem vê o mar pelos fundos', () => {
    for (const quarto of QUARTOS.filter((q) => q.fachadas.includes('sul') && q.categoria !== 'suite-cobertura')) {
      const trecho = quarto.trechos.find((t) => t.fachada === 'sul')!;
      const veMar = estadoDe(quarto.pavimento, trecho, 'mar') === 'visivel';
      expect(veMar, quarto.id).toBe(quarto.categoria === 'vista-mar');
    }
  });

  it('descreve a vista de toda unidade e de todo quarto, em cada fachada que eles têm', () => {
    for (const alvo of [...UNIDADES, ...QUARTOS]) {
      for (const fachada of alvo.fachadas as Fachada[]) {
        expect(descricaoDaVista(alvo, fachada).length, `${alvo.id} ${fachada}`).toBeGreaterThan(20);
        expect(resumoDaVista(alvo, fachada).length).toBeGreaterThan(3);
      }
    }
  });
});
