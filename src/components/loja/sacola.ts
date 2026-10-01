'use client';

import { useSyncExternalStore } from 'react';

/**
 * Sacola da loja, guardada no navegador da pessoa (`localStorage`), sem conta e sem servidor.
 *
 * O preço daqui só serve para mostrar: o servidor recalcula tudo com o catálogo no momento do
 * pedido. Se o navegador bloquear o armazenamento (aba anônima de alguns navegadores), a sacola
 * continua funcionando em memória enquanto a página estiver aberta.
 */

export type ItemDaSacola = {
  produtoId: string;
  slug: string;
  nome: string;
  opcaoId: string;
  opcaoRotulo: string;
  precoCentavos: number;
  quantidade: number;
  digital: boolean;
  imagem: string;
};

const CHAVE = 'blajeen:sacola';
const MAXIMO_POR_ITEM = 20;
const VAZIA: ItemDaSacola[] = [];
const ouvintes = new Set<() => void>();
let bruto: string | null = null;
let atual: ItemDaSacola[] = VAZIA;

function valido(item: unknown): item is ItemDaSacola {
  const i = item as Partial<ItemDaSacola> | null;
  return Boolean(i && typeof i.produtoId === 'string' && typeof i.opcaoId === 'string' && typeof i.nome === 'string'
    && Number.isInteger(i.quantidade) && (i.quantidade ?? 0) > 0 && Number.isInteger(i.precoCentavos));
}

function ler(): ItemDaSacola[] {
  let texto: string | null = null;
  try { texto = window.localStorage.getItem(CHAVE); } catch { return atual; }
  if (texto === bruto) return atual;
  bruto = texto;
  try {
    const lista = JSON.parse(texto ?? '[]') as unknown;
    atual = Array.isArray(lista) ? lista.filter(valido) : VAZIA;
  } catch {
    atual = VAZIA;
  }
  return atual;
}

function gravar(itens: ItemDaSacola[]) {
  atual = itens;
  try {
    bruto = JSON.stringify(itens);
    window.localStorage.setItem(CHAVE, bruto);
  } catch {
    // Sem armazenamento: fica em memória.
  }
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  // Outra aba mexeu na sacola.
  const aoGuardar = (evento: StorageEvent) => { if (evento.key === CHAVE) avisar(); };
  window.addEventListener('storage', aoGuardar);
  return () => { ouvintes.delete(avisar); window.removeEventListener('storage', aoGuardar); };
}

const mesmo = (a: Pick<ItemDaSacola, 'produtoId' | 'opcaoId'>, b: Pick<ItemDaSacola, 'produtoId' | 'opcaoId'>) =>
  a.produtoId === b.produtoId && a.opcaoId === b.opcaoId;

export function adicionarNaSacola(item: ItemDaSacola) {
  const itens = ler();
  const existente = itens.find((i) => mesmo(i, item));
  gravar(existente
    ? itens.map((i) => (mesmo(i, item) ? { ...item, quantidade: Math.min(MAXIMO_POR_ITEM, i.quantidade + item.quantidade) } : i))
    : [...itens, { ...item, quantidade: Math.min(MAXIMO_POR_ITEM, item.quantidade) }]);
}

export function alterarQuantidade(alvo: Pick<ItemDaSacola, 'produtoId' | 'opcaoId'>, quantidade: number) {
  const nova = Math.max(1, Math.min(MAXIMO_POR_ITEM, Math.round(quantidade)));
  gravar(ler().map((i) => (mesmo(i, alvo) ? { ...i, quantidade: nova } : i)));
}

export function removerDaSacola(alvo: Pick<ItemDaSacola, 'produtoId' | 'opcaoId'>) {
  gravar(ler().filter((i) => !mesmo(i, alvo)));
}

export function esvaziarSacola() {
  gravar([]);
}

export function useSacola() {
  const itens = useSyncExternalStore(assinar, ler, () => VAZIA);
  return {
    itens,
    quantidade: itens.reduce((soma, i) => soma + i.quantidade, 0),
    totalCentavos: itens.reduce((soma, i) => soma + i.quantidade * i.precoCentavos, 0),
  };
}

export { MAXIMO_POR_ITEM };
