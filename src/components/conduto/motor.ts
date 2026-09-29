/**
 * Motor do conduto: mede a página, posiciona o canvas e anima o líquido.
 *
 * O canvas vive dentro do documento (e não fixo na tela) e tem 1,4 tela de altura. Ele rola junto
 * com o conteúdo pelo compositor do navegador, então o tubo nunca "nada" atrasado em relação às
 * seções, nem no toque do celular. Quando a tela chega perto da borda dele, o canvas é reposicionado
 * e redesenhado no mesmo quadro.
 *
 * O nível do líquido segue a rolagem por uma mola criticamente amortecida: ele corre atrás da
 * leitura e estica o menisco quando acelera, sem passar do ponto. Nas travessias, ele avança na
 * proporção da rolagem (`preenchimentoPelaLeitura`): nada corre de lado pela tela sozinho. O nível
 * só avança; subir a página não esvazia o tubo.
 *
 * Com movimento reduzido (sistema ou botão MOVIMENTO), o tubo aparece cheio e parado, com a luz
 * presa à página, e só é redesenhado quando a rolagem pede outra posição do canvas: o desenho novo
 * é idêntico ao anterior.
 */

import { LIMITE_DA_ABERTURA } from '@/components/motion/abertura';
import { ESPACO_DO_PULSO, criarRenderizador, type Renderizador, type Rgb } from './renderizador';
import {
  MEIA_LUVA,
  montarTrajeto,
  preenchimentoAte,
  preenchimentoPelaLeitura,
  remapear,
  type Caixa,
  type Entrada,
  type Trajeto,
  type Trecho,
} from './trajeto';

/** Linha de leitura, em fração da altura da tela: o líquido chega um pouco antes do fim dela. */
const LINHA_DE_LEITURA = 0.9;
/** Folga do canvas acima e abaixo da tela, em fração da altura. */
const FOLGA = 0.2;
/** A abertura enche o tubo logo depois do véu do laboratório sair de cena. */
const FIM_DA_ABERTURA = LIMITE_DA_ABERTURA + 50;
/** Altura da faixa de rolagem em que uma travessia enche, em fração da tela. */
const FAIXA_DA_TRAVESSIA = 0.45;

const RIGIDEZ = 20;
/** 1 = amortecimento crítico: a frente do líquido chega sem passar do ponto e sem balançar. */
const AMORTECIMENTO = 1;
const VELOCIDADE_MAXIMA = 1400;
/** Correnteza com o nível parado, em px/s. Acelera junto com o líquido. */
const CORRENTEZA = 34;
const VELOCIDADE_DO_PULSO = 420;
/** Parado, o líquido anima a até 30 quadros por segundo: suficiente para correnteza lenta. */
const QUADRO_OCIOSO = 1000 / 30;
/** Altura da luz pontual sobre a página, em px: quanto menor, mais o reflexo corre no vidro. */
const ALTURA_DA_LUZ = 420;
/**
 * Sem rolagem nem ponteiro por este tempo, o líquido descansa: o último quadro fica na tela e o
 * laço para, poupando bateria de quem só está lendo. Rolagem, ponteiro, mudança de tamanho ou a
 * volta à aba acordam de novo. Até 5 s de movimento automático, o critério 2.2.2 da WCAG não exige
 * botão de pausa (o MOVIMENTO do rodapé continua valendo).
 */
const DESCANSO = 5000;
/** Luz com movimento desligado: longe, no alto à esquerda, presa à página e não à tela. */
const LUZ_PARADA: [number, number, number] = [-3000, -3000, 3000];

export type Motor = {
  movimento(ativo: boolean): void;
  destruir(): void;
};

/** Canvas e contexto já criados, esperando a vez na fila da GPU para compilar e começar. */
export type Preparo = {
  iniciar(movimento: boolean): Motor | null;
  descartar(): void;
};

