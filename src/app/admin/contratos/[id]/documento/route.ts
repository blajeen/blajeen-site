import { temSessaoAdmin } from '@/lib/admin/sessao';
import { renderizarContrato } from '@/lib/contracts/documento';
import { buscarContrato } from '@/lib/contracts/repository';
import { carregarCatalogo } from '@/lib/contracts/service';

type Contexto = { params: Promise<{ id: string }> };

const CABECALHOS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
};

/** Contrato completo para imprimir ou salvar em PDF, a partir do painel. */
export async function GET(request: Request, { params }: Contexto) {
  if (!(await temSessaoAdmin())) return Response.redirect(new URL('/admin/login', request.url), 303);
  const { id } = await params;
  const contrato = await buscarContrato(id);
  if (!contrato) return new Response('Contrato não encontrado.', { status: 404, headers: CABECALHOS });
  const html = renderizarContrato(contrato, await carregarCatalogo(), { voltarPara: `/admin/contratos?id=${contrato.id}`, rotuloVoltar: '← Voltar ao painel' });
  return new Response(html, { headers: CABECALHOS });
}
