import { describe, expect, it } from 'vitest';
import { comodoNoPonto, PLANTA } from '@/lib/torrelio/planta';
import { caixaDoDesenho, emPorcentagem, folhaDaPorta, norteNoDesenho, transformar } from './desenho';

describe('desenho da planta', () => {
  it('abre a folha de cada porta para dentro do cômodo indicado', () => {
    for (const a of PLANTA.aberturas.filter((x) => x.abre)) {
      const folha = folhaDaPorta(a)!;
      const meio: [number, number] = [(folha.dobradica[0] + folha.aberta[0]) / 2, (folha.dobradica[1] + folha.aberta[1]) / 2];
      expect(comodoNoPonto(meio), a.id).toBe(a.abre!.para);
    }
  });

  it('espelha de leste para oeste e gira em passos de 90°, sem sair da caixa', () => {
    const [x0] = transformar([0, 0], { espelhada: false, giro: 0 });
    const [x1] = transformar([0, 0], { espelhada: true, giro: 0 });
    expect(x0).toBeLessThan(x1);
    for (const giro of [0, 90, 180, 270] as const) {
      for (const espelhada of [false, true]) {
        for (const c of PLANTA.comodos) {
          const p = emPorcentagem(c.rotulo, { espelhada, giro });
          expect(p.esquerda).toBeGreaterThan(0);
          expect(p.esquerda).toBeLessThan(100);
          expect(p.topo).toBeGreaterThan(0);
          expect(p.topo).toBeLessThan(100);
        }
      }
    }
    const deitada = caixaDoDesenho({ espelhada: false, giro: 90 });
    const empe = caixaDoDesenho({ espelhada: false, giro: 0 });
    expect(deitada.largura).toBeCloseTo(empe.altura);
  });

  it('aponta o norte para cima na planta-base e para baixo no final 03', () => {
    expect(norteNoDesenho({ espelhada: false, giro: 0 })).toBe(0);
    expect(norteNoDesenho({ espelhada: true, giro: 0 })).toBe(180);
    expect(norteNoDesenho({ espelhada: false, giro: 90 })).toBe(90);
  });
});
