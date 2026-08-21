'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { OnboardingProject, OnboardingStatus, ProjectType } from '@/lib/onboarding/types';

type SafeProject = Omit<OnboardingProject, 'tokenHash' | 'tokenEncrypted'>;

const labels: Record<ProjectType, string> = { ECOMMERCE: 'E-commerce', BARBERSHOP: 'Barbearia', PERSONAL_TRAINER: 'Personal / Studio', BEAUTY_STUDIO: 'Estética / Beauty Studio' };
const statusLabels: Record<OnboardingStatus, string> = { WAITING_FOR_CUSTOMER: 'Aguardando cliente', IN_PROGRESS: 'Em preenchimento', SUBMITTED: 'Enviado', CHANGES_REQUESTED: 'Correções', APPROVED: 'Aprovado', IMPLEMENTING: 'Em implantação', PUBLISHED: 'Publicado', ARCHIVED: 'Arquivado' };
const fieldClass = 'min-h-11 rounded-xl border border-line-strong bg-ink px-3 text-sm text-paper focus:border-signal';

export function AdminOnboardings() {
  const router = useRouter();
  const [projects, setProjects] = useState<SafeProject[]>([]);
  const [error, setError] = useState('');
  const [createdUrl, setCreatedUrl] = useState('');
  const [filters, setFilters] = useState({ query: '', status: '', projectType: '' });
  const load = useCallback(async () => {
    const search = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    const response = await fetch(`/api/admin/onboardings?${search}`, { cache: 'no-store' });
    if (response.status === 401) { router.push('/admin/login'); return; }
    const payload = await response.json() as { projects?: SafeProject[]; error?: string };
    if (!response.ok) throw new Error(payload.error ?? 'Falha ao carregar.');
    setProjects(payload.projects ?? []);
  }, [filters, router]);
  useEffect(() => { const timer = setTimeout(() => void load().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Falha ao carregar.')), 250); return () => clearTimeout(timer); }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setCreatedUrl('');
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const response = await fetch('/api/admin/onboardings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const payload = await response.json() as { url?: string; error?: string };
    if (!response.ok) { setError(payload.error ?? 'Não foi possível criar.'); return; }
    setCreatedUrl(payload.url ?? ''); form.reset(); await load();
  }

  return (
    <div className="mx-auto w-full max-w-[110rem] px-[var(--gutter)] py-12">
      <header className="flex flex-wrap items-end justify-between gap-6"><div><p className="tecnica text-signal">PAINEL BLAJEEN</p><h1 className="mt-4 text-[clamp(2.5rem,7vw,5.5rem)] leading-none">Formulários.</h1><p className="mt-4 text-mineral">Crie acessos, acompanhe pendências e revise cada projeto.</p></div><nav className="flex flex-wrap gap-3" aria-label="Área administrativa"><Link href="/admin/novidades" className="alvo-toque inline-flex items-center rounded-full border border-signal px-4 text-sm text-signal">Postar novidade</Link><button type="button" onClick={() => void fetch('/api/admin/logout', { method: 'POST' }).then(() => router.push('/admin/login'))} className="alvo-toque rounded-full border border-line-strong px-4 text-sm text-mineral">Sair</button></nav></header>

      <section aria-labelledby="novo-titulo" className="mt-10 rounded-[var(--radius-panel)] border border-line-strong bg-surface p-6 lg:p-8">
        <h2 id="novo-titulo" className="text-2xl">Criar novo onboarding</h2>
        <form onSubmit={create} className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <input className={fieldClass} name="customerName" required placeholder="Nome do cliente" aria-label="Nome do cliente" />
          <input className={fieldClass} name="customerEmail" type="email" required placeholder="E-mail" aria-label="E-mail do cliente" />
          <input className={fieldClass} name="customerPhone" required placeholder="Telefone" aria-label="Telefone do cliente" />
          <input className={fieldClass} name="companyName" required placeholder="Empresa" aria-label="Empresa" />
          <select className={fieldClass} name="projectType" required aria-label="Tipo do projeto"><option value="">Tipo do projeto</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <button className="alvo-toque tecnica rounded-full bg-signal px-4 text-ink">CRIAR LINK →</button>
          <input className={fieldClass} name="assignedTo" placeholder="Responsável interno (opcional)" aria-label="Responsável interno" />
          <input className={fieldClass} name="sourceOrderId" placeholder="Pedido (opcional)" aria-label="ID do pedido" />
          <input className={fieldClass} name="sourceOrderItemId" placeholder="Item do pedido (idempotência)" aria-label="ID do item do pedido" />
        </form>
        {createdUrl ? <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-signal/30 bg-signal/5 p-4"><span className="min-w-0 flex-1 break-all text-sm text-paper">{createdUrl}</span><button type="button" onClick={() => void navigator.clipboard.writeText(createdUrl)} className="alvo-toque rounded-full border border-signal px-4 text-sm text-signal">Copiar link</button></div> : null}
        {error ? <p role="alert" className="mt-4 text-sm text-red-300">{error}</p> : null}
      </section>

      <section aria-labelledby="lista-titulo" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><h2 id="lista-titulo" className="text-2xl">Projetos</h2><div className="grid flex-1 gap-3 sm:grid-cols-3 lg:max-w-3xl"><input className={fieldClass} value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Buscar cliente, empresa ou e-mail" aria-label="Buscar" /><select className={fieldClass} value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} aria-label="Filtrar por status"><option value="">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select className={fieldClass} value={filters.projectType} onChange={(event) => setFilters({ ...filters, projectType: event.target.value })} aria-label="Filtrar por produto"><option value="">Todos os produtos</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
        <div className="mt-5 overflow-hidden rounded-[var(--radius-panel)] border border-line-strong bg-surface">
          {projects.length ? <ul>{projects.map((project) => <li key={project.id} className="border-b border-line last:border-0"><Link href={`/admin/onboardings/${project.id}`} className="grid gap-4 p-5 transition-colors hover:bg-raised sm:grid-cols-[minmax(12rem,1.5fr)_minmax(10rem,1fr)_9rem_8rem] sm:items-center"><div><strong className="block text-paper">{project.companyName}</strong><span className="mt-1 block text-sm text-mineral">{project.customerName} · {project.customerEmail}</span></div><span className="text-sm text-mineral">{labels[project.projectType]}</span><span className="tecnica text-signal">{statusLabels[project.status]}</span><span className="text-sm text-paper">{project.progress}% preenchido</span></Link></li>)}</ul> : <p className="p-8 text-center text-mineral">Nenhum onboarding encontrado.</p>}
        </div>
      </section>
    </div>
  );
}
