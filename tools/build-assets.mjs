/**
 * Geração dos assets derivados: ícones do manifest e imagens Open Graph.
 *
 * Regras que este script respeita, de `docs/ASSETS_APROVADOS.md` e `docs/PLANO_MESTRE_DO_SITE.md`:
 * - os PNGs 1672×941 são os mestres e não são reeditados;
 * - a arte entra inteira no quadro 1200×630 (`fit: contain`), então nem o título do jogo nem a
 *   assinatura Blajeen Labs são cortados;
 * - nenhum texto editorial é escrito por cima das artes;
 * - o OG do estúdio usa a logo viva, renderizada com a fonte auto-hospedada do próprio site.
 *
 *   node tools/build-assets.mjs
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const RAIZ = process.cwd();
const PUBLICO = path.join(RAIZ, 'public');
const OG = path.join(PUBLICO, 'og');
const INK = '#090a08';

await mkdir(OG, { recursive: true });

// ------------------------------------------------------------------ ícones

/*
 * O ícone do site é a cabeça do mascote, com o olho aceso — decisão do titular em 17/08/2026,
 * no lugar da síntese geométrica dos dois `E`. A arte chega com transparência real e quase
 * quadrada; aqui ela é recortada no conteúdo e centrada num quadrado, para não distorcer.
 */
const arteDoIcone = path.join(RAIZ, 'Icones', 'icone-site-blajeen.png');
const conteudoDoIcone = await sharp(arteDoIcone).trim({ threshold: 8 }).png().toBuffer();
const medidaDoIcone = await sharp(conteudoDoIcone).metadata();
const ladoDoIcone = Math.max(medidaDoIcone.width, medidaDoIcone.height);

const iconeQuadrado = await sharp({
  create: {
    width: ladoDoIcone,
    height: ladoDoIcone,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: conteudoDoIcone, gravity: 'center' }])
  .png()
  .toBuffer();

for (const tamanho of [32, 192, 512]) {
  await sharp(iconeQuadrado)
    .resize(tamanho, tamanho, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLICO, `icon-${tamanho}.png`));
  console.log(`icon-${tamanho}.png`);
}

