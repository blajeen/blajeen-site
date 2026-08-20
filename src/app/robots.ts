import type { MetadataRoute } from 'next';
import { SITE_INDEXAVEL, urlAbsoluta } from '@/content/site';

/**
 * Quando o site estiver publicado, tudo é indexável: as rotas jurídicas precisam ser encontráveis
 * pelas lojas e por quem procura como apagar seus dados.
 *
 * Antes disso — domínio indefinido ou bloqueador humano em aberto — o site se recusa à indexação
 * inteira. Um deploy de revisão não pode deixar política e termos não aprovados no índice.
 */
export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXAVEL) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: urlAbsoluta('/sitemap.xml'),
    host: urlAbsoluta('/'),
  };
}
