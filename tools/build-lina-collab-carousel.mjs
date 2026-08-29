import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'social', 'instagram', 'lina-art-pet-colab-v2');
const SCREENS = path.join(OUT, 'screens');
const BACKGROUNDS = path.join(OUT, 'backgrounds');
const PETS = path.join(ROOT, 'public', 'trabalhos', 'lina-art-pet');
const W = 1080;
const H = 1350;

const xml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const svg = (content) => Buffer.from(`
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${content}
  </svg>
`);

function label(value, x, y, color = '#8f5b56', size = 16) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Consolas, monospace" font-size="${size}" font-weight="700" letter-spacing="3">${xml(value.toUpperCase())}</text>`;
}

function heading(lines, x, y, size = 66, lineHeight = 66) {
  return `<text x="${x}" y="${y}" fill="#302526" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="780" letter-spacing="-2.5">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${xml(line)}</tspan>`).join('')}</text>`;
}

async function rounded(input, width, height, radius, position = 'centre') {
  const mask = Buffer.from(`<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" fill="#fff"/></svg>`);
  return sharp(input)
    .resize(width, height, { fit: 'cover', position })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function background(file) {
  return sharp(path.join(BACKGROUNDS, file))
    .resize(W, H, { fit: 'cover' })
    .modulate({ saturation: 0.86, brightness: 1.01 })
    .png()
    .toBuffer();
}

function browserFrame(x, y, title) {
  return `
    <rect x="${x}" y="${y}" width="456" height="310" rx="20" fill="#fffaf7" stroke="#b98d82" stroke-width="2"/>
    <path d="M${x} ${y + 40}h456" stroke="#d7b8af"/>
    <circle cx="${x + 22}" cy="${y + 20}" r="5" fill="#d4807e"/>
    <circle cx="${x + 40}" cy="${y + 20}" r="5" fill="#e1b267"/>
    <circle cx="${x + 58}" cy="${y + 20}" r="5" fill="#9dbb87"/>
    ${label(title, x + 78, y + 26, '#674d49', 13)}
  `;
}

async function buildSiteOverview() {
  const bg = await background('01-site.png');
  const tiles = await Promise.all([
    rounded(path.join(SCREENS, 'home.png'), 432, 258, 12, 'top'),
    rounded(path.join(SCREENS, 'personalizar.png'), 432, 258, 12, 'top'),
    rounded(path.join(SCREENS, 'galeria.png'), 432, 258, 12, 'top'),
    rounded(path.join(SCREENS, 'produtos.png'), 432, 258, 12, 'top'),
  ]);

  const overlay = svg(`
    <rect width="${W}" height="${H}" fill="#fffaf6" fill-opacity=".24"/>
    <rect x="52" y="54" width="66" height="4" rx="2" fill="#c75471"/>
    ${label('Lina Art Pet × Blajeen Labs', 52, 96)}
    ${heading(['UM SITE.', 'VÁRIAS EXPERIÊNCIAS.'], 52, 182, 67, 67)}
    <text x="54" y="348" fill="#665354" font-family="Segoe UI, Arial, sans-serif" font-size="25" font-weight="500">Do primeiro clique ao pedido personalizado.</text>
    ${browserFrame(52, 404, 'Início')}
    ${browserFrame(572, 404, 'Crie sua miniatura')}
    ${browserFrame(52, 750, 'Galeria')}
    ${browserFrame(572, 750, 'Produtos')}
    <rect x="52" y="1112" width="976" height="82" rx="20" fill="#302526"/>
    <text x="82" y="1162" fill="#fff9f5" font-family="Segoe UI, Arial, sans-serif" font-size="23" font-weight="650">Identidade, catálogo e personalização em uma experiência completa.</text>
    <line x1="52" y1="1243" x2="1028" y2="1243" stroke="#8f5b56" stroke-opacity=".55"/>
    ${label('PROJETO DIGITAL PARA CLIENTE', 52, 1295, '#674d49')}
    ${label('DESLIZE PARA VER →', 764, 1295, '#674d49')}
  `);

  await sharp(bg)
    .composite([
      { input: overlay },
      { input: tiles[0], left: 64, top: 446 },
      { input: tiles[1], left: 584, top: 446 },
      { input: tiles[2], left: 64, top: 792 },
      { input: tiles[3], left: 584, top: 792 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, '01-site-varias-experiencias.png'));
}

function photoFrame(x, title) {
  return `
    <rect x="${x}" y="453" width="464" height="628" rx="26" fill="#fffaf7" stroke="#b98d82" stroke-width="2"/>
    ${label(title, x + 24, 496, '#674d49', 14)}
  `;
}

async function buildTransformation({ backgroundFile, petFile, pieceFile, title, subtitle, output }) {
  const bg = await background(backgroundFile);
  const [pet, piece] = await Promise.all([
    rounded(path.join(PETS, petFile), 432, 550, 18, 'centre'),
    rounded(path.join(PETS, pieceFile), 432, 550, 18, 'centre'),
  ]);

  const overlay = svg(`
    <rect width="${W}" height="${H}" fill="#fffaf6" fill-opacity=".18"/>
    <rect x="52" y="54" width="66" height="4" rx="2" fill="#c75471"/>
    ${label('Lina Art Pet × Blajeen Labs', 52, 96)}
    ${heading(title, 52, 182, 64, 64)}
    <text x="54" y="350" fill="#665354" font-family="Segoe UI, Arial, sans-serif" font-size="25" font-weight="500">${xml(subtitle)}</text>
    ${photoFrame(52, 'Referência real')}
    ${photoFrame(564, 'Miniatura personalizada')}
    <circle cx="540" cy="777" r="28" fill="#302526"/>
    <path d="M529 777h20m-8-8 8 8-8 8" fill="none" stroke="#c9ff2e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="52" y="1120" width="976" height="78" rx="20" fill="#fffaf7" fill-opacity=".92" stroke="#b98d82"/>
    <text x="78" y="1168" fill="#493637" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="650">Da fotografia à modelagem, impressão e pintura: cada detalhe conta.</text>
    <line x1="52" y1="1243" x2="1028" y2="1243" stroke="#8f5b56" stroke-opacity=".55"/>
    ${label('LINAARTPET.COM.BR', 52, 1295, '#674d49')}
    ${label('PROJETO: BLAJEEN LABS', 735, 1295, '#674d49')}
  `);

  await sharp(bg)
    .composite([
      { input: overlay },
      { input: pet, left: 68, top: 513 },
      { input: piece, left: 580, top: 513 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, output));
}

await buildSiteOverview();
await buildTransformation({
  backgroundFile: '02-lina.png',
  petFile: 'lina-foto.webp',
  pieceFile: 'lina-peca.webp',
  title: ['A LINA VIROU', 'UMA PEÇA ÚNICA.'],
  subtitle: 'Uma lembrança criada a partir de quem ela realmente é.',
  output: '02-lina-da-foto-a-peca.png',
});
await buildTransformation({
  backgroundFile: '03-pomada.png',
  petFile: 'pomada-foto.webp',
  pieceFile: 'pomada-peca.webp',
  title: ['A POMADA', 'VIROU ARTE.'],
  subtitle: 'Expressão, cores e personalidade preservadas em cada detalhe.',
  output: '03-pomada-da-foto-a-peca.png',
});

console.log(`Carrossel criado em ${OUT}`);
