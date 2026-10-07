import { escolherNivel, lerSinais, MedidorDeQuadros, nivelAbaixo, type NivelDeQualidade, type SinaisDoAparelho } from '@/components/torrelio/3d/qualidade';

/**
 * Níveis de qualidade da cena do carro. Os sinais do aparelho, a escolha do nível, a descida
 * adaptativa e o medidor de quadros são os do Torrelio (`torrelio/3d/qualidade.ts`); aqui ficam só
 * os ajustes próprios do carro. Puro, testado à parte.
 *
 * | Nível | DPR máximo | MSAA          | Reflexos (PMREM) | Vidro       | Halos | Sombra de contato |
 * |-------|------------|---------------|------------------|-------------|-------|-------------------|
 * | alto  | 2          | abaixo de 2×  | 512              | transmissão | sim   | 1024              |
 * | médio | 2          | não           | 256              | mistura     | sim   | 512               |
 * | baixo | 1,25       | não           | 256              | mistura     | não   | 256               |
 *
 * O teto de 2× é o mesmo do Torrelio ("nada borrado"). O vidro com transmissão (a cena por trás
 * desenhada de novo e refratada) só no computador; no resto, vidro por mistura, que custa quase nada
 * e de fora fica igual. Os reflexos da lataria saem do PMREM: 512 desenha as faixas de luz nítidas
 * no verniz; 256 já basta na tela pequena.
 */

export { escolherNivel, lerSinais, MedidorDeQuadros, nivelAbaixo };
export type { NivelDeQualidade, SinaisDoAparelho };

export type AjustesDoCarro = {
  nivel: NivelDeQualidade;
  /** Razão de pixels efetiva, já limitada pelo nível. */
  dpr: number;
  msaa: boolean;
  /** Lado do PMREM do estúdio (os reflexos). */
  reflexos: 256 | 512;
  /** Vidro com transmissão (só no alto, e só para modelos com vidro de verdade). */
  transmissao: boolean;
  halos: boolean;
  /** Lado da textura da sombra de contato, assada uma vez. */
  sombraDeContato: 256 | 512 | 1024;
  /** Filtro anisotrópico das texturas (o chão e a lataria vistos de lado). */
  anisotropia: number;
};

const DPR_MAXIMO: Readonly<Record<NivelDeQualidade, number>> = { alto: 2, medio: 2, baixo: 1.25 };

export function ajustesDoCarro(nivel: NivelDeQualidade, dprDoAparelho: number): AjustesDoCarro {
  const dpr = Math.max(1, Math.min(DPR_MAXIMO[nivel], dprDoAparelho || 1));
  return {
    nivel,
    dpr,
    // Em 2× a densidade já alisa as bordas; abaixo disso (monitor comum), MSAA.
    msaa: nivel === 'alto' && dpr < 2,
    reflexos: nivel === 'alto' ? 512 : 256,
    transmissao: nivel === 'alto',
    halos: nivel !== 'baixo',
    sombraDeContato: nivel === 'alto' ? 1024 : nivel === 'medio' ? 512 : 256,
    anisotropia: nivel === 'alto' ? 8 : nivel === 'medio' ? 4 : 1,
  };
}

/** Orçamento por quadro, para o QA conferir `diagnostico` (carro de fora, sem transição). */
export const ORCAMENTO_DO_CARRO = {
  computador: { chamadas: 45, triangulos: 450_000 },
  celular: { chamadas: 40, triangulos: 300_000 },
} as const;
