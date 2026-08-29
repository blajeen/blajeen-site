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
 * jogo nem a assinatura Blajeen Labs sejam cortados em nenhuma largura de tela.
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

      <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center rounded-full border border-white/15 bg-ink/70 p-1.5 shadow-lg backdrop-blur-sm sm:left-5 sm:top-5 sm:p-2">
        <Image
          src="/brand/blajeen-labs-logo.png"
          alt="Blajeen Labs"
          width={64}
          height={64}
          sizes="32px"
          className="size-7 rounded-full object-cover sm:size-8"
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
