import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'social', 'instagram', 'campanha-apresentacao');
const SOURCES = path.join(OUT, 'sources');
const WIDTH = 1080;
const HEIGHT = 1350;

const COLORS = {
  paper: '#F0F0E8',
  muted: '#B8BBAF',
  green: '#C9FF3D',
  blue: '#8BDDFF',
  ink: '#090A08',
  line: 'rgba(231,231,223,0.22)',
};

const asset = (...parts) => path.join(ROOT, 'public', ...parts);
const source = (name) => path.join(SOURCES, name);
const output = (name) => path.join(OUT, name);

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function lines(items, x, y, size, lineHeight, color = COLORS.paper, weight = 700) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="-2.5">${items
    .map((item, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(item)}</tspan>`)
    .join('')}</text>`;
}

function smallLabel(text, x, y, color = COLORS.green) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Consolas, monospace" font-size="22" font-weight="600" letter-spacing="4">${escapeXml(text.toUpperCase())}</text>`;
}

function pill(text, x, y, width, color = COLORS.green) {
  return `<g><rect x="${x}" y="${y}" width="${width}" height="54" rx="27" fill="rgba(9,10,8,0.72)" stroke="${color}" stroke-width="1.5"/><text x="${x + width / 2}" y="${y + 35}" text-anchor="middle" fill="${color}" font-family="Consolas, monospace" font-size="18" letter-spacing="2.5">${escapeXml(text)}</text></g>`;
}

