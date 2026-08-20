import type { MetadataRoute } from 'next';
import { urlAbsoluta } from '@/content/site';
import { prioridadeSitemap, TODAS_AS_ROTAS } from '@/lib/routes';

/**
 * Sitemap gerado a partir de `ROTAS`, a mesma lista usada pelo rodapé, pela gaveta e pelo QA.
 * Uma rota nova entra aqui automaticamente; uma rota removida some daqui automaticamente.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const atualizacao = new Date('2026-08-16');

  return TODAS_AS_ROTAS.map((rota) => ({
    url: urlAbsoluta(rota),
    lastModified: atualizacao,
    changeFrequency: 'monthly' as const,
    priority: prioridadeSitemap(rota),
  }));
}
