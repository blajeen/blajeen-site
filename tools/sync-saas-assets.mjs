import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Imagens oficiais publicadas pelos produtos: telas de demo e prévias ilustrativas.
// Nunca acessa dados de clientes. As legendas do site distinguem cada tipo.
export const sources = [
  { id: 'doutelio', origin: 'https://doutelio.com.br', files: ['imagens/produto/01-agenda.png', 'imagens/produto/03-prontuario.png', 'imagens/produto/10-portal.png'] },
  { id: 'barbelio', origin: 'https://site-barbelio.vercel.app', files: [null, 'product-shots/03.png', 'product-shots/01.png'] },
  { id: 'beautelio', origin: 'https://site-beautelio.vercel.app', files: [null, 'product-shots/02.png', 'product-shots/07.png'] },
  { id: 'studelio', origin: 'https://site-studelio.vercel.app', files: [null, 'product-shots/02.png', 'product-shots/05.png'] },
  { id: 'foodelio', origin: 'https://site-foodelio.vercel.app', files: [null, 'product-shots/03.png', 'product-shots/04.png'] },
  { id: 'lojalio', origin: 'https://site-lojalio.vercel.app', files: [null, 'product-shots/06.png', 'product-shots/04.png'] },
];

for (const product of sources) {
  const folder = path.join('public', 'saas', product.id);
  await mkdir(folder, { recursive: true });
  for (const [index, file] of product.files.entries()) {
    // As capas das demos são capturadas pelo navegador; não sobrescrever essas imagens.
    if (!file) continue;
    const url = `${product.origin}/${file}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
      throw new Error(`Captura indisponível: ${url} (${response.status})`);
    }
    const input = Buffer.from(await response.arrayBuffer());
    const metadata = await sharp(input).metadata();
    const output = await sharp(input).webp({ quality: 92 }).toBuffer();
    await writeFile(path.join(folder, `${index + 1}.webp`), output);
    console.log(`${product.id}/${index + 1}: ${metadata.width}x${metadata.height}, ${output.length} bytes — ${url}`);
  }
}
