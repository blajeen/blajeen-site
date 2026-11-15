import { generateKeyPairSync } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { demoDashboard } from './demo';
import { dailySummary, weekly } from './summary';
import { buildDailyEmail } from './email';
import { parseAppleReviews, parseCsv, parseInstalls, parsePlayReviews, readAppleReviews, readInstalls, readPlayReviews, readRate } from './providers';
import { source } from './dashboard';
import { MissingConfiguration } from './providers';
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn }));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });
function google() {
  const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
  vi.stubEnv('GOOGLE_PLAY_SA_JSON', Buffer.from(JSON.stringify({ client_email: 'test@example.invalid', private_key: pair.privateKey.export({ type: 'pkcs8', format: 'pem' }) })).toString('base64'));
}
describe('leitura das APIs com respostas simuladas', () => {
  it('respeita freshness, timezone, paginação e valores percentuais sem multiplicar', async () => {
    google(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-14T11:00:00Z'));
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ access_token: 'test', expires_in: 3600 }))
      .mockResolvedValueOnce(Response.json({ freshnessInfo: { freshnesses: [{ aggregationPeriod: 'DAILY', latestEndTime: { year: 2026, month: 11, day: 12 } }] } }))
      .mockResolvedValueOnce(Response.json({ rows: [{ startTime: { year: 2026, month: 11, day: 10 }, metrics: [{ metric: 'userPerceivedCrashRate', decimalValue: { value: '1.12' } }] }], nextPageToken: 'page2' }))
      .mockResolvedValueOnce(Response.json({ rows: [{ startTime: { year: 2026, month: 11, day: 11 }, metrics: [{ metric: 'userPerceivedCrashRate', decimalValue: { value: '0' } }] }] }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await readRate('crash')).toEqual([{ date: '2026-11-10', value: 1.12 }, { date: '2026-11-11', value: 0 }]);
    const body = JSON.parse(fetchMock.mock.calls[2]![1].body);
    expect(body.timelineSpec.endTime).toEqual({ year: 2026, month: 11, day: 12, timeZone: { id: 'America/Los_Angeles' } });
    expect(JSON.parse(fetchMock.mock.calls[3]![1].body).pageToken).toBe('page2');
  });
  it('pagina avaliações Play e ignora respostas do desenvolvedor', async () => {
    google();
    const review = (id: string) => ({ reviewId: id, comments: [{ developerComment: { text: 'Resposta' } }, { userComment: { starRating: 2, text: 'Travou', lastModified: { seconds: '1794567600' }, appVersionName: '1.3.6', reviewerLanguage: 'pt' } }] });
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ access_token: 'test', expires_in: 3600 }))
      .mockResolvedValueOnce(Response.json({ reviews: [review('a')], tokenPagination: { nextPageToken: 'next' } }))
      .mockResolvedValueOnce(Response.json({ reviews: [review('b')] }));
    vi.stubGlobal('fetch', fetchMock);
    const reviews = await readPlayReviews();
    expect(reviews.map((r) => r.id)).toEqual(['a', 'b']); expect(reviews[0]).toMatchObject({ rating: 2, text: 'Travou', version: '1.3.6', language: 'pt' });
    expect(fetchMock.mock.calls.at(-1)![0]).toContain('token=next');
  });
  it('pagina Apple sem inferir idioma ou versão a partir do território', async () => {
    const pair = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    vi.stubEnv('ASC_KEY_ID', 'test'); vi.stubEnv('ASC_ISSUER_ID', 'issuer');
    vi.stubEnv('ASC_PRIVATE_KEY', String(pair.privateKey.export({ type: 'pkcs8', format: 'pem' })));
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ data: [{ id: '1', attributes: { rating: 5, createdDate: '2026-11-13T20:00:00Z', body: 'Ótimo', territory: 'BRA' } }], links: { next: 'https://api.appstoreconnect.apple.com/v1/apps/6809216107/customerReviews?cursor=x' } }))
      .mockResolvedValueOnce(Response.json({ data: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const reviews = await readAppleReviews(); expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(reviews[0]).toMatchObject({ language: null, version: null, text: 'Ótimo' });
  });
  it('separa fonte sem configuração de falha, sem vazar o segredo da exceção', async () => {
    expect(await source(() => Promise.reject(new MissingConfiguration('Configure a chave')))).toMatchObject({ status: 'missing', data: null });
    expect(JSON.stringify(await source(() => Promise.reject(new Error('secret-token'))))).not.toContain('secret-token');
    vi.stubEnv('GOOGLE_PLAY_SA_JSON', ''); vi.stubEnv('ASC_KEY_ID', '');
    const results = await Promise.all([source(() => readRate('crash')), source(readAppleReviews), source(async () => [1])]);
    expect(results.map((r) => r.status)).toEqual(['missing', 'missing', 'ok']);
  });
  it('lê UTF-16 com BOM e soma instalações por versão sem duplicar a distribuição diária', async () => {
    google(); vi.stubEnv('GOOGLE_PLAY_REPORTS_BUCKET', 'pubsite_prod_rev_test');
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-14T11:00:00Z'));
    const csv = 'Date,Package Name,App Version Code,Daily Device Installs,Current Device Installs\n2026-11-12,br.com.morvelio,136,10,80\n2026-11-12,br.com.morvelio,135,2,20\n2026-11-13,br.com.morvelio,136,11,90\n';
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ access_token: 'test', expires_in: 3600 }))
      .mockResolvedValueOnce(new Response(Buffer.from(`\uFEFF${csv}`, 'utf16le'))).mockResolvedValueOnce(new Response('', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    const data = await readInstalls();
    expect(data.daily).toEqual([{ date: '2026-11-12', value: 12 }, { date: '2026-11-13', value: 11 }]);
    expect(data.versions).toEqual([{ version: '136', installs: 90 }]);
  });
  it('trata CSV com aspas, vírgulas e quebras e não aceita cabeçalho incompatível', () => {
    expect(parseCsv('a,b\n"x,y","z""w\nq"\n')).toEqual([['a', 'b'], ['x,y', 'z"w\nq']]);
    expect(() => parseInstalls(['Date,Foo\n2026-11-01,1'])).toThrow();
    expect(parsePlayReviews([{ reviewId: 'bad', comments: [] }])).toEqual([]);
    expect(parseAppleReviews([{ id: 'bad', attributes: { rating: 9, createdDate: 'bad' } }])).toEqual([]);
  });
});
describe('resumo e alertas', () => {
  it('calcula semanas com datas de Brasília e média apenas da amostra', () => {
    const r = (date: string, rating: number) => ({ id: date, store: 'play' as const, rating, date, text: '', version: null, language: null });
    const stats = weekly([r('2026-11-14T01:00:00Z', 2), r('2026-11-14T04:00:00Z', 5), r('2026-11-02T15:00:00Z', 5)], '2026-11-14');
    expect(stats).toEqual({ count: 1, average: 2, previous: 5, drop: 3 });
  });
  it('alerta antes do limite Google e não usa dado atrasado como ontem', () => {
    const data = demoDashboard(); const day = dateInZoneForTest();
    data.crash.data = [{ date: '2026-01-01', value: 99 }]; data.anr.data = [];
    const s = dailySummary(data, day);
    expect(s.crash).toBeNull(); expect(s.anr).toBeNull(); expect(s.alerts).not.toContain('Travamentos acima de 1%.');
    data.crash.data = [{ date: s.yesterday, value: 1.01 }];
    expect(dailySummary(data, day).alerts).toContain('Travamentos acima de 1%.');
    data.crash.data[0]!.value = 1;
    expect(dailySummary(data, day).alerts).not.toContain('Travamentos acima de 1%.');
  });
  it('bloqueia envio de exemplos, escapa HTML e destaca avaliações ruins', () => {
    const data = demoDashboard(); expect(() => buildDailyEmail(data)).toThrow();
    data.demo = false; data.history = '<script>segredo</script>';
    const email = buildDailyEmail(data);
    expect(email.subject).toContain('ALERTA'); expect(email.html).toContain('color:#b42318');
    expect(email.html).toContain('&lt;script&gt;'); expect(email.html).not.toContain('<script>');
  });
});
function dateInZoneForTest() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date()); }
