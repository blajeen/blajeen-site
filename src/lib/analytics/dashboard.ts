import { createHash } from 'node:crypto';
import { unstable_cache } from 'next/cache';
import { bancoConfigurado, consultar } from '@/lib/admin/banco';
import { MissingConfiguration, readAppleReviews, readDevices, readInstalls, readPlayReviews, readRate } from './providers';
import { readUnity } from './unity';
import type { Dashboard, Review, Source } from './types';

export async function source<T>(read: () => Promise<T>): Promise<Source<T>> {
  try { return { status: 'ok', data: await read(), message: '', checkedAt: new Date().toISOString() }; }
  catch (error) {
    return { status: error instanceof MissingConfiguration ? 'missing' : 'error', data: null, message: error instanceof MissingConfiguration ? error.message : 'Sem dados: confira as credenciais e permissões do provedor. Uma nova tentativa ocorre após o cache de 1 hora.', checkedAt: new Date().toISOString() };
  }
}
/** Next Data Cache is shared across serverless instances; failed responses are cached too. */
function cached<T>(key: string, read: () => Promise<T>): Promise<Source<T>> {
  const config = createHash('sha256').update([process.env.GOOGLE_PLAY_SA_JSON, process.env.GOOGLE_PLAY_REPORTS_BUCKET, process.env.ASC_KEY_ID, process.env.ASC_ISSUER_ID, process.env.ASC_PRIVATE_KEY].join('|')).digest('hex');
  return unstable_cache(() => source(read), ['morvelio-v1', key, config], { revalidate: 3600 })();
}
async function archive(play: Source<Review[]>, apple: Source<Review[]>): Promise<string> {
  if (!bancoConfigurado()) return 'Histórico local à coleta. Configure o banco para guardar avaliações entre semanas.';
  try {
    const reviews = [...(play.data ?? []), ...(apple.data ?? [])];
    if (reviews.length) await consultar(`INSERT INTO morvelio_reviews (store, id, payload, review_at)
      SELECT x->>'store', x->>'id', x, (x->>'date')::timestamptz FROM jsonb_array_elements($1::jsonb) x
      ON CONFLICT (store, id) DO UPDATE SET payload = EXCLUDED.payload, review_at = EXCLUDED.review_at`, [JSON.stringify(reviews)]);
    const rows = await consultar<{ payload: Review }>(`SELECT payload FROM morvelio_reviews WHERE review_at >= now() - interval '15 days' ORDER BY review_at DESC`);
    for (const [store, data] of [['play', play], ['apple', apple]] as const) {
      if (data.status === 'ok') data.data = [...new Map([...rows.map((r) => r.payload).filter((r) => r.store === store), ...(data.data ?? [])].map((r) => [r.id, r])).values()].sort((a, b) => b.date.localeCompare(a.date));
    }
    return 'Histórico de avaliações coletadas salvo. A comparação fica disponível quando há amostras nas duas semanas.';
  } catch { return 'Histórico indisponível: confira DATABASE_URL e aplique a migration 009. As coletas atuais continuam visíveis.'; }
}
export async function getDashboard(): Promise<Dashboard> {
  const [crash, anr, devices, play, apple, installs, unity] = await Promise.all([
    cached('crash', () => readRate('crash')), cached('anr', () => readRate('anr')), cached('devices', readDevices),
    cached('play', readPlayReviews), cached('apple', readAppleReviews), cached('installs', readInstalls), source(readUnity),
  ]);
  const history = await archive(play, apple);
  return { demo: false, crash, anr, devices, play, apple, installs, unity, history };
}
