import assert from 'node:assert/strict';
import sharp from 'sharp';

// Smoke HTTP sem login, sem enviar formulários e sem acessar dados privados.
const origin = process.argv[2] ?? 'http://localhost:3000';
const products = [
  ['clinica-medica', 'doutelio'], ['salao-estetica', 'beautelio'],
  ['barbearia', 'barbelio'], ['personal-studio', 'studelio'],
  ['foodelio', 'foodelio'], ['ecommerce', 'lojalio'],
];
const checkedImages = new Set();

// Validar apenas o arquivo original não detecta um otimizador bloqueado.
// Confere as URLs realmente emitidas em img/srcset no HTML entregue ao navegador.
async function checkRenderedImages(html, route) {
  const tags = html.match(/<img\b[^>]*>/g) ?? [];
  assert.ok(tags.length, `${route}: nenhuma imagem renderizada`);
  for (const tag of tags) {
    const src = /\bsrc="([^"]+)"/.exec(tag)?.[1];
    assert.ok(src, `${route}: imagem sem src`);
    const srcset = /\bsrcSet="([^"]+)"/i.exec(tag)?.[1];
    const candidates = [src, ...(srcset?.split(',').map(item => item.trim().split(/\s+/)[0]) ?? [])];
    for (const candidate of candidates) {
      const url = new URL(candidate.replaceAll('&amp;', '&'), origin);
      assert.equal(url.origin, new URL(origin).origin, `${route}: imagem externa inesperada`);
      assert.notEqual(url.pathname, '/_next/image', `${route}: voltou a depender do otimizador`);
      if (checkedImages.has(url.href)) continue;
      const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
      assert.equal(response.status, 200, `${url.pathname}: HTTP ${response.status}`);
      assert.match(response.headers.get('content-type') ?? '', /^image\//);
      const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
      assert.ok(metadata.width > 0 && metadata.height > 0, `${url.pathname}: imagem inválida`);
      checkedImages.add(url.href);
    }
  }
}

async function get(route) {
  const response = await fetch(`${origin}${route}`, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, `${route}: HTTP ${response.status}`);
  assert.equal(new URL(response.url).pathname, route, `${route}: redirecionamento inesperado`);
  return response;
}

for (const [slug, id] of products) {
  const html = await (await get(`/projects/${slug}`)).text();
  await checkRenderedImages(html, `/projects/${slug}`);
  assert.match(html, /Ativo · Disponível/, `${id}: estado não publicado`);
  assert.equal((html.match(/<figure\b/g) ?? []).length, 3, `${id}: quantidade de imagens`);
  assert.match(html, /dados, fotos, preços e operações fictícios/, `${id}: falta o aviso da demo`);
  assert.match(html, /Abrir demonstração/, `${id}: falta o acesso à demo`);
  for (const index of [1, 2, 3]) {
    const route = `/saas/${id}/${index}.webp`;
    assert.ok(html.includes(route), `${id}: imagem não referenciada ${index}`);
    const response = await get(route);
    assert.match(response.headers.get('content-type') ?? '', /^image\/webp/);
  }
  console.log(`OK ${slug}: página pública, 3 imagens e acesso à demo`);
}

const catalog = await (await get('/projects')).text();
await checkRenderedImages(catalog, '/projects');
assert.match(catalog, /6 PRODUTOS ATIVOS/);
for (const [, id] of products) assert.match(catalog, new RegExp(`id="${id}"`));
const pipelio = await (await get('/projects/pipelio')).text();
assert.match(pipelio, /EM BREVE/);
const admin = await (await get('/projects/painel-administrativo')).text();
assert.match(admin, /DISPONÍVEL NOS SAAS/);
const home = await (await get('/')).text();
await checkRenderedImages(home, '/');
assert.match(home, /Seis SaaS ativos/);
const dogolio = await (await get('/projects/dogolio')).text();
assert.match(dogolio, /dogolio-icon-cyberpunk-gray-512\.webp/);
await checkRenderedImages(dogolio, '/projects/dogolio');
console.log(`OK catálogo, Pipelio em breve, painéis, home e Dogolio; ${checkedImages.size} imagens renderizadas válidas`);
