'use client';

import { useState } from 'react';
import { SystemScreenshot } from '@/components/media/SystemScreenshot';

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
    <div className="mx-auto mt-12 max-w-[1280px] sm:mt-16">
      <figure className="overflow-hidden rounded-[var(--radius-panel)] border border-line-strong bg-raised shadow-[var(--shadow-panel)]">
        <div className="bg-[#0b0d0a] p-2 sm:p-4">
          <SystemScreenshot
            key={slide.imagem}
            src={slide.imagem}
            alt={slide.alt}
            sizes="(min-width: 1280px) 1248px, 96vw"
            largura={slide.largura}
            altura={slide.altura}
            label={`TELA ${String(atual + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`}
            className="rounded-[clamp(0.65rem,1.4vw,1rem)]"
          />
        </div>
        <figcaption className="border-t border-line px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <p className="medida-texto min-h-11 max-w-[78ch] text-sm leading-relaxed text-mineral" aria-live="polite">
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
          <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label="Selecionar tela do produto">
            {slides.map((item, indice) => (
              <button
                key={item.imagem}
                type="button"
                onClick={() => setAtual(indice)}
                aria-label={`Ver tela ${indice + 1}: ${item.legenda}`}
                aria-current={indice === atual ? 'true' : undefined}
                className="tecnica h-8 rounded-lg border border-line bg-surface text-[10px] text-mineral transition-colors duration-150 hover:border-signal hover:text-paper aria-[current=true]:border-signal aria-[current=true]:bg-signal aria-[current=true]:text-ink"
              >
                {String(indice + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
