import { describe, expect, it } from 'vitest';
import { JAECOO_5 } from '@/lib/carrelio/catalogo';
import { acabamentoDaCor, corDaPintura, hexParaLinear, hexValido, linearParaHex, luminancia, mascaraDaPintura, tingir } from './cores';

describe('as cores do carro', () => {
  it('converte hex sRGB em linear e volta sem perder o tom', () => {
    for (const cor of JAECOO_5.cores) expect(linearParaHex(hexParaLinear(cor.hex))).toBe(cor.hex);
    expect(hexParaLinear('#ffffff')).toEqual([1, 1, 1]);
    expect(hexParaLinear('#000000')).toEqual([0, 0, 0]);
    expect(hexValido('#4f6377')).toBe(true);
    expect(hexValido('4f6377')).toBe(false);
    // Hex inválido não quebra a cena: cinza médio.
    expect(hexParaLinear('azul')).toEqual([0.2, 0.2, 0.2]);
  });

  it('deixa o branco sólido e o resto metálico, com flocos', () => {
    const [branco, preto, cinza, azul] = JAECOO_5.cores.map((c) => acabamentoDaCor(c.hex));
    expect(branco!.metalico).toBeLessThan(0.1);
    expect(branco!.flocos).toBeLessThan(0.05);
    for (const metalica of [preto!, cinza!, azul!]) {
      expect(metalica.metalico).toBeGreaterThan(0.5);
      expect(metalica.flocos).toBeGreaterThan(0.95);
    }
    // O ganho do metal clareia a base, mas não passa de 1.
    const base = corDaPintura('#4f6377', 0.6);
    expect(luminancia(base)).toBeGreaterThan(luminancia(hexParaLinear('#4f6377')));
    expect(Math.max(...corDaPintura('#ffffff', 1))).toBeLessThanOrEqual(1);
  });

  it('tinge a lataria assada e deixa pneu, vidro claro, lanterna e cromado de fora', () => {
    const base = hexParaLinear('#787a7b');
    const tolerancia = 0.13;
    // A lataria assada, com o sombreado da textura (104 a 136 em sRGB).
    for (const lataria of ['#787a7b', '#6a6c6d', '#868889']) expect(mascaraDaPintura(hexParaLinear(lataria), base, tolerancia)).toBeGreaterThan(0.95);
    // Pneu e friso (escuros), vidro e barra da grade (claros) e a lanterna (saturada).
    for (const fora of ['#1e1f20', '#303233', '#c8cacc', '#e4e6e8', '#a8231d']) expect(mascaraDaPintura(hexParaLinear(fora), base, tolerancia)).toBeLessThan(0.02);
    // O cromado tem a cor da lataria, mas é metal.
    expect(mascaraDaPintura(base, base, tolerancia, 1)).toBe(0);
    expect(mascaraDaPintura(base, base, tolerancia, 1, true)).toBe(1);
  });

  it('mantém o sombreado assado na cor tingida', () => {
    const base = hexParaLinear('#787a7b');
    const azul = hexParaLinear('#4f6377');
    expect(tingir(base, base, azul)).toEqual(azul);
    const sombra = tingir(hexParaLinear('#5a5c5d'), base, azul);
    expect(luminancia(sombra)).toBeLessThan(luminancia(azul));
    // Reflexo assado clareia, até 30% a mais.
    expect(luminancia(tingir([1, 1, 1], base, azul))).toBeCloseTo(luminancia(azul) * 1.3, 6);
  });
});
