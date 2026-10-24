import { randomUUID } from 'node:crypto';
import { arquivoLocal, bancoConfigurado, consultar, exigirBancoEmProducao } from '@/lib/admin/banco';
import type { ArquivoSocial, ContaPrivada, ContaSocial, EnvioSocial, OAuthPendente, PublicacaoSocial } from './types';

type Post = Omit<PublicacaoSocial, 'envios'> & { arquivoId: string };
type Delivery = EnvioSocial & { postId: string; atualizadoEm: number };
type Store = { contas: ContaPrivada[]; arquivos: ArquivoSocial[]; posts: Post[]; envios: Delivery[]; oauth: OAuthPendente[] };
const local = arquivoLocal<Store>('social.json', () => ({ contas: [], arquivos: [], posts: [], envios: [], oauth: [] }));
function preparar() { exigirBancoEmProducao(); return bancoConfigurado(); }

export async function contasPrivadas(): Promise<ContaPrivada[]> {
  if (!preparar()) return (await local.ler()).contas;
  return (await consultar<{ body: ContaPrivada }>('SELECT body FROM social_accounts')).map((r) => r.body);
}
export async function salvarConta(conta: ContaPrivada) {
  if (!preparar()) return local.alterar((s) => { s.contas = [...s.contas.filter((c) => c.id !== conta.id), conta]; });
  await consultar('INSERT INTO social_accounts(id, body) VALUES ($1,$2::jsonb) ON CONFLICT(id) DO UPDATE SET body=EXCLUDED.body', [conta.id, JSON.stringify(conta)]);
}
export async function removerConta(id: string) {
  if (!preparar()) return local.alterar((s) => { s.contas = s.contas.filter((c) => c.id !== id); });
  await consultar('DELETE FROM social_accounts WHERE id=$1', [id]);
}
export async function salvarArquivo(arquivo: ArquivoSocial) {
  if (!preparar()) return local.alterar((s) => { s.arquivos = [...s.arquivos.filter((a) => a.id !== arquivo.id), arquivo]; });
  await consultar('INSERT INTO social_assets(id, body) VALUES ($1,$2::jsonb) ON CONFLICT(id) DO UPDATE SET body=EXCLUDED.body', [arquivo.id, JSON.stringify(arquivo)]);
}
export async function lerArquivo(id: string): Promise<ArquivoSocial | undefined> {
  if (!preparar()) return (await local.ler()).arquivos.find((a) => a.id === id);
  return (await consultar<{ body: ArquivoSocial }>('SELECT body FROM social_assets WHERE id=$1', [id]))[0]?.body;
}
export async function guardarOAuth(entrada: OAuthPendente) {
  if (!preparar()) return local.alterar((s) => { s.oauth = [...s.oauth.filter((o) => o.expiraEm > Date.now()), entrada]; });
  await consultar('DELETE FROM social_oauth WHERE expires_at < now()');
  await consultar('INSERT INTO social_oauth(id,body,expires_at) VALUES($1,$2::jsonb,$3)', [entrada.id, JSON.stringify(entrada), new Date(entrada.expiraEm).toISOString()]);
}
export async function consumirOAuth(id: string, nonceHash: string): Promise<OAuthPendente | undefined> {
  if (!preparar()) return local.alterar((s) => {
    const o = s.oauth.find((o) => o.id === id && o.nonceHash === nonceHash && o.expiraEm > Date.now());
    if (o) s.oauth = s.oauth.filter((x) => x.id !== id);
    return o;
  });
  return (await consultar<{ body: OAuthPendente }>("DELETE FROM social_oauth WHERE id=$1 AND body->>'nonceHash'=$2 AND expires_at > now() RETURNING body", [id, nonceHash]))[0]?.body;
}
export async function criarPublicacao(id: string, arquivo: ArquivoSocial, legenda: string, destinos: ContaSocial[]): Promise<void> {
  const post: Post = { id, arquivoId: arquivo.id, arquivoNome: arquivo.nome, legenda, tipo: arquivo.tipo, criadoEm: new Date().toISOString() };
  const envios: Delivery[] = destinos.map((c) => ({ id: randomUUID(), postId: id, rede: c.rede, contaId: c.id, contaNome: c.nome, estado: 'pendente', remotoId: null, erro: null, atualizadoEm: Date.now() }));
  function conferir(existente: Post, entregas: Delivery[]) {
    if (existente.arquivoId !== arquivo.id || existente.legenda !== legenda ||
      entregas.map((e) => e.contaId).sort().join('|') !== destinos.map((d) => d.id).sort().join('|')) throw new Error('Este identificador já foi usado para outra publicação. Confira o histórico.');
  }
  if (!preparar()) return local.alterar((s) => {
    const existente = s.posts.find((p) => p.id === id);
    if (existente) { conferir(existente, s.envios.filter((e) => e.postId === id)); return; }
    s.posts.push(post); s.envios.push(...envios);
  });
  await consultar(`WITH novo AS (
    INSERT INTO social_posts(id,body) VALUES($1,$2::jsonb) ON CONFLICT(id) DO NOTHING RETURNING id
  ) INSERT INTO social_deliveries(id,post_id,body)
    SELECT (e->>'id')::uuid, novo.id, e FROM novo CROSS JOIN jsonb_array_elements($3::jsonb) e`, [id, JSON.stringify(post), JSON.stringify(envios)]);
  const existente = (await consultar<{ body: Post }>('SELECT body FROM social_posts WHERE id=$1', [id]))[0]?.body;
  const entregas = (await consultar<{ body: Delivery }>('SELECT body FROM social_deliveries WHERE post_id=$1', [id])).map((r) => r.body);
  if (!existente) throw new Error('Não foi possível confirmar o registro.');
  conferir(existente, entregas);
}
export async function historico(): Promise<PublicacaoSocial[]> {
  let posts: Post[]; let envios: Delivery[];
  if (!preparar()) { const s = await local.ler(); posts = s.posts.slice(-30).reverse(); envios = s.envios; }
  else {
    posts = (await consultar<{ body: Post }>('SELECT body FROM social_posts ORDER BY created_at DESC LIMIT 30')).map((r) => r.body);
    envios = posts.length ? (await consultar<{ body: Delivery; state: Delivery['estado'] }>('SELECT body,state FROM social_deliveries WHERE post_id=ANY($1::uuid[])', [posts.map((p) => p.id)])).map((r) => ({ ...r.body, estado: r.state })) : [];
  }
  return posts.map((p) => ({ ...p, envios: envios.filter((e) => e.postId === p.id).map((e) => e.estado === 'enviando' && Date.now() - e.atualizadoEm > 310_000 ? { ...e, estado: 'incerto' as const, erro: 'O envio foi interrompido. Confira o destino antes de criar outra publicação.' } : e) }));
}
export async function reservarEnvio(id: string, esperado: Delivery['estado'] = 'pendente'): Promise<{ envio: Delivery; post: Post; arquivo: ArquivoSocial } | null> {
  let envio: Delivery | undefined;
  if (!preparar()) envio = await local.alterar((s) => {
    const e = s.envios.find((e) => e.id === id && e.estado === esperado);
    if (!e) return; e.estado = 'enviando'; e.atualizadoEm = Date.now(); return { ...e };
  });
  else envio = (await consultar<{ body: Delivery }>(`UPDATE social_deliveries SET state='enviando', updated_at=now(), body=body || jsonb_build_object('estado','enviando','atualizadoEm',$2::bigint)
    WHERE id=$1 AND state=$3 RETURNING body`, [id, Date.now(), esperado]))[0]?.body;
  if (!envio) return null;
  const post = preparar() ? (await consultar<{ body: Post }>('SELECT body FROM social_posts WHERE id=$1', [envio.postId]))[0]?.body : (await local.ler()).posts.find((p) => p.id === envio.postId);
  const arquivo = post ? await lerArquivo(post.arquivoId) : undefined;
  if (!post || !arquivo) throw new Error('Arquivo da publicação não encontrado.');
  return { envio, post, arquivo };
}
export async function atualizarEnvio(id: string, dados: Pick<EnvioSocial, 'estado' | 'remotoId' | 'erro'>) {
  if (!preparar()) return local.alterar((s) => { const e = s.envios.find((e) => e.id === id); if (e) Object.assign(e, dados, { atualizadoEm: Date.now() }); });
  await consultar('UPDATE social_deliveries SET state=$2, body=body || $3::jsonb, updated_at=now() WHERE id=$1', [id, dados.estado, JSON.stringify({ ...dados, atualizadoEm: Date.now() })]);
}
