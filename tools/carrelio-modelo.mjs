// Prepara o modelo do carro para a web: o GLB do Tripo vem com a textura em 4096² (JPEG de ~2,8 MB),
// índices de 32 bits e extensões que a cena não usa. Este script lê o GLB original e grava a versão
// da página:
//
//   - texturas com no máximo 2048 px de lado, em JPEG (qualidade escolhida para caber no teto);
//   - índices de 16 bits quando a malha tem menos de 65.536 vértices;
//   - sem FB_ngon_encoding (só serve para reimportar em ferramentas FBX) e sem extensões declaradas
//     que nenhum material usa.
//
// Uso: node tools/carrelio-modelo.mjs <original.glb> [saida.glb]
// Saída padrão: public/produtos/carrelio/modelos/jaecoo-5.glb. O original fica fora de public/.

import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entrada = process.argv[2];
const saida = process.argv[3] ?? join(raiz, 'public/produtos/carrelio/modelos/jaecoo-5.glb');
/** Teto do arquivo final, em bytes. */
const TETO = 3 * 1024 * 1024;
const LADO_MAXIMO = 2048;
const QUALIDADES = [88, 85, 82, 79, 76, 72];

if (!entrada) {
  console.error('Uso: node tools/carrelio-modelo.mjs <original.glb> [saida.glb]');
  process.exit(1);
}

const bytes = readFileSync(entrada);
if (bytes.readUInt32LE(0) !== 0x46546c67) throw new Error('O arquivo não é um GLB.');
let posicao = 12;
let json = null;
let binario = null;
while (posicao < bytes.length) {
  const tamanho = bytes.readUInt32LE(posicao);
  const tipo = bytes.readUInt32LE(posicao + 4);
  const pedaco = bytes.subarray(posicao + 8, posicao + 8 + tamanho);
  if (tipo === 0x4e4f534a) json = JSON.parse(pedaco.toString('utf8'));
  else if (tipo === 0x004e4942) binario = pedaco;
  posicao += 8 + tamanho;
}
if (!json || !binario) throw new Error('GLB sem JSON ou sem binário.');

const vistas = json.bufferViews.map((v) => Buffer.from(binario.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength)));

// --------------------------------------------------------------------- índices
for (const primitiva of json.meshes.flatMap((m) => m.primitives)) {
  if (primitiva.extensions?.FB_ngon_encoding) delete primitiva.extensions.FB_ngon_encoding;
  if (primitiva.extensions && Object.keys(primitiva.extensions).length === 0) delete primitiva.extensions;
  if (primitiva.indices === undefined) continue;
  const acessor = json.accessors[primitiva.indices];
  const vertices = json.accessors[primitiva.attributes.POSITION].count;
  if (acessor.componentType !== 5125 || vertices > 65535 || acessor.byteOffset) continue;
  const origem = vistas[acessor.bufferView];
  const curtos = Buffer.alloc(acessor.count * 2);
  for (let i = 0; i < acessor.count; i += 1) curtos.writeUInt16LE(origem.readUInt32LE(i * 4), i * 2);
  vistas[acessor.bufferView] = curtos;
  acessor.componentType = 5123;
}

// --------------------------------------------------------------------- texturas
async function reduzir(imagem) {
  const original = vistas[imagem.bufferView];
  const meta = await sharp(original).metadata();
  const lado = Math.min(LADO_MAXIMO, Math.max(meta.width, meta.height));
  let melhor = null;
  for (const quality of QUALIDADES) {
    const jpeg = await sharp(original).resize(lado, lado, { fit: 'inside' }).jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
    melhor = { jpeg, quality };
    // A geometria pesa o resto: a textura fica com o que sobra do teto.
    if (jpeg.length <= TETO * 0.35) break;
  }
  console.log(`textura ${meta.width}×${meta.height} → ${lado}×${lado}, JPEG ${melhor.quality}, ${(melhor.jpeg.length / 1024).toFixed(0)} KB`);
  vistas[imagem.bufferView] = melhor.jpeg;
  imagem.mimeType = 'image/jpeg';
}
for (const imagem of json.images ?? []) if (imagem.bufferView !== undefined) await reduzir(imagem);

// ------------------------------------------------------------------ extensões
const usadas = new Set();
const procurar = (valor) => {
  if (!valor || typeof valor !== 'object') return;
  if (valor.extensions) for (const nome of Object.keys(valor.extensions)) usadas.add(nome);
  for (const filho of Object.values(valor)) procurar(filho);
};
procurar({ ...json, extensionsUsed: undefined, extensionsRequired: undefined });
if (json.extensionsUsed) json.extensionsUsed = json.extensionsUsed.filter((nome) => usadas.has(nome));
if (json.extensionsUsed?.length === 0) delete json.extensionsUsed;
json.asset.generator = `${json.asset.generator ?? ''} + carrelio-modelo`.trim();

// ------------------------------------------------------------------ remontagem
let deslocamento = 0;
const partes = [];
json.bufferViews.forEach((vista, i) => {
  const dados = vistas[i];
  const preenchimento = (4 - (deslocamento % 4)) % 4;
  if (preenchimento) partes.push(Buffer.alloc(preenchimento));
  deslocamento += preenchimento;
  vista.byteOffset = deslocamento;
  vista.byteLength = dados.length;
  partes.push(dados);
  deslocamento += dados.length;
});
const final = (4 - (deslocamento % 4)) % 4;
if (final) partes.push(Buffer.alloc(final));
const novoBinario = Buffer.concat(partes);
json.buffers = [{ byteLength: novoBinario.length }];

let texto = Buffer.from(JSON.stringify(json), 'utf8');
const espacos = (4 - (texto.length % 4)) % 4;
if (espacos) texto = Buffer.concat([texto, Buffer.alloc(espacos, 0x20)]);
const cabecalho = Buffer.alloc(12);
cabecalho.writeUInt32LE(0x46546c67, 0);
cabecalho.writeUInt32LE(2, 4);
cabecalho.writeUInt32LE(12 + 8 + texto.length + 8 + novoBinario.length, 8);
const pedacoJson = Buffer.alloc(8);
pedacoJson.writeUInt32LE(texto.length, 0);
pedacoJson.writeUInt32LE(0x4e4f534a, 4);
const pedacoBin = Buffer.alloc(8);
pedacoBin.writeUInt32LE(novoBinario.length, 0);
pedacoBin.writeUInt32LE(0x004e4942, 4);
writeFileSync(saida, Buffer.concat([cabecalho, pedacoJson, texto, pedacoBin, novoBinario]));
const tamanho = statSync(saida).size;
console.log(`${saida}: ${(tamanho / 1024 / 1024).toFixed(2)} MB (antes ${(bytes.length / 1024 / 1024).toFixed(2)} MB)`);
if (tamanho > TETO) {
  console.error('Passou de 3 MB.');
  process.exitCode = 1;
}
