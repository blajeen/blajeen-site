import { direcaoDoSol, posicaoDoSol } from '@/lib/torrelio/sol';
import type { Estacao } from '@/lib/torrelio/tipos';

/**
 * O céu, a luz e a névoa de cada hora, sem three.js: a cena só copia estes números para uniforms e
 * luzes. Tudo sai da elevação do sol (`sol.ts`), por quadros-chave interpolados em espaço linear.
 * Abaixo de −6° é noite: luar sem sombra, janelas da cidade e postes acesos.
 *
 * Cores pensadas para a paleta do site: céu profundo e pouco saturado, horizonte quente só no fim
 * da tarde, noite quase preta com um azul de fundo. Nada de gradiente saturado.
 */

export type Rgb = [number, number, number];

export type Atmosfera = {
  /** Para onde fica o sol (vetor unitário, cena). */
  direcaoDoSol: [number, number, number];
  elevacao: number;
  azimute: number;
  /** Cores lineares do domo. */
  zenite: Rgb;
  horizonte: Rgb;
  /** Abaixo do horizonte: a bruma sobre o chão distante. */
  chao: Rgb;
  /** Cor e força do brilho em volta do sol (no domo e na névoa). */
  brilhoDoSol: Rgb;
  /** Cor e intensidade da luz direcional do sol. */
  corDoSol: Rgb;
  intensidadeDoSol: number;
  /** Luar: intensidade da direcional fria da noite (sem sombra). */
  intensidadeDoLuar: number;
  hemisferioCeu: Rgb;
  hemisferioChao: Rgb;
  intensidadeHemisferio: number;
  exposicao: number;
  /** 0 de dia, 1 de noite: janelas da cidade, postes, halos, estrelas. */
  noite: number;
  estrelas: number;
  /** Densidade da névoa exponencial (FogExp2). */
  nevoa: number;
  /** Se vale desenhar sombra (sol acima do horizonte). */
  sombra: boolean;
};

type Quadro = {
  e: number;
  zenite: string;
  horizonte: string;
  chao: string;
  brilho: string;
  /** Multiplica as cores do céu (o céu da noite não é só mais escuro, é muito mais escuro). */
  ceu: number;
  sol: string;
  intensidadeDoSol: number;
  hemiForca: number;
  exposicao: number;
};

/** Quadros-chave por elevação do sol, em graus. */
const QUADROS: readonly Quadro[] = [
  { e: -90, zenite: '#04060c', horizonte: '#0b1019', chao: '#06080b', brilho: '#000000', ceu: 0.55, sol: '#000000', intensidadeDoSol: 0, hemiForca: 0.16, exposicao: 1.35 },
  { e: -14, zenite: '#04070e', horizonte: '#0d1320', chao: '#070a0e', brilho: '#000000', ceu: 0.6, sol: '#000000', intensidadeDoSol: 0, hemiForca: 0.17, exposicao: 1.35 },
  { e: -8, zenite: '#08101f', horizonte: '#1e2433', chao: '#0b0e13', brilho: '#3b2a33', ceu: 0.7, sol: '#000000', intensidadeDoSol: 0, hemiForca: 0.22, exposicao: 1.3 },
  { e: -4, zenite: '#13213c', horizonte: '#5a4a52', chao: '#191a1e', brilho: '#a8584a', ceu: 0.8, sol: '#000000', intensidadeDoSol: 0, hemiForca: 0.36, exposicao: 1.2 },
  { e: -1, zenite: '#1f3256', horizonte: '#a87862', chao: '#2a2726', brilho: '#ff8a52', ceu: 0.9, sol: '#ff7a3c', intensidadeDoSol: 0.05, hemiForca: 0.55, exposicao: 1.1 },
  { e: 2, zenite: '#2a4570', horizonte: '#d99a72', chao: '#3c3632', brilho: '#ffa066', ceu: 1, sol: '#ff9a5c', intensidadeDoSol: 0.9, hemiForca: 0.75, exposicao: 1.0 },
  { e: 7, zenite: '#335684', horizonte: '#e2b590', chao: '#4a4642', brilho: '#ffc08a', ceu: 1, sol: '#ffbe86', intensidadeDoSol: 2.0, hemiForca: 0.9, exposicao: 0.95 },
  { e: 15, zenite: '#3a6493', horizonte: '#d9cbb8', chao: '#58585a', brilho: '#ffdcb4', ceu: 1, sol: '#ffd9b0', intensidadeDoSol: 2.7, hemiForca: 1.0, exposicao: 0.92 },
  { e: 30, zenite: '#3d6c9f', horizonte: '#cfd5d8', chao: '#62656a', brilho: '#fff0dc', ceu: 1, sol: '#ffeedd', intensidadeDoSol: 3.1, hemiForca: 1.05, exposicao: 0.9 },
  { e: 90, zenite: '#3a6aa0', horizonte: '#c8d3dc', chao: '#66696e', brilho: '#fff6ec', ceu: 1, sol: '#fff6ee', intensidadeDoSol: 3.3, hemiForca: 1.1, exposicao: 0.9 },
];

