import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { ProductGallery } from '@/components/projects/ProductGallery';
import { ProductAudience } from '@/components/projects/ProductAudience';
import { ProjectFormCard } from '@/components/projects/ProjectFormCard';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

const DEMONSTRACAO = 'https://site-barbearia-blajeen-labs.vercel.app';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Barbearia',
  descricao:
    'Plataforma white-label para barbearias com site institucional, agendamento online e gestão da operação.',
  rota: ROTAS.barbearia,
});

const jornadas = [
  {
    numero: '01',
    titulo: 'Experiência do cliente',
    texto:
      'Um site com a identidade da barbearia e um agendamento direto, sem criação de conta: unidade, profissional, serviço, data, horário e confirmação.',
    imagem: '/projects/barbearia/screenshots-padronizados/03-escolha-profissional.png',
    alt: 'Seleção de data e horário no agendamento online da plataforma para barbearias.',
  },
  {
    numero: '02',
    titulo: 'Rotina da equipe',
    texto:
      'Agenda centralizada por unidade e profissional para acompanhar os atendimentos e manter a operação organizada.',
    imagem: '/projects/barbearia/screenshots-padronizados/05-gestao-agenda.png',
    alt: 'Agenda geral da plataforma com filtros por unidade e profissional.',
  },
  {
    numero: '03',
    titulo: 'Controle do produto',
    texto:
      'Marca, conteúdo, imagens, cores, tipografia e regras de agendamento configurados em uma área própria de gestão.',
    imagem: '/projects/barbearia/screenshots-padronizados/10-configuracao-produto.png',
    alt: 'Painel de personalização da marca e das imagens da plataforma para barbearias.',
  },
] as const;

const demonstracoes = [
  {
    imagem: '/projects/barbearia/screenshots-padronizados/01-site-institucional.png',
    alt: 'Página inicial pública da demonstração, com identidade visual e chamada para agendamento.',
    legenda: 'Site público: marca, serviços, equipe, unidades e acesso direto ao agendamento.',
    largura: 1600,
    altura: 900,
  },
  {
    imagem: '/projects/barbearia/screenshots-padronizados/02-agendamento.png',
    alt: 'Etapa de escolha de profissional no fluxo de agendamento.',
    legenda: 'Agendamento: escolha de profissional ou opção pelo primeiro horário disponível.',
    largura: 1600,
    altura: 900,
  },
  {
    imagem: '/projects/barbearia/screenshots-padronizados/03-escolha-profissional.png',
    alt: 'Etapa de escolha de data e horário no fluxo de agendamento.',
    legenda: 'Agendamento: datas e horários disponíveis apresentados em uma jornada objetiva.',
    largura: 1600,
    altura: 900,
  },
  {
    imagem: '/projects/barbearia/screenshots-padronizados/04-gestao-resumo.png',
    alt: 'Resumo diário da gestão da barbearia.',
    legenda: 'Gestão: resumo do dia, ocupação por profissional e próximos atendimentos.',
    largura: 1600,
    altura: 900,
  },
  {
    imagem: '/projects/barbearia/screenshots-padronizados/05-gestao-agenda.png',
    alt: 'Agenda geral da gestão com filtros operacionais.',
    legenda: 'Gestão: agenda geral com filtros por data, unidade e profissional.',
    largura: 1600,
    altura: 900,
  },
  {
    imagem: '/projects/barbearia/screenshots-padronizados/06-gestao-clientes.png',
    alt: 'Gestão da carteira de clientes da barbearia.',
    legenda: 'Gestão: clientes, contatos e histórico reunidos para a equipe.',
    largura: 1600,
    altura: 900,
  },
  {
    imagem: '/projects/barbearia/screenshots-padronizados/07-gestao-profissionais.png',
    alt: 'Gestão dos profissionais da barbearia.',
    legenda: 'Gestão: equipe, especialidades e disponibilidade por profissional.',
    largura: 1600,
    altura: 900,
  },
  {
    imagem: '/projects/barbearia/screenshots-padronizados/08-gestao-servicos.png',
    alt: 'Gestão dos serviços oferecidos pela barbearia.',
    legenda: 'Gestão: serviços, valores, durações e disponibilidade para agendamento.',
    largura: 1600,
    altura: 900,
  },
  {
    imagem: '/projects/barbearia/screenshots-padronizados/09-gestao-unidades.png',
    alt: 'Gestão das unidades da barbearia.',
    legenda: 'Gestão: unidades, endereços, horários e canais de contato.',
    largura: 1600,
    altura: 900,
  },
  {
    imagem: '/projects/barbearia/screenshots-padronizados/10-configuracao-produto.png',
    alt: 'Configuração white-label do produto para a barbearia.',
    legenda: 'Produto: marca, conteúdo, WhatsApp e regras ajustados para cada implantação.',
    largura: 1600,
    altura: 900,
  },
] as const;

