/**
 * QA do conduto de energia, em navegador real.
 *
 * O teste de unidade prova a geometria com caixas medidas à mão. Isto aqui prova no site de
 * verdade, na home em cada largura e nas rotas do sitemap (mais os formulários de projeto, que
 * ficam fora dele por serem noindex) em quatro larguras, que:
 * - o corpo do tubo não passa por trás de nenhuma linha de texto, imagem, ícone, botão, link ou
 *   campo do `main`. O tubo é uma camada abaixo de todo o conteúdo; atrás de letras ele atrapalharia
 *   a leitura, e através de um ícone ou botão transparente pareceria defeito. O que recebe foco
 *   ganha 5 px de folga, a largura do anel de foco, que é verde como o líquido. Ficam de fora só as
 *   camadas de fundo decorativas (`aria-hidden`, atrás do conteúdo), que o tubo pode cruzar como
 *   qualquer outro fundo, e a chegada ao botão final, só na borda dele. Só conta o que aparece: a
 *   parte de uma caixa cortada por um ancestral (rolagem própria, overflow escondido, texto só
 *   para leitor de tela) fica de fora. A conferência se repete com os `details` da página abertos;
 * - a página não ganhou rolagem lateral;
 * - sem rolar, a frente do líquido fica em até 70% da altura da tela, com ou sem movimento, e no
 *   fim da página o tubo enche inteiro;
 * - com movimento reduzido ou desligado no botão MOVIMENTO, nada se mexe sem rolagem (a contagem de
 *   desenhos não sobe), a mesma travessia vista de duas rolagens sai idêntica pixel a pixel (a luz
 *   fica presa à página) e o botão final só carrega quando a leitura chega a ele;
 * - com movimento, o líquido chega ao botão final quando se rola até ele, e o laço descansa depois
 *   de 5 s sem interação;
 * - numa navegação dentro do site, o motor mede a página nova sem recriar o contexto WebGL, o tubo
 *   da página anterior não aparece nela (no primeiro quadro, o canvas está escondido ou já mostra a
 *   página nova) e o nível recomeça;
 * - numa página longa, com mais luvas do que o shader desenha de uma vez, a tampa do fim aparece;
 * - no celular o tubo corre na margem estreita, à vista, com o vidro inteiro entre a borda e o
 *   texto;
 * - um salto direto ao fim da página redesenha o canvas no lugar novo (sem tubo fantasma);
 * - a luva de metal do meio de uma travessia sai na tela com o comprimento do desenho (medida em
 *   pixels, na linha de cima do tubo, onde o metal é cinza e o líquido é verde);
 * - se a GPU tirar o contexto e devolver, o tubo volta a desenhar e o laço volta a descansar;
 * - nem o início do motor nem a preparação até o primeiro desenho viram tarefa longa (50 ms), e
 *   95% dos quadros ficam abaixo de 8 ms (o custo típico é de 1 a 2 ms), mesmo rolando a página
 *   toda. O maior quadro é só registrado: uma pausa de coleta de lixo causada por outro código (a
 *   cena 3D do hero) pode cair dentro de um quadro do conduto sem ser custo dele. A criação do
 *   contexto WebGL também é só registrada: é uma chamada única do navegador, feita na folga da
 *   página, e o tempo dela depende do processo da GPU (de 7 a 65 ms medidos, e picos de 300 a
 *   550 ms logo depois de outro contexto ser desmontado, o que este QA faz a cada tamanho e um
 *   Chromium comum também mostra). Rode sobre o build de produção: no modo de desenvolvimento o
 *   React e os módulos sem minificar pesam mais que o próprio conduto;
 * - nenhum erro no console.
 *
 *   node tools/check-conduto.mjs
 *   BASE_URL=http://localhost:3000 node tools/check-conduto.mjs --tamanhos=390x844,1440x900  # tamanhos da home
 *   node tools/check-conduto.mjs --rotas=/about,/contact      # só estas rotas, sem o sitemap
 *   node tools/check-conduto.mjs --tamanhos-das-rotas=390x844 # as rotas só nestes tamanhos
 *   node tools/check-conduto.mjs --sem-rotas                  # só a home e os comportamentos
 *   node tools/check-conduto.mjs --wiki-completa              # todas as fichas da wiki, não a amostra
 */
import { chromium } from 'playwright';
import sharp from 'sharp';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const argTamanhos = process.argv.find((a) => a.startsWith('--tamanhos='));
// Os dez tamanhos da verificação visual do padrão, mais 375 e 430 da conferência de rolagem lateral.
const TAMANHOS = (
  argTamanhos?.slice(11) ??
  '1920x1080,1536x864,1440x900,1366x768,1280x650,1024x600,768x1024,430x932,390x844,375x812,360x640,320x568'
)
  .split(',')
  .map((t) => t.split('x').map(Number));

const falhas = [];
const conferir = (condicao, mensagem) => {
  if (!condicao) falhas.push(mensagem);
};

// Com a GPU de verdade no Windows (Direct3D, como os visitantes); nos outros sistemas, com GPU
// quando houver e o SwiftShader (WebGL por software) quando não houver.
const ARGS_GPU =
  process.platform === 'win32'
    ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist']
    : ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'];
const navegador = await chromium.launch({ args: ARGS_GPU });

