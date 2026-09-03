import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = 'C:/dev/blajeen-labs';
const generatedIntro = 'C:/Users/brgft/.codex/generated_images/01a01f81-ce80-7253-ab75-c9734aa5566c/exec-c63bfdcf-46c9-4762-8477-65cbe6b32ad5.png';
const repoOut = path.join(root, 'public/instagram/saas');
const desktopOut = 'C:/Users/brgft/OneDrive/Área de Trabalho/BlajeenLab Instagram/SaaS';

const products = [
  { id: 'doutelio', name: 'Doutelio', kicker: 'CONSULTÓRIOS', title: 'A rotina do consultório, organizada.', features: 'Agenda · pacientes · prontuário · documentos', accent: '#44D5E8' },
  { id: 'beautelio', name: 'Beautelio', kicker: 'BELEZA', title: 'Sua beleza, com a identidade do seu espaço.', features: 'Serviços · equipe · agenda · portfólio', accent: '#E39AC8' },
  { id: 'barbelio', name: 'Barbelio', kicker: 'BARBEARIAS', title: 'A agenda inteligente para barbearias.', features: 'Serviços · equipe · horários · atendimento', accent: '#F1B84B' },
  { id: 'studelio', name: 'Studelio', kicker: 'PERSONAL & STUDIO', title: 'Alunos, treinos e gestão em um só lugar.', features: 'Modalidades · planos · sessões · presença', accent: '#5BA8FF' },
  { id: 'foodelio', name: 'Foodelio', kicker: 'RESTAURANTES', title: 'Seu restaurante no ritmo dos pedidos.', features: 'Cardápio · ofertas · retirada · entrega', accent: '#FF7E54' },
  { id: 'lojalio', name: 'Lojalio', kicker: 'E-COMMERCE', title: 'Uma vitrine própria, pronta para crescer.', features: 'Catálogo · estoque · ofertas · pedidos', accent: '#C9FF3D' },
];

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const svg = (body) => Buffer.from(`<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">${body}</svg>`);

async function ensureDirs() {
  await fs.mkdir(repoOut, { recursive: true });
  await fs.mkdir(desktopOut, { recursive: true });
}

async function copyOut(buffer, filename) {
  await fs.writeFile(path.join(repoOut, filename), buffer);
  await fs.writeFile(path.join(desktopOut, filename), buffer);
}

async function buildIntro() {
  const base = await sharp(generatedIntro).resize(1080, 1080, { fit: 'cover' }).png().toBuffer();
  const overlay = svg(`
    <defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#090A08" stop-opacity=".97"/><stop offset=".62" stop-color="#090A08" stop-opacity=".6"/><stop offset="1" stop-color="#090A08" stop-opacity=".18"/></linearGradient></defs>
    <rect width="1080" height="1080" fill="url(#shade)"/>
    <rect x="62" y="66" width="956" height="948" rx="42" fill="none" stroke="#C9FF3D" stroke-opacity=".22"/>
    <text x="92" y="132" fill="#C9FF3D" font-family="Arial, sans-serif" font-size="22" letter-spacing="5" font-weight="700">BLAJEEN LABS / SAAS</text>
    <text x="92" y="256" fill="#F1F2E9" font-family="Arial, sans-serif" font-size="74" font-weight="700">Ecossistema</text>
    <text x="92" y="336" fill="#F1F2E9" font-family="Arial, sans-serif" font-size="74" font-weight="700">SaaS Blajeen.</text>
    <text x="94" y="400" fill="#B9BDB4" font-family="Arial, sans-serif" font-size="27">Sistemas próprios para rotinas reais.</text>
    <g font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="2" fill="#F1F2E9">
      <rect x="92" y="470" width="170" height="48" rx="24" fill="#11140F" stroke="#C9FF3D" stroke-opacity=".6"/><text x="117" y="501">DOUTELIO</text>
      <rect x="278" y="470" width="174" height="48" rx="24" fill="#11140F" stroke="#C9FF3D" stroke-opacity=".6"/><text x="304" y="501">BEAUTELIO</text>
      <rect x="468" y="470" width="170" height="48" rx="24" fill="#11140F" stroke="#C9FF3D" stroke-opacity=".6"/><text x="494" y="501">BARBELIO</text>
      <rect x="654" y="470" width="170" height="48" rx="24" fill="#11140F" stroke="#C9FF3D" stroke-opacity=".6"/><text x="681" y="501">STUDELIO</text>
      <rect x="92" y="536" width="170" height="48" rx="24" fill="#11140F" stroke="#C9FF3D" stroke-opacity=".6"/><text x="117" y="567">FOODELIO</text>
      <rect x="278" y="536" width="170" height="48" rx="24" fill="#11140F" stroke="#C9FF3D" stroke-opacity=".6"/><text x="305" y="567">LOJALIO</text>
    </g>
    <text x="92" y="932" fill="#C9FF3D" font-family="Arial, sans-serif" font-size="19" letter-spacing="3" font-weight="700">PRODUTOS FEITOS PARA EVOLUIR</text>
    <text x="92" y="970" fill="#8F948B" font-family="Arial, sans-serif" font-size="18">blajeen.com.br</text>
    <text x="950" y="970" text-anchor="end" fill="#F1F2E9" fill-opacity=".58" font-family="Arial, sans-serif" font-size="18" letter-spacing="2">BLAJEEN LABS</text>
  `);
  const out = await sharp(base).composite([{ input: overlay, top: 0, left: 0 }]).png().toBuffer();
  await copyOut(out, '01-ecossistema-saas-blajeen.png');
}

