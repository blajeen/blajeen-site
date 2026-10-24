import { api, bearer, graph, tokenDaConta } from './oauth';
import { urlDaMidia } from './media';
import type { ArquivoSocial, ContaPrivada, EnvioSocial } from './types';

type Resultado = Pick<EnvioSocial, 'estado' | 'remotoId' | 'erro'>;
type Checkpoint = (id: string) => Promise<void>;
const pausar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function json(token: string, body: unknown): RequestInit { return { method: 'POST', headers: { ...bearer(token), 'Content-Type': 'application/json' }, body: JSON.stringify(body) }; }
function titulo(texto: string): string { return Array.from(texto.split('\n')[0] || texto).slice(0, 90).join('').replace(/[<>]/g, '') || 'Blajeen'; }
function sucesso(id: string, estado: Resultado['estado'] = 'publicado', erro: string | null = null): Resultado { return { remotoId: id, estado, erro }; }
function validarId(id: string | undefined): string { if (!id || !/^[\w~.-]+$/.test(id)) throw new Error('A rede não retornou o identificador do envio.'); return id; }

/** IDs de sessão retornados por provedores nunca podem direcionar credenciais a outro host. */
export function urlDeUpload(url: string, host: string): string {
  const u = new URL(url); if (u.protocol !== 'https:' || u.hostname !== host || u.username || u.password || u.port) throw new Error('Endereço de upload inesperado.');
  return u.href;
}
async function trecho(arquivo: ArquivoSocial, inicio: number, fim: number): Promise<Uint8Array<ArrayBuffer>> {
  if (!arquivo.url) throw new Error('Arquivo não confirmado.');
  const r = await fetch(arquivo.url, { headers: { Range: `bytes=${inicio}-${fim}` }, cache: 'no-store', signal: AbortSignal.timeout(45_000) });
  if (r.status !== 206) { await r.body?.cancel(); throw new Error('O armazenamento não respondeu ao envio por partes.'); }
  const bytes = new Uint8Array(await r.arrayBuffer());
  if (bytes.length !== fim - inicio + 1) throw new Error('Parte incompleta do arquivo.'); return bytes;
}

async function instagram(c: ContaPrivada, arquivo: ArquivoSocial, legenda: string, token: string, checkpoint: Checkpoint): Promise<Resultado> {
  const id = c.id.split(':')[1]!;
  const container = await api<{ id: string }>(`${graph()}/${id}/media`, json(token, arquivo.tipo === 'video'
    ? { media_type: 'REELS', video_url: arquivo.url, caption: legenda, share_to_feed: true }
    : { image_url: arquivo.url, caption: legenda }));
  validarId(container.id); await checkpoint(`container:${container.id}`);
  for (let tentativa = 0; tentativa < 25; tentativa++) {
    const r = await api<{ status_code: string }>(`${graph()}/${container.id}?fields=status_code`, { headers: bearer(token) });
    if (r.status_code === 'FINISHED') {
      const publicado = await api<{ id: string }>(`${graph()}/${id}/media_publish`, json(token, { creation_id: container.id }));
      return sucesso(validarId(publicado.id));
    }
    if (['ERROR', 'EXPIRED'].includes(r.status_code)) return sucesso(`container:${container.id}`, 'falhou', 'O Instagram não processou a mídia. Confira formato e proporção.');
    await pausar(2000);
  }
  return sucesso(`container:${container.id}`, 'aceito', 'O Instagram está processando. Use “Atualizar resultados” para concluir a publicação.');
}

async function facebook(c: ContaPrivada, arquivo: ArquivoSocial, legenda: string, token: string, checkpoint: Checkpoint): Promise<Resultado> {
  const id = c.id.split(':')[1]!;
  if (arquivo.tipo === 'image') {
    const r = await api<{ id: string; post_id?: string }>(`${graph()}/${id}/photos`, json(token, { url: arquivo.url, caption: legenda, published: true }));
    return sucesso(validarId(r.post_id || r.id));
  }
  const r = await api<{ video_id: string; upload_url: string }>(`${graph()}/${id}/video_reels`, json(token, { upload_phase: 'start' }));
  validarId(r.video_id); await checkpoint(`video:${r.video_id}`);
  const upload = await api<{ success: boolean }>(urlDeUpload(r.upload_url, 'rupload.facebook.com'), { method: 'POST', headers: { Authorization: `OAuth ${token}`, file_url: arquivo.url! } });
  if (!upload.success) throw new Error('O Facebook não recebeu o vídeo.');
  const finish = await api<{ success: boolean }>(`${graph()}/${id}/video_reels`, json(token, { upload_phase: 'finish', video_id: r.video_id, video_state: 'PUBLISHED', description: legenda }));
  if (!finish.success) throw new Error('O Facebook não confirmou a publicação.');
  return sucesso(r.video_id, 'aceito', 'O Facebook recebeu o Reel e está processando.');
}

