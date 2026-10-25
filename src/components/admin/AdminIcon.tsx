import type { ReactNode } from 'react';

export type AdminIconName = 'overview' | 'orders' | 'contracts' | 'catalog' | 'store' | 'reports' | 'news' | 'social' | 'logout' | 'products' | 'settings' | 'arrow';

const paths: Record<AdminIconName, ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  orders: <><path d="M8 4h8l1 3h3v14H4V7h3l1-3Z" /><path d="M9 3v5h6V3M8 12h8M8 16h5" /></>,
  contracts: <><path d="M14 3H5v18h14V8l-5-5Z" /><path d="M14 3v5h5M8 12h7M8 16h4" /></>,
  catalog: <><path d="M4 4h7v16H4zM14 4h6v16h-6zM7 8h1M7 12h1M17 8h1" /></>,
  store: <><path d="m3 9 2-6h14l2 6M4 13v8h16v-8M3 9v2a3 3 0 0 0 6 0V9m0 0v2a3 3 0 0 0 6 0V9m0 0v2a3 3 0 0 0 6 0V9H3Z" /><path d="M9 21v-6h6v6" /></>,
  reports: <><path d="M4 3v18h17M8 16v-5M13 16V7M18 16v-9" /></>,
  news: <><path d="M4 4h16v16H4zM8 8h8M8 12h3M8 16h3M15 12h1v4h-1z" /></>,
  social: <><circle cx="5" cy="12" r="3" /><circle cx="18" cy="5" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8 10 7-4M8 14l7 4" /></>,
  logout: <><path d="M9 4H4v16h5M14 8l4 4-4 4M8 12h13" /></>,
  products: <><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Z" /><path d="m3 8 9 5 9-5M12 13v9M7.5 5.5l9 5" /></>,
  settings: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="2" fill="var(--color-surface)" /><circle cx="16" cy="12" r="2" fill="var(--color-surface)" /><circle cx="10" cy="18" r="2" fill="var(--color-surface)" /></>,
  arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
};

/** Ícones decorativos: cada controle mantém seu rótulo de texto acessível. */
export function AdminIcon({ name, className }: { name: AdminIconName; className?: string | undefined }) {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>;
}
