'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useMotion } from '@/components/motion/MotionProvider';
import { usePiscada } from '@/components/motion/usePiscada';
import styles from './LabProps.module.css';

const MASCOTE = { largura: 801, altura: 900 };
const FRASCO = { largura: 560, altura: 613 };
const DURACAO_DA_GOSMA = 5000;

/**
 * Adereços fixos do laboratório.
 *
 * O mascote continua sendo apenas ambientação. O frasco, por outro lado, é um pequeno segredo
 * interativo da marca: ao ser acionado, rompe, cobre a tela e depois puxa a gosma de volta.
 */
export function LabProps() {
  const { ativo } = useMotion();
  const [carregadas, setCarregadas] = useState(0);
  const [explodindo, setExplodindo] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fechado = usePiscada(ativo, { pronto: carregadas >= 2 });

  const registrarCarga = () => setCarregadas((total) => total + 1);

  const explodir = () => {
    if (explodindo) return;

    setExplodindo(true);
    temporizador.current = setTimeout(() => {
      setExplodindo(false);
      temporizador.current = null;
    }, DURACAO_DA_GOSMA);
  };

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  return (
    <>
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
      </div>

      <button
        type="button"
        className={styles.frasco}
        data-adereco="frasco"
        data-flutua={ativo && !explodindo}
        data-explodindo={explodindo}
        aria-label="Explodir o frasco de gosma"
        aria-pressed={explodindo}
        disabled={explodindo}
        onClick={explodir}
      >
        <Image
          src="/brand/vial-mechanical.png"
          alt=""
          width={FRASCO.largura}
          height={FRASCO.altura}
          sizes="(min-width: 64rem) 104px, 76px"
          loading="lazy"
          fetchPriority="low"
          className={styles.arte}
        />
      </button>

      {explodindo ? (
        <div
          className={styles.gosmaOverlay}
          data-gosma-overlay="true"
          data-movimento={ativo}
          aria-hidden="true"
        >
          <div className={styles.gosmaSuperficie} data-gosma-superficie="true">
            <span className={styles.formasIrregulares} />
            <span className={styles.bolhas} />
            <span className={styles.reflexo} />
          </div>
        </div>
      ) : null}

      <span className="sr-only" role="status" aria-live="polite">
        {explodindo ? 'O frasco explodiu e cobriu a tela de gosma.' : ''}
      </span>
    </>
  );
}