/**
 * Leitura para o QA automatizado (`tools/check-conduto.mjs`), pendurada no elemento só quando o
 * navegador é controlado por automação. É propriedade de JavaScript e não atributo: atualizar a
 * cada quadro não mexe no DOM nem invalida estilo.
 */
export type Diagnostico = {
  desenhos: number;
  medicoes: number;
  /**
   * Duração, em ms, da criação do contexto WebGL, do início do motor, dos quadros até o primeiro
   * desenho (preparação única: medir a página, alocar o canvas, subir a malha) e do quadro mais
   * pesado depois disso.
   */
  contexto: number;
  inicio: number;
  preparacao: number;
  maiorQuadro: number;
  /** Duração de cada quadro depois do primeiro desenho (os 2000 mais recentes). */
  quadros: number[];
  /** A remedição mais cara: ler as caixas força o layout da página, se ele estiver pendente. */
  maiorMedicao: number;
  nivel: number;
  total: number;
  trajeto: {
    raio: number;
    /** Meio comprimento de uma luva, em raios (para o QA medir a luva na tela). */
    meiaLuva: number;
    chegaAoDestino: boolean;
    travessias: number[];
    pontos: [number, number][];
  } | null;
};

function lerCor(estilo: CSSStyleDeclaration, nome: string): Rgb | null {
  const valor = estilo.getPropertyValue(nome).trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(valor)?.[1];
  if (hex) {
    const cheio = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
    return [0, 2, 4].map((i) => parseInt(cheio.slice(i, i + 2), 16) / 255) as Rgb;
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(valor);
  if (rgb) return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255];
  return null;
}

/**
 * Lê a página: cada `[data-conduto-lado]` vira um trecho; os irmãos sem marcação entre dois
 * trechos viram obstáculos da travessia; `[data-conduto-destino]` é onde o tubo termina.
 */
