import { ScreenshotFrame } from '@/components/projects/ScreenshotFrame';
import Link from 'next/link';
import type { Trabalho } from '@/content/portfolio';

export function WorkCard({ trabalho, destaque = false }: { trabalho: Trabalho; destaque?: boolean }) {
  return (
    <article className={destaque ? 'lg:col-span-2' : ''}>
      <Link
        href={trabalho.href}
        className={`group grid h-full overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised/70 transition-colors duration-200 hover:border-signal/45 ${
          destaque ? 'lg:grid-cols-[1.2fr_0.8fr]' : ''
        }`}
      >
        <div className={trabalho.painel ? 'grid grid-cols-2 gap-2 bg-surface p-3' : ''}>
          <ScreenshotFrame src={trabalho.capa} alt={trabalho.capaAlt} label={trabalho.painel ? 'Site público' : trabalho.cliente} />
          {trabalho.painel?.imagens[0] ? <ScreenshotFrame src={trabalho.painel.imagens[0].src} alt={trabalho.painel.imagens[0].alt} label={trabalho.painel.demonstracao ? "Painel · demonstrativo" : "Painel de gestão"} /> : null}
        </div>
        <div className="flex flex-col p-7 sm:p-9">
          <p className="tecnica text-signal">{trabalho.categoria}</p>
          {trabalho.fase ? <p className="tecnica mt-3 text-mineral-dim">{trabalho.fase}</p> : null}
          {trabalho.painel ? <p className="tecnica mt-3 text-signal">{trabalho.painel.demonstracao ? "SITE + PROPOSTA DO PAINEL" : "SITE + PAINEL · VER AS DUAS EXPERIÊNCIAS"}</p> : null}
          <h3 className="mt-5 text-[clamp(2rem,4vw,3.5rem)] leading-[0.98] tracking-[-0.05em]">
            {trabalho.cliente}
          </h3>
          <p className="medida-texto mt-5 text-[0.98rem] leading-relaxed text-mineral">{trabalho.resumo}</p>
          <span className="tecnica mt-auto inline-flex items-center gap-3 pt-10 text-paper transition-colors group-hover:text-signal">
            Ver trabalho <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

