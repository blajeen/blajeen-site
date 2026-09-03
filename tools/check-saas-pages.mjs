import assert from 'node:assert/strict';

// Smoke HTTP sem login, sem enviar formulários e sem acessar dados privados.
const origin = process.argv[2] ?? 'http://localhost:3000';
const products = [
  ['clinica-medica', 'doutelio'], ['salao-estetica', 'beautelio'],
  ['barbearia', 'barbelio'], ['personal-studio', 'studelio'],
  ['foodelio', 'foodelio'], ['ecommerce', 'lojalio'],
];

async function get(route) {
  const response = await fetch(`${origin}${route}`, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, `${route}: HTTP ${response.status}`);
  assert.equal(new URL(response.url).pathname, route, `${route}: redirecionamento inesperado`);
  return response;
}

for (const [slug, id] of products) {
  const html = await (await get(`/projects/${slug}`)).text();
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
assert.match(catalog, /6 PRODUTOS ATIVOS/);
for (const [, id] of products) assert.match(catalog, new RegExp(`id="${id}"`));
const pipelio = await (await get('/projects/pipelio')).text();
assert.match(pipelio, /EM BREVE/);
const admin = await (await get('/projects/painel-administrativo')).text();
assert.match(admin, /DISPONÍVEL NOS SAAS/);
const home = await (await get('/')).text();
assert.match(home, /Seis SaaS ativos/);
console.log('OK catálogo, Pipelio em breve, painéis e home');
