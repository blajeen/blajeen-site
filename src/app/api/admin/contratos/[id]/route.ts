import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { atualizarContrato, buscarContrato, excluirContrato, type AlteracaoContrato } from '@/lib/contracts/repository';
import { paraAdmin, renovarLink } from '@/lib/contracts/service';
import { parseCliente, parseTermos } from '@/lib/contracts/validation';
import { atualizarPedido } from '@/lib/pedidos/repository';

type Contexto = { params: Promise<{ id: string }> };

/** Ações de um clique no painel. Cada uma registra a data do acontecimento. */
const ACOES = ['assinado', 'desfazer-assinado', 'entrada', 'desfazer-entrada', 'saldo', 'desfazer-saldo', 'cancelar', 'reabrir', 'renovar-link'] as const;
type Acao = (typeof ACOES)[number];

export async function GET(_request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  const { id } = await params;
  const contrato = await buscarContrato(id);
  return contrato ? Response.json({ item: paraAdmin(contrato) }) : jsonError(new Error('Contrato não encontrado.'), 404);
}

export async function PATCH(request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id } = await params;
    const atual = await buscarContrato(id);
    if (!atual) return jsonError(new Error('Contrato não encontrado.'), 404);
    const corpo = await request.json() as Record<string, unknown>;
    const agora = new Date().toISOString();

    if (typeof corpo.acao === 'string') {
      if (!(ACOES as readonly string[]).includes(corpo.acao)) throw new Error('Ação desconhecida.');
      const acao = corpo.acao as Acao;
      if (acao === 'renovar-link') return Response.json({ item: paraAdmin(await renovarLink(id)) });
      const alteracao: AlteracaoContrato = {
        assinado: { status: 'ASSINADO' as const, assinadoEm: agora },
        'desfazer-assinado': { status: atual.clienteEnviadoEm ? 'PREENCHIDO' as const : 'AGUARDANDO_CLIENTE' as const, assinadoEm: null },
        entrada: { entradaRecebidaEm: agora },
        'desfazer-entrada': { entradaRecebidaEm: null },
        saldo: { saldoRecebidoEm: agora },
        'desfazer-saldo': { saldoRecebidoEm: null },
        cancelar: { status: 'CANCELADO' as const },
        // Reabrir devolve o link ao cliente para corrigir os dados enviados.
        reabrir: { status: 'AGUARDANDO_CLIENTE' as const, clienteEnviadoEm: null },
      }[acao];
      const contrato = await atualizarContrato(id, alteracao);
      if (contrato.pedidoId && acao === 'assinado') await atualizarPedido(contrato.pedidoId, { status: 'FECHADO' }).catch(() => undefined);
      return Response.json({ item: paraAdmin(contrato) });
    }

    const alteracao: AlteracaoContrato = {};
    if (corpo.termos !== undefined) alteracao.termos = { ...parseTermos(corpo.termos) };
    if (corpo.cliente !== undefined) alteracao.cliente = { ...parseCliente(corpo.cliente, false), ...(atual.cliente.aceite_em ? { aceite_em: atual.cliente.aceite_em } : {}) };
    return Response.json({ item: paraAdmin(await atualizarContrato(id, alteracao)) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id } = await params;
    await excluirContrato(id);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