// O primeiro WebGL de um navegador recém-aberto paga a partida do processo da GPU, que num
// navegador em uso já está de pé. Um contexto descartável antes das medições tira esse custo delas.
// Ele também diz se o WebGL é por software: aí a cena 3D do hero, desenhada pela CPU, lota o
// processo da GPU e qualquer consulta do conduto espera atrás dela. Tempo medido assim não diz
// nada sobre um visitante, então os limites de tempo só valem com GPU de verdade.
let porSoftware = false;
{
  const aquecer = await navegador.newPage();
  await aquecer.setContent('<canvas></canvas>');
  porSoftware = await aquecer.evaluate(() => {
    const gl = document.querySelector('canvas').getContext('webgl2');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    return /swiftshader|llvmpipe|software/i.test(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '');
  });
  await aquecer.close();
  if (porSoftware) console.log('AVISO: WebGL por software; os limites de tempo por quadro não serão cobrados.');
}

/**
 * O coletor de visitas (Guardelio, no layout) só aceita a origem de produção: fora dela o navegador
 * bloqueia o envio por CORS e o console acusa um erro que não é do site. Em produção, o QA contaria
 * visitas falsas. Aqui ele responde vazio, e o conduto não depende dele.
 */
async function semColetor(contexto) {
  await contexto.route('https://collector.guardelio.com.br/**', (pedido) =>
    pedido.fulfill({ status: 204, body: '', headers: { 'access-control-allow-origin': '*' } }),
  );
}

