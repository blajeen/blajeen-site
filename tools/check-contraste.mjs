/**
 * Contraste real do texto sobre as artes de fundo.
 *
 * O site passou a ter ilustração atrás dos textos descritivos. Uma folha de estilo não prova que
 * a leitura continua confortável: o que decide é o pixel efetivamente pintado atrás de cada linha.
 *
 * O método aqui é direto: torna o texto invisível, fotografa a região onde ele estava, procura o
 * pixel **mais claro** dentro dela e calcula o contraste desse pior caso contra a cor do texto.
 * Reprova abaixo de 4,5:1 para texto normal e 3:1 para texto grande, como manda a WCAG AA.
 *
 *   node tools/check-contraste.mjs
 *   BASE_URL=https://blajeen-labs.vercel.app node tools/check-contraste.mjs
 */
import { chromium } from 'playwright';
import sharp from 'sharp';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

const ROTAS = [
  '/',
  '/projects',
  '/projects/barbearia',
  '/projects/personal-studio',
  '/projects/salao-feminino',
  '/projects/salao-estetica',
  '/projects/ecommerce',
  '/projects/revalio',
  '/projects/docalio',
  '/novidades',
  '/about',
  '/contact',
  '/privacy',
  '/revalio/delete-account',
  '/docalio/support',
  '/projects/gramelio',
];

/** Luminância relativa de um canal sRGB de 0 a 255. */
function canal(valor) {
  const v = valor / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminancia(r, g, b) {
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(l1, l2) {
  const [claro, escuro] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (claro + 0.05) / (escuro + 0.05);
}

const navegador = await chromium.launch();
const contexto = await navegador.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});
const pagina = await contexto.newPage();
/*
 * As páginas com `revalidate` regeneram no primeiro acesso depois de um build, e aí `networkidle`
 * pode passar do padrão de 30 s. Um teto maior evita falha intermitente que não é do site.
 */
pagina.setDefaultNavigationTimeout(90000);

const problemas = [];
let medidos = 0;
/** Menor folga encontrada: quanto ainda dá para escurecer o texto ou clarear a arte. */
let pior = { folga: Infinity, razao: 0, minimo: 0, texto: '', rota: '' };

