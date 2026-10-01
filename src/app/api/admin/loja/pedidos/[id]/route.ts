import { atualizarPedidoLoja, excluirPedidoLoja } from '@/lib/loja/repositorio';
import { parseAlteracaoPedidoLoja } from '@/lib/loja/validacao';
import { adminGuard, jsonError } from '@/lib/onboarding/http';

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id } = await params;
    return Response.json({ item: await atualizarPedidoLoja(id, parseAlteracaoPedidoLoja(await request.json())) });
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