async function youtube(arquivo: ArquivoSocial, legenda: string, token: string, checkpoint: Checkpoint): Promise<Resultado> {
  if (arquivo.tipo !== 'video') throw new Error('O YouTube recebe apenas vídeos.');
  const r = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    ...json(token, { snippet: { title: titulo(legenda), description: legenda, categoryId: '28' }, status: { privacyStatus: 'public' } }),
    headers: { ...bearer(token), 'Content-Type': 'application/json', 'X-Upload-Content-Type': arquivo.mime, 'X-Upload-Content-Length': String(arquivo.tamanho) }, signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok || !r.headers.get('location')) throw new Error('O YouTube recusou o início do upload. Confira permissões e quota.');
  const uploadUrl = urlDeUpload(r.headers.get('location')!, 'www.googleapis.com');
  // Nunca persistir a URL autenticada de upload no histórico público do painel.
  await checkpoint('upload-iniciado');
  const origem = await fetch(arquivo.url!, { cache: 'no-store', signal: AbortSignal.timeout(180_000) });
  if (!origem.ok || !origem.body) throw new Error('Não foi possível ler o vídeo.');
  const request = { method: 'PUT', headers: { 'Content-Type': arquivo.mime, 'Content-Length': String(arquivo.tamanho) }, body: origem.body, duplex: 'half', signal: AbortSignal.timeout(180_000) } as RequestInit;
  const enviado = await api<{ id: string }>(uploadUrl, request);
  return sucesso(validarId(enviado.id), 'aceito', 'O YouTube recebeu o vídeo. A publicação depende do processamento e das permissões do projeto.');
}

type XMedia = { data: { id?: string; processing_info?: { state: string; check_after_secs?: number } } };
async function twitter(arquivo: ArquivoSocial, legenda: string, token: string, checkpoint: Checkpoint): Promise<Resultado> {
  let mediaId: string;
  if (arquivo.tipo === 'image') {
    const bytes = await trecho(arquivo, 0, arquivo.tamanho - 1);
    const r = await api<XMedia>('https://api.x.com/2/media/upload', json(token, { media: Buffer.from(bytes).toString('base64'), media_type: arquivo.mime, media_category: 'tweet_image' }));
    mediaId = validarId(r.data.id);
  } else {
    const r = await api<XMedia>('https://api.x.com/2/media/upload/initialize', json(token, { media_type: arquivo.mime, total_bytes: arquivo.tamanho, media_category: 'tweet_video' }));
    mediaId = validarId(r.data.id); await checkpoint(`media:${mediaId}`);
    const chunk = 4 * 1024 * 1024;
    for (let inicio = 0, indice = 0; inicio < arquivo.tamanho; inicio += chunk, indice++) {
      const bytes = await trecho(arquivo, inicio, Math.min(inicio + chunk, arquivo.tamanho) - 1);
      const form = new FormData(); form.set('segment_index', String(indice)); form.set('media', new Blob([bytes], { type: 'application/octet-stream' }), 'chunk');
      // APPEND pode retornar corpo vazio; o protocolo só exige status de sucesso.
      const append = await fetch(`https://api.x.com/2/media/upload/${mediaId}/append`, { method: 'POST', headers: bearer(token), body: form, signal: AbortSignal.timeout(45_000) });
      if (!append.ok) throw new Error('O X recusou uma parte do vídeo.');
    }
    let final = await api<XMedia>(`https://api.x.com/2/media/upload/${mediaId}/finalize`, { method: 'POST', headers: bearer(token) });
    for (let i = 0; final.data.processing_info && final.data.processing_info.state !== 'succeeded'; i++) {
      if (i >= 20 || final.data.processing_info.state === 'failed') throw new Error('O X não concluiu o processamento do vídeo. Confira a conta antes de reenviar.');
      await pausar(Math.min(5000, Math.max(1000, (final.data.processing_info.check_after_secs || 1) * 1000)));
      final = await api<XMedia>(`https://api.x.com/2/media/upload?command=STATUS&media_id=${mediaId}`, { headers: bearer(token) });
    }
  }
  const post = await api<{ data: { id: string } }>('https://api.x.com/2/tweets', json(token, { text: legenda, media: { media_ids: [mediaId] } }));
  return sucesso(validarId(post.data.id));
}

