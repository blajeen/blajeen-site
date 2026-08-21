import type { NewsInput, NewsStatus } from './repository';

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function parseNewsInput(body: Record<string, unknown>): NewsInput {
  const titulo = clean(body.titulo, 180);
  const rotulo = clean(body.rotulo, 80);
  const data = clean(body.data, 10);
  const rawText = Array.isArray(body.texto) ? body.texto.map(String) : clean(body.texto, 8000).split(/\n\s*\n/);
  const texto = rawText.map((entry) => entry.trim().slice(0, 3000)).filter(Boolean).slice(0, 8);
  const href = clean(body.href, 500);
  const cta = clean(body.cta, 100);
  const status: NewsStatus = body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
  if (!titulo || !rotulo || !/^\d{4}-\d{2}-\d{2}$/.test(data) || !texto.length) {
    throw new Error('Preencha título, rótulo, data e pelo menos um parágrafo.');
  }
  if (href && !(href.startsWith('/') || href.startsWith('https://'))) throw new Error('Use um endereço interno ou iniciado por https://.');
  if ((href && !cta) || (!href && cta)) throw new Error('O botão precisa ter texto e destino.');
  return { titulo, rotulo, data, texto, status, ...(href ? { href, cta } : {}) };
}
