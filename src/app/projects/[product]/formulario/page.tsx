import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container } from '@/components/layout/Section';
import { BuyerOnboardingStart } from '@/components/onboarding/BuyerOnboardingStart';
import { ProjectFormCard } from '@/components/projects/ProjectFormCard';

const products = {
  barbearia: 'plataforma para barbearias',
  'personal-studio': 'Personal Studio',
  'salao-feminino': 'plataforma para salões de cabelo feminino',
  'salao-estetica': 'plataforma para estética e beleza',
  ecommerce: 'e-commerce sob medida',
} as const;

type ProductSlug = keyof typeof products;
type Context = { params: Promise<{ product: string }> };

export function generateStaticParams() {
  return Object.keys(products).map((product) => ({ product }));
}

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { product } = await params;
  const name = products[product as ProductSlug];
  if (!name) return {};
  return {
    title: `Formulário de criação — ${name}`,
    description: 'Briefing de contratação e criação da Blajeen Labs.',
    robots: { index: false, follow: false, noarchive: true },
  };
}

export default async function ProjectFormPage({ params }: Context) {
  const { product } = await params;
  const name = products[product as ProductSlug];
  if (!name) notFound();

  return (
    <article className="relative isolate min-h-[75vh] overflow-hidden py-[clamp(4rem,10vw,8rem)]">
      <LabBackdrop />
      <Container>
        <div className="mx-auto max-w-4xl">
          <Link href={`/projects/${product}`} className="alvo-toque text-sm text-mineral hover:text-paper">
            ← Voltar para {name}
          </Link>
          <div className="mt-8 rounded-[var(--radius-panel)] border border-line-strong bg-surface/90 p-7 sm:p-10 lg:p-14">
            <ProjectFormCard slug={product} showAction={false} />
            <div className="mt-9 border-t border-line pt-8">
              <h1 className="max-w-[16ch] text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.98] tracking-[-0.05em]">
                Vamos preparar seu projeto.
              </h1>
              <p className="medida-texto mt-6 text-[1rem] leading-relaxed text-mineral">
                Este formulário é destinado a quem decidiu contratar. Comece informando seus dados
                de contato; na etapa seguinte, você poderá explicar a marca, a operação, o conteúdo
                e tudo o que precisamos para personalizar o projeto.
              </p>
              <div className="mt-6 rounded-2xl border border-signal/25 bg-signal/5 p-4 text-sm leading-relaxed text-mineral">
                <strong className="text-paper">Sem código e sem conta.</strong> Suas respostas ficam
                salvas durante o preenchimento. Nunca informe senhas pessoais ou bancárias.
              </div>
              <BuyerOnboardingStart product={product} productName={name} />
            </div>
          </div>
        </div>
      </Container>
    </article>
  );
}
