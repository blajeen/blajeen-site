import { protegerSocial } from '@/lib/social/http';
import { iniciarOAuth, provedor } from '@/lib/social/oauth';
export async function POST(request: Request, ctx: { params: Promise<{ provedor: string }> }) {
  const bloqueio = await protegerSocial(request); if (bloqueio) return bloqueio;
  try { return Response.redirect(await iniciarOAuth(provedor((await ctx.params).provedor)), 303); }
  catch { return Response.redirect(new URL('/admin/redes-sociais?conexao=erro', request.url), 303); }
}
