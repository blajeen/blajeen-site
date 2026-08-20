'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useMotion } from '@/components/motion/MotionProvider';
import { hero } from '@/content/home';

/**
 * Abertura da home.
 *
 * Compacta de propósito: ela divide a tela com a barra de abas, então ocupa apenas o alto da
 * dobra. A logo viva é obrigatória aqui e aparece mesmo sem JavaScript — wordmark, olhos e gosma
 * vêm no HTML, e o script só acrescenta piscada e acompanhamento do ponteiro.
 */
export function Hero() {
  const { ativo } = useMotion();
  const bloco = useRef<HTMLDivElement>(null);

  // Halo ambiental discreto. Só em ponteiro fino, com movimento ligado.
  useEffect(() => {
    const no = bloco.current;
    if (!no || !ativo) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const aoMover = (evento: PointerEvent) => {
      const caixa = no.getBoundingClientRect();
      no.style.setProperty('--halo-x', `${evento.clientX - caixa.left}px`);
      no.style.setProperty('--halo-y', `${evento.clientY - caixa.top}px`);
    };

    window.addEventListener('pointermove', aoMover, { passive: true });
    return () => window.removeEventListener('pointermove', aoMover);
  }, [ativo]);

  return (
    <section
      ref={bloco}
      aria-labelledby="hero-titulo"
      className="relative isolate flex min-h-[max(30rem,74svh)] flex-col justify-center overflow-hidden border-b border-line px-[var(--gutter)] py-12 sm:py-16"
      style={{ ['--halo-x' as string]: '50%', ['--halo-y' as string]: '40%' }}
    >
      {/*
        A cena do laboratório é o fundo do hero — é o lugar de onde os projetos saem, então ela
        fica atrás da marca em vez de virar uma faixa solta no meio da página.

        Decorativa: `alt` vazio. Entra com prioridade porque divide o alto da dobra com a logo, e
        vem coberta por um véu escuro que garante o contraste do texto por cima.
      */}
      <Image
        src="/brand/banner-lab.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none -z-10 object-cover object-center opacity-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background:linear-gradient(180deg,color-mix(in_srgb,var(--color-ink)_72%,transparent)_0%,color-mix(in_srgb,var(--color-ink)_58%,transparent)_45%,var(--color-ink)_100%)]"
      />

      {/* Grade técnica e halo: decorativos, marcados como tal. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:100%_25%,12.5%_100%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(circle_at_var(--halo-x)_var(--halo-y),rgba(201,255,61,0.07),transparent_24%)]"
      />

      <div className="mx-auto w-full max-w-[1440px]">
        <p className="tecnica text-mineral-dim">{hero.eyebrow}</p>

        {/* A logo renderizada é o LCP da home: entra com prioridade e sem carregamento preguiçoso. */}
        <div className="mx-auto mt-8 w-full max-w-[min(48rem,90%)] sm:mt-10">
          <BrandLogo prioridade sizes="(min-width: 64rem) 768px, 90vw" />
        </div>

        <div className="mt-10 grid gap-8 sm:mt-14 lg:grid-cols-12 lg:items-end">
          <h1
            id="hero-titulo"
            className="text-balance text-[clamp(1.85rem,3.9vw,3rem)] leading-[1.02] tracking-[-0.05em] lg:col-span-7"
          >
            {hero.titulo[0]}
            <br />
            {hero.titulo[1]}
          </h1>

          <div className="lg:col-span-5">
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral">{hero.texto}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* Âncora nativa: o destino é a própria página, e o salto para a seção é do navegador. */}
              <a
                href={hero.cta.href}
                className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
              >
                {hero.cta.rotulo}
                <span aria-hidden="true">↓</span>
              </a>

              <p className="tecnica flex items-center gap-2 text-mineral-dim">
                <span
                  aria-hidden="true"
                  className="inline-block size-[5px] rounded-full bg-signal shadow-[0_0_9px_var(--color-signal)]"
                />
                {hero.estado}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
