'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { ManagedNews } from '@/lib/news/repository';

const fieldClass = 'min-h-11 rounded-xl border border-line-strong bg-ink px-3 text-sm text-paper outline-none focus:border-signal';

export function AdminNews() {
  const router = useRouter();
  const [items, setItems] = useState<ManagedNews[]>([]);
  const [editing, setEditing] = useState<ManagedNews | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/news', { cache: 'no-store' });
    if (response.status === 401) { router.push('/admin/login'); return; }
    const payload = await response.json() as { items?: ManagedNews[]; error?: string };
    if (!response.ok) throw new Error(payload.error ?? 'Não foi possível carregar as novidades.');
    setItems(payload.items ?? []);
  }, [router]);

  useEffect(() => {
    // A carga assíncrona atualiza o estado somente quando a resposta chega.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Falha ao carregar.'));
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    const response = await fetch(editing ? `/api/admin/news/${editing.id}` : '/api/admin/news', {
      method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const payload = await response.json() as { error?: string };
    if (!response.ok) { setError(payload.error ?? 'Não foi possível salvar.'); return; }
    setMessage(editing ? 'Novidade atualizada.' : 'Novidade criada.');
    setEditing(null); form.reset(); await load();
  }

  async function remove(item: ManagedNews) {
    if (!window.confirm(`Excluir “${item.titulo}”?`)) return;
    const response = await fetch(`/api/admin/news/${item.id}`, { method: 'DELETE' });
    const payload = await response.json() as { error?: string };
    if (!response.ok) { setError(payload.error ?? 'Não foi possível excluir.'); return; }
    if (editing?.id === item.id) setEditing(null);
    await load();
  }

  return (
    <div className="mx-auto w-full max-w-[110rem] px-[var(--gutter)] py-12">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div><p className="tecnica text-signal">PAINEL BLAJEEN</p><h1 className="mt-4 text-[clamp(2.5rem,7vw,5.5rem)] leading-none">Novidades.</h1><p className="mt-4 text-mineral">Escreva, revise e publique atualizações no site.</p></div>
        <nav className="flex flex-wrap gap-3" aria-label="Área administrativa">
          <a href="/novidades" target="_blank" rel="noreferrer" className="alvo-toque inline-flex items-center rounded-full border border-line-strong px-4 text-sm text-mineral hover:text-paper">Ver página ↗</a>
          <button type="button" onClick={() => void fetch('/api/admin/logout', { method: 'POST' }).then(() => router.push('/admin/login'))} className="alvo-toque rounded-full border border-line-strong px-4 text-sm text-mineral">Sair</button>
        </nav>
      </header>

      <div className="mt-9 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
        <section aria-labelledby="editor-titulo" className="rounded-[var(--radius-panel)] border border-line-strong bg-surface p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4"><h2 id="editor-titulo" className="text-2xl">{editing ? 'Editar novidade' : 'Nova novidade'}</h2>{editing ? <button type="button" onClick={() => setEditing(null)} className="min-h-11 text-sm text-mineral hover:text-paper">Cancelar edição</button> : null}</div>
          <form key={editing?.id ?? 'new'} onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-mineral">Rótulo<input name="rotulo" required defaultValue={editing?.rotulo} placeholder="Em desenvolvimento" className={fieldClass} /></label>
            <label className="grid gap-2 text-sm text-mineral">Data<input name="data" required type="date" defaultValue={editing?.data ?? new Date().toISOString().slice(0, 10)} className={fieldClass} /></label>
            <label className="grid gap-2 text-sm text-mineral sm:col-span-2">Título<input name="titulo" required defaultValue={editing?.titulo} placeholder="Título que aparecerá no site" className={fieldClass} /></label>
            <label className="grid gap-2 text-sm text-mineral sm:col-span-2">Texto<textarea name="texto" required rows={9} defaultValue={editing?.texto.join('\n\n')} placeholder="Separe os parágrafos com uma linha em branco." className={`${fieldClass} p-3 leading-relaxed`} /></label>
            <label className="grid gap-2 text-sm text-mineral">Destino do botão (opcional)<input name="href" defaultValue={editing?.href} placeholder="/projects/barbearia" className={fieldClass} /></label>
            <label className="grid gap-2 text-sm text-mineral">Texto do botão (opcional)<input name="cta" defaultValue={editing?.cta} placeholder="Conhecer o projeto" className={fieldClass} /></label>
            <label className="grid gap-2 text-sm text-mineral">Situação<select name="status" defaultValue={editing?.status ?? 'DRAFT'} className={fieldClass}><option value="DRAFT">Rascunho</option><option value="PUBLISHED">Publicado</option></select></label>
            <div className="flex items-end"><button className="alvo-toque tecnica w-full rounded-full border border-signal bg-signal px-5 text-ink hover:bg-signal-pale">{editing ? 'SALVAR ALTERAÇÕES' : 'CRIAR NOVIDADE'} →</button></div>
          </form>
          {error ? <p role="alert" className="mt-4 text-sm text-red-300">{error}</p> : null}
          {message ? <p role="status" className="mt-4 text-sm text-signal">{message}</p> : null}
        </section>

        <section aria-labelledby="publicadas-titulo">
          <h2 id="publicadas-titulo" className="text-2xl">Histórico editorial</h2>
          {items.length ? <ul className="mt-5 space-y-3">{items.map((item) => <li key={item.id} className="rounded-2xl border border-line-strong bg-surface p-5"><div className="flex items-start justify-between gap-4"><div><span className={`tecnica ${item.status === 'PUBLISHED' ? 'text-signal' : 'text-mineral-dim'}`}>{item.status === 'PUBLISHED' ? 'PUBLICADO' : 'RASCUNHO'} · {new Date(`${item.data}T12:00:00`).toLocaleDateString('pt-BR')}</span><h3 className="mt-3 text-lg leading-tight">{item.titulo}</h3><p className="mt-2 text-sm text-mineral">{item.rotulo}</p></div><div className="flex flex-none gap-2"><button type="button" onClick={() => setEditing(item)} className="min-h-11 px-2 text-sm text-signal">Editar</button><button type="button" onClick={() => void remove(item)} className="min-h-11 px-2 text-sm text-red-300">Excluir</button></div></div></li>)}</ul> : <p className="mt-5 rounded-2xl border border-line p-6 text-mineral">Nenhuma novidade criada pelo painel.</p>}
        </section>
      </div>
    </div>
  );
}
