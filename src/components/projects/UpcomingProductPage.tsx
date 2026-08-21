import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { ProductIcon, type ProductIconId } from '@/components/projects/ProductIcon';
import { ProjectFormCard } from '@/components/projects/ProjectFormCard';
import { ROTAS } from '@/lib/routes';

export type UpcomingProduct = {
  readonly icon: ProductIconId;
  readonly eyebrow: string;
  readonly title: string;
  readonly headline: string;
  readonly introduction: string;
  readonly contactId: string;
  readonly contactLabel: string;
  readonly slug?: string;
  readonly directions: readonly {
    readonly title: string;
    readonly text: string;
  }[];
  readonly services?: readonly string[];
  readonly servicesTitle?: string;
  readonly servicesIntroduction?: string;
};

/** Página honesta para uma linha de produto que ainda não possui demonstração pública. */
export function UpcomingProductPage({ product }: { product: UpcomingProduct }) {
  return (
    <>
      <section
        className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,6rem)]"
        aria-labelledby="produto-titulo"
      >
        <LabBackdrop />
        <Container>
          <div className="flex items-center justify-between gap-6">
            <p className="tecnica text-signal">{product.eyebrow}</p>
            <span className="tecnica rounded-full border border-signal/40 px-4 py-2 text-signal">
              EM BREVE
            </span>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <ProductIcon id={product.icon} className="size-14 text-signal" />
              <h1
                id="produto-titulo"
                className="mt-8 max-w-[13ch] text-[clamp(2.8rem,7vw,6rem)] leading-[0.94] tracking-[-0.055em]"
              >
                {product.headline}
              </h1>
            </div>

            <div className="lg:col-span-4 lg:pb-2">
              <p className="tecnica text-mineral-dim">{product.title}</p>
              <p className="medida-texto mt-5 text-[1.05rem] leading-relaxed text-mineral">
                {product.introduction}
              </p>
              <Link
                href={`${ROTAS.contato}?produto=${product.contactId}#interesse`}
                className="alvo-toque tecnica mt-8 inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-5 text-ink transition-colors duration-150 hover:bg-signal-pale"
              >
                Tenho interesse
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Section indice="01 / DIREÇÃO DO PRODUTO" rotuladaPor="direcao-produto-titulo">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2
            id="direcao-produto-titulo"
            className="max-w-[15ch] text-[clamp(2rem,4.5vw,4rem)] leading-[0.98] tracking-[-0.05em] lg:col-span-7"
          >
            Uma base que começa pelo negócio, não por um modelo genérico.
          </h2>
          <p className="medida-texto text-[1rem] leading-relaxed text-mineral lg:col-span-4 lg:col-start-9">
            A proposta está em desenvolvimento. Escopo, jornada e prioridades serão definidos a
            partir das necessidades reais de cada operação antes da implementação.
          </p>
        </div>

        <ol className="mt-14">
          {product.directions.map((direction, index) => (
            <li
              key={direction.title}
              className="grid gap-x-8 gap-y-3 border-t border-line py-8 last:border-b sm:grid-cols-12"
            >
              <span className="tecnica text-signal sm:col-span-1">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-[1.35rem] leading-tight tracking-[-0.03em] sm:col-span-4">
                {direction.title}
              </h3>
              <p className="text-[0.95rem] leading-relaxed text-mineral sm:col-span-6 sm:col-start-6">
                {direction.text}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {product.services?.length ? (
        <Section indice="02 / SERVIÇOS" rotuladaPor="servicos-produto-titulo">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <h2
              id="servicos-produto-titulo"
              className="max-w-[16ch] text-[clamp(2rem,4.5vw,4rem)] leading-[0.98] tracking-[-0.05em] lg:col-span-7"
            >
              {product.servicesTitle ?? 'Serviços contemplados nesta vertical.'}
            </h2>
            {product.servicesIntroduction ? (
              <p className="medida-texto text-[1rem] leading-relaxed text-mineral lg:col-span-4 lg:col-start-9">
                {product.servicesIntroduction}
              </p>
            ) : null}
          </div>

          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {product.services.map((service) => (
              <li
                key={service}
                className="flex min-h-16 items-center gap-3 rounded-[var(--radius-control)] border border-line bg-surface/60 px-5 py-4 text-paper"
              >
                <span aria-hidden="true" className="size-1.5 flex-none rounded-full bg-signal" />
                {service}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section
        indice={`${product.services?.length ? '03' : '02'} / IDENTIDADE E ADAPTAÇÃO`}
        rotuladaPor="adaptacao-produto-titulo"
      >
        <Reveal>
          <div className="rounded-[var(--radius-panel)] border border-line bg-raised/70 p-7 sm:p-10 lg:p-14">
            <p className="tecnica text-signal">FEITO PARA A SUA OPERAÇÃO</p>
            <h2
              id="adaptacao-produto-titulo"
              className="mt-6 max-w-[17ch] text-[clamp(2rem,4.5vw,4rem)] leading-[0.98] tracking-[-0.05em]"
            >
              Adequamos o produto às suas necessidades e à sua identidade.
            </h2>
            <p className="medida-texto mt-6 max-w-[68ch] text-[1rem] leading-relaxed text-mineral">
              Marca, conteúdo, prioridades e regras são tratados como parte do produto. A página
              será ampliada quando houver uma demonstração real para apresentar.
            </p>
            <Link
              href={`${ROTAS.contato}?produto=${product.contactId}#interesse`}
              className="alvo-toque tecnica mt-9 inline-flex w-fit items-center gap-3 border-b border-signal pb-2 text-paper transition-colors duration-150 hover:text-signal"
            >
              {product.contactLabel}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>
      </Section>

      {product.slug ? (
        <Section
          indice={`${product.services?.length ? '04' : '03'} / FORMULÁRIO`}
          rotuladaPor="formulario-produto-titulo"
          className="pb-[clamp(4rem,10vw,10rem)]"
        >
          <ProjectFormCard slug={product.slug} />
        </Section>
      ) : null}
    </>
  );
}
