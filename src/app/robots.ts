import type { MetadataRoute } from 'next';
import { SITE_INDEXAVEL, urlAbsoluta } from '@/content/site';

/**
 * Quando o site estiver publicado, tudo é indexável: as rotas jurídicas precisam ser encontráveis
 * pelas lojas e por quem procura como apagar seus dados.
 *
 * Antes disso — domínio indefinido ou bloqueador humano em aberto — o site se recusa à indexação
 * inteira. Um deploy de revisão não pode deixar política e termos não aprovados no índice.
 */
/**
 * Os robôs da Meta não indexam nada: leem a página para confirmar a posse do domínio
 * (meta tag `facebook-domain-verification`) e montar a prévia de links. Ficam liberados mesmo com o
 * resto bloqueado, senão a verificação do domínio falha.
 */
const ROBOS_META = { userAgent: ['facebookexternalhit', 'Facebot'], allow: '/' };

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXAVEL) {
    return { rules: [ROBOS_META, { userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [ROBOS_META, { userAgent: '*', allow: '/' }],
    sitemap: urlAbsoluta('/sitemap.xml'),
    host: urlAbsoluta('/'),
  };
}
