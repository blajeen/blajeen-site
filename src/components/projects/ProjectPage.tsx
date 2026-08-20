import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { StoreBadges } from '@/components/projects/StoreBadges';
import { disponibilidadeVisivel, statusVisivel } from '@/content/estado-do-projeto';
import { Reveal } from '@/components/motion/Reveal';
import { ProjectBanner } from '@/components/projects/ProjectBanner';
import { proximoProjeto, rotasDoProjeto } from '@/content/projects';
import type { Project } from '@/content/types';

/**
 * Página de produto.
 *
 * O banner aprovado é o hero e recebe prioridade porque é o LCP desta rota. Recursos só aparecem
 * quando a lista tipada tem itens confirmados no build; a galeria só aparece quando existirem
 * capturas selecionadas pelo titular. Nenhum dos dois inventa estado intermediário.
 */
export function ProjectPage({ projeto }: { projeto: Project }) {
  const rotas = rotasDoProjeto[projeto.id];
  const proximo = proximoProjeto(projeto);
  const pilares = projeto.pilares ?? [];

  /*
   * Os índices são numerados a partir das seções que realmente existem. Recursos, desenho e
   * galeria só aparecem quando há conteúdo confirmado, e a numeração não pode pular por isso.
   */
  const secoes = [
    'manifesto',
    ...(projeto.recursos.length > 0 ? (['recursos'] as const) : []),
    ...(pilares.length > 0 ? (['desenho'] as const) : []),
    ...(projeto.galeria.length > 0 ? (['galeria'] as const) : []),
    'aviso',
    'documentos',
  ];
  const indice = (nome: string) => String(secoes.indexOf(nome) + 1).padStart(2, '0');

  return (
    <>
      <section aria-labelledby="projeto-titulo" className="pt-[clamp(2.5rem,6vw,5rem)]">
        <Container>
          <p className="tecnica text-signal">{projeto.eyebrow}</p>

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1
              id="projeto-titulo"
              className="text-[clamp(3rem,9vw,6.5rem)] leading-[0.92] tracking-[-0.055em] lg:col-span-6"
            >
              {projeto.nome}
            </h1>

            <div className="lg:col-span-6 lg:pb-3">
              <p className="text-[clamp(1.25rem,2.6vw,1.9rem)] leading-tight tracking-[-0.03em] text-paper">
                {projeto.subtitulo}
              </p>
              <p className="medida-texto mt-5 text-[1rem] leading-relaxed text-mineral">
                {projeto.introducao}
              </p>
              <p className="tecnica mt-6 flex items-center gap-2 text-mineral">
                <span
                  aria-hidden="true"
                  className="inline-block size-[5px] rounded-full bg-signal shadow-[0_0_8px_var(--color-signal)]"
                />
                {statusVisivel(projeto)}
              </p>

              <StoreBadges disponibilidade={disponibilidadeVisivel(projeto)} className="mt-7" />
            </div>
          </div>

          <div className="mt-12 sm:mt-16">
            <ProjectBanner
              projeto={projeto}
              prioridade
              sizes="(min-width: 90rem) 1344px, 100vw"
            />
          </div>
        </Container>
      </section>

      {/* Manifesto curto */}
      <Section
        indice={`${indice('manifesto')} / MANIFESTO`}
        rotulo={`Manifesto do ${projeto.nome}`}
        className="relative isolate overflow-hidden"
      >
        <LabBackdrop lado="esquerda" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-4">
            {projeto.manifesto.map((paragrafo) => (
              <p
                key={paragrafo}
                className="mb-6 max-w-[46rem] text-[clamp(1.1rem,2.1vw,1.5rem)] leading-snug tracking-[-0.02em] text-paper last:mb-0"
              >
                {paragrafo}
              </p>
            ))}
          </div>
        </div>
      </Section>

      {projeto.recursos.length > 0 ? (
        <Section indice={`${indice('recursos')} / NO BUILD`} rotuladaPor="recursos-titulo">
          <h2 id="recursos-titulo" className="max-w-[18ch] text-[clamp(1.8rem,4vw,3rem)] leading-[1.04] tracking-[-0.045em]">
            O que existe no build hoje
          </h2>

          {/* Lista editorial com divisores, não uma grade de cards: o sistema evita aparência de SaaS. */}
          <ul className="mt-14">
            {projeto.recursos.map((recurso, posicao) => (
              <li
                key={recurso.titulo}
                className="grid gap-x-8 gap-y-2 border-t border-line py-7 last:border-b sm:grid-cols-12 sm:py-9"
              >
                <span className="tecnica text-signal sm:col-span-1">
                  {String(posicao + 1).padStart(2, '0')}
                </span>
                <h3 className="text-[1.35rem] leading-tight tracking-[-0.03em] sm:col-span-4">
                  {recurso.titulo}
                </h3>
                <p className="text-[0.95rem] leading-relaxed text-mineral sm:col-span-6 sm:col-start-6">
                  {recurso.texto}
                </p>
              </li>
            ))}
          </ul>

          <p className="medida-texto mt-8 text-sm leading-relaxed text-mineral-dim">
            Esta lista descreve o comportamento auditado do aplicativo. Recursos que ainda não
            estão prontos não aparecem aqui, mesmo que existam em planejamento.
          </p>
        </Section>
      ) : null}

      {pilares.length > 0 ? (
        <Section indice={`${indice('desenho')} / NO DESENHO`} rotuladaPor="desenho-titulo">
          <h2
            id="desenho-titulo"
            className="max-w-[18ch] text-[clamp(1.8rem,4vw,3rem)] leading-[1.04] tracking-[-0.045em]"
          >
            O que o jogo está sendo desenhado para ser
          </h2>

          {/* Mesma gramática da lista de recursos, com um rótulo que não confunde plano com build. */}
          <ul className="mt-14">
            {pilares.map((pilar, posicao) => (
              <li
                key={pilar.titulo}
                className="grid gap-x-8 gap-y-2 border-t border-line py-7 last:border-b sm:grid-cols-12 sm:py-9"
              >
                <span className="tecnica text-signal sm:col-span-1">
                  {String(posicao + 1).padStart(2, '0')}
                </span>
                <h3 className="text-[1.35rem] leading-tight tracking-[-0.03em] sm:col-span-4">
                  {pilar.titulo}
                </h3>
                <p className="text-[0.95rem] leading-relaxed text-mineral sm:col-span-6 sm:col-start-6">
                  {pilar.texto}
                </p>
              </li>
            ))}
          </ul>

          <p className="medida-texto mt-8 text-sm leading-relaxed text-mineral-dim">
            Esta lista é o desenho do jogo, não uma lista de recursos prontos. Ainda não existe
            build público, e o que estiver implementado passa a ser descrito como tal quando houver
            um aplicativo para auditar.
          </p>
        </Section>
      ) : null}

      {projeto.galeria.length > 0 ? (
        <Section indice={`${indice('galeria')} / CAPTURAS`} rotuladaPor="galeria-titulo">
          <h2 id="galeria-titulo" className="sr-only">
            Capturas do {projeto.nome}
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projeto.galeria.map((captura) => (
              <li key={captura.src}>
                <figure>
                  <Image
                    src={captura.src}
                    alt={captura.alt}
                    width={captura.largura}
                    height={captura.altura}
                    sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 46vw, 92vw"
                    loading="lazy"
                    className="block h-auto w-full rounded-[var(--radius-control)] border border-line"
                  />
                  <figcaption className="mt-3 text-sm leading-snug text-mineral">
                    {captura.legenda}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Aviso obrigatório */}
      <Section
        indice={`${indice('aviso')} / AVISO`}
        rotuladaPor="aviso-titulo"
        className="relative isolate overflow-hidden"
      >
        <LabBackdrop />
        <Reveal>
          <div className="rounded-[var(--radius-panel)] border border-line bg-surface px-6 py-10 sm:px-12 sm:py-14">
            <h2 id="aviso-titulo" className="tecnica text-signal">
              Leia antes de usar
            </h2>
            <p className="mt-6 max-w-[52rem] text-[clamp(1rem,1.9vw,1.2rem)] leading-relaxed text-paper">
              {projeto.aviso}
            </p>
          </div>
        </Reveal>
      </Section>

      {/* Infraestrutura pública exigida pelas lojas */}
      <Section
        indice={`${indice('documentos')} / DOCUMENTOS`}
        rotuladaPor="documentos-titulo"
        className="pb-[clamp(4rem,10vw,10rem)]"
      >
        <h2 id="documentos-titulo" className="max-w-[20ch] text-[clamp(1.8rem,4vw,3rem)] leading-[1.04] tracking-[-0.045em]">
          Suporte, privacidade, termos e exclusão de conta
        </h2>

        <nav aria-label={`Documentos do ${projeto.nome}`} className="mt-12">
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-2">
            {[
              { href: rotas.suporte, rotulo: 'Suporte', texto: 'Canal de atendimento e o que informar.' },
              { href: rotas.privacidade, rotulo: 'Privacidade', texto: 'Quais dados existem e como são tratados.' },
              { href: rotas.termos, rotulo: 'Termos', texto: 'Finalidade, limites e regras de uso.' },
              { href: rotas.exclusao, rotulo: 'Excluir conta', texto: 'Como pedir a exclusão dos seus dados.' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col bg-surface px-6 py-7 transition-colors duration-150 hover:bg-raised sm:px-8"
                >
                  <span className="flex items-center justify-between gap-4 text-[1.15rem] tracking-[-0.02em] text-paper">
                    {item.rotulo}
                    <span aria-hidden="true" className="text-signal">
                      →
                    </span>
                  </span>
                  <span className="mt-2 text-sm leading-snug text-mineral">{item.texto}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-12">
          <Link
            href={rotasDoProjeto[proximo.id].pagina}
            className="alvo-toque tecnica inline-flex items-center gap-3 border-b border-line-strong pb-3 text-mineral transition-colors duration-150 hover:border-signal hover:text-signal"
          >
            Próximo experimento: {proximo.nome}
            <span aria-hidden="true">→</span>
          </Link>
        </p>
      </Section>
    </>
  );
}
