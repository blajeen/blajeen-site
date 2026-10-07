// As duas fotos do porta-malas do Carrelio (vazio e cheio) com o carro da mesma cor e o mesmo filtro.
//
// As fotos de divulgação que o titular trouxe (07/10/2026) são de carros de cores diferentes: no
// cheio, azul; no vazio, um cinza esverdeado (de outro mercado). No balão do ponto as duas se
// alternam, e o carro trocava de cor. Pedido do titular: "deixa as cores iguais das fotos dos
// carros" e "a foto do porta-malas cheio ficou um pouco clara, melhor aplicar um filtro".
//
// - O azul de referência é a lataria da foto do cheio, medida no OKLab: o matiz e o croma por faixa
//   de luminosidade (o croma cai nos reflexos e nas sombras).
// - Na foto do vazio, a lataria ganha esse matiz e esse croma. Lataria é o que fica fora da abertura
//   do porta-malas, menos o fundo branco, as lanternas e o preto das borrachas; dentro da abertura,
//   só o que é claramente da cor da lataria (as abas pintadas da coluna e da soleira). A
//   luminosidade passa por uma curva que leva a mediana da lataria do vazio à do cheio: o sombreado
//   e os reflexos continuam os da foto.
// - As duas passam pelo mesmo filtro: meios-tons mais escuros, o branco estourado contido e uma
//   vinheta leve, para o balão escuro da página.
//
// Usado por `tools/carrelio-interior.mjs`, que grava todas as fotos de detalhe.

import { join } from 'node:path';
import sharp from 'sharp';

/** A foto do cheio vem mais larga: o recorte a deixa em 3:2, igual à do vazio. */
const RECORTE_DO_CHEIO = { left: 249, top: 0, width: 1288, height: 859 };
/** A abertura do porta-malas na foto do cheio (já recortada), fora da medida do azul: é a bagagem. */
const ABERTURA_DO_CHEIO = { x0: 110, y0: 90, x1: 1130, y1: 820 };
/** A abertura do porta-malas na foto do vazio (984 × 656), por dentro da borracha. */
const ABERTURA_DO_VAZIO = [
  [175, 0], [160, 60], [128, 160], [110, 260], [100, 400], [102, 540], [130, 582], [250, 592],
  [735, 592], [855, 582], [884, 540], [888, 400], [878, 260], [858, 160], [828, 60], [812, 0],
];
const TAMANHO = { largura: 960, altura: 640 };

const suave = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const srgb = (c) => {
  const v = Math.min(1, Math.max(0, c));
  return v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
};

/** sRGB (0 a 1) para OKLab. */
function oklab(r, g, b) {
  const lr = linear(r);
  const lg = linear(g);
  const lb = linear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab para sRGB (0 a 1). */
function deOklab(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    srgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    srgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    srgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const matiz = (a, b) => ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;

/** Matiz (graus), saturação e valor do HSV. */
function hsv(r, g, b) {
  const maximo = Math.max(r, g, b);
  const minimo = Math.min(r, g, b);
  const d = maximo - minimo;
  let h = 0;
  if (d > 0) {
    if (maximo === r) h = 60 * (((g - b) / d) % 6);
    else if (maximo === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  return [(h + 360) % 360, maximo === 0 ? 0 : d / maximo, maximo];
}

const mediana = (valores) => {
  const ordenados = Float64Array.from(valores).sort();
  return ordenados[Math.floor(ordenados.length / 2)] ?? 0;
};

async function lerFoto(caminho, recorte) {
  let imagem = sharp(caminho).flatten({ background: '#ffffff' }).removeAlpha();
  if (recorte) imagem = imagem.extract(recorte);
  const { data, info } = await imagem.raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const lab = new Float32Array(n * 3);
  const rgb = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = data[i * info.channels] / 255;
    const g = data[i * info.channels + 1] / 255;
    const b = data[i * info.channels + 2] / 255;
    rgb.set([r, g, b], i * 3);
    lab.set(oklab(r, g, b), i * 3);
  }
  return { largura: info.width, altura: info.height, rgb, lab };
}

/** Borrão gaussiano de uma máscara (0 a 1), pelo sharp. */
async function borrar(mascara, largura, altura, sigma) {
  const bytes = Uint8Array.from(mascara, (v) => Math.round(Math.min(1, Math.max(0, v)) * 255));
  const saida = await sharp(bytes, { raw: { width: largura, height: altura, channels: 1 } }).blur(sigma).extractChannel(0).raw().toBuffer();
  return Float32Array.from(saida, (v) => v / 255);
}

/** Um polígono em branco num fundo preto (0 a 1), no tamanho da foto. */
async function poligono(pontos, largura, altura) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}"><rect width="100%" height="100%" fill="#000"/><polygon points="${pontos.map(([x, y]) => `${x},${y}`).join(' ')}" fill="#fff"/></svg>`;
  const bytes = await sharp(Buffer.from(svg)).extractChannel(0).raw().toBuffer();
  return Float32Array.from(bytes, (v) => v / 255);
}

/** O azul da lataria na foto do cheio: o matiz, a luminosidade mediana e o croma por luminosidade. */
function medirAzul(foto) {
  const { largura, altura, rgb, lab } = foto;
  const matizes = [];
  const pontos = [];
  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const { x0, y0, x1, y1 } = ABERTURA_DO_CHEIO;
      if (x >= x0 && x < x1 && y >= y0 && y < y1) continue;
      const i = y * largura + x;
      const [h, s, v] = hsv(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
      if (h < 200 || h > 235 || s < 0.3 || v < 0.2) continue;
      const [L, a, b] = [lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2]];
      matizes.push(matiz(a, b));
      pontos.push([L, Math.hypot(a, b)]);
    }
  }
  // O croma mediano em 17 faixas de luminosidade; as faixas com pouca amostra ficam de fora.
  const faixas = [];
  for (let k = 0; k < 17; k++) {
    const de = 0.1 + (k * 0.85) / 17;
    const ate = de + 0.85 / 17;
    const cromas = pontos.filter(([L]) => L >= de && L < ate).map(([, C]) => C);
    if (cromas.length > 200) faixas.push([(de + ate) / 2, mediana(cromas)]);
  }
  return { matiz: mediana(matizes), luminosidade: mediana(pontos.map(([L]) => L)), faixas };
}

