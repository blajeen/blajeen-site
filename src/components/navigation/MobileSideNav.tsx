'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductIcon } from '@/components/projects/ProductIcon';
import {
  atalhosDeJogo,
  atalhosDeProduto,
  atalhosDeProjeto,
  navegacaoPrincipal,
} from '@/content/navigation';
import type { MenuId } from '@/content/types';
import { ROTAS } from '@/lib/routes';
import { MobileNavIcon } from './MobileNavIcon';
import styles from './MobileSideNav.module.css';

const rotasDeJogos = [
  ROTAS.projetoRevalio,
  ROTAS.projetoDocalio,
  ROTAS.projetoGramelio,
  ROTAS.projetoCatelio,
  ROTAS.projetoDogolio,
  ROTAS.projetoMorvelio,
];
const rotasDeProdutos = [
  ROTAS.projetos,
  ROTAS.barbearia,
  ROTAS.personalStudio,
  ROTAS.salaoEstetica,
  ROTAS.ecommerce,
  ROTAS.clinicaMedica,
  ROTAS.foodelio,
  ROTAS.pipelio,
  ROTAS.painelAdministrativo,
];

/**
 * O que cada gaveta abre, e como ela se apresenta.
 *
 * Mesmas listas que alimentam os menus do desktop: se um produto novo entra no catálogo,
 * ele aparece nos dois lugares sem ninguém precisar lembrar do segundo.
 */
const GAVETAS = {
  produtos: {
    titulo: 'Produtos',
    resumo: 'Pra baixar e usar na sua máquina.',
    todos: { rotulo: 'Ver todos os produtos', href: ROTAS.produtos },
    itens: atalhosDeProduto,
  },
  projetos: {
    titulo: 'SaaS',
    resumo: 'Sistemas próprios adaptados a negócios reais.',
    todos: { rotulo: 'Ver todos os sistemas', href: ROTAS.projetos },
    itens: atalhosDeProjeto,
  },
  jogos: {
    titulo: 'Jogos',
    resumo: 'Os jogos do laboratório.',
    todos: { rotulo: 'Ver o primeiro jogo', href: ROTAS.projetoRevalio },
    itens: atalhosDeJogo,
  },
} as const;

function caminhoComecaCom(caminho: string, rota: string) {
  return caminho === rota || caminho.startsWith(`${rota}/`);
}

function itemAtivo(caminho: string, href: string) {
  if (href === ROTAS.home) return caminho === ROTAS.home;
  if (href === ROTAS.projetos) {
    return (
      caminho === ROTAS.projetos ||
      rotasDeProdutos.slice(1).some((rota) => caminhoComecaCom(caminho, rota))
    );
  }
  if (href === ROTAS.projetoRevalio) {
    return rotasDeJogos.some((rota) => caminhoComecaCom(caminho, rota));
  }
  return caminhoComecaCom(caminho, href);
}

