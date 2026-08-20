import type { Metadata } from 'next';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Projetos',
  descricao: 'Sites e aplicativos em construção na Blajeen Labs.',
  rota: ROTAS.projetos,
});

const projetos = [
  {
    id: 'barbearia',
    indice: 'PROJETO 01',
    titulo: 'Plataforma para barbearias.',
    texto: 'Site e aplicativo para organizar presença digital, agenda e relacionamento com clientes.',
  },
  {
    id: 'personal-estudio',
    indice: 'PROJETO 02',
    titulo: 'Plataforma para personal trainers e estúdios.',
    texto: 'Site e aplicativo para organizar presença digital, rotina e acompanhamento.',
    href: ROTAS.personalStudio,
  },
  {
    id: 'salao-beleza',
    indice: 'PROJETO 03',
    titulo: 'Plataforma para salões de beleza.',
    texto: 'Site e aplicativo para apresentar serviços, organizar agenda e cuidar do relacionamento com clientes.',
  },
  {
    id: 'pet-shop-tosa',
    indice: 'PROJETO 04',
    titulo: 'Plataforma para pet shops e banho & tosa.',
    texto: 'Site e aplicativo para organizar serviços, horários e cuidados de cada pet.',
  },
] as const;

export default function ProjetosPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,6rem)]" aria-labelledby="projetos-titulo">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">PROJETOS EM CONSTRUÇÃO</p>
          <h1
            id="projetos-titulo"
            className="mt-8 max-w-[14ch] text-[clamp(2.4rem,7vw,5rem)] leading-[0.98] tracking-[-0.05em]"
          >
            Novas ferramentas para negócios reais.
          </h1>
          <p className="medida-texto mt-8 text-[1.15rem] leading-relaxed text-mineral">
            Dois novos produtos estão saindo do laboratório. Ambos ainda estão em definição.
          </p>
        </Container>
      </section>

      <Section className="pb-[clamp(4rem,10vw,10rem)]" rotulo="Projetos em breve">
        <div className="grid gap-5 lg:grid-cols-2">
          {projetos.map((projeto) => (
            <Reveal key={projeto.id}>
              <article id={projeto.id} className="h-full rounded-[var(--radius-panel)] border border-line bg-raised/50 p-7 sm:p-9">
                <p className="tecnica flex items-center justify-between gap-4 text-signal">
                  {projeto.indice}
                  <span className="rounded-full border border-signal/40 px-3 py-1 text-[0.56rem]">EM BREVE</span>
                </p>
                <h2 className="mt-12 max-w-[14ch] text-[clamp(1.8rem,3.5vw,2.7rem)] leading-[1.03] tracking-[-0.045em]">
                  {projeto.titulo}
                </h2>
                <p className="medida-texto mt-6 text-[1rem] leading-relaxed text-mineral">{projeto.texto}</p>
                {'href' in projeto ? (
                  <Link
                    href={projeto.href}
                    className="alvo-toque tecnica mt-8 inline-flex items-center gap-3 border-b border-signal pb-2 text-paper transition-colors duration-150 hover:text-signal"
                  >
                    Conhecer o produto
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
