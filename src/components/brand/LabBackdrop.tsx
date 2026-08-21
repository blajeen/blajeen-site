import Image from 'next/image';
import styles from './LabBackdrop.module.css';

type Props = {
  /** De que lado a arte se apoia. O oposto é onde o texto respira. */
  lado?: 'direita' | 'esquerda';
  className?: string;
};

/**
 * Arte de fundo atrás dos textos descritivos.
 *
 * Puramente decorativa: `aria-hidden`, sem texto alternativo, sem ponteiro, atrás do conteúdo.
 * Não anima e não depende de JavaScript — por isso é Server Component.
 *
 * O contraste do texto sobre ela é medido por `npm run qa:contraste`.
 */
export function LabBackdrop({ lado = 'direita', className }: Props) {
  return (
    <div
      className={[styles.fundo, className].filter(Boolean).join(' ')}
      data-adereco="fundo"
      data-lado={lado}
      aria-hidden="true"
    >
      <Image
        src="/brand/pc-lab.png"
        alt=""
        width={1536}
        height={1024}
        sizes="(min-width: 64rem) 900px, 100vw"
        loading="eager"
        fetchPriority="high"
        className={styles.arte}
      />
    </div>
  );
}
