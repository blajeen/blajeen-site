import type { Metadata } from 'next';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section } from '@/components/layout/Section';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { produtos } from '@/content/produtos';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Produtos — Blajeen Labs',
  descricao:
    'Produtos do laboratório pra baixar e usar: o Clearlio, que limpa o computador com desfazer, e a planilha de controle financeiro. Sem conta, sem anúncio e sem versão paga.',
  rota: ROTAS.produtos,
});

/**
 * A ficha muda com o tipo do produto.
 *
 * Programa tem versão e sistema mínimo; planilha tem formato e onde ela roda. Mostrar
 * "Windows 10 ou 11" numa planilha que abre no celular seria mentira, e mostrar um campo
 * vazio seria pior.
 */
function ficha(produto: (typeof produtos)[number]) {
  if (produto.tipo === 'aplicativo') {
    return [
      { rotulo: 'Versão', valor: produto.versao },
      { rotulo: 'Roda em', valor: produto.requisitos },
      { rotulo: 'Preço', valor: 'Nenhum' },
    ];
  }
  return [
    { rotulo: 'Formato', valor: 'Google Sheets ou Excel' },
    { rotulo: 'Roda em', valor: 'Computador e celular' },
    { rotulo: 'Preço', valor: 'Nenhum' },
  ];
}

export default function ProdutosPage() {
  return (
    <>
      <header className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,7rem)]">
        <LabBackdrop />
        <Container>
          <p className="tecnica text-signal">PRA BAIXAR E USAR / SEM CONTA E SEM MENSALIDADE</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="max-w-[14ch] text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em] lg:col-span-8">
              Coisas que ficam com você.
            </h1>
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral lg:col-span-3 lg:col-start-10 lg:pb-2">
              Um programa e uma planilha. Você leva pra sua máquina, usa como quiser, e nada do
              que você faz neles passa por um servidor nosso.
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
          {produtos.map((produto) => (
            <article
              key={produto.id}
              className="rounded-[var(--radius-panel)] border border-line bg-raised/60 p-7 sm:p-10"
            >
              <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-7">
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

                <div className="lg:col-span-4 lg:col-start-9">
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
                    {produto.tipo === 'aplicativo' ? 'VER E BAIXAR' : 'VER E PEGAR'} →
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
