import type { Metadata } from 'next';
import { ScreenshotFrame } from '@/components/projects/ScreenshotFrame';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { demonstracoes, produtos } from '@/content/produtos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Produtos — Blajeen Labs',
  descricao:
    'Produtos do laboratório pra baixar e usar: o Clearlio, que limpa o computador com desfazer, e a planilha de controle financeiro. Sem conta, sem anúncio e sem versão paga. E o Torrelio, a demonstração do que fazemos sob medida para incorporadoras e hotéis.',
  rota: ROTAS.produtos,
});

/**
 * A ficha muda com o tipo do produto.
 *
 * Programa tem versão e sistema mínimo; planilha tem formato e onde ela roda; site tem
 * quantos lugares ele cobre. Mostrar "Windows 10 ou 11" numa planilha que abre no celular
 * seria mentira, e mostrar um campo vazio seria pior.
 */
function ficha(produto: (typeof produtos)[number]) {
  switch (produto.tipo) {
    case 'aplicativo':
      return [
        { rotulo: 'Versão', valor: produto.versao },
        { rotulo: 'Roda em', valor: produto.requisitos },
        { rotulo: 'Preço', valor: 'Nenhum' },
      ];
    case 'site':
      return [
        { rotulo: 'Cobre', valor: '628 pontos, nos 27 estados' },
        { rotulo: 'Roda em', valor: 'Qualquer navegador' },
        { rotulo: 'Preço', valor: 'Nenhum' },
      ];
    case 'planilha':
      return [
        { rotulo: 'Formato', valor: 'Google Sheets ou Excel' },
        { rotulo: 'Roda em', valor: 'Computador e celular' },
        { rotulo: 'Preço', valor: 'Nenhum' },
      ];
    default:
      return naoExiste(produto);
  }
}

/** Um tipo novo de produto tem que ganhar ficha e chamada próprias: o compilador cobra. */
function naoExiste(produto: never): never {
  throw new Error(`Produto sem ficha: ${JSON.stringify(produto)}`);
}

/** O que o botão do cartão diz, que muda com o que a pessoa vai encontrar do outro lado. */
function chamada(produto: (typeof produtos)[number]) {
  switch (produto.tipo) {
    case 'aplicativo':
      return 'VER O PROGRAMA';
    // "VER O SITE" seria ambíguo: o botão leva pra página do projeto aqui, e é lá que
    // mora o link que abre o Vistalio de verdade.
    case 'site':
      return 'VER O PROJETO';
    case 'planilha':
      return 'VER A PLANILHA';
    default:
      return naoExiste(produto);
  }
}

