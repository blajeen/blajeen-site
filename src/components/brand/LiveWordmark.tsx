'use client';

import { useEffect, useRef } from 'react';
import { useMotion } from '@/components/motion/MotionProvider';
import { usePiscada } from '@/components/motion/usePiscada';
import styles from './LiveWordmark.module.css';

/**
 * Geometria do `E`-olho, em unidades de viewBox onde 1000 = 1em.
 * A altura corresponde à cap height do wordmark (0,73em), como no lockup aprovado.
 */
const CAIXA = { largura: 570, altura: 730 };
const HASTE = 115;
const BARRA = { largura: 450, altura: 105 };
const BARRA_MEIO = { largura: 430, y: 313, altura: 105 };
const ALVEOLO = { x: HASTE, y: BARRA.altura, largura: BARRA.largura - HASTE, altura: BARRA_MEIO.y - BARRA.altura };
const PUPILA = { cx: ALVEOLO.x + ALVEOLO.largura / 2, cy: ALVEOLO.y + ALVEOLO.altura / 2, r: 52 };

/** Deslocamento máximo da pupila: 32 unidades = 0,032em ≈ 5,8 px na marca do hero (180 px). */
const ALCANCE_X = 32;
const ALCANCE_Y = 20;

type Variante = 'hero' | 'reduzida';

type Props = {
  variante?: Variante;
  /** `true` no hero; a gosma não é aplicada na marca reduzida do header. */
  comGosma?: boolean;
  comQualificador?: boolean;
  className?: string;
};

function OlhoE({ piscando }: { piscando: boolean }) {
  return (
    <svg
      className={styles.olho}
      viewBox={`0 0 ${CAIXA.largura} ${CAIXA.altura}`}
      data-piscando={piscando}
      aria-hidden="true"
      focusable="false"
    >
      <g className={styles.corpo}>
        <rect x="0" y="0" width={HASTE} height={CAIXA.altura} />
        <rect x="0" y="0" width={BARRA.largura} height={BARRA.altura} />
        <rect x="0" y={BARRA_MEIO.y} width={BARRA_MEIO.largura} height={BARRA_MEIO.altura} />
        <rect x="0" y={CAIXA.altura - BARRA.altura} width={BARRA.largura} height={BARRA.altura} />
      </g>
      <circle className={styles.pupila} cx={PUPILA.cx} cy={PUPILA.cy} r={PUPILA.r} />
      <circle
        className={styles.brilhoPupila}
        cx={PUPILA.cx - 18}
        cy={PUPILA.cy - 18}
        r={12}
      />
      <rect
        className={styles.palpebra}
        x={ALVEOLO.x}
        y={ALVEOLO.y}
        width={ALVEOLO.largura}
        height={ALVEOLO.altura}
      />
    </svg>
  );
}

export function LiveWordmark({
  variante = 'hero',
  comGosma = variante === 'hero',
  comQualificador = variante === 'hero',
  className,
}: Props) {
  const { ativo } = useMotion();
  const referencia = useRef<HTMLDivElement>(null);

  // Mesma cadência do mascote: intervalos pseudoaleatórios e piscada dupla rara.
  const olhoFechado = usePiscada(ativo);

  // Pupilas acompanham o ponteiro com deslocamento pequeno e amortecido.
  useEffect(() => {
    const no = referencia.current;
    if (!no || !ativo) {
      referencia.current?.style.setProperty('--olho-x', '0px');
      referencia.current?.style.setProperty('--olho-y', '0px');
      return;
    }

    // Sem ponteiro fino não há o que seguir: touch mantém os olhos parados e centrados.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let alvoX = 0;
    let alvoY = 0;
    let atualX = 0;
    let atualY = 0;
    let quadro = 0;
    let visivel = true;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada?.isIntersecting ?? false;
        if (visivel) animar();
      },
      { threshold: 0 },
    );
    observador.observe(no);

    const aoMover = (evento: PointerEvent) => {
      const caixa = no.getBoundingClientRect();
      const centroX = caixa.left + caixa.width / 2;
      const centroY = caixa.top + caixa.height / 2;
      // Normaliza pela metade da viewport: o olhar percorre a tela inteira sem estourar o limite.
      alvoX = Math.max(-1, Math.min(1, (evento.clientX - centroX) / (window.innerWidth / 2)));
      alvoY = Math.max(-1, Math.min(1, (evento.clientY - centroY) / (window.innerHeight / 2)));
      animar();
    };

    const animar = () => {
      if (quadro || !visivel || document.hidden) return;
      quadro = requestAnimationFrame(passo);
    };

    const passo = () => {
      quadro = 0;
      atualX += (alvoX * ALCANCE_X - atualX) * 0.12;
      atualY += (alvoY * ALCANCE_Y - atualY) * 0.12;
      no.style.setProperty('--olho-x', `${atualX.toFixed(2)}px`);
      no.style.setProperty('--olho-y', `${atualY.toFixed(2)}px`);

      const parado =
        Math.abs(alvoX * ALCANCE_X - atualX) < 0.15 && Math.abs(alvoY * ALCANCE_Y - atualY) < 0.15;
      if (!parado) animar();
    };

    const aoTrocarVisibilidade = () => {
      if (!document.hidden) animar();
    };

    window.addEventListener('pointermove', aoMover, { passive: true });
    document.addEventListener('visibilitychange', aoTrocarVisibilidade);

    return () => {
      window.removeEventListener('pointermove', aoMover);
      document.removeEventListener('visibilitychange', aoTrocarVisibilidade);
      observador.disconnect();
      if (quadro) cancelAnimationFrame(quadro);
      no.style.setProperty('--olho-x', '0px');
      no.style.setProperty('--olho-y', '0px');
    };
  }, [ativo]);

  return (
    <div
      ref={referencia}
      className={[styles.marca, className].filter(Boolean).join(' ')}
      data-variante={variante}
      role="img"
      aria-label="Blajeen Labs"
    >
      <div className={styles.linhaMarca}>
        <div className={styles.letras}>
          <span aria-hidden="true">BLAJ</span>
          <OlhoE piscando={olhoFechado} />
          <OlhoE piscando={olhoFechado} />
          <span aria-hidden="true">N</span>
        </div>

        {comGosma ? (
          <div className={styles.gosma} aria-hidden="true">
            <div className={styles.gosmaCorpo} />
            <div className={styles.gosmaBrilho} />
            <i className={styles.pingo} />
            <i className={styles.pingo} />
            <i className={styles.pingo} />
            <i className={styles.pingo} />
          </div>
        ) : null}
      </div>

      {comQualificador ? (
        <div className={styles.qualificador} aria-hidden="true">
          <span />
          <strong>LABS</strong>
          <span />
        </div>
      ) : null}
    </div>
  );
}
