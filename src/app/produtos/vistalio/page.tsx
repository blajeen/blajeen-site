import type { Metadata } from 'next';
import Image from 'next/image';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { vistalio } from '@/content/produtos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Vistalio — onde tirar fotos com as melhores vistas do Brasil | Blajeen Labs',
  descricao:
    'Um mapa do Brasil com 628 pontos fotográficos nos 27 estados: mirantes, praias, cachoeiras e arquitetura, cada um com foto, descrição e o caminho no Google Maps. Sem conta e sem mensalidade.',
  rota: ROTAS.produtoVistalio,
});

export default function VistalioPage() {
  const app = vistalio;

  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">{app.estado} / NAVEGADOR</p>
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

      {/* ---------------------------------------------------------------- o que é */}
      <Section indice="01 / O QUE É" rotulo="O que o Vistalio é">
        <figure className="mb-12">
          <Image
            src={app.imagem.src}
            alt={app.imagem.alt}
            width={1280}
            height={900}
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

          {/* Os números ficam do lado do texto porque são a resposta de "isso tem
              conteúdo suficiente pra me servir?", que é a primeira dúvida de quem
              chega num site de lista. */}
          <dl className="grid gap-3 self-start lg:col-span-4 lg:col-start-9">
            {app.numeros.map((numero) => (
              <div
                key={numero.rotulo}
                className="rounded-[var(--radius-control)] border border-line bg-raised/50 p-5"
              >
                <dt className="text-[1.7rem] leading-none tracking-[-0.04em] text-paper tabular-nums">
                  {numero.valor}
                </dt>
                <dd className="mt-2 text-sm leading-snug text-mineral">{numero.rotulo}</dd>
              </div>
            ))}
          </dl>
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

      {/* ---------------------------------------------------------------- o que falta */}
      <Section indice="02 / O QUE AINDA FALTA" rotulo="O que ainda não está pronto no Vistalio">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <h2 className="text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.05] tracking-[-0.04em] lg:col-span-5">
            {app.aindaNao.titulo}
          </h2>
          <p className="medida-texto text-[1.05rem] leading-relaxed text-paper/80 lg:col-span-6 lg:col-start-7">
            {app.aindaNao.texto}
          </p>
        </div>

        {/* Enquanto não há endereço, a página diz isso em vez de oferecer um botão que
            não leva a lugar nenhum. Botão morto é pior que ausência de botão: um custa
            um clique e a descoberta de que não funciona, o outro custa nada. */}
        <p className="medida-texto mt-10 border-l border-line pl-5 text-sm leading-relaxed text-mineral">
          {app.endereco
            ? 'Ele está no ar e é de graça — o endereço fica aqui em cima.'
            : 'Ele ainda não está no ar. Quando estiver, o endereço aparece aqui, e continua sem conta, sem cadastro e sem mensalidade.'}
        </p>
      </Section>

      {/* ---------------------------------------------------------------- o que não faz */}
      <Section
        indice="03 / O QUE ELE NÃO FAZ"
        rotulo="O que o Vistalio não faz"
        className="pb-[clamp(4rem,9vw,9rem)]"
      >
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <p className="medida-texto text-[1.05rem] leading-relaxed text-paper/80 lg:col-span-4">
            Um site que indica lugar pra ir precisa dizer onde ele para. Esta lista existe
            pra você não descobrir isso na estrada.
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