async function abrir([largura, altura], opcoes = {}, rota = '/') {
  const contexto = await navegador.newContext({
    viewport: { width: largura, height: altura },
    reducedMotion: opcoes.reduzido ? 'reduce' : 'no-preference',
  });
  await semColetor(contexto);
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  pagina.on('pageerror', (e) => erros.push(e.message));
  await pagina.addInitScript((desligado) => {
    try {
      sessionStorage.setItem('blajeen:boot', 'visto');
      if (desligado) localStorage.setItem('blajeen:motion', 'off');
    } catch {
      // Sem armazenamento a abertura roda; o teste só espera um pouco mais.
    }
  }, Boolean(opcoes.desligado));
  await pagina.goto(new URL(rota, BASE).href, { waitUntil: 'networkidle' });
  const pronto = await pagina
    .waitForSelector('[data-conduto-pronto="true"]', { timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  return { contexto, pagina, erros, pronto };
}

const ler = (pagina) =>
  pagina.evaluate(() => {
    const diagnostico = document.querySelector('[data-conduto]')?.conduto;
    const destino = document.querySelector('[data-conduto-destino]');
    return {
      contexto: diagnostico?.contexto ?? Infinity,
      inicio: diagnostico?.inicio ?? Infinity,
      preparacao: diagnostico?.preparacao ?? Infinity,
      maiorQuadro: diagnostico?.maiorQuadro ?? Infinity,
      p95: (() => {
        const q = [...(diagnostico?.quadros ?? [])].sort((a, b) => a - b);
        return q.length ? q[Math.min(q.length - 1, Math.floor(q.length * 0.95))] : Infinity;
      })(),
      desenhos: diagnostico?.desenhos ?? 0,
      nivel: Math.round(diagnostico?.nivel ?? -1),
      total: Math.round(diagnostico?.total ?? -2),
      carregado: destino?.dataset.condutoCarregado === 'true',
    };
  });

/** Altura da frente do líquido na tela, pelo comprimento de arco do nível ao longo do trajeto. */
const frenteNaTela = (pagina) =>
  pagina.evaluate(() => {
    const raiz = document.querySelector('[data-conduto]');
    const c = raiz.conduto;
    const p = c.trajeto.pontos;
    const topo = raiz.getBoundingClientRect().top;
    let s = 0;
    let y = p[p.length - 1][1];
    for (let i = 1; i < p.length; i++) {
      const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      if (s + d >= c.nivel) {
        y = p[i - 1][1] + ((c.nivel - s) / (d || 1)) * (p[i][1] - p[i - 1][1]);
        break;
      }
      s += d;
    }
    return { y: y + topo, tela: window.innerHeight, nivel: c.nivel, total: c.total };
  });

/**
 * Pixels de uma captura, um por entrada, como [r, g, b]. A captura sai sem alfa (3 canais); ler com
 * passo fixo de 4 misturaria os canais de pixels vizinhos.
 */
async function pixels(png) {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const lista = [];
  for (let i = 0; i < data.length; i += info.channels) lista.push([data[i], data[i + 1], data[i + 2]]);
  return lista;
}

// ------------------------------------------------------------------ geometria

/**
 * Rola a página inteira (carrega o que é preguiçoso; o motor remede sozinho) e confere o trajeto
 * contra cada linha de texto, imagem, ícone, botão, link e campo do `main`.
 */
async function conferirGeometria(pagina, rotulo, { tempos: cobrarTempos = false, minimoDeCaixas = 10 } = {}) {
  await pagina.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await pagina.waitForTimeout(800);

  const resultado = await pagina.evaluate(() => {
    const raiz = document.querySelector('[data-conduto]');
    const dados = raiz?.conduto?.trajeto;
    if (!dados) return { semTrajeto: true };
    const base = raiz.getBoundingClientRect();
    const destino = document.querySelector('[data-conduto-destino]');
    const caixas = [];
    // Só o que alguém vê: a parte além da largura da tela está dentro de uma caixa com rolagem
    // própria (a página não tem rolagem lateral, conferido à parte) e fica recortada. `folga` abre a
    // caixa em volta, para o anel de foco.
    const guardar = (r, quem, folga = 0) => {
      const x0 = Math.max(r.left - folga, 0);
      const x1 = Math.min(r.right + folga, window.innerWidth);
      if (x1 - x0 < 1 || r.height < 1) return;
      caixas.push({ x0: x0 - base.left, x1: x1 - base.left, y0: r.top - folga - base.top, y1: r.bottom + folga - base.top, quem });
    };
    // Camada de fundo decorativa: fora da árvore de acessibilidade e atrás do conteúdo, como o
    // próprio tubo (a arte do laboratório atrás das seções, por exemplo). O tubo pode cruzá-la.
    let camadasDeFundo = 0;
    const naCamadaDeFundo = (el) => {
      for (let e = el; e && e !== document.body; e = e.parentElement) {
        if (e.getAttribute('aria-hidden') !== 'true') continue;
        const estilo = getComputedStyle(e);
        if (['absolute', 'fixed'].includes(estilo.position) && Number.parseInt(estilo.zIndex, 10) < 0) return true;
      }
      return false;
    };
    // Conteúdo de um details fechado não aparece até alguém abrir; abrindo, a página muda de
    // tamanho e o motor remede sozinho.
    const visivel = (el) => {
      const fechado = el.closest('details:not([open])');
      if (fechado && !el.closest('summary')) return false;
      const e = getComputedStyle(el);
      return e.visibility !== 'hidden' && e.display !== 'none' && Number(e.opacity) > 0.05;
    };
    const escopo = document.querySelector('main');
    // O que transborda de um ancestral que corta (rolagem própria, overflow escondido, o `sr-only`
    // do texto só para leitor de tela) não aparece: a caixa vale só dentro dele.
    const recortar = (r, el) => {
      let { left, top, right, bottom } = r;
      for (let e = el; e && e !== escopo; e = e.parentElement) {
        const estilo = getComputedStyle(e);
        if (estilo.clip === 'rect(0px, 0px, 0px, 0px)') return null;
        const cortaX = estilo.overflowX !== 'visible';
        const cortaY = estilo.overflowY !== 'visible';
        if (!cortaX && !cortaY) continue;
        const c = e.getBoundingClientRect();
        if (cortaX) {
          left = Math.max(left, c.left);
          right = Math.min(right, c.right);
        }
        if (cortaY) {
          top = Math.max(top, c.top);
          bottom = Math.min(bottom, c.bottom);
        }
      }
      return right - left >= 1 && bottom - top >= 1 ? { left, top, right, bottom, height: bottom - top } : null;
    };
    // Linhas de texto.
    const andador = document.createTreeWalker(escopo, NodeFilter.SHOW_TEXT);
    for (let no = andador.nextNode(); no; no = andador.nextNode()) {
      if (!no.textContent.trim()) continue;
      const pai = no.parentElement;
      if (!pai || pai.closest('script, style, noscript, [data-conduto]') || !visivel(pai)) continue;
      if (destino && destino.contains(pai)) continue;
      const faixa = document.createRange();
      faixa.selectNodeContents(no);
      for (const r of faixa.getClientRects()) {
        const visto = recortar(r, pai);
        if (visto) guardar(visto, `texto "${no.textContent.trim().slice(0, 30)}"`);
      }
    }
    // Mídia, ícones, botões, links e campos. O que recebe foco ganha a folga do anel.
    const focaveis = 'a[href], button, input, select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])';
    for (const el of escopo.querySelectorAll(`img, svg, video, canvas, ${focaveis}`)) {
      if (el.closest('[data-conduto]') || el === destino || !visivel(el)) continue;
      if (naCamadaDeFundo(el)) {
        camadasDeFundo += 1;
        continue;
      }
      const nome = `<${el.tagName.toLowerCase()}> ${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}`;
      const visto = recortar(el.getBoundingClientRect(), el.parentElement);
      if (visto) guardar(visto, nome, el.matches(focaveis) ? 5 : 0);
    }

    const { raio, pontos, chegaAoDestino } = dados;
    const invasoes = new Map();
    for (let i = 1; i < pontos.length; i++) {
      const [ax, ay] = pontos[i - 1];
      const [bx, by] = pontos[i];
      const passos = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 3));
      for (let k = 0; k <= passos; k++) {
        const x = ax + ((bx - ax) * k) / passos;
        const y = ay + ((by - ay) * k) / passos;
        for (const c of caixas) {
          // Círculo do vidro contra o retângulo, com 1 px de tolerância de arredondamento.
          const dx = Math.max(c.x0 - x, 0, x - c.x1);
          const dy = Math.max(c.y0 - y, 0, y - c.y1);
          if (dx * dx + dy * dy < (raio - 1) ** 2 && !invasoes.has(c.quem)) {
            invasoes.set(c.quem, `(${Math.round(x)}, ${Math.round(y)})`);
          }
        }
      }
    }

    let encaixe = null;
    if (destino && chegaAoDestino) {
      const r = destino.getBoundingClientRect();
      const [fx, fy] = pontos[pontos.length - 1];
      const perto = Math.min(Math.abs(fx - (r.left - base.left)), Math.abs(fx - (r.right - base.left)));
      encaixe = { perto, dentroDaAltura: fy - raio >= r.top - base.top - 0.5 && fy + raio <= r.bottom - base.top + 0.5 };
    }
    return {
      raio,
      caixas: caixas.length,
      travessias: dados.travessias.length,
      invasoes: [...invasoes].map(([quem, onde]) => `${quem} em ${onde}`),
      camadasDeFundo,
      encaixe,
      rolagemLateral: document.documentElement.scrollWidth - window.innerWidth,
    };
  });

  if (resultado.semTrajeto) {
    conferir(false, `${rotulo}: o motor não publicou o trajeto (a página não tem o tubo)`);
    return;
  }
  conferir(resultado.caixas >= minimoDeCaixas, `${rotulo}: poucas caixas de conteúdo medidas (${resultado.caixas})`);
  for (const invasao of resultado.invasoes) conferir(false, `${rotulo}: o tubo encosta em ${invasao}`);
  if (resultado.encaixe) {
    conferir(resultado.encaixe.perto < 1, `${rotulo}: o tubo não termina na borda do botão final`);
    conferir(resultado.encaixe.dentroDaAltura, `${rotulo}: a chegada ao botão passa da altura dele`);
  }
  conferir(resultado.rolagemLateral <= 0, `${rotulo}: rolagem lateral de ${resultado.rolagemLateral}px`);
  const tempos = await ler(pagina);
  if (cobrarTempos && !porSoftware) {
    conferir(tempos.inicio < 50, `${rotulo}: iniciar o motor levou ${tempos.inicio.toFixed(1)} ms`);
    conferir(tempos.preparacao < 50, `${rotulo}: a preparação até o primeiro desenho levou ${tempos.preparacao.toFixed(1)} ms`);
    conferir(tempos.p95 < 8, `${rotulo}: 5% dos quadros passou de ${tempos.p95.toFixed(1)} ms`);
  }
  console.log(
    `${rotulo}: raio ${resultado.raio}, ${resultado.travessias} travessia(s), ${resultado.caixas} caixas, ` +
      `${resultado.invasoes.length} invasões, ${resultado.camadasDeFundo} elemento(s) em camada de fundo, ` +
      `chega ao botão: ${Boolean(resultado.encaixe)}` +
      (cobrarTempos
        ? `, contexto ${tempos.contexto.toFixed(1)} ms, início ${tempos.inicio.toFixed(1)} ms, ` +
          `preparação ${tempos.preparacao.toFixed(1)} ms, quadros p95 ${tempos.p95.toFixed(1)} ms ` +
          `(maior ${tempos.maiorQuadro.toFixed(1)} ms)`
        : ''),
  );
}

