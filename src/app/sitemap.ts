import type { MetadataRoute } from 'next';
import { urlAbsoluta } from '@/content/site';
import { listarProdutos } from '@/lib/loja/repositorio';
import { rotaDoProduto } from '@/lib/loja/tipos';
import { prioridadeSitemap, TODAS_AS_ROTAS } from '@/lib/routes';
import { wikiPaths } from '@/content/morvelio/wiki/registry';

/**
 * Sitemap gerado a partir de `ROTAS`, a mesma lista usada pelo rodapé, pela gaveta e pelo QA.
 * Uma rota nova entra aqui automaticamente; uma rota removida some daqui automaticamente.
 * As páginas dos produtos da loja vêm do painel; sem banco, o sitemap sai sem elas.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const atualizacao = new Date();

  const staticRoutes = TODAS_AS_ROTAS.map((rota) => ({
    url: urlAbsoluta(rota),
    lastModified: atualizacao,
    changeFrequency: 'monthly' as const,
    priority: prioridadeSitemap(rota),
  }));
  const produtos = (await listarProdutos({ publicados: true }).catch(() => [])).map((produto) => ({
    url: urlAbsoluta(rotaDoProduto(produto.slug)),
    lastModified: produto.atualizadoEm,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  return [...staticRoutes, ...produtos, ...wikiPaths().filter(rota => !TODAS_AS_ROTAS.some(r => r === rota)).map(rota => ({
    url: urlAbsoluta(rota), lastModified: '2026-09-27', changeFrequency: 'monthly' as const, priority: 0.6,
  }))];
}
