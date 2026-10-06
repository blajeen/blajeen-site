import { describe, expect, it } from 'vitest';
import { azimuteDaVista, celulasDoHolograma, ladoDeDesenho } from './holograma';

/** Para onde aponta o "para cima" da vista depois do giro (y da tela cresce para baixo). */
function cimaDaVista(giro: number): [number, number] {
  const r = (giro * Math.PI) / 180;
  // `+ 0` desfaz o −0 do arredondamento.
  return [Math.round(Math.sin(r)) + 0, Math.round(-Math.cos(r)) + 0];
}

describe('a geometria do holograma', () => {
  it('na pirâmide, põe quatro vistas em cruz, sem sobrepor, com o centro livre para a ponta', () => {
    const celulas = celulasDoHolograma('piramide', 1920, 1080);
    expect(celulas).toHaveLength(4);
    const lado = 1080 / 3;
    for (const c of celulas) expect(c.lado).toBeCloseTo(lado);
    // Nenhuma vista invade o quadrado do centro nem as outras.
    for (const [i, a] of celulas.entries()) {
      expect(Math.hypot(a.cx - 960, a.cy - 540)).toBeCloseTo(lado);
      for (const b of celulas.slice(i + 1)) expect(Math.max(Math.abs(a.cx - b.cx), Math.abs(a.cy - b.cy))).toBeGreaterThanOrEqual(lado - 1e-6);
    }
  });

  it('gira cada vista para fora, e cada face mostra o prédio por um lado', () => {
    const celulas = celulasDoHolograma('piramide', 900, 900);
    for (const c of celulas) {
      const [x, y] = cimaDaVista(c.giro);
      const [dx, dy] = [Math.sign(Math.round(c.cx - 450)), Math.sign(Math.round(c.cy - 450))];
      expect([x, y]).toEqual([dx, dy]);
    }
    expect(celulas.map((c) => c.volta).sort((a, b) => a - b)).toEqual([0, 90, 180, 270]);
    // A frente fica embaixo: o lado de quem para diante da tela.
    expect(celulas.find((c) => c.volta === 0)!.cy).toBeGreaterThan(450);
  });

  it('anda com quem dá a volta: a face da direita mostra o prédio pelo oeste', () => {
    expect(azimuteDaVista(0, 0)).toBe(0);
    expect(azimuteDaVista(0, 90)).toBe(270);
    expect(azimuteDaVista(30, 180)).toBe(210);
    expect(azimuteDaVista(-10, 0)).toBe(350);
  });

  it('na vitrine, usa uma vista só, centrada, e a vira de cabeça para baixo quando pedido', () => {
    expect(celulasDoHolograma('vitrine', 1920, 1080)).toEqual([{ cx: 960, cy: 540, lado: 1080, giro: 0, volta: 0 }]);
    expect(celulasDoHolograma('vitrine', 800, 1200, true)[0]).toMatchObject({ lado: 800, giro: 180 });
  });

  it('limita o tamanho de desenho de cada vista', () => {
    expect(ladoDeDesenho({ cx: 0, cy: 0, lado: 3000, giro: 0, volta: 0 })).toBe(1400);
    expect(ladoDeDesenho({ cx: 0, cy: 0, lado: 10, giro: 0, volta: 0 })).toBe(64);
  });
});
