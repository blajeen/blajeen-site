import { describe, expect, it } from 'vitest';
import { ajustesDoNivel, escolherNivel, MedidorDeQuadros, nivelAbaixo, percentil, QUADRO_LENTO_MS, type SinaisDoAparelho } from './qualidade';

const computador: SinaisDoAparelho = { ponteiroGrosso: false, nucleos: 8, memoriaGb: 8, economiaDeDados: false, largura: 1440 };

describe('o nível de qualidade da torre', () => {
  it('dá o alto ao computador, o médio ao celular e o baixo a quem economiza dados ou tem pouca máquina', () => {
    expect(escolherNivel(computador)).toBe('alto');
    expect(escolherNivel({ ...computador, ponteiroGrosso: true, largura: 390 })).toBe('medio');
    expect(escolherNivel({ ...computador, largura: 820 })).toBe('medio');
    expect(escolherNivel({ ...computador, nucleos: 4 })).toBe('medio');
    expect(escolherNivel({ ...computador, economiaDeDados: true })).toBe('baixo');
    expect(escolherNivel({ ...computador, memoriaGb: 2 })).toBe('baixo');
    expect(escolherNivel({ ...computador, nucleos: 2 })).toBe('baixo');
    // Sem informação de memória e núcleos (Safari, Firefox), decide pelo ponteiro e pela largura.
    expect(escolherNivel({ ...computador, nucleos: null, memoriaGb: null })).toBe('alto');
  });

  it('limita a resolução e a sombra por nível', () => {
    const alto = ajustesDoNivel('alto', 2);
    expect(alto.dpr).toBe(1.5);
    expect(alto.sombra).toBe(2048);
    expect(alto.msaa).toBe(false);
    expect(ajustesDoNivel('alto', 1).msaa).toBe(true);
    expect(ajustesDoNivel('alto', 1.25).msaa).toBe(true);
    const medio = ajustesDoNivel('medio', 3);
    expect(medio.dpr).toBe(1.5);
    expect(medio.sombra).toBe(1024);
    expect(medio.msaa).toBe(false);
    expect(medio.entorno).toBe('reduzido');
    const baixo = ajustesDoNivel('baixo', 3);
    expect(baixo.dpr).toBe(1);
    expect(baixo.sombra).toBe(0);
    expect(baixo.halos).toBe(false);
    expect(ajustesDoNivel('alto', 0).dpr).toBe(1);
    expect(nivelAbaixo('alto')).toBe('medio');
    expect(nivelAbaixo('medio')).toBe('baixo');
    expect(nivelAbaixo('baixo')).toBe('baixo');
  });

  it('desce um nível só depois de duas animações seguidas com p90 acima de 24 ms', () => {
    expect(percentil([5, 1, 3, 2, 4], 0.9)).toBe(5);
    expect(percentil([], 0.9)).toBe(0);
    const medidor = new MedidorDeQuadros();
    const animar = (ms: number, quadros = 30) => {
      for (let i = 0; i < quadros; i += 1) medidor.registrar(ms);
      return medidor.fecharAnimacao();
    };
    expect(animar(16)).toBe(false);
    expect(animar(QUADRO_LENTO_MS + 10)).toBe(false);
    expect(animar(QUADRO_LENTO_MS + 10)).toBe(true);
    // Depois de descer, a conta recomeça; uma animação rápida no meio zera a sequência.
    expect(animar(40)).toBe(false);
    expect(animar(16)).toBe(false);
    expect(animar(40)).toBe(false);
    // Animações curtas demais não contam.
    expect(animar(80, 3)).toBe(false);
    medidor.registrar(Number.NaN);
    medidor.registrar(5000);
    expect(medidor.fecharAnimacao()).toBe(false);
  });
});
