import type { Metadata } from 'next';
import Image from 'next/image';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { planilhaFinanceira } from '@/content/produtos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Planilha de Controle Financeiro | Blajeen Labs',
  descricao:
    'Planilha de controle financeiro pessoal para Google Sheets. Solicite uma licença por e-mail, receba seu código e faça uma cópia no seu próprio Google Drive.',
  rota: ROTAS.produtoPlanilhaFinanceira,
});

export default function PlanilhaFinanceiraPage() {
  const p = planilhaFinanceira;
  const solicitarLicencaHref =
    'mailto:brg.ftw@gmail.com?subject=Solicita%C3%A7%C3%A3o%20de%20licen%C3%A7a%20%E2%80%94%20Planilha%20Financeira%20Blajeen&body=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20licen%C3%A7a%20para%20a%20Planilha%20de%20Controle%20Financeiro%20da%20Blajeen%20Labs.';

  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">{p.estado} / GOOGLE SHEETS</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h1 className="max-w-[16ch] text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.94] tracking-[-0.06em]">
                {p.nome}
              </h1>
              <p className="mt-5 max-w-[28ch] text-[clamp(1.2rem,2.2vw,1.8rem)] leading-[1.15] tracking-[-0.03em] text-paper/85">
                {p.lema}
              </p>
            </div>
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral lg:col-span-3 lg:col-start-10 lg:pb-2">
              {p.resumo}
            </p>
          </div>
        </Container>
      </header>

      {/* ---------------------------------------------------------------- licença */}
      <Section indice="01 / SOLICITAR LICENÇA" rotulo="Solicitar e ativar">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="flex flex-col rounded-[var(--radius-panel)] border border-signal/40 bg-raised/80 p-7 sm:p-9">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[1.5rem] leading-none tracking-[-0.03em]">Solicite seu código</h2>
              <span className="tecnica text-signal">PASSO 01</span>
            </div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-mineral">
              Envie um e-mail para{' '}
              <strong className="font-medium text-paper">brg.ftw@gmail.com</strong> solicitando uma
              licença da Planilha de Controle Financeiro. A Blajeen responde com o código que será
              usado para ativar sua cópia.
            </p>
            <a
              href={solicitarLicencaHref}
              className="alvo-toque tecnica mt-7 inline-flex items-center justify-center rounded-full bg-signal px-5 text-ink hover:bg-glow"
            >
              SOLICITAR LICENÇA POR E-MAIL →
            </a>
          </article>

          <article className="flex flex-col rounded-[var(--radius-panel)] border border-line bg-raised/50 p-7 sm:p-9">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[1.5rem] leading-none tracking-[-0.03em]">Já recebeu a licença?</h2>
              <span className="tecnica text-mineral">PASSO 02</span>
            </div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-mineral">
              Faça uma cópia no seu Google Drive. Depois de abrir a cópia, use o menu{' '}
              <strong className="font-medium text-paper">Blajeen → Ativar licença</strong> e cole o
              código recebido por e-mail. A planilha original da Blajeen não é alterada.
            </p>
            <a
              href={p.links.copiar}
              target="_blank"
              rel="noreferrer"
              className="alvo-toque tecnica mt-7 inline-flex items-center justify-center rounded-full border border-line-strong px-5 text-paper hover:border-signal/40"
            >
              JÁ TENHO A LICENÇA — FAZER UMA CÓPIA →
            </a>
          </article>
        </div>

        <div className="mt-8 rounded-[var(--radius-control)] border border-line bg-raised/40 p-6 sm:p-7">
          <h3 className="text-[1rem] leading-snug tracking-[-0.02em]">Como a ativação funciona</h3>
          <ol className="medida-texto mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-mineral">
            <li>Solicite a licença pelo e-mail acima.</li>
            <li>Receba da Blajeen um código individual de ativação.</li>
            <li>Faça a sua cópia da planilha no Google Drive.</li>
            <li>Na cópia, abra Blajeen → Ativar licença e cole o código.</li>
          </ol>
          <p className="medida-texto mt-4 text-xs leading-relaxed text-mineral-dim">
            Seus lançamentos ficam na sua própria planilha do Google Drive. Quando você usa uma
            automação protegida, a planilha envia ao serviço da Blajeen somente os dados necessários
            para validar a licença e executar aquela ação.
          </p>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- o que é */}
      <Section indice="02 / O QUE É" rotulo="O que a planilha é">
        <figure className="mb-12">
          <Image
            src={p.imagem.src}
            alt={p.imagem.alt}
            width={958}
            height={872}
            className="mx-auto w-full max-w-[958px] rounded-[var(--radius-panel)] border border-line"
          />
          <figcaption className="mt-4 text-xs leading-relaxed text-mineral-dim">
            {p.imagem.legenda}
          </figcaption>
        </figure>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {p.descricao.map((paragrafo) => (
              <p
                key={paragrafo.slice(0, 32)}
                className="mb-5 text-[1.05rem] leading-relaxed text-paper/80"
              >
                {paragrafo}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.faz.map((item) => (
            <article
              key={item.titulo}
              className="rounded-[var(--radius-control)] border border-line bg-raised/50 p-6"
            >
              <h3 className="text-[1.05rem] leading-snug tracking-[-0.02em]">{item.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mineral">{item.texto}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- as abas */}
      <Section indice="03 / O QUE CADA ABA FAZ" rotulo="As abas da planilha">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <p className="medida-texto text-[1.05rem] leading-relaxed text-paper/80 lg:col-span-4">
            São sete abas, e você mexe em três. As outras quatro só mostram o resultado do que
            você escreveu.
          </p>
          <dl className="grid gap-3 lg:col-span-7 lg:col-start-6">
            {p.abas.map((aba) => (
              <div key={aba.nome} className="border-b border-line pb-3">
                <dt className="text-sm font-medium text-paper">{aba.nome}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-mineral">{aba.texto}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- como usar */}
      <Section indice="04 / COMO USAR" rotulo="Como usar a planilha">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {p.comoUsar.map((etapa, i) => (
            <li
              key={etapa.passo}
              className="rounded-[var(--radius-control)] border border-line bg-raised/50 p-6"
            >
              <span aria-hidden="true" className="tecnica text-signal">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-[1rem] leading-snug tracking-[-0.02em]">{etapa.passo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mineral">{etapa.texto}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ---------------------------------------------------------------- as regras */}
      <Section
        indice="05 / TRÊS REGRAS QUE FAZEM DIFERENÇA"
        rotulo="As regras da planilha"
        className="pb-[clamp(4rem,9vw,9rem)]"
      >
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <p className="medida-texto text-[1.05rem] leading-relaxed text-paper/80 lg:col-span-4">
            Planilha de finanças não costuma ser abandonada por ser difícil. É abandonada porque
            os números param de bater e ninguém sabe por quê. Estas três evitam quase todos esses
            casos.
          </p>
          <ul className="grid gap-3 lg:col-span-7 lg:col-start-6">
            {p.regras.map((regra) => (
              <li key={regra.titulo} className="border-b border-line pb-4">
                <p className="text-sm font-medium text-paper">{regra.titulo}</p>
                <p className="mt-1 text-sm leading-relaxed text-mineral">{regra.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
