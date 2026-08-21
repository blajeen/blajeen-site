import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export type NewsStatus = 'DRAFT' | 'PUBLISHED';
export type ManagedNews = {
  id: string;
  slug: string;
  data: string;
  rotulo: string;
  titulo: string;
  texto: string[];
  href?: string;
  cta?: string;
  status: NewsStatus;
  createdAt: string;
  updatedAt: string;
};

export type NewsInput = Pick<ManagedNews, 'data' | 'rotulo' | 'titulo' | 'texto' | 'status'> & {
  href?: string;
  cta?: string;
};

const localPath = resolve(process.cwd(), '.data', 'news.json');
let localQueue = Promise.resolve();

function databaseUrl(): string | null {
  return process.env.DATABASE_URL?.trim() || null;
}

type NeonResult = { fields?: Array<{ name: string }>; rows?: unknown[][] };

async function query<T extends Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const connection = databaseUrl();
  if (!connection) throw new Error('DATABASE_URL não configurado.');
  const parsed = new URL(connection);
  const response = await fetch(`https://${parsed.hostname}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': connection,
      'Neon-Raw-Text-Output': 'false',
      'Neon-Array-Mode': 'true',
    },
    body: JSON.stringify({ query: sql, params }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Falha no banco de dados (${response.status}).`);
  const payload = await response.json() as NeonResult;
  const names = payload.fields?.map((field) => field.name) ?? [];
  return (payload.rows ?? []).map((row) => Object.fromEntries(names.map((name, index) => [name, row[index]])) as T);
}

async function readLocal(): Promise<ManagedNews[]> {
  try {
    return JSON.parse(await readFile(localPath, 'utf8')) as ManagedNews[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function mutateLocal<T>(mutator: (items: ManagedNews[]) => T): Promise<T> {
  let result!: T;
  const operation = localQueue.then(async () => {
    const items = await readLocal();
    result = mutator(items);
    await mkdir(dirname(localPath), { recursive: true });
    const temporary = `${localPath}.${randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
    await rename(temporary, localPath);
  });
  localQueue = operation.catch(() => undefined);
  await operation;
  return result;
}

function fromRow(row: Record<string, unknown>): ManagedNews {
  const body = typeof row.body === 'string' ? JSON.parse(row.body) as unknown : row.body;
  return {
    id: String(row.id),
    slug: String(row.slug),
    data: String(row.publish_date).slice(0, 10),
    rotulo: String(row.label),
    titulo: String(row.title),
    texto: Array.isArray(body) ? body.map(String) : [],
    ...(row.href ? { href: String(row.href) } : {}),
    ...(row.cta ? { cta: String(row.cta) } : {}),
    status: row.status as NewsStatus,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function slugify(title: string): string {
  const base = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'novidade';
  return `${base}-${randomUUID().slice(0, 6)}`;
}

export async function listManagedNews(onlyPublished = false): Promise<ManagedNews[]> {
  if (!databaseUrl()) {
    const items = await readLocal();
    return items.filter((item) => !onlyPublished || item.status === 'PUBLISHED')
      .sort((a, b) => b.data.localeCompare(a.data));
  }
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM admin_news_posts
     WHERE ($1::boolean = false OR (status = 'PUBLISHED' AND publish_date <= CURRENT_DATE))
     ORDER BY publish_date DESC, created_at DESC`, [onlyPublished],
  );
  return rows.map(fromRow);
}

export async function createManagedNews(input: NewsInput): Promise<ManagedNews> {
  const now = new Date().toISOString();
  const item: ManagedNews = { id: randomUUID(), slug: slugify(input.titulo), ...input, createdAt: now, updatedAt: now };
  if (!databaseUrl()) return mutateLocal((items) => { items.push(item); return item; });
  const rows = await query<Record<string, unknown>>(
    `INSERT INTO admin_news_posts (id,slug,publish_date,label,title,body,href,cta,status)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9) RETURNING *`,
    [item.id, item.slug, item.data, item.rotulo, item.titulo, JSON.stringify(item.texto), item.href ?? null, item.cta ?? null, item.status],
  );
  if (!rows[0]) throw new Error('Não foi possível criar a novidade.');
  return fromRow(rows[0]);
}

export async function updateManagedNews(id: string, input: NewsInput): Promise<ManagedNews> {
  if (!databaseUrl()) return mutateLocal((items) => {
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('Novidade não encontrada.');
    const updated = { ...items[index]!, ...input, updatedAt: new Date().toISOString() };
    items[index] = updated;
    return updated;
  });
  const rows = await query<Record<string, unknown>>(
    `UPDATE admin_news_posts SET publish_date=$2,label=$3,title=$4,body=$5::jsonb,href=$6,cta=$7,status=$8,updated_at=now()
     WHERE id=$1 RETURNING *`,
    [id, input.data, input.rotulo, input.titulo, JSON.stringify(input.texto), input.href ?? null, input.cta ?? null, input.status],
  );
  if (!rows[0]) throw new Error('Novidade não encontrada.');
  return fromRow(rows[0]);
}

export async function deleteManagedNews(id: string): Promise<void> {
  if (!databaseUrl()) return mutateLocal((items) => {
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('Novidade não encontrada.');
    items.splice(index, 1);
  });
  const rows = await query<Record<string, unknown>>('DELETE FROM admin_news_posts WHERE id=$1 RETURNING id', [id]);
  if (!rows[0]) throw new Error('Novidade não encontrada.');
}
