'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { aceitaPedido, formatarPreco, ROTA_DO_PEDIDO, type Produto } from '@/lib/loja/tipos';
import { adicionarNaSacola, MAXIMO_POR_ITEM } from './sacola';

type Props = {
  produto: Pick<Produto, 'id' | 'slug' | 'nome' | 'rotuloOpcoes' | 'opcoes' | 'status' | 'disponibilidade'>;
  imagem: string;
  /** "10 a 20 dias": o prazo dos itens sob encomenda, da configuração da loja. */
  prazoEncomenda: string;
};

/** Opção, quantidade e sacola. O pedido em si acontece na página da sacola. */
export function ProdutoCompra({ produto, imagem, prazoEncomenda }: Props) {
  const router = useRouter();
  const prefixo = useId();
  const [opcaoId, setOpcaoId] = useState(produto.opcoes[0]?.id ?? '');
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const opcao = produto.opcoes.find((o) => o.id === opcaoId) ?? produto.opcoes[0];
  const sobEncomenda = produto.disponibilidade === 'SOB_ENCOMENDA';

  if (!opcao) return null;
  if (produto.disponibilidade === 'EM_BREVE') {
    return (
      <div className="mt-8 rounded-[var(--radius-control)] border border-line p-5">
        <p className="text-2xl tracking-[-0.02em]">Em breve.</p>
        <p className="mt-2 text-mineral">Este exclusivo ainda está sendo preparado. O preço e o botão de compra aparecem aqui quando ele chegar.</p>
        {produto.opcoes.length > 1 ? (
          <p className="mt-4 text-sm text-mineral">
            <span className="tecnica mr-2 text-mineral-dim">{produto.rotuloOpcoes || 'Opções'}</span>
            {produto.opcoes.map((o) => o.rotulo).join(' · ')}
          </p>
        ) : null}
      </div>
    );
  }
  if (!aceitaPedido(produto)) {
    return (
      <div className="mt-8 rounded-[var(--radius-control)] border border-line p-5">
        <p className="text-3xl tabular-nums">{formatarPreco(opcao.precoCentavos)}</p>
        <p className="mt-2 text-mineral">Esgotado no momento. Volte em breve ou fale com a gente pelo contato.</p>
      </div>
    );
  }

  function colocar() {
    adicionarNaSacola({
      produtoId: produto.id, slug: produto.slug, nome: produto.nome, opcaoId: opcao!.id,
      opcaoRotulo: produto.opcoes.length > 1 ? opcao!.rotulo : '', precoCentavos: opcao!.precoCentavos,
      quantidade, digital: opcao!.digital, imagem, sobEncomenda,
    });
  }

  return (
    <div className="mt-8">
      <p className="text-[clamp(2rem,4vw,2.8rem)] leading-none tracking-[-0.03em] tabular-nums" aria-live="polite">
        {formatarPreco(opcao.precoCentavos)}
      </p>
      {sobEncomenda ? (
        <p className="mt-4 text-mineral">
          <span className="text-paper">Feito sob encomenda:</span> produzido depois da confirmação do pagamento, chega em {prazoEncomenda}.
        </p>
      ) : null}

      {produto.opcoes.length > 1 ? (
        <fieldset className="mt-7">
          <legend className="tecnica text-mineral-dim">{produto.rotuloOpcoes || 'Opção'}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {produto.opcoes.map((o) => (
              <label key={o.id} className="cursor-pointer">
                <input
                  type="radio"
                  name={`${prefixo}-opcao`}
                  value={o.id}
                  checked={o.id === opcaoId}
                  onChange={() => { setOpcaoId(o.id); setAdicionado(false); }}
                  className="peer sr-only"
                />
                <span className="alvo-toque inline-flex items-center gap-2 rounded-full border border-line-strong px-4 text-sm text-paper transition-colors peer-checked:border-signal peer-checked:bg-signal/10 peer-checked:text-signal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-signal hover:border-mineral-dim">
                  {o.rotulo}
                  {new Set(produto.opcoes.map((x) => x.precoCentavos)).size > 1 ? (
                    <span className="text-mineral tabular-nums">· {formatarPreco(o.precoCentavos)}</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <div role="group" aria-label="Quantidade" className="inline-flex items-center rounded-full border border-line-strong">
          <button type="button" aria-label="Diminuir quantidade" disabled={quantidade <= 1}
            onClick={() => { setQuantidade((q) => Math.max(1, q - 1)); setAdicionado(false); }}
            className="alvo-toque grid place-items-center rounded-full text-lg text-paper disabled:opacity-40">−</button>
          <output aria-live="polite" className="min-w-8 text-center tabular-nums">{quantidade}</output>
          <button type="button" aria-label="Aumentar quantidade" disabled={quantidade >= MAXIMO_POR_ITEM}
            onClick={() => { setQuantidade((q) => Math.min(MAXIMO_POR_ITEM, q + 1)); setAdicionado(false); }}
            className="alvo-toque grid place-items-center rounded-full text-lg text-paper disabled:opacity-40">+</button>
        </div>
        <button type="button" onClick={() => { colocar(); setAdicionado(true); }}
          className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full bg-signal px-6 text-ink transition-colors hover:bg-glow">
          Adicionar à sacola
        </button>
        <button type="button" onClick={() => { colocar(); router.push(ROTA_DO_PEDIDO); }}
          className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors hover:border-signal">
          Pedir agora <span aria-hidden="true">→</span>
        </button>
      </div>

      <p role="status" className="mt-4 min-h-6 text-sm text-signal">
        {adicionado ? (
          <>Adicionado à sacola. <Link href={ROTA_DO_PEDIDO} className="underline underline-offset-4">Ver a sacola e fazer o pedido →</Link></>
        ) : null}
      </p>
    </div>
  );
}
