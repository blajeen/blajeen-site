import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import type { Trabalho } from '@/content/portfolio';
import { ROTAS } from '@/lib/routes';

export function WorkDetail({ trabalho }: { trabalho: Trabalho }) {
  return (
    <article>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <Link href={ROTAS.trabalhos} className="tecnica inline-flex items-center gap-3 text-mineral transition-colors hover:text-signal">
            <span aria-hidden="true">←</span> TODOS OS TRABALHOS
          </Link>
          <p className="tecnica mt-12 text-signal">{trabalho.categoria}</p>
          <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="max-w-[12ch] text-[clamp(3rem,8vw,7.5rem)] leading-[0.9] tracking-[-0.06em] lg:col-span-8">
              {trabalho.cliente}
            </h1>
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral lg:col-span-4 lg:pb-2">
              {trabalho.resumo}
            </p>
          </div>
          <div className="media-pattern relative mt-12 aspect-[32/15] min-h-72 overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised">
            <Image src={trabalho.capa} alt={trabalho.capaAlt} fill priority sizes="100vw" quality={95} className="object-contain object-top" />
          </div>
        </Container>
      </header>

      <Section indice="01 / CONTEXTO" rotuladaPor="contexto-titulo">
        <div className="grid gap-10 lg:grid-cols-12">
          <TituloSecao id="contexto-titulo" className="lg:col-span-5">Uma necessidade real antes de qualquer tela.</TituloSecao>
          <div className="grid gap-8 lg:col-span-6 lg:col-start-7 sm:grid-cols-2">
            <div>
              <p className="tecnica text-mineral-dim">DESAFIO</p>
              <p className="mt-4 text-[1rem] leading-relaxed text-mineral">{trabalho.desafio}</p>
            </div>
            <div>
              <p className="tecnica text-mineral-dim">SOLUÇÃO</p>
              <p className="mt-4 text-[1rem] leading-relaxed text-mineral">{trabalho.solucao}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section indice="02 / O QUE FOI CONSTRUÍDO" rotuladaPor="entrega-titulo">
        <div className="grid gap-10 lg:grid-cols-12">
          <TituloSecao id="entrega-titulo" className="lg:col-span-5">Produto, operação e marca no mesmo sistema.</TituloSecao>
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {trabalho.contribuicoes.map((item, indice) => (
              <li key={item} className="flex min-h-28 gap-4 bg-surface p-5">
                <span className="tecnica text-signal">{String(indice + 1).padStart(2, '0')}</span>
                <span className="text-sm leading-relaxed text-paper">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section indice="03 / MATERIAL REAL" rotulo={`Imagens do projeto ${trabalho.cliente}`}>
        <div className={`grid gap-4 ${trabalho.imagens.length === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {trabalho.imagens.map((imagem) => (
            <figure
              key={imagem.src}
              className={`media-pattern relative overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised ${
                trabalho.imagens.length === 3 ? 'aspect-square' : 'aspect-[4/5]'
              }`}
            >
              <Image src={imagem.src} alt={imagem.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" quality={95} className="object-cover" />
            </figure>
          ))}
        </div>
      </Section>

      <Section indice="04 / PRÓXIMO PASSO" className="pb-[clamp(4rem,9vw,9rem)]" rotuladaPor="proximo-trabalho-titulo">
        <div className="grid gap-8 rounded-[var(--radius-panel)] border border-line-strong bg-raised/75 p-7 sm:p-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="tecnica text-signal">SEU PROJETO PODE SER O PRÓXIMO</p>
            <TituloSecao id="proximo-trabalho-titulo" className="mt-5">Quer construir uma experiência com a sua identidade?</TituloSecao>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Link href={ROTAS.crieSeuProjeto} className="alvo-toque tecnica inline-flex items-center rounded-full bg-signal px-5 text-ink hover:bg-glow">
              CRIAR MEU PROJETO →
            </Link>
            <a href={trabalho.site} target="_blank" rel="noreferrer" className="alvo-toque tecnica inline-flex items-center rounded-full border border-line-strong px-5 text-paper hover:border-signal hover:text-signal">
              {trabalho.siteRotulo} ↗
            </a>
          </div>
        </div>
      </Section>
    </article>
  );
}