/**
 * O conteúdo de um `details` fechado não aparece e fica de fora da conferência. Aberto, a página
 * cresce e o motor remede: confere de novo com todos abertos.
 */
async function conferirComDetailsAbertos(pagina, rotulo, opcoes = {}) {
  const abertos = await pagina.evaluate(() => {
    const fechados = [...document.querySelectorAll('main details:not([open])')];
    for (const d of fechados) d.open = true;
    return fechados.length;
  });
  if (!abertos) return;
  await pagina.waitForTimeout(600);
  await conferirGeometria(pagina, `${rotulo} (${abertos} details abertos)`, opcoes);
}

// ------------------------------------------------------------------ home em cada largura

for (const tamanho of TAMANHOS) {
  const rotulo = `/ ${tamanho.join('x')}`;
  const { contexto, pagina, erros, pronto } = await abrir(tamanho);
  conferir(pronto, `${rotulo}: o conduto não ficou pronto`);
  if (pronto) {
    await conferirGeometria(pagina, rotulo, { tempos: true, minimoDeCaixas: 50 });
    await conferirComDetailsAbertos(pagina, rotulo, { minimoDeCaixas: 50 });
  }
  for (const erro of erros) conferir(false, `${rotulo}: erro no console: ${erro}`);
  await contexto.close();
}

// ------------------------------------------------------------------ todas as rotas do sitemap

if (!process.argv.includes('--sem-rotas')) {
  const argRotas = process.argv.find((a) => a.startsWith('--rotas='));
  let rotas;
  if (argRotas) {
    rotas = argRotas.slice(8).split(',');
  } else {
    // O sitemap lista as páginas públicas indexáveis: rota nova entra no QA sozinha.
    const xml = await (await fetch(new URL('/sitemap.xml', BASE))).text();
    rotas = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    rotas = [...new Set(rotas)].filter((r) => r !== '/');
    // A wiki tem centenas de fichas no mesmo molde: por padrão entram a capa, cada categoria e a
    // primeira ficha de cada categoria. A varredura completa fica no `--wiki-completa`.
    if (!process.argv.includes('--wiki-completa')) {
      const vistas = new Set();
      rotas = rotas.filter((r) => {
        const partes = r.split('/').filter(Boolean);
        if (partes[0] !== 'morvelio' || partes[1] !== 'wiki' || partes.length <= 3) return true;
        if (vistas.has(partes[2])) return false;
        vistas.add(partes[2]);
        return true;
      });
    }
    // Os formulários de projeto são públicos e têm campos, mas ficam fora do sitemap (noindex).
    for (const r of rotas.filter((r) => /^\/projects\/[^/]+$/.test(r))) {
      const formulario = `${r}/formulario`;
      if ((await fetch(new URL(formulario, BASE))).ok) rotas.push(formulario);
    }
    rotas.push('/rota-inexistente-404');
  }
  // Três larguras com a margem larga (a mais estreita delas é a do tablet em pé) e o celular,
  // onde o tubo corre na margem estreita, mais fino.
  const argTamanhosDasRotas = process.argv.find((a) => a.startsWith('--tamanhos-das-rotas='));
  const TAMANHOS_DAS_ROTAS = argTamanhosDasRotas
    ? argTamanhosDasRotas.slice(21).split(',').map((t) => t.split('x').map(Number))
    : [
        [1440, 900],
        [1366, 768],
        [768, 1024],
        [390, 844],
      ];
  console.log(`\nRotas: ${rotas.length}, em ${TAMANHOS_DAS_ROTAS.map((t) => t.join('x')).join(' e ')}`);
  for (const rota of rotas) {
    for (const tamanho of TAMANHOS_DAS_ROTAS) {
      const rotulo = `${rota} ${tamanho.join('x')}`;
      const { contexto, pagina, erros, pronto } = await abrir(tamanho, {}, rota);
      // Sem o cabeçalho do site, a rota é HTML estático fora do layout (as páginas legais do
      // Gramelio, por exemplo): ali o tubo não tem como existir, e o QA só avisa.
      const foraDoLayout = !(await pagina.$('body > header.site-header'));
      if (foraDoLayout) {
        console.log(`${rotulo}: fora do layout do site (HTML estático), sem tubo`);
      } else {
        conferir(pronto, `${rotulo}: o conduto não ficou pronto`);
        if (pronto) {
          await conferirGeometria(pagina, rotulo);
          await conferirComDetailsAbertos(pagina, rotulo);
        }
      }
      // A rota de teste do 404 responde 404 de propósito; esse aviso do navegador não é defeito.
      const esperados = rota === '/rota-inexistente-404' ? /status of 404/ : null;
      for (const erro of erros) if (!esperados?.test(erro)) conferir(false, `${rotulo}: erro no console: ${erro}`);
      await contexto.close();
    }
  }
}

