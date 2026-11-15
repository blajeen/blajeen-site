import { createSign } from 'node:crypto';
import { dateInZone, googleDate, shiftDate } from './dates';
import type { Daily, Installs, Review } from './types';

const PACKAGE = 'br.com.morvelio';
const REPORTING = `https://playdeveloperreporting.googleapis.com/v1beta1/apps/${PACKAGE}`;
export class MissingConfiguration extends Error {}
export async function request(url: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`API respondeu HTTP ${response.status}. Confira as permissões e a configuração.`);
  return response;
}
function jwt(header: object, payload: object, key: string, algorithm: string, p1363 = false): string {
  const body = [header, payload].map((part) => Buffer.from(JSON.stringify(part)).toString('base64url')).join('.');
  const signer = createSign(algorithm).update(body);
  return `${body}.${signer.sign({ key: key.replace(/\\n/g, '\n'), ...(p1363 ? { dsaEncoding: 'ieee-p1363' as const } : {}) }).toString('base64url')}`;
}
const tokens = new Map<string, { value: string; expires: number }>();
export async function googleToken(scope: string): Promise<string> {
  if (!process.env.GOOGLE_PLAY_SA_JSON) throw new MissingConfiguration('Configure GOOGLE_PLAY_SA_JSON no servidor.');
  const cached = tokens.get(scope);
  if (cached && cached.expires > Date.now()) return cached.value;
  const account = JSON.parse(Buffer.from(process.env.GOOGLE_PLAY_SA_JSON, 'base64').toString('utf8')) as { client_email: string; private_key: string };
  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt({ alg: 'RS256', typ: 'JWT' }, { iss: account.client_email, scope: `https://www.googleapis.com/auth/${scope}`, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }, account.private_key, 'RSA-SHA256');
  const response = await request('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }) });
  const result = await response.json() as { access_token: string; expires_in: number };
  if (!result.access_token) throw new Error('Token Google indisponível.');
  tokens.set(scope, { value: result.access_token, expires: Date.now() + (result.expires_in - 60) * 1000 });
  return result.access_token;
}
export function appleToken(): string {
  const { ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY } = process.env;
  if (!ASC_KEY_ID || !ASC_ISSUER_ID || !ASC_PRIVATE_KEY) throw new MissingConfiguration('Configure ASC_KEY_ID, ASC_ISSUER_ID e ASC_PRIVATE_KEY no servidor.');
  const now = Math.floor(Date.now() / 1000);
  return jwt({ alg: 'ES256', kid: ASC_KEY_ID, typ: 'JWT' }, { iss: ASC_ISSUER_ID, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' }, ASC_PRIVATE_KEY, 'SHA256', true);
}
type Row = { startTime?: { year: number; month: number; day: number }; metrics?: Array<{ metric: string; decimalValue?: { value: string } }>; dimensions?: Array<{ dimension: string; stringValue?: string; int64Value?: string; valueLabel?: string }> };
function metric(row: Row, name: string): number | null {
  const raw = row.metrics?.find((m) => m.metric === name)?.decimalValue?.value;
  const value = raw === undefined || !raw.trim() ? NaN : Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}
/** Discover freshness: Google rejects queries whose exclusive end exceeds latestEndTime. */
async function queryMetrics(set: string, metrics: string[], dimensions: string[] = [], filter?: string): Promise<Row[]> {
  const token = await googleToken('playdeveloperreporting');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const meta = await (await request(`${REPORTING}/${set}`, { headers })).json() as { freshnessInfo?: { freshnesses?: Array<{ aggregationPeriod: string; latestEndTime?: { year: number; month: number; day: number } }> } };
  const latest = meta.freshnessInfo?.freshnesses?.find((f) => f.aggregationPeriod === 'DAILY')?.latestEndTime;
  if (!latest) return [];
  const today = dateInZone(new Date(), 'America/Los_Angeles');
  const latestDate = `${latest.year}-${String(latest.month).padStart(2, '0')}-${String(latest.day).padStart(2, '0')}`;
  const end = latestDate < today ? latestDate : today;
  const start = shiftDate(today, -30);
  if (end <= start) return [];
  const rows: Row[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 20; page++) {
    const result = await (await request(`${REPORTING}/${set}:query`, { method: 'POST', headers, body: JSON.stringify({ timelineSpec: { aggregationPeriod: 'DAILY', startTime: googleDate(start), endTime: googleDate(end) }, metrics, dimensions, pageSize: 10000, ...(filter ? { filter } : {}), ...(pageToken ? { pageToken } : {}) }) })).json() as { rows?: Row[]; nextPageToken?: string };
    rows.push(...(result.rows ?? []));
    pageToken = result.nextPageToken;
    if (!pageToken) return rows;
  }
  throw new Error('Resposta extensa demais; refine a consulta.');
}
export async function readRate(kind: 'crash' | 'anr'): Promise<Daily[]> {
  const name = kind === 'crash' ? 'userPerceivedCrashRate' : 'userPerceivedAnrRate';
  const rows = await queryMetrics(kind === 'crash' ? 'crashRateMetricSet' : 'anrRateMetricSet', [name]);
  return rows.flatMap((row) => {
    const value = metric(row, name);
    const d = row.startTime;
    // Reporting API defines these metrics as percentages, already in percentage points.
    return d && value !== null ? [{ date: `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`, value }] : [];
  }).sort((a, b) => a.date.localeCompare(b.date));
}
export async function readDevices() {
  const rows = await queryMetrics('errorCountMetricSet', ['errorReportCount'], ['deviceModel'], 'reportType = CRASH');
  const totals = new Map<string, number>();
  for (const row of rows) {
    const dimension = row.dimensions?.find((d) => d.dimension === 'deviceModel');
    const model = dimension?.valueLabel || dimension?.stringValue;
    const count = metric(row, 'errorReportCount');
    if (model && count !== null) totals.set(model, (totals.get(model) ?? 0) + count);
  }
  return [...totals].map(([model, crashes]) => ({ model, crashes })).sort((a, b) => b.crashes - a.crashes).slice(0, 5);
}
type PlayReview = { reviewId: string; comments?: Array<{ userComment?: { starRating: number; text?: string; lastModified?: { seconds: string }; appVersionName?: string; appVersionCode?: number; reviewerLanguage?: string } }> };
export function parsePlayReviews(reviews: PlayReview[]): Review[] {
  return reviews.flatMap((r) => {
    const c = r.comments?.find((comment) => comment.userComment)?.userComment;
    const date = new Date(Number(c?.lastModified?.seconds) * 1000);
    return c && c.starRating >= 1 && c.starRating <= 5 && !Number.isNaN(date.getTime()) ? [{ id: r.reviewId, store: 'play' as const, rating: c.starRating, text: c.text ?? '', date: date.toISOString(), version: c.appVersionName ?? (c.appVersionCode ? String(c.appVersionCode) : null), language: c.reviewerLanguage ?? null }] : [];
  });
}
export async function readPlayReviews(): Promise<Review[]> {
  const token = await googleToken('androidpublisher');
  const all: Review[] = [];
  let pageToken = '';
  for (let page = 0; page < 20; page++) {
    const params = new URLSearchParams({ maxResults: '100', ...(pageToken ? { token: pageToken } : {}) });
    const result = await (await request(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}/reviews?${params}`, { headers: { Authorization: `Bearer ${token}` } })).json() as { reviews?: PlayReview[]; tokenPagination?: { nextPageToken?: string } };
    all.push(...parsePlayReviews(result.reviews ?? []));
    pageToken = result.tokenPagination?.nextPageToken ?? '';
    if (!pageToken) return all;
  }
  throw new Error('Mais de 2.000 avaliações recentes. A coleta não foi concluída.');
}
type AppleReview = { id: string; attributes: { rating: number; title?: string; body?: string; createdDate: string; territory?: string } };
export function parseAppleReviews(data: AppleReview[]): Review[] {
  return data.flatMap(({ id, attributes: a }) => a.rating >= 1 && a.rating <= 5 && Number.isFinite(Date.parse(a.createdDate)) ? [{ id, store: 'apple' as const, rating: a.rating, text: [a.title, a.body].filter(Boolean).join('\n'), date: new Date(a.createdDate).toISOString(), version: null, language: null }] : []);
}
export async function readAppleReviews(): Promise<Review[]> {
  const token = appleToken();
  const all: Review[] = [];
  let next: string | undefined = 'https://api.appstoreconnect.apple.com/v1/apps/6809216107/customerReviews?sort=-createdDate&limit=200';
  const cutoff = shiftDate(dateInZone(), -14);
  for (let page = 0; page < 20 && next; page++) {
    const url = new URL(next);
    if (url.origin !== 'https://api.appstoreconnect.apple.com' || !url.pathname.startsWith('/v1/')) throw new Error('Paginação Apple inválida.');
    const result = await (await request(url.href, { headers: { Authorization: `Bearer ${token}` } })).json() as { data?: AppleReview[]; links?: { next?: string } };
    const reviews = parseAppleReviews(result.data ?? []);
    all.push(...reviews);
    next = result.links?.next;
    if (!next || reviews.some((r) => r.date.slice(0, 10) < cutoff)) return all;
  }
  if (next) throw new Error('Coleta de avaliações Apple não concluída.');
  return all;
}
/** RFC 4180, including quoted commas, newlines and escaped quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (!quoted && (c === ',' || c === '\n')) { row.push(field.replace(/\r$/, '')); field = ''; if (c === '\n') { rows.push(row); row = []; } }
    else field += c;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows;
}
export function parseInstalls(texts: string[], today = dateInZone()): Installs {
  const totals = new Map<string, number>(); const byVersion = new Map<string, Map<string, number>>();
  for (const text of texts) {
    const [headers, ...rows] = parseCsv(text.replace(/^\uFEFF/, ''));
    if (!headers) continue;
    const index = (name: string) => headers.indexOf(name);
    if (['Date', 'Package Name', 'Daily Device Installs', 'Current Device Installs', 'App Version Code'].some((name) => index(name) < 0)) throw new Error('Formato do relatório de instalações desconhecido.');
    for (const row of rows) {
      const date = row[index('Date')];
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date >= today || date < shiftDate(today, -30) || row[index('Package Name')] !== PACKAGE) continue;
      if (!row[index('Daily Device Installs')]?.trim() || !row[index('Current Device Installs')]?.trim()) continue;
      const daily = Number(row[index('Daily Device Installs')]); const current = Number(row[index('Current Device Installs')]);
      if (!Number.isFinite(daily) || !Number.isFinite(current) || daily < 0 || current < 0) continue;
      totals.set(date, (totals.get(date) ?? 0) + daily);
      const versions = byVersion.get(date) ?? new Map<string, number>();
      const version = row[index('App Version Code')] || 'Não informado';
      versions.set(version, (versions.get(version) ?? 0) + current); byVersion.set(date, versions);
    }
  }
  const versionDate = [...byVersion.keys()].sort().at(-1) ?? null;
  return { daily: [...totals].map(([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date)), versions: [...(versionDate ? byVersion.get(versionDate)! : [])].map(([version, installs]) => ({ version, installs })).sort((a, b) => b.installs - a.installs), versionDate };
}
export async function readInstalls(): Promise<Installs> {
  const bucket = process.env.GOOGLE_PLAY_REPORTS_BUCKET?.trim();
  if (!bucket) throw new MissingConfiguration('Configure GOOGLE_PLAY_REPORTS_BUCKET para ler instalações e versões.');
  if (!/^pubsite_prod_[a-zA-Z0-9_]+$/.test(bucket)) throw new Error('Nome do bucket de relatórios inválido.');
  const token = await googleToken('devstorage.read_only');
  const today = dateInZone();
  const months = [...new Set([today, shiftDate(today, -30)].map((date) => date.slice(0, 7).replace('-', '')))];
  const texts = await Promise.all(months.map(async (month) => {
    const object = `stats/installs/installs_${PACKAGE}_${month}_app_version.csv`;
    const response = await fetch(`https://storage.googleapis.com/storage/v1/b/${bucket}/o/${encodeURIComponent(object)}?alt=media`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    if (response.status === 404) return '';
    if (!response.ok) throw new Error(`Relatório de instalações indisponível (HTTP ${response.status}).`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    return new TextDecoder(bytes[0] === 0xff && bytes[1] === 0xfe ? 'utf-16le' : 'utf-8').decode(bytes);
  }));
  return parseInstalls(texts, today);
}
