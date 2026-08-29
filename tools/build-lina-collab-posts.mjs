import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const outputDir = path.join(root, 'public', 'social', 'instagram', 'lina-art-pet-colab');
const linaDir = path.join(root, 'public', 'trabalhos', 'lina-art-pet');
const W = 1080;
const H = 1350;

const asset = (...parts) => path.join(...parts);
const output = (name) => path.join(outputDir, name);

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function text(lines, x, y, size, lineHeight, color = '#2d2624', weight = 700) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="-2.2">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join('')}</text>`;
}

function label(value, x, y, color = '#8e6154') {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Consolas, monospace" font-size="16" font-weight="600" letter-spacing="3.2">${escapeXml(value.toUpperCase())}</text>`;
}

function overlay({ eyebrow, title, subtitle, footer, titleY, titleSize = 68, titleLine = 68 }) {
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbefe8" stop-opacity="0.92"/><stop offset="1" stop-color="#fbefe8" stop-opacity="0"/></linearGradient>
      <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2926" stop-opacity="0"/><stop offset="0.5" stop-color="#3a2926" stop-opacity="0.52"/><stop offset="1" stop-color="#3a2926" stop-opacity="0.92"/></linearGradient>
    </defs>
    <rect width="${W}" height="420" fill="url(#topFade)"/>
    <rect y="1080" width="${W}" height="270" fill="url(#bottomFade)"/>
    <rect x="56" y="54" width="68" height="4" rx="2" fill="#bd705f"/>
    ${label(eyebrow, 56, 100)}
    ${text(title, 56, titleY, titleSize, titleLine)}
    <text x="58" y="${titleY + title.length * titleLine + 27}" fill="#675953" font-family="Segoe UI, Arial, sans-serif" font-size="25" font-weight="500">${escapeXml(subtitle)}</text>
    <line x1="56" y1="1254" x2="1024" y2="1254" stroke="rgba(255,255,255,.35)"/>
    ${label(footer, 56, 1304, '#f5e2d7')}
    <circle cx="1012" cy="1298" r="6" fill="#e8a19a"/>
  </svg>`);
}

async function rounded(input, width, height, radius, position = 'centre') {
  const mask = Buffer.from(`<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" fill="white"/></svg>`);
  return sharp(input).resize(width, height, { fit: 'cover', position }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
}

async function buildTransformation() {
  const petPhoto = await rounded(asset(linaDir, 'luna-foto.webp'), 248, 316, 12, 'centre');
  const petPiece = await rounded(asset(linaDir, 'luna-peca.webp'), 352, 448, 20, 'centre');
  const photoFrame = Buffer.from(`<svg width="276" height="346" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="276" height="346" rx="18" fill="#f9f2ec"/><rect x="13" y="13" width="250" height="318" rx="13" fill="none" stroke="#c89380" stroke-width="2"/></svg>`);
  const grid = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><path d="M70 838 C 315 760 482 840 706 770" fill="none" stroke="#ca8c82" stroke-opacity=".5" stroke-width="2" stroke-dasharray="7 12"/><circle cx="463" cy="802" r="12" fill="#c76e66"/><path d="m457 802 5 5 9-12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
  const copy = overlay({
    eyebrow: 'LINA ART PET × BLAJEEN LABS',
    title: ['DA FOTO', 'À PEÇA.'],
    titleY: 190,
    subtitle: 'Uma lembrança feita para ficar por perto.',
    footer: 'SITE / PERSONALIZAÇÃO / EXPERIÊNCIA DIGITAL',
  });

  await sharp(output('source-transformacao.png'))
    .resize(W, H, { fit: 'cover' })
    .composite([
      { input: photoFrame, left: 54, top: 590 },
      { input: petPhoto, left: 68, top: 605 },
      { input: petPiece, left: 642, top: 524 },
      { input: grid },
      { input: copy },
    ])
    .png({ compressionLevel: 9 })
    .toFile(output('01-da-foto-a-peca.png'));
}

async function buildSite() {
  const siteScreenshot = await rounded(asset(linaDir, 'capa-site.webp'), 460, 680, 24, 'centre');
  const deviceMask = Buffer.from(`<svg width="460" height="680" xmlns="http://www.w3.org/2000/svg"><rect width="460" height="680" rx="27" fill="#fff"/></svg>`);
  const deviceScreen = await sharp(siteScreenshot).composite([{ input: deviceMask, blend: 'dest-in' }]).png().toBuffer();
  const deviceFrame = Buffer.from(`<svg width="490" height="710" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="486" height="706" rx="34" fill="none" stroke="#382927" stroke-width="5"/><rect x="219" y="17" width="52" height="7" rx="4" fill="#382927"/></svg>`);
  const piece = await rounded(asset(linaDir, 'hero-ambiente.webp'), 258, 334, 18, 'centre');
  const copy = overlay({
    eyebrow: 'COLABORAÇÃO / PROJETO PARA CLIENTE',
    title: ['UM SITE COM', 'A CARA DA MARCA.'],
    titleY: 186,
    titleSize: 60,
    titleLine: 63,
    subtitle: 'Experiência digital para um trabalho que já era único.',
    footer: 'LINAARTPET.COM.BR / BLAJEEN LABS',
  });

  await sharp(output('source-site.png'))
    .resize(W, H, { fit: 'cover' })
    .composite([
      { input: deviceScreen, left: 82, top: 422 },
      { input: deviceFrame, left: 67, top: 407 },
      { input: piece, left: 760, top: 752 },
      { input: copy },
    ])
    .png({ compressionLevel: 9 })
    .toFile(output('02-o-site-da-lina.png'));
}

await Promise.all([buildTransformation(), buildSite()]);
console.log(`Posts criados em ${outputDir}`);