// ------------------------------------------------------------------ movimento reduzido e desligado

for (const [nome, opcoes] of [
  ['movimento reduzido pelo sistema', { reduzido: true }],
  ['botão MOVIMENTO desligado', { desligado: true }],
]) {
  const { contexto, pagina, erros, pronto } = await abrir([1440, 900], opcoes);
  conferir(pronto, `${nome}: o conduto não ficou pronto`);
  if (pronto) {
    await pagina.waitForTimeout(500);
    const antes = await ler(pagina);
    await pagina.waitForTimeout(2000);
    const depois = await ler(pagina);
    conferir(antes.nivel > 0 && antes.nivel < antes.total, `${nome}: no topo o tubo deveria estar parcial (${antes.nivel}/${antes.total})`);
    const frente = await frenteNaTela(pagina);
    conferir(
      frente.y <= frente.tela * 0.7 + 2,
      `${nome}: sem rolar, a frente do líquido deveria ficar em até 70% da tela (y ${Math.round(frente.y)} de ${frente.tela})`,
    );
    conferir(depois.desenhos === antes.desenhos, `${nome}: o tubo continua redesenhando parado (${antes.desenhos} → ${depois.desenhos})`);
    conferir(!antes.carregado, `${nome}: o botão final não deveria carregar antes da leitura chegar a ele`);

    // Logo depois de uma travessia, a frente já está na linha de leitura: sem animação, a travessia
    // enche de uma vez quando a linha chega nela, e o líquido não corre de lado junto com a rolagem.
    const yDaTravessia = await pagina.evaluate(
      () => document.querySelector('[data-conduto]').conduto.trajeto.travessias[1],
    );
    await pagina.evaluate((y) => window.scrollTo(0, y), Math.round(yDaTravessia + 900 * 0.2 - 900 * 0.7));
    await pagina.waitForTimeout(400);
    const depoisDaTravessia = await frenteNaTela(pagina);
    conferir(
      Math.abs(depoisDaTravessia.y - depoisDaTravessia.tela * 0.7) <= 2,
      `${nome}: logo depois da travessia, a frente deveria estar na linha de leitura (y ${Math.round(depoisDaTravessia.y)} de ${depoisDaTravessia.tela})`,
    );

    // A mesma travessia, vista de duas rolagens com um reposicionamento do canvas entre elas (ele
    // redesenha tudo). Parado de verdade, o desenho sai idêntico: a luz fica presa à página. Presa à
    // tela, os reflexos mudariam a cada reposicionamento.
    const yTravessia = await pagina.evaluate(
      () => document.querySelector('[data-conduto]').conduto.trajeto.travessias[1],
    );
    const rolagem = Math.max(0, Math.round(yTravessia - 450));
    const passo = 300;
    await pagina.evaluate((y) => window.scrollTo(0, y), rolagem - 200);
    await pagina.waitForTimeout(300);
    await pagina.evaluate((y) => window.scrollTo(0, y), rolagem);
    await pagina.waitForTimeout(400);
    const posicao = () => pagina.evaluate(() => document.querySelector('[data-conduto] canvas').style.transform);
    const posicaoAntes = await posicao();
    const primeira = await pagina.screenshot({ clip: { x: 0, y: 450 - 40, width: 1440, height: 80 } });
    await pagina.evaluate((y) => window.scrollTo(0, y), rolagem + passo);
    await pagina.waitForTimeout(400);
    const moveu = (await posicao()) !== posicaoAntes;
    conferir(moveu, `${nome}: o teste precisava de um reposicionamento do canvas entre as duas vistas`);
    const segunda = await pagina.screenshot({ clip: { x: 0, y: 450 - 40 - passo, width: 1440, height: 80 } });
    const [a, b] = await Promise.all([primeira, segunda].map(pixels));
    let diferentes = 0;
    a.forEach(([r, g, bl], i) => {
      const [r2, g2, b2] = b[i];
      if (Math.max(Math.abs(r - r2), Math.abs(g - g2), Math.abs(bl - b2)) > 6) diferentes += 1;
    });
    conferir(diferentes === 0, `${nome}: o desenho da travessia mudou com a rolagem (${diferentes} px)`);

    // Rolando até o fim, o nível acompanha, sem animação, e o botão final carrega.
    await pagina.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await pagina.waitForTimeout(500);
    const noFim = await ler(pagina);
    conferir(noFim.nivel === noFim.total, `${nome}: no fim da página o tubo deveria estar cheio (${noFim.nivel}/${noFim.total})`);
    conferir(noFim.carregado, `${nome}: no fim da página o botão final deveria estar carregado`);
    console.log(
      `${nome}: nível no topo ${antes.nivel}/${antes.total}, frente no topo em y ${Math.round(frente.y)}, ` +
        `depois da travessia em y ${Math.round(depoisDaTravessia.y)}, desenhos parado ${antes.desenhos} → ${depois.desenhos}, ` +
        `px diferentes entre as duas vistas ${diferentes}`,
    );
  }
  for (const erro of erros) conferir(false, `${nome}: erro no console: ${erro}`);
  await contexto.close();
}

