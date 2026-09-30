import { temSessaoAdmin } from '@/lib/admin/sessao';
import { renderizarCatalogo } from '@/lib/contracts/catalogo-documento';
import { carregarCatalogo } from '@/lib/contracts/service';

/** Catálogo de serviços com os preços vigentes, para imprimir ou salvar em PDF. */
export async function GET(request: Request) {
  if (!(await temSessaoAdmin())) return Response.redirect(new URL('/admin/login', request.url), 303);
  return new Response(renderizarCatalogo(await carregarCatalogo()), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
  });
}
