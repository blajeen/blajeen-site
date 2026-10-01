import { listarPedidosLoja } from '@/lib/loja/repositorio';
import { adminGuard, jsonError } from '@/lib/onboarding/http';

export async function GET() {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    return Response.json({ itens: await listarPedidosLoja() });
  } catch (error) {
    return jsonError(error, 500);
  }
}