/** O croma do azul numa luminosidade: interpolado nas faixas, indo a zero no preto e no branco. */
function cromaDoAzul(faixas, L) {
  const nos = [[0, 0], ...faixas, [1, 0]];
  for (let k = 1; k < nos.length; k++) {
    const [l0, c0] = nos[k - 1];
    const [l1, c1] = nos[k];
    if (L <= l1) return c0 + ((c1 - c0) * (L - l0)) / Math.max(1e-6, l1 - l0);
  }
  return 0;
}

/** A foto do vazio com a lataria no azul do cheio. */
async function pintarDeAzul(foto, azul) {
  const { largura, altura, rgb, lab } = foto;
  const n = largura * altura;
  const abertura = await poligono(ABERTURA_DO_VAZIO, largura, altura);
  const fora = await borrar(abertura.map((v) => 1 - v), largura, altura, 2);
  const bruto = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const [, s, v] = hsv(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
    const [L, a, b] = [lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2]];
    const C = Math.hypot(a, b);
    const h = matiz(a, b);
    const fundo = suave(0.8, 0.9, v) * (1 - suave(0.045, 0.08, s));
    const lanterna = suave(0.03, 0.06, C) * (h < 70 || h > 320 ? 1 : 0);
    const borracha = 1 - suave(0.2, 0.32, L);
    const daLataria = suave(0.008, 0.014, C) * suave(170, 182, h) * (1 - suave(242, 254, h));
    bruto[i] = Math.max(fora[i], daLataria) * (1 - fundo) * (1 - lanterna) * (1 - borracha);
  }
  const peso = await borrar(bruto, largura, altura, 0.8);
  const luminosidades = [];
  for (let i = 0; i < n; i++) if (peso[i] > 0.6) luminosidades.push(lab[i * 3]);
  const gama = Math.log(azul.luminosidade) / Math.log(mediana(luminosidades));
  const h = (azul.matiz * Math.PI) / 180;
  const saida = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const p = peso[i];
    if (p <= 0) {
      saida.set(rgb.subarray(i * 3, i * 3 + 3), i * 3);
      continue;
    }
    const L = Math.max(1e-4, lab[i * 3]) ** gama;
    const C = cromaDoAzul(azul.faixas, L);
    const novo = deOklab(L, C * Math.cos(h), C * Math.sin(h));
    for (let c = 0; c < 3; c++) saida[i * 3 + c] = rgb[i * 3 + c] * (1 - p) + novo[c] * p;
  }
  return { ...foto, rgb: saida };
}

/** O filtro das duas: meios-tons mais escuros, o branco estourado contido e uma vinheta leve. */
function filtrar({ largura, altura, rgb }) {
  const saida = new Float32Array(rgb.length);
  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const i = y * largura + x;
      const [L0, a, b] = oklab(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
      let L = Math.min(1, Math.max(0, L0)) ** 1.16;
      if (L > 0.82) L = 0.82 + (L - 0.82) * 0.55;
      const r = Math.hypot((x - largura / 2) / (largura / 2), (y - altura / 2) / (altura / 2)) / Math.SQRT2;
      L *= 1 - 0.2 * suave(0.35, 1, r);
      saida.set(deOklab(L, a * 1.04, b * 1.04), i * 3);
    }
  }
  return saida;
}

async function gravar({ largura, altura }, rgb, caminho) {
  const bytes = Uint8Array.from(rgb, (v) => Math.round(Math.min(1, Math.max(0, v)) * 255));
  await sharp(bytes, { raw: { width: largura, height: altura, channels: 3 } })
    .resize({ ...{ width: TAMANHO.largura, height: TAMANHO.altura }, fit: 'cover' })
    .webp({ quality: 82, effort: 6 })
    .toFile(caminho);
}

/**
 * Grava `porta-malas-cheio.webp` e `porta-malas-vazio.webp` em `destino`, a partir das fotos em
 * `fotos`. Devolve o azul medido (para conferir com o Azul Gaia do 3D).
 */
export async function prepararPortaMalas(fotos, destino) {
  const cheio = await lerFoto(join(fotos, 'jaecoo-5-porta-malas-cheio-divulgacao.png'), RECORTE_DO_CHEIO);
  const vazio = await lerFoto(join(fotos, 'jaecoo-5-porta-malas-vazio-divulgacao.avif'));
  const azul = medirAzul(cheio);
  const vazioAzul = await pintarDeAzul(vazio, azul);
  await gravar(cheio, filtrar(cheio), join(destino, 'porta-malas-cheio.webp'));
  await gravar(vazioAzul, filtrar(vazioAzul), join(destino, 'porta-malas-vazio.webp'));
  return azul;
}
