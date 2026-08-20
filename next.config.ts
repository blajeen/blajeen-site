import type { NextConfig } from 'next';

/**
 * Primeira publicação sem analytics, pixels, cookies não essenciais ou rede externa.
 * A CSP proíbe qualquer origem remota de script, estilo, fonte ou imagem: as fontes são
 * auto-hospedadas e os banners são servidos pelo próprio otimizador do Next.
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
  images: {
    // Os PNGs 1672×941 permanecem como mestres; o build entrega derivados AVIF/WebP.
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
