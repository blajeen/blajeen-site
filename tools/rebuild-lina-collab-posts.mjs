import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'social', 'instagram', 'lina-art-pet-colab');
const LINA = path.join(ROOT, 'public', 'trabalhos', 'lina-art-pet');
const W = 1080;
const H = 1350;

const svg = (content) => Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${content}</svg>`);

function escape(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function heading(lines, x, y, size, lineHeight, color = '#302627') {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="760" letter-spacing="-2.8">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escape(line)}</tspan>`).join('')}</text>`;
}

function label(value, x, y, color = '#9a685b') {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Consolas, monospace" font-size="17" font-weight="600" letter-spacing="3.2">${escape(value.toUpperCase())}</text>`;
}

async function card(input, width, height, radius, position = 'centre') {
  const mask = Buffer.from(`<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" fill="white"/></svg>`);
  return sharp(input)
    .resize(width, height, { fit: 'cover', position, background: '#f6e8df' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function buildTransformation() {
  const pet = await card(path.join(LINA, 'luna-foto.webp'), 414, 500, 24, 'centre');
  const miniature = await card(path.join(LINA, 'luna-peca.webp'), 414, 500, 24, 'centre');
  const layout = svg(`
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff9f4"/><stop offset="1" stop-color="#f0d8ca"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#background)"/>
    <rect x="56" y="55" width="72" height="4" rx="2" fill="#c97767"/>
    ${label('Lina Art Pet × Blajeen Labs', 56, 106)}
    ${heading(['DA FOTO', 'À PEÇA.'], 56, 205, 78, 77)}
    <text x="58" y="385" fill="#695958" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="450">Miniaturas 3D personalizadas, feitas a partir das fotos do seu pet.</text>
    <rect x="48" y="462" width="430" height="600" rx="28" fill="#fefaf7" stroke="#dbb6a6" stroke-width="2"/>
    <rect x="602" y="462" width="430" height="600" rx="28" fill="#fefaf7" stroke="#dbb6a6" stroke-width="2"/>
    ${label('FOTO DO PET', 78, 516)}
    ${label('MINIATURA PERSONALIZADA', 632, 516)}
    <path d="M505 755h70" stroke="#c97767" stroke-width="2.5" stroke-linecap="round"/>
    <path d="m558 741 18 14-18 14" fill="none" stroke="#c97767" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="56" y1="1225" x2="1024" y2="1225" stroke="#cba595" stroke-opacity=".65"/>
    ${label('LINAARTPET.COM.BR', 56, 1280, '#7e554d')}
    ${label('PARA GUARDAR PARA SEMPRE', 630, 1280, '#7e554d')}
  `);

  await sharp({ create: { width: W, height: H, channels: 3, background: '#fff9f4' } })
    .composite([
      { input: layout },
      { input: pet, left: 56, top: 542 },
      { input: miniature, left: 610, top: 542 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, '01-da-foto-a-peca.png'));
}

async function buildSite() {
  const screenshot = await card(path.join(LINA, 'capa-site.webp'), 944, 514, 18, 'centre');
  const layout = svg(`
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff9f4"/><stop offset="1" stop-color="#ecd6c8"/></linearGradient>
      <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fffaf7"/><stop offset="1" stop-color="#f4e1d7"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#background)"/>
    <rect x="56" y="55" width="72" height="4" rx="2" fill="#c97767"/>
    ${label('Colaboração / projeto para cliente', 56, 106)}
    ${heading(['UM SITE COM', 'A CARA DA MARCA.'], 56, 205, 70, 70)}
    <text x="58" y="367" fill="#695958" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="450">A Lina Art Pet ganhou uma vitrine digital para contar uma história única.</text>
    <rect x="48" y="455" width="984" height="650" rx="30" fill="#fffaf7" stroke="#c7a395" stroke-width="3"/>
    <rect x="48" y="455" width="984" height="66" rx="30" fill="#4a3734"/>
    <circle cx="84" cy="488" r="7" fill="#e99b91"/><circle cx="108" cy="488" r="7" fill="#edc172"/><circle cx="132" cy="488" r="7" fill="#91ba9a"/>
    <rect x="178" y="474" width="704" height="27" rx="13" fill="#f8eee9" fill-opacity=".88"/>
    ${label('LINAARTPET.COM.BR', 386, 494, '#7a5650')}
    <text x="60" y="1160" fill="#4e3935" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="600">Do atendimento à apresentação: cada detalhe traduz o universo da marca.</text>
    <line x1="56" y1="1225" x2="1024" y2="1225" stroke="#cba595" stroke-opacity=".65"/>
    ${label('IDENTIDADE / SITE / EXPERIÊNCIA DIGITAL', 56, 1280, '#7e554d')}
    ${label('BLAJEEN LABS', 778, 1280, '#7e554d')}
  `);

  await sharp({ create: { width: W, height: H, channels: 3, background: '#fff9f4' } })
    .composite([
      { input: layout },
      { input: screenshot, left: 68, top: 546 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, '02-o-site-da-lina.png'));
}

await Promise.all([buildTransformation(), buildSite()]);
console.log(`Posts refeitos em ${OUT}`);