function medir(raiz: HTMLElement): Entrada | null {
  const escopo = raiz.parentElement;
  if (!escopo) return null;
  const base = raiz.getBoundingClientRect();
  const caixa = (r: DOMRect): Caixa => ({
    topo: r.top - base.top,
    base: r.bottom - base.top,
    esquerda: r.left - base.left,
    direita: r.right - base.left,
  });

  const trechos: Trecho[] = [];
  let anterior: Element | null = null;
  for (const el of escopo.querySelectorAll<HTMLElement>('[data-conduto-lado]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const estilo = getComputedStyle(el);
    const borda = caixa(r);
    const obstaculos: Caixa[] = [];
    if (anterior && anterior.parentElement === el.parentElement) {
      for (
        let irmao: Element | null = anterior.nextElementSibling;
        irmao && irmao !== el;
        irmao = irmao.nextElementSibling
      ) {
        const ri = irmao.getBoundingClientRect();
        if (ri.width > 0 && ri.height > 0) obstaculos.push(caixa(ri));
      }
    }
    trechos.push({
      lado: el.dataset['condutoLado'] === 'esquerda' ? 'esquerda' : 'direita',
      borda,
      conteudo: {
        topo: borda.topo + parseFloat(estilo.paddingTop),
        base: borda.base - parseFloat(estilo.paddingBottom),
        esquerda: borda.esquerda + parseFloat(estilo.paddingLeft),
        direita: borda.direita - parseFloat(estilo.paddingRight),
      },
      obstaculos,
    });
    anterior = el;
  }

  const destino = escopo.querySelector<HTMLElement>('[data-conduto-destino]')?.getBoundingClientRect();
  return {
    largura: base.width,
    trechos,
    destino: destino && destino.width > 0 ? caixa(destino) : null,
  };
}

type Medida = { largura: number; altura: number; dpr: number };

/**
 * Tamanho do canvas: a largura da camada e 1,4 tela de altura. Histerese na altura: a barra de
 * endereço do celular muda a altura da tela o tempo todo, e realocar o canvas a cada vez custaria
 * mais que sobrar um pouco de folga. Densidade: 2 com mouse (tela de computador, onde o vidro é
 * visto de perto); 1,5 no toque, onde a tela é pequena e a bateria pesa mais.
 */
function medirCanvas(raiz: HTMLElement, alturaAtual: number): Medida {
  const ideal = Math.ceil(window.innerHeight * (1 + 2 * FOLGA));
  const altura = ideal > alturaAtual || ideal < alturaAtual * 0.8 ? ideal : alturaAtual;
  const tetoDpr = window.matchMedia('(pointer: fine)').matches ? 2 : 1.5;
  return { largura: raiz.clientWidth, altura, dpr: Math.min(window.devicePixelRatio || 1, tetoDpr) };
}

function aplicarMedida(canvas: HTMLCanvasElement, renderizador: Renderizador, m: Medida) {
  canvas.style.width = `${m.largura}px`;
  canvas.style.height = `${m.altura}px`;
  renderizador.tamanho(Math.round(m.largura * m.dpr), Math.round(m.altura * m.dpr));
}

/**
 * Cria o canvas, o contexto WebGL e a memória do desenho no tamanho certo. As duas coisas conversam
 * de forma síncrona com o processo da GPU: com ele ocupado (a cena 3D do hero desenhando) chegam a
 * dezenas de milissegundos, com ele livre ficam em poucos. Por isso acontecem cedo, na primeira
 * folga da página, e o resto espera a fila da GPU.
 */
export function prepararConduto(raiz: HTMLElement): Preparo | null {
  const comeco = performance.now();
  const canvas = document.createElement('canvas');
  const criado = criarRenderizador(canvas);
  if (!criado) return null;
  const renderizador: Renderizador = criado;
  const medida = medirCanvas(raiz, 0);
  aplicarMedida(canvas, renderizador, medida);
  const contexto = performance.now() - comeco;
  let usado = false;
  return {
    iniciar(movimento) {
      if (usado) return null;
      usado = true;
      return iniciarConduto(raiz, canvas, renderizador, medida, movimento, contexto);
    },
    descartar() {
      if (usado) return;
      usado = true;
      renderizador.destruir();
    },
  };
}

function iniciarConduto(
  raiz: HTMLElement,
  canvas: HTMLCanvasElement,
  renderizador: Renderizador,
  medidaInicial: Medida,
  movimentoInicial: boolean,
  duracaoDoContexto: number,
): Motor | null {
  const comeco = performance.now();
  renderizador.compilar();

  const estilo = getComputedStyle(document.documentElement);
  const sinal = lerCor(estilo, '--color-signal');
  const brilho = lerCor(estilo, '--color-glow');
  const papel = lerCor(estilo, '--color-paper');
  const aco = lerCor(estilo, '--color-steel');
  const tinta = lerCor(estilo, '--color-ink');
  if (!sinal || !brilho || !papel || !aco || !tinta) {
    renderizador.destruir();
    return null;
  }
  renderizador.cores({ sinal, brilho, papel, aco, tinta });
  raiz.append(canvas);

  const diagnostico: Diagnostico | null =
    navigator.webdriver === true
      ? {
          desenhos: 0,
          medicoes: 0,
          contexto: duracaoDoContexto,
          inicio: 0,
          preparacao: 0,
          maiorQuadro: 0,
          quadros: [],
          maiorMedicao: 0,
          nivel: 0,
          total: 0,
          trajeto: null,
        }
      : null;
  if (diagnostico) Object.defineProperty(raiz, 'conduto', { value: diagnostico, configurable: true });

  let trajeto: Trajeto | null = null;
  let topoNoDocumento = 0;
  let vh = window.innerHeight;
  let larguraCss = medidaInicial.largura;
  let alturaCss = medidaInicial.altura;
  let dpr = medidaInicial.dpr;
  let origemY = Number.NaN;
  let rolagemAnterior = 0;
  let sentido = 1;

  let movimento = movimentoInicial;
  let iniciado = false;
  let nivel = 0;
  let alvo = 0;
  let velocidade = 0;
  let correndo = 0;
  let fluxo = 0;
  let pulso = 0;
  let tempo = 0;
  let carregado = false;

  let ultimo = performance.now();
  let ultimaInteracao = ultimo;
  let ultimoDesenho = 0;
  let pedido = 0;
  let precisaMedir = true;
  let sujo = true;
  let pronto = false;

  // Luz pontual em coordenadas da tela. Sem mouse, ela fica acima e à esquerda da tela.
  const luz = { x: window.innerWidth * 0.18, y: -vh * 0.25, alvoX: 0, alvoY: 0 };
  luz.alvoX = luz.x;
  luz.alvoY = luz.y;

  const destino = () =>
    raiz.parentElement?.querySelector<HTMLElement>('[data-conduto-destino]') ?? null;

  function pedirQuadro() {
    if (!pedido) pedido = requestAnimationFrame(quadro);
  }

  function ajustarCanvas() {
    vh = window.innerHeight;
    const m = medirCanvas(raiz, alturaCss);
    if (m.largura === larguraCss && m.altura === alturaCss && m.dpr === dpr) return;
    larguraCss = m.largura;
    alturaCss = m.altura;
    dpr = m.dpr;
    aplicarMedida(canvas, renderizador, m);
    origemY = Number.NaN;
    sujo = true;
  }

  function remedir() {
    precisaMedir = false;
    const inicioDaMedicao = performance.now();
    if (diagnostico) diagnostico.medicoes += 1;
    const entrada = medir(raiz);
    const novo = entrada ? montarTrajeto(entrada) : null;
    topoNoDocumento = raiz.getBoundingClientRect().top + window.scrollY;

    if (trajeto && novo) {
      // O conteúdo mudou de tamanho (o configurador, a barra de endereço do celular): a frente do
      // líquido continua no mesmo lugar da página, em vez de saltar junto com o comprimento do tubo.
      nivel = remapear(trajeto, novo, nivel);
      alvo = Math.max(nivel, remapear(trajeto, novo, alvo));
    }
    trajeto = novo;
    canvas.hidden = !novo;
    if (novo) {
      renderizador.trajeto(novo);
      if (diagnostico) {
        diagnostico.trajeto = {
          raio: novo.raio,
          meiaLuva: MEIA_LUVA,
          chegaAoDestino: novo.chegaAoDestino,
          travessias: novo.travessias.map((t) => t.y),
          pontos: novo.pontos.map((p) => [p.x, p.y]),
        };
      }
    }
    ajustarCanvas();
    sujo = true;
    if (diagnostico) {
      diagnostico.maiorMedicao = Math.max(diagnostico.maiorMedicao, performance.now() - inicioDaMedicao);
    }
  }

  function quadro(agora: number) {
    pedido = 0;
    if (!diagnostico) return passo(agora);
    const inicioDoQuadro = performance.now();
    const preparando = diagnostico.desenhos === 0;
    passo(agora);
    const duracao = performance.now() - inicioDoQuadro;
    if (preparando) {
      diagnostico.preparacao = Math.max(diagnostico.preparacao, duracao);
    } else {
      diagnostico.maiorQuadro = Math.max(diagnostico.maiorQuadro, duracao);
      if (diagnostico.quadros.push(duracao) > 2000) diagnostico.quadros.shift();
    }
  }

  function passo(agora: number) {
    const dt = Math.min(0.05, Math.max(0, (agora - ultimo) / 1000));
    ultimo = agora;
    if (precisaMedir) remedir();
    if (!trajeto) return;
    if (!renderizador.pronto()) {
      // O shader ainda compila fora da thread principal: tenta de novo no próximo quadro. Sem
      // contexto (GPU reiniciada), espera o evento de volta em vez de girar à toa. Se a compilação
      // falhou de vez, o canvas some e nada mais roda.
      if (renderizador.falhou()) canvas.hidden = true;
      else if (!renderizador.perdido()) pedirQuadro();
      return;
    }

    // Topo da tela nas coordenadas da camada.
    const rolagem = window.scrollY - topoNoDocumento;
    const inicio = trajeto.pontos[0]?.y ?? 0;
    const fim = trajeto.pontos[trajeto.pontos.length - 1]?.y ?? 0;
    const naTela = rolagem + vh >= inicio - 60 && rolagem <= fim + 60;

    // A folga fica do lado para onde a página está rolando: o compositor rola antes de o quadro
    // rodar, e é desse lado que a borda do canvas apareceria numa rolagem rápida. Reposiciona
    // quando sobra menos de 30% da folga nesse sentido.
    if (rolagem !== rolagemAnterior) sentido = Math.sign(rolagem - rolagemAnterior);
    rolagemAnterior = rolagem;
    const folga = alturaCss - vh;
    const sobraAcima = rolagem - origemY;
    const sobraAbaixo = origemY + alturaCss - (rolagem + vh);
    const sobra = sentido > 0 ? sobraAbaixo : sobraAcima;
    if (Number.isNaN(origemY) || sobraAcima < 0 || sobraAbaixo < 0 || sobra < folga * 0.3) {
      origemY = Math.round(Math.max(0, rolagem - folga * (sentido > 0 ? 0.15 : 0.85)));
      canvas.style.transform = `translate3d(0, ${origemY}px, 0)`;
      sujo = true;
    }

    let assentado = true;
    if (movimento) {
      if (!iniciado && agora >= FIM_DA_ABERTURA) {
        // Abertura: o que está acima da tela já nasce cheio; o que se vê enche agora.
        iniciado = true;
        nivel = preenchimentoAte(trajeto, rolagem);
        alvo = preenchimentoPelaLeitura(trajeto, rolagem + vh, vh * FAIXA_DA_TRAVESSIA);
      }
      if (iniciado) {
        alvo = Math.max(
          alvo,
          preenchimentoPelaLeitura(trajeto, rolagem + vh * LINHA_DE_LEITURA, vh * FAIXA_DA_TRAVESSIA),
        );
        // Salto longo (âncora, rolagem rápida): o que ficou fora da tela enche na hora, e só o
        // último trecho corre à vista. Ninguém espera o líquido atravessar a página inteira.
        nivel = Math.max(nivel, alvo - vh * 1.5);
        const atrito = 2 * AMORTECIMENTO * Math.sqrt(RIGIDEZ);
        velocidade += (RIGIDEZ * (alvo - nivel) - atrito * velocidade) * dt;
        velocidade = Math.max(-VELOCIDADE_MAXIMA, Math.min(VELOCIDADE_MAXIMA, velocidade));
        nivel = Math.max(0, Math.min(trajeto.total, nivel + velocidade * dt));
        assentado = Math.abs(alvo - nivel) < 0.5 && Math.abs(velocidade) < 2;
      }
      // Quanto o líquido está correndo, suavizado para o menisco não trocar de forma aos saltos.
      const rapidez = Math.min(1, Math.abs(velocidade) / 600);
      correndo += (rapidez - correndo) * (1 - Math.exp(-dt * 5));
      fluxo = (fluxo + (CORRENTEZA + Math.abs(velocidade) * 0.35) * dt) % 1e6;
      pulso = (pulso + VELOCIDADE_DO_PULSO * dt) % ESPACO_DO_PULSO;
      tempo = (tempo + dt) % 1e4;

      // A luz alcança o ponteiro no ritmo do desenho ocioso: não força quadro extra.
      const suave = 1 - Math.exp(-dt * 6);
      luz.x += (luz.alvoX - luz.x) * suave;
      luz.y += (luz.alvoY - luz.y) * suave;
    } else {
      nivel = trajeto.total;
      velocidade = 0;
      correndo = 0;
    }

    if (!carregado && trajeto.chegaAoDestino && nivel >= trajeto.total - 1) {
      carregado = true;
      const alvoFinal = destino();
      if (alvoFinal) alvoFinal.dataset['condutoCarregado'] = 'true';
    }

    // Canvas movido ou redimensionado desenha sempre, mesmo sem tubo à vista: senão o último quadro
    // apareceria no lugar novo como um tubo fantasma.
    const hora = sujo || (movimento && naTela && (!assentado || agora - ultimoDesenho >= QUADRO_OCIOSO));
    if (hora) {
      renderizador.desenhar({
        origemX: 0,
        origemY,
        largura: larguraCss,
        altura: alturaCss,
        nivel,
        menisco: trajeto.raio * (0.9 + 0.7 * correndo) + Math.min(Math.abs(velocidade) * 0.012, trajeto.raio * 2.5),
        correndo,
        fluxo,
        pulso,
        pulsoLigado: movimento ? 1 : 0,
        tempo,
        luz: movimento ? [luz.x, rolagem + luz.y, ALTURA_DA_LUZ] : LUZ_PARADA,
      });
      ultimoDesenho = agora;
      sujo = false;
      if (diagnostico) {
        diagnostico.desenhos += 1;
        diagnostico.nivel = nivel;
        diagnostico.total = trajeto.total;
      }
      if (!pronto) {
        pronto = true;
        raiz.dataset['condutoPronto'] = 'true';
      }
    }

    const descansando = assentado && agora - ultimaInteracao > DESCANSO;
    if (movimento && naTela && !descansando && document.visibilityState === 'visible') pedirQuadro();
  }

  function acordar() {
    ultimaInteracao = performance.now();
    pedirQuadro();
  }

  const aoRolar = acordar;
  const aoRedimensionar = () => {
    precisaMedir = true;
    acordar();
  };
  const aoMoverPonteiro = (evento: PointerEvent) => {
    if (evento.pointerType !== 'mouse') return;
    luz.alvoX = evento.clientX;
    luz.alvoY = evento.clientY;
    if (movimento) acordar();
  };
  const aoRecuperarContexto = () => {
    sujo = true;
    acordar();
  };
  const aoMudarVisibilidade = () => {
    if (document.visibilityState !== 'visible') return;
    ultimo = performance.now();
    acordar();
  };

  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRedimensionar, { passive: true });
  window.addEventListener('pointermove', aoMoverPonteiro, { passive: true });
  document.addEventListener('visibilitychange', aoMudarVisibilidade);
  // O renderizador registrou o dele antes: quando este roda, o programa já está compilando.
  canvas.addEventListener('webglcontextrestored', aoRecuperarContexto);

  // Qualquer mudança de tamanho do conteúdo (fonte que chega, configurador que cresce) remede.
  const observador = new ResizeObserver(aoRedimensionar);
  if (raiz.parentElement) observador.observe(raiz.parentElement);
  raiz.parentElement
    ?.querySelectorAll('[data-conduto-lado], [data-conduto-destino]')
    .forEach((el) => observador.observe(el));

  pedirQuadro();
  if (diagnostico) diagnostico.inicio = performance.now() - comeco;

  return {
    movimento(ativo) {
      if (ativo === movimento) return;
      movimento = ativo;
      if (ativo) {
        // Voltando a animar, o tubo continua de onde estava: nada esvazia.
        iniciado = true;
        alvo = Math.max(alvo, nivel);
        velocidade = 0;
        ultimo = performance.now();
      }
      sujo = true;
      acordar();
    },
    destruir() {
      if (pedido) cancelAnimationFrame(pedido);
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRedimensionar);
      window.removeEventListener('pointermove', aoMoverPonteiro);
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      canvas.removeEventListener('webglcontextrestored', aoRecuperarContexto);
      observador.disconnect();
      renderizador.destruir();
      canvas.remove();
      delete destino()?.dataset['condutoCarregado'];
      delete raiz.dataset['condutoPronto'];
      Reflect.deleteProperty(raiz, 'conduto');
    },
  };
}
