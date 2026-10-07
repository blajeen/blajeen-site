import type { Metadata } from 'next';
import Link from 'next/link';
import { DemonstracaoCarrelio } from '@/components/carrelio/DemonstracaoCarrelio';
import { VerNaDemonstracao } from '@/components/carrelio/VerNaDemonstracao';
import { Container, Section } from '@/components/layout/Section';
import { LOJA } from '@/lib/carrelio/catalogo';
import { atalhos, demonstracao, entregas, linkDoProjeto, materiais, notaDeOndeFica, notaDosMateriais, ondeFica, passos, vantagens } from '@/content/carrelio';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

/** Publicação aberta, com o nome da loja, autorizada pelo titular em 07/10/2026. */
export const metadata: Metadata = metadadosDaRota({
  titulo: 'Carrelio — o showroom da concessionária, em 3D | Blajeen Labs',
  descricao: `Demonstração preparada para a ${LOJA}: o Jaecoo 5 em 3D no navegador, com cores, versões, realidade aumentada, estoque da loja e pedido de test drive.`,
  rota: ROTAS.produtoCarrelio,
  imagem: OG.carrelio,
  imagemAlt: 'O Jaecoo 5 em 3D, num estúdio escuro, visto de três quartos de frente.',
});

const linkSutil =
  'tecnica inline-flex min-h-11 items-center gap-2 text-signal underline decoration-signal/30 underline-offset-4 hover:decoration-signal';

/** Os atalhos acima da demonstração: pílulas com alvo de 44 px. */
const atalho =
  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-line-strong px-4 text-sm whitespace-nowrap text-paper transition-colors hover:border-signal/60 hover:text-signal';

