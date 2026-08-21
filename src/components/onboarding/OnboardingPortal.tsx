'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { AnswerMap, JsonValue, OnboardingAsset, OnboardingField, OnboardingProject, OnboardingReview, OnboardingSchema } from '@/lib/onboarding/types';
import { isFieldVisible } from '@/lib/onboarding/schema';

type SafeAsset = Omit<OnboardingAsset, 'storageKey'>;
type PortalData = {
  project: Omit<OnboardingProject, 'tokenHash' | 'tokenEncrypted'>;
  answers: AnswerMap;
  assets: SafeAsset[];
  reviews: OnboardingReview[];
  schema: OnboardingSchema;
  progress: { progress: number; completed: number; total: number; pending: string[] };
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const inputClass = 'mt-2 min-h-12 w-full rounded-2xl border border-line-strong bg-ink/60 px-4 py-3 text-paper outline-none transition-colors placeholder:text-mineral-dim focus:border-signal disabled:cursor-not-allowed disabled:opacity-55';

function toRecord(value: JsonValue | undefined): Record<string, JsonValue> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function fieldId(path: string): string {
  return `campo-${path.replace(/[^a-z0-9]/gi, '-')}`;
}

function formatStatus(status: string): string {
  return ({ WAITING_FOR_CUSTOMER: 'Aguardando início', IN_PROGRESS: 'Em preenchimento', SUBMITTED: 'Enviado para revisão', CHANGES_REQUESTED: 'Correções solicitadas', APPROVED: 'Aprovado', IMPLEMENTING: 'Em implantação', PUBLISHED: 'Publicado', ARCHIVED: 'Arquivado' } as Record<string, string>)[status] ?? status;
}

function FileField({ token, path, field, assets, disabled, onChanged }: {
  token: string; path: string; field: OnboardingField; assets: SafeAsset[]; disabled: boolean; onChanged: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const matching = assets.filter((asset) => asset.slot === path).sort((a, b) => a.sortOrder - b.sortOrder);
  const limit = field.type === 'file' ? 1 : field.maxFiles ?? 12;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true); setError('');
    try {
      for (const file of Array.from(files).slice(0, Math.max(0, limit - matching.length))) {
        const form = new FormData();
        form.set('file', file); form.set('slot', path); form.set('altText', ''); form.set('caption', ''); form.set('consentConfirmed', 'true');
        const response = await fetch(`/api/onboarding/${token}/upload`, { method: 'POST', body: form });
        const payload = await response.json() as { error?: string };
        if (!response.ok) throw new Error(payload.error ?? 'Falha no upload.');
      }
      await onChanged();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Falha no upload.'); }
    finally { setUploading(false); }
  }

  async function remove(assetId: string) {
    setError('');
    const response = await fetch(`/api/onboarding/${token}/assets/${assetId}`, { method: 'DELETE' });
    const payload = await response.json() as { error?: string };
    if (!response.ok) { setError(payload.error ?? 'Não foi possível remover.'); return; }
    await onChanged();
  }

  return (
    <div className="mt-2 rounded-2xl border border-dashed border-line-strong bg-ink/35 p-4">
      {matching.length ? (
        <ul className="mb-3 grid gap-3 sm:grid-cols-2">
          {matching.map((asset) => (
            <li key={asset.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-surface p-3">
              {asset.mimeType.startsWith('image/') ? <Image unoptimized width={56} height={56} src={`/api/onboarding/${token}/assets/${asset.id}/file`} alt={asset.altText || ''} className="h-14 w-14 rounded-lg object-cover" /> : <span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-lg bg-raised text-xl">▤</span>}
              <span className="min-w-0 flex-1 truncate text-sm text-mineral">{asset.originalName}</span>
              {!disabled ? <button type="button" onClick={() => void remove(asset.id)} className="alvo-toque rounded-full px-3 text-sm text-mineral hover:text-paper" aria-label={`Remover ${asset.originalName}`}>×</button> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {matching.length < limit && !disabled ? (
        <label className="alvo-toque inline-flex cursor-pointer items-center rounded-full border border-line-strong px-4 text-sm text-paper hover:border-signal">
          {uploading ? 'Enviando…' : matching.length ? 'Adicionar outro' : 'Selecionar arquivo'}
          <input className="sr-only" type="file" multiple={field.type === 'files'} accept={field.accept === 'document' ? '.pdf,.csv,.xlsx' : field.accept === 'logo' ? '.png,.svg' : field.accept === 'image-or-document' ? '.png,.jpg,.jpeg,.webp,.svg,.pdf' : '.png,.jpg,.jpeg,.webp'} onChange={(event) => void upload(event.target.files)} disabled={uploading} />
        </label>
      ) : null}
      <p className="mt-2 text-xs leading-relaxed text-mineral-dim">PNG, JPEG, WEBP, SVG seguro ou PDF, até 4 MB. Arquivos executáveis são recusados.</p>
      {error ? <p role="alert" className="mt-2 text-sm text-red-300">{error}</p> : null}
    </div>
  );
}

function HoursField({ value, options, disabled, onChange }: { value: JsonValue | undefined; options: readonly string[]; disabled: boolean; onChange: (value: JsonValue) => void }) {
  const schedule = toRecord(value);
  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-line-strong">
      {options.map((day) => {
        const entry = toRecord(schedule[day]);
        const closed = entry.closed === true;
        return (
          <div key={day} className="grid grid-cols-[minmax(7rem,1fr)_auto] items-center gap-3 border-b border-line p-3 last:border-0 sm:grid-cols-[minmax(8rem,1fr)_7rem_7rem_auto]">
            <span className="text-sm text-paper">{day}</span>
            <input type="time" aria-label={`Abertura de ${day}`} className="rounded-xl border border-line bg-ink px-2 py-2 text-sm disabled:opacity-40" disabled={disabled || closed} value={typeof entry.start === 'string' ? entry.start : ''} onChange={(event) => onChange({ ...schedule, [day]: { ...entry, start: event.target.value } })} />
            <input type="time" aria-label={`Fechamento de ${day}`} className="rounded-xl border border-line bg-ink px-2 py-2 text-sm disabled:opacity-40" disabled={disabled || closed} value={typeof entry.end === 'string' ? entry.end : ''} onChange={(event) => onChange({ ...schedule, [day]: { ...entry, end: event.target.value } })} />
            <label className="flex items-center gap-2 text-xs text-mineral"><input type="checkbox" checked={closed} disabled={disabled} onChange={(event) => onChange({ ...schedule, [day]: { ...entry, closed: event.target.checked } })} /> Fechado</label>
          </div>
        );
      })}
    </div>
  );
}

function RepeaterField({ token, path, field, value, assets, disabled, onChange, onAssetsChanged }: {
  token: string; path: string; field: OnboardingField; value: JsonValue | undefined; assets: SafeAsset[]; disabled: boolean;
  onChange: (value: JsonValue) => void; onAssetsChanged: () => Promise<void>;
}) {
  const items = Array.isArray(value) ? value.map(toRecord) : [];
  function update(index: number, key: string, next: JsonValue) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: next } : item));
  }
  return (
    <div className="mt-2 space-y-4">
      {items.map((item, index) => (
        <fieldset key={`${path}-${index}`} className="rounded-2xl border border-line-strong bg-ink/35 p-4">
          <legend className="tecnica px-2 text-mineral">ITEM {String(index + 1).padStart(2, '0')}</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {(field.fields ?? []).map((child) => (
              <FieldControl key={child.key} token={token} path={`${path}.${index}.${child.key}`} field={child} value={item[child.key]} assets={assets} disabled={disabled} onChange={(next) => update(index, child.key, next)} onAssetsChanged={onAssetsChanged} compact />
            ))}
          </div>
          {!disabled ? <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="mt-4 min-h-11 text-sm text-mineral hover:text-paper">Remover item</button> : null}
        </fieldset>
      ))}
      {!disabled ? <button type="button" onClick={() => onChange([...items, {}])} className="alvo-toque rounded-full border border-line-strong px-4 text-sm text-paper hover:border-signal">+ Adicionar item</button> : null}
    </div>
  );
}

function FieldControl({ token, path, field, value, assets, disabled, onChange, onAssetsChanged, compact = false }: {
  token: string; path: string; field: OnboardingField; value: JsonValue | undefined; assets: SafeAsset[]; disabled: boolean;
  onChange: (value: JsonValue) => void; onAssetsChanged: () => Promise<void>; compact?: boolean;
}) {
  const id = fieldId(path);
  const wrapper = compact ? 'sm:col-span-1' : '';
  if (field.type === 'file' || field.type === 'files') return (
    <div className={wrapper}><label id={`${id}-label`} className="text-sm text-mineral">{field.label}{field.required ? <span className="text-signal"> *</span> : null}</label><FileField token={token} path={path} field={field} assets={assets} disabled={disabled} onChanged={onAssetsChanged} /></div>
  );
  if (field.type === 'repeater') return <div className={compact ? 'sm:col-span-2' : ''}><p className="text-sm text-mineral">{field.label}{field.required ? <span className="text-signal"> *</span> : null}</p><RepeaterField token={token} path={path} field={field} value={value} assets={assets} disabled={disabled} onChange={onChange} onAssetsChanged={onAssetsChanged} /></div>;
  if (field.type === 'hours') return <div className={compact ? 'sm:col-span-2' : ''}><p className="text-sm text-mineral">{field.label}</p><HoursField value={value} options={field.options ?? []} disabled={disabled} onChange={onChange} /></div>;
  if (field.type === 'toggle') return <label className={`flex min-h-12 items-center gap-3 rounded-2xl border border-line-strong bg-ink/35 px-4 text-sm text-paper ${wrapper}`}><input id={id} type="checkbox" checked={value === true} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-signal" />{field.label}{field.required ? <span className="text-signal">*</span> : null}</label>;
  if (field.type === 'checklist') {
    const selected = Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
    return <fieldset className={compact ? 'sm:col-span-2' : ''}><legend className="text-sm text-mineral">{field.label}</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{field.options?.map((option) => <label key={option} className="flex min-h-11 items-center gap-3 rounded-xl border border-line bg-ink/35 px-3 text-sm text-paper"><input type="checkbox" checked={selected.includes(option)} disabled={disabled} onChange={(event) => onChange(event.target.checked ? [...selected, option] : selected.filter((entry) => entry !== option))} className="accent-signal" />{option}</label>)}</div></fieldset>;
  }
  const label = <>{field.label}{field.required ? <span className="text-signal"> *</span> : null}</>;
  if (field.type === 'textarea') return <label className={compact ? 'sm:col-span-2 text-sm text-mineral' : 'text-sm text-mineral'} htmlFor={id}>{label}<textarea id={id} rows={5} value={typeof value === 'string' ? value : ''} disabled={disabled} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} className={inputClass} />{field.description ? <span className="mt-2 block text-xs text-mineral-dim">{field.description}</span> : null}</label>;
  if (field.type === 'select') return <label className={`text-sm text-mineral ${wrapper}`} htmlFor={id}>{label}<select id={id} value={typeof value === 'string' ? value : ''} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={inputClass}><option value="">Selecione</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select></label>;
  const type = field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'color' ? 'color' : field.type === 'url' ? 'url' : 'text';
  return <label className={`text-sm text-mineral ${wrapper}`} htmlFor={id}>{label}<input id={id} type={type} inputMode={field.type === 'tel' || field.type === 'cpfCnpj' || field.type === 'cep' ? 'numeric' : undefined} value={typeof value === 'string' ? value : ''} disabled={disabled} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} className={`${inputClass} ${field.type === 'color' ? 'h-14 p-2' : ''}`} />{field.description ? <span className="mt-2 block text-xs text-mineral-dim">{field.description}</span> : null}</label>;
}

export function OnboardingPortal({ token }: { token: string }) {
  const [data, setData] = useState<PortalData | null>(null);
  const [loadingError, setLoadingError] = useState('');
  const [step, setStep] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [submitError, setSubmitError] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const pendingRef = useRef<AnswerMap>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef<PortalData | null>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/onboarding/${token}`, { cache: 'no-store' });
    const payload = await response.json() as PortalData & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? 'Não foi possível abrir este onboarding.');
    setData(payload); dataRef.current = payload;
    setStep((current) => current === 0 ? Math.min(payload.project.currentStep, payload.schema.sections.length) : current);
  }, [token]);

  useEffect(() => {
    // A carga resolve de forma assíncrona; a regra confunde a chamada do callback com atualização síncrona.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load().catch((error: unknown) => setLoadingError(error instanceof Error ? error.message : 'Falha ao carregar.'));
  }, [load]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  async function flushSave() {
    const patch = pendingRef.current;
    if (!Object.keys(patch).length) return;
    pendingRef.current = {};
    setSaveState('saving');
    try {
      const response = await fetch(`/api/onboarding/${token}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: patch, currentStep: step }) });
      const payload = await response.json() as PortalData & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Não foi possível salvar.');
      setData(payload); dataRef.current = payload; setSaveState('saved');
    } catch { pendingRef.current = { ...patch, ...pendingRef.current }; setSaveState('error'); }
  }

  function updateAnswer(key: string, value: JsonValue) {
    setData((current) => {
      if (!current) return current;
      const updated = { ...current, answers: { ...current.answers, [key]: value } };
      dataRef.current = updated;
      return updated;
    });
    pendingRef.current[key] = value;
    setSaveState('idle');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flushSave(), 900);
  }

  async function move(next: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    await flushSave();
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit() {
    setSubmitError('');
    await flushSave();
    const response = await fetch(`/api/onboarding/${token}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ termsAccepted }) });
    const payload = await response.json() as { error?: string };
    if (!response.ok) { setSubmitError(payload.error ?? 'Não foi possível enviar.'); return; }
    await load();
  }

  if (loadingError) return <div className="mx-auto max-w-2xl px-[var(--gutter)] py-24"><p className="tecnica text-signal">ACESSO INDISPONÍVEL</p><h1 className="mt-5 text-4xl">Não foi possível abrir este link.</h1><p className="mt-5 text-mineral">{loadingError}</p></div>;
  if (!data) return <div className="mx-auto max-w-2xl px-[var(--gutter)] py-24"><p className="tecnica text-signal">CARREGANDO ONBOARDING…</p></div>;

  const editable = ['WAITING_FOR_CUSTOMER', 'IN_PROGRESS', 'CHANGES_REQUESTED'].includes(data.project.status);
  const correctionKeys = new Set(data.reviews.flatMap((review) => review.field ? [`${review.section}.${review.field}`] : data.schema.sections.find((section) => section.key === review.section)?.fields.map((field) => `${review.section}.${field.key}`) ?? []));
  const reviewStep = data.schema.sections.length;
  const section = data.schema.sections[step];

  return (
    <div className="min-h-[80dvh] bg-ink py-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-[96rem] gap-6 px-[var(--gutter)] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="self-start rounded-[var(--radius-panel)] border border-line-strong bg-surface/95 p-5 lg:sticky lg:top-24">
          <p className="tecnica text-signal">CENTRAL DO PROJETO</p>
          <h1 className="mt-4 text-2xl leading-tight">{data.project.companyName}</h1>
          <p className="mt-2 text-sm text-mineral">{data.schema.title}</p>
          <div className="mt-6"><div className="flex justify-between text-xs text-mineral"><span>Progresso</span><strong className="text-paper">{data.progress.progress}%</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-steel"><div className="h-full rounded-full bg-signal transition-[width]" style={{ width: `${data.progress.progress}%` }} /></div></div>
          <p className="tecnica mt-5 text-mineral">{formatStatus(data.project.status)}</p>
          <nav aria-label="Etapas do onboarding" className="mt-6"><ol className="space-y-1">{data.schema.sections.map((item, index) => <li key={item.key}><button type="button" onClick={() => void move(index)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm ${step === index ? 'bg-raised text-signal' : 'text-mineral hover:text-paper'}`}><span className="tecnica">{String(index + 1).padStart(2, '0')}</span><span>{item.title}</span></button></li>)}<li><button type="button" onClick={() => void move(reviewStep)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm ${step === reviewStep ? 'bg-raised text-signal' : 'text-mineral hover:text-paper'}`}><span className="tecnica">{String(reviewStep + 1).padStart(2, '0')}</span><span>Revisar e enviar</span></button></li></ol></nav>
        </aside>

        <div className="min-w-0">
          {data.reviews.length ? <section className="mb-6 rounded-[var(--radius-panel)] border border-signal/40 bg-signal/5 p-6"><p className="tecnica text-signal">CORREÇÕES SOLICITADAS</p><ul className="mt-4 space-y-3">{data.reviews.map((review) => <li key={review.id} className="text-sm leading-relaxed text-paper"><strong>{review.section}{review.field ? ` · ${review.field}` : ''}</strong><span className="block text-mineral">{review.message}</span></li>)}</ul></section> : null}
          <section className="rounded-[var(--radius-panel)] border border-line-strong bg-surface/95 p-5 shadow-panel sm:p-8 lg:p-10">
            {section ? (
              <>
                <div className="border-b border-line pb-7"><p className="tecnica text-signal">ETAPA {String(step + 1).padStart(2, '0')}</p><h2 className="mt-4 max-w-[20ch] text-[clamp(2rem,5vw,3.6rem)] leading-[1.02]">{section.title}</h2><p className="mt-4 max-w-2xl leading-relaxed text-mineral">{section.description}</p></div>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">{section.fields.filter((field) => isFieldVisible(field, data.answers)).map((field) => {
                  const path = `${section.key}.${field.key}`;
                  const fieldDisabled = !editable || (data.project.status === 'CHANGES_REQUESTED' && !correctionKeys.has(path));
                  return <FieldControl key={path} token={token} path={path} field={field} value={data.answers[path]} assets={data.assets} disabled={fieldDisabled} onChange={(value) => updateAnswer(path, value)} onAssetsChanged={load} />;
                })}</div>
              </>
            ) : (
              <>
                <div className="border-b border-line pb-7"><p className="tecnica text-signal">REVISÃO FINAL</p><h2 className="mt-4 text-[clamp(2rem,5vw,3.6rem)] leading-[1.02]">Confira antes de enviar.</h2><p className="mt-4 max-w-2xl leading-relaxed text-mineral">Você ainda pode voltar às etapas e editar. Depois do envio, o conteúdo fica bloqueado até a Blajeen aprovar ou solicitar uma correção.</p></div>
                {data.progress.pending.length ? <div className="mt-7 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-5"><h3 className="text-lg">Pendências obrigatórias</h3><ul className="mt-3 grid gap-2 text-sm text-mineral sm:grid-cols-2">{data.progress.pending.map((item) => <li key={item}>— {item}</li>)}</ul></div> : <p className="mt-7 rounded-2xl border border-signal/30 bg-signal/5 p-5 text-sm text-paper">Tudo que é obrigatório foi preenchido.</p>}
                <div className="mt-8 space-y-7">{data.schema.sections.map((summarySection) => <section key={summarySection.key} className="rounded-2xl border border-line p-5"><h3 className="text-xl">{summarySection.title}</h3><dl className="mt-4 grid gap-4 sm:grid-cols-2">{summarySection.fields.filter((field) => isFieldVisible(field, data.answers)).map((field) => { const value = data.answers[`${summarySection.key}.${field.key}`]; const count = data.assets.filter((asset) => asset.slot === `${summarySection.key}.${field.key}`).length; return <div key={field.key}><dt className="text-xs text-mineral">{field.label}</dt><dd className="mt-1 break-words text-sm text-paper">{field.type === 'file' || field.type === 'files' ? `${count} arquivo(s)` : typeof value === 'string' ? value || '—' : value === true ? 'Sim' : value === false ? 'Não' : Array.isArray(value) ? `${value.length} item(ns)` : value ? 'Preenchido' : '—'}</dd></div>; })}</dl></section>)}</div>
                {editable ? <div className="mt-8 border-t border-line pt-7"><label className="flex items-start gap-3 text-sm leading-relaxed text-mineral"><input type="checkbox" className="mt-1 h-5 w-5 accent-signal" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />Confirmo que as informações são verdadeiras e que possuo autorização para a Blajeen usar os textos, marcas e imagens enviados exclusivamente na criação deste projeto.</label><button type="button" onClick={() => void submit()} disabled={!termsAccepted || data.progress.pending.length > 0} className="alvo-toque tecnica mt-6 rounded-full bg-signal px-6 text-ink disabled:cursor-not-allowed disabled:opacity-40">Enviar para revisão →</button>{submitError ? <p role="alert" className="mt-3 text-sm text-red-300">{submitError}</p> : null}</div> : <p className="mt-8 rounded-2xl border border-line-strong bg-raised p-5 text-sm text-mineral">Este conteúdo está bloqueado no estado atual: <strong className="text-paper">{formatStatus(data.project.status)}</strong>.</p>}
              </>
            )}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <button type="button" disabled={step === 0} onClick={() => void move(Math.max(0, step - 1))} className="alvo-toque rounded-full border border-line-strong px-5 text-sm text-paper disabled:opacity-30">← Voltar</button>
              <p aria-live="polite" className={`tecnica ${saveState === 'error' ? 'text-red-300' : 'text-mineral'}`}>{saveState === 'saving' ? 'SALVANDO…' : saveState === 'saved' ? 'SALVO' : saveState === 'error' ? 'ERRO AO SALVAR — TENTAREMOS NOVAMENTE' : editable ? 'SALVAMENTO AUTOMÁTICO' : 'SOMENTE LEITURA'}</p>
              <button type="button" disabled={step === reviewStep} onClick={() => void move(Math.min(reviewStep, step + 1))} className="alvo-toque rounded-full border border-signal px-5 text-sm text-signal disabled:opacity-30">Continuar →</button>
            </div>
          </section>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-mineral-dim">A Blajeen nunca solicita senha de domínio, e-mail, banco ou gateway neste formulário. Acessos são concedidos por convite em uma etapa separada.</p>
        </div>
      </div>
    </div>
  );
}
