import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { InterestForm } from '@/components/contact/InterestForm';
import { Container } from '@/components/layout/Section';
import { contato } from '@/content/pages';
import { site } from '@/content/site';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

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

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="tecnica text-mineral-dim">Estúdio</h2>

            {site.emailEstudio.definido ? (
              <p className="mt-5">
                <a
                  href={`mailto:${site.emailEstudio.valor}?subject=${encodeURIComponent('Contato — Blajeen Labs')}`}
                  className="alvo-toque inline-flex items-center border-b border-signal pb-2 text-[clamp(1.25rem,3vw,2rem)] tracking-[-0.03em] text-paper transition-colors duration-150 hover:text-signal"
                >
                  {site.emailEstudio.valor}
                </a>
              </p>
            ) : null}

            <p className="medida-texto mt-5 text-sm leading-relaxed text-mineral">
              Para o laboratório em si: parcerias, imprensa e qualquer assunto que não seja de um
              produto específico.
            </p>

            <div className="mt-12 rounded-[var(--radius-panel)] border border-line bg-surface/60 px-5 py-6 sm:px-7">
              <h2 className="text-[1.15rem] tracking-[-0.02em] text-paper">{contato.desvio.titulo}</h2>
              <p className="medida-texto mt-2 text-sm leading-relaxed text-mineral">
                {contato.desvio.texto}
              </p>
              <Link
                href={contato.desvio.href}
                className="alvo-toque tecnica mt-4 inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
              >
                {contato.desvio.rotulo}
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <ul className="mt-10 flex flex-col gap-3">
              {contato.observacoes.map((observacao) => (
                <li key={observacao} className="flex gap-3 text-sm leading-relaxed text-mineral">
                  <span aria-hidden="true" className="mt-[0.6em] size-1 flex-none rounded-full bg-steel" />
                  <span className="medida-texto">{observacao}</span>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Atalhos" className="lg:col-span-4 lg:col-start-9">
            <h2 className="tecnica text-mineral-dim">Talvez você procure</h2>
            <ul className="mt-4 flex flex-col">
              {contato.atalhos.map((atalho) => (
                <li key={atalho.href}>
                  <Link
                    href={atalho.href}
                    className="flex flex-col border-b border-line py-4 transition-colors duration-150 hover:border-signal/40"
                  >
                    <span className="text-[1.05rem] text-paper">{atalho.rotulo}</span>
                    <span className="mt-1 text-sm leading-snug text-mineral">{atalho.descricao}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </article>
  );
}
