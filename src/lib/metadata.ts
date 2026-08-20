import type { Metadata } from 'next';
import { SITE_URL, site, urlAbsoluta } from '@/content/site';

export const OG = {
  estudio: '/og/blajeen-labs.png',
  revalio: '/og/revalio.png',
  docalio: '/og/docalio.png',
  gramelio: '/og/gramelio.png',
} as const;

type Entrada = {
  titulo: string;
  descricao: string;
  rota: string;
  imagem?: string;
  imagemAlt?: string;
  ogTitulo?: string;
  ogDescricao?: string;
};

/**
 * Metadados por rota, com canonical no domínio definitivo.
 *
 * Enquanto `NEXT_PUBLIC_SITE_URL` não estiver configurado, `SITE_URL` cai para localhost e o
 * `npm run check:content` recusa a publicação — nenhum domínio é inventado aqui.
 */
export function metadadosDaRota({
  titulo,
  descricao,
  rota,
  imagem = OG.estudio,
  imagemAlt = 'BLAJEEN LABS — Build strange things. Make them matter.',
  ogTitulo,
  ogDescricao,
}: Entrada): Metadata {
  const url = urlAbsoluta(rota);

  return {
    // Absoluto: cada rota define o título inteiro, sem o template do layout duplicar o sufixo.
    title: { absolute: titulo },
    description: descricao,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: site.nome,
      locale: 'pt_BR',
      url,
      title: ogTitulo ?? titulo,
      description: ogDescricao ?? descricao,
      images: [{ url: urlAbsoluta(imagem), width: 1200, height: 630, alt: imagemAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitulo ?? titulo,
      description: ogDescricao ?? descricao,
      images: [urlAbsoluta(imagem)],
    },
  };
}

/**
 * Schema `Organization` com dados verdadeiros apenas.
 *
 * Sem endereço, CNPJ, fundador nomeado, redes sociais, telefone ou logo de terceiros: nada disso
 * está confirmado. `SoftwareApplication`/`VideoGame` só entram quando existirem URLs de loja.
 */
export function schemaOrganizacao() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.nome,
    url: SITE_URL,
    description: site.descricao,
    logo: urlAbsoluta(OG.estudio),
  };
}
