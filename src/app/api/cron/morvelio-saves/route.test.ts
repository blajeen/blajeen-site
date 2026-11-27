import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ sync: vi.fn() }));
vi.mock('@/lib/analytics/unity', () => ({ syncUnity: mocks.sync }));
import { GET } from './route';
import { MissingConfiguration } from '@/lib/analytics/providers';
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
const call = (auth?: string) => GET(new Request('https://example.test/api/cron/morvelio-saves', { headers: auth ? { authorization: auth } : {} }));
describe('cron dos saves do Morvelio', () => {
  it('só o segredo de cron autoriza a coleta', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    expect((await call('Bearer wrong')).status).toBe(401); expect((await call()).status).toBe(401);
    expect(mocks.sync).not.toHaveBeenCalled();
  });
  it('responde 503 com o que falta configurar, sem detalhes de erro do provedor', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    mocks.sync.mockRejectedValueOnce(new MissingConfiguration('Configure UGS_PROJECT_ID')).mockRejectedValueOnce(new Error('HTTP 403 interno'));
    expect(await (await call('Bearer secret')).json()).toEqual({ error: 'Configure UGS_PROJECT_ID' });
    const second = await call('Bearer secret');
    expect(second.status).toBe(503); expect(JSON.stringify(await second.json())).not.toContain('interno');
  });
  it('devolve só contagens da coleta', async () => {
    vi.stubEnv('CRON_SECRET', 'secret'); mocks.sync.mockResolvedValue({ total: 840, read: 120, failed: 0, pending: 0, due: 120 });
    expect(await (await call('Bearer secret')).json()).toEqual({ status: 'ok', total: 840, read: 120, failed: 0, pending: 0, due: 120 });
  });
});
