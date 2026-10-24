import { protegerSocial } from '@/lib/social/http';
import { carregarPainelSocial } from '@/lib/social/dashboard';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const bloqueio = await protegerSocial(request); if (bloqueio) return bloqueio;
  try {
    return Response.json(await carregarPainelSocial(), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch { return Response.json({ error: 'Não foi possível carregar as redes. Confira a conexão com o banco e a migration do módulo.' }, { status: 503 }); }
}
