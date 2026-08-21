import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';

export type ValidatedUpload = {
  bytes: Uint8Array<ArrayBuffer>;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  width: number | null;
  height: number | null;
};

const maxSize = 4 * 1024 * 1024;
const allowed = new Map([
  ['image/png', '.png'], ['image/jpeg', '.jpg'], ['image/webp', '.webp'], ['image/svg+xml', '.svg'],
  ['application/pdf', '.pdf'], ['text/csv', '.csv'],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx'],
]);

function starts(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

function detectMime(bytes: Uint8Array, browserMime: string, name: string): string | null {
  if (starts(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (starts(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (starts(bytes, [0x52, 0x49, 0x46, 0x46]) && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  if (starts(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'application/pdf';
  if (starts(bytes, [0x50, 0x4b, 0x03, 0x04]) && extname(name).toLowerCase() === '.xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const prefix = new TextDecoder().decode(bytes.slice(0, 1024)).trimStart();
  if (/^<\?xml[\s\S]*?<svg\b|^<svg\b/i.test(prefix)) return 'image/svg+xml';
  if ((browserMime === 'text/csv' || extname(name).toLowerCase() === '.csv') && !prefix.includes('\0')) return 'text/csv';
  return null;
}

function pngDimensions(bytes: Uint8Array): [number, number] | null {
  if (bytes.length < 24) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return [view.getUint32(16), view.getUint32(20)];
}

function jpegDimensions(bytes: Uint8Array): [number, number] | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    const marker = bytes[offset + 1];
    const length = ((bytes[offset + 2] ?? 0) << 8) + (bytes[offset + 3] ?? 0);
    if (marker && marker >= 0xc0 && marker <= 0xc3) {
      return [((bytes[offset + 7] ?? 0) << 8) + (bytes[offset + 8] ?? 0), ((bytes[offset + 5] ?? 0) << 8) + (bytes[offset + 6] ?? 0)];
    }
    if (length < 2) break;
    offset += length + 2;
  }
  return null;
}

function webpDimensions(bytes: Uint8Array): [number, number] | null {
  const kind = String.fromCharCode(...bytes.slice(12, 16));
  if (kind === 'VP8X' && bytes.length >= 30) {
    const width = 1 + (bytes[24] ?? 0) + ((bytes[25] ?? 0) << 8) + ((bytes[26] ?? 0) << 16);
    const height = 1 + (bytes[27] ?? 0) + ((bytes[28] ?? 0) << 8) + ((bytes[29] ?? 0) << 16);
    return [width, height];
  }
  return null;
}

function sanitizeSvg(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const source = new TextDecoder().decode(bytes);
  if (/<(?:script|foreignObject|iframe|object|embed)\b/i.test(source) || /\bon\w+\s*=/i.test(source) || /(?:href|src)\s*=\s*["'](?:https?:|data:|javascript:)/i.test(source)) {
    throw new Error('O SVG contém conteúdo externo ou executável e não pode ser enviado.');
  }
  return Uint8Array.from(new TextEncoder().encode(source.replace(/<!--([\s\S]*?)-->/g, '')));
}

export function uploadBody(bytes: Uint8Array): ArrayBuffer {
  return Uint8Array.from(bytes).buffer;
}

export async function validateUpload(file: File): Promise<ValidatedUpload> {
  if (file.size <= 0 || file.size > maxSize) throw new Error('O arquivo deve ter até 4 MB.');
  let bytes: Uint8Array<ArrayBuffer> = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectMime(bytes, file.type, file.name);
  if (!mimeType || !allowed.has(mimeType)) throw new Error('Formato não permitido. Use PNG, JPEG, WEBP, SVG, PDF, CSV ou XLSX.');
  const expectedExtension = allowed.get(mimeType);
  const suppliedExtension = extname(file.name).toLowerCase();
  if (mimeType !== 'image/jpeg' && suppliedExtension !== expectedExtension) throw new Error('A extensão do arquivo não corresponde ao conteúdo.');
  if (mimeType === 'image/jpeg' && !['.jpg', '.jpeg'].includes(suppliedExtension)) throw new Error('A extensão do arquivo não corresponde ao conteúdo.');
  if (mimeType === 'image/svg+xml') bytes = sanitizeSvg(bytes);
  const dimensions = mimeType === 'image/png' ? pngDimensions(bytes) : mimeType === 'image/jpeg' ? jpegDimensions(bytes) : mimeType === 'image/webp' ? webpDimensions(bytes) : null;
  return {
    bytes, originalName: file.name.slice(0, 180), mimeType, extension: expectedExtension ?? suppliedExtension,
    size: bytes.byteLength, width: dimensions?.[0] ?? null, height: dimensions?.[1] ?? null,
  };
}

type NeonFileResult = { rows?: unknown[][] };

async function neonFileQuery(query: string, params: unknown[] = []): Promise<NeonFileResult> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error('DATABASE_URL não configurado.');
  const url = new URL(databaseUrl);
  const response = await fetch(`https://${url.hostname}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': databaseUrl,
      'Neon-Raw-Text-Output': 'true',
      'Neon-Array-Mode': 'true',
    },
    body: JSON.stringify({ query, params }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Falha ao acessar os arquivos no banco (${response.status}).`);
  return response.json() as Promise<NeonFileResult>;
}

export async function storeUpload(projectId: string, upload: ValidatedUpload): Promise<string> {
  const safePath = `onboardings/${projectId}/${randomUUID()}${upload.extension}`;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const response = await fetch(`https://blob.vercel-storage.com/${safePath}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${blobToken}`, 'x-api-version': '7', 'x-content-type': upload.mimeType, 'x-add-random-suffix': '0' },
      body: uploadBody(upload.bytes),
    });
    if (!response.ok) throw new Error('Não foi possível armazenar o arquivo.');
    const payload = await response.json() as { url?: string };
    if (!payload.url) throw new Error('O armazenamento não retornou o endereço do arquivo.');
    return `blob:${payload.url}`;
  }
  if (process.env.DATABASE_URL?.trim()) {
    const storageKey = `db:${safePath}`;
    await neonFileQuery(
      `INSERT INTO onboarding_asset_files (storage_key, content)
       VALUES ($1, decode($2, 'base64'))`,
      [storageKey, Buffer.from(upload.bytes).toString('base64')],
    );
    return storageKey;
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Armazenamento de arquivos não configurado.');
  const destination = resolve(process.cwd(), '.data', 'uploads', safePath);
  await mkdir(resolve(destination, '..'), { recursive: true });
  await writeFile(destination, upload.bytes);
  return `local:${destination}`;
}

export async function readStoredFile(storageKey: string): Promise<Uint8Array> {
  if (storageKey.startsWith('local:')) return new Uint8Array(await readFile(storageKey.slice(6)));
  if (storageKey.startsWith('db:')) {
    const result = await neonFileQuery('SELECT encode(content, \'base64\') FROM onboarding_asset_files WHERE storage_key = $1 LIMIT 1', [storageKey]);
    const encoded = result.rows?.[0]?.[0];
    if (typeof encoded !== 'string') throw new Error('Arquivo não encontrado.');
    return new Uint8Array(Buffer.from(encoded, 'base64'));
  }
  if (storageKey.startsWith('blob:')) {
    const response = await fetch(storageKey.slice(5), { cache: 'no-store' });
    if (!response.ok) throw new Error('Arquivo não encontrado.');
    return new Uint8Array(await response.arrayBuffer());
  }
  throw new Error('Origem de arquivo inválida.');
}

export async function removeStoredFile(storageKey: string): Promise<void> {
  if (storageKey.startsWith('local:')) {
    try { await unlink(storageKey.slice(6)); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  if (storageKey.startsWith('db:')) {
    await neonFileQuery('DELETE FROM onboarding_asset_files WHERE storage_key = $1', [storageKey]);
  }
  if (storageKey.startsWith('blob:')) {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) throw new Error('BLOB_READ_WRITE_TOKEN não configurado para remover o arquivo.');
    const response = await fetch('https://blob.vercel-storage.com/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${blobToken}`, 'Content-Type': 'application/json', 'x-api-version': '7' },
      body: JSON.stringify({ urls: [storageKey.slice(5)] }),
    });
    if (!response.ok) throw new Error('Não foi possível remover o arquivo do armazenamento.');
  }
}