export default function ProdutosPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">PRA USAR HOJE / SEM CONTA E SEM MENSALIDADE</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="max-w-[14ch] text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em] lg:col-span-8">
              Coisas que ficam com você.
            </h1>
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral lg:col-span-3 lg:col-start-10 lg:pb-2">
              Três programas, um site e uma planilha. O que é seu fica com você — no seu
              computador ou no seu aparelho —, e nada do que você faz neles passa por um
              servidor nosso.
            </p>
          </div>
        </Container>
      </header>

      <Section
        indice="01 / PRODUTOS"
        rotulo="Produtos do laboratório"
        className="pb-[clamp(4rem,9vw,9rem)]"
      >
        <div className="grid gap-5">
          {produtos.map((produto, i) => (
            <article
              key={produto.id}
              className="rounded-[var(--radius-panel)] border border-line bg-raised/60 p-7 sm:p-10"
            >
              {/* A miniatura antes do texto: sem ela, dois programas diferentes viram
                  dois blocos de texto iguais, e a pessoa precisa ler pra saber qual é
                  qual. As imagens já existiam — só não estavam aqui. */}
              <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                <Link
                  href={produto.rota}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="group block overflow-hidden rounded-[var(--radius-control)] border border-line lg:col-span-4"
                >
                  <ScreenshotFrame src={produto.imagem.src} alt="" label={produto.nome} priority={i === 0}/>
                </Link>

                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3">
                    <ProductIcon id={produto.simbolo} className="size-7 text-signal" />
                    <p className="tecnica text-signal">{produto.estado}</p>
                  </div>
                  <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.4rem)] leading-[0.98] tracking-[-0.05em]">
                    {produto.nome}
                  </h2>
                  <p className="mt-3 text-[1.05rem] leading-relaxed text-paper/80">
                    {produto.lema}
                  </p>
                  <p className="medida-texto mt-5 text-sm leading-relaxed text-mineral">
                    {produto.resumo}
                  </p>
                </div>

                <div className="lg:col-span-3 lg:col-start-10">
                  <dl className="grid gap-3 text-sm">
                    {ficha(produto).map((linha, i, todas) => (
                      <div
                        key={linha.rotulo}
                        className={[
                          'flex justify-between gap-4',
                          i < todas.length - 1 ? 'border-b border-line pb-3' : '',
                        ].join(' ')}
                      >
                        <dt className="text-mineral">{linha.rotulo}</dt>
                        <dd className="text-right">{linha.valor}</dd>
                      </div>
                    ))}
                  </dl>

                  <Link
                    href={produto.rota}
                    className="alvo-toque tecnica mt-7 inline-flex items-center rounded-full bg-signal px-5 text-ink hover:bg-glow"
                  >
                    {chamada(produto)} →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Sob medida: não é para baixar, é para experimentar e pedir o seu. Por isso a ficha
          diz "Sob orçamento", e não "Preço: Nenhum" como os programas acima. */}
      <Section
        id="sob-medida"
        indice="02 / SOB MEDIDA"
        rotuladaPor="sob-medida-titulo"
        className="pb-[clamp(4rem,9vw,9rem)]"
      >
        <h2 id="sob-medida-titulo" className="max-w-[22ch] text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.02] tracking-[-0.05em]">
          Demonstrações do que fazemos por encomenda.
        </h2>
        <p className="medida-texto mt-5 text-[1.02rem] leading-relaxed text-mineral">
          Não é para baixar: é para experimentar, com dados fictícios, e pedir o seu.
        </p>
        <div className="mt-10 grid gap-5">
          {demonstracoes.map((demonstracao) => (
            <article
              key={demonstracao.id}
              className="rounded-[var(--radius-panel)] border border-line bg-raised/60 p-7 sm:p-10"
            >
              <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                <Link
                  href={demonstracao.rota}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="group block overflow-hidden rounded-[var(--radius-control)] border border-line lg:col-span-4"
                >
                  <ScreenshotFrame src={demonstracao.imagem.src} alt="" label={demonstracao.nome} />
                </Link>
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3">
                    <ProductIcon id={demonstracao.simbolo} className="size-7 text-signal" />
                    <p className="tecnica text-signal">{demonstracao.estado}</p>
                  </div>
                  <h3 className="mt-5 text-[clamp(2rem,4.4vw,3.4rem)] leading-[0.98] tracking-[-0.05em]">
                    {demonstracao.nome}
                  </h3>
                  <p className="mt-3 text-[1.05rem] leading-relaxed text-paper/80">{demonstracao.lema}</p>
                  <p className="medida-texto mt-5 text-sm leading-relaxed text-mineral">{demonstracao.resumo}</p>
                </div>
                <div className="lg:col-span-3 lg:col-start-10">
                  <dl className="grid gap-3 text-sm">
                    {[
                      { rotulo: 'Para', valor: demonstracao.paraQuem },
                      { rotulo: 'Roda em', valor: demonstracao.rodaEm },
                      { rotulo: 'Preço', valor: 'Sob orçamento' },
                    ].map((linha, i, todas) => (
                      <div
                        key={linha.rotulo}
                        className={['flex justify-between gap-4', i < todas.length - 1 ? 'border-b border-line pb-3' : ''].join(' ')}
                      >
                        <dt className="text-mineral">{linha.rotulo}</dt>
                        <dd className="text-right">{linha.valor}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href={demonstracao.rota}
                    className="alvo-toque tecnica mt-7 inline-flex items-center rounded-full bg-signal px-5 text-ink hover:bg-glow"
                  >
                    ABRIR A DEMONSTRAÇÃO →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
