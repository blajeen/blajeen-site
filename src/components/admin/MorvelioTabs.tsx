'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import styles from './MorvelioAnalytics.module.css';

export type MorvelioTab = { id: string; label: string; content: ReactNode };

/** Abas do APG (setas, Home, End; só a aba atual entra no Tab). A aba aberta fica no hash do link. */
export function MorvelioTabs({ tabs }: { tabs: MorvelioTab[] }) {
  const [active, setActive] = useState(tabs[0]!.id);
  const list = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fromHash = () => { const id = decodeURIComponent(window.location.hash.slice(1)); if (tabs.some((t) => t.id === id)) setActive(id); };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [tabs]);
  useEffect(() => { // no celular a faixa rola na horizontal: a aba aberta fica à vista
    const strip = list.current; const button = strip?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    if (strip && button) strip.scrollLeft = Math.max(0, button.offsetLeft - 16);
  }, [active]);
  function open(id: string, focus = false) {
    setActive(id);
    window.history.replaceState(null, '', `#${id}`);
    // Abas grudadas no topo: ao trocar com a página rolada, a nova aba começa do início.
    if (root.current && root.current.getBoundingClientRect().top < 80) root.current.scrollIntoView?.({ block: 'start' }); // 80 px: abaixo do cabeçalho fixo
    if (focus) list.current?.querySelector<HTMLButtonElement>(`#morvelio-aba-${id}`)?.focus();
  }
  function key(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    const target = event.key === 'ArrowRight' ? (index === last ? 0 : index + 1) : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? last : null;
    if (target === null) return;
    event.preventDefault();
    open(tabs[target]!.id, true);
  }
  return <div ref={root} className={styles.tabsRoot}>
    <div ref={list} role="tablist" aria-label="Seções da Analytics do Morvelio" className={styles.tabs}>
      {tabs.map((t, i) => <button key={t.id} id={`morvelio-aba-${t.id}`} type="button" role="tab" aria-selected={t.id === active} aria-controls={`morvelio-painel-${t.id}`} tabIndex={t.id === active ? 0 : -1} onClick={() => open(t.id)} onKeyDown={(e) => key(e, i)}>{t.label}</button>)}
    </div>
    {tabs.map((t) => <div key={t.id} id={`morvelio-painel-${t.id}`} role="tabpanel" aria-labelledby={`morvelio-aba-${t.id}`} hidden={t.id !== active} tabIndex={0} className={styles.tabPanel}>{t.content}</div>)}
  </div>;
}
