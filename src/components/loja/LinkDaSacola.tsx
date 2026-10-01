'use client';

import Link from 'next/link';
import { ROTA_DO_PEDIDO } from '@/lib/loja/tipos';
import { useSacola } from './sacola';

/** Atalho para a sacola nas páginas da loja. Some enquanto ela está vazia. */
export function LinkDaSacola() {
  const { quantidade } = useSacola();
  if (!quantidade) return null;
  return (
    <Link href={ROTA_DO_PEDIDO}
      className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal px-5 text-signal transition-colors hover:bg-signal hover:text-ink">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
        <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
      </svg>
      Sacola · {quantidade} {quantidade === 1 ? 'item' : 'itens'} <span aria-hidden="true">→</span>
    </Link>
  );
}
