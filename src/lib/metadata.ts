import type { Metadata } from 'next';
import { SITE_URL, site, urlAbsoluta } from '@/content/site';

export const OG = {
  estudio: '/og/blajeen-labs.png',
  /** O brasão da Blajeen Labs, centralizado: o recorte quadrado do WhatsApp mostra o brasão inteiro. */
  loja: '/og/loja.jpg',
  revalio: '/og/revalio.png',
  docalio: '/og/docalio.png',
  gramelio: '/og/gramelio.png',
  catelio: '/projects/catelio/catelio-icon-512.png',
  morvelio: '/projects/morvelio/morvelio-icon-montanha-nome-v04.webp',
  mazelio: '/projects/mazelio/mazelio-icon-rei-v2.webp',
  socialio: '/projects/socialio/socialio-icon-cafe.webp',
} as const;

type Entrada = {
  titulo: string;
  descricao: string;
  rota: string;
  imagem?: string;
  imagemAlt?: string;
  ogTitulo?: string;
  ogDescricao?: string;
  /** Evita herdar uma arte genérica em páginas de produto que ainda não possuem imagem própria. */
  semImagem?: boolean;
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
  imagemAlt = 'Blajeen Labs — produtos digitais, jogos e soluções personalizadas.',
  ogTitulo,
  ogDescricao,
  semImagem = false,
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
      images: semImagem ? [] : [{ url: urlAbsoluta(imagem), width: imagem === OG.morvelio ? 512 : 1200, height: imagem === OG.morvelio ? 512 : 630, alt: imagemAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitulo ?? titulo,
      description: ogDescricao ?? descricao,
      images: semImagem ? [] : [urlAbsoluta(imagem)],
    },
  };
}

/**
 * Schema `Organization` com dados verdadeiros apenas.
 *
 * Sem endereço, CNPJ, fundador nomeado ou telefone: nada disso está confirmado. A única rede
 * publicada é o Instagram oficial informado pelo titular. `SoftwareApplication`/`VideoGame` só
 * entram quando existirem URLs de loja.
 */
export function schemaOrganizacao() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.nome,
    url: SITE_URL,
    description: site.descricao,
    logo: urlAbsoluta(OG.estudio),
    sameAs: [site.instagram.url],
  };
}
