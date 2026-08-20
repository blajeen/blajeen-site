'use client';

import Image from 'next/image';
import { useMotion } from '@/components/motion/MotionProvider';
import { usePiscada } from '@/components/motion/usePiscada';
import styles from './BrandLogo.module.css';

const ARTE = {
  src: '/brand/blajeen-logo.png',
  largura: 2164,
  altura: 727,
} as const;

type Props = {
  /** `true` quando a logo é o elemento de maior destaque da rota — evita atrasar o LCP. */
  prioridade?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * Logo BLAJEEN LABS.
 *
 * A arte renderizada já contém os dois `E` como lentes acesas e a gosma verde na base. O site
 * mantém a marca viva apagando as lentes por um instante, no mesmo ritmo do mascote e da marca
 * tipográfica — a imagem em si nunca é alterada.
 *
 * As lentes ficam fora da árvore de acessibilidade: quem lê por leitor de tela recebe o nome da
 * marca uma vez, pelo texto alternativo da arte.
 */
export function BrandLogo({ prioridade = false, sizes = '100vw', className }: Props) {
  const { ativo } = useMotion();
  const piscando = usePiscada(ativo);

  return (
    <div
      className={[styles.logo, className].filter(Boolean).join(' ')}
      data-marca="logo"
      data-piscando={piscando}
    >
      <Image
        src={ARTE.src}
        alt="Blajeen Labs"
        width={ARTE.largura}
        height={ARTE.altura}
        sizes={sizes}
        priority={prioridade}
        {...(prioridade ? {} : { loading: 'lazy' as const })}
        className={styles.arte}
      />
      <span className={styles.lente} data-lado="esquerda" aria-hidden="true" />
      <span className={styles.lente} data-lado="direita" aria-hidden="true" />
    </div>
  );
}
