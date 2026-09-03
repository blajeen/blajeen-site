import Image from 'next/image';
import Link from 'next/link';
import type { SaasProduct } from '@/content/saas';
import { ProductIcon } from './ProductIcon';

export function SaasStatus() {
  return <span className="inline-flex items-center gap-2 text-xs font-medium text-signal"><span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-signal" />Ativo · Disponível</span>;
}

export function SaasCard({ produto, nivel = 3 }: { produto: SaasProduct; nivel?: 2 | 3 }) {
  const Heading = nivel === 2 ? 'h2' : 'h3';
  return (
    <article id={produto.id} className="flex h-full min-w-0 scroll-mt-28 flex-col overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised/80">
      <Link href={produto.rota} aria-label={`Conhecer ${produto.nome}`} className="group block border-b border-line bg-surface p-3 sm:p-4">
        <div className="media-pattern relative aspect-[8/5] overflow-hidden rounded-[var(--radius-control)] border border-line bg-[#f4f4f0]">
          <Image src={produto.imagens[0].src} alt={produto.imagens[0].descricao} fill
            sizes="(min-width: 1800px) 820px, (min-width: 1024px) 46vw, calc(100vw - 7rem)"
            quality={95}
            className="object-contain transition-opacity group-hover:opacity-90" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ProductIcon id={produto.icone} className="size-9 shrink-0 text-signal" />
          <SaasStatus />
        </div>
        <p className="tecnica mt-5 text-[10px] text-mineral">{produto.segmento}</p>
        <Heading className="mt-2 text-[clamp(1.85rem,3vw,2.6rem)] leading-tight tracking-[-0.04em]">
          <Link href={produto.rota} className="transition-colors hover:text-signal">{produto.nome}</Link>
        </Heading>
        <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-mineral">{produto.resumo}</p>
        <div className="mt-auto pt-6">
          <Link href={produto.rota} className="alvo-toque inline-flex items-center gap-3 text-sm font-medium text-paper transition-colors hover:text-signal">Conhecer {produto.nome} <span aria-hidden="true">→</span></Link>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-3 text-xs text-mineral">
            <a href={produto.site} target="_blank" rel="noopener noreferrer" aria-label={`Acessar ${produto.nome} (nova aba)`} className="alvo-toque inline-flex items-center hover:text-signal">Acessar SaaS ↗</a>
            <a href={produto.demo} target="_blank" rel="noopener noreferrer" aria-label={`Abrir demonstração de ${produto.nome} (nova aba)`} className="alvo-toque inline-flex items-center hover:text-signal">Testar demonstração ↗</a>
          </div>
        </div>
      </div>
    </article>
  );
}
