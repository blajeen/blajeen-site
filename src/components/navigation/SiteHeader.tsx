'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LiveWordmark } from '@/components/brand/LiveWordmark';
import { NavDrawer } from '@/components/navigation/NavDrawer';
import { SiteNav } from '@/components/navigation/SiteNav';
import { ROTAS } from '@/lib/routes';

const ID_GAVETA = 'gaveta-navegacao';

export function SiteHeader() {
  const [rolado, setRolado] = useState(false);
  const [aberto, setAberto] = useState(false);
  const acionador = useRef<HTMLButtonElement>(null);

  const fechar = useCallback(() => setAberto(false), []);

  // Superfície translúcida só depois do primeiro scroll — o header não compete com o hero.
  useEffect(() => {
    const aoRolar = () => setRolado(window.scrollY > 24);
    window.addEventListener('scroll', aoRolar, { passive: true });
    aoRolar();
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  // Voltar/avançar no histórico com a gaveta aberta também precisa fechá-la.
  useEffect(() => {
    window.addEventListener('popstate', fechar);
    return () => window.removeEventListener('popstate', fechar);
  }, [fechar]);

  return (
    <>
      <header
        data-rolado={rolado}
        className="fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-300 data-[rolado=true]:border-line data-[rolado=true]:bg-ink/72 data-[rolado=true]:backdrop-blur-xl"
      >
        {/* Sinal verde-ácido muito discreto na aresta do header. */}
        <span
          aria-hidden="true"
          data-rolado={rolado}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-signal/35 to-transparent opacity-0 transition-opacity duration-500 data-[rolado=true]:opacity-100"
        />

        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-[var(--gutter)] sm:h-[4.5rem]">
          {/*
            O nome acessível do link vem da própria marca (`role="img"`), sem `aria-label` por
            cima: um rótulo diferente do conteúdo visível quebraria o critério "Label in Name".
          */}
          <Link
            href={ROTAS.home}
            className="alvo-toque -ml-1 flex items-center rounded-sm px-1 text-[1.25rem] leading-none sm:text-[1.4rem]"
          >
            <LiveWordmark variante="reduzida" comGosma={false} comQualificador={false} />
            <span aria-hidden="true" className="tecnica ml-3 hidden text-mineral-dim sm:inline">
              LABS
            </span>
          </Link>

          <SiteNav />

          {/*
            A gaveta atende o mobile: cinco destinos mais o submenu de jogos não cabem numa barra
            em 360 px. A partir de 64rem a barra assume e o acionador sai de cena.
          */}
          <button
            ref={acionador}
            type="button"
            onClick={() => setAberto((valor) => !valor)}
            aria-expanded={aberto}
            aria-controls={ID_GAVETA}
            className="alvo-toque tecnica -mr-1 inline-flex items-center gap-2 rounded-full border border-line-strong px-4 text-paper transition-colors duration-150 hover:border-signal/60 hover:text-signal lg:hidden"
          >
            MENU
            <span aria-hidden="true" className="flex flex-col gap-[3px]">
              <span className="block h-px w-3.5 bg-current" />
              <span className="block h-px w-3.5 bg-current" />
            </span>
          </button>
        </div>
      </header>

      <NavDrawer id={ID_GAVETA} aberto={aberto} aoFechar={fechar} acionador={acionador} />
    </>
  );
}
