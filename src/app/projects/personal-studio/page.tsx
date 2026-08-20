import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { ProductGallery } from '@/components/projects/ProductGallery';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Personal Studio',
  descricao:
    'Plataforma white-label demonstrativa para personal trainers autônomos e estúdios de treinamento.',
  rota: ROTAS.personalStudio,
});

const experiencias = [
  {
    titulo: 'Área do aluno',
    texto: 'Agenda, próximos treinos, exercícios, plano e evolução em uma experiência responsiva, pensada para o uso diário.',
    imagem: '/projects/personal-studio/mockup-area-aluno.png',
    alt: 'Área do aluno do Personal Studio exibida em um smartphone.',
  },
  {
    titulo: 'Portal do personal',
    texto: 'Agenda, carteira de alunos, prescrição de treinos e acompanhamento reunidos em um único painel.',
    imagem: '/projects/personal-studio/mockup-area-personal.png',
    alt: 'Portal do personal do Personal Studio exibido em um notebook.',
  },
  {
    titulo: 'Painel do gestor',
    texto: 'Agenda, equipe, alunos e alertas operacionais em uma visão centralizada para a gestão do estúdio.',
    imagem: '/projects/personal-studio/mockup-painel-gestor.png',
    alt: 'Painel de gestão do Personal Studio exibido em um monitor.',
  },
] as const;

const demonstracoes = [
  {
    imagem: '/projects/personal-studio/screenshots-v2/01-aluno-agendamento.png',
    alt: 'Fluxo de novo agendamento da área do aluno, com seleção de serviço.',
    legenda: 'Aluno: novo agendamento com serviços, profissionais, horários e confirmação.',
    largura: 1912,
    altura: 914,
  },
  {
    imagem: '/projects/personal-studio/screenshots-v2/02-aluno-meu-treino.png',
    alt: 'Treino prescrito para o aluno, com exercícios, séries, cargas e descansos.',
    legenda: 'Aluno: treino completo com exercícios, séries, cargas e registro de execução.',
    largura: 1897,
    altura: 907,
  },
  {
    imagem: '/projects/personal-studio/screenshots-v2/03-aluno-evolucao.png',
    alt: 'Painel de evolução do aluno com indicadores de peso, força e histórico.',
    legenda: 'Aluno: acompanhamento de evolução com indicadores e histórico visual.',
    largura: 1912,
    altura: 914,
  },
  {
    imagem: '/projects/personal-studio/screenshots-v2/04-aluno-plano-perfil.png',
    alt: 'Plano ativo e perfil do aluno com sessões disponíveis e dados pessoais.',
    legenda: 'Aluno: plano contratado, sessões disponíveis e perfil em uma única visão.',
    largura: 1912,
    altura: 914,
  },
  {
    imagem: '/projects/personal-studio/screenshots-v2/05-personal-bloqueio-agenda.png',
    alt: 'Formulário para o personal bloquear um período da própria agenda.',
    legenda: 'Personal: bloqueio de agenda por unidade, data, horário e motivo.',
    largura: 1912,
    altura: 914,
  },
  {
    imagem: '/projects/personal-studio/screenshots-v2/06-personal-prescricao.png',
    alt: 'Prescrição detalhada do personal com exercícios organizados por aluno.',
    legenda: 'Personal: prescrição organizada com exercícios, séries, cargas e descansos.',
    largura: 1912,
    altura: 914,
  },
  {
    imagem: '/projects/personal-studio/screenshots-v2/07-gestor-alunos.png',
    alt: 'Gestão de alunos com busca, objetivos, planos, profissionais e status.',
    legenda: 'Gestor: carteira de alunos com busca, planos, responsáveis e ações rápidas.',
    largura: 1897,
    altura: 907,
  },
  {
    imagem: '/projects/personal-studio/screenshots-v2/08-produto-identidade-marca.png',
    alt: 'Configuração white-label da identidade visual com pré-visualização ao vivo.',
    legenda: 'Produto: identidade, cores e imagens configuradas com preview ao vivo.',
    largura: 1897,
    altura: 907,
  },
] as const;

const personalizacoes = [
  'Nome, logotipo e identidade visual.',
  'Cores, imagens e conteúdo institucional.',
  'Contatos, profissionais, alunos e unidades.',
  'Serviços, planos, horários e regras de agendamento.',
  'Áreas, permissões e dados iniciais autorizados pelo contratante.',
] as const;

