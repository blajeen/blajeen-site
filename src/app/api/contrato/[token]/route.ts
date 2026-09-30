import { checkRateLimit, clientIp, jsonError } from '@/lib/onboarding/http';
import { receberDadosDoCliente } from '@/lib/contracts/service';

type Contexto = { params: Promise<{ token: string }> };

/** Envio dos dados do CONTRATANTE pelo link exclusivo. Depois do envio, a edição fica travada. */
export async function POST(request: Request, { params }: Contexto) {
  try {
    if (!checkRateLimit(`contrato:${clientIp(request)}`, 10, 10 * 60_000)) {
      return jsonError(new Error('Muitas tentativas seguidas. Tente novamente em alguns minutos.'), 429);
    }
    const { token } = await params;
    await receberDadosDoCliente(token, await request.json());
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