{
  // Numa tela alta (monitor em pé), a faixa da chegada ao botão final termina abaixo da linha de
  // leitura mesmo com a página rolada até o fim: rolar até o fim tem de encher o tubo e carregar o
  // botão assim mesmo.
  const { contexto, pagina, erros, pronto } = await abrir([1440, 2000]);
  conferir(pronto, 'tela alta: o conduto não ficou pronto');
  if (pronto) {
    await pagina.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await pagina
      .waitForFunction(() => document.querySelector('[data-conduto-destino]')?.dataset.condutoCarregado === 'true', null, { timeout: 10000 })
      .catch(() => {});
    const fim = await ler(pagina);
    // A mola assenta a meio pixel do alvo: cheio é chegar a 1 px do fim, como o motor conta.
    conferir(fim.carregado && fim.nivel >= fim.total - 1, `tela alta: no fim da página o tubo deveria estar cheio e o botão carregado (${fim.nivel}/${fim.total})`);
    console.log(`tela alta: no fim da página ${fim.nivel}/${fim.total}, botão carregado ${fim.carregado}`);
  }
  for (const erro of erros) conferir(false, `tela alta: erro no console: ${erro}`);
  await contexto.close();
}

// ------------------------------------------------------------------ com movimento: chegada e descanso

{
  const { contexto, pagina, erros, pronto } = await abrir([1440, 900]);
  conferir(pronto, 'movimento: o conduto não ficou pronto');
  if (pronto) {
    const inicio = await ler(pagina);
    conferir(!inicio.carregado, 'movimento: o botão final não deveria nascer carregado');
    // Depois de encher, a frente do líquido para em até 70% da tela: o resto só com a rolagem.
    await pagina.waitForTimeout(3000);
    const frente = await frenteNaTela(pagina);
    conferir(
      frente.nivel > 0 && frente.y <= frente.tela * 0.7 + 2,
      `movimento: sem rolar, a frente do líquido deveria parar em até 70% da tela (y ${Math.round(frente.y)} de ${frente.tela})`,
    );
    console.log(`movimento: sem rolar, frente do líquido em y ${Math.round(frente.y)} numa tela de ${frente.tela}`);
    // O botão final no alto da tela, como quem terminou de ler o painel: a leitura passou dele.
    await pagina.evaluate(() => {
      const r = document.querySelector('[data-conduto-destino]').getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top - window.innerHeight * 0.2);
    });
    await pagina.waitForFunction(() => document.querySelector('[data-conduto-destino]')?.dataset.condutoCarregado === 'true', null, { timeout: 15000 }).catch(() => {});
    const chegada = await ler(pagina);
    conferir(chegada.carregado, 'movimento: o líquido não chegou ao botão final');

    // A luva do meio da segunda travessia, já com líquido dos dois lados. Na linha de cima do tubo o
    // metal é cinza e o líquido é verde: a sequência de pixels escuros é o comprimento da luva.
    const luva = await pagina.evaluate(() => {
      const t = document.querySelector('[data-conduto]').conduto.trajeto;
      const y = t.travessias[1];
      const xs = t.pontos.filter(([, py]) => Math.abs(py - y) < 0.5).map(([px]) => px);
      return { y, x: (Math.min(...xs) + Math.max(...xs)) / 2, raio: t.raio, meiaLuva: t.meiaLuva };
    });
    await pagina.evaluate((y) => window.scrollTo(0, y), Math.round(luva.y - 450));
    await pagina.waitForTimeout(600);
    const linha = Math.round(450 - luva.raio * 0.5);
    const faixaDaLuva = await pagina.screenshot({ clip: { x: Math.round(luva.x - 60), y: linha, width: 120, height: 1 } });
    const escuros = (await pixels(faixaDaLuva)).filter(([, g]) => g < 150).length;
    const esperado = 2 * luva.meiaLuva * luva.raio;
    conferir(
      escuros >= esperado * 0.6 && escuros <= esperado * 1.5,
      `movimento: a luva da travessia saiu com ${escuros} px (o desenho pede ${esperado.toFixed(0)})`,
    );
    console.log(`luva da travessia: ${escuros} px na tela, desenho ${esperado.toFixed(0)} px`);

    // Parado, o laço descansa depois de 5 s.
    await pagina.mouse.move(5, 5);
    await pagina.waitForTimeout(6500);
    const a = await ler(pagina);
    await pagina.waitForTimeout(1500);
    const b = await ler(pagina);
    conferir(a.desenhos === b.desenhos, `movimento: o laço não descansou sem interação (${a.desenhos} → ${b.desenhos})`);
    await pagina.mouse.wheel(0, -200);
    await pagina.waitForTimeout(600);
    const c = await ler(pagina);
    conferir(c.desenhos > b.desenhos, 'movimento: a rolagem não acordou o líquido');
    console.log(`movimento: carregado ${chegada.carregado}, desenhos em descanso ${a.desenhos} → ${b.desenhos}, depois da rolagem ${c.desenhos}`);

  }
  for (const erro of erros) conferir(false, `movimento: erro no console: ${erro}`);
  await contexto.close();
}

// ------------------------------------------------------------------ navegação dentro do site

