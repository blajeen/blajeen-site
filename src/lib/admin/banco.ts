import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * Acesso ao banco do painel comercial (pedidos, contratos e catálogo).
 *
 * Neon por HTTP quando há `DATABASE_URL` — mesmo protocolo de `src/lib/news/repository.ts`. Sem
 * banco, só o desenvolvimento usa arquivos em `.data/`; produção recusa operar, porque dados de
 * clientes não podem viver no disco efêmero da hospedagem.
 */

export function bancoConfigurado(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function exigirBancoEmProducao(): void {
  if (!bancoConfigurado() && process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL não configurado para o painel.');
  }
}

type NeonResult = { fields?: Array<{ name: string }>; rows?: unknown[][] };

export async function consultar<T extends Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const connection = process.env.DATABASE_URL?.trim();
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

/** Arquivo JSON local com fila de escrita atômica, só para desenvolvimento. */
export function arquivoLocal<T>(nome: string, vazio: () => T) {
  const caminho = resolve(process.cwd(), '.data', nome);
  let fila = Promise.resolve();

  async function ler(): Promise<T> {
    try {
      return { ...vazio(), ...(JSON.parse(await readFile(caminho, 'utf8')) as T) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return vazio();
      throw error;
    }
  }

  async function alterar<R>(alteracao: (estado: T) => R): Promise<R> {
    let resultado!: R;
    const operacao = fila.then(async () => {
      const estado = await ler();
      resultado = alteracao(estado);
      await mkdir(dirname(caminho), { recursive: true });
      const temporario = `${caminho}.${randomUUID()}.tmp`;
      await writeFile(temporario, `${JSON.stringify(estado, null, 2)}\n`, 'utf8');
      await rename(temporario, caminho);
    });
    fila = operacao.catch(() => undefined);
    await operacao;
    return resultado;
  }

  return { ler, alterar };
}

/**
 * O Neon devolve `timestamptz` no formato do Postgres ("2026-09-30 17:46:50.25+00"), que o Safari
 * não interpreta. Tudo que sai do banco vira ISO 8601 antes de chegar à interface.
 */
export function iso(valor: unknown): string {
  if (valor instanceof Date) return valor.toISOString();
  const texto = String(valor);
  const postgres = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}(?:\.\d+)?)([+-]\d{2})(?::?(\d{2}))?$/.exec(texto);
  if (!postgres) return texto;
  const data = new Date(`${postgres[1]}T${postgres[2]}${postgres[3]}:${postgres[4] ?? '00'}`);
  return Number.isNaN(data.getTime()) ? texto : data.toISOString();
}

export function isoOuNulo(valor: unknown): string | null {
  return valor === null || valor === undefined ? null : iso(valor);
}
