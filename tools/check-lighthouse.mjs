/**
 * Lighthouse contra o build de produção.
 *
 * Meta do projeto: Performance, Accessibility, Best Practices e SEO >= 90 em cada rota medida.
 * Exige `npm run build` seguido de `npm run start` (ou `BASE_URL` apontando para o servidor).
 *
 *   node tools/check-lighthouse.mjs
 *   node tools/check-lighthouse.mjs --rotas=/,/about --presets=mobile
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const META = 90;

function argumento(nome, padrao) {
  const encontrado = process.argv.find((valor) => valor.startsWith(`--${nome}=`));
  return encontrado ? encontrado.slice(nome.length + 3).split(',') : padrao;
}

const rotas = argumento('rotas', ['/', '/projects/revalio', '/revalio/delete-account']);
const presets = argumento('presets', ['desktop', 'mobile']);

const trabalho = mkdtempSync(path.join(tmpdir(), 'lh-blajeen-'));
const linhas = [];
const abaixoDaMeta = [];

for (const rota of rotas) {
  for (const preset of presets) {
    const saida = path.join(trabalho, `${rota.replace(/\W+/g, '_')}-${preset}.json`);

    /*
     * No Windows o Lighthouse costuma sair com código 1 ao falhar em apagar o próprio diretório
     * temporário, mesmo tendo gravado o relatório. O que vale é o JSON existir e ser válido.
     */
    try {
      execFileSync(
        'npx',
        [
          '--yes',
          'lighthouse@latest',
          `${BASE}${rota}`,
          '--only-categories=performance,accessibility,best-practices,seo',
          // O Lighthouse só tem preset para desktop; mobile é o comportamento padrão.
          ...(preset === 'desktop' ? ['--preset=desktop'] : []),
          '--quiet',
          '--chrome-flags=--headless=new',
          '--output=json',
          `--output-path=${saida}`,
        ],
        // `shell: true` é necessário no Windows, onde `npx` é um script e não um executável.
        { stdio: ['ignore', 'ignore', 'ignore'], shell: true },
      );
    } catch {
      if (!existsSync(saida)) {
        console.error(`Lighthouse não produziu relatório para ${rota} (${preset}).`);
        process.exit(1);
      }
    }

    const relatorio = JSON.parse(readFileSync(saida, 'utf8'));
    const notas = Object.fromEntries(
      Object.entries(relatorio.categories).map(([chave, valor]) => [chave, Math.round(valor.score * 100)]),
    );

    linhas.push({ rota, preset, ...notas });

    for (const [categoria, nota] of Object.entries(notas)) {
      if (nota < META) abaixoDaMeta.push(`${rota} (${preset}) — ${categoria}: ${nota}`);
    }
  }
}

rmSync(trabalho, { recursive: true, force: true });

const cabecalho = ['rota', 'preset', 'perf', 'a11y', 'bp', 'seo'];
const largura = [34, 8, 5, 5, 5, 5];
const formatar = (valores) =>
  valores.map((valor, indice) => String(valor).padEnd(largura[indice])).join(' ');

console.log(formatar(cabecalho));
console.log(formatar(largura.map((tamanho) => '-'.repeat(tamanho - 1))));
for (const linha of linhas) {
  console.log(
    formatar([
      linha.rota,
      linha.preset,
      linha.performance,
      linha.accessibility,
      linha['best-practices'],
      linha.seo,
    ]),
  );
}

if (abaixoDaMeta.length > 0) {
  console.error(`\nAbaixo da meta de ${META}:`);
  abaixoDaMeta.forEach((item) => console.error(`  - ${item}`));
  process.exit(1);
}

console.log(`\nOK — todas as categorias >= ${META}.`);
