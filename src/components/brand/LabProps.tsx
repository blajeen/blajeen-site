'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useMotion } from '@/components/motion/MotionProvider';
import { usePiscada } from '@/components/motion/usePiscada';
import styles from './LabProps.module.css';

const MASCOTE = { largura: 801, altura: 900 };
const FRASCO = { largura: 1224, altura: 1285 };

/**
 * Adereços fixos do laboratório: o mascote no alto à direita, o frasco no pé à esquerda.
 *
 * Ficam em uma única camada montada no layout, então acompanham a rolagem e aparecem em todas as
 * páginas sem serem repetidos seção a seção.
 *
 * São puramente decorativos: `aria-hidden`, sem texto alternativo, sem ponteiro e atrás do
 * conteúdo. Com movimento reduzido ou desligado, o mascote fica de olhos abertos e o frasco para.
 * Remover esta camada não muda nada do que o site comunica.
 */
export function LabProps() {
  const { ativo } = useMotion();
  const [carregadas, setCarregadas] = useState(0);
  const fechado = usePiscada(ativo, { pronto: carregadas >= 2 });

  const registrarCarga = () => setCarregadas((total) => total + 1);

  return (
    <div className={styles.camada} aria-hidden="true">
      <div className={styles.mascote} data-adereco="mascote">
        <Image
          src="/brand/dinorobo-olhos-abertos.png"
          alt=""
          width={MASCOTE.largura}
          height={MASCOTE.altura}
          sizes="(min-width: 64rem) 176px, 88px"
          loading="lazy"
          fetchPriority="low"
          onLoad={registrarCarga}
          className={styles.pose}
          data-visivel={!fechado}
        />
        <Image
          src="/brand/dinorobo-olhos-fechados.png"
          alt=""
          width={MASCOTE.largura}
          height={MASCOTE.altura}
          sizes="(min-width: 64rem) 176px, 88px"
          loading="lazy"
          fetchPriority="low"
          onLoad={registrarCarga}
          className={styles.pose}
          data-visivel={fechado}
        />
      </div>

      <div className={styles.frasco} data-adereco="frasco" data-flutua={ativo}>
        <Image
          src="/brand/vial.png"
          alt=""
          width={FRASCO.largura}
          height={FRASCO.altura}
          sizes="(min-width: 64rem) 88px, 44px"
          loading="lazy"
          fetchPriority="low"
          className={styles.arte}
        />
      </div>
    </div>
  );
}
