// Prepara a foto do interior do Jaecoo 5 para a vista "Por dentro" do Carrelio.
//
// A foto de divulgação que o titular trouxe (07/10/2026) é de um carro de mão inglesa: volante à
// direita. O carro vendido no Brasil tem o volante à esquerda, então a foto é espelhada. O espelho
// inverteria também o que tem letra, e isso volta ao normal colando o pedaço original no lugar
// espelhado (tela, painel de instrumentos, etiqueta do airbag, botões); o nome da marca na placa do
// volante sai (a página não mostra logotipo de marca).
//
// Além da foto em quatro larguras (AVIF e WebP), saem as máscaras que a página usa por CSS:
//
//   - faixas: a luz ambiente (as faixas azuis do painel e das portas, com o reflexo delas), para a
//     pessoa trocar a cor;
//   - faixas-brilho: as mesmas faixas, borradas, para o brilho em volta;
//   - telas: multimídia, painel de instrumentos e botões acesos, que continuam acesos à noite;
//   - acesas: telas e faixas juntas (o que fica aceso quando o resto escurece);
//   - janelas: para-brisa, janelas e teto de vidro, que à noite viram céu escuro.
//
// E as fotos de detalhe, que aparecem no balão de cada ponto (de fora, no 3D, e de dentro, na foto):
// a multimídia de perto, o teto panorâmico, o câmbio e o porta-malas vazio e cheio. Mais a miniatura
// do convite para entrar no carro.
//
// Todas as coordenadas abaixo são da foto original (3840 × 2560, antes do espelho).
//
// Uso: node tools/carrelio-interior.mjs
// Entrada: docs/carrelio/fotos/jaecoo-5-interior-divulgacao.avif
// Saída: public/produtos/carrelio/interior/

import { mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FOTOS = join(raiz, 'docs/carrelio/fotos');
const ORIGEM = join(FOTOS, 'jaecoo-5-interior-divulgacao.avif');
const DESTINO = join(raiz, 'public/produtos/carrelio/interior');
const DESTINO_DOS_DETALHES = join(raiz, 'public/produtos/carrelio/detalhes');

/**
 * As fotos de detalhe dos pontos: arquivo de origem, nome na página e tamanho final. O porta-malas
 * cheio vem mais largo: o recorte o deixa em 3:2, igual ao vazio (os dois se alternam no balão).
 */
const DETALHES = [
  { origem: 'jaecoo-5-multimidia-divulgacao.avif', nome: 'multimidia', largura: 640, altura: 360 },
  { origem: 'jaecoo-5-teto-divulgacao.jpg', nome: 'teto', largura: 960, altura: 540 },
  { origem: 'jaecoo-5-cambio-divulgacao.jpg', nome: 'cambio', largura: 960, altura: 540 },
  { origem: 'jaecoo-5-porta-malas-vazio-divulgacao.avif', nome: 'porta-malas-vazio', largura: 960, altura: 640 },
  {
    origem: 'jaecoo-5-porta-malas-cheio-divulgacao.png',
    nome: 'porta-malas-cheio',
    largura: 960,
    altura: 640,
    recorte: { left: 249, top: 0, width: 1288, height: 859 },
  },
];
const L = 3840;
const A = 2560;

/** Pedaços com letra: voltam sem espelho, no lugar espelhado, com a borda esfumada (px). */
const DESESPELHAR = [
  { nome: 'multimídia', x0: 1745, y0: 1352, x1: 2098, y1: 1790, borda: 5 },
  { nome: 'painel de instrumentos', x0: 2318, y0: 1420, x1: 2585, y1: 1505, borda: 6 },
  { nome: 'etiqueta do airbag', x0: 965, y0: 603, x1: 1295, y1: 680, borda: 6 },
  { nome: 'botões do console', x0: 1818, y0: 1803, x1: 2018, y1: 1850, borda: 4 },
  { nome: 'botão de partida', x0: 2168, y0: 1572, x1: 2215, y1: 1596, borda: 2 },
  { nome: 'airbag do volante', x0: 2555, y0: 1642, x1: 2605, y1: 1662, borda: 3 },
];

/** A placa do volante: as letras somem, a placa fica (cada linha vira o degradê entre as pontas). */
const PLACA_DO_VOLANTE = { x0: 2496, y0: 1555, x1: 2634, y1: 1569 };

/** Para-brisa, janelas dos lados e teto de vidro. */
const JANELAS = [
  [[800, 715], [3110, 715], [3100, 780], [3020, 940], [2953, 1127], [2887, 1287], [2860, 1322], [1067, 1322], [1013, 1233], [933, 1073], [870, 900], [800, 740]],
  [[0, 415], [253, 508], [400, 608], [507, 722], [590, 830], [670, 980], [735, 1125], [800, 1285], [840, 1393], [0, 1440]],
  [[3840, 415], [3553, 562], [3340, 750], [3233, 940], [3140, 1127], [3073, 1313], [3047, 1393], [3840, 1450]],
  [[380, 0], [3470, 0], [3390, 20], [3200, 55], [2700, 75], [1920, 82], [1100, 75], [650, 55], [470, 20]],
];

/** Onde procurar a luz ambiente (fora daqui, azul é céu, tela ou reflexo no volante). */
const AREAS_DAS_FAIXAS = [
  { x0: 900, y0: 1490, x1: 1744, y1: 1720 }, // painel, lado do passageiro
  { x0: 2084, y0: 1525, x1: 2204, y1: 1630 }, // painel, entre a tela e o volante
  { x0: 0, y0: 1450, x1: 950, y1: 2250 }, // porta do passageiro
  { x0: 2950, y0: 1450, x1: 3840, y1: 2250 }, // porta do motorista
];

/** O que fica aceso à noite: as telas (com o canto arredondado) e os botões iluminados. */
const TELAS = [
  { x0: 1762, y0: 1367, x1: 2080, y1: 1773, raio: 12, forca: 1 },
  { x0: 2306, y0: 1428, x1: 2600, y1: 1503, raio: 18, forca: 1 },
  { x0: 1824, y0: 1810, x1: 2011, y1: 1845, raio: 8, forca: 0.85 },
  { x0: 2170, y0: 1574, x1: 2213, y1: 1594, raio: 3, forca: 0.85 },
];

const LARGURAS_DA_FOTO = [1280, 1920, 2560, 3840];
const LARGURA_DAS_MASCARAS = 1920;
const LARGURA_DOS_BRILHOS = 960;

const suave = (borda0, borda1, x) => {
  const t = Math.min(1, Math.max(0, (x - borda0) / (borda1 - borda0)));
  return t * t * (3 - 2 * t);
};

async function lerOriginal() {
  const { data, info } = await sharp(ORIGEM).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== L || info.height !== A || info.channels !== 3) throw new Error(`Foto inesperada: ${info.width}×${info.height}×${info.channels}.`);
  return data;
}

function espelhar(original) {
  const saida = Buffer.alloc(original.length);
  for (let y = 0; y < A; y++) {
    const linha = y * L * 3;
    for (let x = 0; x < L; x++) {
      const de = linha + (L - 1 - x) * 3;
      const para = linha + x * 3;
      saida[para] = original[de];
      saida[para + 1] = original[de + 1];
      saida[para + 2] = original[de + 2];
    }
  }
  return saida;
}

/** Cola o pedaço original (sem espelho) no lugar espelhado, com a borda esfumada. */
function desespelhar(foto, original, { x0, y0, x1, y1, borda }) {
  const destinoX0 = L - 1 - x1;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const distancia = Math.min(x - x0, x1 - x, y - y0, y1 - y);
      const alfa = borda > 0 ? Math.min(1, (distancia + 0.5) / borda) : 1;
      const de = (y * L + x) * 3;
      const para = (y * L + destinoX0 + (x - x0)) * 3;
      for (let c = 0; c < 3; c++) foto[para + c] = Math.round(foto[para + c] * (1 - alfa) + original[de + c] * alfa);
    }
  }
}

