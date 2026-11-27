// Copia os títulos PT das quests do Morvelio para o site (o deploy na Vercel não enxerga o repositório do jogo).
// Uso: node tools/copiar-titulos-quests.mjs [pasta do repositório do jogo, padrão C:/dev/morvelio]
// Rode de novo quando o jogo ganhar ou renomear quests e commite src/lib/analytics/quest-titles.json.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const repo = process.argv[2] ?? 'C:/dev/morvelio';
const dir = join(repo, 'Assets', 'Morvelio', 'Localization', 'Resources', 'MvlLocalization');
const titles = {};
for (const name of (await readdir(dir)).filter((n) => n.startsWith('quests_') && n.endsWith('.json')).sort()) {
  const file = JSON.parse((await readFile(join(dir, name), 'utf8')).replace(/^\uFEFF/, ''));
  for (const e of Array.isArray(file) ? file : file.entries ?? []) {
    const m = /^quest\.(.+)\.title$/.exec(e.key ?? '');
    if (m) titles[m[1]] = e.ptBR ?? '';
  }
}
const out = new URL('../src/lib/analytics/quest-titles.json', import.meta.url);
await writeFile(out, `${JSON.stringify(Object.fromEntries(Object.entries(titles).sort()), null, 1)}\n`);
console.log(`${Object.keys(titles).length} títulos copiados de ${dir}`);
