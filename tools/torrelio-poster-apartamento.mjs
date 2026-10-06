/**
 * Gera os pôsteres da maquete do apartamento (Torrelio) a partir da própria cena, na pose de
 * abertura (maquete, dia de equinócio às 15h, como a seção abre): 1600×900 e 2560×1440 (2×) para
 * o palco 16:9, e 1080×1350 para o palco 4:5 do celular (cobre 3×). O pôster é o primeiro quadro
 * do filme: a cena entra exatamente nesta pose quando a pessoa pede a maquete.
 *
 * Uso: node tools/torrelio-poster-apartamento.mjs [URL da página]
 *   URL padrão: http://127.0.0.1:3000/produtos/torrelio (o `next dev` ligado).
 *   CHROMIUM=/caminho/do/chromium para usar um Chromium já instalado.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';

const URL = process.argv[2] ?? 'http://127.0.0.1:3000/produtos/torrelio';
const SAIDA = 'public/produtos/torrelio';
/** Cada captura sai numa densidade que cobre o maior arquivo dela, e daí reduz. */
const VARIANTES = [
  {
    viewport: { width: 1440, height: 900 },
    escala: 2.6,
    arquivos: [
      { nome: 'poster-apartamento@2x.webp', largura: 2560, altura: 1440 },
      { nome: 'poster-apartamento.webp', largura: 1600, altura: 900 },
    ],
  },
  { viewport: { width: 390, height: 844 }, escala: 3.1, arquivos: [{ nome: 'poster-apartamento-retrato.webp', largura: 1080, altura: 1350 }] },
];

const browser = await chromium.launch({
  args: ['--enable-unsafe-swiftshader'],
  ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}),
});
try {
  for (const v of VARIANTES) {
    const page = await browser.newPage({ viewport: v.viewport, deviceScaleFactor: v.escala, reducedMotion: 'reduce' });
    const erros = [];
    page.on('pageerror', (e) => erros.push(e.message));
    await page.addInitScript((dpr) => {
      window.__dprDaMaquete = dpr;
    }, v.escala);
    await page.goto(URL, { waitUntil: 'load', timeout: 180_000 });
    const palco = page.getByTestId('palco-do-apartamento');
    await palco.scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: /Abrir a maquete do apartamento/ }).click();
    await page.waitForFunction(
      () => Number(document.querySelector('[data-testid="palco-do-apartamento"] [data-quadros]')?.getAttribute('data-quadros') ?? 0) > 0,
      null,
      { timeout: 180_000 },
    );
    // Só a cena: rótulos, seta, legenda e avisos ficam de fora do pôster.
    await page.addStyleTag({
      content: `[data-testid="palco-do-apartamento"] > *:not(:has(> canvas)) { visibility: hidden !important; }
        [data-testid="palco-do-apartamento"] { border-radius: 0 !important; border-color: transparent !important; }`,
    });
    await page.waitForTimeout(2500);
    const imagem = await palco.locator('canvas').locator('xpath=..').screenshot();
    for (const a of v.arquivos) {
      const info = await sharp(imagem)
        .resize(a.largura, a.altura, { fit: 'cover', position: 'centre' })
        .webp({ quality: 82, effort: 6 })
        .toFile(`${SAIDA}/${a.nome}`);
      console.log(`${a.nome}: ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
    }
    if (erros.length) throw new Error(`Erros na página: ${erros.join(' | ')}`);
    await page.close();
  }
} finally {
  await browser.close();
}
