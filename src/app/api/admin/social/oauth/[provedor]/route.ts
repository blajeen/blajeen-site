import { protegerSocial } from '@/lib/social/http';
import { iniciarOAuth, provedor } from '@/lib/social/oauth';
export async function POST(request: Request, ctx: { params: Promise<{ provedor: string }> }) {
  const bloqueio = await protegerSocial(request); if (bloqueio) return bloqueio;
  try { return Response.json({ url: await iniciarOAuth(provedor((await ctx.params).provedor)) }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return Response.json({ error: 'Não foi possível iniciar a conexão. Confira a configuração do aplicativo.' }, { status: 400 }); }
}
