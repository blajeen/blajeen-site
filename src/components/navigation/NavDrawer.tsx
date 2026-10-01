'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId, useState, type RefObject } from 'react';
import { GithubIcon } from '@/components/brand/GithubIcon';
import { InstagramIcon } from '@/components/brand/InstagramIcon';
import { Drawer } from '@/components/overlays/Drawer';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { navegacaoPrincipal, rodape, submenus } from '@/content/navigation';
import { site } from '@/content/site';
import type { MenuId } from '@/content/types';
import { rotaAtiva, ROTAS } from '@/lib/routes';
import { MobileNavIcon } from './MobileNavIcon';
import styles from './NavDrawer.module.css';

type Props = {
  id: string;
  aberto: boolean;
  aoFechar: () => void;
  acionador: RefObject<HTMLButtonElement | null>;
};

export function NavDrawer({ id, aberto, aoFechar, acionador }: Props) {
  return (
    <Drawer
      id={id}
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Índice do laboratório"
      tituloVisivel={false}
      variante="navegacao"
      acionador={acionador}
      marca={
        <Link href={ROTAS.home} onClick={aoFechar} className={styles.marca}>
          <Image
            src="/brand/blajeen-labs-logo-header.png"
            alt=""
            width={96}
            height={96}
            sizes="48px"
            unoptimized
            className={styles.marcaLogo}
          />
          <span className="header-wordmark">
            BLAJEEN <span>LABS</span>
          </span>
        </Link>
      }
    >
      {/* Mora dentro da gaveta pra desmontar junto com ela: cada abertura começa recolhida. */}
      <Indice aoFechar={aoFechar} />
    </Drawer>
  );
}

/**
 * Índice em sanfona, no jeito dos menus de celular de estúdio de jogo.
 *
 * Os destinos cabem numa tela só, cada um com o seu ícone. Quem tem lista embaixo mostra a
 * setinha e desdobra no lugar, um por vez; o resto do índice apaga um tom pra lista aberta
 * ficar em primeiro plano, sem sumir.
 */
function Indice({ aoFechar }: { aoFechar: () => void }) {
  const caminho = usePathname();
  const prefixo = useId();
  const [secao, setSecao] = useState<MenuId | null>(null);

  return (
    <div className={styles.corpo}>
      {/* O foco entra no índice, e não no primeiro link: focar "Início" desenhava o anel em
          volta dele, e no dedo isso parece uma escolha feita antes de a pessoa escolher.
          O próximo Tab já cai em "Início". */}
      <nav aria-label="Navegação principal" tabIndex={-1} data-foco-inicial className={styles.nav}>
        <ul className={styles.lista} data-secao-aberta={secao ?? undefined}>
          {navegacaoPrincipal.map((link) => {
            const menu = link.menu;

            if (menu) {
              const submenu = submenus[menu];
              const expandido = secao === menu;
              const idLista = `${prefixo}-${menu}`;
              const ativo =
                (submenu.todos !== null && rotaAtiva(caminho, submenu.todos.href)) ||
                submenu.itens.some((item) => rotaAtiva(caminho, item.href)) ||
                submenu.extras.some((extra) => rotaAtiva(caminho, extra.href));

              return (
                <li key={link.href} data-expandido={expandido || undefined}>
                  <button
                    type="button"
                    aria-expanded={expandido}
                    aria-controls={idLista}
                    data-ativo={ativo || undefined}
                    className={styles.topo}
                    onClick={() => setSecao(expandido ? null : menu)}
                  >
                    <MobileNavIcon id={link.icone} className={styles.icone} />
                    <span className={styles.rotulo}>{link.rotulo}</span>
                    <span aria-hidden="true" className={styles.seta} />
                  </button>

                  <ul id={idLista} className={styles.sublista} hidden={!expandido}>
                    {submenu.todos ? (
                      <li>
                        <Link
                          href={submenu.todos.href}
                          onClick={aoFechar}
                          aria-current={rotaAtiva(caminho, submenu.todos.href) ? 'page' : undefined}
                          className={styles.todos}
                        >
                          {submenu.todos.rotulo}
                          <span aria-hidden="true"> →</span>
                        </Link>
                      </li>
                    ) : null}

                    {submenu.itens.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={aoFechar}
                          aria-current={rotaAtiva(caminho, item.href) ? 'page' : undefined}
                          className={styles.subitem}
                        >
                          {'icone' in item ? (
                            <Image
                              src={item.icone.src}
                              alt=""
                              width={item.icone.tamanho}
                              height={item.icone.tamanho}
                              sizes="32px"
                              className={styles.subitemImagem}
                            />
                          ) : (
                            <span aria-hidden="true" className={styles.subitemSimbolo}>
                              <ProductIcon id={item.simbolo} className="size-5" />
                            </span>
                          )}
                          <span className={styles.subitemTexto}>
                            <span className={styles.subitemNome}>{item.rotulo}</span>
                            <span className={styles.subitemEstado}>{item.estado}</span>
                          </span>
                        </Link>
                      </li>
                    ))}

                    {submenu.extras.map((extra) => (
                      <li key={extra.href}>
                        <Link
                          href={extra.href}
                          onClick={aoFechar}
                          aria-current={rotaAtiva(caminho, extra.href) ? 'page' : undefined}
                          className={styles.todos}
                        >
                          {extra.rotulo}
                          <span aria-hidden="true"> →</span>
                          <span className={styles.todosDescricao}>{extra.descricao}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={aoFechar}
                  aria-current={rotaAtiva(caminho, link.href) ? 'page' : undefined}
                  data-servico={link.href === ROTAS.crieSeuProjeto || undefined}
                  className={styles.topo}
                >
                  <MobileNavIcon id={link.icone} className={styles.icone} />
                  <span className={styles.rotulo}>{link.rotulo}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.rodape}>
        <ul className={styles.sociais}>
          {rodape.social.map((rede) => (
            <li key={rede.href}>
              <a
                href={rede.href}
                target="_blank"
                rel="noreferrer"
                aria-label={rede.rotulo}
                className={styles.social}
              >
                {rede.href.includes('instagram.com') ? (
                  <InstagramIcon className="size-5" />
                ) : (
                  <GithubIcon className="size-5" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <ul className={styles.legais}>
          {[
            { href: ROTAS.suporte, rotulo: 'Suporte' },
            ...rodape.legal,
          ].map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={aoFechar} className={styles.legal}>
                {link.rotulo}
              </Link>
            </li>
          ))}
        </ul>

        {/* As lojas procuram a exclusão de dados sem precisar abrir a política. */}
        <p className={styles.exclusaoTitulo}>{rodape.dados.titulo}</p>
        <ul className={styles.legais}>
          {rodape.dados.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={aoFechar} className={styles.legal}>
                {link.rotulo}
              </Link>
            </li>
          ))}
        </ul>

        <p className={styles.assinatura}>
          © {site.ano} {site.nome}
        </p>
      </div>
    </div>
  );
}
