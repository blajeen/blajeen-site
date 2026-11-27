import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { bancoConfigurado, consultar } from '@/lib/admin/banco';
import { dateInZone, shiftDate } from './dates';
import { MissingConfiguration } from './providers';
import titles from './quest-titles.json';
import type { Daily } from './types';

// Porte de C:\dev\morvelio\Tools\telemetria\funil_saves.py: mesmas chaves, mesmo resumo por conta, mesmas contas.
export const SAVE_KEYS = ['morvelio_save_v1_account', ...Array.from({ length: 11 }, (_, i) => `morvelio_save_v1_slot${i}`)];
export const ROYALE_KEY = 'morvelio_royale_v1';
const STATUS_CLAIMED = 4; // campaignQuests.quests[].status: 1 Available, 2 Active, 3 ReadyToTurnIn, 4 Claimed
const API = 'https://services.api.unity.com';
const DAY = 86400;
/** Cloud Save Admin aceita 1000 requisições por 30 minutos; sobra margem para o funil_saves.py e novas tentativas. */
export const MAX_READS = 900;
const WORKERS = 8;
const DEADLINE_MS = 200_000; // a rota tem 300 s; o resto fica para gravar no banco
export const QUEST_TITLES: Record<string, string> = titles;

export type UnityPlayer = { id: string; createdAt?: string | number; lastLoginAt?: string | number; externalIds?: Array<{ providerId?: string }> | null };
export type AccountSummary = { cloudSave: boolean; adventurers: number; claimed: number; stoppedAt: string | null; cercoMatches: number; gold: number | null; gems: number | null };
/** Uma conta sem id: datas em segundos; summary nulo enquanto o save não foi lido. */
export type AccountRow = { createdAt: number; lastLoginAt: number; linked: boolean; summary: AccountSummary | null };
export type Stop = { quest: string | null; title: string; accounts: number; cumulative: number };
export type Cohort = {
  accounts: number; linked: number; guests: number; withSave: number; unread: number;
  returned: { d1: number; d3: number; d7: number }; active3: number;
  cerco: number; cercoMedian: number; onlyCerco: number;
  stops: Stop[]; economyAccounts: number; goldMedian: number | null; gemsMedian: number | null;
};
export type UnitySnapshot = { takenAt: string; total: number; read: number; pending: number; failed: number; newPerDay: Daily[]; all: Cohort; recent: Cohort };
type Json = Record<string, unknown>;

export function seconds(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0;
  const n = Number(value);
  if (Number.isFinite(n)) return n > 1e12 ? Math.floor(n / 1000) : n;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : 0;
}
export function decode(value: unknown): Json | null {
  try { return JSON.parse(gunzipSync(Buffer.from(String((value as Json).data), 'base64')).toString('utf8')) as Json; }
  catch { return null; }
}
function journey(slot: Json): [number, string | null] {
  const quests = ((slot.campaignQuests as Json | undefined)?.quests as Json[] | undefined) ?? [];
  const claimed = quests.filter((q) => q.status === STATUS_CLAIMED).length;
  const current = quests.find((q) => q.status !== STATUS_CLAIMED);
  return [claimed, current ? String(current.questId ?? '') || null : null];
}
const int = (v: unknown) => Math.trunc(Number(v) || 0);
export function summarize(stored: Record<string, unknown>): AccountSummary {
  const account = stored[SAVE_KEYS[0]!] !== undefined ? decode(stored[SAVE_KEYS[0]!]) : null;
  const slots = SAVE_KEYS.slice(1).filter((k) => k in stored).map((k) => decode(stored[k])).filter((s): s is Json => !!s && s.occupied !== false);
  let best: [number, string | null] | null = null;
  for (const slot of slots) { const j = journey(slot); if (!best || j[0] > best[0]) best = j; } // o primeiro mais adiantado, como max() do Python
  const royale = (stored[ROYALE_KEY] as Json | undefined) ?? {};
  const gems = (account?.gems as Json | undefined)?.balance;
  return {
    cloudSave: account !== null || slots.length > 0,
    adventurers: slots.length,
    claimed: best ? best[0] : 0,
    stoppedAt: best ? best[1] ?? 'FIM' : null,
    cercoMatches: Math.max(int(account?.royaleMatches), int(royale.matches)),
    gold: account && account.gold !== undefined ? int(account.gold) : null,
    gems: account && gems !== undefined ? int(gems) : null,
  };
}