export default function CarrelioPage() {
  return (
    <>
      <header className="pt-[clamp(3rem,7vw,6rem)]">
        <Container>
          <p className="tecnica text-signal">DEMONSTRAÇÃO SOB MEDIDA / CONCESSIONÁRIAS · PREPARADA PARA A {LOJA.toUpperCase()}</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end [&>*]:min-w-0">
            <div className="lg:col-span-7">
              <h1 className="text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em]">Carrelio</h1>
              <p className="mt-5 max-w-[22ch] text-[clamp(1.3rem,2.4vw,2rem)] leading-[1.15] tracking-[-0.03em] text-paper/85">
                O showroom da loja no celular do cliente. <span className="text-mineral">Em todas as cores e na garagem dele.</span>
              </p>
            </div>
            <div className="lg:col-span-5 lg:pb-2">
              <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral">
                O Jaecoo 5 em 3D, no navegador, ligado ao estoque da loja.
              </p>
              <p className="mt-5 border-l border-signal/50 pl-4 text-sm leading-relaxed text-paper/80">
                O carro é real; estoque, preço da loja e pedidos são de demonstração. O que você mudar fica só neste navegador.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#experimente" className="alvo-toque tecnica inline-flex items-center rounded-full bg-signal px-5 text-ink hover:bg-glow">
                  ABRIR A DEMONSTRAÇÃO ↓
                </a>
                <Link
                  href={linkDoProjeto()}
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
        {/* No celular, uma fileira que desliza; do tablet para cima, quebra em linhas. */}
        <nav
          id="experimente"
          aria-label="Atalhos da demonstração"
          className="mb-6 flex scroll-mt-20 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0"
        >
          <p className="tecnica mr-2 shrink-0 text-mineral">EXPERIMENTE</p>
          {atalhos.map((a) => (
            <VerNaDemonstracao key={a.rotulo} comando={a.comando} className={atalho}>
              {a.rotulo}
            </VerNaDemonstracao>
          ))}
        </nav>
        <noscript>
          <p className="mb-6 rounded-[var(--radius-control)] border border-line-strong p-4 text-sm text-paper">
            Para girar o carro e usar o painel, ative o JavaScript. O cartão mostra versões, cores, preço e ficha.
          </p>
        </noscript>
        <DemonstracaoCarrelio />
      </Section>

      {/* ---------------------------------------------------------------- 02 vantagens */}
      <Section id="vantagens" indice="02 / VANTAGENS" rotuladaPor="vantagens-titulo">
        <h2 id="vantagens-titulo" className="max-w-[18ch] text-[clamp(2rem,4.4vw,3.6rem)] leading-[1] tracking-[-0.05em]">
          O que muda quando o carro está na tela.
        </h2>
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-8">
          {vantagens.map((grupo) => (
            <section key={grupo.publico} aria-labelledby={`vantagens-${grupo.publico}`} className="border-t border-line-strong pt-6">
              <h3 id={`vantagens-${grupo.publico}`} className="tecnica text-signal">
                {grupo.publico.toUpperCase()}
              </h3>
              <ol className="mt-6 grid gap-4">
                {grupo.itens.map((item, i) => (
                  <li key={item.titulo} className="grid grid-cols-[2rem_1fr] gap-x-2">
                    <span className="tecnica pt-1 text-mineral-dim" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-[1.05rem] leading-snug tracking-[-0.01em]">{item.titulo}</p>
                      {item.comando ? (
                        <VerNaDemonstracao comando={item.comando} className={linkSutil}>
                          VER NA DEMONSTRAÇÃO ↑
                        </VerNaDemonstracao>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ 03 como é feito */}
      <Section id="como-e-feito" indice="03 / COMO O PROJETO É FEITO" rotuladaPor="como-titulo">
        <h2 id="como-titulo" className="max-w-[20ch] text-[clamp(2rem,4.4vw,3.6rem)] leading-[1] tracking-[-0.05em]">
          Do material da loja ao carro na tela.
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
                <li key={entrega.titulo} className="border-b border-line py-3.5">
                  <p className="flex flex-wrap items-baseline gap-x-3 text-[1.02rem]">
                    {entrega.titulo}
                    {entrega.opcional ? <span className="tecnica text-mineral">OPCIONAL</span> : null}
                  </p>
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
                <li key={lugar.titulo} className="grid gap-1 border-b border-line py-3.5">
                  <p className="text-[1.02rem]">{lugar.titulo}</p>
                  <p className="text-sm leading-relaxed text-mineral">{lugar.texto}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-mineral">{notaDeOndeFica}</p>
          </section>
        </div>
      </Section>

      {/* ------------------------------------------------------- 04 o que a loja envia */}
      <Section id="o-que-enviar" indice="04 / O QUE A LOJA ENVIA" rotuladaPor="enviar-titulo">
        <h2 id="enviar-titulo" className="max-w-[22ch] text-[clamp(2rem,4.4vw,3.6rem)] leading-[1] tracking-[-0.05em]">
          A lista para começar.
        </h2>
        <p className="medida-texto mt-6 text-[1.05rem] leading-relaxed text-mineral">
          Com isso, os carros e o painel saem com a cara da loja. {notaDosMateriais}
        </p>
        <ol className="mt-12 grid border-t border-line lg:max-w-[52rem]">
          {materiais.map((item, i) => (
            <li key={item.titulo} className="grid grid-cols-[2.25rem_1fr] gap-x-2 border-b border-line py-3.5">
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
      </Section>

      {/* ------------------------------------------------ 05 o que é real e o que não é */}
      <Section id="o-que-e-real" indice="05 / O QUE É REAL" rotuladaPor="real-titulo">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="real-titulo" className="max-w-[18ch] text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.02] tracking-[-0.05em]">
              O carro é de verdade. O estoque é de exemplo.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-mineral">
              Real: {demonstracao.real.join('; ')}. De demonstração: {demonstracao.deDemonstracao.join(', ')}.
            </p>
          </div>
          <div className="grid content-start gap-6 text-sm leading-relaxed lg:col-span-5 lg:col-start-8">
            <p className="text-paper/85">
              Preparada pela Blajeen Labs para apresentar à {LOJA}. Não é o site da loja nem da marca, e não fala em nome delas.
            </p>
            <p className="text-mineral">{demonstracao.naoFaz}</p>
            <p className="text-mineral">{demonstracao.semLogin}</p>
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------------------------- chamada */}
      <Section rotulo="Pedir um projeto" className="pb-[clamp(4rem,9vw,9rem)]">
        <div className="rounded-[var(--radius-panel)] border border-line bg-raised/60 p-7 sm:p-12">
          <p className="tecnica text-signal">SOB ORÇAMENTO</p>
          <h2 className="mt-5 max-w-[16ch] text-[clamp(2rem,4.4vw,3.6rem)] leading-[1] tracking-[-0.05em]">Vamos montar o da sua loja?</h2>
          <p className="medida-texto mt-5 text-[1.02rem] leading-relaxed text-mineral">
            O valor depende de quantos carros, do material 3D de cada um e das ligações com o estoque e o site da loja.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={linkDoProjeto()} className="alvo-toque tecnica inline-flex items-center rounded-full bg-signal px-5 text-ink hover:bg-glow">
              PARA A MINHA LOJA →
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
