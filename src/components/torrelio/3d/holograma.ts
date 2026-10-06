/**
 * A geometria do modo holograma, sem three.js: onde cada vista do prédio entra na tela, girada e
 * espelhada. Fica separada da cena para ser testada sem WebGL.
 *
 * - **Pirâmide** (a tela deitada, a pirâmide de acrílico de ponta para baixo no centro): quatro
 *   vistas em cruz, numa grade 3 × 3 com o centro vazio. Cada face da pirâmide reflete a vista do
 *   seu lado; por isso o "para cima" de cada vista aponta para fora, e quem dá a volta na pirâmide
 *   vê o prédio por outro lado (a câmera anda 90° a cada face, no mesmo sentido de quem anda).
 * - **Vitrine** (um vidro a 45° na frente da tela, ou um ventilador de LED): uma vista só.
 *
 * O reflexo inverte esquerda e direita; com `espelhar`, a imagem já sai invertida e o reflexo a
 * desvira. Com `girar180`, a vista da vitrine fica de cabeça para baixo (tela em cima do vidro).
 */

import type { Estacao, Modo } from '@/lib/torrelio/tipos';

export type LayoutDoHolograma = 'piramide' | 'vitrine';

/** O que a interface manda para a cena do holograma (o mesmo estado da demonstração, e o formato). */
export type EstadoDoHolograma = {
  modo: Modo;
  luzes: Uint8Array;
  disponiveis: Uint8Array;
  hora: number;
  estacao: Estacao;
  /** A preferência de movimento do site: liga os efeitos de tempo (as luzes acendendo devagar), não o giro. */
  movimento: boolean;
  layout: LayoutDoHolograma;
  espelhar: boolean;
  girar180: boolean;
  /** A mesa gira. É um botão do próprio holograma e vale mesmo com movimento reduzido. */
  girando: boolean;
};

export type VideoDoHolograma = { arquivo: Blob; extensao: 'mp4' | 'webm' };

/** O contrato da cena (o three.js só chega por import dinâmico). */
export type CenaHolograma = {
  aplicar(estado: EstadoDoHolograma): void;
  /**
   * Grava uma volta da mesa, da vista da frente, sem espelho, num quadrado de 1080 px (o vídeo do
   * ventilador de LED). Resolve com `null` se o navegador não gravar ou se a gravação for parada.
   */
  gravar(aoProgresso?: (fracao: number) => void): Promise<VideoDoHolograma | null>;
  pararGravacao(): void;
  aoMudarContexto(ouvinte: (situacao: 'perdido' | 'restaurado') => void): () => void;
  descartar(): void;
};

export type CarregarHolograma = (host: HTMLElement, inicial: EstadoDoHolograma) => Promise<CenaHolograma>;

export type Celula = {
  /** Centro e lado da vista, em pixels do canvas de saída. */
  cx: number;
  cy: number;
  lado: number;
  /** Giro da imagem, em graus no sentido horário da tela: o "para cima" da vista aponta para fora. */
  giro: 0 | 90 | 180 | 270;
  /**
   * Quanto a câmera desta vista anda em volta do prédio a partir da frente, em graus no sentido
   * anti-horário visto de cima (o mesmo sentido de quem anda em volta da pirâmide de 90° em 90°).
   */
  volta: 0 | 90 | 180 | 270;
};

export function celulasDoHolograma(layout: LayoutDoHolograma, largura: number, altura: number, girar180 = false): readonly Celula[] {
  const lado = Math.min(largura, altura);
  const cx = largura / 2;
  const cy = altura / 2;
  if (layout === 'vitrine') return [{ cx, cy, lado, giro: girar180 ? 180 : 0, volta: 0 }];
  const s = lado / 3;
  // Embaixo fica a frente do prédio: é o lado de quem para diante da tela deitada.
  return [
    { cx, cy: cy + s, lado: s, giro: 180, volta: 0 },
    { cx: cx + s, cy, lado: s, giro: 90, volta: 90 },
    { cx, cy: cy - s, lado: s, giro: 0, volta: 180 },
    { cx: cx - s, cy, lado: s, giro: 270, volta: 270 },
  ];
}

/**
 * O azimute da câmera (graus a partir do norte, no sentido horário, como em `camera.ts`) de uma
 * vista: a frente do prédio (norte) mais o giro da mesa, menos a volta da face (anti-horário).
 */
export function azimuteDaVista(giroDaMesa: number, volta: number): number {
  return (((giroDaMesa - volta) % 360) + 360) % 360;
}

/** Uma volta inteira da mesa giratória, em segundos: devagar, para dar tempo de ler as luzes. */
export const VOLTA_EM_SEGUNDOS = 24;

/** O lado (em pixels) em que cada vista é desenhada: o da célula, com um teto para a GPU. */
export function ladoDeDesenho(celula: Celula, teto = 1400): number {
  return Math.max(64, Math.min(teto, Math.round(celula.lado)));
}
