import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/Section';
import { SeloDisponibilidade } from '@/components/loja/CartaoProduto';
import { GaleriaProduto } from '@/components/loja/GaleriaProduto';
import { LinkDaSacola } from '@/components/loja/LinkDaSacola';
import { ProdutoCompra } from '@/components/loja/ProdutoCompra';
import { asaasConfigurado } from '@/lib/loja/asaas';
import { buscarProdutoPublicado, CONFIGURACAO_PADRAO, lerConfiguracaoLoja } from '@/lib/loja/repositorio';
import { CATEGORIA_ROTULO, ROTA_DA_LOJA, rotaDoProduto, textoDoPrazoDeEncomenda } from '@/lib/loja/tipos';
import { metadadosDaRota } from '@/lib/metadata';

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

async function produtoDa(params: Props['params']) {
  const { slug } = await params;
  return buscarProdutoPublicado(slug).catch(() => null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const produto = await produtoDa(params);
  if (!produto) return { title: 'Produto não encontrado — Blajeen Labs', robots: { index: false, follow: true } };
  const foto = produto.imagens[0];
  return metadadosDaRota({
    titulo: `${produto.nome} — Loja Blajeen Labs`,
    descricao: produto.resumo || `${produto.nome}, exclusivo da Blajeen Labs.`,
    rota: rotaDoProduto(produto.slug),
    // Foto enviada pelo painel vira a imagem de compartilhamento; desenho ilustrativo, não.
    ...(foto?.chave ? { imagem: foto.url, imagemAlt: foto.alt } : {}),
  });
}

export default async function ProdutoPage({ params }: Props) {
  const produto = await produtoDa(params);
  if (!produto) notFound();
  const paragrafos = produto.descricao.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const prazoEncomenda = textoDoPrazoDeEncomenda(await lerConfiguracaoLoja().catch(() => CONFIGURACAO_PADRAO));

  return (
    <Container className="pb-[clamp(4rem,9vw,9rem)] pt-[clamp(2.5rem,6vw,5rem)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={ROTA_DA_LOJA} className="tecnica alvo-toque inline-flex items-center gap-3 text-mineral transition-colors hover:text-signal">
          <span aria-hidden="true">←</span> TODOS OS EXCLUSIVOS
        </Link>
        <LinkDaSacola />
      </div>

      <article className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <GaleriaProduto imagens={produto.imagens} nome={produto.nome} />
        </div>

        <div className="lg:col-span-6 lg:pt-4">
          <p className="tecnica text-mineral-dim">
            {CATEGORIA_ROTULO[produto.categoria]}{produto.colecao ? ` · ${produto.colecao}` : ''}
          </p>
          <h1 className="mt-4 text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95] tracking-[-0.05em]">{produto.nome}</h1>
          <div className="mt-5"><SeloDisponibilidade disponibilidade={produto.disponibilidade} /></div>
          {produto.resumo ? <p className="mt-6 text-[1.1rem] leading-relaxed text-paper/85">{produto.resumo}</p> : null}

          <ProdutoCompra
            produto={{
              id: produto.id, slug: produto.slug, nome: produto.nome, rotuloOpcoes: produto.rotuloOpcoes,
              opcoes: produto.opcoes, status: produto.status, disponibilidade: produto.disponibilidade,
            }}
            imagem={produto.imagens[0]?.url ?? ''}
            prazoEncomenda={prazoEncomenda}
          />

          {paragrafos.length ? (
            <div className="medida-texto mt-10 space-y-4 border-t border-line pt-8 leading-relaxed text-mineral">
              {paragrafos.map((p) => <p key={p}>{p}</p>)}
            </div>
          ) : null}

          {produto.disponibilidade !== 'EM_BREVE' ? (
            <p className="mt-8 rounded-[var(--radius-control)] border border-line p-5 text-sm leading-relaxed text-mineral">
              <span className="tecnica mb-2 block text-signal">COMO FUNCIONA</span>
              {asaasConfigurado()
                ? 'Na sacola, você calcula o frete pelo CEP e paga com Pix, cartão ou boleto na página do Asaas.'
                : 'Você faz o pedido e deixa seu contato. O estúdio combina frete e pagamento com você antes de qualquer cobrança.'}
              {produto.disponibilidade === 'SOB_ENCOMENDA'
                ? ` Este exclusivo é feito sob encomenda: a produção começa quando o pagamento é confirmado, e o prazo de ${prazoEncomenda} já conta a produção e o transporte.`
                : null}
            </p>
          ) : null}
        </div>
      </article>
    </Container>
  );
}
