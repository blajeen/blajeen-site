'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useMotion } from '@/components/motion/MotionProvider';
import { quandoGpuLivre } from '@/lib/fila-da-gpu';
import type { Motor } from './motor';
import styles from './Conduto.module.css';

/**
 * Conduto de energia: um tubo de vidro com líquido verde-ácido que atravessa as páginas do site.
 *
 * Mora no layout, dentro do `main`: um só motor e um só contexto WebGL para o site inteiro. Ao
 * navegar, ele mede a página nova e enche o tubo de novo. Painel e portal de onboarding são áreas
 * privadas de trabalho: ali ele não aparece.
 *
 * Ele corre pelas margens e cruza a página nas faixas livres entre as seções. Na home, termina
 * encaixado no botão final, que recebe a carga quando o líquido chega; nas outras páginas, numa
 * tampa de metal. O líquido enche até 70% da tela e avança com a rolagem.
 *
 * Como a página marca o caminho:
 * - `data-conduto-lado="esquerda|direita"` fixa o lado de uma seção;
 * - `data-conduto-lado="alternar"` pode trocar de lado em relação à seção anterior (o `Container`
 *   já traz essa marca, e por isso as páginas internas não precisam de marcação própria);
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

/** Áreas privadas de trabalho, onde o tubo não entra. */
const PRIVADAS = ['/admin', '/onboarding'];

export function Conduto() {
  const caminho = usePathname();
  const privada = PRIVADAS.some((prefixo) => caminho === prefixo || caminho.startsWith(`${prefixo}/`));
  return privada ? null : <CondutoAtivo caminho={caminho} />;
}

function CondutoAtivo({ caminho }: { caminho: string }) {
  const raiz = useRef<HTMLDivElement>(null);
  const motor = useRef<Motor | null>(null);
  const { ativo } = useMotion();
  const ativoAtual = useRef(ativo);

  useEffect(() => {
    ativoAtual.current = ativo;
    motor.current?.movimento(ativo);
  }, [ativo]);

  // Página nova no mesmo layout: o DOM dela já está no lugar quando este efeito roda. De layout, e
  // não passivo, para rodar antes da pintura: senão o tubo da página anterior aparece na nova por
  // um quadro.
  useLayoutEffect(() => {
    motor.current?.novaPagina();
  }, [caminho]);

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
