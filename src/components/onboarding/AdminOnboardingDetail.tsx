'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { getOnboardingSchema } from '@/lib/onboarding/schema';
import { validateAnswers } from '@/lib/onboarding/validation';
import type { JsonValue, OnboardingBundle, OnboardingStatus } from '@/lib/onboarding/types';

type SafeBundle = Omit<OnboardingBundle, 'project'> & { project: Omit<OnboardingBundle['project'], 'tokenHash' | 'tokenEncrypted'> };

const statusLabels: Record<OnboardingStatus, string> = { WAITING_FOR_CUSTOMER: 'Aguardando cliente', IN_PROGRESS: 'Em preenchimento', SUBMITTED: 'Enviado', CHANGES_REQUESTED: 'Correções solicitadas', APPROVED: 'Aprovado', IMPLEMENTING: 'Em implantação', PUBLISHED: 'Publicado', ARCHIVED: 'Arquivado' };
const nextStatuses: Partial<Record<OnboardingStatus, readonly OnboardingStatus[]>> = { WAITING_FOR_CUSTOMER: ['ARCHIVED'], IN_PROGRESS: ['ARCHIVED'], SUBMITTED: ['APPROVED', 'ARCHIVED'], CHANGES_REQUESTED: ['ARCHIVED'], APPROVED: ['IMPLEMENTING', 'ARCHIVED'], IMPLEMENTING: ['PUBLISHED', 'ARCHIVED'], PUBLISHED: ['ARCHIVED'] };

function showValue(value: JsonValue | undefined): string {
  if (value === undefined || value === null || value === '') return 'Não preenchido';
  if (value === true) return 'Sim'; if (value === false) return 'Não';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return JSON.stringify(value, null, 2);
}

