'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

function extractToken(value: string): string {
  const clean = value.trim().replace(/\/+$/, '');
  if (!clean) return '';
  try {
    const url = new URL(clean);
    return url.pathname.split('/').filter(Boolean).at(-1) ?? '';
  } catch {
    return clean.split('/').filter(Boolean).at(-1) ?? '';
  }
}

export function OnboardingAccessGate() {
  const router = useRouter();
  const [error, setError] = useState('');

  function open(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const token = extractToken(String(data.get('access') ?? ''));
    if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) {
      setError('Confira o link ou código enviado pela equipe Blajeen Labs.');
      return;
    }
    router.push(`/onboarding/${encodeURIComponent(token)}`);
  }

  return (
    <form onSubmit={open} className="mt-8">
      <label htmlFor="onboarding-access" className="tecnica block text-paper">
        LINK OU CÓDIGO DE ACESSO
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id="onboarding-access"
          name="access"
          required
          autoComplete="off"
          placeholder="Cole aqui o acesso recebido"
          className="min-h-12 min-w-0 flex-1 rounded-2xl border border-line-strong bg-ink px-4 text-paper outline-none transition-colors placeholder:text-mineral-dim focus:border-signal"
        />
        <button className="alvo-toque tecnica rounded-full border border-signal bg-signal px-6 text-ink transition-colors hover:bg-signal-pale">
          ABRIR FORMULÁRIO →
        </button>
      </div>
      {error ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
