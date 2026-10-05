import Link from 'next/link';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { ScreenshotFrame } from '@/components/projects/ScreenshotFrame';
import { avisoDemonstracao, legendaDaTela, vemNaCompra, type Software } from '@/content/software';
import { ROTA_DA_LOJA, type ImagemProduto, type Produto } from '@/lib/loja/tipos';
import { ROTAS } from '@/lib/routes';
import { SeloDisponibilidade } from './CartaoProduto';
import { LinkDaSacola } from './LinkDaSacola';
import { ProdutoCompra } from './ProdutoCompra';

type Props = {
  produto: Produto;
  /** Demonstração, site, recursos e legendas. Um software criado no painel ainda não tem ficha. */
  ficha: Software | null;
  pagamentoOnline: boolean;
};

/** Uma tela do sistema, inteira, com a legenda da ficha (ou a descrição da foto, sem ficha). */
function Tela({ imagem, ficha, prioridade = false }: { imagem: ImagemProduto; ficha: Software | null; prioridade?: boolean }) {
  const legenda = legendaDaTela(ficha, imagem.url);
  return (
    <figure className="min-w-0">
      <ScreenshotFrame src={imagem.url} alt={imagem.alt} label={legenda?.titulo ?? imagem.alt} priority={prioridade} />
      {legenda ? (
        <figcaption className="mt-4">
          <p className="tecnica text-[9px] text-mineral-dim">{legenda.tipo}</p>
          <p className="mt-2 text-lg leading-snug tracking-tight text-paper">{legenda.titulo}</p>
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Página de um software à venda: a tela da demonstração, o preço e a compra no alto; depois o que
 * vem na compra, o que o sistema faz e as telas por dentro. Vendido, ele perde a compra e os links
 * da demonstração e do site, que passaram a ser de quem comprou.
 */
export function PaginaDoSoftware({ produto, ficha, pagamentoOnline }: Props) {
  const vendido = produto.disponibilidade === 'ESGOTADO';
  const [capa, ...telas] = produto.imagens;
  const paragrafos = produto.descricao.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  // As seções do meio dependem da ficha e da descrição: a numeração acompanha as que aparecem.
  const temSistema = Boolean(ficha || paragrafos.length);
  const indiceDasTelas = temSistema ? '03' : '02';

  return (
    <>
      <Container className="pt-[clamp(2.5rem,6vw,5rem)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`${ROTA_DA_LOJA}#software`} className="tecnica alvo-toque inline-flex items-center gap-3 text-mineral transition-colors hover:text-signal">
            <span aria-hidden="true">←</span> SOFTWARE À VENDA
          </Link>
          <LinkDaSacola />
        </div>

        <article aria-labelledby="software-titulo" className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-7">
            {capa ? (
              <Tela imagem={capa} ficha={ficha} prioridade />
            ) : (
              <div className="tecnica grid aspect-[16/10] place-items-center rounded-[var(--radius-panel)] border border-line bg-surface text-mineral-dim">
                SEM TELA AINDA
              </div>
            )}
          </div>

          <div className="min-w-0 lg:col-span-5 lg:pt-2">
            <p className="tecnica text-mineral-dim">SOFTWARE{produto.colecao ? ` · ${produto.colecao.toUpperCase()}` : ''}</p>
            <div className="mt-4 flex items-center gap-4">
              {ficha ? <ProductIcon id={ficha.icone} className="size-10 shrink-0 text-signal" /> : null}
              <h1 id="software-titulo" className="text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95] tracking-[-0.05em]">{produto.nome}</h1>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <SeloDisponibilidade produto={produto} />
              {vendido ? null : (
                <span className="tecnica inline-flex items-center rounded-full border border-line-strong px-3 py-1 text-paper">Venda única</span>
              )}
            </div>
            {produto.resumo ? <p className="mt-6 text-[1.1rem] leading-relaxed text-paper/85">{produto.resumo}</p> : null}

            <ProdutoCompra
              produto={{
                id: produto.id, slug: produto.slug, nome: produto.nome, categoria: produto.categoria, rotuloOpcoes: produto.rotuloOpcoes,
                opcoes: produto.opcoes, status: produto.status, disponibilidade: produto.disponibilidade,
              }}
              imagem={capa?.url ?? ''}
              prazoEncomenda=""
              acoes={ficha ? (
                <a href={ficha.demo} target="_blank" rel="noopener noreferrer" aria-label={`Testar a demonstração do ${produto.nome} (nova aba)`}
                  className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors hover:border-signal hover:text-signal">
                  Testar a demonstração <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            />

            {ficha && !vendido ? (
              <a href={ficha.site} target="_blank" rel="noopener noreferrer" className="alvo-toque mt-3 inline-flex items-center text-sm text-mineral underline-offset-4 transition-colors hover:text-signal hover:underline">
                Ver o site do {produto.nome}, que vai junto na compra ↗
              </a>
            ) : null}

            {vendido ? null : (
              <p className="mt-8 rounded-[var(--radius-control)] border border-line p-5 text-sm leading-relaxed text-mineral">
                <span className="tecnica mb-2 block text-signal">COMO FUNCIONA A COMPRA</span>
                {pagamentoOnline
                  ? 'Você paga com Pix, cartão ou boleto na página do Asaas. Confirmado o pagamento, o sistema sai de venda e a Blajeen Labs fala com você para combinar a entrega do código e, se você quiser, a troca do nome.'
                  : 'Você faz o pedido e deixa seu contato. A Blajeen Labs fala com você para combinar o pagamento, a entrega do código e, se você quiser, a troca do nome, antes de qualquer cobrança.'}
                {' '}
                <Link href={`${ROTAS.contato}?produto=${produto.slug}#interesse`} className="text-paper underline underline-offset-4 hover:text-signal">
                  Tem dúvidas antes de comprar? Fale com a gente.
                </Link>
              </p>
            )}
          </div>
        </article>
      </Container>

      <Section indice="01 / O QUE VEM NA COMPRA" rotuladaPor="software-compra">
        <TituloSecao id="software-compra">Código, site e marca. Tudo seu.</TituloSecao>
        <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2 xl:grid-cols-4">
          {vemNaCompra.map((item, i) => (
            <div key={item.titulo} className="min-w-0 border-t border-line pt-5">
              <p className="tecnica text-signal">0{i + 1}</p>
              <h3 className="mt-3 text-xl leading-snug tracking-tight">{item.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mineral">{item.texto}</p>
            </div>
          ))}
        </div>
      </Section>

      {temSistema ? (
        <Section indice="02 / O QUE O SISTEMA FAZ" rotuladaPor="software-sistema" className="!pt-0">
          <div className="grid gap-6 border-y border-line py-7 lg:grid-cols-[0.85fr_1.15fr] xl:gap-12">
            <TituloSecao id="software-sistema" className="!text-[clamp(1.7rem,3vw,2.5rem)]">
              {ficha?.titulo ?? 'O que o sistema faz.'}
            </TituloSecao>
            <div className="max-w-[66ch] space-y-4 text-base leading-relaxed text-mineral">
              {paragrafos.map((p) => <p key={p}>{p}</p>)}
              {ficha ? <p>{ficha.publico}</p> : null}
            </div>
          </div>
          {ficha ? (
            <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2 xl:grid-cols-4">
              {ficha.recursos.map((recurso, i) => (
                <div key={recurso.titulo} className="min-w-0">
                  <p className="tecnica text-signal">0{i + 1}</p>
                  <h3 className="mt-3 text-xl leading-snug tracking-tight">{recurso.titulo}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mineral">{recurso.texto}</p>
                </div>
              ))}
            </div>
          ) : null}
          {ficha?.observacao ? (
            <p className="mt-8 max-w-[90ch] border-l-2 border-signal/50 pl-4 text-sm leading-relaxed text-mineral">{ficha.observacao}</p>
          ) : null}
        </Section>
      ) : null}

      {telas.length ? (
        <Section indice={`${indiceDasTelas} / POR DENTRO`} rotuladaPor="software-telas" className="!pt-0 pb-[clamp(4rem,9vw,9rem)]">
          <TituloSecao id="software-telas">Veja o sistema em uso.</TituloSecao>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {telas.map((imagem) => <Tela key={imagem.id} imagem={imagem} ficha={ficha} />)}
          </div>
          {ficha ? <p className="mt-8 max-w-[100ch] text-xs leading-relaxed text-mineral-dim">{avisoDemonstracao}</p> : null}
          {ficha && !vendido ? (
            <a href={ficha.demo} target="_blank" rel="noopener noreferrer" className="alvo-toque mt-4 inline-flex items-center text-sm text-signal">
              Explore a demonstração: {ficha.nomeDemo} ↗
            </a>
          ) : null}
        </Section>
      ) : null}
    </>
  );
}
