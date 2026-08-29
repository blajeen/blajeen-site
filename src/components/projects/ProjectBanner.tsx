import Image from 'next/image';
import type { Project } from '@/content/types';

type Props = {
  projeto: Project;
  /**
   * Só quando o banner for o LCP da rota atual. Na home o LCP é a marca do hero, então os dois
   * banners carregam de forma preguiçosa; nas páginas de produto, apenas o banner daquele produto
   * recebe prioridade.
   */
  prioridade?: boolean;
  sizes: string;
  className?: string;
};

/**
 * Banner aprovado de um projeto.
 *
 * A arte 1672×941 é usada inteira. Não existe recorte: `width`/`height` fixam a proporção,
 * a imagem ocupa 100% da largura e a altura acompanha. É isso que garante que nem o título do
 * jogo nem a composição sejam cortados em nenhuma largura de tela. A marca do laboratório entra
 * como uma marca-d'água discreta no canto superior direito, sem cápsula ou fundo opaco.
 * Os PNGs são os mestres; o build entrega AVIF/WebP responsivos com as mesmas cores.
 */
export function ProjectBanner({ projeto, prioridade = false, sizes, className }: Props) {
  return (
    <div
      className={[
        'group/banner relative overflow-hidden rounded-[var(--radius-panel)] border border-line bg-surface',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Image
        src={projeto.banner.src}
        alt={projeto.banner.alt}
        width={projeto.banner.largura}
        height={projeto.banner.altura}
        sizes={sizes}
        priority={prioridade}
        {...(prioridade
          ? {}
          : // Fora do LCP, o banner não pode competir por banda com o CSS, a fonte e o script
            // do caminho crítico: na home isso adiava a primeira pintura do hero.
            { loading: 'lazy' as const, fetchPriority: 'low' as const })}
        className="block h-auto w-full"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 inline-flex opacity-30 mix-blend-screen drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] sm:right-4 sm:top-4"
      >
        <Image
          src="/brand/blajeen-labs-logo-header.png"
          alt=""
          width={64}
          height={64}
          sizes="(min-width: 640px) 36px, 28px"
          unoptimized
          className="size-7 rounded-full object-cover sm:size-9"
        />
      </span>

      {/* Scanline única no foco/hover do showcase — sem loop permanente. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-signal/10 to-transparent transition-transform duration-[900ms] ease-[var(--ease-lab)] group-hover/showcase:translate-x-full group-focus-within/showcase:translate-x-full"
      />
    </div>
  );
}
