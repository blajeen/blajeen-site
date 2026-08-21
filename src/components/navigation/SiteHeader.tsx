'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { MobileSideNav } from '@/components/navigation/MobileSideNav';
import { SiteNav } from '@/components/navigation/SiteNav';
import { ROTAS } from '@/lib/routes';

export function SiteHeader() {
  const [rolado, setRolado] = useState(false);

  // Superfície translúcida só depois do primeiro scroll — o header não compete com o hero.
  useEffect(() => {
    const aoRolar = () => setRolado(window.scrollY > 24);
    window.addEventListener('scroll', aoRolar, { passive: true });
    aoRolar();
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

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

        <div className="mx-auto flex h-16 max-w-[var(--layout-max)] items-center justify-between gap-4 px-[var(--gutter)] sm:h-[4.5rem]">
          {/*
            O nome acessível do link vem da própria marca (`role="img"`), sem `aria-label` por
            cima: um rótulo diferente do conteúdo visível quebraria o critério "Label in Name".
          */}
          <Link
            href={ROTAS.home}
            aria-label="Início — Blajeen Labs"
            className="alvo-toque group -ml-1 flex items-center rounded-full px-1"
          >
            <Image
              src="/brand/blajeen-crest-header.webp"
              alt=""
              width={320}
              height={320}
              priority
              sizes="56px"
              className="size-12 rounded-full object-cover drop-shadow-[0_0_8px_rgba(201,255,61,0.16)] transition-[filter,transform] duration-200 group-hover:scale-[1.04] group-hover:drop-shadow-[0_0_12px_rgba(201,255,61,0.42)] sm:size-14"
            />
          </Link>

          <SiteNav />
          <span className="tecnica text-mineral xl:hidden">BLAJEEN LABS</span>
        </div>
      </header>
      <MobileSideNav />
    </>
  );
}
