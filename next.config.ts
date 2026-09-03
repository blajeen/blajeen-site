import type { NextConfig } from 'next';

/**
 * Primeira publicação sem analytics, pixels, cookies não essenciais ou rede externa.
 * A CSP proíbe qualquer origem remota de script, estilo, fonte ou imagem: as fontes são
 * auto-hospedadas e as imagens são arquivos estáticos do próprio site.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // O React usa eval apenas para reconstruir stack traces no servidor de desenvolvimento.
  // A política publicada continua sem `unsafe-eval`.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /*
   * `CLAUDE.md` é documento de produto escrito à mão e fonte de verdade do projeto.
   * O `next dev` anexa um bloco próprio nele por padrão; aqui isso fica desligado.
   */
  agentRules: false,
  // O QA visual acessa o servidor de desenvolvimento por 127.0.0.1.
  allowedDevOrigins: ['127.0.0.1'],
  /**
   * Documentos públicos do Gramelio são HTML estático fornecido pelo próprio jogo. As reescritas
   * preservam as URLs sem extensão exigidas pelas lojas, enquanto mantêm o texto e a estrutura
   * legal exatamente iguais aos arquivos revisados no repositório do jogo.
   */
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/gramelio/privacy', destination: '/gramelio/privacy.html' },
        { source: '/gramelio/suporte', destination: '/gramelio/suporte.html' },
      ],
    };
  },
  images: {
    // O otimizador da hospedagem passou a responder 402 (pagamento exigido).
    // Servir os arquivos locais evita que esse bloqueio esconda fotos, ícones e banners.
    // Os SaaS já usam WebP e novos ícones são compactados antes da publicação.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 390, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [96, 160, 240, 320, 480],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
