import type { Metadata } from 'next';
import Image from 'next/image';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { ConferirArquivo } from '@/components/produtos/ConferirArquivo';
import { LojaDoProduto } from '@/components/produtos/LojaDoProduto';
import { BASE_DE_DOWNLOAD_EDITALIO, editalio, EDITALIO_DOWNLOAD } from '@/content/produtos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Editalio — editor de foto, vídeo e áudio para Windows | Blajeen Labs',
  descricao:
    'Editor de foto, vídeo e áudio com sete áreas: editar, montar trend em cima da batida da música, banner pronto, grade de fotos e transcrever fala. Tudo na sua máquina, sem conta e sem nuvem. Gratuito.',
  rota: ROTAS.produtoEditalio,
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

export default function EditalioPage() {
  const app = editalio;

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
              <p className="mt-5 max-w-[28ch] text-[clamp(1.3rem,2.4vw,2rem)] leading-[1.15] tracking-[-0.03em] text-paper/85">
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
      <Section indice="01 / BAIXAR" rotulo="Baixar o Editalio">
        <div className="grid gap-4 lg:grid-cols-2">
          {app.arquivos.map((arquivo) => (
            <article
              key={arquivo.id}
              className="flex flex-col rounded-[var(--radius-panel)] border border-signal/40 bg-raised/80 p-7 sm:p-9"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[1.5rem] leading-none tracking-[-0.03em]">{arquivo.nome}</h2>
                <span className="tecnica text-mineral-dim">{arquivo.tamanho}</span>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-mineral">{arquivo.paraQuem}</p>
              <a
                href={`${BASE_DE_DOWNLOAD_EDITALIO}/${arquivo.arquivo}`}
                className="alvo-toque tecnica mt-7 inline-flex items-center justify-center rounded-full bg-signal px-5 text-ink hover:bg-glow"
              >
                BAIXAR · {arquivo.tamanho}
              </a>
            </article>
          ))}

          <div className="flex flex-col justify-center rounded-[var(--radius-panel)] border border-line bg-raised/40 p-7 sm:p-9">
            <p className="tecnica text-mineral-dim">Requisitos</p>
            <p className="mt-3 text-sm leading-relaxed text-mineral">
              {app.requisitos}. O WebView2 já vem no Windows 11 e na maioria dos Windows 10
              atualizados.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-mineral">
              Versão {app.versao}.{' '}
              <a
                href={EDITALIO_DOWNLOAD}
                target="_blank"
                rel="noreferrer"
                className="text-signal underline underline-offset-4"
              >
                Todas as versões
              </a>
              .
            </p>
          </div>
        </div>

        {/* O aviso do Windows fica na mesma tela do botão, e não numa página de ajuda.
            Quem se assusta com "Editor desconhecido" fecha a aba e não volta — explicar
            depois não serve de nada. */}
        <div className="mt-10 rounded-[var(--radius-panel)] border border-line bg-raised/40 p-7 sm:p-9">
          <p className="medida-texto text-sm leading-relaxed text-mineral">
            {app.avisoDoWindows.porque}
          </p>
          <ol className="mt-7 grid gap-4">
            {app.avisoDoWindows.passos.map((passo, i) => (
              <li key={passo.onde} className="flex gap-4">
                <span aria-hidden="true" className="tecnica pt-0.5 text-signal">
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

        {app.loja ? <LojaDoProduto loja={app.loja} produto={app.nome} /> : null}

        <ConferirArquivo arquivos={app.arquivos} produto={app.nome} versao={app.versao} />
      </Section>

      {/* ---------------------------------------------------------------- o que é */}
      <Section indice="02 / O QUE É" rotulo="O que o Editalio é">
        <figure className="mb-12">
          <Image
            src={app.imagem.src}
            alt={app.imagem.alt}
            width={1196}
            height={799}
            className="mx-auto w-full max-w-[1000px] rounded-[var(--radius-panel)] border border-line"
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
              {app.ondeFicam.arvore ? (
                <pre className="mt-4 overflow-x-auto rounded-[var(--radius-control)] border border-line bg-void/40 p-4 text-[11.5px] leading-[1.7] text-mineral">
                  {app.ondeFicam.arvore.join('\n')}
                </pre>
              ) : null}
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

        {app.atalhos ? (
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {app.atalhos.map((atalho) => (
              <p key={atalho.teclas} className="text-sm text-mineral">
                <span className="font-mono text-[0.8rem] text-mineral-dim">{atalho.teclas}</span>{' '}
                {atalho.faz}
              </p>
            ))}
          </div>
        ) : null}
      </Section>

      {/* ---------------------------------------------------------------- trend e banner */}
      <Section indice="03 / TREND E BANNER" rotulo="As trends e os banners do Editalio">
        <div className="grid gap-10 lg:grid-cols-2">
          <figure>
            <Image
              src="/produtos/editalio/1-inicio.webp"
              alt="A área Trend do Editalio, com a pergunta “Qual trend você quer fazer?” e a lista de roteiros. Cada um diz o que é, de quantas gravações precisa e com quantos segundos o vídeo fica."
              width={1196}
              height={799}
              className="w-full rounded-[var(--radius-panel)] border border-line"
            />
            <figcaption className="mt-4 text-xs leading-relaxed text-mineral-dim">
              Cada trend diz de quantas gravações precisa e quanto vai durar, antes de você
              começar. O corte cai a 9,4 ms da batida na média — medido, não estimado.
            </figcaption>
          </figure>

          <figure>
            <Image
              src="/produtos/editalio/3-banner.webp"
              alt="A área Banner do Editalio montando o modelo Promoção, de 1080 por 1350. À esquerda os campos da foto, do título, da linha de baixo e do nome do arquivo; à direita a prévia do banner, já com o texto aplicado sobre a imagem."
              width={1196}
              height={799}
              className="w-full rounded-[var(--radius-panel)] border border-line"
            />
            <figcaption className="mt-4 text-xs leading-relaxed text-mineral-dim">
              O banner com a prévia ao lado, mudando a cada tecla. O texto quebra sozinho na
              largura reservada, e o programa avisa quando a frase passa do espaço.
            </figcaption>
          </figure>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- promessas */}
      {app.promessas ? (
        <Section indice="04 / O QUE ELE PROMETE" rotulo="As promessas do Editalio">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <p className="medida-texto text-[1.05rem] leading-relaxed text-paper/80 lg:col-span-4">
              Um editor mexe nos arquivos que você já tem. São estas cinco frases que dizem o
              que isso quer dizer aqui — e a lista logo abaixo diz onde elas param.
            </p>
            <ol className="grid gap-3 lg:col-span-7 lg:col-start-6">
              {app.promessas.map((promessa, i) => (
                <li key={promessa.titulo} className="flex gap-4 border-b border-line pb-4">
                  <span aria-hidden="true" className="tecnica pt-1 text-signal">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-paper">{promessa.titulo}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-mineral">{promessa.texto}</p>
                    {promessa.excecao ? (
                      <p className="mt-2 border-l border-line pl-4 text-sm leading-relaxed text-mineral-dim">
                        {promessa.excecao}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Os buracos ficam colados nas promessas, e não numa página de ajuda. Quem lê a
              lista e para ali sai com a informação errada. */}
          {app.naoPromete ? (
            <div className="mt-6 rounded-[var(--radius-control)] border border-line border-l-2 border-l-signal/50 bg-raised/40 p-6 sm:p-7 lg:ml-[41.66%]">
              <h3 className="text-[1rem] leading-snug tracking-[-0.02em]">
                {app.naoPromete.titulo}
              </h3>
              <p className="medida-texto mt-3 text-sm leading-relaxed text-mineral">
                {app.naoPromete.texto}
              </p>
              {app.naoPromete.itens ? (
                <ul className="mt-4 grid gap-2.5">
                  {app.naoPromete.itens.map((item) => (
                    <li
                      key={item.slice(0, 32)}
                      className="border-l border-line pl-4 text-sm leading-relaxed text-mineral"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* ---------------------------------------------------------------- o que não faz */}
      <Section
        indice="05 / O QUE ELE SE RECUSA A FAZER"
        rotulo="O que o Editalio não faz"
        className="pb-[clamp(4rem,9vw,9rem)]"
      >
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <p className="medida-texto text-[1.05rem] leading-relaxed text-paper/80 lg:col-span-4">
            Um programa que abre os seus arquivos pede confiança. Esta lista existe pra você
            saber onde ele para, antes de instalar.
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
