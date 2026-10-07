import type { ReactNode } from 'react';

/**
 * Os ícones da demonstração: lineares, traço de 1,6 px num quadro de 20, na cor do texto (a mesma
 * gramática dos ícones do site). Sempre ao lado de um texto ou com nome acessível no botão: o ícone
 * é decorativo.
 */
function Icone({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function IconeNoite() {
  return (
    <Icone>
      <path d="M15.5 12.6A6.5 6.5 0 0 1 7.4 4.5a6.5 6.5 0 1 0 8.1 8.1Z" />
    </Icone>
  );
}

/** O farol aceso: a lente e os fachos. */
export function IconeFarol() {
  return (
    <Icone>
      <path d="M8.5 4.5C5.2 4.5 3 7 3 10s2.2 5.5 5.5 5.5c.8 0 1.5-2.5 1.5-5.5S9.3 4.5 8.5 4.5Z" />
      <path d="M13 6.5h4M13 10h4.5M13 13.5h4" />
    </Icone>
  );
}

/** A volta da mesa giratória. */
export function IconeGirar() {
  return (
    <Icone>
      <path d="M16 10a6 6 0 1 1-1.8-4.3" />
      <path d="M16.2 3.5v3h-3" />
    </Icone>
  );
}

/** Voltar ao enquadramento: a mira no centro do quadro. */
export function IconeCentralizar() {
  return (
    <Icone>
      <path d="M3.5 7V4.5a1 1 0 0 1 1-1H7M13 3.5h2.5a1 1 0 0 1 1 1V7M16.5 13v2.5a1 1 0 0 1-1 1H13M7 16.5H4.5a1 1 0 0 1-1-1V13" />
      <circle cx="10" cy="10" r="2" />
    </Icone>
  );
}

/** Realidade aumentada: o cubo, o símbolo de "ver no seu espaço". */
export function IconeGaragem() {
  return (
    <Icone>
      <path d="M10 3.5 15.5 6.5v7L10 16.5 4.5 13.5v-7L10 3.5Z" />
      <path d="M4.5 6.5 10 9.5l5.5-3M10 9.5v7" />
    </Icone>
  );
}

export function IconeTelaCheia() {
  return (
    <Icone>
      <path d="M3.5 7.5v-4h4M12.5 3.5h4v4M16.5 12.5v4h-4M7.5 16.5h-4v-4" />
    </Icone>
  );
}

export function IconeSairDaTelaCheia() {
  return (
    <Icone>
      <path d="M7.5 3.5v4h-4M16.5 7.5h-4v-4M12.5 16.5v-4h4M3.5 12.5h4v4" />
    </Icone>
  );
}

/** Sair do carro: a seta para trás. */
export function IconeVoltar() {
  return (
    <Icone>
      <path d="M16 10H4.5M9 5.5 4.5 10 9 14.5" />
    </Icone>
  );
}

/** Entrar no carro: a seta para a frente. */
export function IconeEntrar() {
  return (
    <Icone>
      <path d="M4 10h11.5M11 5.5l4.5 4.5-4.5 4.5" />
    </Icone>
  );
}
