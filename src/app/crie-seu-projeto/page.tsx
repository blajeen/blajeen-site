import type { Metadata } from 'next';
import Link from 'next/link';
import { AppliedEngineeringIcon } from '@/components/brand/AppliedEngineeringIcon';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { CustomProjectForm } from '@/components/contact/CustomProjectForm';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { projetoPersonalizado } from '@/content/custom-project';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Crie seu projeto — Blajeen Labs',
  descricao: 'Sites, aplicativos, sistemas e identidades digitais criados para a sua necessidade com engenharia de software aplicada.',
  rota: ROTAS.crieSeuProjeto,
});

export default function CrieSeuProjetoPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop lado="esquerda" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <p className="tecnica text-[#8bddff]">{projetoPersonalizado.eyebrow}</p>
              <h1 className="mt-8 max-w-[11ch] text-[clamp(3.2rem,8.5vw,8.5rem)] leading-[0.88] tracking-[-0.065em]">
                {projetoPersonalizado.titulo}
              </h1>
              <p className="medida-texto mt-8 text-[1.08rem] leading-relaxed text-mineral">{projetoPersonalizado.descricao}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={projetoPersonalizado.ctaPrimario.href} className="alvo-toque tecnica inline-flex items-center rounded-full bg-[#55bfff] px-5 text-ink transition-colors hover:bg-[#8bddff]">
                  {projetoPersonalizado.ctaPrimario.rotulo} →
                </Link>
                <Link href={projetoPersonalizado.ctaSecundario.href} className="alvo-toque tecnica inline-flex items-center rounded-full border border-line-strong px-5 text-paper transition-colors hover:border-[#55bfff] hover:text-[#8bddff]">
                  {projetoPersonalizado.ctaSecundario.rotulo}
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:col-span-4 lg:justify-end">
              <AppliedEngineeringIcon className="!w-[clamp(10rem,22vw,18rem)]" />
            </div>
          </div>
          <p className="regua tecnica mt-14 pb-3 text-mineral-dim">IDEIA → PRODUTO → PUBLICAÇÃO → EVOLUÇÃO</p>
        </Container>
      </header>

      <Section indice="01 / O PONTO DE PARTIDA" rotuladaPor="ponto-partida-titulo">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <TituloSecao id="ponto-partida-titulo" className="lg:col-span-5">Você traz a necessidade. Nós ajudamos a dar forma.</TituloSecao>
          <p className="medida-texto text-[1.08rem] leading-relaxed text-mineral lg:col-span-5 lg:col-start-8">{projetoPersonalizado.complemento}</p>
        </div>
      </Section>

      <Section indice="02 / O QUE PODEMOS CONSTRUIR" rotuladaPor="entregas-titulo">
        <TituloSecao id="entregas-titulo">Da identidade ao produto funcionando.</TituloSecao>
        <div className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-2">
          {projetoPersonalizado.entregas.map((entrega, indice) => (
            <article key={entrega.titulo} className="min-h-52 bg-surface p-6 sm:p-8">
              <span className="tecnica text-[#8bddff]">{String(indice + 1).padStart(2, '0')}</span>
              <h3 className="mt-8 text-[1.6rem] leading-tight tracking-[-0.04em]">{entrega.titulo}</h3>
              <p className="medida-texto mt-4 text-sm leading-relaxed text-mineral">{entrega.texto}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section indice="03 / COMO FUNCIONA" rotuladaPor="processo-titulo">
        <div className="grid gap-10 lg:grid-cols-12">
          <TituloSecao id="processo-titulo" className="lg:col-span-4">Um processo claro, com espaço para descobrir.</TituloSecao>
          <ol className="grid gap-3 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {projetoPersonalizado.etapas.map(([indice, titulo, texto]) => (
              <li key={indice} className="rounded-[var(--radius-control)] border border-line bg-raised/65 p-5">
                <div className="flex items-center gap-4"><span className="tecnica text-[#8bddff]">{indice}</span><h3 className="text-lg tracking-tight">{titulo}</h3></div>
                <p className="mt-3 text-sm leading-relaxed text-mineral">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section indice="04 / CONTINUIDADE" rotuladaPor="continuidade-titulo">
        <div className="grid gap-10 rounded-[var(--radius-panel)] border border-line bg-raised/60 p-7 sm:p-10 lg:grid-cols-12">
          <TituloSecao id="continuidade-titulo" className="lg:col-span-5">A entrega não precisa ser o fim da parceria.</TituloSecao>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-[1.05rem] leading-relaxed text-mineral">Depois da publicação, podemos acompanhar manutenção, correções, melhorias e novas versões. O produto continua evoluindo conforme você aprende com o uso real.</p>
            <p className="tecnica mt-8 text-[#8bddff]">SUPORTE / MANUTENÇÃO / ATUALIZAÇÕES</p>
          </div>
        </div>
      </Section>

      <Section indice="05 / VAMOS COMEÇAR" className="pb-[clamp(4rem,9vw,9rem)]" rotulo="Formulário de primeiro contato">
        <CustomProjectForm />
      </Section>
    </>
  );
}
