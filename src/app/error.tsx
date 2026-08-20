'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Container } from '@/components/layout/Section';
import { erro } from '@/content/pages';
import { ROTAS } from '@/lib/routes';

/**
 * Erro de renderização.
 *
 * Não há serviço de telemetria: o relato fica no console do navegador, como qualquer erro de
 * aplicação. Adicionar coleta aqui exigiria atualizar a política de privacidade antes.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <article className="flex min-h-[70svh] items-center py-[clamp(4rem,10vw,9rem)]">
      <Container>
        <p className="tecnica flex items-center gap-3 text-signal">
          <span aria-hidden="true" className="inline-block size-[5px] rounded-full bg-signal" />
          {erro.eyebrow} / {erro.codigo}
        </p>

        <h1 className="mt-8 max-w-[16ch] text-[clamp(2.2rem,6.5vw,4.5rem)] leading-[1] tracking-[-0.05em]">
          {erro.titulo}
        </h1>

        <p className="medida-texto mt-6 text-[1.05rem] leading-relaxed text-mineral">{erro.texto}</p>

        <div className="mt-12 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full bg-signal px-5 text-ink transition-opacity duration-150 hover:opacity-88"
          >
            Tentar novamente
          </button>
          <Link
            href={ROTAS.home}
            className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
          >
            Voltar ao início
          </Link>
        </div>
      </Container>
    </article>
  );
}
