import { emailDoPainel, enviarAvisoAoEstudio } from '@/lib/admin/email';
import { checkRateLimit, clientIp, jsonError } from '@/lib/onboarding/http';
import { atualizarPedido, criarPedido } from '@/lib/pedidos/repository';
import { parseNovoPedido } from '@/lib/pedidos/validation';

/** Formulário público "Crie seu projeto": grava o pedido no painel e avisa o estúdio por e-mail. */
export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`pedido:${clientIp(request)}`, 5, 10 * 60_000)) {
      return jsonError(new Error('Muitos envios seguidos. Tente novamente em alguns minutos.'), 429);
    }
    const { pedido, robo } = parseNovoPedido(await request.json());
    // Robôs recebem a mesma resposta de sucesso, sem gravar nada.
    if (robo) return Response.json({ ok: true }, { status: 201 });

    const criado = await criarPedido(pedido);
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const envio = await enviarAvisoAoEstudio(
      `Novo pedido de projeto — ${criado.nome} (${criado.tipo})`,
      emailDoPainel('Novo pedido de projeto', [
        ['Nome', criado.nome], ['Tipo', criado.tipo], ['E-mail', criado.email], ['Telefone', criado.telefone],
      ], criado.ideia, `${base}/admin/pedidos?id=${criado.id}`, 'Ver no painel'),
      criado.email,
    );
    if (envio !== 'PENDING') await atualizarPedido(criado.id, { emailStatus: envio });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
