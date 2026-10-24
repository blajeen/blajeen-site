'use client';

import { useSyncExternalStore } from 'react';

type Locale = 'pt-BR' | 'en';
// A escolha recarrega o documento; basta sincronizar o cookie durante a hidratação.
const subscribe = () => () => undefined;
const serverLocale = (): Locale => 'pt-BR';
const cookieLocale = (): Locale => document.cookie.split(';').some((cookie) => cookie.trim() === 'blajeen-locale=en') ? 'en' : 'pt-BR';

export function LanguageSwitcher() {
  const locale = useSyncExternalStore(subscribe, cookieLocale, serverLocale);

  function choose(next: Locale) {
    if (next === locale) return;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `blajeen-locale=${next === 'en' ? 'en' : 'pt'}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    window.location.reload();
  }

  return (
    <div className="language-switcher inline-flex shrink-0 items-center gap-1 rounded-full border border-line-strong bg-surface/80 p-1" role="group" aria-label="Selecionar idioma">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="ml-1 size-4 text-mineral">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.5 12h17M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" stroke="currentColor" strokeWidth="1.35" />
      </svg>
      <button type="button" aria-pressed={locale === 'pt-BR'} onClick={() => choose('pt-BR')} className="min-h-8 min-w-9 rounded-full px-2 text-[11px] font-semibold tracking-wide text-mineral transition-colors hover:text-paper aria-pressed:bg-raised aria-pressed:text-signal">PT</button>
      <button type="button" aria-pressed={locale === 'en'} onClick={() => choose('en')} className="min-h-8 min-w-9 rounded-full px-2 text-[11px] font-semibold tracking-wide text-mineral transition-colors hover:text-paper aria-pressed:bg-raised aria-pressed:text-signal">EN</button>
    </div>
  );
}
