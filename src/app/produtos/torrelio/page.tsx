import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, Section } from '@/components/layout/Section';
import { ApartamentoDemo } from '@/components/torrelio/apartamento/ApartamentoDemo';
import { DemonstracaoTorrelio } from '@/components/torrelio/DemonstracaoTorrelio';
import { VerNaDemonstracao } from '@/components/torrelio/VerNaDemonstracao';
import {
  entregas, ficticio, letraMiudaDasVantagens, linkDoProjeto, materiais, notaDeOndeFica, notaDosMateriais, ondeFica, passos, vantagens,
} from '@/content/torrelio';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Torrelio — o espelho de vendas virou um prédio em 3D | Blajeen Labs',
  descricao:
    'Demonstração do que o estúdio constrói sob medida para incorporadoras e hotéis: um prédio fictício em 3D, no navegador, com cada unidade ligada à tabela, a vista de cada andar e um painel de controle aberto para teste.',
  rota: ROTAS.produtoTorrelio,
});

const linkSutil =
  'tecnica inline-flex min-h-11 items-center gap-2 text-signal underline decoration-signal/30 underline-offset-4 hover:decoration-signal';

export default function TorrelioPage() {
  return (
    <>
      <header className="pt-[clamp(3rem,7vw,6rem)]">
        <Container>
          <p className="tecnica text-signal">DEMONSTRAÇÃO SOB MEDIDA / INCORPORADORAS E HOTÉIS</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end [&>*]:min-w-0">
            <div className="lg:col-span-7">
              <h1 className="text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em]">Torrelio</h1>
              <p className="mt-5 max-w-[22ch] text-[clamp(1.3rem,2.4vw,2rem)] leading-[1.15] tracking-[-0.03em] text-paper/85">
                O espelho de vendas virou um prédio. <span className="text-mineral">E o mapa de quartos também.</span>
              </p>
            </div>
            <div className="lg:col-span-5 lg:pb-2">
              <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral">
                Uma demonstração do que o estúdio constrói para incorporadoras e hotéis: o empreendimento em 3D, no navegador, com
                cada unidade ligada à tabela. Quem compra vê o andar, a vista e o sol de cada apartamento. Quem vende muda status,
                preço e obra num painel, e a fachada responde na hora.
              </p>
              <p className="mt-5 border-l border-signal/50 pl-4 text-sm leading-relaxed text-paper/80">
                Prédio, cidade, entorno, valores, condições, obra, quartos e planta são fictícios. O que você mudar aqui fica só neste
                navegador.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#demonstracao"
                  className="alvo-toque tecnica inline-flex items-center rounded-full bg-signal px-5 text-ink hover:bg-glow"
                >
                  ABRIR A DEMONSTRAÇÃO ↓
                </a>
                <Link
                  href={linkDoProjeto('empreendimento')}
                  className="alvo-toque tecnica inline-flex items-center rounded-full border border-line-strong px-5 text-paper hover:border-paper/40"
                >
                  QUERO UM PROJETO ASSIM →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* ------------------------------------------------------------- 01 demonstração */}
      <Section id="demonstracao" indice="01 / A DEMONSTRAÇÃO" rotuladaPor="demonstracao-titulo" className="scroll-mt-20">
        <h2 id="demonstracao-titulo" className="sr-only">
          A demonstração
        </h2>
        <p className="medida-texto mb-6 text-[1.05rem] leading-relaxed text-mineral">
          Duas visões do mesmo prédio. Na do cliente, escolha uma unidade e veja a vista dela. No painel, marque uma venda: a luz
          acende na fachada. Troque para Hotel e o mesmo prédio vira um mapa de quartos.
        </p>
        <noscript>
          <p className="mb-6 rounded-[var(--radius-control)] border border-line-strong p-4 text-sm text-paper">
            Para girar a torre e usar o painel, ative o JavaScript. O espelho abaixo mostra as unidades da demonstração.
          </p>
        </noscript>
        <DemonstracaoTorrelio />
      </Section>

      {/* ---------------------------------------------------------------- 02 vantagens */}
      <Section id="vantagens" indice="02 / VANTAGENS" rotuladaPor="vantagens-titulo">
        <h2 id="vantagens-titulo" className="max-w-[18ch] text-[clamp(2rem,4.4vw,3.6rem)] leading-[1] tracking-[-0.05em]">
          O que muda quando o prédio está na tela.
        </h2>
        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {vantagens.map((grupo) => (
            <section key={grupo.publico} aria-labelledby={`vantagens-${grupo.publico}`} className="border-t border-line-strong pt-6">
              <h3 id={`vantagens-${grupo.publico}`} className="tecnica text-signal">
                {grupo.publico.toUpperCase()}
              </h3>
              <ol className="mt-6 grid gap-6">
                {grupo.itens.map((item, i) => (
                  <li key={item.titulo} className="grid grid-cols-[2rem_1fr] gap-x-2">
                    <span className="tecnica pt-1 text-mineral-dim" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-[1.05rem] leading-snug tracking-[-0.01em]">{item.titulo}</p>
                      <p className="mt-2 text-sm leading-relaxed text-mineral">{item.texto}</p>
                      {item.links ? (
                        <p className="mt-2 flex flex-wrap gap-x-4 text-sm">
                          {item.links.map((link) => (
                            <Link key={link.href} href={link.href} className="text-paper underline decoration-line-strong underline-offset-4 hover:decoration-paper">
                              {link.rotulo}
                            </Link>
                          ))}
                        </p>
                      ) : null}
                      {item.comando ? (
                        <VerNaDemonstracao comando={item.comando} className={linkSutil}>
                          VER NA DEMONSTRAÇÃO {item.comando.foco === 'apartamento' ? '↓' : '↑'}
                        </VerNaDemonstracao>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
        <p className="medida-texto mt-12 text-xs leading-relaxed text-mineral">{letraMiudaDasVantagens}</p>
      </Section>

      {/* -------------------------------------------------------------- 03 apartamento */}
      <Section id="apartamento" indice="03 / O APARTAMENTO POR DENTRO (OPCIONAL)" rotuladaPor="apartamento-titulo" className="scroll-mt-20">
        <h2
          id="apartamento-titulo"
          tabIndex={-1}
          className="max-w-[20ch] text-[clamp(2rem,4.4vw,3.6rem)] leading-[1] tracking-[-0.05em]"
        >
          A planta que vocês enviam vira maquete.
        </h2>
        <p className="medida-texto mt-6 text-[1.05rem] leading-relaxed text-mineral">
          Item opcional do projeto: cada tipologia ganha uma maquete 3D feita a partir da planta (PDF ou DWG), com paredes, portas,
          janelas e um mobiliário de referência, e uma vista de planta com a área de cada cômodo. Aqui, uma planta fictícia de 2
          dormitórios com suíte, 66,45 m².
        </p>
        <div className="mt-10">
          <ApartamentoDemo />
        </div>
      </Section>

      {/* ------------------------------------------------------------ 04 como é feito */}
      <Section id="como-e-feito" indice="04 / COMO O PROJETO É FEITO" rotuladaPor="como-titulo">
        <h2 id="como-titulo" className="max-w-[20ch] text-[clamp(2rem,4.4vw,3.6rem)] leading-[1] tracking-[-0.05em]">
          Do material de vocês ao prédio na tela.
        </h2>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {passos.map((passo, i) => (
            <li key={passo.titulo} className="bg-ink p-6">
              <p className="tecnica text-signal">{String(i + 1).padStart(2, '0')}</p>
              <p className="mt-4 text-lg tracking-[-0.02em]">{passo.titulo}</p>
              <p className="mt-2 text-sm leading-relaxed text-mineral">
                {passo.texto}
                {passo.titulo === 'Ajustes' ? (
                  <>
                    {' '}
                    <Link href={ROTAS.crieSeuProjeto} className="text-paper underline decoration-line-strong underline-offset-4">
                      Ver as garantias
                    </Link>
                    .
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <section aria-labelledby="entregas-titulo">
            <h3 id="entregas-titulo" className="tecnica text-signal">
              O QUE O PROJETO ENTREGA
            </h3>
            <ul className="mt-6 grid gap-0 border-t border-line">
              {entregas.map((entrega) => (
                <li key={entrega.titulo} className="grid gap-1 border-b border-line py-4">
                  <p className="flex flex-wrap items-baseline gap-x-3 text-[1.02rem]">
                    {entrega.titulo}
                    {entrega.opcional ? <span className="tecnica text-mineral">OPCIONAL</span> : null}
                  </p>
                  <p className="text-sm leading-relaxed text-mineral">{entrega.texto}</p>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="onde-titulo">
            <h3 id="onde-titulo" className="tecnica text-signal">
              ONDE ELE FICA
            </h3>
            <ul className="mt-6 grid gap-0 border-t border-line">
              {ondeFica.map((lugar) => (
                <li key={lugar.titulo} className="grid gap-1 border-b border-line py-4">
                  <p className="text-[1.02rem]">{lugar.titulo}</p>
                  <p className="text-sm leading-relaxed text-mineral">{lugar.texto}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-mineral">{notaDeOndeFica}</p>
          </section>
        </div>
      </Section>

      {/* ------------------------------------------------------- 05 o que vocês enviam */}
      <Section id="o-que-enviar" indice="05 / O QUE VOCÊS ENVIAM" rotuladaPor="enviar-titulo">
        <h2 id="enviar-titulo" className="max-w-[22ch] text-[clamp(2rem,4.4vw,3.6rem)] leading-[1] tracking-[-0.05em]">
          A lista para começar.
        </h2>
        <p className="medida-texto mt-6 text-[1.05rem] leading-relaxed text-mineral">
          É com isso que a torre, o entorno e o painel saem parecidos com o empreendimento de vocês. {notaDosMateriais}
        </p>
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          {materiais.map((grupo) => (
            <section key={grupo.publico} aria-labelledby={`materiais-${grupo.publico}`}>
              <h3 id={`materiais-${grupo.publico}`} className="tecnica text-signal">
                {grupo.publico.toUpperCase()}
              </h3>
              <ol className="mt-6 grid border-t border-line">
                {grupo.itens.map((item, i) => (
                  <li key={item.titulo} className="grid grid-cols-[2.25rem_1fr] gap-x-2 border-b border-line py-4">
                    <span className="tecnica pt-1 text-mineral-dim" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-[1.02rem]">{item.titulo}</p>
                      <p className="mt-1 text-sm leading-relaxed text-mineral">{item.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ 06 o que é fictício */}
      <Section id="ficticio" indice="06 / O QUE É FICTÍCIO" rotuladaPor="ficticio-titulo">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="ficticio-titulo" className="max-w-[18ch] text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.02] tracking-[-0.05em]">
              Tudo na demonstração é inventado, menos o código.
            </h2>
            <ul className="mt-8 grid gap-2 text-sm leading-relaxed text-mineral">
              {ficticio.lista.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="text-mineral-dim">
                    —
                  </span>
                  {item[0]!.toUpperCase() + item.slice(1)}.
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-6 text-sm leading-relaxed lg:col-span-5 lg:col-start-8">
            <p className="text-paper/85">{ficticio.real}</p>
            <p className="text-mineral">{ficticio.naoFaz}</p>
            <p className="text-mineral">{ficticio.semLogin}</p>
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------------------------- chamada */}
      <Section rotulo="Pedir um projeto" className="pb-[clamp(4rem,9vw,9rem)]">
        <div className="rounded-[var(--radius-panel)] border border-line bg-raised/60 p-7 sm:p-12">
          <p className="tecnica text-signal">SOB ORÇAMENTO</p>
          <h2 className="mt-5 max-w-[16ch] text-[clamp(2rem,4.4vw,3.6rem)] leading-[1] tracking-[-0.05em]">Vamos criar o seu?</h2>
          <p className="medida-texto mt-5 text-[1.02rem] leading-relaxed text-mineral">
            O valor depende do número de torres e de unidades, das plantas em 3D e das ligações com os sistemas de vocês.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={linkDoProjeto('empreendimento')} className="alvo-toque tecnica inline-flex items-center rounded-full bg-signal px-5 text-ink hover:bg-glow">
              PARA O MEU EMPREENDIMENTO →
            </Link>
            <Link
              href={linkDoProjeto('hotel')}
              className="alvo-toque tecnica inline-flex items-center rounded-full border border-line-strong px-5 text-paper hover:border-paper/40"
            >
              PARA O MEU HOTEL →
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
