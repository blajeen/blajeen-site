// Pôsteres da demonstração do Torrelio, gerados pela própria cena 3D (o primeiro quadro do filme).
//
// Monta a cena da torre numa página mínima servida por um Vite temporário, na pose de abertura
// (pose A) e no estado inicial: tabela de lançamento (luzes de `statusInicial`), 1803 selecionada,
// contorno desligado, noite de verão às 20h30. Captura o canvas e grava:
//
//   public/produtos/torrelio/poster-noite.webp          1600 × 900 (16:9, computador)
//   public/produtos/torrelio/poster-noite-retrato.webp   960 × 1200 (4:5, celular)
//
// Uso: node tools/torrelio-poster.mjs
// Sem GPU, o Chromium desenha com SwiftShader (lento, mas fiel). Para outro Chromium, defina
// CHROMIUM_PATH. Nada de rede: a página só carrega o código do próprio repositório.

import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { createServer } from 'vite';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destino = join(raiz, 'public/produtos/torrelio');
/** Teto de peso por pôster: o de 16:9 é o LCP da página. */
const LIMITE_KB = 150;
const QUALIDADES = [86, 82, 78, 74, 70, 66, 62];

const POSTERES = [
  { arquivo: 'poster-noite.webp', largura: 1600, altura: 900 },
  { arquivo: 'poster-noite-retrato.webp', largura: 960, altura: 1200 },
];

const pagina = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Torrelio · pôster</title>
  <link rel="icon" href="data:," />
  <style>html, body { margin: 0; height: 100%; background: #090a08; overflow: hidden; } #palco { position: fixed; inset: 0; }</style>
</head>
<body>
  <div id="palco"></div>
  <script type="module" src="./principal.ts"></script>
</body>
</html>`;

const principal = `import { criarCenaTorre } from '@/components/torrelio/3d/cena-torre';
import { estadoInicialDaTorre } from '@/components/torrelio/3d/estado-inicial';

const host = document.getElementById('palco');
criarCenaTorre(host, { movimento: true, qualidade: 'alto', estado: estadoInicialDaTorre(true), pose: 'abertura', entrada: false })
  .then((cena) => {
    window.__cena = cena;
    window.__pronto = true;
  })
  .catch((erro) => {
    window.__erro = String(erro && erro.stack ? erro.stack : erro);
  });
`;

const pasta = mkdtempSync(join(tmpdir(), 'torrelio-poster-'));
writeFileSync(join(pasta, 'index.html'), pagina);
writeFileSync(join(pasta, 'principal.ts'), principal);

const servidor = await createServer({
  configFile: false,
  root: pasta,
  logLevel: 'error',
  clearScreen: false,
  resolve: { alias: { '@': join(raiz, 'src') } },
  server: { host: '127.0.0.1', port: 5199, strictPort: false, fs: { allow: [raiz, pasta] } },
});

let navegador;
const erros = [];
try {
  await servidor.listen();
  const endereco = servidor.resolvedUrls?.local?.[0] ?? 'http://127.0.0.1:5199/';
  const executavel = process.env.CHROMIUM_PATH ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  navegador = await chromium.launch({ ...(executavel ? { executablePath: executavel } : {}), args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  mkdirSync(destino, { recursive: true });

  for (const poster of POSTERES) {
    const aba = await navegador.newPage({ viewport: { width: poster.largura, height: poster.altura }, deviceScaleFactor: 1 });
    aba.on('pageerror', (e) => erros.push(`${poster.arquivo}: ${e.message}`));
    aba.on('console', (m) => {
      if (m.type() === 'error') erros.push(`${poster.arquivo}: ${m.text()}`);
    });
    await aba.goto(endereco, { waitUntil: 'load' });
    await aba.waitForFunction(() => window.__pronto || window.__erro, null, { timeout: 600_000 });
    const erro = await aba.evaluate(() => window.__erro);
    if (erro) throw new Error(`A cena não abriu: ${erro}`);
    // Um quadro novo depois de tudo assentado, e o canvas no tamanho exato do pôster.
    await aba.evaluate(() => window.__cena.interno.desenhar());
    await aba.waitForTimeout(300);
    const tamanho = await aba.evaluate(() => {
      const c = document.querySelector('#palco canvas');
      return { largura: c.width, altura: c.height };
    });
    if (tamanho.largura !== poster.largura || tamanho.altura !== poster.altura) {
      throw new Error(`Canvas de ${tamanho.largura}×${tamanho.altura}, esperado ${poster.largura}×${poster.altura}.`);
    }
    const png = await aba.locator('#palco canvas').screenshot({ type: 'png' });
    await aba.close();

    let gravado = null;
    for (const quality of QUALIDADES) {
      const webp = await sharp(png).resize(poster.largura, poster.altura).webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
      gravado = { webp, quality };
      if (webp.length <= LIMITE_KB * 1024) break;
    }
    const caminho = join(destino, poster.arquivo);
    writeFileSync(caminho, gravado.webp);
    console.log(`${poster.arquivo}: ${poster.largura}×${poster.altura}, qualidade ${gravado.quality}, ${(statSync(caminho).size / 1024).toFixed(1)} KB`);
  }
  if (erros.length) throw new Error(`Erros no console da cena:\n${erros.join('\n')}`);
} finally {
  await navegador?.close();
  await servidor.close();
  rmSync(pasta, { recursive: true, force: true });
}
