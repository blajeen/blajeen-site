'use client';

import { useEffect, useState, type RefObject } from 'react';
import styles from '../Torrelio.module.css';

type Props = {
  /** A raiz da demonstração: as âncoras `data-ancora="palco"` e `"ficha"` ficam dentro dela. */
  raizRef: RefObject<HTMLElement | null>;
  /** Só abaixo de 1024 px, fora da tela cheia e fora da vista. */
  ativa: boolean;
  /** Muda com a escolha, a aba, o modo e a sub-aba: a barra se mede de novo. */
  chave: string;
  titulo: string;
  linha: string;
  /** Para a marca: as mesmas cores do espelho e da legenda. */
  status: string;
  /** "Detalhes" (cartão) ou "Editar" (painel). */
  rotuloDaFicha: string;
  movimento: boolean;
};

type Medida = { visivel: boolean; palcoAcima: boolean; fichaAcima: boolean | null };

/** A primeira âncora com caixa na tela: a aba escondida (Activity) não conta. */
function ancora(raiz: HTMLElement, nome: 'palco' | 'ficha'): HTMLElement | null {
  return [...raiz.querySelectorAll<HTMLElement>(`[data-ancora="${nome}"]`)].find((el) => el.getClientRects().length > 0) ?? null;
}

/**
 * No celular, o palco fica em cima, o espelho no meio e o cartão embaixo: quem tocava numa unidade
 * do espelho (ou num quarto da grade) não via nem a torre nem o cartão mudarem. Esta barra fica
 * presa ao pé da tela enquanto nenhum dos dois está à vista, diz o que está escolhido e leva até a
 * maquete ou até a ficha.
 */
export function BarraDaEscolha({ raizRef, ativa, chave, titulo, linha, status, rotuloDaFicha, movimento }: Props) {
  const [medida, setMedida] = useState<Medida>({ visivel: false, palcoAcima: true, fichaAcima: null });

  useEffect(() => {
    const raiz = raizRef.current;
    if (!ativa || !raiz) return;
    let pedido = 0;
    const medir = () => {
      pedido = 0;
      const alto = window.innerHeight;
      const r = raiz.getBoundingClientRect();
      const rp = ancora(raiz, 'palco')?.getBoundingClientRect();
      const rf = ancora(raiz, 'ficha')?.getBoundingClientRect();
      const fracaoDoPalco = rp && rp.height > 0 ? Math.max(0, Math.min(alto, rp.bottom) - Math.max(0, rp.top)) / rp.height : 0;
      const fichaNaTela = rf ? rf.top < alto - 96 && rf.bottom > 96 : false;
      const novo: Medida = {
        visivel: r.top < alto - 120 && r.bottom > 160 && fracaoDoPalco < 0.3 && !fichaNaTela,
        palcoAcima: rp ? rp.top < 0 : true,
        fichaAcima: rf ? rf.top < 0 : null,
      };
      setMedida((m) => (m.visivel === novo.visivel && m.palcoAcima === novo.palcoAcima && m.fichaAcima === novo.fichaAcima ? m : novo));
    };
    const pedir = () => {
      if (!pedido) pedido = requestAnimationFrame(medir);
    };
    pedir();
    // O espelho que abre muda a altura da demonstração sem rolar a página.
    const observador = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(pedir);
    observador?.observe(raiz);
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    return () => {
      cancelAnimationFrame(pedido);
      observador?.disconnect();
      window.removeEventListener('scroll', pedir);
      window.removeEventListener('resize', pedir);
    };
  }, [ativa, chave, raizRef]);

  const visivel = ativa && medida.visivel;

  const irPara = (nome: 'palco' | 'ficha') => {
    const raiz = raizRef.current;
    const alvo = raiz ? ancora(raiz, nome) : null;
    if (!alvo) return;
    alvo.scrollIntoView({ behavior: movimento ? 'smooth' : 'auto', block: 'start' });
    // O foco vai junto: a barra some quando o alvo aparece, e quem usa teclado não pode ficar num botão escondido.
    alvo.querySelector<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])')?.focus({ preventScroll: true });
  };

  const resumo = (
    <>
      <span className={styles.marcaDoStatus} aria-hidden="true" />
      <span className={styles.barraDaEscolhaNomes}>
        <strong>{titulo}</strong>
        <span>{linha}</span>
      </span>
    </>
  );

  // O resumo é o atalho para a ficha (o cartão ou o editor): um alvo grande, com a seta para onde ela está.
  return (
    <div role="group" aria-label="Escolha atual" className={styles.barraDaEscolha} data-visivel={visivel ? 'sim' : 'nao'} inert={!visivel}>
      {medida.fichaAcima !== null ? (
        <button type="button" className={styles.barraDaEscolhaResumo} data-status={status} onClick={() => irPara('ficha')}>
          <span className="sr-only">{rotuloDaFicha}: </span>
          {resumo}
          <span className={styles.barraDaEscolhaSeta} aria-hidden="true">
            {medida.fichaAcima ? '↑' : '↓'}
          </span>
        </button>
      ) : (
        <p className={styles.barraDaEscolhaResumo} data-status={status}>
          {resumo}
        </p>
      )}
      <button type="button" className={styles.botaoPequeno} onClick={() => irPara('palco')}>
        Maquete <span aria-hidden="true">{medida.palcoAcima ? '↑' : '↓'}</span>
      </button>
    </div>
  );
}
