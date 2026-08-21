import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { ProductIcon, type ProductIconId } from '@/components/projects/ProductIcon';
import { UpcomingMedicalVisual } from '@/components/projects/UpcomingMedicalVisual';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Produtos',
  descricao: 'Produtos digitais próprios da Blajeen Labs, adaptados a negócios reais.',
  rota: ROTAS.projetos,
});

type ProdutoCatalogo = {
  readonly id: ProductIconId;
  readonly indice: string;
  readonly categoria: string;
  readonly titulo: string;
  readonly texto: string;
  readonly href: string;
  readonly estado: string;
  readonly imagem?: string;
  readonly alt?: string;
};

const produtos: readonly ProdutoCatalogo[] = [
  {
    id: 'barbearia' as ProductIconId,
    indice: 'PRODUTO 01',
    categoria: 'BARBEARIA',
    titulo: 'Agenda simples para o cliente. Operação organizada para a equipe.',
    texto:
      'Para barbearias que querem oferecer agendamento sem conta e organizar equipe, serviços e rotina em uma plataforma com sua identidade.',
    href: ROTAS.barbearia,
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    imagem: '/projects/barbearia/screenshots-padronizados/01-site-institucional.png',
    alt: 'Página inicial da plataforma demonstrativa para barbearias.',
  },
  {
    id: 'personal' as ProductIconId,
    indice: 'PRODUTO 02',
    categoria: 'PERSONAL',
    titulo: 'Aluno, personal e gestão no mesmo produto.',
    texto:
      'Para personal trainers e estúdios que querem reunir presença digital, agenda, treinos e acompanhamento em uma experiência própria.',
    href: ROTAS.personalStudio,
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    imagem: '/projects/personal-studio/screenshots-v2/07-gestor-alunos.png',
    alt: 'Painel de gestão da plataforma Personal.',
  },
  {
    id: 'salao' as ProductIconId,
    indice: 'PRODUTO 03',
    categoria: 'STUDIO BEAUTY',
    titulo: 'Cliente, profissional e gestão conectadas à mesma experiência.',
    texto:
      'Para estúdios de estética e beleza que precisam conectar site, agendamento, portfólio, histórico e gestão.',
    href: ROTAS.salaoEstetica,
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    imagem: '/projects/salao-estetica/screenshots/01-inicio.png',
    alt: 'Página pública demonstrativa da plataforma Studio Beauty.',
  },
  {
    id: 'ecommerce' as ProductIconId,
    indice: 'PRODUTO 04',
    categoria: 'LOJAS E MARCAS',
    titulo: 'Vitrine, catálogo e atendimento em uma loja própria.',
    texto:
      'Para lojas e marcas que querem vender em uma vitrine própria, com busca, carrinho, atendimento assistido e painel de gestão.',
    href: ROTAS.ecommerce,
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    imagem: '/projects/ecommerce/screenshots/01-vitrine.png',
    alt: 'Vitrine demonstrativa do E-commerce da Blajeen Labs.',
  },
  {
    id: 'medico' as ProductIconId,
    indice: 'PRODUTO 05',
    categoria: 'CLÍNICA MÉDICA',
    titulo: 'Site, agenda e rotina clínica no mesmo lugar.',
    texto:
      'Para médicos que atendem de forma independente e querem organizar site, agenda, pacientes, prontuário e documentos clínicos.',
    href: ROTAS.clinicaMedica,
    estado: 'EM BREVE',
  },
];

export default function ProjetosPage() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden pt-[clamp(3.5rem,7vw,7rem)]"
        aria-labelledby="produtos-titulo"
      >
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">PRODUTOS PRÓPRIOS / NEGÓCIOS REAIS</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1
              id="produtos-titulo"
              className="max-w-[14ch] text-[clamp(2.55rem,6.5vw,6rem)] leading-[0.94] tracking-[-0.055em] lg:col-span-8"
            >
              Produtos digitais para negócios reais.
            </h1>
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral lg:col-span-3 lg:col-start-10 lg:pb-2">
              Bases funcionais criadas pela Blajeen Labs e adaptadas às necessidades, à identidade,
              às regras e à rotina de cada operação.
            </p>
          </div>
        </Container>
      </section>

      <Section className="pb-[clamp(4rem,9vw,9rem)]" rotulo="Produtos digitais">
        <div className="flex flex-col gap-[clamp(3rem,7vw,7rem)]">
          {produtos.map((produto, posicao) => (
            <Reveal key={produto.id}>
              <article className="grid overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised/70 lg:grid-cols-12">
                <div
                  className={`relative min-h-[18rem] overflow-hidden bg-surface lg:col-span-7 lg:min-h-[34rem] ${
                    posicao % 2 === 1 ? 'lg:col-start-6 lg:row-start-1' : ''
                  }`}
                >
                  {produto.imagem && produto.alt ? (
                    <>
                      <Image
                        src={produto.imagem}
                        alt={produto.alt}
                        fill
                        sizes="(min-width: 1024px) 58vw, 100vw"
                        className="object-cover object-top transition-transform duration-500 hover:scale-[1.015]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
                    </>
                  ) : (
                    <UpcomingMedicalVisual />
                  )}
                </div>

                <div
                  className={`flex flex-col justify-between p-7 sm:p-10 lg:col-span-5 lg:p-12 ${
                    posicao % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-5">
                      <ProductIcon id={produto.id} className="size-12 text-signal" />
                      <span className="tecnica rounded-full border border-signal/40 px-3 py-2 text-signal">
                        {produto.estado}
                      </span>
                    </div>
                    <p className="tecnica mt-10 text-mineral-dim">
                      {produto.indice} / {produto.categoria}
                    </p>
                    <h2 className="mt-5 max-w-[14ch] text-[clamp(2rem,4vw,3.6rem)] leading-[0.98] tracking-[-0.05em]">
                      {produto.titulo}
                    </h2>
                    <p className="medida-texto mt-6 text-[1rem] leading-relaxed text-mineral">
                      {produto.texto}
                    </p>
                  </div>

                  <Link
                    href={produto.href}
                    className="alvo-toque tecnica mt-10 inline-flex w-fit items-center gap-3 border-b border-signal pb-2 text-paper transition-colors duration-150 hover:text-signal"
                  >
                    Explorar o produto
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-[clamp(3rem,7vw,7rem)] grid gap-7 rounded-[var(--radius-panel)] border border-[#55bfff]/25 bg-raised/70 p-7 sm:p-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="tecnica text-[#8bddff]">PRECISA DE OUTRA COISA?</p>
            <h2 className="mt-5 max-w-[15ch] text-[clamp(2rem,4vw,3.8rem)] leading-[0.98] tracking-[-0.05em]">Criamos uma solução do zero para a sua necessidade.</h2>
          </div>
          <div className="lg:col-span-3 lg:col-start-10">
            <p className="text-sm leading-relaxed text-mineral">Do logo ao produto final, sua ideia ganha forma com identidade, engenharia e suporte.</p>
            <Link href={ROTAS.crieSeuProjeto} className="alvo-toque tecnica mt-6 inline-flex items-center rounded-full bg-[#55bfff] px-5 text-ink hover:bg-[#8bddff]">CRIE SEU PROJETO →</Link>
          </div>
        </div>
      </Section>

    </>
  );
}
