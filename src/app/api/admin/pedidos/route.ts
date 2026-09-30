import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { listarPedidos } from '@/lib/pedidos/repository';

export async function GET() {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    return Response.json({ itens: await listarPedidos() });
  } catch (error) {
    return jsonError(error, 500);
  }
}
