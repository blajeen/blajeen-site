import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { AppliedEngineeringIcon } from '@/components/brand/AppliedEngineeringIcon';
import { Hero } from '@/components/layout/Hero';
import { Section, TituloSecao } from '@/components/layout/Section';
import { SaasCard } from '@/components/projects/SaasCard';
import { saas, avisoDemonstracao } from '@/content/saas';
import { Reveal } from '@/components/motion/Reveal';
import { ProjectShowcase } from '@/components/projects/ProjectShowcase';
import { WorkCard } from '@/components/portfolio/WorkCard';
import { experimentos, laboratorio, produtosComerciais, proximo, servicoPrincipal, trabalhosHome } from '@/content/home';
import { trabalhos } from '@/content/portfolio';
import { projetos } from '@/content/projects';

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />

      <Section
        id={servicoPrincipal.id}
        indice={servicoPrincipal.indice}
        rotuladaPor="servico-principal-titulo"
        className="relative isolate overflow-hidden"
      >
        <LabBackdrop lado="esquerda" />
        <div className="grid gap-10 rounded-[var(--radius-panel)] border border-[#55bfff]/25 bg-raised/65 p-7 sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="tecnica text-[#8bddff]">{servicoPrincipal.eyebrow}</p>
            <TituloSecao id="servico-principal-titulo" className="mt-6 max-w-[15ch] text-[clamp(2.4rem,5vw,4.8rem)]">
              {servicoPrincipal.titulo}
            </TituloSecao>
            <p className="medida-texto mt-6 text-[1.02rem] leading-relaxed text-mineral">{servicoPrincipal.texto}</p>
            <Link href={servicoPrincipal.cta.href} className="alvo-toque tecnica mt-8 inline-flex items-center gap-3 rounded-full bg-[#55bfff] px-5 text-ink transition-colors hover:bg-[#8bddff]">
              {servicoPrincipal.cta.rotulo} <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="flex justify-center lg:col-span-4 lg:col-start-9 lg:justify-end">
            <AppliedEngineeringIcon className="!w-[clamp(10rem,20vw,16rem)]" />
          </div>
        </div>
      </Section>

      <Section id={trabalhosHome.id} indice={trabalhosHome.indice} rotuladaPor="trabalhos-home-titulo">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <TituloSecao id="trabalhos-home-titulo" className="max-w-[20ch] lg:col-span-8">{trabalhosHome.titulo}</TituloSecao>
          <p className="medida-texto text-[1rem] leading-relaxed text-mineral lg:col-span-3 lg:col-start-10">{trabalhosHome.texto}</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {trabalhos.map((trabalho) => <WorkCard key={trabalho.id} trabalho={trabalho} />)}
        </div>
        <Link href={trabalhosHome.cta.href} className="alvo-toque tecnica mt-10 inline-flex items-center gap-3 border-b border-signal pb-2 text-paper transition-colors hover:text-signal">
          {trabalhosHome.cta.rotulo} <span aria-hidden="true">→</span>
        </Link>
      </Section>

      <Section
        id={laboratorio.id}
        indice={laboratorio.indice}
        rotuladaPor="laboratorio-titulo"
        className="relative isolate overflow-hidden"
      >
        <LabBackdrop />
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
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

      <Section id={experimentos.id} indice={experimentos.indice} rotuladaPor="jogos-titulo">
        <TituloSecao id="jogos-titulo" className="max-w-[22ch]">
          {experimentos.titulo}
        </TituloSecao>
        <div className="mt-12 flex flex-col gap-[clamp(3rem,6vw,5.5rem)] sm:mt-16">
          {projetos.map((projeto, posicao) => (
            <ProjectShowcase key={projeto.id} projeto={projeto} invertido={posicao % 2 === 1} />
          ))}
        </div>
      </Section>

      <Section
        id={produtosComerciais.id}
        indice={produtosComerciais.indice}
        rotuladaPor="produtos-titulo"
        className="relative isolate overflow-hidden"
      >
        <LabBackdrop lado="esquerda" />
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <TituloSecao id="produtos-titulo" className="lg:col-span-7">
            {produtosComerciais.titulo}
          </TituloSecao>
          <p className="medida-texto text-[1rem] leading-relaxed text-mineral lg:col-span-4 lg:col-start-9">
            {produtosComerciais.texto}
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {saas.map((produto) => <SaasCard key={produto.id} produto={produto} />)}
        </div>

        <p className="mt-6 max-w-[100ch] text-xs leading-relaxed text-mineral-dim">{avisoDemonstracao}</p>
        <Link
          href={produtosComerciais.cta.href}
          className="alvo-toque tecnica mt-10 inline-flex items-center gap-3 border-b border-signal pb-2 text-paper transition-colors duration-150 hover:text-signal"
        >
          {produtosComerciais.cta.rotulo}
          <span aria-hidden="true">→</span>
        </Link>
      </Section>

      <Section
        id={proximo.id}
        indice={proximo.indice}
        rotuladaPor="proximo-titulo"
        className="pb-[clamp(4rem,9vw,9rem)]"
      >
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <TituloSecao id="proximo-titulo" className="lg:col-span-7">
              {proximo.titulo}
            </TituloSecao>
            <div className="lg:col-span-4 lg:col-start-9">
              {proximo.paragrafos.map((paragrafo) => (
                <p key={paragrafo} className="medida-texto text-[1rem] leading-relaxed text-mineral">
                  {paragrafo}
                </p>
              ))}
              <Link
                href={proximo.cta.href}
                className="alvo-toque tecnica mt-8 inline-flex items-center gap-3 border-b border-signal pb-2 text-paper transition-colors duration-150 hover:text-signal"
              >
                {proximo.cta.rotulo}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