export function MobileSideNav() {
  const caminho = usePathname();
  const [aberta, setAberta] = useState<MenuId | null>(null);
  const [caminhoDaAbertura, setCaminhoDaAbertura] = useState(caminho);
  const painel = useRef<HTMLDivElement | null>(null);
  const acionadores = useRef<Partial<Record<MenuId, HTMLButtonElement | null>>>({});

  const fechar = useCallback(() => setAberta(null), []);

  // Navegou: a gaveta não pode ficar aberta por cima da página nova.
  //
  // Ajustado durante a renderização, e não num efeito. Fechar num efeito faria a página
  // nova aparecer um quadro inteiro com a gaveta ainda por cima — e é justamente o que a
  // regra `set-state-in-effect` existe pra evitar.
  if (caminho !== caminhoDaAbertura) {
    setCaminhoDaAbertura(caminho);
    setAberta(null);
  }

  useEffect(() => {
    if (!aberta) return undefined;

    const noTeclado = (evento: KeyboardEvent) => {
      if (evento.key !== 'Escape') return;
      evento.preventDefault();
      // Devolve o foco pro botão que abriu: quem usa teclado não pode ficar perdido.
      acionadores.current[aberta]?.focus();
      fechar();
    };

    document.addEventListener('keydown', noTeclado);
    // O foco vai pro painel, e não pro primeiro link.
    //
    // Quem abre com o teclado precisa aterrissar dentro da gaveta, senão o Tab seguinte
    // volta pra página atrás dela. Mas focar o primeiro item desenha um anel em volta
    // dele — e no dedo isso parece que o Clearlio já está selecionado, quando ninguém
    // escolheu nada ainda. O painel recebe o foco sem pintar escolha nenhuma.
    painel.current?.focus();
    return () => document.removeEventListener('keydown', noTeclado);
  }, [aberta, fechar]);

  const gaveta = aberta ? GAVETAS[aberta] : null;

  return (
    <>
      <nav className={styles.raiz} aria-label="Menu lateral">
        <ul className={styles.lista}>
          {navegacaoPrincipal.map((link) => {
            const ativo = itemAtivo(caminho, link.href);
            const menu = link.menu;

            // Destino com lista embaixo vira botão. Antes era link, e tocar em "Jogos"
            // levava direto pro primeiro jogo — os outros cinco não existiam aqui.
            if (menu) {
              const estaAberta = aberta === menu;
              return (
                <li key={link.href}>
                  <button
                    ref={(elemento) => {
                      acionadores.current[menu] = elemento;
                    }}
                    type="button"
                    aria-expanded={estaAberta}
                    aria-controls="gaveta-lateral"
                    aria-label={`${link.rotulo}. ${link.descricao}`}
                    data-ativo={ativo || undefined}
                    data-aberta={estaAberta || undefined}
                    className={styles.link}
                    onClick={() => setAberta(estaAberta ? null : menu)}
                  >
                    <MobileNavIcon id={link.icone} className={styles.icone} />
                    <span className={styles.rotulo}>{link.rotulo}</span>
                    <span aria-hidden="true" className={styles.seta} />
                  </button>
                </li>
              );
            }

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={ativo ? 'page' : undefined}
                  aria-label={`${link.rotulo}. ${link.descricao}`}
                  data-servico={link.href === ROTAS.crieSeuProjeto}
                  data-ativo={ativo || undefined}
                  className={styles.link}
                >
                  <MobileNavIcon id={link.icone} className={styles.icone} />
                  <span className={styles.rotulo}>{link.rotulo}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {gaveta ? (
        <>
          <button
            type="button"
            aria-label="Fechar o menu"
            className={styles.cortina}
            onClick={fechar}
          />
          <div
            ref={painel}
            id="gaveta-lateral"
            className={styles.gaveta}
            role="group"
            aria-label={gaveta.titulo}
            tabIndex={-1}
          >
            <div className={styles.cabecalho}>
              <p className={styles.tituloGaveta}>{gaveta.titulo}</p>
              <p className={styles.resumoGaveta}>{gaveta.resumo}</p>
            </div>

            <ul className={styles.itens}>
              {gaveta.itens.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.item}
                    aria-current={caminhoComecaCom(caminho, item.href) ? 'page' : undefined}
                  >
                    {'icone' in item ? (
                      <Image
                        src={item.icone.src}
                        alt=""
                        width={item.icone.tamanho}
                        height={item.icone.tamanho}
                        sizes="40px"
                        className={styles.itemIcone}
                      />
                    ) : (
                      <span aria-hidden="true" className={styles.itemSimbolo}>
                        <ProductIcon id={item.simbolo} className="size-5" />
                      </span>
                    )}
                    <span className={styles.itemTexto}>
                      <span className={styles.itemNome}>{item.rotulo}</span>
                      <span className={styles.itemEstado}>{item.estado}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link href={gaveta.todos.href} className={styles.todos}>
              {gaveta.todos.rotulo} →
            </Link>
          </div>
        </>
      ) : null}
    </>
  );
}
