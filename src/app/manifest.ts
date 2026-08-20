import type { MetadataRoute } from 'next';
import { metadados } from '@/content/home';
import { site } from '@/content/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: metadados.titulo,
    short_name: site.nome,
    description: metadados.descricao,
    start_url: '/',
    display: 'standalone',
    background_color: '#090a08',
    theme_color: '#090a08',
    lang: site.idioma,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
