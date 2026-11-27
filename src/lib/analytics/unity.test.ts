import { gzipSync } from 'node:zlib';
import { afterEach, describe, expect, it, vi } from 'vitest';
const db = vi.hoisted(() => ({ query: vi.fn(), configured: true }));
vi.mock('@/lib/admin/banco', () => ({ bancoConfigurado: () => db.configured, consultar: db.query }));
import { aggregate, cohort, journey, listPlayers, QUEST_TITLES, readUnity, summarize, syncUnity, type AccountRow } from './unity';
import { MissingConfiguration } from './providers';
import { demoDashboard } from './demo';
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); db.configured = true; });

const packed = (json: unknown) => ({ data: gzipSync(Buffer.from(JSON.stringify(json))).toString('base64') });
const quests = (...status: number[]) => ({ campaignQuests: { quests: status.map((s, i) => ({ questId: `J0${i + 1}`, status: s })) } });
function ugs() { vi.stubEnv('UGS_PROJECT_ID', 'proj'); vi.stubEnv('UGS_ENVIRONMENT_ID', 'env'); vi.stubEnv('UGS_SERVICE_ACCOUNT_KEY_ID', 'key'); vi.stubEnv('UGS_SERVICE_ACCOUNT_SECRET', 'secret'); }
const DAY = 86400;

describe('resumo por conta (porte do funil_saves.py)', () => {
  it('lê gzip+base64, escolhe o aventureiro mais adiantado e o maior número de partidas do Cerco', () => {
    const s = summarize({
      morvelio_save_v1_account: packed({ gold: 350, gems: { balance: 40 }, royaleMatches: 3 }),
      morvelio_save_v1_slot0: packed(quests(4, 2)),
      morvelio_save_v1_slot1: packed(quests(4, 4, 4, 1)),
      morvelio_save_v1_slot2: packed({ occupied: false, ...quests(4, 4, 4, 4, 4) }),
      morvelio_save_v1_slot3: { data: 'não é gzip' },
      morvelio_royale_v1: { matches: 7 },
    });
    expect(s).toEqual({ cloudSave: true, adventurers: 2, claimed: 3, stoppedAt: 'J04', cercoMatches: 7, gold: 350, gems: 40 });
  });
  it('só quests J contam: opcional aberta não prende; tudo concluído vai para a próxima J ou FIM', () => {
    const q = (questId: string, status: number) => ({ questId, status });
    expect(journey({ campaignQuests: { quests: [q('J01', 4), q('O01', 2), q('J02', 4)] } })).toEqual([2, 'J03']);
    expect(journey({ campaignQuests: { quests: [q('O01', 2), q('J10', 4), q('J09', 2)] } })).toEqual([1, 'J09']);
    expect(journey({ campaignQuests: { quests: [q('J66', 4), q('J67', 4), q('O17', 1)] } })).toEqual([2, 'FIM']);
    expect(journey({})).toEqual([0, 'J01']);
  });
  it('conta sem save fica sem aventureiro', () => {
    expect(summarize({ morvelio_save_v1_slot0: packed(quests(4, 4)) }).stoppedAt).toBe('J03');
    expect(summarize({})).toEqual({ cloudSave: false, adventurers: 0, claimed: 0, stoppedAt: null, cercoMatches: 0, gold: null, gems: null });
  });
});

describe('agregados', () => {
  const now = 1_800_000_000;
  const row = (createdDaysAgo: number, stayDays: number, summary: AccountRow['summary'], linked = true): AccountRow => ({ createdAt: now - createdDaysAgo * DAY, lastLoginAt: now - createdDaysAgo * DAY + stayDays * DAY, linked, summary });
  const save = (stoppedAt: string, claimed: number, cercoMatches = 0) => ({ cloudSave: true, adventurers: 1, claimed, stoppedAt, cercoMatches, gold: 100 * claimed, gems: 10 });
  it('calcula vínculo, volta aproximada, ativos, Cerco, economia e onde a campanha parou com título PT', () => {
    const rows = [row(10, 0, null, false), row(10, 2, save('J02', 1)), row(10, 8, save('J02', 1, 5)), row(9, 9, save('J01', 0, 2)), row(20, 1, save('FIM', 63, 9))];
    const c = cohort(rows, now);
    expect(c).toMatchObject({ accounts: 5, linked: 4, guests: 1, withSave: 4, unread: 1, returned: { d1: 4, d3: 2, d7: 2 }, active3: 2, cerco: 3, cercoMedian: 5, onlyCerco: 1, economyAccounts: 4, gemsMedian: 10 });
    expect(c.stops.map((s) => [s.quest, s.accounts, s.cumulative])).toEqual([['J01', 1, 0.25], ['J02', 2, 0.75], ['FIM', 1, 1]]);
    expect(c.stops[0]!.title).toBe(QUEST_TITLES.J01);
    expect(QUEST_TITLES.J01).toBeTruthy();
  });
  it('recorta as contas dos últimos 7 dias e preenche 30 dias de contas novas', () => {
    const snap = aggregate([row(1, 0, null), row(2, 0, null), row(30, 0, null)], now, { read: 0, failed: 0, pending: 0 });
    expect(snap.all.accounts).toBe(3); expect(snap.recent.accounts).toBe(2);
    expect(snap.newPerDay).toHaveLength(30); expect(snap.newPerDay.reduce((a, d) => a + d.value, 0)).toBe(2);
  });
  it('o exemplo usa o mesmo agregador', () => { expect(demoDashboard().unity.data?.all.accounts).toBe(840); });
});

