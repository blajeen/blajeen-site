import { getOnboardingSchema } from './schema';
import type { JsonValue, OnboardingBundle } from './types';

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[character] ?? character));
}

function displayValue(value: JsonValue | undefined): string {
  if (value === undefined || value === null || value === '') return 'Não preenchido';
  if (value === true) return 'Sim';
  if (value === false) return 'Não';
  if (Array.isArray(value)) return value.map((entry) => typeof entry === 'object' ? JSON.stringify(entry) : String(entry)).join('\n');
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export function renderOnboardingSummaryHtml(bundle: OnboardingBundle): string {
  const schema = getOnboardingSchema(bundle.project.projectType);
  const sections = schema.sections.map((section) => {
    const fields = section.fields.map((field) => {
      const value = displayValue(bundle.answers[`${section.key}.${field.key}`]);
      return `<div class="field"><dt>${escapeHtml(field.label)}</dt><dd>${escapeHtml(value).replace(/\n/g, '<br>')}</dd></div>`;
    }).join('');
    return `<section><h2>${escapeHtml(section.title)}</h2><dl>${fields}</dl></section>`;
  }).join('');
  const files = bundle.assets.length
    ? `<ul>${bundle.assets.map((asset) => `<li>${escapeHtml(asset.slot)} — ${escapeHtml(asset.originalName)} (${escapeHtml(asset.mimeType)})</li>`).join('')}</ul>`
    : '<p>Nenhum arquivo enviado.</p>';

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Briefing — ${escapeHtml(bundle.project.companyName)}</title><style>
  :root{font-family:Arial,sans-serif;color:#20231e;background:#f5f6f0}body{margin:0;padding:32px}main{max-width:920px;margin:auto;background:#fff;padding:40px;border:1px solid #dfe3d7;border-radius:20px}header{border-bottom:3px solid #b7ef2e;padding-bottom:24px}h1{font-size:32px;margin:8px 0}h2{font-size:20px;margin:36px 0 12px;color:#32372e}p,li,dd{line-height:1.55}.meta{color:#687061}.field{display:grid;grid-template-columns:minmax(170px,1fr) 2fr;gap:20px;border-top:1px solid #e8eadf;padding:13px 0}dt{color:#687061;font-size:13px}dd{margin:0;white-space:normal;overflow-wrap:anywhere}@media(max-width:650px){body{padding:0}main{border:0;border-radius:0;padding:24px}.field{grid-template-columns:1fr;gap:6px}}@media print{body{background:#fff;padding:0}main{border:0;padding:0}}
  </style></head><body><main><header><p class="meta">BLAJEEN LABS · BRIEFING DE CRIAÇÃO</p><h1>${escapeHtml(bundle.project.companyName)}</h1><p>${escapeHtml(bundle.project.customerName)} · ${escapeHtml(bundle.project.customerEmail)} · ${escapeHtml(bundle.project.customerPhone)}</p><p class="meta">Enviado em ${escapeHtml(bundle.project.submittedAt ? new Date(bundle.project.submittedAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR'))}</p></header>${sections}<section><h2>Arquivos enviados</h2>${files}</section></main></body></html>`;
}
