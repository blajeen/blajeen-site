import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { ProductAudience } from '@/components/projects/ProductAudience';
import { ProductGallery } from '@/components/projects/ProductGallery';
import { ProjectFormCard } from '@/components/projects/ProjectFormCard';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

const DEMONSTRACAO = 'https://site-estetica-kappa.vercel.app';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Beautelio — Blajeen Labs',
  descricao:
    'Plataforma white-label para estúdios de beleza com site, agendamento, portfólio, área da cliente e gestão da operação.',
  rota: ROTAS.salaoEstetica,
});

const especialidades = [
  ['Estética', 'Tratamentos faciais e corporais organizados em um catálogo próprio.'],
  ['Unhas', 'Manicure, pedicure, nail art e alongamentos com portfólio por profissional.'],
  ['Olhar', 'Sobrancelhas, brow design, brow lamination, cílios e lash lifting.'],
  ['Maquiagem', 'Produções sociais, eventos, noivas, pacotes e serviços combinados.'],
] as const;

const publicos = [
  {
    title: 'Profissional ou estúdio especializado',
    text: 'Para nail designers, lash designers, esteticistas, maquiadoras e espaços que querem profissionalizar a própria presença e agenda.',
  },
  {
    title: 'Operação com equipe ou unidades',
    text: 'Para proprietárias e gestoras que precisam conectar profissionais, especialidades, portfólio, pacotes, clientes e eventos.',
  },
] as const;

const experiencias = [
  {
    titulo: 'Para a cliente',
    texto:
      'Catálogo, profissionais, portfólio, pacotes e agendamento. Na conta, a cliente acompanha horários, histórico, inspirações e benefícios.',
  },
  {
    titulo: 'Para a profissional',
    texto:
      'Agenda própria, contexto do próximo atendimento, fichas por especialidade, bloqueios, clientes atendidas e gestão do portfólio.',
  },
  {
    titulo: 'Para a gestão',
    texto:
      'Agenda da operação, equipe, unidades, catálogo, preços, pacotes, eventos e clientes que podem precisar de reativação.',
  },
  {
    titulo: 'Para a marca',
    texto:
      'Nome, monograma, cores, tipografia, conteúdo, contatos, módulos e regras são configurados para cada estúdio.',
  },
] as const;

const jornada = [
  ['Escolher', 'A cliente pode começar pelo serviço, pela profissional, por um pacote ou por uma ocasião.'],
  ['Combinar', 'Vários serviços podem entrar na mesma visita, inclusive com profissionais diferentes.'],
  ['Encontrar horário', 'A agenda considera duração, intervalos, bloqueios, unidade e disponibilidade real.'],
  ['Acompanhar', 'O histórico preserva preferências, fichas técnicas e fotos conforme a autorização da cliente.'],
] as const;

const personalizacoes = [
  'Marca, paleta, tipografia, domínio, textos e imagens.',
  'Serviços, profissionais, durações, preços e horários.',
  'Unidades, políticas, antecedência e regras de cancelamento.',
  'Módulos de pacotes, eventos, portfólio, inspirações e avaliações.',
  'Conteúdo público e jornada de atendimento do próprio negócio.',
] as const;

const demonstracoes = ([
  ['01-inicio.png', 'Site público do Beautelio com identidade, proposta e acesso ao agendamento.', 'Site público: apresentação da marca, especialidades e chamada principal.'],
  ['02-servicos.png', 'Catálogo de serviços do Beautelio.', 'Serviços: categorias, valores, durações e caminhos para reservar.'],
  ['03-categoria-unhas.png', 'Categoria de unhas com serviços disponíveis.', 'Categoria: serviços de unhas organizados para facilitar a escolha.'],
  ['04-profissionais.png', 'Equipe de profissionais do Beautelio.', 'Profissionais: especialidades, perfis e acesso ao agendamento.'],
  ['05-portfolio.png', 'Portfólio de trabalhos do Beautelio.', 'Portfólio: trabalhos reais organizados por especialidade e autorização.'],
  ['06-pacotes.png', 'Pacotes e serviços combinados do Beautelio.', 'Pacotes: combinações de serviços apresentadas com clareza.'],
  ['07-beauty-club.png', 'Área de apresentação do Beauty Club.', 'Beauty Club: recorrência e benefícios configuráveis para o estúdio.'],
  ['08-noivas-eventos.png', 'Jornada para noivas e eventos.', 'Noivas e eventos: produção de beleza e cronograma dedicado.'],
  ['09-agendamento.png', 'Início do fluxo de agendamento do Beautelio.', 'Agendamento: início por serviço, profissional ou ocasião.'],
  ['10-sobre-estudio.png', 'Página institucional sobre o Beautelio.', 'Institucional: história, unidades, políticas e perguntas frequentes.'],
] as const).map(([arquivo, alt, legenda]) => ({
  imagem: `/projects/salao-estetica/screenshots/${arquivo}`,
  alt,
  legenda,
  largura: 1600,
  altura: 900,
}));