{
  // Da home para os trabalhos por um link: o motor mede a página nova sem recriar o contexto WebGL,
  // o tubo da home não aparece na página nova nem por um quadro, e o nível recomeça dela.
  const { contexto, pagina, erros, pronto } = await abrir([1440, 900]);
  conferir(pronto, 'navegação: o conduto não ficou pronto');
  if (pronto) {
    await pagina.waitForTimeout(2500);
    const antes = await pagina.evaluate(() => {
      const raiz = document.querySelector('[data-conduto]');
      const canvas = raiz.querySelector('canvas');
      window.__condutoCanvas = canvas;
      window.__condutoTroca = null;
      const diagnostico = raiz.conduto;
      const medicoes = diagnostico.medicoes;
      // No primeiro quadro depois que a página nova entra no DOM (antes da pintura dele), o canvas
      // tem de estar escondido ou já medido de novo.
      const observador = new MutationObserver(() => {
        if (window.__condutoTroca !== null || document.querySelector('.hx')) return;
        window.__condutoTroca = 'esperando';
        observador.disconnect();
        requestAnimationFrame(() => {
          window.__condutoTroca = { escondido: canvas.style.visibility === 'hidden' || canvas.hidden, medido: diagnostico.medicoes > medicoes };
        });
      });
      observador.observe(document.querySelector('main'), { childList: true, subtree: true });
      return { medicoes, travessias: diagnostico.trajeto.travessias.join(',') };
    });
    await pagina.click('main a[href="/trabalhos"]');
    const chegou = await pagina
      .waitForFunction(
        (medicoes) => {
          const raiz = document.querySelector('[data-conduto]');
          return location.pathname === '/trabalhos' && raiz?.dataset.condutoPronto === 'true' && raiz.conduto.medicoes > medicoes;
        },
        antes.medicoes,
        { timeout: 15000 },
      )
      .then(() => true, () => false);
    conferir(chegou, 'navegação: a página nova não foi medida');
    if (chegou) {
      await pagina.waitForTimeout(3000);
      const depois = await pagina.evaluate(() => ({
        mesmoCanvas: document.querySelector('[data-conduto] canvas') === window.__condutoCanvas,
        travessias: document.querySelector('[data-conduto]').conduto.trajeto.travessias.join(','),
        troca: window.__condutoTroca,
      }));
      conferir(depois.mesmoCanvas, 'navegação: o canvas (e o contexto WebGL) foi recriado');
      conferir(depois.travessias !== antes.travessias, 'navegação: o trajeto continua o da home');
      conferir(
        Boolean(depois.troca?.escondido || depois.troca?.medido),
        `navegação: o tubo da home apareceu na página nova (${JSON.stringify(depois.troca)})`,
      );
      const frente = await frenteNaTela(pagina);
      conferir(
        frente.nivel > 0 && frente.y <= frente.tela * 0.7 + 2,
        `navegação: o nível não recomeçou na página nova (frente em y ${Math.round(frente.y)} de ${frente.tela})`,
      );
      console.log(
        `navegação: mesmo canvas ${depois.mesmoCanvas}, primeiro quadro ${JSON.stringify(depois.troca)}, ` +
          `frente em y ${Math.round(frente.y)} de ${frente.tela}`,
      );
    }
  }
  for (const erro of erros) conferir(false, `navegação: erro no console: ${erro}`);
  await contexto.close();
}

// ------------------------------------------------------------------ página longa: a tampa do fim

{
  // O Notalio tem mais luvas do que o shader desenha de uma vez. No fim da página o tubo está cheio;
  // na coluna do trilho, um pouco fora do eixo, o metal é cinza e o líquido é verde: os pixels
  // escuros nos últimos 60 px do tubo são a tampa.
  const { contexto, pagina, erros, pronto } = await abrir([1440, 900], {}, '/produtos/notalio');
  conferir(pronto, 'página longa: o conduto não ficou pronto');
  if (pronto) {
    await pagina.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await pagina
      .waitForFunction(() => {
        const c = document.querySelector('[data-conduto]').conduto;
        return c.nivel >= c.total - 1;
      }, null, { timeout: 8000 })
      .catch(() => {});
    await pagina.waitForTimeout(300);
    const fim = await pagina.evaluate(() => {
      const raiz = document.querySelector('[data-conduto]');
      const t = raiz.conduto.trajeto;
      const [x, y] = t.pontos[t.pontos.length - 1];
      const topo = raiz.getBoundingClientRect().top;
      return { x, y: y + topo, raio: t.raio, meiaLuva: t.meiaLuva, nivel: raiz.conduto.nivel, total: raiz.conduto.total };
    });
    // Sem o tubo cheio, o vidro vazio também sairia escuro e a medida não diria nada.
    conferir(fim.nivel >= fim.total - 1, `página longa: no fim da página o tubo deveria estar cheio (${Math.round(fim.nivel)}/${Math.round(fim.total)})`);
    const coluna = await pagina.screenshot({
      clip: { x: Math.round(fim.x + fim.raio * 0.5), y: Math.round(fim.y - 60), width: 1, height: 59 },
    });
    const escuros = (await pixels(coluna)).filter(([, g]) => g < 150).length;
    const esperado = 2 * fim.meiaLuva * fim.raio;
    conferir(
      escuros >= esperado * 0.6 && escuros <= esperado * 1.5,
      `página longa: a tampa do fim saiu com ${escuros} px (o desenho pede ${esperado.toFixed(0)})`,
    );
    console.log(`página longa: tampa do fim com ${escuros} px na tela, desenho ${esperado.toFixed(0)} px`);
  }
  for (const erro of erros) conferir(false, `página longa: erro no console: ${erro}`);
  await contexto.close();
}

// ------------------------------------------------------------------ celular: o tubo à vista

