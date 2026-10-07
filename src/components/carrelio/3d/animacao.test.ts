import { describe, expect, it } from 'vitest';
import { anguloDaPeca, avancar, cortina, desacelerar, DURACAO, intensidadeDasLuzes, interpolarNumero, suavizar, Transicao } from './animacao';

describe('as animações do carro', () => {
  it('abre a porta com entrada e saída suaves, simétricas', () => {
    expect(suavizar(0)).toBe(0);
    expect(suavizar(1)).toBe(1);
    expect(suavizar(0.5)).toBeCloseTo(0.5, 10);
    let anterior = 0;
    for (let t = 0.05; t <= 1; t += 0.05) {
      const v = suavizar(t);
      expect(v).toBeGreaterThanOrEqual(anterior);
      expect(v + suavizar(1 - t)).toBeCloseTo(1, 10);
      anterior = v;
    }
    // Começa devagar (menos que linear no primeiro quarto).
    expect(suavizar(0.25)).toBeLessThan(0.25);
    expect(desacelerar(0.25)).toBeGreaterThan(0.25);
    expect(anguloDaPeca(1, -62)).toBe(-62);
    expect(anguloDaPeca(0, -62)).toBeCloseTo(0, 10);
  });

  it('leva 700 ms para abrir e volta pelo mesmo caminho se fechar no meio', () => {
    let p = 0;
    let quadros = 0;
    while (p < 1) {
      p = avancar(p, 1, 1 / 60, DURACAO.porta);
      quadros += 1;
    }
    expect(quadros).toBe(Math.ceil(DURACAO.porta * 60));
    // Inverte no meio: o ângulo não salta.
    let q = avancar(0, 1, 0.3, DURACAO.porta);
    const antes = anguloDaPeca(q, 60);
    q = avancar(q, 0, 1 / 60, DURACAO.porta);
    expect(Math.abs(anguloDaPeca(q, 60) - antes)).toBeLessThan(3);
    // Sem movimento, na hora.
    expect(avancar(0, 1, 1 / 60, DURACAO.porta, false)).toBe(1);
  });

  it('troca a cor em 400 ms, partindo de onde estava se mudar no meio', () => {
    const t = new Transicao(0, DURACAO.cor, interpolarNumero);
    t.ir(1, true);
    expect(t.valor).toBe(0);
    t.passo(0.2);
    const meio = t.valor;
    expect(meio).toBeGreaterThan(0.3);
    expect(meio).toBeLessThan(0.7);
    t.ir(0, true);
    expect(t.valor).toBeCloseTo(meio, 10);
    while (t.passo(1 / 60));
    expect(t.valor).toBe(0);
    expect(t.ativa).toBe(false);
    t.ir(1, false);
    expect(t.valor).toBe(1);
  });

  it('escurece, troca a câmera no escuro e clareia', () => {
    expect(cortina(0).opacidade).toBe(0);
    expect(cortina(0).trocar).toBe(false);
    const escuro = cortina(DURACAO.cortina);
    expect(escuro.opacidade).toBeCloseTo(1, 6);
    expect(escuro.trocar).toBe(true);
    expect(cortina(DURACAO.cortina * 2).fim).toBe(true);
    expect(cortina(DURACAO.cortina * 2).opacidade).toBe(0);
  });

  it('acende os faróis discretos no estúdio e de verdade à noite', () => {
    expect(intensidadeDasLuzes(false, false)).toEqual({ farol: 0, lanterna: 0, halo: 0, poca: 0 });
    const estudio = intensidadeDasLuzes(true, false);
    const noite = intensidadeDasLuzes(true, true);
    expect(estudio.farol).toBeGreaterThan(0);
    expect(estudio.farol).toBeLessThan(noite.farol);
    expect(noite.poca).toBe(1);
    // À noite, a luz diurna e as lanternas acendem mesmo com os faróis desligados.
    const drl = intensidadeDasLuzes(false, true);
    expect(drl.farol).toBeGreaterThan(0);
    expect(drl.lanterna).toBeGreaterThan(0);
    expect(drl.poca).toBe(0);
  });
});
