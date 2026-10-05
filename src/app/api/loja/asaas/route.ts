import { emailDoPainel, enviarAvisoAoEstudio } from '@/lib/admin/email';
import { baseDoSite } from '@/lib/contracts/service';
import { statusDoEvento, tokenDoWebhookValido } from '@/lib/loja/asaas';
import { linhasDoPedido } from '@/lib/loja/aviso';
import {
  atualizarPedidoLoja, buscarPedidoLoja, esquecerEventoDePagamento, marcarSoftwareVendido, registrarEventoDePagamento,
} from '@/lib/loja/repositorio';
import { revalidarLoja } from '@/lib/loja/revalidar';
import type { PedidoLojaStatus } from '@/lib/loja/tipos';

type Evento = {
  id?: string;
  event?: string;
  payment?: { id?: string; externalReference?: string; status?: string; invoiceUrl?: string };
};

/** Situações de onde um pagamento confirmado pode levar o pedido a "pago" sem atropelar o envio. */
const ANTES_DO_PAGAMENTO: PedidoLojaStatus[] = ['AGUARDANDO_PAGAMENTO', 'NOVO', 'CANCELADO'];

/**
 * Webhook do Asaas: cadastre `https://<site>/api/loja/asaas` no painel do Asaas, com o mesmo token
 * de `ASAAS_WEBHOOK_TOKEN`, e os eventos de cobrança.
 *
 * Responde 200 depressa. Evento repetido é ignorado; cobrança que não é da loja (outra venda da
 * mesma conta) também. Se o tratamento falhar, responde 500 e o evento sai do registro, para o
 * Asaas entregá-lo de novo.
 */
export async function POST(request: Request) {
  if (!tokenDoWebhookValido(request.headers.get('asaas-access-token'))) {
    return Response.json({ error: 'Token inválido.' }, { status: 401 });
  }
  const evento = await request.json().catch(() => ({})) as Evento;
  const pagamento = evento.payment;
  if (!evento.event?.startsWith('PAYMENT_') || !pagamento?.id) return Response.json({ ok: true });

  const eventoId = evento.id ?? `${evento.event}:${pagamento.id}`;
  if (!(await registrarEventoDePagamento(eventoId, evento.event, pagamento.id))) return Response.json({ ok: true, repetido: true });

  try {
    const pedido = pagamento.externalReference ? await buscarPedidoLoja(pagamento.externalReference) : null;
    if (!pedido || (pedido.pagamento && pedido.pagamento.cobrancaId !== pagamento.id)) return Response.json({ ok: true, ignorado: true });

    const destino = statusDoEvento(evento.event);
    const muda = destino === 'PAGO' ? ANTES_DO_PAGAMENTO.includes(pedido.status)
      : destino === 'CANCELADO' ? pedido.status === 'AGUARDANDO_PAGAMENTO'
        : destino === 'ESTORNADO';
    // Software é venda única: pago, ele sai de venda antes de tudo, para não ser vendido de novo. Se
    // algo falhar depois, o Asaas entrega o evento outra vez, e marcar de novo não muda nada.
    const vendidos = muda && destino === 'PAGO' ? await marcarSoftwareVendido(pedido.itens.map((i) => i.produtoId)) : [];
    if (vendidos.length) revalidarLoja(...vendidos.map((p) => p.slug));
    const atualizado = await atualizarPedidoLoja(pedido.id, {
      pagamento: {
        provedor: 'asaas',
        cobrancaId: pagamento.id,
        url: pedido.pagamento?.url ?? pagamento.invoiceUrl ?? '',
        status: pagamento.status ?? evento.event,
      },
      ...(muda && destino ? { status: destino } : {}),
    });

    if (muda && destino === 'PAGO') {
      const proximoPasso = vendidos.length
        ? `O Asaas confirmou o pagamento. ${vendidos.map((p) => p.nome).join(' e ')} ${vendidos.length > 1 ? 'saíram de venda e aparecem como vendidos' : 'saiu de venda e aparece como vendido'} na loja: combine com a pessoa a entrega do código e, se ela quiser, a troca do nome.${atualizado.itens.some((i) => !i.digital) ? ' Os itens físicos seguem para separar e postar.' : ''}`
        : 'O Asaas confirmou o pagamento. Hora de separar e postar.';
      const envio = await enviarAvisoAoEstudio(
        `Pedido pago — ${atualizado.nome} (${atualizado.numero})`,
        emailDoPainel('Pedido pago na loja', linhasDoPedido(atualizado), proximoPasso,
          `${baseDoSite()}/admin/loja?pedido=${atualizado.id}`, 'Ver no painel'),
        atualizado.email,
      );
      if (envio !== 'PENDING') await atualizarPedidoLoja(atualizado.id, { emailStatus: envio });
    }
    return Response.json({ ok: true });
  } catch {
    await esquecerEventoDePagamento(eventoId).catch(() => undefined);
    return Response.json({ error: 'Falha ao tratar o evento.' }, { status: 500 });
  }
}