{
  // No celular a margem é estreita (uns 16 px) e o tubo corre nela, à vista, como no computador (o
  // titular pediu para ver o tubo no celular). Numa página de uma seção só, o trilho aparece na
  // primeira tela, com o vidro inteiro entre a borda e o texto, e o canvas desenha.
  const { contexto, pagina, erros, pronto } = await abrir([390, 844], {}, '/clearlio/privacy');
  conferir(pronto, 'celular: o conduto não ficou pronto');
  if (pronto) {
    await pagina.waitForTimeout(1500);
    const estado = await pagina.evaluate(() => {
      const raiz = document.querySelector('[data-conduto]');
      const t = raiz.conduto.trajeto;
      const xs = t.pontos.map(([x]) => x);
      return {
        escondido: raiz.querySelector('canvas').hidden,
        desenhos: raiz.conduto.desenhos,
        raio: t.raio,
        menorX: Math.min(...xs),
        maiorX: Math.max(...xs),
        largura: window.innerWidth,
      };
    });
    const inteiro = estado.menorX - estado.raio >= 0 && estado.maiorX + estado.raio <= estado.largura;
    conferir(
      !estado.escondido && estado.desenhos > 0 && inteiro && estado.raio >= 4.5,
      `celular: o tubo deveria aparecer inteiro na margem (${JSON.stringify(estado)})`,
    );
    console.log(
      `celular: canvas à vista ${!estado.escondido}, desenhos ${estado.desenhos}, raio ${estado.raio.toFixed(1)}, ` +
        `eixo entre x ${estado.menorX.toFixed(1)} e ${estado.maiorX.toFixed(1)} numa tela de ${estado.largura}`,
    );
  }
  for (const erro of erros) conferir(false, `celular: erro no console: ${erro}`);
  await contexto.close();
}

// ------------------------------------------------------------------ GPU reiniciada

{
  // O navegador tira o contexto WebGL e devolve. O tubo tem de voltar a desenhar e o laço, a
  // descansar, sem girar à toa esperando uma compilação que nunca termina. O caso só existe onde a
  // GPU expõe a compilação paralela (KHR_parallel_shader_compile), então este trecho abre um
  // navegador com a GPU de verdade no Windows; sem a extensão, ele avisa que não exercitou o caso.
  const comGpu = await chromium.launch({ args: ARGS_GPU });
  const contexto = await comGpu.newContext({ viewport: { width: 1440, height: 900 } });
  await semColetor(contexto);
  const pagina = await contexto.newPage();
  const erros = [];
  pagina.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
  await pagina.addInitScript(() => sessionStorage.setItem('blajeen:boot', 'visto'));
  await pagina.goto(BASE, { waitUntil: 'networkidle' });
  const pronto = await pagina.waitForSelector('[data-conduto-pronto="true"]', { timeout: 20000 }).then(() => true, () => false);
  conferir(pronto, 'contexto: o conduto não ficou pronto');
  if (pronto) {
    const paralela = await pagina.evaluate(() =>
      Boolean(document.querySelector('[data-conduto] canvas')?.getContext('webgl2')?.getExtension('KHR_parallel_shader_compile')),
    );
    await pagina.evaluate(async () => {
      const extensao = document.querySelector('[data-conduto] canvas').getContext('webgl2').getExtension('WEBGL_lose_context');
      extensao.loseContext();
      await new Promise((r) => setTimeout(r, 300));
      extensao.restoreContext();
    });
    await pagina.waitForTimeout(800);
    const antes = await ler(pagina);
    await pagina.mouse.wheel(0, 120);
    await pagina.waitForTimeout(800);
    const voltou = await ler(pagina);
    conferir(voltou.desenhos > antes.desenhos, 'contexto devolvido: o tubo não voltou a desenhar');
    await pagina.waitForTimeout(6500);
    const r1 = await ler(pagina);
    await pagina.waitForTimeout(1500);
    const r2 = await ler(pagina);
    conferir(r1.desenhos === r2.desenhos, `contexto devolvido: o laço não voltou a descansar (${r1.desenhos} → ${r2.desenhos})`);
    console.log(
      `contexto devolvido${paralela ? '' : ' (AVISO: sem compilação paralela neste navegador, caso não exercitado)'}: ` +
        `desenhos ${antes.desenhos} → ${voltou.desenhos}, em descanso ${r1.desenhos} → ${r2.desenhos}`,
    );
  }
  for (const erro of erros) conferir(false, `contexto: erro no console: ${erro}`);
  await comGpu.close();
}

// ------------------------------------------------------------------ salto ao fim da página

{
  // No celular o tubo termina bem acima do rodapé. Um salto direto ao fim reposiciona o canvas;
  // ele tem de ser redesenhado ali (vazio), e não mostrar o último quadro no lugar novo.
  const { contexto, pagina, erros, pronto } = await abrir([390, 844]);
  conferir(pronto, 'salto: o conduto não ficou pronto');
  if (pronto) {
    await pagina.waitForTimeout(2500);
    const antes = await ler(pagina);
    await pagina.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await pagina.waitForTimeout(700);
    const depois = await ler(pagina);
    conferir(depois.desenhos > antes.desenhos, 'salto: o canvas mudou de lugar sem redesenhar');
    const png = await pagina.screenshot();
    const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
    let verdes = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (data[i + 1] > 190 && data[i] > 140 && data[i + 2] < 120) verdes += 1;
    }
    // O verde ácido esperado no rodapé é o de texto e ícones; um trilho fantasma de 8 px de
    // largura por centenas de altura passaria disso com folga.
    conferir(verdes < 1500, `salto: ${verdes} px de verde ácido na tela depois do salto`);
    console.log(`salto ao fim: desenhos ${antes.desenhos} → ${depois.desenhos}, px verdes ${verdes}`);
  }
  for (const erro of erros) conferir(false, `salto: erro no console: ${erro}`);
  await contexto.close();
}

await navegador.close();

if (falhas.length) {
  console.error(`\n${falhas.length} falha(s):\n- ${falhas.join('\n- ')}`);
  process.exit(1);
}
console.log('\nOK — conduto: geometria, nível, movimento, descanso, navegação, tampa, contexto e salto conferidos.');
