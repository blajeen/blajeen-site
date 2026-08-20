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
    <div className="mx-auto mt-12 max-w-[1180px] sm:mt-16">
      <figure className="overflow-hidden rounded-[var(--radius-panel)] border border-line-strong bg-raised shadow-[var(--shadow-panel)]">
        <div className="grid h-[min(56vh,34rem)] min-h-[18rem] place-items-center bg-[#0b0d0a] p-4 sm:min-h-[22rem] sm:p-7">
          <div className="relative size-full overflow-hidden rounded-[clamp(0.75rem,2vw,1.25rem)]">
            <Image
              key={slide.imagem}
              src={slide.imagem}
              alt={slide.alt}
              fill
              sizes="(min-width: 1024px) 900px, 92vw"
              className="object-contain"
            />
          </div>
        </div>
        <figcaption className="border-t border-line px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <p className="medida-texto text-sm leading-relaxed text-mineral" aria-live="polite">
              <span className="tecnica mr-3 text-signal">
                {String(atual + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
              {slide.legenda}
            </p>
            <div className="flex gap-2" aria-label="Navegar pelas telas do produto">
              <button
                type="button"
                onClick={anterior}
                className="alvo-toque inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-lg text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
                aria-label="Ver tela anterior"
              >
                ←
              </button>
              <button
                type="button"
                onClick={proximo}
                className="alvo-toque inline-flex size-11 items-center justify-center rounded-full border border-line-strong text-lg text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
                aria-label="Ver próxima tela"
              >
                →
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-2" aria-label="Selecionar tela do produto">
            {slides.map((item, indice) => (
              <button
                key={item.imagem}
                type="button"
                onClick={() => setAtual(indice)}
                aria-label={`Ver tela ${indice + 1}: ${item.legenda}`}
                aria-current={indice === atual ? 'true' : undefined}
                className="h-1.5 flex-1 rounded-full bg-line-strong transition-colors duration-150 hover:bg-mineral-dim aria-[current=true]:bg-signal"
              />
            ))}
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