export default function PersonalStudioPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,6rem)]" aria-labelledby="personal-studio-titulo">
        <LabBackdrop />
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <p className="tecnica text-signal">PRODUTO DIGITAL WHITE-LABEL / FITNESS</p>
              <h1
                id="personal-studio-titulo"
                className="mt-8 max-w-[14ch] text-[clamp(2.4rem,5.2vw,4.6rem)] leading-[0.98] tracking-[-0.05em]"
              >
                Seu negócio fitness. Sua marca. Uma plataforma completa.
              </h1>
              <p className="medida-texto mt-8 text-[1.1rem] leading-relaxed text-mineral">
                O Personal Studio reúne presença digital, experiência do aluno e gestão da operação
                em um produto adaptado às necessidades, à identidade e às regras do seu negócio.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href={`${ROTAS.contato}?produto=personal-studio#interesse`}
                  className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-5 text-ink transition-colors duration-150 hover:bg-signal-pale"
                >
                  Quero meu Personal Studio
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href="https://site-personal-trainer-xi.vercel.app"
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
                  src="/projects/personal-studio/mockup-painel-gestor.png"
                  alt="Painel de gestão do Personal Studio exibido em um monitor."
                  width={1536}
                  height={1024}
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="h-auto w-full"
                />
                <figcaption className="tecnica border-t border-line px-5 py-4 text-mineral-dim">
                  Painel do gestor: uma visão centralizada da operação.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      <Section indice="01 / TRÊS EXPERIÊNCIAS" rotuladaPor="experiencias-titulo" className="relative isolate overflow-hidden">
        <LabBackdrop lado="esquerda" />
        <TituloSecao id="experiencias-titulo" className="max-w-[18ch]">
          Aluno, personal e gestor conectados.
        </TituloSecao>
        <div className="mt-12 flex flex-col gap-[clamp(3rem,7vw,7rem)] sm:mt-16">
          {experiencias.map((experiencia, indice) => (
            <Reveal key={experiencia.titulo}>
              <article className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <div className={indice % 2 === 0 ? 'lg:col-span-5' : 'lg:col-span-5 lg:col-start-8 lg:row-start-1'}>
                  <p className="tecnica text-signal">0{indice + 1}</p>
                  <h2 className="mt-5 text-[clamp(1.7rem,3.6vw,3rem)] leading-[1.04] tracking-[-0.045em]">{experiencia.titulo}</h2>
                  <p className="medida-texto mt-5 text-[1rem] leading-relaxed text-mineral">{experiencia.texto}</p>
                </div>
                <figure className={indice % 2 === 0 ? 'lg:col-span-6 lg:col-start-7' : 'lg:col-span-6 lg:col-start-1'}>
                  <Image
                    src={experiencia.imagem}
                    alt={experiencia.alt}
                    width={1536}
                    height={1024}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="h-auto w-full rounded-[var(--radius-panel)] border border-line bg-raised"
                  />
                </figure>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section indice="02 / BASE E PERSONALIZAÇÃO" rotuladaPor="personalizacao-titulo">
        <div className="grid gap-10 lg:grid-cols-12">
          <TituloSecao id="personalizacao-titulo" className="lg:col-span-5">
            Uma base funcional, adaptada ao seu negócio.
          </TituloSecao>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral">
              O Personal Studio evita começar do zero: a estrutura demonstrativa já conecta presença
              digital, atendimento e gestão. Nome, identidade, conteúdo, equipe, serviços, planos,
              horários e regras são ajustados com os dados autorizados pelo contratante.
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

      <Section indice="03 / PRODUTO REAL" rotuladaPor="demonstracao-titulo">
        <TituloSecao id="demonstracao-titulo">Uma demonstração para explorar antes de personalizar.</TituloSecao>
        <ProductGallery slides={demonstracoes} />
        <p className="medida-texto mt-8 max-w-[68ch] text-sm leading-relaxed text-mineral-dim">
          Os dados, nomes e indicadores mostrados na demonstração são fictícios e existem apenas para apresentar o potencial da plataforma. Eles serão substituídos por informações autorizadas na versão personalizada.
        </p>
      </Section>

      <Section className="pb-[clamp(4rem,10vw,10rem)]" rotuladaPor="cta-titulo">
        <Reveal>
          <div className="rounded-[var(--radius-panel)] border border-line-strong bg-raised px-6 py-10 sm:px-10 sm:py-14">
            <p className="tecnica text-signal">PERSONAL STUDIO / BLAJEEN LABS</p>
            <h2 id="cta-titulo" className="mt-6 max-w-[16ch] text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.02] tracking-[-0.05em]">
              Uma base pronta. Uma experiência com a identidade do seu negócio.
            </h2>
            <p className="medida-texto mt-6 max-w-[62ch] text-[1rem] leading-relaxed text-mineral">
              Conte à Blajeen Labs como você trabalha. A plataforma será adaptada para representar sua marca, equipe, serviços e rotina real.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={`${ROTAS.contato}?produto=personal-studio#interesse`}
                className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-5 text-ink transition-colors duration-150 hover:bg-signal-pale"
              >
                Solicitar personalização
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="https://site-personal-trainer-xi.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
              >
                Ver demonstração
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
