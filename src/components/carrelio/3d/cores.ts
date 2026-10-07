/**
 * Cores da cena do carro, sem three.js: conversão entre hex sRGB e RGB linear, OKLab, o acabamento
 * da pintura a partir da cor e a máscara da pintura por cor (a mesma conta do shader, para os
 * testes provarem que vidro, pneu e cromado não são tingidos).
 *
 * O catálogo manda só o hex da cor. Metálico ou sólido sai da luminosidade: as cores claras (o
 * branco) ficam sólidas, quase sem metal, porque branco metálico em estúdio escuro fica cinza; as
 * médias e escuras ganham metal e flocos, que é como o Cinza, o Azul e o Preto são vendidos.
 */

export type Rgb = readonly [number, number, number];

const HEX = /^#([0-9a-f]{6})$/i;

export function hexValido(hex: string): boolean {
  return HEX.test(hex);
}

export const srgbParaLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export const linearParaSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

/** `#rrggbb` (sRGB) em RGB linear, de 0 a 1. Hex inválido vira cinza médio, sem quebrar a cena. */
export function hexParaLinear(hex: string): Rgb {
  const casou = HEX.exec(hex);
  if (!casou) return [0.2, 0.2, 0.2];
  const n = Number.parseInt(casou[1]!, 16);
  return [srgbParaLinear(((n >> 16) & 255) / 255), srgbParaLinear(((n >> 8) & 255) / 255), srgbParaLinear((n & 255) / 255)];
}

export function linearParaHex(rgb: Rgb): string {
  const canal = (c: number) => Math.round(Math.min(1, Math.max(0, linearParaSrgb(c))) * 255).toString(16).padStart(2, '0');
  return `#${canal(rgb[0])}${canal(rgb[1])}${canal(rgb[2])}`;
}

/** Luminância relativa (Rec. 709) de uma cor linear. */
export const luminancia = (c: Rgb) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

export function misturar(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** RGB linear em OKLab (Björn Ottosson): L de 0 a 1, a e b em torno de 0. */
export function linearParaOklab(c: Rgb): Rgb {
  const l = Math.cbrt(Math.max(0, 0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2]));
  const m = Math.cbrt(Math.max(0, 0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2]));
  const s = Math.cbrt(Math.max(0, 0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2]));
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const suave = (de: number, ate: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - de) / (ate - de)));
  return t * t * (3 - 2 * t);
};

export type AcabamentoDaPintura = {
  /** Metálico do PBR (0 a 1). */
  metalico: number;
  rugosidade: number;
  /** Força dos flocos (o normal map de flocos do modelo), de 0 a 1. */
  flocos: number;
};

/**
 * O acabamento da pintura pela cor: claras (L do OKLab acima de ~0,85) ficam sólidas e
 * peroladas; o resto é metálico com flocos. A transição é suave para a troca de cor animar sem
 * salto.
 */
export function acabamentoDaCor(hex: string): AcabamentoDaPintura {
  const [l] = linearParaOklab(hexParaLinear(hex));
  const claro = suave(0.78, 0.9, l);
  return {
    metalico: 0.6 + (0.04 - 0.6) * claro,
    rugosidade: 0.36 + (0.42 - 0.36) * claro,
    flocos: 1 - claro,
  };
}

/**
 * A cor base da pintura metálica: o metal escurece o difuso (só `1 − metálico` dele sobra), e no
 * estúdio escuro a lataria ficava mais escura que a amostra. Um ganho pequeno, que cresce com o
 * metal, devolve o tom da amostra nas áreas iluminadas (conferido no QA, lado a lado).
 */
export function corDaPintura(hex: string, metalico: number): Rgb {
  const base = hexParaLinear(hex);
  const ganho = 1 + 0.55 * metalico;
  return [Math.min(1, base[0] * ganho), Math.min(1, base[1] * ganho), Math.min(1, base[2] * ganho)];
}

/**
 * Máscara da pintura por cor, para modelos de malha única (gerados por IA) com a cor da lataria
 * assada na textura. Mesma conta do shader (`materiais.ts`):
 *
 * - distância de croma (a, b do OKLab) à cor base, com peso 2: cor saturada (lanterna, pinça de
 *   freio) não é lataria;
 * - só o que é mais escuro que a base conta (o sombreado assado escurece a lataria, e reflexo
 *   assado é mais claro que ela): pneu, vidro escuro e grade ficam de fora;
 * - borda suave entre 55% e 100% da tolerância;
 * - metal (cromado, espelho) nunca é tingido.
 */
export function mascaraDaPintura(texel: Rgb, base: Rgb, tolerancia: number, metalico = 0): number {
  const t = linearParaOklab(texel);
  const b = linearParaOklab(base);
  const croma = Math.hypot(t[1] - b[1], t[2] - b[2]);
  const escurecimento = Math.max(0, b[0] - t[0]);
  const distancia = Math.max(croma * 2, escurecimento);
  const tol = Math.max(0.01, tolerancia);
  return (1 - suave(tol * 0.55, tol, distancia)) * (1 - suave(0.35, 0.65, metalico));
}

/**
 * A cor tingida de um texel: a cor da pintura com o sombreado assado (a razão entre a luminância do
 * texel e a da base), para a textura continuar desenhando as dobras e as sombras da lataria.
 */
export function tingir(texel: Rgb, base: Rgb, pintura: Rgb): Rgb {
  const razao = Math.min(1.3, Math.max(0, luminancia(texel) / Math.max(1e-4, luminancia(base))));
  return [pintura[0] * razao, pintura[1] * razao, pintura[2] * razao];
}
