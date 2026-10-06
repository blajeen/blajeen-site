import { describe, expect, it } from 'vitest';
import {
  ANDAR_ACIMA_DO_VIZINHO, ANDAR_VISTA_CENTRO, descricaoDaVista, LOTE_VIZINHO, marcosVisiveis, ORLA, paisagem, pontoDeVista,
  raioLivre, resumoDaVista, VARANDA,
} from './entorno';
import { ANDAR_VISTA_MAR, cota, QUARTOS, TORRE, UNIDADES } from './predio';
import type { Fachada, Trecho } from './tipos';

const estadoDe = (pavimento: number, trecho: Trecho, id: string) =>
  marcosVisiveis(pontoDeVista({ pavimento, trecho })).find((m) => m.id === id)?.estado ?? 'oculto';

const fundos: Trecho = { fachada: 'sul', de: 0, ate: 3 };
const fundosLeste: Trecho = { fachada: 'sul', de: 3, ate: 8 };
const frente: Trecho = { fachada: 'norte', de: 3, ate: 8 };
const frenteOeste: Trecho = { fachada: 'norte', de: 0, ate: 3 };
const leste: Trecho = { fachada: 'leste', de: 0, ate: 2 };
const lesteSul: Trecho = { fachada: 'leste', de: 2, ate: 4 };

describe('o entorno fictício', () => {
  it('põe o olho no meio da varanda de canto, 1,55 m acima da laje e 0,6 m para fora do vidro', () => {
    const ponto = pontoDeVista({ pavimento: 18, trecho: fundos });
    // A varanda do final 03 envolve os vãos 0 e 1 dos fundos: o meio fica 3 m depois do canto.
    expect(ponto.olho[0]).toBeCloseTo(-9, 6);
    expect(ponto.olho[1]).toBeCloseTo(cota(18) + 1.55, 6);
    expect(ponto.olho[2]).toBeCloseTo(8.6, 6);
    expect(ponto.direcao).toEqual([0, 0, 1]);
    expect(ponto.naVaranda).toBe(true);
    // A varanda tem 1,6 m: o olho fica dentro dela, antes do guarda-corpo.
    expect(ponto.olho[2] - TORRE.profundidade / 2).toBeLessThan(VARANDA.profundidade);
    // Na lateral, a varanda leva só um vão (4 m), o do canto.
    const lateral = pontoDeVista({ pavimento: 14, trecho: leste });
    expect(lateral.olho[0]).toBeCloseTo(12.6, 6);
    expect(lateral.olho[2]).toBeCloseTo(-6, 6);
  });

  it('põe o olho atrás da janela quando o trecho não tem varanda (quartos do meio, no hotel)', () => {
    const ponto = pontoDeVista({ pavimento: 9, trecho: { fachada: 'sul', de: 2, ate: 4 } });
    expect(ponto.naVaranda).toBe(false);
    expect(ponto.olho[0]).toBeCloseTo(-3, 6);
    expect(ponto.olho[2]).toBeCloseTo(7.4, 6);
  });

  it('mostra o mar pelos fundos a partir do andar da tabela, e não antes, nos dois finais', () => {
    for (const trecho of [fundos, fundosLeste]) {
      expect(estadoDe(ANDAR_VISTA_MAR - 1, trecho, 'mar')).toBe('oculto');
      expect(estadoDe(ANDAR_VISTA_MAR, trecho, 'mar')).toBe('visivel');
      expect(estadoDe(19, trecho, 'mar')).toBe('visivel');
      expect(estadoDe(2, trecho, 'mar')).toBe('oculto');
    }
  });

  it('fecha a lateral leste com a torre vizinha até o 13º, nos dois finais do leste', () => {
    expect(ANDAR_ACIMA_DO_VIZINHO).toBe(14);
    for (const trecho of [leste, lesteSul]) {
      for (const pavimento of [2, 8, ANDAR_ACIMA_DO_VIZINHO - 1]) {
        expect(estadoDe(pavimento, trecho, 'morros'), `${pavimento}`).toBe('oculto');
        expect(estadoDe(pavimento, trecho, 'farol'), `${pavimento}`).toBe('oculto');
      }
      expect(estadoDe(ANDAR_ACIMA_DO_VIZINHO, trecho, 'morros')).not.toBe('oculto');
      expect(estadoDe(19, trecho, 'morros')).toBe('visivel');
      expect(estadoDe(19, trecho, 'farol')).toBe('visivel');
      expect(estadoDe(2, trecho, 'torre-vizinha')).toBe('visivel');
    }
  });

  it('mostra o centro pela frente só a partir do 6º, nos dois finais da frente', () => {
    expect(ANDAR_VISTA_CENTRO).toBe(6);
    for (const trecho of [frente, frenteOeste]) {
      expect(estadoDe(2, trecho, 'centro')).not.toBe('visivel');
      expect(estadoDe(ANDAR_VISTA_CENTRO - 1, trecho, 'centro')).not.toBe('visivel');
      expect(estadoDe(ANDAR_VISTA_CENTRO, trecho, 'centro')).toBe('visivel');
      expect(estadoDe(19, trecho, 'centro')).toBe('visivel');
      expect(estadoDe(2, trecho, 'avenida')).toBe('visivel');
    }
  });

  it('concorda com as categorias do hotel: vista mar é exatamente quem vê o mar pelos fundos', () => {
    for (const quarto of QUARTOS.filter((q) => q.fachadas.includes('sul') && q.categoria !== 'suite-cobertura')) {
      const trecho = quarto.trechos.find((t) => t.fachada === 'sul')!;
      const veMar = estadoDe(quarto.pavimento, trecho, 'mar') === 'visivel';
      expect(veMar, quarto.id).toBe(quarto.categoria === 'vista-mar');
    }
  });

  it('desenha a mesma paisagem que calcula: a orla sem vão no gabarito e a vizinha a 20 m', () => {
    const { caixas } = paisagem();
    const orla = caixas.filter((c) => c.tipo === 'orla').sort((a, b) => a.min[0] - b.min[0]);
    for (let i = 1; i < orla.length; i += 1) expect(orla[i]!.min[0]).toBeCloseTo(orla[i - 1]!.max[0], 6);
    expect(orla.every((c) => c.max[1] >= ORLA.gabarito)).toBe(true);
    const vizinha = caixas.find((c) => c.tipo === 'vizinho')!;
    expect(vizinha.min[0] - TORRE.largura / 2).toBe(20);
    expect(vizinha.min[0]).toBeGreaterThanOrEqual(LOTE_VIZINHO.xMin);
    // O raio do olho até um ponto atrás da vizinha é barrado; por cima dela, passa.
    expect(raioLivre([12.6, 30, 0], [200, 30, 0])).toBe(false);
    expect(raioLivre([12.6, 50, 0], [200, 50, 0])).toBe(true);
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
