'use client';

import { useEffect, useRef } from 'react';
import { useMotion } from '@/components/motion/MotionProvider';
import { quandoGpuLivre } from '@/lib/fila-da-gpu';
import type { Motor } from './motor';
import styles from './Conduto.module.css';

/**
 * Conduto de energia: um tubo de vidro com líquido verde-ácido que atravessa a página.
 *
 * Ele corre pelas margens, cruza a página nas faixas livres entre as seções e termina encaixado no
 * botão final, que recebe a carga quando o líquido chega. O nível acompanha a leitura.
 *
 * Como a página marca o caminho:
 * - `data-conduto-lado="esquerda|direita"` em cada seção por onde ele passa;
 * - `data-conduto-destino` no elemento onde ele termina.
 *
 * Para leitor de tela é decorativo: fora da árvore de acessibilidade, sem ponteiro, atrás do
 * conteúdo, e nenhuma informação depende dele. A função é narrativa (docs/PLANO_MESTRE_DO_SITE.md,
 * emenda do conduto). O motor carrega na primeira folga da página e já cria o contexto WebGL,
 * enquanto a GPU ainda está livre; a compilação do shader e o resto esperam a fila da GPU
 * (`fila-da-gpu.ts`), para não disputar o carregamento nem a cena 3D do hero. Sem WebGL2 ou sem
 * JavaScript, nada aparece.
 */

/** Teto de espera pela fila da GPU: se a cena 3D demorar ou falhar, o conduto não fica preso. */
const ESPERA_MAXIMA_DA_GPU = 8000;
export function Conduto() {
  const raiz = useRef<HTMLDivElement>(null);
  const motor = useRef<Motor | null>(null);
  const { ativo } = useMotion();
  const ativoAtual = useRef(ativo);

  useEffect(() => {
    ativoAtual.current = ativo;
    motor.current?.movimento(ativo);
  }, [ativo]);

  useEffect(() => {
    const no = raiz.current;
    if (!no) return;
    let cancelado = false;

    let cancelarEspera = () => {};
    let descartar = () => {};
    const preparar = () => {
      void import('./motor')
        .then(({ prepararConduto }) => {
          if (cancelado) return;
          const preparo = prepararConduto(no);
          if (!preparo) return;
          descartar = () => preparo.descartar();
          cancelarEspera = quandoGpuLivre(() => {
            if (!cancelado) motor.current = preparo.iniciar(ativoAtual.current);
          }, ESPERA_MAXIMA_DA_GPU);
        })
        .catch(() => {
          // Decorativo: sem o conduto, a página continua exatamente igual.
        });
    };

    const ocioso = typeof window.requestIdleCallback === 'function';
    const espera = ocioso
      ? window.requestIdleCallback(preparar, { timeout: 2500 })
      : window.setTimeout(preparar, 1200);

    return () => {
      cancelado = true;
      cancelarEspera();
      descartar();
      if (ocioso) window.cancelIdleCallback(espera);
      else window.clearTimeout(espera);
      motor.current?.destruir();
      motor.current = null;
    };
  }, []);

  return <div ref={raiz} className={styles.conduto} aria-hidden="true" data-conduto="" />;
}
