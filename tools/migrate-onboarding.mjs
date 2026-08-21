import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  if (process.argv.includes('--if-configured')) {
    console.log('Banco de produção não configurado; migrations ignoradas neste ambiente.');
    process.exit(0);
  }

  console.error('DATABASE_URL não configurado. Nenhuma migration foi aplicada.');
  process.exit(1);
}

const parsed = new URL(connectionString);
const endpoint = `https://${parsed.hostname}/sql`;

async function query(sql, params = []) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': connectionString,
      'Neon-Raw-Text-Output': 'true',
      'Neon-Array-Mode': 'true',
    },
    body: JSON.stringify({ query: sql, params }),
  });
  if (!response.ok) throw new Error(`Neon respondeu ${response.status}: ${await response.text()}`);
  return response.json();
}

await query(`CREATE TABLE IF NOT EXISTS blajeen_migrations (
  name text PRIMARY KEY,
  checksum char(64) NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
)`);

const directory = resolve('migrations');
const files = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort();
for (const name of files) {
  const source = await readFile(resolve(directory, name), 'utf8');
  const checksum = createHash('sha256').update(source).digest('hex');
  const existing = await query('SELECT checksum FROM blajeen_migrations WHERE name = $1', [name]);
  if (existing.rows?.length) {
    if (existing.rows[0]?.[0] !== checksum) throw new Error(`Migration já aplicada foi alterada: ${name}`);
    console.log(`já aplicada: ${name}`);
    continue;
  }
  const statements = source
    .replace(/\n\s*-- statement-breakpoint\s*\n/g, '\n')
    .split(/;\s*(?:\r?\n|$)/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
  for (const statement of statements) await query(statement);
  await query('INSERT INTO blajeen_migrations (name, checksum) VALUES ($1, $2)', [name, checksum]);
  console.log(`aplicada: ${name}`);
}
