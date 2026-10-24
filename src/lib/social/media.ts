import { createHmac, timingSafeEqual } from 'node:crypto';
import { head, put } from '@vercel/blob';
import sharp from 'sharp';
import { baseSocial } from './oauth';
import { lerArquivo, salvarArquivo } from './repository';
import { validarArquivo } from './validation';
import type { ArquivoSocial } from './types';

function assinatura(id: string, exp: string): string {
  const segredo = process.env.SOCIAL_TOKEN_SECRET;
  if (!segredo) throw new Error('Configure a chave de segurança das redes.');
  return createHmac('sha256', segredo).update(`social-media:${id}:${exp}`).digest('hex');
}
export function urlDaMidia(id: string): string {
  const exp = String(Date.now() + 24 * 60 * 60 * 1000);
  return `${baseSocial()}/api/social/media/${id}?exp=${exp}&sig=${assinatura(id, exp)}`;
}
export function assinaturaValida(id: string, exp: string, sig: string): boolean {
  if (!/^\d{13}$/.test(exp) || Number(exp) < Date.now() || Number(exp) > Date.now() + 25 * 60 * 60 * 1000 || !/^[a-f0-9]{64}$/.test(sig)) return false;
  return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(assinatura(id, exp), 'hex'));
}
export async function confirmarArquivo(id: string): Promise<ArquivoSocial> {
  const arquivo = await lerArquivo(id);
  if (!arquivo) throw new Error('Envie o arquivo novamente.');
  if (arquivo.url) return arquivo;
  const meta = await head(arquivo.pathname);
  const tipo = validarArquivo(arquivo.nome, meta.contentType, meta.size);
  if (meta.pathname !== arquivo.pathname || meta.size !== arquivo.tamanho || tipo !== arquivo.tipo) throw new Error('O arquivo recebido não corresponde ao envio.');
  const resposta = await fetch(meta.url, { headers: { Range: tipo === 'video' ? 'bytes=0-63' : `bytes=0-${meta.size - 1}` }, cache: 'no-store', signal: AbortSignal.timeout(30_000) });
  if (!resposta.ok) throw new Error('Não foi possível validar o arquivo recebido.');
  if (tipo === 'video' && resposta.status !== 206) { await resposta.body?.cancel(); throw new Error('O armazenamento não permitiu validar o vídeo por partes.'); }
  const bytes = Buffer.from(await resposta.arrayBuffer());
  let url = meta.url; let mime = arquivo.mime; let tamanho = meta.size;
  if (tipo === 'video') {
    if (bytes.subarray(4, 8).toString() !== 'ftyp') throw new Error('O arquivo não é um vídeo MP4 válido.');
  } else {
    const imagem = sharp(bytes, { limitInputPixels: 40_000_000 });
    const info = await imagem.metadata();
    if (!['jpeg', 'png'].includes(info.format || '')) throw new Error('Use uma imagem JPG ou PNG válida.');
    const convertido = await imagem.rotate().resize({ width: 1080, height: 1920, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 95 }).toBuffer();
    const salvo = await put(`social/normalized/${id}.jpg`, convertido, { access: 'public', contentType: 'image/jpeg', addRandomSuffix: false });
    url = salvo.url; mime = 'image/jpeg'; tamanho = convertido.length;
  }
  const pronto = { ...arquivo, url, mime, tamanho };
  await salvarArquivo(pronto); return pronto;
}
