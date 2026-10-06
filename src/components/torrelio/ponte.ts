import { useSyncExternalStore } from 'react';
import type { Estacao, TipologiaId } from '@/lib/torrelio/tipos';

/**
 * A ponte entre a demonstração da torre e a do apartamento, que ficam em seções diferentes da
 * página. Quando a pessoa pede "Ver o apartamento por dentro" no cartão de uma unidade, a torre
 * escreve aqui qual é a unidade e a hora do sol; o apartamento lê e se ajusta (planta espelhada no
 * final 03, o sol entrando pela janela na mesma hora). Só memória: nada vai para o armazenamento.
 */
export type ContextoDoApartamento = {
  /** A unidade escolhida na torre, ou `null` quando a pessoa abriu a seção do apartamento direto. */
  unidade: { id: string; final: string; tipologia: TipologiaId } | null;
  /** Hora solar (5 a 23) e estação, as mesmas da torre. */
  hora: number;
  estacao: Estacao;
  /** Muda a cada pedido de "ver por dentro", para o apartamento rolar até a seção e pôr o foco no título. */
  pedido: number;
};

const INICIAL: ContextoDoApartamento = { unidade: null, hora: 15, estacao: 'equinocio', pedido: 0 };

let atual = INICIAL;
const ouvintes = new Set<() => void>();

export function definirContextoDoApartamento(parcial: Partial<Omit<ContextoDoApartamento, 'pedido'>>, pedir = false): void {
  atual = { ...atual, ...parcial, pedido: pedir ? atual.pedido + 1 : atual.pedido };
  ouvintes.forEach((ouvinte) => ouvinte());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function useContextoDoApartamento(): ContextoDoApartamento {
  return useSyncExternalStore(assinar, () => atual, () => INICIAL);
}

/** Para os testes: volta ao estado inicial. */
export function reiniciarPonte(): void {
  atual = INICIAL;
  ouvintes.forEach((ouvinte) => ouvinte());
}
