import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ guard: vi.fn(), dashboard: vi.fn() }));
vi.mock('@/lib/onboarding/http', () => ({ adminGuard: mocks.guard }));
vi.mock('@/lib/analytics/dashboard', () => ({ getDashboard: mocks.dashboard }));
import { GET } from './route';
afterEach(() => vi.clearAllMocks());
describe('API privada Analytics', () => {
  it('exige login inclusive para dados de exemplo', async () => {
    mocks.guard.mockResolvedValue(new Response('Não autorizado', { status: 401 }));
    expect((await GET(new Request('https://example.test/api/admin/analytics/morvelio?exemplo=1'))).status).toBe(401);
    expect(mocks.dashboard).not.toHaveBeenCalled();
  });
  it('isola os exemplos das APIs reais e impede cache público', async () => {
    mocks.guard.mockResolvedValue(null);
    const response = await GET(new Request('https://example.test/api/admin/analytics/morvelio?exemplo=1'));
    expect((await response.json()).demo).toBe(true);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.dashboard).not.toHaveBeenCalled();
  });
});
