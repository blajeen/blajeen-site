'use client';

import { useRef, type KeyboardEvent } from 'react';
import styles from './Carrelio.module.css';

/** Um número pequeno ao lado do nome da aba (os pedidos novos), com a frase que o leitor de tela lê. */
export type SeloDaAba = { texto: string; rotulo: string };

type Props<T extends string> = {
  rotulo: string;
  abas: readonly { id: T; rotulo: string; selo?: SeloDaAba | null }[];
  ativa: T;
  aoMudar(id: T): void;
  /** Prefixo dos ids: `${base}-aba-${id}` e `${base}-painel-${id}`. */
  base: string;
};

/** Abas do APG com ativação automática (como as do Torrelio): setas, Home e End; só a aba atual entra no Tab. */
export function Abas<T extends string>({ rotulo, abas, ativa, aoMudar, base }: Props<T>) {
  const lista = useRef<HTMLDivElement>(null);
  function teclar(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const ultimo = abas.length - 1;
    const destino =
      evento.key === 'ArrowRight' ? (indice === ultimo ? 0 : indice + 1)
        : evento.key === 'ArrowLeft' ? (indice === 0 ? ultimo : indice - 1)
          : evento.key === 'Home' ? 0
            : evento.key === 'End' ? ultimo
              : null;
    if (destino === null) return;
    evento.preventDefault();
    const aba = abas[destino]!;
    aoMudar(aba.id);
    lista.current?.querySelector<HTMLButtonElement>(`#${base}-aba-${aba.id}`)?.focus();
  }
  return (
    <div ref={lista} role="tablist" aria-label={rotulo} className={styles.abas}>
      {abas.map((aba, indice) => (
        <button
          key={aba.id}
          id={`${base}-aba-${aba.id}`}
          type="button"
          role="tab"
          aria-selected={aba.id === ativa}
          aria-controls={`${base}-painel-${aba.id}`}
          tabIndex={aba.id === ativa ? 0 : -1}
          onClick={() => aoMudar(aba.id)}
          onKeyDown={(evento) => teclar(evento, indice)}
        >
          {aba.rotulo}
          {aba.selo ? (
            <>
              <span className={styles.seloDaAba} aria-hidden="true">
                {aba.selo.texto}
              </span>
              <span className="sr-only">{`, ${aba.selo.rotulo}`}</span>
            </>
          ) : null}
        </button>
      ))}
    </div>
  );
}
