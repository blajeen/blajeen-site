import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { InterestForm } from '@/components/contact/InterestForm';
import { Container } from '@/components/layout/Section';
import { contato } from '@/content/pages';
import { site } from '@/content/site';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';
import { InstagramIcon } from '@/components/brand/InstagramIcon';

export const metadata: Metadata = metadadosDaRota({
  titulo: contato.metaTitulo,
  descricao: contato.metaDescricao,
  rota: ROTAS.contato,
});



/*
 * Sem arte de fundo nesta página: medida em 4,21:1, abaixo do AA. Ela é curta e de coluna larga,
 * sem o espaço vazio onde a ilustração caberia longe do texto.
 */
export default function Page() {
  return (
    <article className="pb-[clamp(4rem,10vw,10rem)] pt-[clamp(3rem,7vw,6rem)]">
      <Container>
        <p className="tecnica text-signal">{contato.eyebrow}</p>

        <h1 className="mt-8 max-w-[14ch] text-[clamp(2.4rem,7vw,5rem)] leading-[0.98] tracking-[-0.05em]">
          {contato.titulo}
        </h1>

        <p className="medida-texto mt-8 text-[1.1rem] leading-relaxed text-mineral">
          {contato.introducao}
        </p>

        <Suspense
          fallback={
            <div className="mt-14 min-h-96 rounded-[var(--radius-panel)] border border-line-strong bg-raised/70" />
          }
        >
          <InterestForm />
        </Suspense>

        <div className="mt-10 grid overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {site.emailEstudio.definido ? (
            <a
              href={`mailto:${site.emailEstudio.valor}?subject=${encodeURIComponent('Contato — Blajeen Labs')}`}
              className="flex min-h-28 flex-col justify-between bg-surface p-5 transition-colors duration-150 hover:bg-raised"
            >
              <span className="tecnica text-mineral-dim">E-MAIL DIRETO</span>
              <span className="text-sm text-paper">{site.emailEstudio.valor}</span>
            </a>
          ) : null}
          {contato.atalhos.map((atalho) => (
            <Link
              key={atalho.href}
              href={atalho.href}
              className="flex min-h-28 flex-col justify-between bg-surface p-5 transition-colors duration-150 hover:bg-raised"
            >
              <span className="tecnica text-mineral-dim">{atalho.rotulo}</span>
              <span className="text-sm leading-snug text-paper">{atalho.descricao} →</span>
            </Link>
          ))}
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-28 flex-col justify-between bg-surface p-5 transition-colors duration-150 hover:bg-raised"
          >
            <span className="tecnica flex items-center gap-2 text-mineral-dim"><InstagramIcon className="size-4" /> SOCIAL</span>
            <span className="text-sm leading-snug text-paper">Acompanhe o que está saindo do laboratório. ↗</span>
          </a>
        </div>

        <ul className="mt-8">
          {contato.observacoes.map((observacao) => (
            <li key={observacao} className="flex gap-3 text-sm leading-relaxed text-mineral">
              <span aria-hidden="true" className="mt-[0.6em] size-1 flex-none rounded-full bg-steel" />
              <span className="medida-texto">{observacao}</span>
            </li>
          ))}
        </ul>
      </Container>
    </article>
  );
}
