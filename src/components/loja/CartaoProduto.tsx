import Image from 'next/image';
import Link from 'next/link';
import { SystemScreenshot } from '@/components/media/SystemScreenshot';
import {
  CATEGORIA_ROTULO, formatarPreco, mostraPreco, precoInicial, rotaDoProduto, rotuloDaDisponibilidade, temPrecosDiferentes, vendaUnica,
  type Produto,
} from '@/lib/loja/tipos';

/** Disponível e pré-venda em verde; sob encomenda e em breve neutros; esgotado (ou vendido) apagado. */
export function SeloDisponibilidade({ produto }: { produto: Pick<Produto, 'categoria' | 'disponibilidade'> }) {
  const { disponibilidade } = produto;
  const cor = disponibilidade === 'ESGOTADO'
    ? 'border-line text-mineral-dim'
    : disponibilidade === 'SOB_ENCOMENDA' || disponibilidade === 'EM_BREVE' ? 'border-line-strong text-paper' : 'border-signal/60 text-signal';
  return (
    <span className={`tecnica inline-flex items-center gap-2 rounded-full border px-3 py-1 ${cor}`}>
      {disponibilidade !== 'ESGOTADO' ? <span aria-hidden="true" className="size-[5px] rounded-full bg-current" /> : null}
      {rotuloDaDisponibilidade(produto)}
    </span>
  );
}

export function PrecoDoProduto({ produto, className = '' }: { produto: Pick<Produto, 'categoria' | 'opcoes' | 'disponibilidade'>; className?: string }) {
  // "Em breve" ainda não tem preço: o selo ao lado já diz o que a pessoa precisa saber.
  if (!mostraPreco(produto)) return <p className={`${className} text-mineral`}>Preço em breve</p>;
  // Software vendido tem dono: o preço da venda não fica exposto, o selo "Vendido" basta.
  if (vendaUnica(produto) && produto.disponibilidade === 'ESGOTADO') return null;
  return (
    <p className={className}>
      {temPrecosDiferentes(produto) ? <span className="mr-1.5 text-sm text-mineral">a partir de</span> : null}
      <span className="tabular-nums">{formatarPreco(precoInicial(produto))}</span>
    </p>
  );
}

/** Cartão da vitrine. O cartão inteiro é o link: a foto, o nome e o preço levam à página do produto. */
export function CartaoProduto({ produto, prioridade = false }: { produto: Produto; prioridade?: boolean }) {
  if (vendaUnica(produto)) return <CartaoSoftware produto={produto} prioridade={prioridade} />;
  const foto = produto.imagens[0];
  return (
    <Link
      href={rotaDoProduto(produto.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised/60 transition-colors duration-200 hover:border-signal/40"
    >
      <div className="relative aspect-square overflow-hidden border-b border-line bg-surface">
        {foto ? (
          <Image
            src={foto.url}
            alt=""
            fill
            sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 92vw"
            priority={prioridade}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <span className="tecnica absolute inset-0 grid place-items-center text-mineral-dim">SEM FOTO AINDA</span>
        )}
      </div>
      <CorpoDoCartao produto={produto} />
    </Link>
  );
}

/**
 * Cartão do software: a tela do sistema inteira, na moldura das capturas do site, em vez do recorte
 * quadrado das fotos dos exclusivos — recortada, a tela perderia menus e textos.
 */
function CartaoSoftware({ produto, prioridade }: { produto: Produto; prioridade: boolean }) {
  const foto = produto.imagens[0];
  return (
    <Link
      href={rotaDoProduto(produto.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised/60 transition-colors duration-200 hover:border-signal/40"
    >
      <div className="border-b border-line bg-surface p-3 sm:p-4">
        {foto ? (
          <SystemScreenshot
            src={foto.url}
            alt=""
            label={produto.nome}
            largura={16}
            altura={10}
            prioridade={prioridade}
            sizes="(min-width: 80rem) 30vw, (min-width: 40rem) 45vw, 92vw"
          />
        ) : (
          <span className="tecnica grid aspect-[16/10] place-items-center text-mineral-dim">SEM TELA AINDA</span>
        )}
      </div>
      <CorpoDoCartao produto={produto} />
    </Link>
  );
}

function CorpoDoCartao({ produto }: { produto: Produto }) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <p className="tecnica text-mineral-dim">
        {CATEGORIA_ROTULO[produto.categoria]}{produto.colecao ? ` · ${produto.colecao}` : ''}
      </p>
      <h3 className="mt-3 text-[1.55rem] leading-tight tracking-[-0.03em] transition-colors group-hover:text-signal">
        {produto.nome}
      </h3>
      {produto.resumo ? <p className="mt-2 text-sm leading-relaxed text-mineral">{produto.resumo}</p> : null}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-6">
        <PrecoDoProduto produto={produto} className="text-xl" />
        <SeloDisponibilidade produto={produto} />
      </div>
    </div>
  );
}
