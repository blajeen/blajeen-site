import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { listarContratos } from '@/lib/contracts/repository';
import { novoContrato, paraAdmin } from '@/lib/contracts/service';
import { isServico, parseCliente, parseTermos } from '@/lib/contracts/validation';
import { atualizarPedido, buscarPedido } from '@/lib/pedidos/repository';

export async function GET() {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    return Response.json({ itens: (await listarContratos()).map(paraAdmin) });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: Request) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const corpo = await request.json() as Record<string, unknown>;
    if (!isServico(corpo.servico)) throw new Error('Escolha o serviço do contrato.');
    const termos = parseTermos(corpo.termos);
    const cliente = parseCliente(corpo.cliente, false);
    const pedidoId = typeof corpo.pedidoId === 'string' && corpo.pedidoId ? corpo.pedidoId : null;
    if (pedidoId && !(await buscarPedido(pedidoId))) throw new Error('Pedido de origem não encontrado.');
    const contrato = await novoContrato(corpo.servico, termos, cliente, pedidoId);
    if (pedidoId) await atualizarPedido(pedidoId, { status: 'PROPOSTA' });
    return Response.json({ item: paraAdmin(contrato) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
