'use client';

import type { ReactNode } from 'react';
import { hrefDoComando, type Comando } from '@/lib/torrelio/link';
import { UNIDADES } from '@/lib/torrelio/predio';
import { definirContextoDoApartamento, EVENTO_DE_COMANDO } from './ponte';

/**
 * "Ver na demonstração ↑": um link de verdade (funciona sem JavaScript, recarregando a página já
 * no ponto certo) que, com JavaScript, vira um comando para a demonstração, sem recarregar.
 */
export function VerNaDemonstracao({ comando, children, className }: { comando: Comando; children: ReactNode; className?: string }) {
  return (
    <a
      href={hrefDoComando(comando)}
      className={className}
      onClick={(evento) => {
        if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;
        evento.preventDefault();
        if (comando.foco === 'apartamento') {
          const unidade = UNIDADES.find((u) => u.id === comando.unidade);
          definirContextoDoApartamento(
            { unidade: unidade ? { id: unidade.id, final: unidade.final, tipologia: unidade.tipologia } : null },
            true,
          );
          return;
        }
        window.dispatchEvent(new CustomEvent<Comando>(EVENTO_DE_COMANDO, { detail: comando }));
      }}
    >
      {children}
    </a>
  );
}
