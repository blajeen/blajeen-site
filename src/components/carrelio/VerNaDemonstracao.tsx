'use client';

import type { ReactNode } from 'react';
import { hrefDoComando, type Comando } from '@/lib/carrelio/link';

/** O evento que os atalhos da página disparam quando há JavaScript. */
export const EVENTO_DE_COMANDO = 'carrelio:comando';

/**
 * Um atalho da página: um link de verdade (funciona sem JavaScript, recarregando a página já na
 * configuração pedida) que, com JavaScript, vira um comando para a demonstração, sem recarregar.
 */
export function VerNaDemonstracao({ comando, children, className }: { comando: Comando; children: ReactNode; className?: string }) {
  return (
    <a
      href={hrefDoComando(comando)}
      className={className}
      onClick={(evento) => {
        if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;
        evento.preventDefault();
        window.dispatchEvent(new CustomEvent<Comando>(EVENTO_DE_COMANDO, { detail: comando }));
      }}
    >
      {children}
    </a>
  );
}
