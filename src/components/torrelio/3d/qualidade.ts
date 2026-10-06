/**
 * Níveis de qualidade da cena da torre. Puro: decide a partir de sinais do aparelho, sem tocar no
 * WebGL, e é testado à parte.
 *
 * | Nível | DPR máximo | MSAA            | Sombra | Entorno   | Halos e interiores |
 * |-------|------------|-----------------|--------|-----------|--------------------|
 * | alto  | 1,5        | se DPR ≤ 1,25   | 2048   | completo  | sim                |
 * | médio | 1,5        | não             | 1024   | reduzido  | sim                |
 * | baixo | 1          | não             | nenhuma| reduzido  | não                |
 *
 * Ajuste adaptativo: se o p90 dos quadros de duas animações seguidas passar de 24 ms, a cena desce
 * um degrau (só a resolução e a sombra mudam em tempo de execução; o MSAA é decidido na criação).
 */

export type NivelDeQualidade = 'alto' | 'medio' | 'baixo';

export type SinaisDoAparelho = {
  /** Ponteiro grosso (toque) como principal. */
  ponteiroGrosso: boolean;
  nucleos: number | null;
  /** `navigator.deviceMemory`, em GB (só Chromium informa). */
  memoriaGb: number | null;
  /** `navigator.connection.saveData`. */
  economiaDeDados: boolean;
  /** Largura da janela, em px CSS. */
  largura: number;
};

export function escolherNivel(s: SinaisDoAparelho): NivelDeQualidade {
  if (s.economiaDeDados) return 'baixo';
  if ((s.memoriaGb !== null && s.memoriaGb <= 2) || (s.nucleos !== null && s.nucleos <= 2)) return 'baixo';
  if (s.ponteiroGrosso || s.largura < 900) return 'medio';
  if ((s.memoriaGb !== null && s.memoriaGb <= 4) || (s.nucleos !== null && s.nucleos <= 4)) return 'medio';
  return 'alto';
}

/** Lê os sinais do navegador. Fora do navegador (testes, servidor), devolve um aparelho mediano. */
export function lerSinais(): SinaisDoAparelho {
  if (typeof window === 'undefined') return { ponteiroGrosso: false, nucleos: null, memoriaGb: null, economiaDeDados: false, largura: 1280 };
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return {
    ponteiroGrosso: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    nucleos: typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null,
    memoriaGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    economiaDeDados: nav.connection?.saveData === true,
    largura: window.innerWidth,
  };
}

export type Ajustes = {
  nivel: NivelDeQualidade;
  /** Razão de pixels efetiva, já limitada pelo nível. */
  dpr: number;
  msaa: boolean;
  /** Lado do mapa de sombra; 0 = sem sombra. */
  sombra: 0 | 1024 | 2048;
  halos: boolean;
  /** Interiores com profundidade nas janelas acesas ("interior mapping"). */
  interiores: boolean;
  entorno: 'completo' | 'reduzido';
};

const DPR_MAXIMO: Readonly<Record<NivelDeQualidade, number>> = { alto: 1.5, medio: 1.5, baixo: 1 };
const SOMBRA: Readonly<Record<NivelDeQualidade, 0 | 1024 | 2048>> = { alto: 2048, medio: 1024, baixo: 0 };

export function ajustesDoNivel(nivel: NivelDeQualidade, dprDoAparelho: number): Ajustes {
  const dpr = Math.max(1, Math.min(DPR_MAXIMO[nivel], dprDoAparelho || 1));
  return {
    nivel,
    dpr,
    msaa: nivel === 'alto' && dpr <= 1.25,
    sombra: SOMBRA[nivel],
    halos: nivel !== 'baixo',
    interiores: nivel !== 'baixo',
    entorno: nivel === 'alto' ? 'completo' : 'reduzido',
  };
}

export function nivelAbaixo(nivel: NivelDeQualidade): NivelDeQualidade {
  return nivel === 'alto' ? 'medio' : 'baixo';
}

/** Orçamento por quadro, para o QA conferir `diagnostico`. */
export const ORCAMENTO = {
  computador: { chamadas: 45, triangulos: 250_000 },
  celular: { chamadas: 35, triangulos: 120_000 },
} as const;

/** Acima disto (p90 de uma animação), a animação contou como lenta. */
export const QUADRO_LENTO_MS = 24;

/** O percentil `p` (0 a 1) de uma lista de tempos. */
export function percentil(tempos: readonly number[], p: number): number {
  if (tempos.length === 0) return 0;
  const ordenados = [...tempos].sort((a, b) => a - b);
  const i = Math.min(ordenados.length - 1, Math.max(0, Math.ceil(p * ordenados.length) - 1));
  return ordenados[i]!;
}

/**
 * Mede os quadros de cada animação e diz quando descer de nível: duas animações seguidas com p90
 * acima de `QUADRO_LENTO_MS`. Animações curtas demais (menos de 8 quadros) não contam.
 */
export class MedidorDeQuadros {
  private tempos: number[] = [];
  private lentasSeguidas = 0;

  registrar(ms: number): void {
    if (Number.isFinite(ms) && ms > 0 && ms < 1000) this.tempos.push(ms);
  }

  /** Fecha a animação corrente; devolve `true` quando é hora de descer um nível. */
  fecharAnimacao(): boolean {
    const tempos = this.tempos;
    this.tempos = [];
    if (tempos.length < 8) return false;
    if (percentil(tempos, 0.9) > QUADRO_LENTO_MS) this.lentasSeguidas += 1;
    else this.lentasSeguidas = 0;
    if (this.lentasSeguidas >= 2) {
      this.lentasSeguidas = 0;
      return true;
    }
    return false;
  }
}
