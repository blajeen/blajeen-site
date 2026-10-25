'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AdminIcon } from './AdminIcon';
import styles from './AdminShell.module.css';

const ABAS = [
  { href: '/admin', rotulo: 'Visão geral', icone: 'overview' },
  { href: '/admin/pedidos', rotulo: 'Pedidos', icone: 'orders' },
  { href: '/admin/contratos', rotulo: 'Contratos', icone: 'contracts' },
  { href: '/admin/catalogo', rotulo: 'Catálogo', icone: 'catalog' },
  { href: '/admin/loja', rotulo: 'Loja', icone: 'store' },
  { href: '/admin/relatorios', rotulo: 'Relatórios', icone: 'reports' },
  { href: '/admin/novidades', rotulo: 'Novidades', icone: 'news' },
  { href: '/admin/redes-sociais', rotulo: 'Redes sociais', icone: 'social' },
] as const;

/** Casca do painel: título da seção, abas e saída. Todas as telas do painel usam a mesma. */
export function AdminShell({ titulo, descricao, acoes, children }: { titulo: string; descricao: string; acoes?: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);
  const [erroSaida, setErroSaida] = useState('');
  const linksRef = useRef<HTMLDivElement>(null);
  const ativa = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));

  useEffect(() => {
    if (window.matchMedia('(max-width: 63.999rem)').matches) {
      linksRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    }
  }, [pathname]);

  async function sair() {
    setSaindo(true);
    setErroSaida('');
    try {
      const resposta = await fetch('/api/admin/logout', { method: 'POST' });
      if (!resposta.ok) throw new Error('Falha ao encerrar a sessão');
      router.push('/admin/login');
      router.refresh();
    } catch {
      setErroSaida('Não foi possível sair. Tente novamente.');
      setSaindo(false);
    }
  }

  return (
    <div className={styles.shell}>
      <nav aria-label="Seções do painel" className={styles.navigation}>
        <div className={styles.identity}>
          <span className={styles.brandIcon}><AdminIcon name="overview" className={styles.icon} /></span>
          <div><span className={styles.identityLabel}>Blajeen Labs</span><span className={styles.identityDetail}>Painel administrativo</span></div>
        </div>
        <div ref={linksRef} className={styles.links}>
          {ABAS.map((aba) => (
            <Link key={aba.href} href={aba.href} aria-current={ativa(aba.href) ? 'page' : undefined} className={styles.link}>
              <AdminIcon name={aba.icone} className={styles.icon} />
              <span>{aba.rotulo}</span>
            </Link>
          ))}
        </div>
        <button type="button" aria-label={saindo ? 'Saindo do painel' : 'Sair do painel'} onClick={() => void sair()} disabled={saindo} className={styles.logout}>
          <AdminIcon name="logout" className={styles.icon} /><span>{saindo ? 'Saindo…' : <>Sair<span className={styles.desktopLabel}> do painel</span></>}</span>
        </button>
        {erroSaida ? <p role="alert" className={styles.error}>{erroSaida}</p> : null}
      </nav>
      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Área administrativa</p>
            <h1 className={styles.title}>{titulo}</h1>
            <p className={styles.description}>{descricao}</p>
          </div>
          {acoes ? <div className={styles.actions}>{acoes}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
}
