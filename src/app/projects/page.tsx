import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { ProductIcon, type ProductIconId } from '@/components/projects/ProductIcon';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Produtos',
  descricao: 'Produtos digitais próprios da Blajeen Labs, adaptados a negócios reais.',
  rota: ROTAS.projetos,
});

const produtosEmDemonstracao = [
  {
    id: 'barbearia' as ProductIconId,
    indice: 'PRODUTO 01',
    categoria: 'BARBEARIAS',
    titulo: 'Agenda simples para o cliente. Operação organizada para a equipe.',
    texto:
      'Uma plataforma web com site institucional, agendamento sem conta e gestão da rotina — pronta para receber a identidade da barbearia.',
    href: ROTAS.barbearia,
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    imagem: '/projects/barbearia/screenshots/01-site-institucional.png',
    alt: 'Página inicial da plataforma demonstrativa para barbearias.',
  },
  {
    id: 'personal' as ProductIconId,
    indice: 'PRODUTO 02',
    categoria: 'PERSONAL TRAINERS E ESTÚDIOS',
    titulo: 'Aluno, personal e gestão no mesmo produto.',
    texto:
      'Uma plataforma web para presença digital, agenda, treinos e acompanhamento, adaptável à marca e à rotina de cada operação.',
    href: ROTAS.personalStudio,
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    imagem: '/projects/personal-studio/mockup-painel-gestor.png',
    alt: 'Painel de gestão da plataforma Personal Studio exibido em um monitor.',
  },
  {
    id: 'ecommerce' as ProductIconId,
    indice: 'PRODUTO 05',
    categoria: 'LOJAS E MARCAS',
    titulo: 'Vitrine, catálogo e atendimento em uma loja própria.',
    texto:
      'Um e-commerce white-label com busca, carrinho, checkout assistido e painel para organizar a operação.',
    href: ROTAS.ecommerce,
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    imagem: '/projects/ecommerce/social-ecommerce.jpg',
    alt: 'Identidade visual da demonstração de e-commerce da Blajeen Labs.',
  },
] as const;

const proximasVerticais = [
  {
    id: 'cabelo' as ProductIconId,
    ancora: 'salao-feminino',
    indice: 'PRODUTO 03',
    titulo: 'Salões de cabelo feminino',
    texto: 'Presença digital e jornada de atendimento próprias para serviços de cabelo e para a rotina do salão.',
    estado: 'EM BREVE',
    href: ROTAS.salaoFeminino,
  },
  {
    id: 'salao' as ProductIconId,
    ancora: 'salao-estetica',
    indice: 'PRODUTO 04',
    titulo: 'Estética e beleza',
    texto: 'Uma vertical separada para estética, unhas, sobrancelhas, cílios, maquiagem, noivas e serviços combinados.',
    estado: 'EM BREVE',
    href: ROTAS.salaoEstetica,
  },
  {
    id: 'pet' as ProductIconId,
    ancora: 'pet-shop-tosa',
    indice: 'PRODUTO 06',
    titulo: 'Pet shops e banho & tosa',
    texto: 'Serviços, horários e histórico de cuidados organizados ao redor de cada pet.',
    estado: 'EM DESENVOLVIMENTO',
  },
] as const;

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

      <Section className="pb-[clamp(4rem,9vw,9rem)]" rotulo="Produtos em demonstração">
        <div className="flex flex-col gap-[clamp(3rem,7vw,7rem)]">
          {produtosEmDemonstracao.map((produto, posicao) => (
            <Reveal key={produto.id}>
              <article className="grid overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised/70 lg:grid-cols-12">
                <div
                  className={`relative min-h-[18rem] overflow-hidden bg-surface lg:col-span-7 lg:min-h-[34rem] ${
                    posicao % 2 === 1 ? 'lg:col-start-6 lg:row-start-1' : ''
                  }`}
                >
                  <Image
                    src={produto.imagem}
                    alt={produto.alt}
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover object-top transition-transform duration-500 hover:scale-[1.015]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
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
      </Section>

      <Section indice="03 / PRÓXIMAS VERTICAIS" rotuladaPor="proximas-verticais-titulo">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2
            id="proximas-verticais-titulo"
            className="max-w-[14ch] text-[clamp(2rem,4.5vw,4rem)] leading-[0.98] tracking-[-0.05em] lg:col-span-7"
          >
            A mesma lógica, em novos negócios.
          </h2>
          <p className="medida-texto text-[1rem] leading-relaxed text-mineral lg:col-span-4 lg:col-start-9">
            Estas linhas ainda estão em desenvolvimento. Serão apresentadas quando houver produto
            real para explorar.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {proximasVerticais.map((produto) => (
            <article
              key={produto.id}
              id={produto.ancora}
              className="rounded-[var(--radius-panel)] border border-line bg-surface/60 p-7 sm:p-9"
            >
              <div className="flex items-start justify-between gap-5">
                <ProductIcon id={produto.id} className="size-11 text-signal" />
                <span className="tecnica rounded-full border border-line-strong px-3 py-2 text-mineral">
                  {produto.estado}
                </span>
              </div>
              <p className="tecnica mt-10 text-mineral-dim">{produto.indice}</p>
              <h3 className="mt-4 text-[clamp(1.6rem,3vw,2.5rem)] tracking-[-0.04em]">
                {produto.titulo}
              </h3>
              <p className="medida-texto mt-4 max-w-[58ch] text-[0.95rem] leading-relaxed text-mineral">
                {produto.texto}
              </p>
              {'href' in produto ? (
                <Link
                  href={produto.href}
                  className="alvo-toque tecnica mt-8 inline-flex w-fit items-center gap-3 border-b border-signal pb-2 text-paper transition-colors duration-150 hover:text-signal"
                >
                  Conhecer a proposta
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
