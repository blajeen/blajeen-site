import { catalogoVigente } from '@/lib/contracts/catalogo';
import { renderizarCatalogo } from '@/lib/contracts/catalogo-documento';
import { carregarCatalogo } from '@/lib/contracts/service';

/**
 * Catálogo de serviços para qualquer pessoa baixar, com os valores vigentes do painel. É o mesmo
 * documento que o painel imprime; o PDF sai do "Salvar como PDF" do navegador.
 */
export async function GET() {
  const catalogo = await carregarCatalogo().catch(() => catalogoVigente());
  return new Response(renderizarCatalogo(catalogo, { publico: true }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Um minuto na borda: o preço salvo no painel aparece logo, sem consultar o banco a cada visita.
      'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}