const publicos = [
  {
    title: 'Barbeiro proprietário',
    text: 'Para quem atende e também administra o negócio, precisa reduzir mensagens manuais e quer uma presença digital profissional.',
  },
  {
    title: 'Barbearia com equipe ou unidades',
    text: 'Para donos e gestores que precisam centralizar profissionais, serviços, horários, clientes e diferentes locais de atendimento.',
  },
] as const;

const personalizacoes = [
  'Nome, logotipo, cores, tipografia e imagens.',
  'Textos, seções do site público e contato pelo WhatsApp.',
  'Unidades, profissionais, serviços, valores e durações.',
  'Horários, antecedência, intervalos e regras de cancelamento.',
  'Dados iniciais autorizados pela barbearia contratante.',
] as const;

export default function BarbeariaPage() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,6rem)]"
        aria-labelledby="barbearia-titulo"
      >
        <LabBackdrop />
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <p className="tecnica text-signal">PRODUTO DIGITAL WHITE-LABEL / BARBEARIAS</p>
              <h1
                id="barbearia-titulo"
                className="mt-8 max-w-[14ch] text-[clamp(2.4rem,5.2vw,4.6rem)] leading-[0.98] tracking-[-0.05em]"
              >
                Sua barbearia. Sua marca. Uma operação conectada.
              </h1>
              <p className="medida-texto mt-8 text-[1.1rem] leading-relaxed text-mineral">
                Site institucional, agendamento online e gestão reunidos em uma plataforma adaptada
                às necessidades, à identidade e às regras de uma barbearia real.
              </p>
              <p className="tecnica mt-6 inline-flex items-center gap-3 rounded-full border border-line-strong px-4 py-2 text-paper">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" />
                O cliente agenda sem criar conta
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/projects/barbearia/formulario"
                  className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-5 text-ink transition-colors duration-150 hover:bg-signal-pale"
                >
                  Quero para minha barbearia
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href={DEMONSTRACAO}
                  target="_blank"
                  rel="noreferrer"
                  className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
                >
                  Ver demonstração
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
              <p className="medida-texto mt-5 max-w-[58ch] rounded-2xl bg-ink px-4 py-3 text-sm leading-relaxed text-paper">
                <strong>7 dias de garantia.</strong> Dentro desse prazo, você
                pode cancelar a contratação e solicitar a devolução do valor pago.
              </p>
            </div>

            <Reveal className="lg:col-span-6">
              <figure className="overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised">
                <Image
                  src="/projects/barbearia/screenshots-padronizados/04-gestao-resumo.png"
                  alt="Resumo diário da gestão na plataforma para barbearias."
                  width={1600}
                  height={900}
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="h-auto w-full"
                />
                <figcaption className="tecnica border-t border-line px-5 py-4 text-mineral-dim">
                  Gestão diária: operação, equipe e próximos atendimentos em uma única visão.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      <Section indice="01 / PARA QUEM É" rotuladaPor="publico-barbearia-titulo">
        <ProductAudience
          id="publico-barbearia-titulo"
          title="Para barbearias que querem atender melhor sem perder a própria identidade."
          introduction="O produto se adapta tanto ao profissional que trabalha sozinho quanto a operações com equipe e mais de uma unidade."
          audiences={publicos}
        />
      </Section>

      <Section
        indice="02 / JORNADAS"
        rotuladaPor="jornadas-titulo"
        className="relative isolate overflow-hidden"
      >
        <LabBackdrop lado="esquerda" />
        <TituloSecao id="jornadas-titulo" className="max-w-[18ch]">
          Cliente, equipe e produto no mesmo ecossistema.
        </TituloSecao>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {jornadas.map((jornada) => (
            <Reveal key={jornada.titulo}>
              <article className="h-full overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised/60">
                <div className="aspect-[16/9] overflow-hidden border-b border-line bg-surface">
                  <Image
                    src={jornada.imagem}
                    alt={jornada.alt}
                    width={1600}
                    height={900}
                    sizes="(min-width: 1024px) 32vw, 100vw"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="p-6">
                  <p className="tecnica text-signal">{jornada.numero}</p>
                  <h2 className="mt-5 text-[1.65rem] leading-[1.05] tracking-[-0.04em]">
                    {jornada.titulo}
                  </h2>
                  <p className="mt-5 text-sm leading-relaxed text-mineral">{jornada.texto}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section indice="03 / BASE E PERSONALIZAÇÃO" rotuladaPor="personalizacao-barbearia-titulo">
        <div className="grid gap-10 lg:grid-cols-12">
          <TituloSecao id="personalizacao-barbearia-titulo" className="lg:col-span-5">
            Uma base própria para a identidade e a operação da sua barbearia.
          </TituloSecao>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral">
              Cada versão representa um único negócio, com domínio, marca, conteúdo, equipe e regras
              próprias. A demonstração mostra o alcance do produto; na implantação, cada elemento é
              ajustado com informações fornecidas e autorizadas pela barbearia.
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

      <Section indice="04 / PRODUTO REAL" rotuladaPor="demonstracao-barbearia-titulo">
        <TituloSecao id="demonstracao-barbearia-titulo">
          Dez telas reais para conhecer o produto por dentro.
        </TituloSecao>
        <ProductGallery slides={demonstracoes} />
        <p className="medida-texto mt-8 max-w-[70ch] text-sm leading-relaxed text-mineral-dim">
          Os nomes, números, horários e demais dados exibidos pertencem ao ambiente demonstrativo e
          são fictícios. A plataforma organiza o agendamento; pagamentos são realizados diretamente
          no estabelecimento.
        </p>
      </Section>

      <Section indice="05 / FORMULÁRIO" rotuladaPor="formulario-barbearia-titulo">
        <ProjectFormCard slug="barbearia" />
      </Section>

      <Section className="pb-[clamp(4rem,10vw,10rem)]" rotuladaPor="cta-barbearia-titulo">
        <Reveal>
          <div className="rounded-[var(--radius-panel)] border border-line-strong bg-raised px-6 py-10 sm:px-10 sm:py-14">
            <p className="tecnica text-signal">PLATAFORMA PARA BARBEARIAS / BLAJEEN LABS</p>
            <h2
              id="cta-barbearia-titulo"
              className="mt-6 max-w-[17ch] text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.02] tracking-[-0.05em]"
            >
              Sua presença digital pode trabalhar junto com a sua agenda.
            </h2>
            <p className="medida-texto mt-6 max-w-[62ch] text-[1rem] leading-relaxed text-mineral">
              Conte à Blajeen Labs como sua barbearia funciona. A plataforma será preparada para
              representar sua marca, seus serviços, sua equipe e sua rotina.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/projects/barbearia/formulario"
                className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-5 text-ink transition-colors duration-150 hover:bg-signal-pale"
              >
                Solicitar personalização
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href={DEMONSTRACAO}
                target="_blank"
                rel="noreferrer"
                className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
              >
                Abrir demonstração
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
