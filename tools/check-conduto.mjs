/**
 * QA do conduto de energia, em navegador real.
 *
 * O teste de unidade prova a geometria com caixas medidas à mão. Isto aqui prova na página de
 * verdade, em cada largura, que:
 * - o corpo do tubo não encosta em nenhuma linha de texto, imagem, botão, link ou campo (a chegada
 *   ao botão final é a única exceção, e só na borda dele), nos dez tamanhos do padrão e em 375 e
 *   430 de largura;
 * - a página não ganhou rolagem lateral;
 * - com movimento reduzido ou desligado no botão MOVIMENTO, o tubo aparece cheio e parado: a
 *   contagem de desenhos não sobe sem rolagem, e rolar para longe e voltar dá o mesmo desenho, pixel
 *   a pixel (a luz fica presa à página); o botão final já está carregado;
 * - com movimento, o líquido chega ao botão final quando se rola até ele, e o laço descansa depois
 *   de 5 s sem interação;
 * - um salto direto ao fim da página redesenha o canvas no lugar novo (sem tubo fantasma);
 * - a luva de metal do meio de uma travessia sai na tela com o comprimento do desenho (medida em
 *   pixels, na linha de cima do tubo, onde o metal é cinza e o líquido é verde);
 * - se a GPU tirar o contexto e devolver, o tubo volta a desenhar e o laço volta a descansar;
 * - nem o início do motor nem a preparação até o primeiro desenho viram tarefa longa (50 ms), e
 *   95% dos quadros ficam abaixo de 8 ms (o custo típico é de 1 a 2 ms), mesmo rolando a página
 *   toda. O maior quadro é só registrado: uma pausa de coleta de lixo causada por outro código (a
 *   cena 3D do hero) pode cair dentro de um quadro do conduto sem ser custo dele. A criação do
 *   contexto WebGL também é só registrada: é uma chamada única do navegador, feita na folga da
 *   página, e o tempo dela depende do processo da GPU (7 a 45 ms medidos, e picos de 300 a 500 ms
 *   logo depois de outro contexto ser desmontado, o que este QA faz a cada tamanho e um Chromium
 *   comum também mostra). Rode sobre o build
 *   de produção: no modo de desenvolvimento o React e os módulos sem minificar pesam mais que o
 *   próprio conduto;
 * - nenhum erro no console.
 *
 *   node tools/check-conduto.mjs
 *   BASE_URL=http://localhost:3000 node tools/check-conduto.mjs --tamanhos=390x844,1440x900
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

async function abrir([largura, altura], opcoes = {}) {
  const contexto = await navegador.newContext({
    viewport: { width: largura, height: altura },
    reducedMotion: opcoes.reduzido ? 'reduce' : 'no-preference',
  });
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
  await pagina.goto(BASE, { waitUntil: 'networkidle' });
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

// ------------------------------------------------------------------ geometria em cada largura

for (const tamanho of TAMANHOS) {
  const largura = tamanho.join('x');
  const { contexto, pagina, erros, pronto } = await abrir(tamanho);
  conferir(pronto, `${largura}: o conduto não ficou pronto`);
  if (pronto) {
    // Rola a página inteira para carregar tudo o que é preguiçoso; o motor remede sozinho.
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
      const dados = raiz.conduto?.trajeto;
      if (!dados) return { semTrajeto: true };
      const base = raiz.getBoundingClientRect();
      const destino = document.querySelector('[data-conduto-destino]');
      const caixas = [];
      const guardar = (r, quem) => {
        if (r.width < 1 || r.height < 1) return;
        caixas.push({ x0: r.left - base.left, x1: r.right - base.left, y0: r.top - base.top, y1: r.bottom - base.top, quem });
      };
      const visivel = (el) => {
        const e = getComputedStyle(el);
        return e.visibility !== 'hidden' && e.display !== 'none' && Number(e.opacity) > 0.05;
      };
      const escopo = document.querySelector('main');
      // Linhas de texto.
      const andador = document.createTreeWalker(escopo, NodeFilter.SHOW_TEXT);
      for (let no = andador.nextNode(); no; no = andador.nextNode()) {
        if (!no.textContent.trim()) continue;
        const pai = no.parentElement;
        if (!pai || pai.closest('script, style, noscript, [data-conduto]') || !visivel(pai)) continue;
        if (destino && destino.contains(pai)) continue;
        const faixa = document.createRange();
        faixa.selectNodeContents(no);
        for (const r of faixa.getClientRects()) guardar(r, `texto "${no.textContent.trim().slice(0, 30)}"`);
      }
      // Mídia e controles.
      for (const el of escopo.querySelectorAll('img, svg, video, canvas, input, select, textarea, button, a, [role="button"]')) {
        if (el.closest('[data-conduto]') || el === destino || !visivel(el)) continue;
        guardar(el.getBoundingClientRect(), `<${el.tagName.toLowerCase()}> ${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}`);
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
        invasoes: [...invasoes].map(([quem, onde]) => `${quem} em ${onde}`),
        encaixe,
        rolagemLateral: document.documentElement.scrollWidth - window.innerWidth,
      };
    });

    if (resultado.semTrajeto) {
      conferir(false, `${largura}: o motor não publicou o trajeto`);
    } else {
      conferir(resultado.caixas > 50, `${largura}: poucas caixas de conteúdo medidas (${resultado.caixas})`);
      for (const invasao of resultado.invasoes) conferir(false, `${largura}: o tubo encosta em ${invasao}`);
      if (resultado.encaixe) {
        conferir(resultado.encaixe.perto < 1, `${largura}: o tubo não termina na borda do botão final`);
        conferir(resultado.encaixe.dentroDaAltura, `${largura}: a chegada ao botão passa da altura dele`);
      }
      conferir(resultado.rolagemLateral <= 0, `${largura}: rolagem lateral de ${resultado.rolagemLateral}px`);
      const tempos = await ler(pagina);
      if (!porSoftware) {
        conferir(tempos.inicio < 50, `${largura}: iniciar o motor levou ${tempos.inicio.toFixed(1)} ms`);
        conferir(tempos.preparacao < 50, `${largura}: a preparação até o primeiro desenho levou ${tempos.preparacao.toFixed(1)} ms`);
        conferir(tempos.p95 < 8, `${largura}: 5% dos quadros passou de ${tempos.p95.toFixed(1)} ms`);
      }
      console.log(
        `${largura}: raio ${resultado.raio}, ${resultado.caixas} caixas, ${resultado.invasoes.length} invasões, ` +
          `chega ao botão: ${Boolean(resultado.encaixe)}, contexto ${tempos.contexto.toFixed(1)} ms, ` +
          `início ${tempos.inicio.toFixed(1)} ms, ` +
          `preparação ${tempos.preparacao.toFixed(1)} ms, quadros p95 ${tempos.p95.toFixed(1)} ms ` +
          `(maior ${tempos.maiorQuadro.toFixed(1)} ms)`,
      );
    }
  }
  for (const erro of erros) conferir(false, `${largura}: erro no console: ${erro}`);
  await contexto.close();
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
    conferir(antes.nivel === antes.total, `${nome}: o tubo deveria aparecer cheio (${antes.nivel}/${antes.total})`);
    conferir(depois.desenhos === antes.desenhos, `${nome}: o tubo continua redesenhando parado (${antes.desenhos} → ${depois.desenhos})`);
    conferir(antes.carregado, `${nome}: o botão final deveria estar carregado`);

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
    const desenhosAntes = (await ler(pagina)).desenhos;
    const primeira = await pagina.screenshot({ clip: { x: 0, y: 450 - 40, width: 1440, height: 80 } });
    await pagina.evaluate((y) => window.scrollTo(0, y), rolagem + passo);
    await pagina.waitForTimeout(400);
    const redesenhou = (await ler(pagina)).desenhos > desenhosAntes;
    conferir(redesenhou, `${nome}: o teste precisava de um reposicionamento do canvas entre as duas vistas`);
    const segunda = await pagina.screenshot({ clip: { x: 0, y: 450 - 40 - passo, width: 1440, height: 80 } });
    const [a, b] = await Promise.all([primeira, segunda].map((png) => sharp(png).raw().toBuffer()));
    let diferentes = 0;
    for (let i = 0; i < a.length; i += 4) {
      const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]));
      if (d > 6) diferentes += 1;
    }
    conferir(diferentes === 0, `${nome}: o desenho da travessia mudou com a rolagem (${diferentes} px)`);
    console.log(
      `${nome}: cheio ${antes.nivel}/${antes.total}, desenhos parado ${antes.desenhos} → ${depois.desenhos}, ` +
        `px diferentes entre as duas vistas ${diferentes}`,
    );
  }
  for (const erro of erros) conferir(false, `${nome}: erro no console: ${erro}`);
  await contexto.close();
}

// ------------------------------------------------------------------ com movimento: chegada e descanso

{
  const { contexto, pagina, erros, pronto } = await abrir([1440, 900]);
  conferir(pronto, 'movimento: o conduto não ficou pronto');
  if (pronto) {
    const inicio = await ler(pagina);
    conferir(!inicio.carregado, 'movimento: o botão final não deveria nascer carregado');
    await pagina.evaluate(() => document.querySelector('[data-conduto-destino]').scrollIntoView({ block: 'center' }));
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
    const px = await sharp(faixaDaLuva).raw().toBuffer();
    let escuros = 0;
    for (let i = 0; i < px.length; i += 4) if (px[i + 1] < 150) escuros += 1;
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

// ------------------------------------------------------------------ GPU reiniciada

{
  // O navegador tira o contexto WebGL e devolve. O tubo tem de voltar a desenhar e o laço, a
  // descansar, sem girar à toa esperando uma compilação que nunca termina. O caso só existe onde a
  // GPU expõe a compilação paralela (KHR_parallel_shader_compile), então este trecho abre um
  // navegador com a GPU de verdade no Windows; sem a extensão, ele avisa que não exercitou o caso.
  const comGpu = await chromium.launch({ args: ARGS_GPU });
  const contexto = await comGpu.newContext({ viewport: { width: 1440, height: 900 } });
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
console.log('\nOK — conduto: geometria, movimento, descanso, contexto e salto conferidos.');
