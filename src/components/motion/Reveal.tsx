'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Atraso em ms para escalonar blocos vizinhos. Mantido curto de propósito. */
  atraso?: number;
};

/**
 * Revelação por scroll.
 *
 * Puramente decorativa e sem estado de React: o efeito escreve direto no `dataset` do nó, que é
 * o sistema externo aqui. O conteúdo já está no HTML e permanece legível se o JavaScript falhar,
 * porque o estado escondido só é aplicado depois que o observador é instalado.
 */
export function Reveal({ children, className, atraso = 0 }: Props) {
  const referencia = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const no = referencia.current;
    if (!no) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      no.dataset['visivel'] = 'true';
      return;
    }

    no.dataset['pronto'] = 'true';

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada?.isIntersecting) {
          no.dataset['visivel'] = 'true';
          observador.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observador.observe(no);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={referencia}
      data-pronto="false"
      data-visivel="false"
      style={atraso ? { transitionDelay: `${atraso}ms` } : undefined}
      className={[
        'transition-[opacity,transform] duration-700 ease-[var(--ease-lab)]',
        'data-[pronto=true]:data-[visivel=false]:translate-y-6 data-[pronto=true]:data-[visivel=false]:opacity-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