async function buildProduct(p, index) {
  const screenshot = await sharp(path.join(root, 'public/saas', p.id, '1.webp')).resize({ width: 840, height: 560, fit: 'inside' }).png().toBuffer();
  const frame = svg(`
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A0D0B"/><stop offset="1" stop-color="#151A16"/></linearGradient><filter id="shadow"><feGaussianBlur stdDeviation="18"/></filter></defs>
    <rect width="1080" height="1080" fill="url(#bg)"/>
    <circle cx="960" cy="120" r="260" fill="${p.accent}" fill-opacity=".08"/>
    <circle cx="150" cy="940" r="210" fill="${p.accent}" fill-opacity=".05"/>
    <rect x="70" y="70" width="940" height="940" rx="42" fill="none" stroke="${p.accent}" stroke-opacity=".28"/>
    <text x="102" y="132" fill="${p.accent}" font-family="Arial, sans-serif" font-size="20" letter-spacing="4" font-weight="700">BLAJEEN LABS / SAAS ${String(index).padStart(2,'0')}</text>
    <text x="102" y="214" fill="#A8ADA4" font-family="Arial, sans-serif" font-size="18" letter-spacing="4" font-weight="700">${esc(p.kicker)}</text>
    <text x="102" y="292" fill="#F1F2E9" font-family="Arial, sans-serif" font-size="62" font-weight="700">${esc(p.name)}</text>
    <text x="102" y="346" fill="#D2D5CC" font-family="Arial, sans-serif" font-size="27">${esc(p.title)}</text>
    <rect x="102" y="382" width="876" height="2" fill="${p.accent}" fill-opacity=".35"/>
    <text x="102" y="426" fill="#A8ADA4" font-family="Arial, sans-serif" font-size="20">${esc(p.features)}</text>
    <rect x="118" y="474" width="844" height="572" rx="28" fill="#000" fill-opacity=".36" filter="url(#shadow)"/>
    <rect x="118" y="464" width="844" height="572" rx="28" fill="#111" stroke="${p.accent}" stroke-opacity=".28"/>
    <text x="102" y="975" fill="#C9FF3D" font-family="Arial, sans-serif" font-size="18" letter-spacing="3" font-weight="700">EXPERIÊNCIA REAL · DEMONSTRAÇÃO</text>
    <text x="978" y="975" text-anchor="end" fill="#F1F2E9" fill-opacity=".58" font-family="Arial, sans-serif" font-size="17" letter-spacing="2">BLAJEEN LABS</text>
  `);
  const out = await sharp({ create: { width: 1080, height: 1080, channels: 4, background: '#090A08' } })
    .composite([
      { input: frame, top: 0, left: 0 },
      { input: screenshot, top: 470, left: 120 },
    ])
    .png()
    .toBuffer();
  await copyOut(out, `${String(index + 1).padStart(2,'0')}-${p.id}.png`);
}

await ensureDirs();
await buildIntro();
for (let i = 0; i < products.length; i += 1) await buildProduct(products[i], i + 1);
console.log(`Criadas ${products.length + 1} artes em ${repoOut} e ${desktopOut}`);