/** Tira as letras da placa: cada linha vira o degradê entre as duas pontas (já no lugar espelhado). */
function limparPlaca(foto, { x0, y0, x1, y1 }) {
  const ex0 = L - 1 - x1;
  const ex1 = L - 1 - x0;
  for (let y = y0; y <= y1; y++) {
    const media = (x) => {
      const cor = [0, 0, 0];
      for (let dx = -1; dx <= 1; dx++) for (let c = 0; c < 3; c++) cor[c] += foto[(y * L + x + dx) * 3 + c] / 3;
      return cor;
    };
    const esquerda = media(ex0 + 1);
    const direita = media(ex1 - 1);
    for (let x = ex0 + 2; x <= ex1 - 2; x++) {
      const t = (x - ex0) / (ex1 - ex0);
      for (let c = 0; c < 3; c++) foto[(y * L + x) * 3 + c] = Math.round(esquerda[c] * (1 - t) + direita[c] * t);
    }
  }
}

/** Polígonos em branco num fundo preto, na resolução da foto (um canal). */
async function rasterizar(poligonos) {
  const formas = poligonos.map((pontos) => `<polygon points="${pontos.map(([x, y]) => `${x},${y}`).join(' ')}" fill="#fff"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}"><rect width="100%" height="100%" fill="#000"/>${formas}</svg>`;
  return sharp(Buffer.from(svg)).extractChannel(0).raw().toBuffer();
}

/** A luz ambiente, na foto original: azul, saturado e aceso, só nas áreas das faixas. */
function mascaraDasFaixas(original) {
  const mascara = Buffer.alloc(L * A);
  for (const { x0, y0, x1, y1 } of AREAS_DAS_FAIXAS) {
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * L + x) * 3;
        const r = original[i] / 255;
        const g = original[i + 1] / 255;
        const b = original[i + 2] / 255;
        const maximo = Math.max(r, g, b);
        const minimo = Math.min(r, g, b);
        const saturacao = maximo === 0 ? 0 : (maximo - minimo) / maximo;
        let matiz = 0;
        if (maximo !== minimo) {
          if (maximo === r) matiz = 60 * (((g - b) / (maximo - minimo)) % 6);
          else if (maximo === g) matiz = 60 * ((b - r) / (maximo - minimo) + 2);
          else matiz = 60 * ((r - g) / (maximo - minimo) + 4);
        }
        if (matiz < 0) matiz += 360;
        // A faixa é ciano no miolo (~190°) e azul no brilho que ela joga no painel (~215°). O
        // plástico escuro da porta também puxa para o azul, mas é apagado: o valor o deixa de fora.
        const azul = suave(180, 190, matiz) * (1 - suave(232, 250, matiz));
        const valor = azul * suave(0.2, 0.5, saturacao) * suave(0.16, 0.5, maximo);
        // O resto fraquinho viraria um véu de cor em toda a porta.
        mascara[y * L + x] = Math.max(mascara[y * L + x], valor < 0.08 ? 0 : Math.round(valor * 255));
      }
    }
  }
  return mascara;
}

