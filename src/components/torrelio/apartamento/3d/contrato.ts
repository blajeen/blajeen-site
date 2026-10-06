import type { ComodoId } from '@/lib/torrelio/planta';
import type { Estacao } from '@/lib/torrelio/tipos';

/**
 * O contrato entre a seção do apartamento e a cena 3D dele. Só tipos, sem three.js: a interface
 * depende disto sem carregar o 3D, que chega por import dinâmico (`carregar-apartamento.ts`)
 * quando a pessoa mostra intenção. O apartamento tem o próprio `WebGLRenderer`, separado da torre.
 */

export type ModoDoApartamento = 'maquete' | 'planta';

export type EstadoDoApartamento = {
  modo: ModoDoApartamento;
  selecionado: ComodoId | null;
  /** Cômodo sob o ponteiro na lista (o 3D cuida sozinho do ponteiro sobre o próprio piso). */
  destacado: ComodoId | null;
  /** Final 03: a planta-base espelhada (`scale.x = −1` na raiz). */
  espelhada: boolean;
  /** Para onde fica o norte no desenho (graus, horário, a partir do alto), já com o espelho. */
  norteGraus: number;
  /** "Girar planta": a vista gira em passos de 90° (na planta e na maquete), pelo caminho mais curto. */
  giro: 0 | 90 | 180 | 270;
  /** Hora solar e estação, as mesmas da torre: o sol entra pelas janelas certas. */
  hora: number;
  estacao: Estacao;
  /** `false` com movimento reduzido ou o botão MOVIMENTO desligado: trocas instantâneas. */
  movimento: boolean;
};

/** Um ponto da cena projetado no palco, em pixels. */
export type Projecao = { x: number; y: number; visivel: boolean };

export interface CenaApartamento {
  /** Desenha o estado; a cena aplica só a diferença (e anima, se houver movimento). */
  aplicar(estado: EstadoDoApartamento): void;
  /** Clique ou toque num piso (ou fora: `null`). Devolve a função que cancela. */
  aoEscolher(ouvinte: (id: ComodoId | null) => void): () => void;
  /** Ponteiro passando sobre um piso. */
  aoPassar(ouvinte: (id: ComodoId | null) => void): () => void;
  /** Onde ficam os rótulos dos cômodos e os textos das cotas, a cada quadro em que mudam. */
  aoProjetarRotulos(ouvinte: (comodos: ReadonlyMap<ComodoId, Projecao>, cotas: readonly Projecao[]) => void): () => void;
  /** Para onde aponta o norte na tela (graus, horário, a partir do alto). */
  aoMudarRumo(ouvinte: (graus: number) => void): () => void;
  /** A GPU derrubou o contexto (o pôster volta) ou ele voltou. */
  aoMudarContexto(ouvinte: (estado: 'perdido' | 'restaurado') => void): () => void;
  /** Números para o QA: quadros desenhados e o custo do último. */
  readonly diagnostico: { quadros: number; chamadas: number; triangulos: number };
  descartar(): void;
}

/** A entrada do import dinâmico: monta a cena no `host` já no estado pedido. */
export type CarregarApartamento = (host: HTMLElement, estado: EstadoDoApartamento) => Promise<CenaApartamento>;