function BeautyStudioPreview() {
  const categorias = [
    ['Unhas', '/projects/salao-estetica/categoria-unhas.jpg'],
    ['Cílios', '/projects/salao-estetica/categoria-cilios.jpg'],
    ['Maquiagem', '/projects/salao-estetica/categoria-maquiagem.jpg'],
    ['Estética facial', '/projects/salao-estetica/categoria-estetica-facial.jpg'],
  ] as const;

  return (
    <figure className="overflow-hidden rounded-[var(--radius-panel)] border border-line bg-[#f7f3ef] text-[#241c19] shadow-panel">
      <div className="flex items-center justify-between gap-4 border-b border-[#e4dcd4] bg-white px-5 py-4 sm:px-7">
        <span className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#3b2c28] font-serif text-xl text-[#fbf8f5]">
            L
          </span>
          <span>
            <strong className="block font-serif text-lg leading-none">Lumi</strong>
            <span className="mt-1 block text-[9px] uppercase tracking-[0.18em] text-[#8a7c74]">
              Beauty Studio
            </span>
          </span>
        </span>
        <span className="rounded-full bg-[#3b2c28] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          Agendar
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[21rem] sm:min-h-[26rem]">
          <Image
            src="/projects/salao-estetica/hero-home.jpg"
            alt="Ambiente da demonstração Lumi Beauty Studio."
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1512]/85 via-[#1c1512]/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">
              BELEZA COM ASSINATURA
            </p>
            <p className="mt-3 max-w-[13ch] font-serif text-3xl leading-[0.98] sm:text-4xl">
              Sua beleza, no seu melhor momento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:p-6 lg:grid-cols-1">
          {categorias.map(([nome, imagem]) => (
            <div
              key={nome}
              className="grid min-h-24 grid-cols-[5.5rem_1fr] items-center overflow-hidden rounded-xl border border-[#e4dcd4] bg-white"
            >
              <div className="relative h-full min-h-24">
                <Image src={imagem} alt="" fill sizes="90px" className="object-cover" />
              </div>
              <span className="px-4 font-serif text-lg leading-tight">{nome}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="border-t border-[#e4dcd4] bg-white px-5 py-4 text-xs text-[#8a7c74] sm:px-7">
        Identidade, imagens e categorias presentes na demonstração oficial do produto.
      </figcaption>
    </figure>
  );
}

export default function SalaoEsteticaPage() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,6rem)]"
        aria-labelledby="studio-beauty-titulo"
      >
        <LabBackdrop />
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <p className="tecnica text-signal">PRODUTO DIGITAL WHITE-LABEL / STUDIO BEAUTY</p>
              <h1
                id="studio-beauty-titulo"
                className="mt-8 max-w-[13ch] text-[clamp(2.4rem,5.2vw,4.6rem)] leading-[0.98] tracking-[-0.05em]"
              >
                A experiência do estúdio, antes e depois do atendimento.
              </h1>
              <p className="medida-texto mt-8 text-[1.1rem] leading-relaxed text-mineral">
                Site, agendamento, portfólio, histórico e gestão reunidos em uma plataforma
                adaptada à identidade e à rotina de espaços de estética e beleza.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/projects/salao-estetica/formulario"
                  className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-5 text-ink transition-colors hover:bg-signal-pale"
                >
                  Quero para meu estúdio
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href={DEMONSTRACAO}
                  target="_blank"
                  rel="noreferrer"
                  className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors hover:border-signal hover:text-signal"
                >
                  Ver demonstração
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
              <p className="medida-texto mt-5 max-w-[58ch] rounded-2xl bg-ink px-4 py-3 text-sm leading-relaxed text-paper">
                <strong>7 dias de garantia.</strong> Dentro desse prazo, você pode cancelar a
                contratação e solicitar a devolução do valor pago.
              </p>
            </div>

            <Reveal className="lg:col-span-6">
              <BeautyStudioPreview />
            </Reveal>
          </div>
        </Container>
      </section>

      <Section indice="01 / PARA QUEM É" rotuladaPor="publico-beauty-titulo">
        <ProductAudience
          id="publico-beauty-titulo"
          title="Para negócios de beleza que precisam de uma experiência própria, não de um marketplace."
          introduction="Cada implantação representa um único estúdio e pode começar pequena ou acompanhar uma operação com equipe, unidades e diferentes especialidades."
          audiences={publicos}
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {especialidades.map(([titulo, texto], index) => (
            <Reveal key={titulo}>
              <article className="h-full rounded-[var(--radius-panel)] border border-line bg-surface/60 p-6">
                <span className="tecnica text-signal">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="mt-8 text-[1.45rem] tracking-[-0.035em]">{titulo}</h2>
                <p className="mt-4 text-sm leading-relaxed text-mineral">{texto}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section indice="02 / EXPERIÊNCIAS" rotuladaPor="experiencias-beauty-titulo">
        <TituloSecao id="experiencias-beauty-titulo" className="max-w-[18ch]">
          Cada pessoa vê aquilo que precisa para trabalhar ou ser atendida.
        </TituloSecao>
        <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line md:grid-cols-2">
          {experiencias.map((item, index) => (
            <article key={item.titulo} className="bg-surface p-6 sm:p-8">
              <span className="tecnica text-signal">0{index + 1}</span>
              <h2 className="mt-7 text-[1.6rem] leading-tight tracking-[-0.035em]">{item.titulo}</h2>
              <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-mineral">{item.texto}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section indice="03 / PRODUTO REAL" rotuladaPor="demonstracao-beauty-titulo">
        <TituloSecao id="demonstracao-beauty-titulo">
          Dez telas reais para conhecer a experiência do sistema.
        </TituloSecao>
        <ProductGallery slides={demonstracoes} />
        <p className="medida-texto mt-8 max-w-[72ch] text-sm leading-relaxed text-mineral-dim">
          Lumi Beauty Studio é a marca fictícia da demonstração. Nomes, números, profissionais e
          demais dados servem apenas para apresentar o produto e são substituídos na implantação.
        </p>
      </Section>

      <Section indice="04 / AGENDAMENTO" rotuladaPor="agendamento-beauty-titulo">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <TituloSecao id="agendamento-beauty-titulo">
              Uma agenda capaz de organizar serviços combinados.
            </TituloSecao>
            <p className="medida-texto mt-6 text-[1rem] leading-relaxed text-mineral">
              Para eventos, a cliente informa quando precisa estar pronta. A plataforma calcula o
              início e monta uma sequência que respeita durações, preparo e disponibilidade.
            </p>
          </div>
          <ol className="lg:col-span-6 lg:col-start-7">
            {jornada.map(([titulo, texto], index) => (
              <li key={titulo} className="grid gap-3 border-t border-line py-6 last:border-b sm:grid-cols-[3rem_1fr]">
                <span className="tecnica text-signal">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2 className="text-[1.25rem] tracking-[-0.03em]">{titulo}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-mineral">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="medida-texto mt-8 max-w-[72ch] text-sm leading-relaxed text-mineral-dim">
          A demonstração não processa pagamentos. O acerto acontece no estúdio conforme as formas
          aceitas e as políticas definidas pelo estabelecimento.
        </p>
      </Section>

      <Section indice="05 / IDENTIDADE E ADAPTAÇÃO" rotuladaPor="adaptacao-beauty-titulo">
        <div className="grid gap-10 lg:grid-cols-12">
          <TituloSecao id="adaptacao-beauty-titulo" className="lg:col-span-5">
            A base se adapta à identidade e ao jeito de atender do seu estúdio.
          </TituloSecao>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral">
              A demonstração apresenta a estrutura funcional. Na implantação, conteúdo, regras,
              equipe e módulos são configurados com as informações autorizadas pelo contratante.
            </p>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line">
              {personalizacoes.map((item) => (
                <li key={item} className="flex gap-3 bg-surface px-5 py-4 text-sm leading-relaxed text-mineral">
                  <span aria-hidden="true" className="mt-[0.55em] size-1 flex-none rounded-full bg-signal" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section indice="06 / FORMULÁRIO" rotuladaPor="formulario-beauty-titulo">
        <ProjectFormCard slug="salao-estetica" />
      </Section>

      <Section className="pb-[clamp(4rem,10vw,10rem)]" rotuladaPor="cta-beauty-titulo">
        <Reveal>
          <div className="rounded-[var(--radius-panel)] border border-line-strong bg-raised px-6 py-10 sm:px-10 sm:py-14">
            <p className="tecnica text-signal">STUDIO BEAUTY / BLAJEEN LABS</p>
            <h2 id="cta-beauty-titulo" className="mt-6 max-w-[17ch] text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.02] tracking-[-0.05em]">
              Uma plataforma com a assinatura do seu estúdio.
            </h2>
            <p className="medida-texto mt-6 max-w-[64ch] text-[1rem] leading-relaxed text-mineral">
              Conte como sua operação funciona. A experiência será preparada para sua marca, seus
              serviços, sua equipe e as prioridades reais do atendimento.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/projects/salao-estetica/formulario" className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-5 text-ink transition-colors hover:bg-signal-pale">
                Preencher formulário <span aria-hidden="true">→</span>
              </Link>
              <a href={DEMONSTRACAO} target="_blank" rel="noreferrer" className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors hover:border-signal hover:text-signal">
                Abrir demonstração <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
