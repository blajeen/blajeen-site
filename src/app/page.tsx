import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Hero } from '@/components/layout/Hero';
import { Section, TituloSecao } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { ProjectShowcase } from '@/components/projects/ProjectShowcase';
import { experimentos, laboratorio, produtosComerciais, proximo } from '@/content/home';
import { projetos } from '@/content/projects';
import { ROTAS } from '@/lib/routes';

export const revalidate = 3600;

const produtos = [
  {
    id: 'barbearia' as const,
    categoria: 'BARBEARIAS',
    titulo: 'Agendamento sem conta e gestão da operação.',
    texto: 'Site, agenda e rotina da equipe em uma plataforma pronta para receber a marca do negócio.',
    href: ROTAS.barbearia,
    imagem: '/projects/barbearia/screenshots/01-site-institucional.png',
    alt: 'Página inicial da plataforma demonstrativa para barbearias.',
  },
  {
    id: 'personal' as const,
    categoria: 'PERSONAL STUDIO',
    titulo: 'Aluno, personal e gestor conectados.',
    texto: 'Agenda, treinos e acompanhamento em uma experiência adaptável a estúdios e profissionais.',
    href: ROTAS.personalStudio,
    imagem: '/projects/personal-studio/mockup-painel-gestor.png',
    alt: 'Painel de gestão da plataforma Personal Studio.',
  },
  {
    id: 'salao' as const,
    categoria: 'STUDIO BEAUTY',
    titulo: 'Cliente, profissional e gestão conectadas.',
    texto: 'Site, agenda, portfólio e histórico em uma experiência própria para estética e beleza.',
    href: ROTAS.salaoEstetica,
    imagem: '/projects/salao-estetica/hero-home.jpg',
    alt: 'Demonstração da plataforma Studio Beauty para estética e beleza.',
  },
  {
    id: 'ecommerce' as const,
    categoria: 'E-COMMERCE',
    titulo: 'Vitrine, catálogo e operação conectados.',
    texto: 'Busca, carrinho, atendimento e gestão em uma loja pronta para receber outra marca.',
    href: ROTAS.ecommerce,
    imagem: '/projects/ecommerce/social-ecommerce.jpg',
    alt: 'Identidade visual da demonstração E-Commerce.',
  },
] as const;

export default function Home() {
  return (
    <>
      <Hero />

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
          {produtos.map((produto) => (
            <Reveal key={produto.id}>
              <Link
                href={produto.href}
                className="group grid h-full overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised/70 transition-colors duration-200 hover:border-signal/50 sm:grid-cols-[0.95fr_1.05fr]"
              >
                <div className="relative min-h-60 overflow-hidden bg-surface">
                  <Image
                    src={produto.imagem}
                    alt={produto.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                </div>
                <div className="flex flex-col p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <ProductIcon id={produto.id} className="size-9 text-signal" />
                    <span className="tecnica text-mineral-dim">{produto.categoria}</span>
                  </div>
                  <h3 className="mt-9 text-[clamp(1.45rem,2.6vw,2.2rem)] leading-[1.02] tracking-[-0.045em]">
                    {produto.titulo}
                  </h3>
                  <p className="medida-texto mt-4 text-sm leading-relaxed text-mineral">
                    {produto.texto}
                  </p>
                  <span className="tecnica mt-8 inline-flex items-center gap-3 text-paper group-hover:text-signal">
                    Ver produto <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

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
