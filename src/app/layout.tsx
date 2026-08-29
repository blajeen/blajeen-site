import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { LabProps } from '@/components/brand/LabProps';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SkipLink } from '@/components/layout/SkipLink';
import { BootSequence } from '@/components/motion/BootSequence';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { metadados } from '@/content/home';
import { SITE_INDEXAVEL, SITE_URL, site } from '@/content/site';
import { OG, schemaOrganizacao } from '@/lib/metadata';
import './globals.css';

/**
 * Fontes auto-hospedadas.
 *
 * Os arquivos vivem em `src/assets/fonts`, com as licenças SIL OFL ao lado. Não há requisição a
 * Google Fonts nem a qualquer outra origem — em desenvolvimento, no build ou em produção.
 *
 * `display` foi medido, não escolhido por hábito:
 * - a fonte de display usa `swap` com o fallback de métrica ajustada que o Next gera, o que mantém
 *   o texto pintando cedo sem deslocar a composição;
 * - a monoespaçada usa `optional`. Ela compõe as linhas técnicas em caixa alta, cuja quebra muda
 *   entre a fonte de sistema e a JetBrains Mono — era daí que vinha quase todo o CLS do hero.
 *   Com `optional` não existe troca depois da primeira pintura.
 */
const inter = localFont({
  src: '../assets/fonts/inter-latin-variable.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
});

const mono = localFont({
  src: '../assets/fonts/jetbrains-mono-latin-variable.woff2',
  weight: '100 800',
  style: 'normal',
  display: 'optional',
  variable: '--font-mono-tech',
  preload: true,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: metadados.titulo,
    template: '%s — Blajeen Labs',
  },
  description: metadados.descricao,
  applicationName: site.nome,
  // Reforça o robots.txt no próprio HTML enquanto o site não estiver pronto para publicar.
  robots: SITE_INDEXAVEL ? undefined : { index: false, follow: false },
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
  /* A marca oficial do laboratório também identifica a aba e o atalho no celular. */
  icons: {
    icon: [
      { url: '/brand/blajeen-labs-logo.png', sizes: '1536x1536', type: 'image/png' },
    ],
    apple: [{ url: '/brand/blajeen-labs-logo.png', sizes: '1536x1536', type: 'image/png' }],
  },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: 'website',
    siteName: site.nome,
    locale: 'pt_BR',
    url: SITE_URL,
    title: metadados.ogTitulo,
    description: metadados.ogDescricao,
    images: [{ url: OG.estudio, width: 1200, height: 630, alt: 'BLAJEEN LABS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: metadados.ogTitulo,
    description: metadados.ogDescricao,
    images: [OG.estudio],
  },
};

export const viewport: Viewport = {
  themeColor: '#090a08',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.idioma} className={`${inter.variable} ${mono.variable}`} data-motion="on">
      <body className="min-h-dvh antialiased">
        <MotionProvider>
          <BootSequence />
          <SkipLink />
          {/* Camada de ambiente: acompanha a rolagem, atrás de todo o conteúdo. */}
          <LabProps />
          <SiteHeader />
          <main id="conteudo" className="pt-16 sm:pt-[4.5rem]">
            {children}
          </main>
          <SiteFooter />
        </MotionProvider>

        <script
          type="application/ld+json"
          // Dados estruturados estáticos, gerados a partir do conteúdo tipado do repositório.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganizacao()) }}
        />
      </body>
    </html>
  );
}
