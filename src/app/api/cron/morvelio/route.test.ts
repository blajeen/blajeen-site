import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ query: vi.fn(), dashboard: vi.fn() }));
vi.mock('@/lib/admin/banco', () => ({ bancoConfigurado: () => true, consultar: mocks.query }));
vi.mock('@/lib/analytics/dashboard', () => ({ getDashboard: mocks.dashboard }));
import { GET } from './route';
import { demoDashboard } from '@/lib/analytics/demo';
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe('cron Morvelio', () => {
  it('nega segredo ausente e inválido antes de consultar ou enviar', async () => {
    vi.stubEnv('CRON_SECRET', '');
    expect((await GET(new Request('https://example.test/api/cron/morvelio'))).status).toBe(401);
    vi.stubEnv('CRON_SECRET', 'secret');
    expect((await GET(new Request('https://example.test/api/cron/morvelio', { headers: { authorization: 'Bearer wrong' } }))).status).toBe(401);
    expect(mocks.query).not.toHaveBeenCalled();
  });
  it('não reenvia um dia já reservado', async () => {
    vi.stubEnv('CRON_SECRET', 'test'); vi.stubEnv('RESEND_API_KEY', 'key'); vi.stubEnv('ONBOARDING_EMAIL_FROM', 'test@example.test');
    mocks.query.mockResolvedValue([]);
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    const response = await GET(new Request('https://example.test/api/cron/morvelio', { headers: { authorization: 'Bearer test' } }));
    expect(await response.json()).toEqual({ status: 'already_sent_or_running' }); expect(fetchMock).not.toHaveBeenCalled();
  });
  it('usa destinatário definido e chave de idempotência; só marca enviado após sucesso', async () => {
    vi.stubEnv('CRON_SECRET', 'test'); vi.stubEnv('RESEND_API_KEY', 'key'); vi.stubEnv('ONBOARDING_EMAIL_FROM', 'test@example.test'); vi.stubEnv('MORVELIO_ALERT_EMAIL', 'blajeenlabs@outlook.com');
    mocks.query.mockResolvedValueOnce([{ day: 'today' }]).mockResolvedValue([]);
    mocks.dashboard.mockResolvedValue({ ...demoDashboard(), demo: false });
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ id: 'email' })); vi.stubGlobal('fetch', fetchMock);
    expect((await GET(new Request('https://example.test/api/cron/morvelio', { headers: { authorization: 'Bearer test' } }))).status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).to).toEqual(['blajeenlabs@outlook.com']);
    expect(fetchMock.mock.calls[0]![1].headers['Idempotency-Key']).toMatch(/^morvelio-daily-/);
    expect(mocks.query.mock.calls.at(-1)![0]).toContain("state = 'sent'");
  });
});
