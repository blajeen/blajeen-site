/**
 * Gera as imagens ilustrativas dos produtos de exemplo da loja (`public/loja/exemplos/*.jpg`).
 *
 * São montagens simbólicas, não fotos: o ícone de cada jogo estampado numa camiseta, impresso numa
 * caneca ou de pé sobre a base de um boneco, todas marcadas como "imagem ilustrativa". Ficam no
 * lugar até o titular enviar as fotos de verdade pelo painel.
 *
 *   node tools/gerar-artes-da-loja.mjs
 */
import { readFile, mkdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { chromium } from 'playwright';

const SAIDA = resolve('public/loja/exemplos');
const LADO = 720;

const JOGOS = [
  { id: 'revalio', nome: 'Revalio', icone: 'projects/revalio/revalio-icon-512.png', cor: '#4aa3ff' },
  { id: 'docalio', nome: 'Docalio', icone: 'projects/docalio/docalio-icon-mochila-v2.webp', cor: '#38c6a0' },
  { id: 'gramelio', nome: 'Gramelio', icone: 'projects/gramelio/gramelio-icon-512.png', cor: '#8fd35f' },
  { id: 'catelio', nome: 'Catelio', icone: 'projects/catelio/catelio-icon-512.png', cor: '#ff9a3c' },
  { id: 'morvelio', nome: 'Morvelio', icone: 'projects/morvelio/morvelio-icon-montanha-nome-v04.webp', cor: '#9b7bff' },
  { id: 'mazelio', nome: 'Mazelio', icone: 'projects/mazelio/mazelio-icon-rei-v2.webp', cor: '#e8b84a' },
  { id: 'socialio', nome: 'Socialio', icone: 'projects/socialio/socialio-icon-cafe.webp', cor: '#ff6fa8' },
];
const MARCA = { id: 'blajeen', nome: 'Blajeen Labs', icone: 'brand/blajeen-labs-icon-512.png', cor: '#c9ff3d' };
const FRASCO = 'brand/vial-mechanical.png';

const tipos = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
async function dataUri(caminho) {
  const bytes = await readFile(resolve('public', caminho));
  return `data:${tipos[extname(caminho)]};base64,${bytes.toString('base64')}`;
}

const CAMISETA = 'M190 120 L270 92 Q360 140 450 92 L530 120 L640 210 L580 300 L530 268 L530 640 L190 640 L190 268 L140 300 L80 210 Z';

function palco(cor, jogo, tipo, miolo) {
  return `<div id="palco" style="--cor:${cor}">
    <div class="topo"><span>BLAJEEN LABS · EXCLUSIVO</span><span class="jogo">${jogo.toUpperCase()}</span></div>
    ${miolo}
    <div class="base"><span>IMAGEM ILUSTRATIVA</span><span>${tipo}</span></div>
  </div>`;
}

const estilos = `
  *{box-sizing:border-box;margin:0}
  body{background:#0c0f0b}
  #palco{position:relative;width:${LADO}px;height:${LADO}px;overflow:hidden;font-family:ui-monospace,Consolas,monospace;
    background:
      radial-gradient(circle at 50% 46%, color-mix(in srgb,var(--cor) 26%,transparent), transparent 58%),
      repeating-linear-gradient(0deg, rgba(231,231,223,.035) 0 1px, transparent 1px 36px),
      repeating-linear-gradient(90deg, rgba(231,231,223,.035) 0 1px, transparent 1px 36px),
      #0c0f0b}
  .topo,.base{position:absolute;left:34px;right:34px;display:flex;justify-content:space-between;font-size:13px;letter-spacing:.14em;color:#a5ada1}
  .topo{top:30px}.base{bottom:28px;font-size:12px;color:#85897e}
  .jogo{color:var(--cor)}
  .sombra{position:absolute;left:50%;transform:translateX(-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.6),transparent)}
  .estampa{position:absolute;border-radius:18px;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.06)}
`;

function camiseta(jogo, icone) {
  return palco(jogo.cor, jogo.nome, 'CAMISETA', `
    <div class="sombra" style="bottom:70px;width:420px;height:46px"></div>
    <svg viewBox="0 0 720 720" width="720" height="720" style="position:absolute;inset:0">
      <defs><linearGradient id="t" x1="0" x2="1"><stop offset="0" stop-color="#232821"/><stop offset=".5" stop-color="#1a1e18"/><stop offset="1" stop-color="#141713"/></linearGradient></defs>
      <path d="${CAMISETA}" fill="url(#t)" stroke="rgba(231,231,223,.12)" stroke-width="2"/>
      <path d="M270 92 Q360 150 450 92" fill="none" stroke="rgba(231,231,223,.18)" stroke-width="5"/>
      <path d="M232 300 Q250 470 236 620 M488 300 Q470 470 484 620" stroke="rgba(0,0,0,.25)" stroke-width="10" fill="none"/>
    </svg>
    <img class="estampa" src="${icone}" style="left:270px;top:205px;width:180px;height:180px">`);
}

function caneca(jogo, icone) {
  return palco(jogo.cor, jogo.nome, 'CANECA', `
    <div class="sombra" style="bottom:118px;width:380px;height:50px"></div>
    <svg viewBox="0 0 720 720" width="720" height="720" style="position:absolute;inset:0">
      <defs><linearGradient id="c" x1="0" x2="1"><stop offset="0" stop-color="#cfcdc4"/><stop offset=".35" stop-color="#f1f0ea"/><stop offset="1" stop-color="#b9b7ae"/></linearGradient></defs>
      <path d="M470 250 C585 250 585 470 470 470" fill="none" stroke="#d7d5cc" stroke-width="34"/>
      <path d="M470 250 C585 250 585 470 470 470" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="34" stroke-dasharray="2 400"/>
      <path d="M200 190 L480 190 L480 560 Q480 600 440 600 L240 600 Q200 600 200 560 Z" fill="url(#c)"/>
      <ellipse cx="340" cy="190" rx="140" ry="22" fill="#e9e8e1"/><ellipse cx="340" cy="192" rx="122" ry="15" fill="#3a2a20"/>
    </svg>
    <img class="estampa" src="${icone}" style="left:262px;top:300px;width:156px;height:156px;border-radius:14px">`);
}

function boneco(jogo, icone) {
  return palco(jogo.cor, jogo.nome, 'BONECO 3D', `
    <div class="sombra" style="bottom:96px;width:420px;height:60px"></div>
    <svg viewBox="0 0 720 720" width="720" height="720" style="position:absolute;inset:0">
      <defs><linearGradient id="p" x1="0" x2="1"><stop offset="0" stop-color="#2a3027"/><stop offset=".5" stop-color="#3a4136"/><stop offset="1" stop-color="#20251e"/></linearGradient></defs>
      <path d="M190 520 L190 580 Q360 640 530 580 L530 520 Z" fill="url(#p)"/>
      <ellipse cx="360" cy="520" rx="170" ry="40" fill="#30362d" stroke="${jogo.cor}" stroke-width="3" stroke-opacity=".8"/>
      <text x="360" y="597" text-anchor="middle" font-family="ui-monospace,Consolas,monospace" font-size="15" letter-spacing="5" fill="#a5ada1">${jogo.nome.toUpperCase()}</text>
    </svg>
    <img src="${icone}" style="position:absolute;left:215px;top:158px;width:290px;height:290px;border-radius:44px;object-fit:cover;
      transform:perspective(900px) rotateY(-14deg);box-shadow:24px 30px 50px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.08)">
    <div style="position:absolute;left:470px;top:150px;padding:6px 12px;border:1px solid var(--cor);border-radius:999px;color:var(--cor);font-size:13px;letter-spacing:.12em">3D</div>`);
}

function copo(icone) {
  return palco(MARCA.cor, 'Blajeen Labs', 'COPO', `
    <div class="sombra" style="bottom:96px;width:300px;height:44px"></div>
    <svg viewBox="0 0 720 720" width="720" height="720" style="position:absolute;inset:0">
      <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#1d231b"/><stop offset=".45" stop-color="#2b3328"/><stop offset="1" stop-color="#151912"/></linearGradient></defs>
      <path d="M250 175 L470 175 L440 600 Q438 618 420 618 L300 618 Q282 618 280 600 Z" fill="url(#g)" stroke="rgba(231,231,223,.12)" stroke-width="2"/>
      <rect x="240" y="140" width="240" height="44" rx="12" fill="#3a4136"/><rect x="330" y="122" width="60" height="22" rx="6" fill="#4a5245"/>
    </svg>
    <img src="${icone}" style="position:absolute;left:285px;top:250px;width:150px;height:auto;filter:drop-shadow(0 0 22px rgba(201,255,61,.35))">`);
}

function capa(icone, largura, altura) {
  return `<div style="position:relative;width:${largura}px;height:${altura}px;border-radius:6px;overflow:hidden;
      background:linear-gradient(160deg,#241a3c,#120d1f);box-shadow:inset 0 0 0 2px rgba(232,184,74,.55),inset 0 0 0 10px #160f26,inset 0 0 0 11px rgba(232,184,74,.35)">
    <img src="${icone}" style="position:absolute;left:12%;top:8%;width:76%;aspect-ratio:1;object-fit:cover;border-radius:6px">
    <div style="position:absolute;left:0;right:0;bottom:12%;text-align:center;font-family:Georgia,serif;color:#e8c77a;font-size:${largura * 0.11}px;letter-spacing:.12em">MORVELIO</div>
  </div>`;
}

function livroColecionador(icone) {
  return palco('#9b7bff', 'Morvelio', 'LIVRO · COLECIONADOR', `
    <div class="sombra" style="bottom:70px;width:420px;height:56px"></div>
    <div style="position:absolute;left:206px;top:105px;transform:perspective(1100px) rotateY(-22deg);transform-style:preserve-3d">
      <div style="position:absolute;left:-26px;top:4px;width:30px;height:462px;background:linear-gradient(90deg,#0d0917,#1c1430);transform:rotateY(-70deg);transform-origin:right"></div>
      ${capa(icone, 320, 470)}
    </div>
    <div style="position:absolute;left:520px;top:160px;padding:6px 12px;border:1px solid #e8b84a;border-radius:999px;color:#e8b84a;font-size:12px;letter-spacing:.12em">COLECIONADOR</div>`);
}

function livroDigital(icone) {
  return palco('#9b7bff', 'Morvelio', 'LIVRO · DIGITAL', `
    <div class="sombra" style="bottom:66px;width:380px;height:50px"></div>
    <div style="position:absolute;left:190px;top:95px;width:340px;height:500px;border-radius:34px;background:#141613;padding:22px;
        box-shadow:0 0 0 2px #2b3028,24px 30px 60px rgba(0,0,0,.6)">
      ${capa(icone, 296, 456)}
    </div>
    <div style="position:absolute;left:530px;top:150px;padding:6px 12px;border:1px solid var(--cor);border-radius:999px;color:var(--cor);font-size:12px;letter-spacing:.12em">E-BOOK</div>`);
}

await mkdir(SAIDA, { recursive: true });
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: LADO, height: LADO }, deviceScaleFactor: 1 });

async function gravar(nome, html) {
  await pagina.setContent(`<!doctype html><meta charset="utf-8"><style>${estilos}</style>${html}`);
  await pagina.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => undefined))));
  await pagina.locator('#palco').screenshot({ path: resolve(SAIDA, `${nome}.jpg`), type: 'jpeg', quality: 80 });
  console.log(`${nome}.jpg`);
}

for (const jogo of JOGOS) {
  const icone = await dataUri(jogo.icone);
  await gravar(`camiseta-${jogo.id}`, camiseta(jogo, icone));
  await gravar(`caneca-${jogo.id}`, caneca(jogo, icone));
  await gravar(`boneco-${jogo.id}`, boneco(jogo, icone));
}
await gravar('camiseta-blajeen', camiseta(MARCA, await dataUri(MARCA.icone)));
await gravar('copo-blajeen', copo(await dataUri(FRASCO)));
const morvelio = await dataUri(JOGOS.find((j) => j.id === 'morvelio').icone);
await gravar('livro-morvelio-colecionador', livroColecionador(morvelio));
await gravar('livro-morvelio-digital', livroDigital(morvelio));
await navegador.close();
