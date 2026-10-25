import { randomBytes } from 'node:crypto';
import { concluirOAuth, provedor } from '@/lib/social/oauth';
import { ErroConexaoSocial } from '@/lib/social/oauth-feedback';
export async function GET(request: Request, ctx: { params: Promise<{ provedor: string }> }) {
  let resultado = 'erro';
  try {
    const q = new URL(request.url).searchParams;
    if (q.get('error') === 'access_denied') throw new ErroConexaoSocial('cancelada');
    await concluirOAuth(provedor((await ctx.params).provedor), q.get('code') || '', q.get('state') || '');
    resultado = 'ok';
  } catch (e) {
    // Só códigos controlados pelo site: nunca respostas externas, tokens ou códigos OAuth.
    if (e instanceof ErroConexaoSocial) resultado = e.motivo;
    // Diagnóstico no servidor: mensagens do próprio site (rede, endpoint sem query, status e código curto).
    else console.error('[social-oauth] falha ao concluir conexão', { rede: (await ctx.params).provedor.slice(0, 20), motivo: e instanceof Error ? e.message.slice(0, 300) : 'erro desconhecido' });
  }
  const destino = `/admin/redes-sociais?conexao=${resultado}`;
  const nonce = randomBytes(18).toString('base64');
  // Primeiro estabelecer um documento do próprio site. Um 303 vindo da rede
  // mantém a navegação entre sites e pode omitir a sessão SameSite=Strict.
  // Não mudar a proteção do cookie nem criar/renovar a sessão administrativa.
  return new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Voltando ao painel — Blajeen Labs</title><p>Autorização processada. Voltando ao painel…</p><a href="${destino}">Voltar ao painel</a><script nonce="${nonce}">window.location.replace(${JSON.stringify(destino)});</script></html>`, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