for (const rota of ROTAS) {
  await pagina.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });

  // Percorre todas as abas: cada painel tem a sua própria arte de fundo.
  const abas = await pagina.locator('[role="tab"]').all();
  const passos = abas.length > 0 ? abas : [null];

  for (const aba of passos) {
    if (aba) {
      await aba.click();
      await pagina.waitForTimeout(200);
    }

    // Só o texto que fica sobre alguma arte de fundo interessa.
    const alvos = await pagina.evaluate(() => {
      const dentroDeFundo = (no) => {
        let atual = no.parentElement;
        while (atual) {
          if (atual.querySelector(':scope > [data-adereco="fundo"]')) return true;
          atual = atual.parentElement;
        }
        return false;
      };

      const textos = [...document.querySelectorAll('p, h1, h2, h3, li, a, span')].filter((no) => {
        if (!no.textContent?.trim()) return false;
        if (no.offsetParent === null) return false;
        if (![...no.childNodes].some((filho) => filho.nodeType === 3 && filho.textContent.trim())) {
          return false;
        }
        return dentroDeFundo(no);
      });

      /*
       * Mede a caixa das linhas de texto, não a do elemento.
       *
       * A caixa do elemento inclui bordas e pseudoelementos decorativos — a régua que a classe
       * `regua` desenha abaixo do texto entrava na amostra e reprovava uma linha que nada tem
       * atrás dela. `Range` sobre os nós de texto devolve exatamente onde há glifo.
       */
      const caixaDoTexto = (no) => {
        const rects = [];
        for (const filho of no.childNodes) {
          // Só nós de texto diretos: pontos, ícones e bordas filhas não são o que se lê.
          if (filho.nodeType !== 3 || !filho.textContent.trim()) continue;
          const alcance = document.createRange();
          alcance.selectNodeContents(filho);
          rects.push(...[...alcance.getClientRects()].filter((r) => r.width > 1 && r.height > 1));
        }
        if (rects.length === 0) return no.getBoundingClientRect();
        const esquerda = Math.min(...rects.map((r) => r.left));
        const topo = Math.min(...rects.map((r) => r.top));
        const direita = Math.max(...rects.map((r) => r.right));
        const base = Math.max(...rects.map((r) => r.bottom));
        return { x: esquerda, y: topo, width: direita - esquerda, height: base - topo };
      };

      return textos.map((no) => {
        const caixa = caixaDoTexto(no);
        const estilo = getComputedStyle(no);
        const cor = estilo.color.match(/\d+(\.\d+)?/g).map(Number);
        const tamanho = parseFloat(estilo.fontSize);
        const peso = Number(estilo.fontWeight) || 400;
        return {
          texto: no.textContent.trim().slice(0, 44),
          cor: [cor[0], cor[1], cor[2]],
          // WCAG: "texto grande" é >= 24px, ou >= 18.66px em negrito.
          grande: tamanho >= 24 || (tamanho >= 18.66 && peso >= 700),
          // Coordenadas do documento, não da janela: a captura é de página inteira.
          caixa: {
            x: Math.max(0, Math.round(caixa.x + window.scrollX)),
            y: Math.max(0, Math.round(caixa.y + window.scrollY)),
            largura: Math.round(caixa.width),
            altura: Math.round(caixa.height),
          },
        };
      });
    });

    if (alvos.length === 0) continue;

    // Some com o texto para fotografar apenas o que está atrás dele.
    await pagina.addStyleTag({
      content: 'p,h1,h2,h3,li,a,span{color:transparent!important;text-shadow:none!important}',
    });
    await pagina.waitForTimeout(120);
    const captura = await pagina.screenshot({ fullPage: true });
    await pagina.reload({ waitUntil: 'networkidle' });

    const imagem = sharp(captura);
    const meta = await imagem.metadata();

    for (const alvo of alvos) {
      const { x, y, largura, altura } = alvo.caixa;
      if (largura < 4 || altura < 4) continue;
      if (y + altura > meta.height || x + largura > meta.width) continue;

      const { data, info } = await sharp(captura)
        .extract({ left: x, top: y, width: largura, height: altura })
        .raw()
        .toBuffer({ resolveWithObject: true });

      let maior = 0;
      for (let i = 0; i < data.length; i += info.channels) {
        const l = luminancia(data[i], data[i + 1], data[i + 2]);
        if (l > maior) maior = l;
      }

      const lTexto = luminancia(alvo.cor[0], alvo.cor[1], alvo.cor[2]);
      const razao = contraste(lTexto, maior);
      const minimo = alvo.grande ? 3 : 4.5;
      medidos += 1;

      const folga = razao - minimo;
      if (folga < pior.folga) {
        pior = { folga, razao, minimo, texto: alvo.texto, rota };
      }

      if (razao < minimo) {
        problemas.push(
          `${rota} — "${alvo.texto}" tem ${razao.toFixed(2)}:1 no pior pixel ` +
            `(mínimo ${minimo}:1 para este tamanho)`,
        );
      }
    }

    if (!aba) break;
  }
}

await navegador.close();

console.log(`Contraste conferido em ${medidos} bloco(s) de texto sobre arte de fundo.`);

if (medidos > 0) {
  console.log(
    `Pior caso: ${pior.razao.toFixed(2)}:1 contra mínimo de ${pior.minimo}:1 ` +
      `(folga de ${pior.folga.toFixed(2)}) — ${pior.rota} "${pior.texto}"`,
  );
}

if (problemas.length > 0) {
  console.error('\nAbaixo do mínimo da WCAG AA:');
  problemas.forEach((problema) => console.error(`  - ${problema}`));
  process.exit(1);
}

console.log('OK — todo texto sobre arte mantém contraste AA no pior pixel.');
