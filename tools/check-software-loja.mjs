import assert from 'node:assert/strict';
import sharp from 'sharp';

// Smoke HTTP do software à venda na loja, sem login, sem fazer pedido e sem acessar dados privados.
// Uso: node tools/check-software-loja.mjs <origem>   (padrão: http://localhost:3000)
const origin = process.argv[2] ?? 'http://localhost:3000';
const sistemas = ['lojalio', 'foodelio', 'doutelio', 'beautelio', 'studelio', 'barbelio'];
// Os endereços de quando os sistemas eram SaaS levam ao sistema na loja.
const antigos = [
  ['doutelio', 'doutelio'], ['clinica-medica', 'doutelio'], ['barbelio', 'barbelio'], ['barbearia', 'barbelio'],
  ['beautelio', 'beautelio'], ['salao-estetica', 'beautelio'], ['studelio', 'studelio'], ['personal-studio', 'studelio'],
  ['lojalio', 'lojalio'], ['ecommerce', 'lojalio'], ['foodelio', 'foodelio'],
];
const paraACategoria = ['/projects', '/projects/espacelio', '/projects/pipelio', '/projects/painel-administrativo'];
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

async function destinoDe(route) {
  const resposta = await fetch(`${origin}${route}`, { redirect: 'manual', signal: AbortSignal.timeout(60000) });
  assert.equal(resposta.status, 308, `${route}: deveria redirecionar de vez`);
  const destino = new URL(resposta.headers.get('location'), origin);
  return destino.pathname + destino.hash;
}

const vitrine = await (await get('/loja')).text();
await checkRenderedImages(vitrine, '/loja');
assert.match(vitrine, /id="software"/, 'loja: falta a categoria Software');
assert.match(vitrine, /Sistemas prontos, vendidos inteiros/, 'loja: falta a apresentação do software');
for (const slug of sistemas) assert.ok(vitrine.includes(`href="/loja/${slug}"`), `loja: falta o cartão de ${slug}`);
console.log('OK vitrine: categoria Software com os seis sistemas');

for (const slug of sistemas) {
  const html = await (await get(`/loja/${slug}`)).text();
  await checkRenderedImages(html, `/loja/${slug}`);
  for (const indice of [1, 2, 3]) assert.ok(html.includes(`/loja/software/${slug}/${indice}.webp`), `${slug}: falta a tela ${indice}`);
  assert.match(html, /O QUE VEM NA COMPRA/, `${slug}: falta o que vem na compra`);
  assert.match(html, /vendido uma vez só/, `${slug}: falta a venda única`);
  assert.match(html, /dados, fotos, preços e operações fictícios/, `${slug}: falta o aviso da demonstração`);
  if (/Vendido\./.test(html)) {
    assert.doesNotMatch(html, /Testar a demonstração/, `${slug}: vendido, mas ainda leva à demonstração`);
    console.log(`OK ${slug}: vendido, sem compra e sem os links da demonstração`);
  } else {
    assert.match(html, /Comprar este sistema/, `${slug}: falta a compra`);
    assert.match(html, /Testar a demonstração/, `${slug}: falta a demonstração`);
    console.log(`OK ${slug}: compra, demonstração, o que vem na compra e as três telas`);
  }
}

for (const [antigo, slug] of antigos) assert.equal(await destinoDe(`/projects/${antigo}`), `/loja/${slug}`, `/projects/${antigo}: destino errado`);
for (const route of paraACategoria) assert.equal(await destinoDe(route), '/loja#software', `${route}: destino errado`);
console.log(`OK ${antigos.length + paraACategoria.length} endereços antigos levam à loja; ${checkedImages.size} imagens renderizadas válidas`);
