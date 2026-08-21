import type { Metadata } from 'next';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { WorkCard } from '@/components/portfolio/WorkCard';
import { trabalhos } from '@/content/portfolio';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Trabalhos — Blajeen Labs',
  descricao: 'Projetos digitais que a Blajeen Labs criou para clientes e colocou no mundo real.',
  rota: ROTAS.trabalhos,
});

export default function TrabalhosPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">TRABALHOS PARA CLIENTES / PRODUTOS REAIS</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="max-w-[13ch] text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em] lg:col-span-8">
              Projetos que saíram da bancada e chegaram ao mundo real.
            </h1>
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral lg:col-span-3 lg:col-start-10 lg:pb-2">
              Estratégia, identidade, experiência e engenharia reunidas para resolver necessidades concretas de cada cliente.
            </p>
          </div>
        </Container>
      </header>

      <Section indice="01 / TRABALHOS SELECIONADOS" rotulo="Trabalhos selecionados" className="pb-[clamp(3rem,6vw,6rem)]">
        <div className="grid gap-5 lg:grid-cols-2">
          {trabalhos.map((trabalho) => <WorkCard key={trabalho.id} trabalho={trabalho} />)}
        </div>
      </Section>

      <Section indice="02 / SUA IDEIA" className="pb-[clamp(4rem,9vw,9rem)]" rotulo="Crie seu projeto">
        <div className="grid gap-8 rounded-[var(--radius-panel)] border border-[#55bfff]/25 bg-raised/70 p-7 sm:p-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="tecnica text-[#8bddff]">ENGENHARIA DE SOFTWARE COM IA APLICADA</p>
            <h2 className="mt-5 max-w-[15ch] text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.96] tracking-[-0.055em]">O próximo trabalho pode começar com a sua ideia.</h2>
          </div>
          <div className="lg:col-span-3 lg:col-start-10">
            <p className="text-sm leading-relaxed text-mineral">Construímos sites, aplicativos, sistemas e identidades digitais de acordo com sua necessidade.</p>
            <Link href={ROTAS.crieSeuProjeto} className="alvo-toque tecnica mt-6 inline-flex items-center rounded-full bg-[#55bfff] px-5 text-ink hover:bg-[#8bddff]">CRIAR MEU PROJETO →</Link>
          </div>
        </div>
      </Section>
    </>
  );
}

