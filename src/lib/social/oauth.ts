import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { adminCookie, verifyAdminSession } from '@/lib/onboarding/security';
import { cifrar, decifrar, hash } from './crypto';
import { consumirOAuth, contasPrivadas, guardarOAuth, salvarConta } from './repository';
import type { ContaPrivada, ContaSocial } from './types';

export const PROVEDORES = ['meta', 'youtube', 'twitter', 'tiktok'] as const;
export type Provedor = typeof PROVEDORES[number];
const vars: Record<Provedor, [string, string]> = {
  meta: ['SOCIAL_META_APP_ID', 'SOCIAL_META_APP_SECRET'], youtube: ['SOCIAL_GOOGLE_CLIENT_ID', 'SOCIAL_GOOGLE_CLIENT_SECRET'],
  twitter: ['SOCIAL_X_CLIENT_ID', 'SOCIAL_X_CLIENT_SECRET'], tiktok: ['SOCIAL_TIKTOK_CLIENT_KEY', 'SOCIAL_TIKTOK_CLIENT_SECRET'],
};
export function provedor(valor: string): Provedor {
  if (!PROVEDORES.includes(valor as Provedor)) throw new Error('Rede inválida.'); return valor as Provedor;
}
export function configurado(p: Provedor): boolean {
  return vars[p].every((v) => Boolean(process.env[v]?.trim())) && (process.env.SOCIAL_TOKEN_SECRET?.length ?? 0) >= 32 && Boolean(process.env.NEXT_PUBLIC_SITE_URL) && (p !== 'meta' || Boolean(process.env.SOCIAL_META_API_VERSION));
}
function credenciais(p: Provedor) {
  if (!configurado(p)) throw new Error('Configure o aplicativo desta rede no servidor antes de conectar. Veja as instruções no painel.');
  return { id: process.env[vars[p][0]]!.trim(), segredo: process.env[vars[p][1]]!.trim() };
}
export function baseSocial(): string {
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('Configure o domínio HTTPS do site.');
  return url.origin;
}
export function graph(): string {
  const version = process.env.SOCIAL_META_API_VERSION;
  if (!version || !/^v\d+\.0$/.test(version)) throw new Error('Configure SOCIAL_META_API_VERSION com a versão do aplicativo Meta.');
  return `https://graph.facebook.com/${version}`;
}
function retorno(p: Provedor) { return `${baseSocial()}/api/admin/social/oauth/${p}/callback`; }
export async function api<T>(url: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(url, { ...init, cache: 'no-store', signal: init.signal ?? AbortSignal.timeout(60_000) });
  if (!r.ok) throw new Error(`A rede recusou a solicitação (HTTP ${r.status}). Confira permissões, formato e conexão da conta.`);
  if (r.status === 204) return {} as T;
  const data = await r.json() as T & { error?: { code?: string } | string };
  if (data.error && (typeof data.error === 'string' || data.error.code && data.error.code !== 'ok')) throw new Error('A rede recusou a operação. Confira a configuração e reconecte a conta.');
  return data;
}
function form(p: Record<string, string>): RequestInit { return { method: 'POST', body: new URLSearchParams(p) }; }
export function bearer(token: string): Record<string, string> { return { Authorization: `Bearer ${token}` }; }
type Token = { access_token: string; refresh_token?: string; expires_in?: number; scope?: string; open_id?: string };

