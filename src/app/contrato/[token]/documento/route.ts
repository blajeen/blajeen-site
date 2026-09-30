import { renderizarContrato } from '@/lib/contracts/documento';
import { carregarCatalogo, contratoDoLink } from '@/lib/contracts/service';

type Contexto = { params: Promise<{ token: string }> };

/** Contrato completo para o cliente ler antes de enviar os dados, e baixar depois. */
export async function GET(_request: Request, { params }: Contexto) {
  const { token } = await params;
  const estado = await contratoDoLink(token);
  const cabecalhos = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' };
  if (estado.tipo !== 'ok') return new Response('Este link não está disponível. Fale com a Blajeen Labs.', { status: 404, headers: cabecalhos });
  const html = renderizarContrato(estado.contrato, await carregarCatalogo(), { voltarPara: `/contrato/${token}`, rotuloVoltar: '← Voltar' });
  return new Response(html, { headers: cabecalhos });
}
