// Copia do Morvelio para o site (o deploy na Vercel não enxerga o repositório do jogo):
// - src/lib/analytics/quest-titles.json: títulos PT das quests (quest.<id>.title);
// - src/lib/analytics/main-quests.json: as quests principais na ordem do catálogo (MvlCampaignQuestCatalogData.cs,
//   só optional == false). O número não é a ordem: J68/J69 são opcionais entre J27 e J28, J70 é a última principal.
// Mesma regra de main_journey() em Tools/telemetria/funil_saves.py.
// Uso: node tools/copiar-titulos-quests.mjs [pasta do repositório do jogo, padrão C:/dev/morvelio]
// Rode de novo quando o jogo ganhar, renomear ou reordenar quests e commite os dois JSON.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';

const repo = process.argv[2] ?? 'C:/dev/morvelio';
const game = join(repo, 'Assets', 'Morvelio');
const dir = join(game, 'Localization', 'Resources', 'MvlLocalization');
const titles = {};
for (const name of (await readdir(dir)).filter((n) => n.startsWith('quests_') && n.endsWith('.json')).sort()) {
  const file = JSON.parse((await readFile(join(dir, name), 'utf8')).replace(/^\uFEFF/, ''));
  for (const e of Array.isArray(file) ? file : file.entries ?? []) {
    const m = /^quest\.(.+)\.title$/.exec(e.key ?? '');
    if (m) titles[m[1]] = e.ptBR ?? '';
  }
}

// Constantes como MvlSeaCove.Quest = "J70", usadas no catálogo no lugar do id literal.
const consts = {};
for (const entry of await readdir(game, { recursive: true, withFileTypes: true })) {
  const path = join(entry.parentPath, entry.name);
  if (!entry.isFile() || !entry.name.endsWith('.cs') || path.includes(`${sep}Tests`)) continue;
  for (const [, c, v] of (await readFile(path, 'utf8')).matchAll(/(\w+)\s*=\s*"(J\d+)"/g)) consts[`${entry.name.slice(0, -3)}.${c}`] = v;
}
const catalog = await readFile(join(game, 'UI', 'Runtime', 'Campaign', 'MvlCampaignQuestCatalogData.cs'), 'utf8');
const main = [];
for (const [, ident, optional] of catalog.matchAll(/new MvlCampaignQuestDefinition\(\s*("J\d+"|[\w.]+)\s*,.*?new string\[\][^}]*\}\s*,\s*(true|false)/gs)) {
  const id = ident.startsWith('"') ? ident.slice(1, -1) : consts[ident];
  if (id && /^J\d+$/.test(id) && optional === 'false' && !main.includes(id)) main.push(id);
}
if (!main.length) throw new Error('Nenhuma quest principal encontrada no catálogo: o formato do arquivo mudou?');

const out = (name) => new URL(`../src/lib/analytics/${name}`, import.meta.url);
await writeFile(out('quest-titles.json'), `${JSON.stringify(Object.fromEntries(Object.entries(titles).sort()), null, 1)}\n`);
await writeFile(out('main-quests.json'), `${JSON.stringify(main)}\n`);
console.log(`${Object.keys(titles).length} títulos e ${main.length} quests principais (${main[0]} … ${main.at(-1)}) copiados de ${game}`);
