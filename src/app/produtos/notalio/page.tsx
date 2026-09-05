import type { Metadata } from 'next';
import Image from 'next/image';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { BASE_DE_DOWNLOAD_NOTALIO, notalio, NOTALIO_DOWNLOAD } from '@/content/produtos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Notalio — bloco de notas que guarda sozinho | Blajeen Labs',
  descricao:
    'Um bloco de notas simples e leve, com dois cadernos que se alternam por um interruptor: texto e tabela. Ele guarda sozinho, e os seus arquivos são um .txt e um .csv comuns. Gratuito, sem conta e sem anúncio.',
  rota: ROTAS.produtoNotalio,
});

/** O negrito do texto vem em `**assim**`, pra o conteúdo não carregar marcação. */
function comDestaque(texto: string) {
  return texto
    .split('**')
    .map((parte, i) =>
      i % 2 === 1 ? (
        <strong key={parte} className="font-medium text-paper">
          {parte}
        </strong>
      ) : (
        parte
      ),
    );
}

export default function NotalioPage() {
  const app = notalio;

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
      <Section indice="01 / BAIXAR" rotulo="Baixar o Notalio">
        <div className="grid gap-4 lg:grid-cols-2">
          {app.arquivos.map((arquivo) => (
            <article
              key={arquivo.id}
              className={[
                'flex flex-col rounded-[var(--radius-panel)] border p-7 sm:p-9',
                arquivo.recomendado ? 'border-signal/40 bg-raised/80' : 'border-line bg-raised/50',
              ].join(' ')}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[1.5rem] leading-none tracking-[-0.03em]">{arquivo.nome}</h2>
                {arquivo.recomendado ? (
                  <span className="tecnica text-signal">RECOMENDADO</span>
                ) : null}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-mineral">{arquivo.paraQuem}</p>
              <a
                href={`${BASE_DE_DOWNLOAD_NOTALIO}/${arquivo.arquivo}`}
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

        <p className="mt-6 text-xs text-mineral-dim">
          Versão {app.versao}, para {app.requisitos}.{' '}
          <a
            href={NOTALIO_DOWNLOAD}
            rel="noreferrer"
            target="_blank"
            className="text-mineral underline decoration-line-strong underline-offset-4 hover:text-paper"
          >
            Ver todas as versões
          </a>
          .
        </p>

        {/* O aviso vem junto do botão: quem se assusta com a tela azul do Windows fecha
            a aba antes de procurar explicação. */}
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
                    {comDestaque(passo.texto)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
            <caption className="sr-only">
              SHA-256 de cada arquivo publicado do Notalio {app.versao}
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
      <Section indice="02 / O QUE É" rotulo="O que o Notalio é">
        <figure className="mb-12">
          <Image
            src={app.imagem.src}
            alt={app.imagem.alt}
            width={900}
            height={691}
            className="w-full rounded-[var(--radius-panel)] border border-line"
          />
          <figcaption className="mt-4 text-xs leading-relaxed text-mineral-dim">
            {app.imagem.legenda}
          </figcaption>
        </figure>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {app.descricao.map((paragrafo) => (
              <p
                key={paragrafo.slice(0, 32)}
                className="mb-5 text-[1.05rem] leading-relaxed text-paper/80"
              >
                {paragrafo}
              </p>
            ))}
          </div>
          {app.ondeFicam ? (
            <aside className="rounded-[var(--radius-control)] border border-line bg-raised/50 p-6 lg:col-span-4 lg:col-start-9">
              <h3 className="text-[1rem] leading-snug tracking-[-0.02em]">
                {app.ondeFicam.titulo}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mineral">{app.ondeFicam.texto}</p>
            </aside>
          ) : null}
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

      {/* ---------------------------------------------------------------- promessas */}
      {app.promessas ? (
        <Section indice="03 / O QUE ELE PROMETE" rotulo="As promessas do Notalio">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <p className="medida-texto text-[1.05rem] leading-relaxed text-paper/80 lg:col-span-4">
              Um bloco de notas guarda o que você escreveu. São estas cinco frases que
              dizem o que isso quer dizer aqui — e a sexta, logo abaixo, diz onde elas
              param.
            </p>
            <ol className="grid gap-3 lg:col-span-7 lg:col-start-6">
              {app.promessas.map((promessa, i) => (
                <li key={promessa.titulo} className="flex gap-4 border-b border-line pb-4">
                  <span aria-hidden="true" className="tecnica pt-1 text-signal">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-paper">{promessa.titulo}</p>
                    <p className="mt-1 text-sm leading-relaxed text-mineral">{promessa.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {app.naoPromete ? (
            <div className="mt-6 rounded-[var(--radius-control)] border border-line border-l-2 border-l-signal/50 bg-raised/40 p-6 sm:p-7 lg:ml-[41.66%]">
              <h3 className="text-[1rem] leading-snug tracking-[-0.02em]">
                {app.naoPromete.titulo}
              </h3>
              <p className="medida-texto mt-3 text-sm leading-relaxed text-mineral">
                {app.naoPromete.texto}
              </p>
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* ---------------------------------------------------------------- o guia */}
      {app.guia ? (
        <Section indice="04 / GUIA DAS FUNÇÕES" rotulo="Guia das funções do Notalio">
          <p className="medida-texto mb-10 text-[1.05rem] leading-relaxed text-paper/80">
            O programa cabe numa tela e não tem menu. Isto aqui é cada botão dele, na ordem
            em que aparecem, com o que faz e o atalho.
          </p>

          <div className="grid gap-10 lg:grid-cols-2">
            {app.guia.map((grupo) => (
              <section key={grupo.grupo}>
                <h3 className="tecnica text-signal">{grupo.grupo}</h3>
                {grupo.nota ? (
                  <p className="mt-3 text-sm leading-relaxed text-mineral">{grupo.nota}</p>
                ) : null}
                <dl className="mt-5 grid gap-3">
                  {grupo.itens.map((item) => (
                    <div key={item.nome} className="border-b border-line pb-3">
                      <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-sm font-medium text-paper">{item.nome}</span>
                        {item.teclas ? (
                          <span className="font-mono text-[0.7rem] text-mineral-dim">
                            {item.teclas}
                          </span>
                        ) : null}
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-mineral">{item.texto}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>

          {app.atalhos ? (
            <div className="mt-12">
              <h3 className="tecnica text-signal">Todos os atalhos, de uma vez</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {app.atalhos.map((atalho) => (
                  <li
                    key={atalho.teclas}
                    className="flex items-baseline gap-2 rounded-[var(--radius-control)] border border-line bg-raised/50 px-4 py-2"
                  >
                    <span className="font-mono text-xs text-paper">{atalho.teclas}</span>
                    <span className="text-xs text-mineral">{atalho.faz}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* ---------------------------------------------------------------- não faz */}
      <Section
        indice="05 / O QUE ELE NÃO FAZ"
        rotulo="O que o Notalio não faz"
        className="pb-[clamp(4rem,9vw,9rem)]"
      >
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <p className="medida-texto text-[1.05rem] leading-relaxed text-paper/80 lg:col-span-4">
            Um programa onde você escreve as suas coisas pede confiança. Esta lista existe
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
    </>
  );
}
