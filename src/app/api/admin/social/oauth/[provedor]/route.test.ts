import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ proteger: vi.fn(), iniciar: vi.fn() }));
vi.mock('@/lib/social/http', () => ({ protegerSocial: mocks.proteger }));
vi.mock('@/lib/social/oauth', () => ({ iniciarOAuth: mocks.iniciar, provedor: (p: string) => p }));
import { POST } from './route';

beforeEach(() => { vi.clearAllMocks(); mocks.proteger.mockResolvedValue(null); });
describe('início da autorização sem redirecionar formulário externo', () => {
  const request = () => new Request('https://blajeen.com.br/api/admin/social/oauth/youtube', { method: 'POST' });
  const context = { params: Promise.resolve({ provedor: 'youtube' }) };
  it('retorna o endereço para navegação explícita e não um redirecionamento sujeito a form-action', async () => {
    const url = 'https://accounts.google.com/o/oauth2/v2/auth?state=teste';
    mocks.iniciar.mockResolvedValue(url);
    const response = await POST(request(), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ url });
  });
  it('preserva a proteção de sessão e origem antes de gerar uma autorização', async () => {
    mocks.proteger.mockResolvedValue(Response.json({ error: 'Bloqueado' }, { status: 403 }));
    expect((await POST(request(), context)).status).toBe(403);
    expect(mocks.iniciar).not.toHaveBeenCalled();
  });
  it('informa falhas sem devolver detalhes das credenciais', async () => {
    mocks.iniciar.mockRejectedValue(new Error('segredo-interno'));
    const response = await POST(request(), context);
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain('segredo-interno');
  });
});
