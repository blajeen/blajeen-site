'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('');
    const password = String(new FormData(event.currentTarget).get('password') ?? '');
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) { setError(payload.error ?? 'Não foi possível entrar.'); setLoading(false); return; }
    router.push('/admin/novidades');
  }
  return (
    <div className="mx-auto max-w-lg px-[var(--gutter)] py-24">
      <p className="tecnica text-signal">ÁREA INTERNA</p>
      <h1 className="mt-5 text-[clamp(2.5rem,7vw,4.5rem)] leading-none">Novidades.</h1>
      <p className="mt-5 text-mineral">Acesso reservado para publicar e editar as novidades da Blajeen Labs.</p>
      <form onSubmit={submit} className="mt-9 rounded-[var(--radius-panel)] border border-line-strong bg-surface p-6 shadow-panel">
        <label className="text-sm text-mineral">Senha administrativa<input name="password" type="password" autoComplete="current-password" required autoFocus className="mt-2 min-h-12 w-full rounded-2xl border border-line-strong bg-ink px-4 text-paper focus:border-signal" /></label>
        <button type="submit" disabled={loading} className="alvo-toque tecnica mt-5 w-full rounded-full bg-signal px-5 text-ink disabled:opacity-50">{loading ? 'ENTRANDO…' : 'ENTRAR →'}</button>
        {error ? <p role="alert" className="mt-4 text-sm text-red-300">{error}</p> : null}
      </form>
    </div>
  );
}
