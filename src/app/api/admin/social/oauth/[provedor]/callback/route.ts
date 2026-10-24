import { baseSocial, concluirOAuth, provedor } from '@/lib/social/oauth';
export async function GET(request: Request, ctx: { params: Promise<{ provedor: string }> }) {
  let ok = false;
  try { const q = new URL(request.url).searchParams; await concluirOAuth(provedor((await ctx.params).provedor), q.get('code') || '', q.get('state') || ''); ok = true; }
  catch { /* Nunca devolver códigos OAuth, tokens ou respostas externas no redirecionamento. */ }
  return Response.redirect(`${baseSocial()}/admin/redes-sociais?conexao=${ok ? 'ok' : 'erro'}`, 303);
}
