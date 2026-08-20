'use client';

import Image from 'next/image';
import { useState } from 'react';

type Slide = {
  readonly imagem: string;
  readonly alt: string;
  readonly legenda: string;
  readonly largura: number;
  readonly altura: number;
};

export function ProductGallery({ slides }: { slides: readonly Slide[] }) {
  const [atual, setAtual] = useState(0);
  const slide = slides[atual]!;

  const anterior = () => setAtual((indice) => (indice - 1 + slides.length) % slides.length);
  const proximo = () => setAtual((indice) => (indice + 1) % slides.length);

  return (
    <div className="mt-12 sm:mt-16">
      <figure className="overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised">
        <Image
          key={slide.imagem}
          src={slide.imagem}
          alt={slide.alt}
          width={slide.largura}
          height={slide.altura}
          sizes="(min-width: 1024px) 78vw, 100vw"
          className="h-auto w-full"
        />
        <figcaption className="flex flex-wrap items-center justify-between gap-5 border-t border-line px-5 py-4 sm:px-6">
          <p className="medida-texto text-sm leading-relaxed text-mineral" aria-live="polite">
            <span className="tecnica mr-3 text-signal">{String(atual + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
            {slide.legenda}
          </p>
          <div className="flex gap-2" aria-label="Navegar pelas telas do produto">
            <button
              type="button"
              onClick={anterior}
              className="alvo-toque inline-flex items-center justify-center rounded-full border border-line-strong px-4 text-lg text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
              aria-label="Ver tela anterior"
            >
              ←
            </button>
            <button
              type="button"
              onClick={proximo}
              className="alvo-toque inline-flex items-center justify-center rounded-full border border-line-strong px-4 text-lg text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
              aria-label="Ver próxima tela"
            >
              →
            </button>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