/** Retângulos arredondados das telas, com a força de cada um (um canal). */
async function mascaraDasTelas() {
  const formas = TELAS.map(({ x0, y0, x1, y1, raio, forca }) => {
    const tom = Math.round(255 * forca);
    return `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="${raio}" fill="rgb(${tom},${tom},${tom})"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}"><rect width="100%" height="100%" fill="#000"/>${formas}</svg>`;
  return sharp(Buffer.from(svg)).extractChannel(0).raw().toBuffer();
}

const umCanal = { raw: { width: L, height: A, channels: 1 } };

/** Borra e espelha uma máscara (para o lado da foto já espelhada). */
async function prepararMascara(mascara, sigma) {
  let imagem = sharp(mascara, umCanal);
  if (sigma > 0) imagem = imagem.blur(sigma);
  // O sharp devolve três canais depois do borrão: fica só um.
  return imagem.flop().extractChannel(0).raw().toBuffer();
}

/** Branco com a máscara no alfa, em WebP, na largura pedida. */
async function gravarMascara(mascara, nome, largura) {
  const caminho = join(DESTINO, `${nome}.webp`);
  // O sharp junta o canal depois de redimensionar: primeiro junta, depois reduz, em duas passadas.
  const cheia = await sharp({ create: { width: L, height: A, channels: 3, background: '#ffffff' } })
    .joinChannel(mascara, umCanal)
    .raw()
    .toBuffer();
  await sharp(cheia, { raw: { width: L, height: A, channels: 4 } })
    .resize({ width: largura })
    .webp({ quality: 90, alphaQuality: 90, effort: 6 })
    .toFile(caminho);
  return caminho;
}

function kb(caminho) {
  return `${(statSync(caminho).size / 1024).toFixed(0)} KB`;
}

mkdirSync(DESTINO, { recursive: true });
const original = await lerOriginal();
const foto = espelhar(original);
for (const pedaco of DESESPELHAR) desespelhar(foto, original, pedaco);
limparPlaca(foto, PLACA_DO_VOLANTE);

const imagem = sharp(foto, { raw: { width: L, height: A, channels: 3 } });
// Para acertar só as máscaras sem esperar o AVIF grande: SO_MASCARAS=<arquivo.png> grava ali a foto
// espelhada, em 1920 px, para conferência, e pula as fotos da página.
if (process.env.SO_MASCARAS) await imagem.clone().resize({ width: 1920 }).png().toFile(process.env.SO_MASCARAS);
for (const largura of process.env.SO_MASCARAS ? [] : LARGURAS_DA_FOTO) {
  const base = join(DESTINO, `interior-${largura}`);
  const redimensionada = imagem.clone().resize({ width: largura });
  await redimensionada.clone().avif({ quality: 58, effort: 7, chromaSubsampling: '4:4:4' }).toFile(`${base}.avif`);
  await redimensionada.clone().webp({ quality: 82, effort: 6 }).toFile(`${base}.webp`);
  console.log(`interior-${largura}: ${kb(`${base}.avif`)} (AVIF), ${kb(`${base}.webp`)} (WebP)`);
}

const faixasNaOriginal = mascaraDasFaixas(original);
const faixas = await prepararMascara(faixasNaOriginal, 1.2);
// O brilho nasce só do que é faixa de verdade (o reflexo fraco não brilha) e se espalha.
const forte = Buffer.from(faixasNaOriginal.map((v) => (v > 140 ? Math.min(255, Math.round((v - 140) * 2.2)) : 0)));
const brilho = await prepararMascara(forte, 22);
const telas = await prepararMascara(await mascaraDasTelas(), 2.5);
const janelas = await prepararMascara(await rasterizar(JANELAS), 6);
const acesas = Buffer.from(telas.map((v, i) => Math.max(v, faixas[i])));
// O brilho borrado fica fraco demais no alfa: realçado, para o halo aparecer.
const brilhoRealcado = Buffer.from(brilho.map((v) => Math.min(255, Math.round(v * 2.4))));

for (const [mascara, nome, largura] of [
  [faixas, 'faixas', LARGURA_DAS_MASCARAS],
  [brilhoRealcado, 'faixas-brilho', LARGURA_DOS_BRILHOS],
  [telas, 'telas', LARGURA_DAS_MASCARAS],
  [acesas, 'acesas', LARGURA_DAS_MASCARAS],
  [janelas, 'janelas', LARGURA_DOS_BRILHOS],
]) {
  const caminho = await gravarMascara(mascara, nome, largura);
  console.log(`${nome}: ${kb(caminho)}`);
}

// A miniatura do convite "Entrar no carro": a multimídia e a luz ambiente do painel, em quadrado.
const miniatura = join(DESTINO, 'miniatura.webp');
await imagem.clone().extract({ left: 1650, top: 1230, width: 700, height: 700 }).resize({ width: 112, height: 112 }).webp({ quality: 86, effort: 6 }).toFile(miniatura);
console.log(`miniatura: ${kb(miniatura)}`);

mkdirSync(DESTINO_DOS_DETALHES, { recursive: true });
for (const { origem, nome, largura, altura, recorte } of DETALHES) {
  const caminho = join(DESTINO_DOS_DETALHES, `${nome}.webp`);
  let foto = sharp(join(FOTOS, origem)).flatten({ background: '#ffffff' });
  if (recorte) foto = foto.extract(recorte);
  await foto.resize({ width: largura, height: altura, fit: 'cover' }).webp({ quality: 82, effort: 6 }).toFile(caminho);
  console.log(`detalhes/${nome}: ${kb(caminho)}`);
}
