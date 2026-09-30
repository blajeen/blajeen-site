import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { atualizarPedido, excluirPedido } from '@/lib/pedidos/repository';
import { parseAlteracaoPedido } from '@/lib/pedidos/validation';

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id } = await params;
    return Response.json({ item: await atualizarPedido(id, parseAlteracaoPedido(await request.json())) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id } = await params;
    await excluirPedido(id);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
