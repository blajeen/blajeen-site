import assert from 'node:assert/strict';
import sharp from 'sharp';

// Smoke HTTP sem login, sem enviar formulários e sem acessar dados privados.
const origin = process.argv[2] ?? 'http://localhost:3000';
// O Doutelio tem página própria; os outros SaaS são módulos do Espacelio, numa página só.
const products = [['clinica-medica', 'doutelio'], ['doutelio', 'doutelio']];
const modulos = [
  ['barbelio', 'barbearias'], ['beautelio', 'estetica'], ['studelio', 'estudios'],
  ['foodelio', 'restaurantes'], ['lojalio', 'lojas'],
];
const antigos = [
  ['barbelio', 'barbearias'], ['barbearia', 'barbearias'], ['beautelio', 'estetica'], ['salao-estetica', 'estetica'],
  ['studelio', 'estudios'], ['personal-studio', 'estudios'], ['lojalio', 'lojas'], ['ecommerce', 'lojas'],
  ['foodelio', 'restaurantes'], ['pipelio', 'crm'], ['painel-administrativo', 'paineis'],
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
assert.match(catalog, /2 PRODUTOS ATIVOS/);
for (const id of ['espacelio', 'doutelio']) assert.match(catalog, new RegExp(`id="${id}"`));
const espacelio = await (await get('/projects/espacelio')).text();
await checkRenderedImages(espacelio, '/projects/espacelio');
for (const [id, ancora] of modulos) {
  assert.match(espacelio, new RegExp(`id="${ancora}"`), `espacelio: falta a seção de ${id}`);
  assert.ok(espacelio.includes(`/saas/${id}/1.webp`), `espacelio: falta a demonstração de ${id}`);
}
assert.match(espacelio, /id="crm"/);
assert.match(espacelio, /id="paineis"/);
for (const [antigo, ancora] of antigos) {
  const resposta = await fetch(`${origin}/projects/${antigo}`, { redirect: 'manual', signal: AbortSignal.timeout(60000) });
  assert.equal(resposta.status, 308, `/projects/${antigo}: deveria redirecionar`);
  assert.equal(new URL(resposta.headers.get('location'), origin).pathname + new URL(resposta.headers.get('location'), origin).hash,
    `/projects/espacelio#${ancora}`, `/projects/${antigo}: destino errado`);
}
const home = await (await get('/')).text();
await checkRenderedImages(home, '/');
const morvelio = await (await get('/projects/morvelio')).text();
assert.match(morvelio, /morvelio-icon-montanha-nome-v04\.webp/);
await checkRenderedImages(morvelio, '/projects/morvelio');
console.log(`OK catálogo, Espacelio com módulos, CRM e painéis, redirecionamentos, home e Morvelio; ${checkedImages.size} imagens renderizadas válidas`);

for (const id of ['docalio', 'gramelio']) {
  const html = await (await get(`/projects/${id}`)).text();
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/.exec(html)?.[1];
  assert.ok(main, `${id}: conteúdo principal ausente`);
  assert.match(main, /DISPONÍVEL/, `${id}: estado disponível ausente`);
  assert.doesNotMatch(main, /EM DESENVOLVIMENTO|não existe\s+build público|Ainda não há build público|Em breve na/);
  await checkRenderedImages(html, `/projects/${id}`);
}
const news = await (await get('/novidades')).text();
for (const id of ['docalio', 'gramelio']) {
  assert.equal((news.match(new RegExp(`id="${id}-disponivel"`, 'g')) ?? []).length, 1, `${id}: anúncio ausente ou duplicado`);
  assert.ok(news.includes(`href="/projects/${id}"`), `${id}: anúncio sem destino`);
}
console.log('OK Gramelio e Docalio disponíveis, com anúncios individuais nas novidades');
