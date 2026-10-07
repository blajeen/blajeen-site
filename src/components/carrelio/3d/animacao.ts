/**
 * Os tempos e as curvas das animações do carro, sem three.js: portas, troca de cor, luzes,
 * ambiente e a cortina das trocas de vista. Puro, para os testes.
 *
 * Toda animação anda por um progresso linear de 0 a 1 e desenha pela curva: quem inverte no meio
 * (fechar a porta que ainda abria) volta pelo mesmo caminho, sem salto nem tranco.
 */

/** Durações, em segundos. */
export const DURACAO = {
  porta: 0.7,
  cor: 0.4,
  luzes: 0.35,
  ambiente: 0.65,
  /** Cada metade da cortina (escurece, troca a câmera, clareia). */
  cortina: 0.2,
} as const;

/** Entrada e saída suaves (cúbica): a porta arranca devagar, embala e assenta. */
export function suavizar(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Só a saída suave, para o que começa de um gesto (a luz acende já). */
export function desacelerar(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - (1 - t) ** 3;
}

/** Avança um progresso linear rumo a 0 ou 1 em `duracao` segundos (sem movimento: chega na hora). */
export function avancar(atual: number, alvo: number, dt: number, duracao: number, movimento = true): number {
  if (!movimento || duracao <= 0) return alvo;
  const passo = dt / duracao;
  return alvo > atual ? Math.min(alvo, atual + passo) : Math.max(alvo, atual - passo);
}

/** O ângulo de uma peça pelo progresso da abertura. */
export const anguloDaPeca = (progresso: number, graus: number) => graus * suavizar(progresso);

/**
 * Uma transição de valor (cor, intensidade): guarda de onde saiu e para onde vai, e o progresso.
 * `valor` interpola com a curva; quem muda o destino no meio parte do valor atual.
 */
export class Transicao<T> {
  private de: T;
  private para: T;
  private t = 1;

  constructor(
    inicial: T,
    private readonly duracao: number,
    private readonly interpolar: (a: T, b: T, t: number) => T,
    private readonly curva: (t: number) => number = suavizar,
  ) {
    this.de = inicial;
    this.para = inicial;
  }

  get valor(): T {
    return this.t >= 1 ? this.para : this.interpolar(this.de, this.para, this.curva(this.t));
  }

  get destino(): T {
    return this.para;
  }

  get ativa(): boolean {
    return this.t < 1;
  }

  ir(destino: T, movimento: boolean): void {
    this.de = this.valor;
    this.para = destino;
    this.t = movimento ? 0 : 1;
  }

  /** Avança; devolve `true` enquanto anda. */
  passo(dt: number): boolean {
    if (this.t >= 1) return false;
    this.t = Math.min(1, this.t + dt / this.duracao);
    return true;
  }

  terminar(): void {
    this.t = 1;
  }
}

export const interpolarNumero = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A cortina das trocas de vista: escurece em `DURACAO.cortina`, a câmera troca no escuro e clareia
 * no mesmo tempo. `opacidade` e `trocou` dizem o que desenhar a cada quadro.
 */
export function cortina(t: number): { opacidade: number; trocar: boolean; fim: boolean } {
  const meia = DURACAO.cortina;
  if (t < meia) return { opacidade: suavizar(t / meia), trocar: false, fim: false };
  const volta = Math.min(1, (t - meia) / meia);
  return { opacidade: 1 - suavizar(volta), trocar: true, fim: volta >= 1 };
}

/**
 * Intensidade das luzes do carro pelo estado: no estúdio, faróis acesos ficam discretos; à noite,
 * a luz diurna e as lanternas acendem sempre, e os faróis ligados vão ao máximo (com a poça de luz
 * no chão).
 */
export function intensidadeDasLuzes(farois: boolean, noite: boolean): { farol: number; lanterna: number; halo: number; poca: number } {
  if (noite) return farois ? { farol: 1, lanterna: 1, halo: 1, poca: 1 } : { farol: 0.42, lanterna: 0.8, halo: 0.45, poca: 0 };
  return farois ? { farol: 0.38, lanterna: 0.55, halo: 0.28, poca: 0.18 } : { farol: 0, lanterna: 0, halo: 0, poca: 0 };
}
