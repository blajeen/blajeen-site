'use client';

import { useEffect, useState } from 'react';
import { useMotion } from './MotionProvider';
import styles from './BootSequence.module.css';

const CHAVE = 'blajeen:boot';

/** Teto absoluto da abertura, contado a partir do início da navegação. */
const LIMITE = 1400;
/** Duração da saída por opacidade, incluída dentro do limite. */
const SAIDA = 400;
/** Abaixo disto a abertura vira um piscar preto: melhor não exibir. */
const MINIMO_UTIL = 450;

/**
 * Abertura do laboratório.
 *
 * O tempo é contado a partir do início da navegação, não a partir da hidratação. Em aparelho
 * lento a hidratação termina depois do próprio limite de 1,4 s — nesse caso a abertura é pulada
 * inteira, em vez de cobrir com preto uma página que já estava visível e empurrar o LCP.
 *
 * É decorativa: fica fora da árvore de acessibilidade, o conteúdo real já está renderizado atrás
 * dela, e ela não aparece com movimento reduzido nem na segunda visita da sessão.
 */
export function BootSequence() {
  const { ativo } = useMotion();
  const [exibir, setExibir] = useState(false);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (!ativo) return;

    let jaViu = true;
    try {
      jaViu = window.sessionStorage.getItem(CHAVE) === 'visto';
      window.sessionStorage.setItem(CHAVE, 'visto');
    } catch {
      // Sem sessionStorage a abertura simplesmente não roda.
      return;
    }
    if (jaViu) return;

    // Quanto ainda resta do orçamento de 1,4 s desde que a navegação começou.
    const restante = LIMITE - performance.now();
    if (restante < MINIMO_UTIL) return;

    const quadro = requestAnimationFrame(() => setExibir(true));
    const saida = setTimeout(() => setSaindo(true), restante - SAIDA);
    const fim = setTimeout(() => setExibir(false), restante);

    return () => {
      cancelAnimationFrame(quadro);
      clearTimeout(saida);
      clearTimeout(fim);
    };
  }, [ativo]);

  if (!exibir) return null;

  return (
    <div className={styles.boot} data-saindo={saindo} aria-hidden="true">
      <p className={styles.leitura}>
        INICIALIZANDO BLAJEEN LABS
        <span className={styles.ponto} />
      </p>
      <span className={styles.barra}>
        <b />
      </span>
      <p className={styles.rodape}>
        <span>NÚCLEO / 02</span>
        <span>SISTEMA ATIVO</span>
      </p>
    </div>
  );
}
