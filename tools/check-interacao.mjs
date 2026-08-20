/**
 * QA de interação, teclado e movimento, em navegador real.
 *
 * Cobre o que teste em jsdom não prova: foco visível de verdade, scroll travado sem salto,
 * gaveta de prévia como bottom sheet no mobile, e olhos e gosma completamente estáticos quando
 * o movimento está reduzido ou desligado.
 *
 *   node tools/check-interacao.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const falhas = [];

function conferir(condicao, mensagem) {
  if (!condicao) falhas.push(mensagem);
}

const navegador = await chromium.launch();

// ------------------------------------------------ gaveta principal, teclado

{
  // A gaveta atende telas abaixo de 64rem; a partir daí quem navega é a barra do desktop.
  const contexto = await navegador.newContext({ viewport: { width: 900, height: 900 } });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE, { waitUntil: 'networkidle' });

  const acionador = pagina.getByRole('button', { name: /MENU/ });
  conferir(
    (await acionador.getAttribute('aria-expanded')) === 'false',
    'MENU deveria começar com aria-expanded="false"',
  );

  // Abre pelo teclado, não pelo mouse.
  await acionador.focus();
  await pagina.keyboard.press('Enter');
  await pagina.waitForSelector('[role="dialog"]', { state: 'visible' });

  conferir((await acionador.getAttribute('aria-expanded')) === 'true', 'MENU não marcou aria-expanded');

  const dentro = await pagina.evaluate(() =>
    Boolean(document.querySelector('[role="dialog"]')?.contains(document.activeElement)),
  );
  conferir(dentro, 'o foco não entrou na gaveta ao abrir');

  const travado = await pagina.evaluate(() => document.body.dataset.scrollLocked === 'true');
  conferir(travado, 'o scroll do fundo não foi travado');

  const fundoInerte = await pagina.evaluate(() =>
    [...document.body.children]
      .filter((no) => !no.querySelector('[role="dialog"]'))
      .every((no) => no.hasAttribute('inert') || no.tagName === 'SCRIPT'),
  );
  conferir(fundoInerte, 'o conteúdo de fundo não ficou inerte');

  // O foco não pode escapar da gaveta.
  let escapou = false;
  for (let passo = 0; passo < 25; passo += 1) {
    await pagina.keyboard.press('Tab');
    const aindaDentro = await pagina.evaluate(() =>
      Boolean(document.querySelector('[role="dialog"]')?.contains(document.activeElement)),
    );
    if (!aindaDentro) {
      escapou = true;
      break;
    }
  }
  conferir(!escapou, 'o foco escapou da gaveta ao tabular');

  // Foco visível: o anel precisa existir de verdade.
  const contorno = await pagina.evaluate(() => {
    const ativo = document.activeElement;
    if (!ativo) return null;
    const estilo = getComputedStyle(ativo);
    return { largura: estilo.outlineWidth, estilo: estilo.outlineStyle };
  });
  conferir(
    contorno !== null && contorno.estilo !== 'none' && parseFloat(contorno.largura) > 0,
    `foco sem contorno visível dentro da gaveta (${JSON.stringify(contorno)})`,
  );

  await pagina.keyboard.press('Escape');
  await pagina.waitForSelector('[role="dialog"]', { state: 'detached' });

  const focoVoltou = await pagina.evaluate(
    () => document.activeElement?.textContent?.includes('MENU') ?? false,
  );
  conferir(focoVoltou, 'o foco não voltou para o botão MENU após Esc');
  conferir(
    (await acionador.getAttribute('aria-expanded')) === 'false',
    'MENU continuou com aria-expanded="true" após fechar',
  );
  conferir(
    await pagina.evaluate(() => document.body.dataset.scrollLocked === undefined),
    'o scroll continuou travado após fechar',
  );

  // Fechamento pelo scrim.
  await acionador.click();
  await pagina.waitForSelector('[role="dialog"]', { state: 'visible' });
  await pagina.mouse.click(60, 450);
  await pagina.waitForSelector('[role="dialog"]', { state: 'detached' });

  await contexto.close();
  console.log('gaveta principal: teclado, foco preso, Esc, scrim e retorno de foco');
}

// ------------------------------------ barra do desktop e submenu de jogos

{
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE, { waitUntil: 'networkidle' });

  const barra = pagina.getByRole('navigation', { name: 'Navegação principal' });
  conferir(await barra.isVisible(), 'a barra de navegação deveria aparecer no desktop');
  conferir(
    !(await pagina.getByRole('button', { name: /MENU/ }).isVisible()),
    'o acionador da gaveta não deveria aparecer junto da barra',
  );

  // Sobre, Novidades, Suporte, Contato e Privacidade — Projetos é botão de submenu.
  const destinos = barra.getByRole('link');
  conferir(
    (await destinos.count()) === 5,
    `a barra deveria ter cinco links diretos além de Projetos (${await destinos.count()})`,
  );

  const projetos = pagina.getByRole('button', { name: /Projetos/ });
  const submenu = pagina.locator('#submenu-projetos');
  conferir(
    (await projetos.getAttribute('aria-expanded')) === 'false',
    'Projetos deveria começar recolhido',
  );
  conferir(!(await submenu.isVisible()), 'o submenu deveria começar oculto');

  // Abre por clique — nenhuma navegação do site pode exigir hover.
  await projetos.click();
  await pagina.waitForTimeout(150);
  conferir((await projetos.getAttribute('aria-expanded')) === 'true', 'o clique não abriu Projetos');
  conferir(await submenu.isVisible(), 'o submenu não apareceu ao clicar');

  const jogos = submenu.getByRole('link');
  conferir((await jogos.count()) === 3, `o submenu deveria listar os três jogos (${await jogos.count()})`);
  const icones = await submenu.locator('img').count();
  conferir(icones === 3, `cada jogo precisa do seu ícone (${icones})`);

  // `Esc` fecha e devolve o foco ao acionador.
  await pagina.keyboard.press('Escape');
  await pagina.waitForTimeout(150);
  conferir(!(await submenu.isVisible()), '`Esc` não fechou o submenu');
  conferir(
    await pagina.evaluate(() => document.activeElement?.textContent?.includes('Projetos') ?? false),
    'o foco não voltou para Projetos após `Esc`',
  );

  // Seta para baixo abre e leva o foco ao primeiro jogo.
  await projetos.focus();
  await pagina.keyboard.press('ArrowDown');
  await pagina.waitForTimeout(200);
  conferir(await submenu.isVisible(), 'a seta para baixo não abriu o submenu');
  conferir(
    await pagina.evaluate(() =>
      Boolean(document.querySelector('#submenu-projetos')?.contains(document.activeElement)),
    ),
    'a seta para baixo não levou o foco ao submenu',
  );

  await contexto.close();
  console.log('barra do desktop: seis destinos, submenu por clique e teclado, Esc devolve o foco');
}

// ----------------------------------------- gaveta de prévia, bottom sheet

{
  const contexto = await navegador.newContext({ viewport: { width: 390, height: 844 } });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE, { waitUntil: 'networkidle' });

  const previa = pagina.getByRole('button', { name: /Prévia rápida/ }).first();
  await previa.scrollIntoViewIfNeeded();
  await previa.click();
  const gaveta = pagina.locator('[role="dialog"]');
  await gaveta.waitFor({ state: 'visible' });
  // A entrada leva 300 ms: medir antes disso pega a folha ainda subindo.
  await pagina.waitForTimeout(450);

  const caixa = await gaveta.boundingBox();
  const altura = await pagina.evaluate(() => window.innerHeight);
  conferir(
    caixa !== null && caixa.height <= altura * 0.89,
    `bottom sheet passou de 88dvh (${caixa?.height} de ${altura})`,
  );
  conferir(
    caixa !== null && Math.abs(caixa.y + caixa.height - altura) < 2,
    'bottom sheet não está ancorado na base da tela',
  );

  // Nunca duas camadas: abrir a prévia não pode deixar a gaveta de navegação aberta.
  conferir(
    (await pagina.locator('[role="dialog"]').count()) === 1,
    'existe mais de uma camada modal aberta',
  );

  await pagina.keyboard.press('Escape');
  await gaveta.waitFor({ state: 'detached' });

  await contexto.close();
  console.log('gaveta de prévia: bottom sheet dentro de 88dvh, camada única');
}

// ------------------------------------------------------- movimento reduzido

{
  const contexto = await navegador.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE, { waitUntil: 'networkidle' });
  await pagina.waitForTimeout(500);

  // Espera mais que um ciclo de piscada: se algo fosse piscar, teria piscado aqui.
  await pagina.waitForTimeout(9000);

  const estado = await pagina.evaluate(() => {
    const marcaTipografica = document.querySelector('[aria-label="Blajeen Labs"]');
    const palpebra = marcaTipografica?.querySelector('svg rect:last-of-type');
    const frasco = document.querySelector('[data-adereco="frasco"]');
    return {
      motion: document.documentElement.dataset.motion,
      logoPiscando: document.querySelector('[data-marca="logo"]')?.getAttribute('data-piscando'),
      palpebra: palpebra ? getComputedStyle(palpebra).transform : null,
      animacaoFrasco: frasco ? getComputedStyle(frasco).animationName : null,
      boot: Boolean(document.querySelector('[data-saindo]')),
    };
  });

  conferir(estado.motion === 'off', `data-motion deveria ser "off" com movimento reduzido (${estado.motion})`);
  conferir(estado.logoPiscando === 'false', 'as lentes da logo piscaram com movimento reduzido');
  conferir(
    estado.animacaoFrasco === 'none',
    `o frasco continua flutuando com movimento reduzido (${estado.animacaoFrasco})`,
  );
  conferir(!estado.boot, 'a abertura apareceu mesmo com movimento reduzido');

  // A pálpebra da marca tipográfica do header permanece recolhida.
  conferir(
    estado.palpebra === null || !estado.palpebra.includes('matrix(1, 0, 0, 1'),
    `a pálpebra não está em repouso (${estado.palpebra})`,
  );

  await contexto.close();
  console.log('movimento reduzido: logo, olhos e frasco estáticos, sem abertura');
}

// --------------------------------------------------------- botão MOTION OFF

{
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE, { waitUntil: 'networkidle' });

  conferir(
    (await pagina.evaluate(() => document.documentElement.dataset.motion)) === 'on',
    'o movimento deveria começar ligado quando o sistema não pede redução',
  );

  const botao = pagina.getByRole('button', { name: /MOVIMENTO/ });
  await botao.scrollIntoViewIfNeeded();
  await botao.click();

  conferir(
    (await pagina.evaluate(() => document.documentElement.dataset.motion)) === 'off',
    'o botão MOVIMENTO não desligou o movimento',
  );
  conferir(
    (await botao.getAttribute('aria-pressed')) === 'true',
    'o botão MOVIMENTO não reflete o estado em aria-pressed',
  );

  // O frasco é a decoração animada da home: com o movimento desligado ele precisa parar.
  const frasco = await pagina.evaluate(() => {
    const no = document.querySelector('[data-adereco="frasco"]');
    if (!no) return null;
    const estilo = getComputedStyle(no);
    return { flutua: no.getAttribute('data-flutua'), animacao: estilo.animationName };
  });
  conferir(frasco !== null, 'a home deveria trazer o frasco');
  conferir(
    frasco?.flutua === 'false' && frasco?.animacao === 'none',
    `o frasco continuou animando com MOVIMENTO: DESLIGADO (${JSON.stringify(frasco)})`,
  );

  // A escolha sobrevive à navegação.
  await pagina.reload({ waitUntil: 'networkidle' });
  conferir(
    (await pagina.evaluate(() => document.documentElement.dataset.motion)) === 'off',
    'a escolha de movimento não foi preservada entre carregamentos',
  );

  await contexto.close();
  console.log('botão MOVIMENTO: desliga, informa estado e persiste');
}

// ----------------------------------------------------------------- mascote

{
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  const pagina = await contexto.newPage();
  await pagina.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });

  const mascote = pagina.locator('[data-adereco="mascote"]');
  conferir((await mascote.count()) === 1, 'a página de contato deveria ter um mascote');

  const decorativo = await mascote.evaluate((no) => {
    // O que importa é estar fora da árvore, seja pelo próprio nó ou por um ancestral.
    let escondido = false;
    for (let atual = no; atual; atual = atual.parentElement) {
      if (atual.getAttribute?.('aria-hidden') === 'true') {
        escondido = true;
        break;
      }
    }
    return {
      escondido,
      poses: [...no.querySelectorAll('img')].map((img) => img.getAttribute('alt')),
      eventos: getComputedStyle(no).pointerEvents,
    };
  });
  conferir(decorativo.escondido, 'o mascote precisa ficar fora da árvore de acessibilidade');
  conferir(decorativo.poses.length === 2, `o mascote precisa das duas poses (${decorativo.poses.length})`);
  conferir(
    decorativo.poses.every((alt) => alt === ''),
    'as poses do mascote não podem ter texto alternativo: elas são decorativas',
  );
  conferir(decorativo.eventos === 'none', 'o mascote não pode capturar ponteiro');

  await mascote.scrollIntoViewIfNeeded();
  // Espera as duas poses carregarem: a piscada só começa depois disso.
  await pagina.waitForFunction(
    () => [...document.querySelectorAll('[data-adereco="mascote"] img')].every((img) => img.complete),
    null,
    { timeout: 15000 },
  );

  // Observa por tempo suficiente para pegar ao menos uma piscada.
  const piscou = await pagina.evaluate(async () => {
    const fechado = document.querySelectorAll('[data-adereco="mascote"] img')[1];
    const inicio = Date.now();
    while (Date.now() - inicio < 14000) {
      if (fechado.getAttribute('data-visivel') === 'true') return true;
      await new Promise((resolver) => setTimeout(resolver, 80));
    }
    return false;
  });
  conferir(piscou, 'o mascote não piscou em 14 s');

  await contexto.close();
  console.log('mascote: decorativo, duas poses e piscada viva');
}

{
  const contexto = await navegador.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const pagina = await contexto.newPage();
  await pagina.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
  await pagina.locator('[data-adereco="mascote"]').scrollIntoViewIfNeeded();
  await pagina.waitForTimeout(9000);

  const estado = await pagina.evaluate(() => {
    const poses = document.querySelectorAll('[data-adereco="mascote"] img');
    return {
      aberto: poses[0]?.getAttribute('data-visivel'),
      fechado: poses[1]?.getAttribute('data-visivel'),
    };
  });
  conferir(
    estado.aberto === 'true' && estado.fechado === 'false',
    `com movimento reduzido o mascote deveria ficar de olhos abertos (${JSON.stringify(estado)})`,
  );

  await contexto.close();
  console.log('mascote: estático e de olhos abertos com movimento reduzido');
}

// ---------------------------------------------------- logo: lentes piscando

{
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE, { waitUntil: 'networkidle' });

  const logo = pagina.locator('[data-marca="logo"]');
  conferir((await logo.count()) === 1, 'a home deveria trazer a logo com lentes');

  const lentes = await logo.evaluate((no) => ({
    quantidade: no.querySelectorAll('span[aria-hidden="true"]').length,
    alt: no.querySelector('img')?.getAttribute('alt') ?? '',
  }));
  conferir(lentes.quantidade === 2, `a logo precisa das duas lentes (${lentes.quantidade})`);
  conferir(lentes.alt === 'Blajeen Labs', `a arte da logo precisa nomear a marca (${lentes.alt})`);

  const piscou = await pagina.evaluate(async () => {
    const alvo = document.querySelector('[data-marca="logo"]');
    const inicio = Date.now();
    while (Date.now() - inicio < 14000) {
      if (alvo?.getAttribute('data-piscando') === 'true') return true;
      await new Promise((resolver) => setTimeout(resolver, 40));
    }
    return false;
  });
  conferir(piscou, 'as lentes da logo não piscaram em 14 s');

  await contexto.close();
  console.log('logo: duas lentes, marca nomeada uma vez e piscada viva');
}

// ------------------------------------------- home em rolagem e adereços fixos

{
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE, { waitUntil: 'networkidle' });

  conferir(
    (await pagina.locator('[role="tab"]').count()) === 0,
    'a home voltou a ser de rolagem: não deveria haver abas',
  );

  // As sete seções existem como âncoras reais.
  const ancoras = ['laboratorio', 'experimentos', 'estado', 'hipotese', 'origem', 'proximo'];
  for (const ancora of ancoras) {
    conferir(
      (await pagina.locator(`#${ancora}`).count()) === 1,
      `a seção #${ancora} não existe na home`,
    );
  }

  // "Entrar no laboratório" leva à primeira seção.
  await pagina.getByRole('link', { name: /ENTRAR NO LABORAT/ }).click();
  await pagina.waitForTimeout(500);
  const posicao = await pagina.evaluate(() => {
    const alvo = document.getElementById('laboratorio');
    return alvo ? Math.abs(alvo.getBoundingClientRect().top) : -1;
  });
  conferir(posicao >= 0 && posicao < 140, `o botão do hero não levou à primeira seção (${posicao}px)`);

  /*
   * Os adereços são fixos: acompanham a rolagem, ficam atrás do conteúdo e não capturam ponteiro.
   */
  const adereços = await pagina.evaluate(() => {
    const ler = (seletor) => {
      const no = document.querySelector(seletor);
      if (!no) return null;
      const camada = no.parentElement;
      const estilo = getComputedStyle(camada);
      const caixa = no.getBoundingClientRect();
      return {
        posicao: estilo.position,
        eventos: estilo.pointerEvents,
        z: estilo.zIndex,
        topo: Math.round(caixa.top),
        esquerda: Math.round(caixa.left),
        largura: Math.round(caixa.width),
      };
    };
    return { mascote: ler('[data-adereco="mascote"]'), frasco: ler('[data-adereco="frasco"]') };
  });

  for (const [nome, dados] of Object.entries(adereços)) {
    conferir(dados !== null, `o ${nome} não está na página`);
    conferir(dados?.posicao === 'fixed', `o ${nome} deveria ser fixo (${dados?.posicao})`);
    conferir(dados?.eventos === 'none', `o ${nome} não pode capturar ponteiro`);
    conferir(dados?.z === '0', `o ${nome} deveria ficar atrás do conteúdo (z ${dados?.z})`);
  }

  // Mascote no alto à direita; frasco no pé à esquerda.
  const tela = await pagina.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
  conferir(
    (adereços.mascote?.esquerda ?? 0) > tela.w / 2,
    'o mascote deveria ficar na metade direita da tela',
  );
  conferir(
    (adereços.frasco?.esquerda ?? tela.w) < tela.w / 2,
    'o frasco deveria ficar na metade esquerda da tela',
  );
  conferir(
    (adereços.frasco?.topo ?? 0) > tela.h / 2,
    'o frasco deveria ficar na metade de baixo da tela',
  );

  // Continuam no lugar depois de rolar: é isso que "fixo" significa.
  await pagina.evaluate(() => window.scrollTo(0, 2200));
  await pagina.waitForTimeout(300);
  const depois = await pagina.evaluate(() => {
    const no = document.querySelector('[data-adereco="mascote"]');
    return no ? Math.round(no.getBoundingClientRect().top) : -1;
  });
  conferir(
    Math.abs(depois - (adereços.mascote?.topo ?? 0)) <= 2,
    `o mascote saiu do lugar ao rolar (${adereços.mascote?.topo} → ${depois})`,
  );

  await contexto.close();
  console.log('home em rolagem: sete seções, âncora do hero e adereços fixos nos cantos certos');
}

// -------------------------------------------------------------- skip link

{
  const contexto = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
  const pagina = await contexto.newPage();
  await pagina.goto(BASE, { waitUntil: 'networkidle' });

  await pagina.keyboard.press('Tab');
  const primeiro = await pagina.evaluate(() => ({
    texto: document.activeElement?.textContent?.trim() ?? '',
    href: document.activeElement?.getAttribute('href') ?? '',
  }));
  conferir(
    primeiro.href === '#conteudo',
    `o primeiro alvo de teclado deveria ser o skip link (${JSON.stringify(primeiro)})`,
  );

  await contexto.close();
  console.log('skip link: primeiro alvo de teclado da página');
}

await navegador.close();

if (falhas.length > 0) {
  console.error('\nFalhas:');
  falhas.forEach((falha) => console.error(`  - ${falha}`));
  process.exit(1);
}

console.log('\nOK — interação, teclado e movimento conferidos.');