async function tiktok(arquivo: ArquivoSocial, legenda: string, token: string, checkpoint: Checkpoint): Promise<Resultado> {
  if (arquivo.tipo === 'image') {
    const r = await api<{ data: { publish_id: string } }>('https://open.tiktokapis.com/v2/post/publish/content/init/', json(token, {
      post_info: { title: titulo(legenda), description: legenda }, source_info: { source: 'PULL_FROM_URL', photo_cover_index: 0, photo_images: [urlDaMidia(arquivo.id)] }, post_mode: 'MEDIA_UPLOAD', media_type: 'PHOTO',
    }));
    return sucesso(validarId(r.data.publish_id), 'acao', 'Abra a notificação na caixa de entrada do TikTok para revisar e publicar a imagem.');
  }
  const maxChunk = 32 * 1024 * 1024; const count = Math.max(1, Math.floor(arquivo.tamanho / maxChunk)); const chunk = count === 1 ? arquivo.tamanho : maxChunk;
  const r = await api<{ data: { publish_id: string; upload_url: string } }>('https://open.tiktokapis.com/v2/post/publish/inbox/video/init/', json(token, { source_info: { source: 'FILE_UPLOAD', video_size: arquivo.tamanho, chunk_size: chunk, total_chunk_count: count } }));
  const id = validarId(r.data.publish_id); await checkpoint(id);
  const u = new URL(r.data.upload_url);
  if (u.protocol !== 'https:' || !/(^|\.)tiktokapis\.com$/.test(u.hostname) || u.port || u.username || u.password) throw new Error('Endereço de upload TikTok inesperado.');
  for (let i = 0; i < count; i++) {
    const inicio = i * chunk; const fim = i === count - 1 ? arquivo.tamanho - 1 : inicio + chunk - 1;
    const bytes = await trecho(arquivo, inicio, fim);
    const enviado = await fetch(u.href, { method: 'PUT', headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(bytes.length), 'Content-Range': `bytes ${inicio}-${fim}/${arquivo.tamanho}` }, body: bytes, signal: AbortSignal.timeout(60_000) });
    if (!enviado.ok) throw new Error('O TikTok não confirmou o recebimento do vídeo.');
  }
  return sucesso(id, 'acao', 'Abra a notificação no TikTok, cole a legenda do painel e finalize a publicação.');
}

export async function publicarDireto(c: ContaPrivada, arquivo: ArquivoSocial, legenda: string, checkpoint: Checkpoint): Promise<Resultado> {
  const token = await tokenDaConta(c);
  if (c.rede === 'instagram') return instagram(c, arquivo, legenda, token, checkpoint);
  if (c.rede === 'facebook') return facebook(c, arquivo, legenda, token, checkpoint);
  if (c.rede === 'youtube') return youtube(arquivo, legenda, token, checkpoint);
  if (c.rede === 'twitter') return twitter(arquivo, legenda, token, checkpoint);
  return tiktok(arquivo, legenda, token, checkpoint);
}

/** Consulta explícita, sem reenviar posts já aceitos. O Instagram precisa finalizar o contêiner. */
export async function verificarEnvio(c: ContaPrivada, envio: EnvioSocial): Promise<Resultado | null> {
  const token = await tokenDaConta(c); const id = envio.remotoId;
  if (!id) return null;
  if (c.rede === 'instagram' && id.startsWith('container:')) {
    const containerId = id.slice(10);
    const r = await api<{ status_code: string }>(`${graph()}/${containerId}?fields=status_code`, { headers: bearer(token) });
    if (r.status_code === 'FINISHED') {
      const r = await api<{ id: string }>(`${graph()}/${c.id.split(':')[1]}/media_publish`, json(token, { creation_id: containerId })); return sucesso(validarId(r.id));
    }
    if (['ERROR', 'EXPIRED'].includes(r.status_code)) return sucesso(id, 'falhou', 'O Instagram não processou a mídia ou o contêiner expirou.');
  }
  if (c.rede === 'youtube') {
    const r = await api<{ items: { status: { uploadStatus: string; privacyStatus: string }; processingDetails?: { processingStatus: string } }[] }>(`https://www.googleapis.com/youtube/v3/videos?part=status,processingDetails&id=${encodeURIComponent(id)}`, { headers: bearer(token) });
    const video = r.items[0];
    if (video?.status.uploadStatus === 'processed' && video.status.privacyStatus === 'public') return sucesso(id);
    if (video?.status.privacyStatus === 'private') return sucesso(id, 'aceito', 'O vídeo está privado no YouTube. Confira as permissões do projeto e a privacidade no YouTube Studio.');
    if (video && ['failed', 'rejected', 'deleted'].includes(video.status.uploadStatus)) return sucesso(id, 'falhou', 'O YouTube não publicou este vídeo. Confira o YouTube Studio.');
  }
  if (c.rede === 'facebook') {
    const r = await api<{ status?: { video_status?: string; publishing_phase?: { status?: string } } }>(`${graph()}/${id}?fields=status`, { headers: bearer(token) });
    if (r.status?.publishing_phase?.status === 'complete') return sucesso(id);
    if (r.status?.video_status === 'error') return sucesso(id, 'falhou', 'O Facebook não conseguiu processar o Reel.');
  }
  return null;
}