function commonOverlay({ eyebrow, title, titleY = 220, accent = COLORS.green, subtitle = '', footer = 'BLAJEEN LABS / ENGENHARIA DE SOFTWARE APLICADA', extra = '' }) {
  return Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#050605" stop-opacity="0.94"/>
          <stop offset="0.55" stop-color="#050605" stop-opacity="0.34"/>
          <stop offset="1" stop-color="#050605" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#050605" stop-opacity="0"/>
          <stop offset="0.4" stop-color="#050605" stop-opacity="0.48"/>
          <stop offset="1" stop-color="#050605" stop-opacity="0.94"/>
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="510" fill="url(#top)"/>
      <rect y="900" width="${WIDTH}" height="450" fill="url(#bottom)"/>
      <rect x="56" y="54" width="76" height="4" rx="2" fill="${accent}"/>
      ${smallLabel(eyebrow, 56, 102, accent)}
      ${lines(title, 56, titleY, 78, 78, COLORS.paper, 760)}
      ${extra}
      ${subtitle ? `<text x="58" y="${titleY + title.length * 78 + 40}" fill="${COLORS.muted}" font-family="Segoe UI, Arial, sans-serif" font-size="27" font-weight="450">${escapeXml(subtitle)}</text>` : ''}
      <line x1="56" y1="1262" x2="1024" y2="1262" stroke="${COLORS.line}"/>
      ${smallLabel(footer, 56, 1308, COLORS.muted)}
      <circle cx="1008" cy="1300" r="6" fill="${accent}"/>
    </svg>
  `);
}

async function roundedImage(input, width, height, radius = 24, position = 'centre') {
  const mask = Buffer.from(`<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" fill="white"/></svg>`);
  return sharp(input)
    .resize(width, height, { fit: 'cover', position })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function logo(input, width, height) {
  return sharp(input).resize(width, height, { fit: 'contain', withoutEnlargement: true }).png().toBuffer();
}

async function logoPlate(input, width, height, radius = 20) {
  const mark = await sharp(input).resize(width - 24, height - 24, { fit: 'contain' }).png().toBuffer();
  const mask = Buffer.from(`<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" fill="white"/></svg>`);
  return sharp({ create: { width, height, channels: 4, background: { r: 5, g: 6, b: 5, alpha: 0.92 } } })
    .composite([{ input: mark, gravity: 'centre' }, { input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function base(name) {
  return sharp(source(name)).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' });
}

async function buildIntro() {
  const crest = await logo(asset('brand', 'blajeen-crest-mechanical-slime.png'), 170, 170);
  const overlay = commonOverlay({
    eyebrow: 'BLAJEEN LABS / APRESENTAÇÃO',
    title: ['IDEIAS VIRAM', 'PRODUTOS.'],
    titleY: 240,
    subtitle: 'Sites • aplicativos • sistemas • jogos',
    extra: `${pill('ESTÚDIO INDEPENDENTE', 56, 1110, 330)}${pill('PRODUTO + ENGENHARIA', 402, 1110, 350, COLORS.blue)}`,
  });
  await (await base('01-intro-base.png'))
    .composite([{ input: overlay }, { input: crest, left: 854, top: 52 }])
    .png({ compressionLevel: 9 })
    .toFile(output('01-intro-blajeen-labs.png'));
}

async function buildRevalio() {
  const icon = await logo(asset('projects', 'revalio', 'revalio-icon-512.png'), 158, 158);
  const overlay = commonOverlay({
    eyebrow: 'LANÇAMENTO / EXPERIMENTO 01',
    title: ['REVALIO', 'CHEGOU.'],
    titleY: 236,
    accent: COLORS.blue,
    subtitle: 'Pesquisa, mercado e necessidade viraram produto.',
    extra: `<rect x="46" y="386" width="838" height="72" rx="18" fill="rgba(5,6,5,0.66)"/>${pill('APP STORE', 56, 1110, 220, COLORS.blue)}${pill('GOOGLE PLAY', 294, 1110, 248, COLORS.green)}`,
  });
  await (await base('02-revalio-base.png'))
    .composite([{ input: overlay }, { input: icon, left: 866, top: 58 }])
    .png({ compressionLevel: 9 })
    .toFile(output('02-lancamento-revalio.png'));
}

async function buildProducts() {
  const inputs = [
    ['projects', 'barbearia', 'screenshots-padronizados', '01-site-institucional.png'],
    ['projects', 'personal-studio', 'screenshots-v2', '07-gestor-alunos.png'],
    ['projects', 'salao-estetica', 'screenshots', '01-inicio.png'],
    ['projects', 'ecommerce', 'screenshots', '01-vitrine.png'],
  ];
  const screens = await Promise.all(inputs.map((parts) => roundedImage(asset(...parts), 430, 230, 22, 'top')));
  const borderOverlay = Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="rgba(0,0,0,0.27)"/>
    ${[[70,420],[580,420],[70,690],[580,690]].map(([x,y]) => `<rect x="${x-3}" y="${y-3}" width="436" height="236" rx="25" fill="none" stroke="rgba(201,255,61,0.46)" stroke-width="3"/>`).join('')}
  </svg>`);
  const overlay = commonOverlay({
    eyebrow: 'PRODUTOS / DEMONSTRAÇÕES DISPONÍVEIS',
    title: ['TECNOLOGIA PARA', 'NEGÓCIOS REAIS.'],
    titleY: 200,
    subtitle: 'Bases funcionais adaptadas à identidade de cada operação.',
    extra: `${pill('BARBEARIAS', 56, 1088, 226)}${pill('PERSONAL', 296, 1088, 190, COLORS.blue)}${pill('BEAUTY', 500, 1088, 176)}${pill('E-COMMERCE', 690, 1088, 242, COLORS.blue)}`,
  });
  await (await base('03-produtos-base.png'))
    .composite([
      { input: borderOverlay },
      { input: screens[0], left: 70, top: 420 },
      { input: screens[1], left: 580, top: 420 },
      { input: screens[2], left: 70, top: 690 },
      { input: screens[3], left: 580, top: 690 },
      { input: overlay },
    ])
    .png({ compressionLevel: 9 })
    .toFile(output('03-produtos-blajeen-labs.png'));
}

async function buildLina() {
  const linaLogo = await logoPlate(asset('trabalhos', 'lina-art-pet', 'logo.webp'), 250, 180);
  const overlay = commonOverlay({
    eyebrow: 'TRABALHO 01 / CLIENTE',
    title: ['PRIMEIRO PROJETO.', 'PRIMEIRO CLIENTE.'],
    titleY: 200,
    subtitle: 'Lina Art Pet — da fotografia à miniatura 3D.',
    extra: pill('SITE + PERSONALIZAÇÃO', 56, 1110, 330),
  });
  await (await base('04-lina-base.png'))
    .composite([{ input: overlay }, { input: linaLogo, left: 780, top: 42 }])
    .png({ compressionLevel: 9 })
    .toFile(output('04-lina-art-pet.png'));
}

async function buildDomGuima() {
  const domLogo = await logoPlate(asset('trabalhos', 'dom-guima', 'logo.png'), 245, 150);
  const overlay = commonOverlay({
    eyebrow: 'TRABALHO 02 / CLIENTE',
    title: ['E-COMMERCE.', 'OPERAÇÃO COMPLETA.'],
    titleY: 200,
    accent: '#E2B94E',
    subtitle: 'Dom Guima — e-commerce com painel personalizado.',
    extra: `<rect x="26" y="345" width="318" height="300" rx="28" fill="rgba(5,8,12,0.94)" stroke="rgba(226,185,78,0.28)"/>${pill('CATÁLOGO + VENDAS', 56, 1096, 292, '#E2B94E')}${pill('PRODUTOS + ESTOQUE', 364, 1096, 320, COLORS.green)}`,
  });
  await (await base('05-domguima-base.png'))
    .composite([{ input: overlay }, { input: domLogo, left: 62, top: 418 }])
    .png({ compressionLevel: 9 })
    .toFile(output('05-dom-guima.png'));
}

async function buildGames() {
  const docalio = await logo(asset('projects', 'docalio', 'docalio-icon-512.png'), 128, 128);
  const gramelio = await logo(asset('projects', 'gramelio', 'gramelio-icon-512.png'), 128, 128);
  const overlay = commonOverlay({
    eyebrow: 'O LABORATÓRIO NÃO PARA',
    title: ['NOVOS JOGOS', 'EM DESENVOLVIMENTO.'],
    titleY: 195,
    subtitle: 'Docalio e Gramelio continuam ganhando forma.',
    extra: `${pill('DOCALIO', 342, 1102, 200, COLORS.blue)}${pill('GRAMELIO', 558, 1102, 218, COLORS.green)}`,
  });
  await (await base('06-jogos-base.png'))
    .composite([
      { input: Buffer.from(`<svg width="${WIDTH}" height="${HEIGHT}"><rect width="${WIDTH}" height="430" fill="rgba(5,6,5,0.76)"/></svg>`) },
      { input: overlay },
      { input: docalio, left: 196, top: 1064 },
      { input: gramelio, left: 790, top: 1064 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(output('06-jogos-em-desenvolvimento.png'));
}

await Promise.all([
  buildIntro(),
  buildRevalio(),
  buildProducts(),
  buildLina(),
  buildDomGuima(),
  buildGames(),
]);

const finais = [
  '01-intro-blajeen-labs.png',
  '02-lancamento-revalio.png',
  '03-produtos-blajeen-labs.png',
  '04-lina-art-pet.png',
  '05-dom-guima.png',
  '06-jogos-em-desenvolvimento.png',
];
const miniaturas = await Promise.all(
  finais.map((nome) => sharp(output(nome)).resize(360, 450, { fit: 'cover' }).jpeg({ quality: 88 }).toBuffer()),
);
await sharp({ create: { width: 1120, height: 920, channels: 3, background: '#090A08' } })
  .composite(
    miniaturas.map((input, indice) => ({
      input,
      left: (indice % 3) * 380,
      top: Math.floor(indice / 3) * 470,
    })),
  )
  .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
  .toFile(output('PREVIA-6-POSTS.jpg'));

console.log(`Campanha criada em ${OUT}`);