export async function iniciarOAuth(p: Provedor): Promise<string> {
  const { id } = credenciais(p); const state = randomBytes(32).toString('base64url');
  const nonce = randomBytes(32).toString('base64url'); const verifier = randomBytes(48).toString('base64url');
  const jar = await cookies(); const sessao = jar.get(adminCookie.name)?.value;
  if (!sessao || !verifyAdminSession(sessao)) throw new Error('Entre novamente no painel.');
  await guardarOAuth({ id: hash(state), provedor: p, nonceHash: hash(nonce), verificador: cifrar(verifier), sessao: cifrar(sessao), expiraEm: Date.now() + 600_000 });
  jar.set(`social_oauth_${p}`, nonce, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: `/api/admin/social/oauth/${p}/callback`, maxAge: 600 });
  const query: Record<string, string> = { client_id: id, redirect_uri: retorno(p), response_type: 'code', state };
  let endpoint: string;
  if (p === 'meta') { endpoint = `https://www.facebook.com/${process.env.SOCIAL_META_API_VERSION}/dialog/oauth`; query.scope = 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish'; }
  else if (p === 'youtube') { endpoint = 'https://accounts.google.com/o/oauth2/v2/auth'; Object.assign(query, { scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly', access_type: 'offline', prompt: 'consent', code_challenge_method: 'S256', code_challenge: createHash('sha256').update(verifier).digest('base64url') }); }
  else if (p === 'twitter') { endpoint = 'https://x.com/i/oauth2/authorize'; Object.assign(query, { scope: 'tweet.read tweet.write users.read offline.access media.write', code_challenge_method: 'S256', code_challenge: createHash('sha256').update(verifier).digest('base64url') }); }
  else { endpoint = 'https://www.tiktok.com/v2/auth/authorize/'; delete query.client_id; Object.assign(query, { client_key: id, scope: 'user.info.basic,video.upload' }); }
  return `${endpoint}?${new URLSearchParams(query)}`;
}

async function conta(rede: ContaPrivada['rede'], id: string, nome: string, token: Token) {
  if (!id || !token.access_token) throw new Error('A rede não retornou uma conta válida.');
  const anterior = (await contasPrivadas()).find((c) => c.id === `${rede}:${id}`);
  await salvarConta({ id: `${rede}:${id}`, rede, nome, token: cifrar(token.access_token), refresh: token.refresh_token ? cifrar(token.refresh_token) : anterior?.refresh ?? null,
    expiraEm: token.expires_in ? Date.now() + token.expires_in * 1000 : null });
}

export async function concluirOAuth(p: Provedor, code: string, state: string) {
  const jar = await cookies(); const cookie = `social_oauth_${p}`; const nonce = jar.get(cookie)?.value;
  if (!nonce || !state || !code) throw new Error('Autorização incompleta ou expirada. Conecte novamente.');
  const pendente = await consumirOAuth(hash(state), hash(nonce));
  jar.delete({ name: cookie, path: `/api/admin/social/oauth/${p}/callback` });
  if (!pendente || pendente.provedor !== p || !verifyAdminSession(decifrar(pendente.sessao))) throw new Error('Autorização inválida ou expirada. Conecte novamente.');
  const { id, segredo } = credenciais(p);
  const params = { client_id: id, client_secret: segredo, redirect_uri: retorno(p), code, grant_type: 'authorization_code', code_verifier: decifrar(pendente.verificador) };
  if (p === 'meta') {
    const curto = await api<Token>(`${graph()}/oauth/access_token?${new URLSearchParams({ client_id: id, client_secret: segredo, redirect_uri: retorno(p), code })}`);
    const longo = await api<Token>(`${graph()}/oauth/access_token?${new URLSearchParams({ grant_type: 'fb_exchange_token', client_id: id, client_secret: segredo, fb_exchange_token: curto.access_token })}`);
    type Page = { id: string; name: string; access_token: string; instagram_business_account?: { id: string; username?: string } };
    const paginas = await api<{ data: Page[] }>(`${graph()}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&limit=100`, { headers: bearer(longo.access_token) });
    if (!paginas.data.length) throw new Error('Nenhuma Página autorizada. Autorize uma Página do Facebook vinculada ao seu Instagram profissional.');
    for (const pagina of paginas.data) {
      await conta('facebook', pagina.id, pagina.name, { access_token: pagina.access_token });
      if (pagina.instagram_business_account) await conta('instagram', pagina.instagram_business_account.id, pagina.instagram_business_account.username || pagina.name, { access_token: pagina.access_token });
    }
  } else if (p === 'youtube') {
    const token = await api<Token>('https://oauth2.googleapis.com/token', form(params));
    const canais = await api<{ items: { id: string; snippet: { title: string } }[] }>('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { headers: bearer(token.access_token) });
    if (!canais.items.length) throw new Error('Crie um canal do YouTube nesta conta antes de conectar.');
    for (const canal of canais.items) await conta('youtube', canal.id, canal.snippet.title, token);
  } else if (p === 'twitter') {
    const token = await api<Token>('https://api.x.com/2/oauth2/token', { ...form({ grant_type: params.grant_type, code, redirect_uri: params.redirect_uri, code_verifier: params.code_verifier, client_id: id }), headers: { Authorization: `Basic ${Buffer.from(`${id}:${segredo}`).toString('base64')}` } });
    const usuario = await api<{ data: { id: string; username: string } }>('https://api.x.com/2/users/me', { headers: bearer(token.access_token) });
    await conta('twitter', usuario.data.id, usuario.data.username, token);
  } else {
    const token = await api<Token>('https://open.tiktokapis.com/v2/oauth/token/', form({ client_key: id, client_secret: segredo, grant_type: 'authorization_code', code, redirect_uri: retorno(p) }));
    if (!token.scope?.split(',').includes('video.upload')) throw new Error('O aplicativo precisa da permissão video.upload aprovada pelo TikTok.');
    const usuario = await api<{ data: { user: { open_id: string; display_name: string } } }>('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name', { headers: bearer(token.access_token) });
    await conta('tiktok', usuario.data.user.open_id, usuario.data.user.display_name, token);
  }
}

export async function contasPublicas(): Promise<ContaSocial[]> {
  return (await contasPrivadas()).map((c) => {
    const p = c.rede === 'instagram' || c.rede === 'facebook' ? 'meta' : c.rede;
    const disponivel = configurado(p) && (!c.expiraEm || c.expiraEm > Date.now() + 60_000 || Boolean(c.refresh));
    return { id: c.id, rede: c.rede, nome: c.nome, disponivel, motivo: disponivel ? null : 'Reconecte esta conta ou confira as configurações do aplicativo.' };
  });
}
export async function tokenDaConta(c: ContaPrivada): Promise<string> {
  if (!c.expiraEm || c.expiraEm > Date.now() + 60_000) return decifrar(c.token);
  if (!c.refresh) throw new Error('A conexão expirou. Reconecte a conta no painel.');
  const p = c.rede === 'instagram' || c.rede === 'facebook' ? 'meta' : c.rede; const { id, segredo } = credenciais(p);
  const refresh = decifrar(c.refresh); let token: Token;
  if (p === 'youtube') token = await api<Token>('https://oauth2.googleapis.com/token', form({ client_id: id, client_secret: segredo, refresh_token: refresh, grant_type: 'refresh_token' }));
  else if (p === 'twitter') token = await api<Token>('https://api.x.com/2/oauth2/token', { ...form({ client_id: id, refresh_token: refresh, grant_type: 'refresh_token' }), headers: { Authorization: `Basic ${Buffer.from(`${id}:${segredo}`).toString('base64')}` } });
  else if (p === 'tiktok') token = await api<Token>('https://open.tiktokapis.com/v2/oauth/token/', form({ client_key: id, client_secret: segredo, refresh_token: refresh, grant_type: 'refresh_token' }));
  else throw new Error('Reconecte a conta Meta.');
  await salvarConta({ ...c, token: cifrar(token.access_token), refresh: token.refresh_token ? cifrar(token.refresh_token) : c.refresh, expiraEm: Date.now() + (token.expires_in || 3600) * 1000 });
  return token.access_token;
}
