import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { vivelio } from '@/content/produtos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Vivelio — suas redes sem Reels, Shorts e feed de sugestões | Blajeen Labs',
  descricao:
    'O Vivelio abre Instagram, YouTube, Facebook, X, Reddit, LinkedIn e Pinterest pelo site oficial de cada rede, sem Reels, sem Shorts, sem feed de sugestões e sem anúncios. Sem conta, grátis, e nada passa por um servidor nosso.',
  rota: ROTAS.produtoVivelio,
});

/**
 * Os documentos do app, também aqui.
 *
 * O rodapé não lista as políticas de cada produto, e a gaveta não pode ser o único caminho até
 * elas. A página do produto é onde a pessoa está quando quer saber o que ele faz com os dados.
 */
const documentos = [
  { href: ROTAS.vivelioSuporte, rotulo: 'Suporte do Vivelio' },
  { href: ROTAS.vivelioPrivacidade, rotulo: 'Privacidade do Vivelio' },
  { href: ROTAS.vivelioTermos, rotulo: 'Termos do Vivelio' },
] as const;

export default function VivelioPage() {
  const app = vivelio;
  const telas = [app.imagem, ...app.telas];

  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">{app.estado} / ANDROID E IPHONE</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end [&>*]:min-w-0">
            <div className="lg:col-span-8">
              <h1 className="text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em]">
                {app.nome}
              </h1>
              <p className="mt-5 max-w-[26ch] text-[clamp(1.3rem,2.4vw,2rem)] leading-[1.15] tracking-[-0.03em] text-paper/85">
                {app.lema}
              </p>
            </div>
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral lg:col-span-3 lg:col-start-10 lg:pb-2">
              {app.resumo}
            </p>
          </div>
        </Container>
      </header>

      {/* ---------------------------------------------------------------- instalar */}
      <Section indice="01 / INSTALAR" rotulo="Instalar o Vivelio">
        {/* Sem botão enquanto a ficha não existe. Um botão de loja que abre uma página de
            erro custa a confiança da pessoa logo no primeiro clique. */}
        <div className="grid gap-4 sm:grid-cols-2">
          {app.lojas.map((loja) => (
            <article
              key={loja.nome}
              className="flex flex-col rounded-[var(--radius-panel)] border border-line bg-raised/50 p-7"
            >
              <h2 className="text-[1.5rem] leading-none tracking-[-0.03em]">{loja.nome}</h2>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-mineral">{loja.nota}</p>
              {loja.url ? (
                <a
                  href={loja.url}
                  target="_blank"
                  rel="noreferrer"
                  className="alvo-toque tecnica mt-7 inline-flex items-center justify-center rounded-full bg-signal px-5 text-ink hover:bg-glow"
                >
                  ABRIR NA {loja.nome.toUpperCase()} →
                </a>
              ) : (
                <span className="tecnica mt-7 inline-flex items-center justify-center rounded-full border border-line px-5 py-3 text-mineral-dim">
                  LINK AINDA NÃO PUBLICADO
                </span>
              )}
            </article>
          ))}
        </div>

        <p className="mt-6 text-xs text-mineral-dim">
          {/* Uma frase só, e não pedaços: a versão em inglês troca o texto por frase inteira. */}
          {`Versão ${app.versao}, para ${app.requisitos}.`}
        </p>

        {/* O plano fica junto da instalação, e não no fim: é aqui que a pessoa decide se
            vale instalar, e ela precisa saber o que é grátis antes disso. */}
        <div className="mt-8 grid gap-6 rounded-[var(--radius-panel)] border border-line bg-raised/50 p-7 sm:p-10 lg:grid-cols-12">
          <h2 className="text-[1.4rem] leading-snug tracking-[-0.03em] lg:col-span-4">
            {app.plano.titulo}
          </h2>
          <p className="medida-texto text-sm leading-relaxed text-mineral lg:col-span-7 lg:col-start-6">
            {app.plano.texto}
          </p>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- o que é */}
      <Section indice="02 / O QUE É" rotulo="O que o Vivelio é">
        {/* Prints de celular, em pé e inteiros: lado a lado no computador, dois por linha no
            celular. Nenhum é recortado pra caber numa proporção de janela. */}
        <div className="mb-12 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
          {telas.map((tela, i) => (
            <figure key={tela.src} className="min-w-0">
              <Image
                src={tela.src}
                alt={tela.alt}
                width={720}
                height={1520}
                sizes="(min-width:1024px) 22vw, 45vw"
                priority={i === 0}
                className="w-full rounded-[var(--radius-control)] border border-line"
              />
              <figcaption className="mt-3 text-xs leading-relaxed text-mineral-dim">
                {tela.legenda}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12 [&>*]:min-w-0">
          <div className="lg:col-span-7">
            {app.descricao.map((paragrafo) => (
              <p key={paragrafo.slice(0, 32)} className="mb-5 text-[1.05rem] leading-relaxed text-paper/80">
                {paragrafo}
              </p>
            ))}
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="tecnica text-mineral-dim">AS REDES</p>
            <ul className="mt-4 grid gap-2">
              {app.redes.map((rede) => (
                <li key={rede} className="border-b border-line pb-2 text-sm text-paper/85">
                  {rede}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {app.faz.map((item) => (
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

      {/* ---------------------------------------------------------------- no aparelho */}
      <Section indice="03 / NO SEU CELULAR" rotulo="O que o Vivelio guarda e lê no celular">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start [&>*]:min-w-0">
          <div className="lg:col-span-4">
            <h2 className="text-[1.4rem] leading-snug tracking-[-0.03em]">{app.noAparelho.titulo}</h2>
            <p className="medida-texto mt-4 text-[1.05rem] leading-relaxed text-paper/80">
              {app.noAparelho.fecho}
            </p>
          </div>
          <ul className="grid gap-3 lg:col-span-7 lg:col-start-6">
            {app.noAparelho.itens.map((linha) => (
              <li
                key={linha.slice(0, 40)}
                className="flex gap-4 border-b border-line pb-3 text-sm leading-relaxed text-mineral"
              >
                <span aria-hidden="true" className="text-signal">
                  —
                </span>
                <span>{linha}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- o que não faz */}
      <Section indice="04 / O QUE ELE SE RECUSA A FAZER" rotulo="O que o Vivelio não faz">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start [&>*]:min-w-0">
          <p className="medida-texto text-[1.05rem] leading-relaxed text-paper/80 lg:col-span-4">
            Um app que fica entre você e as suas redes pede muita confiança. Esta lista existe
            pra você saber onde ele para, antes de instalar.
          </p>
          <ul className="grid gap-3 lg:col-span-7 lg:col-start-6">
            {app.naoFaz.map((linha) => (
              <li
                key={linha.slice(0, 32)}
                className="flex gap-4 border-b border-line pb-3 text-sm leading-relaxed text-mineral"
              >
                <span aria-hidden="true" className="text-signal">
                  —
                </span>
                <span>{linha}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- documentos */}
      <Section
        indice="05 / DOCUMENTOS"
        rotulo="Documentos do Vivelio"
        className="pb-[clamp(4rem,9vw,9rem)]"
      >
        <ul className="flex flex-wrap gap-3">
          {documentos.map((documento) => (
            <li key={documento.href}>
              <Link
                href={documento.href}
                className="alvo-toque tecnica inline-flex items-center rounded-full border border-line-strong px-5 text-paper hover:border-signal/40"
              >
                {documento.rotulo} →
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
