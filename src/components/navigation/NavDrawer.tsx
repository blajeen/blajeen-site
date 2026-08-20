'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { RefObject } from 'react';
import { Drawer } from '@/components/overlays/Drawer';
import { ProductIcon } from '@/components/projects/ProductIcon';
import { atalhosDeJogo, atalhosDeProjeto, navegacaoPrincipal } from '@/content/navigation';
import { site } from '@/content/site';
import { rotaAtiva, ROTAS } from '@/lib/routes';

type Props = {
  id: string;
  aberto: boolean;
  aoFechar: () => void;
  acionador: RefObject<HTMLButtonElement | null>;
};

export function NavDrawer({ id, aberto, aoFechar, acionador }: Props) {
  const caminho = usePathname();

  return (
    <Drawer
      id={id}
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Índice do laboratório"
      variante="navegacao"
      acionador={acionador}
    >
      <nav aria-label="Navegação principal" className="px-[var(--gutter)] pb-10 pt-2 sm:px-8">
        <ul className="flex flex-col">
          {navegacaoPrincipal.map((link, indice) => {
            const ativo = rotaAtiva(caminho, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={aoFechar}
                  aria-current={ativo ? 'page' : undefined}
                  {...(indice === 0 ? { 'data-foco-inicial': true } : {})}
                  className="group flex items-baseline gap-4 border-b border-line py-5 transition-colors duration-150 hover:border-signal/35 sm:gap-6"
                >
                  <span className="tecnica w-6 flex-none text-mineral-dim transition-colors group-hover:text-signal">
                    {link.indice}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[1.6rem] leading-tight tracking-tight text-paper transition-colors group-hover:text-signal sm:text-[1.9rem]">
                      {link.rotulo}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-mineral">
                      {link.descricao}
                    </span>
                  </span>
                  {ativo ? (
                    <span className="tecnica ml-auto flex-none self-center text-signal">AQUI</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="tecnica mt-10 text-mineral-dim">Jogos</p>
        <ul className="mt-4 flex flex-col gap-2">
          {atalhosDeJogo.map((atalho) => (
            <li key={atalho.href}>
              <Link
                href={atalho.href}
                onClick={aoFechar}
                aria-current={rotaAtiva(caminho, atalho.href) ? 'page' : undefined}
                className="alvo-toque flex items-center gap-4 rounded-[var(--radius-control)] border border-line bg-raised/60 p-3 transition-colors duration-150 hover:border-signal/35"
              >
                <Image
                  src={atalho.icone.src}
                  alt={atalho.icone.alt}
                  width={atalho.icone.tamanho}
                  height={atalho.icone.tamanho}
                  sizes="48px"
                  loading="lazy"
                  className="size-12 flex-none rounded-[12px] border border-line"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-base leading-tight text-paper">{atalho.rotulo}</span>
                  <span className="tecnica mt-1 flex items-center gap-2 text-mineral">
                    <span
                      aria-hidden="true"
                      className="inline-block size-[5px] flex-none rounded-full bg-signal shadow-[0_0_8px_var(--color-signal)]"
                    />
                    {atalho.estado}
                  </span>
                </span>
                <span aria-hidden="true" className="flex-none text-signal">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="tecnica mt-10 text-mineral-dim">Produtos</p>
        <ul className="mt-4 flex flex-col gap-2">
          {atalhosDeProjeto.map((atalho) => (
            <li key={atalho.href}>
              <Link
                href={atalho.href}
                onClick={aoFechar}
                aria-current={rotaAtiva(caminho, atalho.href) ? 'page' : undefined}
                className="alvo-toque flex items-center gap-4 rounded-[var(--radius-control)] border border-line bg-raised/60 p-3 transition-colors duration-150 hover:border-signal/35"
              >
                <span
                  aria-hidden="true"
                  className="tecnica grid size-12 flex-none place-items-center rounded-[12px] border border-line bg-raised text-signal"
                >
                  <ProductIcon id={atalho.simbolo} className="size-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base leading-tight text-paper">{atalho.rotulo}</span>
                  <span className="tecnica mt-1 flex items-center gap-2 text-mineral">
                    <span
                      aria-hidden="true"
                      className="inline-block size-[5px] flex-none rounded-full bg-signal shadow-[0_0_8px_var(--color-signal)]"
                    />
                    {atalho.estado}
                  </span>
                </span>
                <span aria-hidden="true" className="flex-none text-signal">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-6">
          {[
            { href: ROTAS.suporte, rotulo: 'Suporte' },
            { href: ROTAS.privacidade, rotulo: 'Privacidade' },
            { href: ROTAS.termos, rotulo: 'Termos' },
            { href: ROTAS.revalioExclusao, rotulo: 'Excluir conta — Revalio' },
            { href: ROTAS.docalioExclusao, rotulo: 'Excluir conta — Docalio' },
            { href: ROTAS.gramelioExclusao, rotulo: 'Excluir conta — Gramelio' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={aoFechar}
              className="tecnica text-mineral-dim hover:text-paper"
            >
              {link.rotulo}
            </Link>
          ))}
        </div>

        <p className="tecnica mt-8 text-mineral-dim">
          © {site.ano} {site.nome}
        </p>
      </nav>
    </Drawer>
  );
}
