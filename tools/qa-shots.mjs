/**
 * QA visual.
 *
 * Captura as rotas públicas nas larguras exigidas pelo plano mestre e confere que nenhum banner
 * é cortado: a proporção renderizada precisa bater com a arte daquele jogo, e nenhum deles pode
 * usar `object-fit: cover`. As imagens ficam em `.qa-shots/`, fora do build.
 *
 *   node tools/qa-shots.mjs                 # todas as rotas, todas as larguras
 *   node tools/qa-shots.mjs --rotas=/,/about
 *   node tools/qa-shots.mjs --larguras=390,1440
 *   BASE_URL=http://localhost:3000 node tools/qa-shots.mjs
 */
import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const SAIDA = path.resolve('.qa-shots');

const ROTAS_PADRAO = [
  '/',
  '/projects',
  '/projects/barbearia',
  '/projects/personal-studio',
  '/projects/salao-feminino',
  '/projects/salao-estetica',
  '/projects/ecommerce',
  '/projects/revalio',
  '/projects/docalio',
  '/projects/gramelio',
  '/novidades',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/support',
  '/revalio/privacy',
  '/revalio/terms',
  '/revalio/support',
  '/revalio/delete-account',
  '/docalio/privacy',
  '/docalio/terms',
  '/docalio/support',
  '/docalio/delete-account',
  '/gramelio/privacy',
  '/gramelio/terms',
  '/gramelio/support',
  '/gramelio/delete-account',
  '/rota-inexistente-404',
];

const LARGURAS_PADRAO = [360, 390, 768, 1024, 1440, 1920];

/*
 * A proporção esperada é por jogo, não global: as artes de Revalio e Docalio são 1672×941 e a do
 * Gramelio chegou em 1536×1024. O que o QA cobra é que a arte apareça inteira, seja qual for a
 * forma dela — medir todas contra um número só reprovaria um banner correto.
 */
const PROPORCAO_BANNER = {
  revalio: 1672 / 941,
  docalio: 1672 / 941,
  gramelio: 1536 / 1024,
};

function argumento(nome, padrao) {
  const encontrado = process.argv.find((valor) => valor.startsWith(`--${nome}=`));
  return encontrado ? encontrado.slice(nome.length + 3).split(',') : padrao;
}

const rotas = argumento('rotas', ROTAS_PADRAO);
const larguras = argumento('larguras', LARGURAS_PADRAO).map(Number);

const nomeDeArquivo = (rota) => (rota === '/' ? 'home' : rota.replace(/^\//, '').replace(/\//g, '-'));

await rm(SAIDA, { recursive: true, force: true });
await mkdir(SAIDA, { recursive: true });

const navegador = await chromium.launch();
const problemas = [];

for (const largura of larguras) {
  const contexto = await navegador.newContext({
    viewport: { width: largura, height: Math.round(largura * 0.72) + 320 },
    deviceScaleFactor: 1,
    // Captura estável: sem piscada nem revelação a meio caminho.
    reducedMotion: 'reduce',
  });
  const pagina = await contexto.newPage();

  for (const rota of rotas) {
    const resposta = await pagina.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
    const status = resposta?.status() ?? 0;
    const esperado = rota.includes('404') ? 404 : 200;
    if (status !== esperado) problemas.push(`${rota} respondeu ${status}, esperado ${esperado}`);

    // Garante que toda imagem preguiçosa entrou em cena antes da captura de página inteira.
    await pagina.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((resolver) => setTimeout(resolver, 350));
      window.scrollTo(0, 0);
      await new Promise((resolver) => setTimeout(resolver, 150));
    });
    await pagina.waitForLoadState('networkidle');

    await pagina.screenshot({
      path: path.join(SAIDA, `${nomeDeArquivo(rota)}-${largura}.png`),
      fullPage: true,
    });

    /*
     * Banners fora de tela não são medidos: na home eles vivem no painel da aba Experimentos,
     * que fica oculto quando outra aba está ativa. Quem confere a proporção nesses casos são as
     * páginas de produto, onde o banner é o hero.
     */
    const banners = await pagina.$$eval('img[src*="banner-final"]', (imagens) =>
      imagens
        .filter((imagem) => imagem.clientWidth > 0 && imagem.clientHeight > 0)
        .map((imagem) => ({
          jogo: imagem.getAttribute('src')?.match(/([a-z]+)-banner-final/)?.[1] ?? '',
          proporcao: imagem.clientWidth / imagem.clientHeight,
          objectFit: getComputedStyle(imagem).objectFit,
          largura: imagem.clientWidth,
        })),
    );

    for (const banner of banners) {
      const esperada = PROPORCAO_BANNER[banner.jogo];
      if (esperada === undefined) {
        problemas.push(`${rota} @${largura}px: banner de jogo desconhecido — sem proporção esperada`);
      } else if (Math.abs(banner.proporcao - esperada) > 0.02) {
        problemas.push(
          `${rota} @${largura}px: banner do ${banner.jogo} com proporção ${banner.proporcao.toFixed(3)}, ` +
            `esperada ${esperada.toFixed(3)} — a arte estaria cortada`,
        );
      }
      if (banner.objectFit === 'cover') {
        problemas.push(`${rota} @${largura}px: banner usando object-fit: cover`);
      }
    }
  }

  await contexto.close();
  console.log(`capturado: ${largura}px`);
}

/*
 * Sem JavaScript.
 *
 * As rotas exigidas pelas lojas precisam responder sem login, sem cookie e sem script. As gavetas
 * são melhoria progressiva: o showcase continua sendo um link comum e a marca continua no HTML.
 */
const semScript = await navegador.newContext({
  javaScriptEnabled: false,
  viewport: { width: 390, height: 844 },
});
const paginaSemScript = await semScript.newPage();

for (const rota of ['/', ...ROTAS_PADRAO.filter((valor) => valor.includes('/privacy') || valor.includes('delete-account') || valor === '/support')]) {
  await paginaSemScript.goto(`${BASE}${rota}`, { waitUntil: 'domcontentloaded' });

  const conteudo = await paginaSemScript.evaluate(() => ({
    main: document.querySelector('main')?.textContent?.trim().length ?? 0,
    titulo: document.querySelector('h1')?.textContent?.trim() ?? '',
    marca: Boolean(document.querySelector('[aria-label="Blajeen Labs"]')),
    linksLegais: document.querySelectorAll('a[href*="/privacy"], a[href*="/terms"]').length,
    pular: document.querySelector('a[href="#conteudo"]')?.textContent?.trim() ?? '',
  }));

  if (conteudo.main < 400) problemas.push(`sem JS, ${rota}: conteúdo principal quase vazio`);
  if (rota !== '/' && conteudo.titulo.length === 0) problemas.push(`sem JS, ${rota}: sem <h1>`);
  if (!conteudo.marca) problemas.push(`sem JS, ${rota}: a logo viva não aparece`);
  if (conteudo.linksLegais === 0) problemas.push(`sem JS, ${rota}: sem links jurídicos`);
  if (conteudo.pular.length === 0) problemas.push(`sem JS, ${rota}: sem skip link`);
}

await semScript.close();
console.log('verificado: navegação sem JavaScript');

await navegador.close();

if (problemas.length > 0) {
  console.error('\nProblemas encontrados:');
  problemas.forEach((problema) => console.error(`  - ${problema}`));
  process.exitCode = 1;
} else {
  console.log(`\nOK — ${rotas.length} rotas x ${larguras.length} larguras em ${SAIDA}`);
}
