'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

const ABAS = [
  { href: '/admin', rotulo: 'Visão geral' },
  { href: '/admin/pedidos', rotulo: 'Pedidos' },
  { href: '/admin/contratos', rotulo: 'Contratos' },
  { href: '/admin/catalogo', rotulo: 'Catálogo' },
  { href: '/admin/relatorios', rotulo: 'Relatórios' },
  { href: '/admin/novidades', rotulo: 'Novidades' },
] as const;

/** Casca do painel: título da seção, abas e saída. Todas as telas do painel usam a mesma. */
export function AdminShell({ titulo, descricao, acoes, children }: { titulo: string; descricao: string; acoes?: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const ativa = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <div className="mx-auto w-full max-w-[110rem] px-[var(--gutter)] py-10">
      <nav aria-label="Seções do painel" className="-mx-1 flex flex-wrap items-center gap-2 border-b border-line pb-5">
        <span className="tecnica mr-3 text-signal">PAINEL BLAJEEN</span>
        {ABAS.map((aba) => (
          <Link key={aba.href} href={aba.href} aria-current={ativa(aba.href) ? 'page' : undefined}
            className={`alvo-toque inline-flex items-center rounded-full border px-4 text-sm transition-colors ${ativa(aba.href) ? 'border-signal bg-signal text-ink' : 'border-line-strong text-mineral hover:text-paper'}`}>
            {aba.rotulo}
          </Link>
        ))}
        <button type="button" onClick={() => void fetch('/api/admin/logout', { method: 'POST' }).then(() => router.push('/admin/login'))}
          className="alvo-toque ml-auto rounded-full border border-line-strong px-4 text-sm text-mineral hover:text-paper">Sair</button>
      </nav>
      <header className="flex flex-wrap items-end justify-between gap-6 pb-8 pt-9">
        <div>
          <h1 className="text-[clamp(2.4rem,6vw,4.6rem)] leading-none tracking-[-0.045em]">{titulo}</h1>
          <p className="mt-4 max-w-[62ch] text-mineral">{descricao}</p>
        </div>
        {acoes ? <div className="flex flex-wrap gap-3">{acoes}</div> : null}
      </header>
      {children}
    </div>
  );
}
