import { avisoPorEmailConfigurado, destinoDosAvisos, emailDoPainel, enviarAvisoComDetalhe } from '@/lib/admin/email';
import { baseDoSite } from '@/lib/contracts/service';
import { adminGuard, checkRateLimit, clientIp, jsonError } from '@/lib/onboarding/http';

/** Situação do aviso por e-mail dos pedidos. As chaves ficam na Vercel; aqui só se diz se existem. */
export async function GET() {
  const negado = await adminGuard();
  if (negado) return negado;
  return Response.json({
    configurado: avisoPorEmailConfigurado(),
    destino: destinoDosAvisos(),
    remetente: process.env.ONBOARDING_EMAIL_FROM?.trim() ?? '',
  });
}

/** E-mail de teste, igual ao de um pedido novo, para conferir se o aviso chega. */
export async function POST(request: Request) {
  const negado = await adminGuard();
  if (negado) return negado;
  if (!checkRateLimit(`aviso-email:${clientIp(request)}`, 5, 10 * 60_000)) {
    return jsonError(new Error('Muitos testes seguidos. Tente de novo em alguns minutos.'), 429);
  }
  const { status, detalhe } = await enviarAvisoComDetalhe(
    'Teste do aviso de pedidos — Blajeen Labs',
    emailDoPainel('O aviso por e-mail está funcionando', [['Origem', 'Botão de teste do painel']],
      'Quando alguém pedir um projeto em “Crie seu projeto”, o aviso chega assim, nesta caixa.',
      `${baseDoSite()}/admin/pedidos`, 'Abrir os pedidos'),
  );
  return Response.json({ status, detalhe, destino: destinoDosAvisos() });
}
