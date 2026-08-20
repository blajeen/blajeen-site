'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './Drawer.module.css';

/** O portal só existe no cliente; no servidor não há `document.body` para receber a gaveta. */
const semAssinatura = () => () => {};
const useNoCliente = () =>
  useSyncExternalStore(
    semAssinatura,
    () => true,
    () => false,
  );

const FOCAVEIS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type Props = {
  aberto: boolean;
  aoFechar: () => void;
  /** Id usado pelo acionador em `aria-controls`. */
  id: string;
  titulo: string;
  /** Quando `false`, o título fica apenas para leitores de tela. */
  tituloVisivel?: boolean;
  variante: 'navegacao' | 'previa';
  rotuloFechar?: string;
  /** Elemento que recebe o foco de volta ao fechar. */
  acionador?: React.RefObject<HTMLElement | null>;
  children: ReactNode;
};

/**
 * Gaveta modal acessível.
 *
 * Cuida de foco preso, retorno de foco, `Esc`, scrim, `inert` no fundo e bloqueio de scroll
 * sem salto de layout. Nunca há duas gavetas abertas: quem usa esta primitiva fecha a anterior
 * antes de abrir a seguinte.
 */
export function Drawer({
  aberto,
  aoFechar,
  id,
  titulo,
  tituloVisivel = true,
  variante,
  rotuloFechar = 'Fechar',
  acionador,
  children,
}: Props) {
  const noCliente = useNoCliente();
  /**
   * `apresentada` só muda dentro de callbacks: um quadro depois de abrir, para a transição de
   * entrada acontecer a partir do estado fechado; e ao fim da transição de saída, para desmontar.
   */
  const [apresentada, setApresentada] = useState(false);
  const painel = useRef<HTMLDivElement>(null);
  const tituloId = useId();

  useEffect(() => {
    if (aberto) {
      const quadro = requestAnimationFrame(() => setApresentada(true));
      return () => cancelAnimationFrame(quadro);
    }
    const temporizador = setTimeout(() => setApresentada(false), 320);
    return () => clearTimeout(temporizador);
  }, [aberto]);

  // Presente no DOM enquanto abre, enquanto está aberta e durante a animação de saída.
  const presente = aberto || apresentada;
  const exibindo = aberto && apresentada;

  const fechar = useCallback(() => aoFechar(), [aoFechar]);

  // Scroll lock sem salto: compensa a largura da barra de rolagem.
  useEffect(() => {
    if (!aberto) return;
    const documento = document.documentElement;
    const folga = window.innerWidth - documento.clientWidth;
    documento.style.setProperty('--scrollbar-gap', `${folga}px`);
    document.body.dataset['scrollLocked'] = 'true';

    return () => {
      delete document.body.dataset['scrollLocked'];
      documento.style.removeProperty('--scrollbar-gap');
    };
  }, [aberto]);

  // Fundo inerte: leitores de tela e teclado não alcançam o conteúdo atrás do scrim.
  useEffect(() => {
    if (!aberto) return;
    const raiz = painel.current?.parentElement;
    const irmaos = Array.from(document.body.children).filter((no) => no !== raiz);
    const alterados = irmaos.filter((no) => !no.hasAttribute('inert'));
    alterados.forEach((no) => no.setAttribute('inert', ''));
    return () => alterados.forEach((no) => no.removeAttribute('inert'));
  }, [aberto]);

  // Foco entra na gaveta ao abrir e volta ao acionador ao fechar.
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    // O acionador é capturado agora: ele não desmonta enquanto a gaveta existe.
    const devolverPara = acionador?.current ?? anterior;

    const alvo =
      painel.current?.querySelector<HTMLElement>('[data-foco-inicial]') ??
      painel.current?.querySelector<HTMLElement>(FOCAVEIS) ??
      painel.current;
    alvo?.focus({ preventScroll: true });

    return () => devolverPara?.focus({ preventScroll: true });
  }, [aberto, acionador]);

  // `Esc` fecha; `Tab` circula dentro da gaveta.
  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        fechar();
        return;
      }
      if (evento.key !== 'Tab' || !painel.current) return;

      const focaveis = Array.from(painel.current.querySelectorAll<HTMLElement>(FOCAVEIS)).filter(
        // `checkVisibility` cobre `display:none`, `visibility` e `content-visibility`.
        // Onde ele não existe, considera-se visível: dentro da gaveta aberta tudo é alcançável.
        (no) => no.checkVisibility?.() ?? true,
      );
      if (focaveis.length === 0) {
        evento.preventDefault();
        painel.current.focus();
        return;
      }

      const primeiro = focaveis[0]!;
      const ultimo = focaveis[focaveis.length - 1]!;
      const ativo = document.activeElement;

      if (evento.shiftKey && (ativo === primeiro || ativo === painel.current)) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && ativo === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    };

    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, fechar]);

  if (!noCliente || !presente) return null;

  return createPortal(
    <div className={styles.raiz} data-aberto={exibindo}>
      <button type="button" className={styles.scrim} onClick={fechar} tabIndex={-1} aria-hidden="true" />

      <div
        id={id}
        ref={painel}
        className={`${styles.painel} ${variante === 'navegacao' ? styles.navegacao : styles.previa}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
      >
        {variante === 'previa' ? <div className={styles.alca} aria-hidden="true" /> : null}

        <div className={styles.cabecalho}>
          <h2
            id={tituloId}
            className={tituloVisivel ? 'tecnica text-mineral' : 'sr-only'}
          >
            {titulo}
          </h2>
          <button type="button" className={styles.fechar} onClick={fechar}>
            {rotuloFechar}
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className={styles.corpo}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
