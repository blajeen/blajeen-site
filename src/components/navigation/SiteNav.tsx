'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { atalhosDeJogo, atalhosDeProjeto, barraDeNavegacao } from '@/content/navigation';
import { rotaAtiva } from '@/lib/routes';
import styles from './SiteNav.module.css';

const ATRASO_FECHAR = 140;
type MenuId = 'jogos' | 'projetos';

/** Navegação desktop com menus acessíveis para jogos e projetos. */
export function SiteNav() {
  const [aberto, setAberto] = useState<MenuId | null>(null);
  const [fixado, setFixado] = useState<MenuId | null>(null);
  const caminho = usePathname();
  const itens = useRef<Partial<Record<MenuId, HTMLLIElement | null>>>({});
  const acionadores = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({});
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelarFechamento = useCallback(() => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
  }, []);

  const fechar = useCallback(() => {
    setAberto(null);
    setFixado(null);
  }, []);

  const fecharComAtraso = useCallback(
    (menu: MenuId) => {
      cancelarFechamento();
      temporizador.current = setTimeout(() => {
        setFixado((menuFixado) => {
          if (menuFixado !== menu) {
            setAberto((menuAberto) => (menuAberto === menu ? null : menuAberto));
          }
          return menuFixado;
        });
      }, ATRASO_FECHAR);
    },
    [cancelarFechamento],
  );

  useEffect(() => cancelarFechamento, [cancelarFechamento]);

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return;
      evento.preventDefault();
      const menu = aberto;
      fechar();
      acionadores.current[menu]?.focus();
    };

    const aoApontar = (evento: PointerEvent) => {
      if (!itens.current[aberto]?.contains(evento.target as Node)) fechar();
    };

    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('pointerdown', aoApontar);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('pointerdown', aoApontar);
    };
  }, [aberto, fechar]);

  const abrirEFocar = (menu: MenuId) => {
    setAberto(menu);
    setFixado(menu);
    requestAnimationFrame(() => {
      itens.current[menu]?.querySelector<HTMLAnchorElement>(`#submenu-${menu} a`)?.focus();
    });
  };

  return (
    <nav aria-label="Navegação principal" className={styles.barra}>
      <ul className={styles.lista}>
        {barraDeNavegacao.map((destino) => {
          if (destino.tipo === 'link') {
            return (
              <li key={destino.rotulo} className={styles.item}>
                <Link
                  href={destino.href}
                  className={styles.destino}
                  data-destaque={'destaque' in destino ? destino.destaque : undefined}
                  aria-current={rotaAtiva(caminho, destino.href) ? 'page' : undefined}
                >
                  {'destaque' in destino && destino.destaque ? (
                    <Image
                      src="/brand/contact-envelope.png"
                      alt=""
                      width={384}
                      height={288}
                      sizes="42px"
                      aria-hidden="true"
                      className={styles.iconeContato}
                    />
                  ) : null}
                  {destino.rotulo}
                </Link>
              </li>
            );
          }

          const menu = destino.menu as MenuId;
          const estaAberto = aberto === menu;
          const atalhos = menu === 'jogos' ? atalhosDeJogo : atalhosDeProjeto;

          return (
            <li
              key={destino.rotulo}
              ref={(elemento) => {
                itens.current[menu] = elemento;
              }}
              className={styles.item}
              onPointerEnter={() => {
                cancelarFechamento();
                setAberto(menu);
              }}
              onPointerLeave={() => fecharComAtraso(menu)}
              onBlur={(evento) => {
                if (!itens.current[menu]?.contains(evento.relatedTarget as Node)) fechar();
              }}
            >
              <button
                ref={(elemento) => {
                  acionadores.current[menu] = elemento;
                }}
                type="button"
                className={styles.destino}
                aria-expanded={estaAberto}
                aria-controls={`submenu-${menu}`}
                onClick={() => {
                  if (fixado === menu) {
                    fechar();
                    return;
                  }
                  setAberto(menu);
                  setFixado(menu);
                }}
                onKeyDown={(evento) => {
                  if (evento.key === 'ArrowDown') {
                    evento.preventDefault();
                    abrirEFocar(menu);
                  }
                }}
              >
                {destino.rotulo}
                <span aria-hidden="true" className={styles.seta}>▼</span>
              </button>

              <div id={`submenu-${menu}`} className={styles.submenu} hidden={!estaAberto}>
                {atalhos.map((atalho) => (
                  <Link
                    key={atalho.href}
                    href={atalho.href}
                    className={styles.jogo}
                    aria-current={rotaAtiva(caminho, atalho.href) ? 'page' : undefined}
                    onClick={fechar}
                  >
                    {'icone' in atalho ? (
                      <Image
                        src={atalho.icone.src}
                        alt={atalho.icone.alt}
                        width={atalho.icone.tamanho}
                        height={atalho.icone.tamanho}
                        sizes="44px"
                        className={styles.icone}
                      />
                    ) : (
                      <span aria-hidden="true" className={styles.sigla}>
                        <ProductIcon id={atalho.simbolo} className="size-7" />
                      </span>
                    )}
                    <span>
                      <span className={styles.nome}>{atalho.rotulo}</span>
                      <span className={styles.estado}>
                        <span aria-hidden="true" className={styles.ponto} />
                        {atalho.estado}
                      </span>
                    </span>
                    <span aria-hidden="true" className={styles.avanco}>→</span>
                  </Link>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
