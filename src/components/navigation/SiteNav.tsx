'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { atalhosDeJogo, barraDeNavegacao } from '@/content/navigation';
import { rotaAtiva } from '@/lib/routes';
import styles from './SiteNav.module.css';

const ID_SUBMENU = 'submenu-jogos';
/** Pequena espera ao sair com o ponteiro, para atravessar o vão entre botão e submenu. */
const ATRASO_FECHAR = 140;

/**
 * Barra de navegação do desktop.
 *
 * Os destinos ficam à vista; "Jogos" abre a lista dos jogos num submenu, seguindo o padrão
 * de menu de divulgação do WAI-ARIA. Abrir por ponteiro é conveniência: clique, teclado e `Esc`
 * fazem tudo o que o hover faz, porque nenhuma navegação do site pode depender de passar o mouse.
 */
export function SiteNav() {
  const [aberto, setAberto] = useState(false);
  /*
   * Aberto por ponteiro e aberto por clique são coisas diferentes.
   *
   * Sem essa distinção, passar o mouse abria e o clique seguinte fechava — o menu nunca abria de
   * verdade para quem usa mouse. Agora o ponteiro só espia; o clique e o teclado fixam, e um
   * segundo clique desfixa.
   */
  const [fixado, setFixado] = useState(false);
  const caminho = usePathname();
  const item = useRef<HTMLLIElement>(null);
  const acionador = useRef<HTMLButtonElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelarFechamento = useCallback(() => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
  }, []);

  const fechar = useCallback(() => {
    setAberto(false);
    setFixado(false);
  }, []);

  const fecharComAtraso = useCallback(() => {
    cancelarFechamento();
    temporizador.current = setTimeout(() => {
      // Fixado por clique ou teclado, o menu ignora a saída do ponteiro.
      setFixado((estaFixado) => {
        if (!estaFixado) setAberto(false);
        return estaFixado;
      });
    }, ATRASO_FECHAR);
  }, [cancelarFechamento]);

  useEffect(() => cancelarFechamento, [cancelarFechamento]);

  // `Esc` fecha e devolve o foco; clicar fora apenas fecha.
  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return;
      evento.preventDefault();
      fechar();
      acionador.current?.focus();
    };

    const aoApontar = (evento: PointerEvent) => {
      if (!item.current?.contains(evento.target as Node)) fechar();
    };

    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('pointerdown', aoApontar);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('pointerdown', aoApontar);
    };
  }, [aberto, fechar]);

  // Sair do submenu com Tab fecha: nada de menu órfão aberto atrás do foco.
  const aoSairDoFoco = (evento: React.FocusEvent) => {
    if (!item.current?.contains(evento.relatedTarget as Node)) fechar();
  };

  const abrirEFocar = () => {
    setAberto(true);
    setFixado(true);
    requestAnimationFrame(() => {
      item.current?.querySelector<HTMLAnchorElement>(`#${ID_SUBMENU} a`)?.focus();
    });
  };

  return (
    <nav aria-label="Navegação principal" className={styles.barra}>
      <ul className={styles.lista}>
        {barraDeNavegacao.map((destino) =>
          destino.tipo === 'link' ? (
            <li key={destino.rotulo} className={styles.item}>
              <Link
                href={destino.href}
                className={styles.destino}
                aria-current={rotaAtiva(caminho, destino.href) ? 'page' : undefined}
              >
                {destino.rotulo}
              </Link>
            </li>
          ) : (
            <li
              key={destino.rotulo}
              ref={item}
              className={styles.item}
              onPointerEnter={() => {
                cancelarFechamento();
                setAberto(true);
              }}
              onPointerLeave={fecharComAtraso}
              onBlur={aoSairDoFoco}
            >
              <button
                ref={acionador}
                type="button"
                className={styles.destino}
                aria-expanded={aberto}
                aria-controls={ID_SUBMENU}
                onClick={() => {
                  if (fixado) {
                    fechar();
                    return;
                  }
                  setAberto(true);
                  setFixado(true);
                }}
                onKeyDown={(evento) => {
                  if (evento.key === 'ArrowDown') {
                    evento.preventDefault();
                    abrirEFocar();
                  }
                }}
              >
                {destino.rotulo}
                <span aria-hidden="true" className={styles.seta}>
                  ▼
                </span>
              </button>

              <div id={ID_SUBMENU} className={styles.submenu} hidden={!aberto}>
                {atalhosDeJogo.map((jogo) => (
                  <Link
                    key={jogo.href}
                    href={jogo.href}
                    className={styles.jogo}
                    aria-current={rotaAtiva(caminho, jogo.href) ? 'page' : undefined}
                    onClick={fechar}
                  >
                    <Image
                      src={jogo.icone.src}
                      alt={jogo.icone.alt}
                      width={jogo.icone.tamanho}
                      height={jogo.icone.tamanho}
                      sizes="44px"
                      className={styles.icone}
                    />
                    <span>
                      <span className={styles.nome}>{jogo.rotulo}</span>
                      <span className={styles.estado}>
                        <span aria-hidden="true" className={styles.ponto} />
                        {jogo.estado}
                      </span>
                    </span>
                    <span aria-hidden="true" className={styles.avanco}>
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