const median = (values: number[]) => { const s = [...values].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)]! : null; }; // mediana superior, igual ao script
const order = (q: string | null) => (q === null ? 2e9 : q === 'FIM' ? 1e9 : /^\D\d+$/.test(q) ? Number(q.slice(1)) : 999);
export function cohort(rows: AccountRow[], now: number): Cohort {
  const read = rows.filter((r) => r.summary).map((r) => ({ ...r, s: r.summary! }));
  const saved = read.filter((r) => r.s.cloudSave);
  const cerco = read.filter((r) => r.s.cercoMatches > 0);
  const stay = (d: number) => rows.filter((r) => r.lastLoginAt - r.createdAt >= d * DAY).length;
  const counts = new Map<string | null, number>();
  for (const r of saved) counts.set(r.s.stoppedAt, (counts.get(r.s.stoppedAt) ?? 0) + 1);
  let acc = 0;
  const stops = [...counts].sort(([a], [b]) => order(a) - order(b) || String(a).localeCompare(String(b))).map(([quest, accounts]) => {
    acc += accounts;
    return { quest, title: quest === null ? 'sem aventureiro' : quest === 'FIM' ? 'fim da jornada' : QUEST_TITLES[quest] ?? '', accounts, cumulative: acc / saved.length };
  });
  const economy = read.filter((r) => r.s.gold !== null || r.s.gems !== null);
  return {
    accounts: rows.length, linked: rows.filter((r) => r.linked).length, guests: rows.filter((r) => !r.linked).length,
    withSave: saved.length, unread: rows.length - read.length,
    returned: { d1: stay(1), d3: stay(3), d7: stay(7) },
    active3: rows.filter((r) => now - r.lastLoginAt <= 3 * DAY).length,
    cerco: cerco.length, cercoMedian: median(cerco.map((r) => r.s.cercoMatches)) ?? 0,
    onlyCerco: cerco.filter((r) => r.s.claimed === 0).length,
    stops, economyAccounts: economy.length,
    goldMedian: median(economy.flatMap((r) => (r.s.gold === null ? [] : [r.s.gold]))),
    gemsMedian: median(economy.flatMap((r) => (r.s.gems === null ? [] : [r.s.gems]))),
  };
}
export function aggregate(rows: AccountRow[], now: number, run: { read: number; failed: number; pending: number }): UnitySnapshot {
  const today = dateInZone(new Date(now * 1000));
  const perDay = new Map<string, number>();
  for (const r of rows) { const d = dateInZone(new Date(r.createdAt * 1000)); perDay.set(d, (perDay.get(d) ?? 0) + 1); }
  return {
    takenAt: new Date(now * 1000).toISOString(), total: rows.length, ...run,
    newPerDay: Array.from({ length: 30 }, (_, i) => { const date = shiftDate(today, i - 29); return { date, value: perDay.get(date) ?? 0 }; }),
    all: cohort(rows, now), recent: cohort(rows.filter((r) => now - r.createdAt <= 7 * DAY), now),
  };
}

