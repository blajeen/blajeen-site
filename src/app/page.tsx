import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Hero } from '@/components/layout/Hero';
import { Section, TituloSecao } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { ProjectShowcase } from '@/components/projects/ProjectShowcase';
import {
  estado,
  experimentos,
  hipotese,
  instrumentos,
  laboratorio,
  origem,
  proximo,
} from '@/content/home';
import { statusVisivel } from '@/content/estado-do-projeto';
import { projetos } from '@/content/projects';

/*
 * A home se regenera de hora em hora: o estado dos produtos deriva da data de lançamento, e é
 * isso que faz o Revalio virar "disponível" sozinho no dia certo.
 */
export const revalidate = 3600;

export default function Home() {
  // Uma linha por produto, com o estado que vale hoje.
  const estadoDosProjetos = projetos.map(
    (projeto) => `${projeto.nome} — ${statusVisivel(projeto)}`.toUpperCase(),
  );

  return (
    <>
      <Hero />

      {/* 01 / O LABORATÓRIO */}
      <Section
        id={laboratorio.id}
        indice={laboratorio.indice}
        rotuladaPor="laboratorio-titulo"
        className="relative isolate overflow-hidden"
      >
        <LabBackdrop />
        <div className="grid gap-10 lg:grid-cols-12">
          <TituloSecao id="laboratorio-titulo" className="lg:col-span-6">
            {laboratorio.titulo}
          </TituloSecao>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-3">
            {laboratorio.paragrafos.map((paragrafo) => (
              <p
                key={paragrafo}
                className="medida-texto mb-5 text-[1.05rem] leading-relaxed text-mineral last:mb-0"
              >
                {paragrafo}
              </p>
            ))}
          </div>
        </div>

        <p className="regua tecnica mt-12 pb-3 text-mineral-dim sm:mt-16">
          {laboratorio.linhaTecnica}
        </p>
      </Section>

      {/* 02 / EXPERIMENTOS ATIVOS */}
      <Section id={experimentos.id} indice={experimentos.indice} rotuladaPor="experimentos-titulo">
        <TituloSecao id="experimentos-titulo" className="max-w-[22ch]">
          {experimentos.titulo}
        </TituloSecao>

        {/* A direção alterna a cada experimento: cria ritmo e evita fila de cards iguais. */}
        <div className="mt-12 flex flex-col gap-[clamp(3rem,6vw,5.5rem)] sm:mt-16">
          {projetos.map((projeto, posicao) => (
            <ProjectShowcase key={projeto.id} projeto={projeto} invertido={posicao % 2 === 1} />
          ))}
        </div>
      </Section>

      {/* 03 / ESTADO ATUAL */}
      <Section id={estado.id} indice={estado.indice} rotuladaPor="estado-titulo">
        <div className="grid gap-10 lg:grid-cols-12">
          <TituloSecao id="estado-titulo" className="lg:col-span-5">
            {estado.titulo}
          </TituloSecao>

          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line">
              {estadoDosProjetos.map((linha) => (
                <li key={linha} className="flex items-center gap-3 bg-surface px-5 py-5 sm:px-7">
                  <span
                    aria-hidden="true"
                    className="inline-block size-[6px] flex-none rounded-full bg-signal shadow-[0_0_10px_var(--color-signal)]"
                  />
                  <span className="tecnica text-paper">{linha}</span>
                </li>
              ))}
            </ul>

            <p className="medida-texto mt-8 text-[1.05rem] leading-relaxed text-mineral">
              {estado.texto}
            </p>
          </div>
        </div>
      </Section>

      {/* 04 / HIPÓTESE */}
      <Section
        id={hipotese.id}
        indice={hipotese.indice}
        rotuladaPor="hipotese-titulo"
        className="relative isolate overflow-hidden"
      >
        <LabBackdrop lado="esquerda" />
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12">
            <TituloSecao id="hipotese-titulo" className="lg:col-span-6">
              {hipotese.titulo}
            </TituloSecao>
            <div className="lg:col-span-5 lg:col-start-8 lg:pt-3">
              {hipotese.paragrafos.map((paragrafo) => (
                <p key={paragrafo} className="medida-texto text-[1.05rem] leading-relaxed text-mineral">
                  {paragrafo}
                </p>
              ))}
              <p className="mt-10 text-[clamp(1.4rem,3vw,2.4rem)] leading-tight tracking-[-0.045em] text-signal">
                {hipotese.pergunta}
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 05 / ORIGEM + 06 / INSTRUMENTOS */}
      <Section
        id={origem.id}
        indice={origem.indice}
        rotuladaPor="origem-titulo"
        className="relative isolate overflow-hidden"
      >
        <LabBackdrop />
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <TituloSecao id="origem-titulo">{origem.titulo}</TituloSecao>
            {origem.paragrafos.map((paragrafo) => (
              <p
                key={paragrafo}
                className="medida-texto mt-8 text-[1.05rem] leading-relaxed text-mineral"
              >
                {paragrafo}
              </p>
            ))}
          </div>

          <Reveal className="lg:col-span-5 lg:col-start-8">
            <p className="tecnica text-signal">{instrumentos.indice}</p>
            <h3 className="mt-6 text-[clamp(1.5rem,3vw,2.25rem)] leading-tight tracking-[-0.04em]">
              {instrumentos.titulo}
            </h3>
            {instrumentos.paragrafos.map((paragrafo) => (
              <p
                key={paragrafo}
                className="medida-texto mt-6 text-[0.95rem] leading-relaxed text-mineral"
              >
                {paragrafo}
              </p>
            ))}
          </Reveal>
        </div>
      </Section>

      {/* 07 / EM ABERTO */}
      <Section
        id={proximo.id}
        indice={proximo.indice}
        rotuladaPor="proximo-titulo"
        className="pb-[clamp(3rem,6vw,6rem)]"
      >
        <Reveal>
          <TituloSecao id="proximo-titulo" className="max-w-[20ch]">
            {proximo.titulo}
          </TituloSecao>
          {proximo.paragrafos.map((paragrafo) => (
            <p key={paragrafo} className="medida-texto mt-8 text-[1.05rem] leading-relaxed text-mineral">
              {paragrafo}
            </p>
          ))}

          <Link
            href={proximo.cta.href}
            className="alvo-toque tecnica mt-12 inline-flex items-center gap-3 border-b border-signal pb-3 text-paper transition-colors duration-150 hover:text-signal"
          >
            {proximo.cta.rotulo}
            <span aria-hidden="true">↗</span>
          </Link>
        </Reveal>
      </Section>
    </>
  );
}
