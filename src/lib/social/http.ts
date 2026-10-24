import { adminGuard } from '@/lib/onboarding/http';

/** Todas as mutações do módulo exigem sessão e origem da própria aplicação. */
export async function protegerSocial(request: Request): Promise<Response | null> {
  const bloqueio = await adminGuard();
  if (bloqueio) return bloqueio;
  if (request.method !== 'GET') {
    const origem = request.headers.get('origin');
    if (!origem || origem !== new URL(request.url).origin) return Response.json({ error: 'Origem da solicitação inválida.' }, { status: 403 });
  }
  return null;
}