/** sRGB (hex) para linear, como o three faz com `Color.setHex`. */
export function linear(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return [canal((n >> 16) & 255), canal((n >> 8) & 255), canal(n & 255)];
}

const misturar = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const escalar = (a: Rgb, k: number): Rgb => [a[0] * k, a[1] * k, a[2] * k];
const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function quadroEm(elevacao: number): { de: Quadro; ate: Quadro; t: number } {
  const e = Math.max(-90, Math.min(90, elevacao));
  for (let i = 1; i < QUADROS.length; i += 1) {
    const ate = QUADROS[i]!;
    if (e <= ate.e) {
      const de = QUADROS[i - 1]!;
      return { de, ate, t: (e - de.e) / (ate.e - de.e) };
    }
  }
  const ultimo = QUADROS.at(-1)!;
  return { de: ultimo, ate: ultimo, t: 0 };
}

/** O fator de noite: 0 com o sol acima de 3°, 1 abaixo de −6° (fim do crepúsculo civil). */
export const fatorDeNoite = (elevacao: number) => suave(3, -6, elevacao);

export function atmosferaPara(hora: number, estacao: Estacao): Atmosfera {
  const { azimute, elevacao } = posicaoDoSol(hora, estacao);
  const { de, ate, t } = quadroEm(elevacao);
  const cor = (campo: 'zenite' | 'horizonte' | 'chao' | 'brilho' | 'sol') => misturar(linear(de[campo]), linear(ate[campo]), t);
  const numero = (campo: 'ceu' | 'intensidadeDoSol' | 'hemiForca' | 'exposicao') => de[campo] + (ate[campo] - de[campo]) * t;
  const ceu = numero('ceu');
  const noite = fatorDeNoite(elevacao);
  const zenite = escalar(cor('zenite'), ceu);
  const horizonte = escalar(cor('horizonte'), ceu);
  // A hemisférica: o céu de cima (um meio-termo entre zênite e horizonte) e o chão quente rebatido.
  const hemisferioCeu = misturar(zenite, horizonte, 0.35);
  const hemisferioChao = misturar(escalar(cor('chao'), 1.1), linear('#6b5e50'), 0.25 * (1 - noite));
  return {
    direcaoDoSol: direcaoDoSol(hora, estacao),
    elevacao,
    azimute,
    zenite,
    horizonte,
    chao: escalar(cor('chao'), ceu),
    brilhoDoSol: cor('brilho'),
    corDoSol: cor('sol'),
    intensidadeDoSol: elevacao <= -1.5 ? 0 : numero('intensidadeDoSol'),
    intensidadeDoLuar: 0.32 * suave(-2, -10, elevacao),
    hemisferioCeu,
    hemisferioChao,
    intensidadeHemisferio: numero('hemiForca'),
    exposicao: numero('exposicao'),
    noite,
    estrelas: suave(-9, -16, elevacao),
    nevoa: 0.00105 + 0.0002 * noite,
    sombra: elevacao > 0.5,
  };
}

/** De onde vem o luar: alto, a nordeste. Fixo, para a noite não mudar de cara com a hora. */
export const DIRECAO_DO_LUAR: [number, number, number] = (() => {
  const az = 35 * (Math.PI / 180);
  const el = 52 * (Math.PI / 180);
  return [Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)];
})();
