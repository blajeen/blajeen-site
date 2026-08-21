import Image from 'next/image';
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
        <div className={`relative overflow-hidden bg-surface ${destaque ? 'min-h-72 lg:min-h-[30rem]' : 'min-h-52 sm:aspect-[16/7] sm:min-h-0'}`}>
          <Image
            src={trabalho.capa}
            alt={trabalho.capaAlt}
            fill
            sizes={destaque ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 45vw, 100vw'}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        </div>
        <div className="flex flex-col p-7 sm:p-9">
          <p className="tecnica text-signal">{trabalho.categoria}</p>
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

