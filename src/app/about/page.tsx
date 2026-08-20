import type { Metadata } from 'next';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { sobre } from '@/content/pages';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: sobre.metaTitulo,
  descricao: sobre.metaDescricao,
  rota: ROTAS.sobre,
});

export default function Page() {
  return (
    <>
      <section
        aria-labelledby="sobre-titulo"
        className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,6rem)]"
      >
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">{sobre.eyebrow}</p>
          <h1
            id="sobre-titulo"
            className="mt-8 max-w-[16ch] text-[clamp(2.4rem,7vw,5rem)] leading-[0.98] tracking-[-0.05em]"
          >
            {sobre.titulo}
          </h1>
          <p className="medida-texto mt-8 text-[1.15rem] leading-relaxed text-mineral">
            {sobre.introducao}
          </p>
        </Container>
      </section>

      {sobre.secoes.map((secao, posicao) => (
        <Section
          key={secao.id}
          id={secao.id}
          indice={secao.indice}
          rotuladaPor={`${secao.id}-titulo`}
          className="relative isolate overflow-hidden"
        >
          {/* Alterna o lado a cada seção, para a arte não repetir sempre a mesma silhueta. */}
          <LabBackdrop lado={posicao % 2 === 0 ? 'esquerda' : 'direita'} />
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-12">
              <h2
                id={`${secao.id}-titulo`}
                className="text-[clamp(1.6rem,3.6vw,2.75rem)] leading-[1.05] tracking-[-0.04em] lg:col-span-6"
              >
                {secao.titulo}
              </h2>
              <div className="lg:col-span-5 lg:col-start-8">
                {secao.paragrafos.map((paragrafo) => (
                  <p
                    key={paragrafo}
                    className="medida-texto mb-5 text-[1rem] leading-relaxed text-mineral last:mb-0"
                  >
                    {paragrafo}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </Section>
      ))}

      <Section className="pb-[clamp(4rem,10vw,10rem)] pt-0" rotulo="Continuar navegando">
        <p className="regua tecnica pb-3 text-mineral-dim">{sobre.linhaTecnica}</p>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href={ROTAS.projetoRevalio}
            className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
          >
            Explorar os jogos
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={ROTAS.projetos}
            className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
          >
            Conhecer os produtos
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={ROTAS.contato}
            className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line px-5 text-mineral transition-colors duration-150 hover:border-signal/50 hover:text-signal"
          >
            Falar com o estúdio
          </Link>
        </div>
      </Section>
    </>
  );
}
