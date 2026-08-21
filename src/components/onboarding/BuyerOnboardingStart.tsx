'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

const fieldClass = 'min-h-12 w-full rounded-2xl border border-line-strong bg-ink px-4 text-paper outline-none transition-colors placeholder:text-mineral-dim focus:border-signal';

export function BuyerOnboardingStart({ product, productName }: { product: string; productName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError('');
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const response = await fetch('/api/onboarding/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, product, purchaseConfirmed: values.purchaseConfirmed === 'on' }),
    });
    const payload = await response.json() as { path?: string; error?: string };
    if (!response.ok || !payload.path) {
      setError(payload.error ?? 'Não foi possível iniciar o formulário.'); setLoading(false); return;
    }
    router.push(payload.path);
  }

  return (
    <form onSubmit={start} className="mt-9 grid gap-5 sm:grid-cols-2">
      <label className="grid gap-2 text-sm text-mineral">Seu nome<input name="customerName" required autoComplete="name" placeholder="Nome completo" className={fieldClass} /></label>
      <label className="grid gap-2 text-sm text-mineral">Nome do negócio<input name="companyName" required autoComplete="organization" placeholder="Como sua marca é conhecida" className={fieldClass} /></label>
      <label className="grid gap-2 text-sm text-mineral">E-mail<input name="customerEmail" required type="email" autoComplete="email" placeholder="voce@empresa.com.br" className={fieldClass} /></label>
      <label className="grid gap-2 text-sm text-mineral">Telefone / WhatsApp<input name="customerPhone" required type="tel" autoComplete="tel" placeholder="(00) 00000-0000" className={fieldClass} /></label>
      <label className="hidden" aria-hidden="true">Não preencha<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="flex gap-3 rounded-2xl border border-line bg-ink/60 p-4 text-sm leading-relaxed text-mineral sm:col-span-2">
        <input name="purchaseConfirmed" type="checkbox" required className="mt-1 size-4 accent-[var(--color-signal)]" />
        <span>Quero contratar a {productName} e vou preencher as informações necessárias para a criação e personalização do projeto.</span>
      </label>
      <div className="sm:col-span-2">
        <button disabled={loading} className="alvo-toque tecnica inline-flex w-full items-center justify-center rounded-full border border-signal bg-signal px-6 text-ink transition-colors hover:bg-signal-pale disabled:opacity-55 sm:w-auto">
          {loading ? 'PREPARANDO…' : 'COMEÇAR FORMULÁRIO →'}
        </button>
        {error ? <p role="alert" className="mt-4 text-sm text-red-300">{error}</p> : null}
      </div>
    </form>
  );
}
