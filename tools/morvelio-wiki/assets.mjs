import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const tasks = JSON.parse(await readFile('docs/morvelio-wiki/ASSETS_IMPORTACAO.json', 'utf8'));
const dataPath = 'src/content/morvelio/wiki/data.json';
const data = JSON.parse(await readFile(dataPath, 'utf8'));
for (const task of tasks) {
  const output = path.join(root, 'public', task.output);
  await mkdir(path.dirname(output), { recursive: true });
  const [srcStat, dstStat] = await Promise.all([stat(task.source), stat(output).catch(() => null)]);
  const result = dstStat && dstStat.mtimeMs >= srcStat.mtimeMs ? await sharp(output).metadata() : await sharp(task.source, task.source.endsWith('.svg') ? { density: 144 } : {}).resize({ width: task.width, withoutEnlargement: true }).webp({ quality: 86 }).toFile(output);
  const entry = data.records.find(e => e.id === task.entity);
  entry.image.width = result.width; entry.image.height = result.height;
}
const manifest = JSON.parse(await readFile('docs/morvelio-wiki/FONTES_DESKTOP.json', 'utf8'));
const icon = path.join(manifest.sourceRoot, 'Divulgação/Nova identidade - Orbe/02B_ICONE_MORVELIO_MONTANHA_TOON_v02_COM_NOME.png');
await sharp(icon).resize(512,512).webp({quality:90}).toFile('public/projects/morvelio/morvelio-icon-montanha-nome-v04.webp');
await writeFile(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`${tasks.length} imagens web e ícone atual exportados; originais preservados.`);