export function AdminOnboardingDetail({ id }: { id: string }) {
  const router = useRouter();
  const [bundle, setBundle] = useState<SafeBundle | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/onboardings/${id}`, { cache: 'no-store' });
    if (response.status === 401) { router.push('/admin/login'); return; }
    const payload = await response.json() as { bundle?: SafeBundle; url?: string; error?: string };
    if (!response.ok || !payload.bundle) throw new Error(payload.error ?? 'Não foi possível abrir o projeto.');
    setBundle(payload.bundle); setUrl(payload.url ?? '');
  }, [id, router]);
  useEffect(() => {
    // A carga resolve de forma assíncrona; a regra confunde a chamada do callback com atualização síncrona.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Falha ao carregar.'));
  }, [load]);
  const schema = useMemo(() => bundle ? getOnboardingSchema(bundle.project.projectType) : null, [bundle]);
  const issues = useMemo(() => bundle && schema ? validateAnswers(schema, bundle.answers, bundle.assets) : [], [bundle, schema]);

  async function action(payload: Record<string, unknown>) {
    setError('');
    const response = await fetch(`/api/admin/onboardings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json() as { url?: string; error?: string };
    if (!response.ok) { setError(result.error ?? 'Não foi possível concluir.'); return; }
    if (result.url) setUrl(result.url);
    await load();
  }

  async function requestCorrection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    await action({ action: 'request-changes', ...values });
  }

  if (error && !bundle) return <div className="mx-auto max-w-3xl px-[var(--gutter)] py-24"><p className="text-red-300">{error}</p></div>;
  if (!bundle || !schema) return <div className="mx-auto max-w-3xl px-[var(--gutter)] py-24"><p className="tecnica text-signal">CARREGANDO…</p></div>;

  return (
    <div className="mx-auto w-full max-w-[110rem] px-[var(--gutter)] py-12">
      <Link href="/admin/onboardings" className="alvo-toque inline-flex items-center text-sm text-mineral hover:text-paper">← Todos os onboardings</Link>
      <header className="mt-6 grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="tecnica text-signal">{statusLabels[bundle.project.status]}</p><h1 className="mt-4 text-[clamp(2.5rem,7vw,5.5rem)] leading-none">{bundle.project.companyName}</h1><p className="mt-4 text-mineral">{bundle.project.customerName} · {bundle.project.customerEmail} · {bundle.project.customerPhone}</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={() => void navigator.clipboard.writeText(url)} className="alvo-toque rounded-full border border-line-strong px-4 text-sm">Copiar link</button><button type="button" onClick={() => void action({ action: 'regenerate-link' })} className="alvo-toque rounded-full border border-line-strong px-4 text-sm">Regenerar link</button>{['APPROVED', 'IMPLEMENTING', 'PUBLISHED', 'ARCHIVED'].includes(bundle.project.status) ? <a href={`/api/admin/onboardings/${id}/export`} className="alvo-toque inline-flex items-center rounded-full border border-signal px-4 text-sm text-signal">Exportar JSON</a> : null}</div></header>
      {error ? <p role="alert" className="mt-5 rounded-xl border border-red-300/30 bg-red-300/5 p-4 text-sm text-red-300">{error}</p> : null}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          {issues.length ? <section className="rounded-[var(--radius-panel)] border border-amber-300/30 bg-amber-300/5 p-6"><h2 className="text-xl">Campos vazios ou inválidos</h2><ul className="mt-4 grid gap-2 text-sm text-mineral sm:grid-cols-2">{issues.map((issue) => <li key={issue.field}>{issue.field}: {issue.message}</li>)}</ul></section> : null}
          {schema.sections.map((section) => <section key={section.key} className="rounded-[var(--radius-panel)] border border-line-strong bg-surface p-6"><h2 className="text-2xl">{section.title}</h2><dl className="mt-5 grid gap-5 sm:grid-cols-2">{section.fields.map((field) => { const key = `${section.key}.${field.key}`; return <div key={field.key} className="min-w-0 border-t border-line pt-4"><dt className="text-xs text-mineral">{field.label}</dt><dd className="mt-2 whitespace-pre-wrap break-words text-sm text-paper">{showValue(bundle.answers[key])}</dd></div>; })}</dl></section>)}
          <section className="rounded-[var(--radius-panel)] border border-line-strong bg-surface p-6"><h2 className="text-2xl">Arquivos</h2>{bundle.assets.length ? <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{bundle.assets.map((asset) => <li key={asset.id} className="overflow-hidden rounded-2xl border border-line bg-ink"><a href={`/api/admin/onboardings/${id}/assets/${asset.id}/file`} target="_blank" rel="noreferrer" className="block">{asset.mimeType.startsWith('image/') ? <Image unoptimized width={640} height={360} src={`/api/admin/onboardings/${id}/assets/${asset.id}/file`} alt={asset.altText || ''} className="aspect-video w-full object-cover" /> : <span className="grid aspect-video place-items-center text-4xl">▤</span>}<span className="block truncate p-3 text-sm text-mineral">{asset.slot} · {asset.originalName}</span></a></li>)}</ul> : <p className="mt-4 text-mineral">Nenhum arquivo enviado.</p>}</section>
        </main>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[var(--radius-panel)] border border-line-strong bg-surface p-5"><h2 className="text-xl">Controle</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-mineral">Progresso</dt><dd>{bundle.project.progress}%</dd></div><div className="flex justify-between gap-3"><dt className="text-mineral">Responsável</dt><dd>{bundle.project.assignedTo ?? 'Não atribuído'}</dd></div><div className="flex justify-between gap-3"><dt className="text-mineral">Última atividade</dt><dd>{new Date(bundle.project.updatedAt).toLocaleDateString('pt-BR')}</dd></div></dl><div className="mt-5 space-y-2">{nextStatuses[bundle.project.status]?.map((status) => <button key={status} type="button" onClick={() => void action({ action: 'transition', status })} className={`alvo-toque w-full rounded-full border px-4 text-sm ${status === 'APPROVED' || status === 'IMPLEMENTING' || status === 'PUBLISHED' ? 'border-signal text-signal' : 'border-line-strong text-mineral'}`}>{statusLabels[status]}</button>)}</div></section>
          {bundle.project.status === 'SUBMITTED' ? <section className="rounded-[var(--radius-panel)] border border-line-strong bg-surface p-5"><h2 className="text-xl">Solicitar correção</h2><form onSubmit={requestCorrection} className="mt-4 space-y-3"><select name="section" required className="min-h-11 w-full rounded-xl border border-line-strong bg-ink px-3 text-sm"><option value="">Seção</option>{schema.sections.map((section) => <option key={section.key} value={section.key}>{section.title}</option>)}</select><input name="field" placeholder="Campo específico (opcional)" className="min-h-11 w-full rounded-xl border border-line-strong bg-ink px-3 text-sm" /><textarea name="message" required rows={5} placeholder="Explique claramente o que precisa mudar" className="w-full rounded-xl border border-line-strong bg-ink p-3 text-sm" /><input name="author" defaultValue="Blajeen" className="min-h-11 w-full rounded-xl border border-line-strong bg-ink px-3 text-sm" /><button className="alvo-toque w-full rounded-full border border-signal text-sm text-signal">Enviar correção</button></form></section> : null}
          <section className="rounded-[var(--radius-panel)] border border-line-strong bg-surface p-5"><h2 className="text-xl">Revisões</h2>{bundle.reviews.length ? <ul className="mt-4 space-y-4">{bundle.reviews.map((review) => <li key={review.id} className="border-t border-line pt-3 text-sm"><strong className="text-paper">{review.section}{review.field ? ` · ${review.field}` : ''}</strong><p className="mt-1 text-mineral">{review.message}</p><span className="tecnica mt-2 block text-mineral-dim">{review.status}</span>{review.status === 'OPEN' ? <button type="button" onClick={() => void action({ action: 'resolve-review', reviewId: review.id })} className="mt-2 min-h-11 text-xs text-signal">Marcar como resolvida</button> : null}</li>)}</ul> : <p className="mt-3 text-sm text-mineral">Nenhum comentário.</p>}</section>
          <section className="rounded-[var(--radius-panel)] border border-line-strong bg-surface p-5"><h2 className="text-xl">Histórico</h2><ol className="mt-4 space-y-4">{bundle.events.map((entry) => <li key={entry.id} className="border-l border-line pl-3"><strong className="tecnica text-paper">{entry.type}</strong><span className="mt-1 block text-xs text-mineral">{entry.actor} · {new Date(entry.createdAt).toLocaleString('pt-BR')}</span></li>)}</ol></section>
        </aside>
      </div>
    </div>
  );
}