describe('API Admin do Unity simulada', () => {
  it('pagina a lista de contas com Basic auth da service account', async () => {
    ugs();
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ results: [{ id: 'a' }], next: 'p2' })).mockResolvedValueOnce(Response.json({ results: [{ id: 'b' }] }));
    vi.stubGlobal('fetch', fetchMock);
    expect((await listPlayers()).map((p) => p.id)).toEqual(['a', 'b']);
    expect(fetchMock.mock.calls[0]![0]).toBe('https://services.api.unity.com/player-identity/v1/projects/proj/users?limit=1000');
    expect(fetchMock.mock.calls[1]![0]).toContain('&page=p2');
    expect(fetchMock.mock.calls[0]![1].headers.Authorization).toBe(`Basic ${Buffer.from('key:secret').toString('base64')}`);
  });
  it('sem variáveis do Unity não chama a API', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    await expect(listPlayers()).rejects.toBeInstanceOf(MissingConfiguration);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('relê só o que mudou, para no 429, apaga contas excluídas e grava snapshot sem ids', async () => {
    ugs();
    const now = 1_800_000_000;
    const players = [
      { id: 'player-novo', createdAt: String(now - 2 * DAY), lastLoginAt: String(now - DAY), externalIds: [{ providerId: 'google' }] },
      { id: 'player-parado', createdAt: String(now - 20 * DAY), lastLoginAt: String(now - 10 * DAY), externalIds: [] },
      { id: 'player-limite', createdAt: String(now - 3 * DAY), lastLoginAt: String(now - 3 * DAY) },
    ];
    const { createHash } = await import('node:crypto');
    const h = (id: string) => createHash('sha256').update(`morvelio:${id}`).digest('hex');
    db.query.mockImplementation(async (sql: string) => {
      if (sql.startsWith('SELECT hash')) return [{ hash: h('player-parado'), read_login_at: String(now - 10 * DAY), read_at: String(now - 9 * DAY) }];
      if (sql.startsWith('SELECT created_at')) return [{ created_at: now - 2 * DAY, last_login_at: now - DAY, linked: true, summary: summarize({ morvelio_save_v1_slot0: packed(quests(4, 1)) }) }, { created_at: now - 20 * DAY, last_login_at: now - 10 * DAY, linked: false, summary: null }];
      return [];
    });
    const read: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/player-identity/')) return Response.json({ results: players });
      read.push(url);
      if (url.includes('player-limite')) return new Response('', { status: 429 });
      return Response.json({ results: [{ key: 'morvelio_save_v1_slot0', value: packed(quests(4, 1)) }], links: { next: null } });
    }));
    const result = await syncUnity(now * 1000);
    expect(read.some((u) => u.includes('player-parado'))).toBe(false);
    expect(read.find((u) => u.includes('player-novo'))).toContain('/environments/env/players/player-novo/protected/items?keys=morvelio_save_v1_account&keys=morvelio_save_v1_slot0');
    expect(result).toMatchObject({ total: 2, read: 1, failed: 1, due: 2 });
    const calls: Array<[string, string]> = db.query.mock.calls.map((c) => [c[0] as string, JSON.stringify(c[1] ?? [])]);
    expect(calls.find(([sql]) => sql.startsWith('DELETE'))![1]).toContain(h('player-limite'));
    const snapshot = calls.find(([sql]) => sql.includes('morvelio_unity_snapshots'))!;
    expect(snapshot[1]).not.toMatch(/player-/);
    for (const [, params] of calls) expect(params).not.toMatch(/player-/); // nenhum id chega ao banco
    expect(JSON.parse(JSON.parse(snapshot[1])[1])).toMatchObject({ pending: 1, all: { accounts: 2 } });
  });
  it('se nenhum save do lote for lido, não grava nada e diz o que conferir', async () => {
    ugs(); db.query.mockResolvedValue([]);
    vi.stubGlobal('fetch', vi.fn(async (url: string) => url.includes('/player-identity/') ? Response.json({ results: [{ id: 'player-a', createdAt: '1800000000' }] }) : new Response('', { status: 404 })));
    await expect(syncUnity(1_800_000_000_000)).rejects.toThrow(/Cloud Save Viewer/);
    expect(db.query.mock.calls.some((c) => String(c[0]).startsWith('INSERT'))).toBe(false);
  });
  it('a página lê o último snapshot ou explica o que falta', async () => {
    db.configured = false;
    await expect(readUnity()).rejects.toThrow(/DATABASE_URL/);
    db.configured = true; db.query.mockResolvedValueOnce([]);
    await expect(readUnity()).rejects.toThrow(/UGS_PROJECT_ID/);
    ugs(); db.query.mockResolvedValueOnce([]);
    await expect(readUnity()).rejects.toThrow(/primeira coleta/);
    db.query.mockResolvedValueOnce([{ payload: { total: 3 } }]);
    expect(await readUnity()).toEqual({ total: 3 });
  });
});
