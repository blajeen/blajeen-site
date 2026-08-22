import Image from 'next/image';

type Props = {
  readonly src: string;
  readonly alt: string;
  readonly sizes: string;
  readonly label?: string;
  readonly largura?: number;
  readonly altura?: number;
  readonly prioridade?: boolean;
  readonly className?: string;
  readonly imageClassName?: string;
};

/**
 * Moldura única para capturas reais de sites e sistemas.
 *
 * A imagem nunca é recortada: a área interna acompanha a proporção original informada e usa
 * `object-contain`. Isso impede que menus, textos e controles desapareçam quando a captura entra
 * em cartões de larguras diferentes.
 */
export function SystemScreenshot({
  src,
  alt,
  sizes,
  label = 'DEMONSTRAÇÃO DO PRODUTO',
  largura = 16,
  altura = 9,
  prioridade = false,
  className,
  imageClassName,
}: Props) {
  return (
    <div
      className={[
        'overflow-hidden rounded-[var(--radius-panel)] border border-line-strong bg-[#090b09] shadow-[var(--shadow-panel)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex h-9 items-center gap-2 border-b border-line bg-[#11140f] px-4" aria-hidden="true">
        <span className="size-1.5 rounded-full bg-[#ef7777]" />
        <span className="size-1.5 rounded-full bg-[#e8ba62]" />
        <span className="size-1.5 rounded-full bg-[#92b876]" />
        <span className="tecnica ml-2 truncate text-[9px] text-mineral-dim">{label}</span>
      </div>
      <div className="relative w-full overflow-hidden bg-[#090b09]" style={{ aspectRatio: `${largura} / ${altura}` }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={prioridade}
          className={['object-contain object-top', imageClassName].filter(Boolean).join(' ')}
        />
      </div>
    </div>
  );
}
