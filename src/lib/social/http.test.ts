import { describe, expect, it, vi } from 'vitest';
const guard = vi.hoisted(() => vi.fn());
vi.mock('@/lib/onboarding/http', () => ({ adminGuard: guard }));
import { protegerSocial } from './http';
describe('proteção das APIs sociais', () => {
  it('mantém o bloqueio da sessão e rejeita mutação sem origem ou origem externa', async () => {
    guard.mockResolvedValueOnce(new Response(null, { status: 401 }));
    expect((await protegerSocial(new Request('https://example.test/api', { method: 'POST' })))?.status).toBe(401);
    guard.mockResolvedValue(null);
    expect((await protegerSocial(new Request('https://example.test/api', { method: 'POST' })))?.status).toBe(403);
    expect((await protegerSocial(new Request('https://example.test/api', { method: 'POST', headers: { origin: 'https://evil.test' } })))?.status).toBe(403);
    expect(await protegerSocial(new Request('https://example.test/api', { method: 'POST', headers: { origin: 'https://example.test' } }))).toBeNull();
  });
});
