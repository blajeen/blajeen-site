import type { Metadata } from 'next';
import Image from 'next/image';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { BASE_DE_DOWNLOAD, clearlio, PAGINA_DE_RELEASES } from '@/content/produtos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Clearlio — limpeza de disco com desfazer | Blajeen Labs',
  descricao:
    'O Clearlio acha o que não serve mais no seu PC, explica em português e limpa só o que você mandar. Nada é apagado: tudo volta com um clique. Gratuito, sem conta e sem anúncio.',
  rota: ROTAS.produtoClearlio,
});

export default function ClearlioPage() {
  const app = clearlio;
  const podeBaixar = BASE_DE_DOWNLOAD.length > 0;

  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">{app.estado} / WINDOWS</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
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

      {/* ---------------------------------------------------------------- baixar */}
      <Section indice="01 / BAIXAR" rotulo="Baixar o Clearlio">
        {podeBaixar ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {app.arquivos.map((arquivo) => (
              <article
                key={arquivo.id}
                className={[
                  'flex flex-col rounded-[var(--radius-panel)] border p-7',
                  arquivo.recomendado
                    ? 'border-signal/40 bg-raised/80'
                    : 'border-line bg-raised/50',
                ].join(' ')}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-[1.5rem] leading-none tracking-[-0.03em]">{arquivo.nome}</h2>
                  {arquivo.recomendado ? (
                    <span className="tecnica text-signal">RECOMENDADO</span>
                  ) : null}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-mineral">
                  {arquivo.paraQuem}
                </p>
                <a
                  href={`${BASE_DE_DOWNLOAD}/${arquivo.arquivo}`}
                  className={[
                    'alvo-toque tecnica mt-7 inline-flex items-center justify-center rounded-full px-5',
                    arquivo.recomendado
                      ? 'bg-signal text-ink hover:bg-glow'
                      : 'border border-line-strong text-paper hover:border-signal/40',
                  ].join(' ')}
                >
                  BAIXAR · {arquivo.tamanho}
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-panel)] border border-line bg-raised/60 p-7 sm:p-10">
            <p className="tecnica text-mineral">DOWNLOAD EM PREPARAÇÃO</p>
            <p className="medida-texto mt-4 text-[1.05rem] leading-relaxed text-paper/80">
              O programa está pronto e testado. O que falta é publicar os arquivos num endereço
              público — assim que isso acontecer, os três formatos aparecem aqui.
            </p>
          </div>
        )}

        {podeBaixar ? (
          <p className="mt-6 text-xs text-mineral-dim">
            Versão {app.versao}, para {app.requisitos}.{' '}
            <a
              href={PAGINA_DE_RELEASES}
              rel="noreferrer"
              target="_blank"
              className="text-mineral underline decoration-line-strong underline-offset-4 hover:text-paper"
            >
              Ver todas as versões
            </a>
            .
          </p>
        ) : null}

        {/* O aviso vem junto do botão, e não numa nota de rodapé: quem se assusta
            com a tela azul do Windows fecha a aba antes de procurar explicação. */}
        <div className="mt-8 grid gap-8 rounded-[var(--radius-panel)] border border-line bg-raised/50 p-7 sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-[1.4rem] leading-snug tracking-[-0.03em]">
              O Windows vai reclamar. É normal, e passa com dois cliques.
            </h2>
            <p className="medida-texto mt-4 text-sm leading-relaxed text-mineral">
              {app.avisoDoWindows.porque}
            </p>
          </div>

          <ol className="grid gap-4 lg:col-span-6 lg:col-start-7">
            {app.avisoDoWindows.passos.map((passo, i) => (
              <li key={passo.onde} className="flex gap-4 border-b border-line pb-4 last:border-0">
                <span aria-hidden="true" className="tecnica pt-1 text-signal">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-sm font-medium text-paper">{passo.onde}</p>
                  <p className="mt-1 text-sm leading-relaxed text-mineral">
                    {passo.texto.split('**').map((parte, j) =>
                      j % 2 === 1 ? (
                        <strong key={parte} className="font-medium text-paper">
                          {parte}
                        </strong>
                      ) : (
                        parte
                      ),
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
            <caption className="sr-only">
              SHA-256 de cada arquivo publicado do Clearlio {app.versao}
            </caption>
            <thead>
              <tr className="border-b border-line-strong">
                <th scope="col" className="tecnica py-3 pr-6 text-mineral">
                  ARQUIVO
                </th>
                <th scope="col" className="tecnica py-3 text-mineral">
                  SHA-256
                </th>
              </tr>
            </thead>
            <tbody className="font-mono text-mineral-dim">
              {app.arquivos.map((arquivo) => (
                <tr key={arquivo.id} className="border-b border-line align-top">
                  <td className="py-3 pr-6 whitespace-nowrap">{arquivo.arquivo}</td>
                  <td className="py-3 break-all">{arquivo.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- o que é */}
      <Section indice="02 / O QUE É" rotulo="O que o Clearlio é">
        <figure className="mb-12">
          <Image
            src={app.imagem.src}
            alt={app.imagem.alt}
            width={1440}
            height={900}
            className="w-full rounded-[var(--radius-panel)] border border-line"
            priority={false}
          />
          <figcaption className="mt-4 text-xs leading-relaxed text-mineral-dim">
            {app.imagem.legenda}
          </figcaption>
        </figure>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {app.descricao.map((paragrafo) => (
              <p key={paragrafo.slice(0, 32)} className="mb-5 text-[1.05rem] leading-relaxed text-paper/80">
                {paragrafo}
              </p>
            ))}
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

      {/* ---------------------------------------------------------------- o que não faz */}
      <Section
        indice="03 / O QUE ELE SE RECUSA A FAZER"
        rotulo="O que o Clearlio não faz"
        className="pb-[clamp(4rem,9vw,9rem)]"
      >
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <p className="medida-texto text-[1.05rem] leading-relaxed text-paper/80 lg:col-span-4">
            Um limpador de disco pede muita confiança. Esta lista existe pra você saber onde ele
            para, antes de instalar.
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
    </>
  );
}