class RateLimited extends Error {}
function config() {
  const project = process.env.UGS_PROJECT_ID?.trim(); const environment = process.env.UGS_ENVIRONMENT_ID?.trim();
  const key = process.env.UGS_SERVICE_ACCOUNT_KEY_ID?.trim(); const secret = process.env.UGS_SERVICE_ACCOUNT_SECRET?.trim();
  if (!project || !environment || !key || !secret) throw new MissingConfiguration('Configure UGS_PROJECT_ID, UGS_ENVIRONMENT_ID, UGS_SERVICE_ACCOUNT_KEY_ID e UGS_SERVICE_ACCOUNT_SECRET.');
  return { project, environment, auth: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}` };
}
async function get(url: string, auth: string): Promise<Json> {
  const response = await fetch(url, { headers: { Authorization: auth }, cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  if (response.status === 429) throw new RateLimited('Limite do Unity atingido.');
  if (!response.ok) throw new Error(`Unity respondeu HTTP ${response.status}.`);
  return await response.json() as Json;
}
export async function listPlayers(): Promise<UnityPlayer[]> {
  const { project, auth } = config();
  const out: UnityPlayer[] = [];
  let page: string | undefined;
  do {
    const data = await get(`${API}/player-identity/v1/projects/${project}/users?limit=1000${page ? `&page=${encodeURIComponent(page)}` : ''}`, auth);
    const results = (data.results as UnityPlayer[] | undefined) ?? [];
    out.push(...results);
    page = results.length && typeof data.next === 'string' && data.next ? data.next : undefined;
  } while (page);
  return out;
}
export async function readItems(playerId: string): Promise<Record<string, unknown>> {
  const { project, environment, auth } = config();
  const items: Record<string, unknown> = {};
  let url: string | undefined = `${API}/cloud-save/v1/data/projects/${project}/environments/${environment}/players/${encodeURIComponent(playerId)}/protected/items?${[...SAVE_KEYS, ROYALE_KEY].map((k) => `keys=${k}`).join('&')}`;
  while (url) {
    const data = await get(url, auth);
    for (const item of (data.results as Array<{ key: string; value: unknown }> | undefined) ?? []) items[item.key] = item.value;
    const next = (data.links as Json | undefined)?.next;
    url = typeof next === 'string' && next ? new URL(next, API).toString() : undefined;
  }
  return items;
}

const hash = (id: string) => createHash('sha256').update(`morvelio:${id}`).digest('hex');
/**
 * Passo diário: lista as contas, relê só os saves que podem ter mudado (conta nova, login novo ou ativa no dia da última
 * leitura), guarda um resumo anônimo por conta (hash do id, nunca o id) e grava o snapshot agregado que a página lê.
 */
export async function syncUnity(nowMs = Date.now()) {
  config();
  if (!bancoConfigurado()) throw new MissingConfiguration('Configure DATABASE_URL e aplique a migration 010.');
  const now = Math.floor(nowMs / 1000);
  const players = await listPlayers();
  const known = new Map((await consultar<{ hash: string; read_login_at: unknown; read_at: unknown }>('SELECT hash, read_login_at, read_at FROM morvelio_unity_accounts')).map((r) => [r.hash, { last: Number(r.read_login_at), read: r.read_at === null ? null : Number(r.read_at) }]));
  const listed = players.map((p) => ({ p, hash: hash(p.id), created: seconds(p.createdAt), last: seconds(p.lastLoginAt) || seconds(p.createdAt), linked: !!p.externalIds?.length }));
  const due = listed.filter((a) => { const k = known.get(a.hash); return !k || k.read === null || k.last !== a.last || a.last > k.read - DAY; })
    .sort((a, b) => Number(known.get(a.hash)?.read != null) - Number(known.get(b.hash)?.read != null));
  const batch = due.slice(0, MAX_READS);
  const summaries = new Map<string, AccountSummary>();
  let failed = 0; let stopped = false; let next = 0;
  const started = Date.now();
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    while (!stopped && next < batch.length && Date.now() - started < DEADLINE_MS) {
      const a = batch[next++]!;
      try { summaries.set(a.hash, summarize(await readItems(a.p.id))); }
      catch (error) { failed++; if (error instanceof RateLimited) stopped = true; } // uma conta com falha nunca derruba a coleta
    }
  }));
  const payload = listed.map((a) => ({ hash: a.hash, created: a.created, last: a.last, linked: a.linked, summary: summaries.get(a.hash) ?? null, read: summaries.has(a.hash) ? now : null, readLogin: summaries.has(a.hash) ? a.last : null }));
  await consultar(`INSERT INTO morvelio_unity_accounts (hash, created_at, last_login_at, linked, summary, read_at, read_login_at)
    SELECT x->>'hash', (x->>'created')::bigint, (x->>'last')::bigint, (x->>'linked')::boolean, NULLIF(x->'summary', 'null'::jsonb), (x->>'read')::bigint, (x->>'readLogin')::bigint
    FROM jsonb_array_elements($1::jsonb) x
    ON CONFLICT (hash) DO UPDATE SET created_at = EXCLUDED.created_at, last_login_at = EXCLUDED.last_login_at, linked = EXCLUDED.linked,
      summary = COALESCE(EXCLUDED.summary, morvelio_unity_accounts.summary), read_at = COALESCE(EXCLUDED.read_at, morvelio_unity_accounts.read_at),
      read_login_at = COALESCE(EXCLUDED.read_login_at, morvelio_unity_accounts.read_login_at)`, [JSON.stringify(payload)]);
  // Conta excluída no Unity some daqui também.
  await consultar('DELETE FROM morvelio_unity_accounts WHERE NOT (hash = ANY($1::text[]))', [listed.map((a) => a.hash)]);
  const rows = (await consultar<{ created_at: unknown; last_login_at: unknown; linked: boolean; summary: AccountSummary | null }>('SELECT created_at, last_login_at, linked, summary FROM morvelio_unity_accounts'))
    .map((r) => ({ createdAt: Number(r.created_at), lastLoginAt: Number(r.last_login_at), linked: r.linked, summary: r.summary }));
  const snapshot = aggregate(rows, now, { read: summaries.size, failed, pending: due.length - summaries.size });
  await consultar('INSERT INTO morvelio_unity_snapshots (taken_at, payload) VALUES ($1, $2::jsonb)', [snapshot.takenAt, JSON.stringify(snapshot)]);
  return { total: snapshot.total, read: snapshot.read, failed, pending: snapshot.pending, due: due.length };
}

export async function readUnity(): Promise<UnitySnapshot> {
  if (!bancoConfigurado()) throw new MissingConfiguration('Configure DATABASE_URL e aplique a migration 010 para guardar a telemetria dos saves.');
  const rows = await consultar<{ payload: UnitySnapshot }>('SELECT payload FROM morvelio_unity_snapshots ORDER BY taken_at DESC LIMIT 1');
  if (rows[0]) return rows[0].payload;
  config();
  throw new MissingConfiguration('Aguardando a primeira coleta diária dos saves (07:30 Brasília).');
}