// Maskable: o conteúdo precisa caber no círculo interno, então entra com folga e fundo sólido.
const miolo = await sharp(iconeQuadrado)
  .resize(330, 330, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({
  create: { width: 512, height: 512, channels: 4, background: INK },
})
  .composite([{ input: miolo, gravity: 'center' }])
  .png()
  .toFile(path.join(PUBLICO, 'icon-maskable-512.png'));
console.log('icon-maskable-512.png');

// ------------------------------------------------------------------ mascote

/**
 * O mascote chega como PNG opaco, com o xadrez de transparência pintado nos pixels.
 *
 * O recorte é feito por preenchimento a partir das bordas: só vira transparente o fundo claro e
 * neutro conectado à moldura. Uma chave de cor global comeria os brilhos especulares do metal.
 * Depois as duas poses são normalizadas na mesma caixa, alinhadas pelo pé, para que a troca entre
 * elas leia como piscada e não como salto.
 */
async function recortarFundo(origem) {
  const { data, info } = await sharp(origem).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const eFundo = (indice) => {
    const r = data[indice];
    const g = data[indice + 1];
    const b = data[indice + 2];
    const menor = Math.min(r, g, b);
    const maior = Math.max(r, g, b);
    // Claro e neutro: o xadrez fica entre 240 e 255 e não tem cor.
    return menor > 232 && maior - menor < 14;
  };

  const transparente = new Uint8Array(width * height);
  const fila = [];

  for (let x = 0; x < width; x += 1) {
    fila.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y += 1) {
    fila.push([0, y], [width - 1, y]);
  }

  while (fila.length > 0) {
    const [x, y] = fila.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const posicao = y * width + x;
    if (transparente[posicao]) continue;
    if (!eFundo(posicao * channels)) continue;
    transparente[posicao] = 1;
    fila.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  for (let posicao = 0; posicao < width * height; posicao += 1) {
    if (transparente[posicao]) data[posicao * channels + 3] = 0;
  }

  return sharp(data, { raw: { width, height, channels } })
    .png()
    .toBuffer();
}

async function caixaOpaca(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * channels + 3] > 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

const POSES = [
  { origem: 'blajeen-site-dinorobo-mascote-v1.png', destino: 'dinorobo-olhos-abertos.png' },
  { origem: 'blajeen-site-dinorobo-closed-eyes-mascote-v1.png', destino: 'dinorobo-olhos-fechados.png' },
];

const recortadas = [];
for (const pose of POSES) {
  const recortada = await recortarFundo(path.join(RAIZ, 'Icones', pose.origem));
  const caixa = await caixaOpaca(recortada);
  const conteudo = await sharp(recortada).extract(caixa).png().toBuffer();
  recortadas.push({ destino: pose.destino, buffer: conteudo, caixa });
  console.log(`mascote recortado: ${pose.destino} — conteúdo ${caixa.width}x${caixa.height}`);
}

// Caixa comum: as duas poses entram na mesma moldura, apoiadas na mesma linha do chão.
const ALTURA_MASCOTE = 900;
const escaladas = await Promise.all(
  recortadas.map(async (pose) => ({
    ...pose,
    imagem: await sharp(pose.buffer)
      .resize({ height: ALTURA_MASCOTE, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer({ resolveWithObject: true }),
  })),
);

const larguraComum = Math.max(...escaladas.map((pose) => pose.imagem.info.width));

for (const pose of escaladas) {
  await sharp({
    create: {
      width: larguraComum,
      height: ALTURA_MASCOTE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: pose.imagem.data, gravity: 'south' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLICO, 'brand', pose.destino));
  console.log(`brand/${pose.destino} — ${larguraComum}x${ALTURA_MASCOTE}`);
}

// -------------------------------------------------------- Open Graph: jogos

const banners = [
  { origem: 'projects/revalio/revalio-banner-final.png', destino: 'revalio.png' },
  { origem: 'projects/docalio/docalio-banner-final.png', destino: 'docalio.png' },
  // A arte do Gramelio é 3:2, não 16:9 como as outras duas; `contain` cuida da diferença.
  { origem: 'projects/gramelio/gramelio-banner-final.png', destino: 'gramelio.png' },
];

for (const banner of banners) {
  await sharp(path.join(PUBLICO, banner.origem))
    // `contain` preserva a composição inteira: a arte 1672×941 entra completa no quadro.
    .resize(1200, 630, { fit: 'contain', background: INK })
    .png({ quality: 92 })
    .toFile(path.join(OG, banner.destino));
  console.log(`og/${banner.destino}`);
}

// ------------------------------------------------------ Open Graph: estúdio

const fonte = await readFile(path.join(RAIZ, 'src/assets/fonts/inter-latin-variable.woff2'));
const fonteBase64 = fonte.toString('base64');

const CAIXA = { largura: 570, altura: 730 };
const HASTE = 115;
const BARRA = { largura: 450, altura: 105 };
const MEIO = { largura: 430, y: 313, altura: 105 };
const PUPILA = { cx: HASTE + (BARRA.largura - HASTE) / 2, cy: (BARRA.altura + MEIO.y) / 2, r: 52 };

const olho = `
<svg class="olho" viewBox="0 0 ${CAIXA.largura} ${CAIXA.altura}">
  <g fill="currentColor">
    <rect x="0" y="0" width="${HASTE}" height="${CAIXA.altura}"/>
    <rect x="0" y="0" width="${BARRA.largura}" height="${BARRA.altura}"/>
    <rect x="0" y="${MEIO.y}" width="${MEIO.largura}" height="${MEIO.altura}"/>
    <rect x="0" y="${CAIXA.altura - BARRA.altura}" width="${BARRA.largura}" height="${BARRA.altura}"/>
  </g>
  <circle cx="${PUPILA.cx}" cy="${PUPILA.cy}" r="${PUPILA.r}" fill="#c9ff3d"/>
  <circle cx="${PUPILA.cx - 18}" cy="${PUPILA.cy - 18}" r="12" fill="#e6ff9a" opacity=".55"/>
</svg>`;

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${fonteBase64}) format('woff2');font-weight:100 900;font-display:block}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${INK};color:#e7e7df;font-family:Inter,sans-serif;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;overflow:hidden}
body::before{content:"";position:absolute;inset:0;
  background-image:linear-gradient(rgba(231,231,223,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(231,231,223,.05) 1px,transparent 1px);
  background-size:100% 25%,25% 100%}
.marca{position:relative;font-size:150px}
.linha{position:relative;padding-bottom:.11em}
.letras{position:relative;z-index:2;display:flex;align-items:baseline;justify-content:center;
  font-weight:600;line-height:.7;letter-spacing:-.045em;white-space:nowrap}
.olho{display:block;height:1cap;width:calc(1cap * 57 / 73);margin-inline:.014em -.03em;flex:none}
.gosma{position:absolute;z-index:1;left:1%;right:1%;top:calc(1cap - .012em);height:.09em;
  filter:drop-shadow(0 .01em .014em rgba(0,0,0,.8)) drop-shadow(0 .004em .024em rgba(140,200,30,.2))}
.corpo{position:absolute;inset:0 0 auto;height:.058em;
  background:linear-gradient(180deg,#eeffae 0%,#cffb55 22%,#a9e526 48%,#6d9a12 82%,#47660a 100%);
  border-radius:.034em .034em .014em .014em/.018em .018em .034em .034em;
  clip-path:polygon(0 0,100% 0,100% 52%,93% 96%,85% 58%,76% 100%,66% 62%,56% 92%,46% 44%,36% 88%,26% 54%,16% 100%,8% 62%,0 84%)}
.brilho{position:absolute;left:4%;right:4%;top:.007em;height:.009em;border-radius:50%;
  background:linear-gradient(90deg,transparent,rgba(250,255,226,.82) 18%,rgba(250,255,226,.5) 54%,rgba(250,255,226,.78) 82%,transparent)}
.pingo{position:absolute;top:.042em;width:.034em;border-radius:0 0 40% 40%;
  background:linear-gradient(180deg,#c2f43a 0%,#a9e024 45%,#7cae13 100%)}
.pingo::after{content:"";position:absolute;left:50%;bottom:-.009em;width:.034em;height:.034em;border-radius:50%;
  background:radial-gradient(circle at 34% 30%,#e2ff8c 0%,#a9e024 46%,#6f9c11 100%);transform:translateX(-50%)}
.pingo:nth-of-type(1){left:13%;height:.018em}
.pingo:nth-of-type(2){left:37%;height:.044em}
.pingo:nth-of-type(3){left:62%;height:.014em}
.pingo:nth-of-type(4){left:84%;height:.031em}
.labs{display:flex;align-items:center;gap:22px;margin:.19em auto 0;width:58%}
.labs span{flex:1;height:1px;background:rgba(231,231,223,.16)}
.labs strong{font-weight:500;font-size:.075em;letter-spacing:.62em;text-indent:.62em}
.assinatura{position:relative;margin-top:64px;font-size:24px;letter-spacing:-.01em;color:#9a9d93}
</style></head>
<body>
  <div class="marca">
    <div class="linha">
      <div class="letras"><span>BLAJ</span>${olho}${olho}<span>N</span></div>
      <div class="gosma">
        <div class="corpo"></div><div class="brilho"></div>
        <i class="pingo"></i><i class="pingo"></i><i class="pingo"></i><i class="pingo"></i>
      </div>
    </div>
    <div class="labs"><span></span><strong>LABS</strong><span></span></div>
  </div>
  <p class="assinatura">Build strange things. Make them matter.</p>
</body></html>`;

const temporario = path.join(OG, '_estudio.html');
await writeFile(temporario, html, 'utf8');

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await pagina.goto(`file://${temporario.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await pagina.evaluate(() => document.fonts.ready);
await pagina.waitForTimeout(200);
await pagina.screenshot({ path: path.join(OG, 'blajeen-labs.png') });
await navegador.close();
console.log('og/blajeen-labs.png');

await writeFile(temporario, '', 'utf8');
const { rm } = await import('node:fs/promises');
await rm(temporario, { force: true });
