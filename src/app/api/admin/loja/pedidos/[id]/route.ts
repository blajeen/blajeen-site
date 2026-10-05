import { atualizarPedidoLoja, buscarPedidoLoja, excluirPedidoLoja, marcarSoftwareVendido } from '@/lib/loja/repositorio';
import { revalidarLoja } from '@/lib/loja/revalidar';
import { parseAlteracaoPedidoLoja } from '@/lib/loja/validacao';
import { adminGuard, jsonError } from '@/lib/onboarding/http';

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id } = await params;
    const alteracao = parseAlteracaoPedidoLoja(await request.json());
    const antes = alteracao.status === 'PAGO' ? await buscarPedidoLoja(id) : null;
    const item = await atualizarPedidoLoja(id, alteracao);
    // Pagamento combinado por fora e marcado aqui: o software do pedido sai de venda, como no webhook.
    // Só na passagem para "Pago": editar as anotações de um pedido antigo não tira de venda um
    // software que o estúdio pôs à venda de novo.
    if (antes && antes.status !== 'PAGO' && item.status === 'PAGO') {
      const vendidos = await marcarSoftwareVendido(item.itens.map((i) => i.produtoId));
      if (vendidos.length) revalidarLoja(...vendidos.map((p) => p.slug));
    }
    return Response.json({ item });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id } = await params;
    await excluirPedidoLoja(id);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
