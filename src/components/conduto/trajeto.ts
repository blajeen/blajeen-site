/**
 * Trajeto do conduto de energia.
 *
 * Geometria pura, sem DOM: recebe as caixas medidas na página e devolve a linha central do tubo,
 * amostrada, com o comprimento de arco de cada ponto. O tubo é rígido como vidro de laboratório:
 * trechos retos e curvas de 90°, nunca curva livre.
 *
 * Três regras sustentam o desenho:
 * - o tubo corre na margem lateral, fora da caixa de conteúdo de cada trecho marcado. No celular a
 *   margem é estreita (uns 16 px): ali ele corre encostado na borda da tela, mais fino, e deixa
 *   livre a faixa do anel de foco do que fica na borda da coluna. Acompanha a leitura como no
 *   computador (o titular pediu o tubo visível no celular; antes, ali só apareciam as travessias).
 *   Só numa margem estreita demais para ele, o trilho vertical sai da tela e aparecem só as
 *   travessias, como canos por trás da página;
 * - ele só atravessa a página numa faixa livre entre dois trechos, fora dos obstáculos (a faixa
 *   opaca de chamadas logo abaixo do hero, por exemplo);
 * - ele nunca sobe: `y` não diminui ao longo do trajeto. É isso que permite ligar o nível do
 *   líquido à rolagem com uma busca binária.
 */

export type Lado = 'esquerda' | 'direita';

/**
 * Como a página marca um trecho: um lado fixo, ou `alternar`, que pode trocar de lado em relação ao
 * trecho anterior, depois de o tubo correr 80% de uma tela do mesmo lado (as páginas internas
 * marcam assim o bloco de conteúdo de cada seção).
 */
export type LadoMarcado = Lado | 'alternar';

/** Retângulo em pixels CSS, nas coordenadas da camada do conduto. */
export type Caixa = {
  topo: number;
  base: number;
  esquerda: number;
  direita: number;
};

export type Trecho = {
  /** Margem por onde o tubo corre ao lado deste trecho. */
  lado: LadoMarcado;
  /** Caixa de borda: o começo e o fim do trecho na página. */
  borda: Caixa;
  /** Caixa de conteúdo (borda menos o padding): o tubo nunca entra nela. */
  conteudo: Caixa;
  /** Blocos sem marcação entre o trecho anterior e este. A travessia não passa por eles. */
  obstaculos: Caixa[];
};

export type Entrada = {
  /** Largura da camada do conduto. */
  largura: number;
  /**
   * Altura da tela: mede a distância mínima entre duas travessias nos trechos `alternar`. O motor
   * passa a altura de quando a página abriu, não a do momento: no celular a barra de endereço muda
   * a altura durante a rolagem, e os lados não podem trocar por causa disso.
   */
  alturaDaTela: number;
  trechos: Trecho[];
  /** Onde o tubo termina encaixado (o botão final), se houver espaço para chegar até ele. */
  destino: Caixa | null;
};

export type Ponto = {
  x: number;
  y: number;
  /** Comprimento de arco desde o início do tubo. */
  s: number;
  /** Tangente unitária: a direção em que o líquido corre. */
  tx: number;
  ty: number;
};

/** Trecho em que o tubo atravessa a página de lado, ou faz a curva final até o destino. */
export type Travessia = {
  /** Altura em que o tubo corre na horizontal. */
  y: number;
  /** Comprimento de arco onde o tubo deixa o trilho e onde termina a travessia. */
  sInicio: number;
  sFim: number;
  /** Comprimento de arco onde a curva de entrada acaba e o tubo começa a correr na horizontal. */
  sReta: number;
};

export type Trajeto = {
  pontos: Ponto[];
  total: number;
  raio: number;
  /** Posição (em `s`) do centro de cada luva de metal. */
  juntas: number[];
  /** Em ordem de altura. */
  travessias: Travessia[];
  /** O tubo termina encostado no destino, e não no fim do último trecho. */
  chegaAoDestino: boolean;
  /** Margem estreita demais para o tubo: os trilhos verticais correm fora da tela. */
  trilhosForaDaTela: boolean;
};

/** Meia largura da faixa desenhada, em raios: o vidro vai até 1; sombra e brilho, até aqui. */
export const MEIA_FAIXA = 2.3;

/** Meio comprimento de uma luva de metal, em raios. */
export const MEIA_LUVA = 0.95;

/**
 * Máximo de luvas que o shader desenha de uma vez. O trajeto guarda todas; a cada desenho, o
 * renderizador manda só as que caem no canvas, que cobre pouco mais de uma tela.
 */
export const MAXIMO_DE_JUNTAS = 8;

/** Distância máxima entre o eixo do tubo e o conteúdo, em telas largas. */
const AFASTAMENTO_MAXIMO = 40;

/**
 * Faixa do anel de foco em volta do que recebe foco (`outline` de 2 px com 3 px de afastamento, em
 * `globals.css`). O anel é verde como o líquido: sobre o tubo, ele sumiria.
 */
const FAIXA_DO_FOCO = 5;

/** Menor raio que ainda se lê como vidro com líquido dentro. */
const RAIO_MINIMO_NA_BORDA = 4;

/**
 * Abaixo desta margem lateral, o trilho vertical sai da tela: não cabe o tubo mais fino encostado
 * na borda sem entrar na faixa do anel de foco (ver o comentário do topo).
 */
const MARGEM_PARA_TRILHO = 2 * RAIO_MINIMO_NA_BORDA + FAIXA_DO_FOCO;

/** Abaixo desta margem lateral (o celular), o tubo encosta na borda da tela e afina para caber. */
const MARGEM_LARGA = 28;

/**
 * Nos trechos `alternar`, o tubo só troca de lado depois de correr pelo menos isto (em telas) do
 * mesmo lado, somando a altura dos trechos: seções curtas não viram zigue-zague.
 */
const TRECHO_MINIMO_PARA_TROCAR = 0.8;

/** Passo de amostragem das curvas, em px. Curto o bastante para o brilho não serrilhar. */
const PASSO_DA_CURVA = 1.5;

function limitar(valor: number, minimo: number, maximo: number) {
  return Math.min(maximo, Math.max(minimo, valor));
}

/**
 * Primeira faixa horizontal livre de obstáculos entre `de` e `ate` com pelo menos `minimo` de
 * altura. A primeira, e não a maior: logo abaixo do hero ela ainda está acima da dobra.
 */
export function faixaLivre(
  de: number,
  ate: number,
  obstaculos: Caixa[],
  minimo: number,
): [number, number] | null {
  const cortes = obstaculos
    .map((o): [number, number] => [Math.max(de, o.topo), Math.min(ate, o.base)])
    .filter(([a, b]) => b > a)
    .sort((p, q) => p[0] - q[0]);

  let cursor = de;
  for (const [a, b] of cortes) {
    if (a - cursor >= minimo) return [cursor, a];
    cursor = Math.max(cursor, b);
  }
  return ate - cursor >= minimo ? [cursor, ate] : null;
}

class Construtor {
  readonly pontos: Ponto[];
  s = 0;
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.pontos = [{ x, y, s: 0, tx: 0, ty: 1 }];
  }

  reta(x: number, y: number) {
    const dx = x - this.x;
    const dy = y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.01) return;
    this.s += d;
    this.x = x;
    this.y = y;
    this.pontos.push({ x, y, s: this.s, tx: dx / d, ty: dy / d });
  }

  /** Arco de centro (cx, cy) e raio r, do ângulo a0 ao a1. Começa onde o tubo está. */
  arco(cx: number, cy: number, r: number, a0: number, a1: number) {
    const passos = Math.max(8, Math.ceil((Math.abs(a1 - a0) * r) / PASSO_DA_CURVA));
    const sentido = Math.sign(a1 - a0);
    for (let i = 1; i <= passos; i++) {
      const a = a0 + ((a1 - a0) * i) / passos;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      this.s += Math.hypot(x - this.x, y - this.y);
      this.x = x;
      this.y = y;
      this.pontos.push({ x, y, s: this.s, tx: -Math.sin(a) * sentido, ty: Math.cos(a) * sentido });
    }
  }

  /** Desce até a curva, vira na direção de `alvoX` e corre na horizontal em `y`. */
  virarParaHorizontal(y: number, alvoX: number, curva: number) {
    const dir = Math.sign(alvoX - this.x) || 1;
    const x = this.x;
    this.reta(x, y - curva);
    this.arco(x + dir * curva, y - curva, curva, dir > 0 ? Math.PI : 0, Math.PI / 2);
    // O arco termina na altura exata da travessia, sem o resto do arredondamento do seno: a busca
    // pela altura e a faixa de `preenchimentoPelaLeitura` contam com isso.
    this.y = y;
    const fim = this.pontos[this.pontos.length - 1];
    if (fim) fim.y = y;
    return dir;
  }

  /** Corre na horizontal até o trilho `x` e vira para baixo. */
  virarParaBaixo(x: number, dir: number, curva: number) {
    const y = this.y;
    this.reta(x - dir * curva, y);
    this.arco(x - dir * curva, y + curva, curva, -Math.PI / 2, dir > 0 ? 0 : -Math.PI);
  }
}

/** Comprimento de arco em que o trajeto alcança a altura `y` (a linha de leitura). */
export function preenchimentoAte(trajeto: Trajeto, y: number): number {
  const p = trajeto.pontos;
  const primeiro = p[0];
  const ultimo = p[p.length - 1];
  if (!primeiro || !ultimo || y <= primeiro.y) return 0;
  if (y >= ultimo.y) return trajeto.total;

  // Último ponto com altura <= y. Num trecho horizontal isso é o fim dele: a travessia inteira
  // enche de uma vez, e a mola do motor transforma o salto em líquido correndo.
  let lo = 0;
  let hi = p.length - 1;
  while (lo < hi) {
    const meio = (lo + hi + 1) >> 1;
    if ((p[meio]?.y ?? Infinity) <= y) lo = meio;
    else hi = meio - 1;
  }
  const a = p[lo];
  const b = p[lo + 1];
  if (!a || !b) return trajeto.total;
  const f = b.y > a.y ? (y - a.y) / (b.y - a.y) : 1;
  return a.s + f * (b.s - a.s);
}

/**
 * Nível do líquido para uma linha de leitura.
 *
 * Nos trechos verticais e nas curvas, o líquido acompanha a linha. Uma travessia só começa a
 * correr de lado quando a linha chega à altura dela, e enche na proporção da rolagem ao longo da
 * `faixa` seguinte: o líquido só corre de lado enquanto a pessoa rola e para quando ela para. Sem a
 * faixa, a travessia inteira encheria de uma vez e o líquido dispararia sozinho pela largura da
 * tela.
 *
 * A frente nunca passa da linha: nos trechos verticais fica nela, e numa travessia fica acima
 * dela. É o que segura o nível na fração da tela que o motor escolhe. Com a faixa antes da
 * travessia, a frente correria à frente da linha até o pé da tela.
 */
export function preenchimentoPelaLeitura(trajeto: Trajeto, y: number, faixa: number): number {
  let s = preenchimentoAte(trajeto, y);
  for (const t of trajeto.travessias) {
    if (y < t.y) break;
    if (y >= t.y + faixa) continue;
    // Da altura da travessia até o fim da faixa, o nível vai em linha reta do começo da horizontal
    // ao nível que a altura sozinha daria no fim da faixa: contínuo nas duas pontas, e a frente
    // fica acima da linha o tempo todo.
    const depois = preenchimentoAte(trajeto, t.y + faixa);
    s = Math.min(s, t.sReta + ((depois - t.sReta) * (y - t.y)) / faixa);
  }
  return s;
}

/**
 * Leva um nível do trajeto antigo para o novo quando a página muda de tamanho. Dentro de uma
 * travessia, guarda o progresso de lado (a mesma fração da mesma travessia); fora delas, guarda a
 * altura na página. Só pela altura, uma frente no meio da travessia saltaria para o fim dela. Se o
 * número de travessias mudou, a de mesmo índice pode ser outra, em outra altura: aí vale a altura.
 */
export function remapear(antigo: Trajeto, novo: Trajeto, s: number): number {
  const mesmaForma = antigo.travessias.length === novo.travessias.length;
  const indice = mesmaForma ? antigo.travessias.findIndex((t) => s > t.sInicio && s < t.sFim) : -1;
  const de = antigo.travessias[indice];
  const para = novo.travessias[indice];
  if (de && para) {
    const fracao = (s - de.sInicio) / (de.sFim - de.sInicio);
    return para.sInicio + fracao * (para.sFim - para.sInicio);
  }
  return preenchimentoAte(novo, alturaEm(antigo, s));
}

/** Altura do ponto do trajeto no comprimento de arco `s`. */
export function alturaEm(trajeto: Trajeto, s: number): number {
  const p = trajeto.pontos;
  const primeiro = p[0];
  const ultimo = p[p.length - 1];
  if (!primeiro || !ultimo) return 0;
  if (s <= 0) return primeiro.y;
  if (s >= trajeto.total) return ultimo.y;

  let lo = 0;
  let hi = p.length - 1;
  while (lo < hi) {
    const meio = (lo + hi + 1) >> 1;
    if ((p[meio]?.s ?? Infinity) <= s) lo = meio;
    else hi = meio - 1;
  }
  const a = p[lo];
  const b = p[lo + 1];
  if (!a || !b) return ultimo.y;
  const f = b.s > a.s ? (s - a.s) / (b.s - a.s) : 0;
  return a.y + f * (b.y - a.y);
}

/**
 * Resolve o lado de cada trecho. Lado fixo vale como está e a contagem recomeça nele; `alternar`
 * troca em relação ao trecho anterior quando o tubo já correu pelo menos
 * `TRECHO_MINIMO_PARA_TROCAR` telas desde a última troca ou o último lado fixo, e senão continua.
 * Numa página que começa com `alternar`, o tubo começa pela direita, como na home.
 */
export function resolverLados(trechos: Trecho[], alturaDaTela: number): Lado[] {
  const lados: Lado[] = [];
  let atual: Lado = 'direita';
  let corrido = 0;
  trechos.forEach((t, i) => {
    if (t.lado !== 'alternar') {
      corrido = 0;
      atual = t.lado;
    } else if (i > 0 && corrido >= alturaDaTela * TRECHO_MINIMO_PARA_TROCAR) {
      atual = atual === 'direita' ? 'esquerda' : 'direita';
      corrido = 0;
    }
    lados.push(atual);
    corrido += t.borda.base - t.borda.topo;
  });
  return lados;
}

/**
 * Monta o trajeto a partir das caixas da página.
 *
 * Devolve `null` quando não há trecho marcado.
 */
export function montarTrajeto(entrada: Entrada): Trajeto | null {
  const { largura, trechos, destino } = entrada;
  const primeiro = trechos[0];
  const ultimo = trechos[trechos.length - 1];
  if (!primeiro || !ultimo) return null;
  const lados = resolverLados(trechos, entrada.alturaDaTela);
  const lado = (i: number): Lado => lados[i] ?? 'direita';

  const conteudoEsquerda = Math.min(...trechos.map((t) => t.conteudo.esquerda));
  const conteudoDireita = Math.max(...trechos.map((t) => t.conteudo.direita));
  const margem = Math.min(conteudoEsquerda, largura - conteudoDireita);
  const trilhosForaDaTela = margem < MARGEM_PARA_TRILHO;

  const naBorda = !trilhosForaDaTela && margem < MARGEM_LARGA;
  const afastamento = Math.min(margem / 2, AFASTAMENTO_MAXIMO);
  // Na margem estreita do celular, o tubo encosta na borda da tela (meio pixel de ar) e o vidro
  // entra no máximo meio pixel na `FAIXA_DO_FOCO` do conteúdo: o QA tolera 1 px, e a coluna de texto
  // cai em frações de pixel. Fora da tela, o tubo não disputa a margem com o texto e engrossa um
  // pouco.
  const raio = trilhosForaDaTela
    ? limitar(largura * 0.014, 4.5, 7)
    : naBorda
      ? limitar((margem - FAIXA_DO_FOCO) / 2, RAIO_MINIMO_NA_BORDA, 6)
      : limitar(afastamento * 0.5, 3.5, 10.5);
  // A curva precisa ser mais larga que a faixa desenhada, senão o lado de dentro se dobra.
  const curva = Math.max(raio * 3.2, raio * MEIA_FAIXA + 4);
  // Fora da tela, o trilho fica além da sombra e do brilho: nem a borda da faixa aparece.
  const foraDaBorda = raio * MEIA_FAIXA + 4;
  const trilho: Record<Lado, number> = trilhosForaDaTela
    ? { esquerda: -foraDaBorda, direita: largura + foraDaBorda }
    : naBorda
      ? { esquerda: raio + 0.5, direita: largura - raio - 0.5 }
      : { esquerda: conteudoEsquerda - afastamento, direita: conteudoDireita + afastamento };

  // O tubo entra pelo alto da página, por trás do cabeçalho fixo.
  const c = new Construtor(trilho[lado(0)], 0);
  const juntas: number[] = [];
  const divisas: number[] = [];
  const travessias: Travessia[] = [];

  for (let i = 1; i < trechos.length; i++) {
    const anterior = trechos[i - 1];
    const atual = trechos[i];
    if (!anterior || !atual) continue;

    if (lado(i) === lado(i - 1)) {
      // Mesmo lado: uma luva marca a divisa entre os dois trechos.
      divisas.push(atual.borda.topo);
      continue;
    }

    const faixa =
      faixaLivre(anterior.conteudo.base, atual.conteudo.topo, atual.obstaculos, 2 * raio + 8) ??
      ([anterior.conteudo.base, atual.conteudo.topo] as [number, number]);
    const y = Math.max((faixa[0] + faixa[1]) / 2, c.y + curva);
    const destinoX = trilho[lado(i)];

    const sInicio = c.s + Math.max(0, y - curva - c.y);
    const dir = c.virarParaHorizontal(y, destinoX, curva);
    const inicioDaReta = c.s;
    const comprimento = Math.abs(destinoX - c.x) - curva;
    c.virarParaBaixo(destinoX, dir, curva);
    travessias.push({ y, sInicio, sFim: c.s, sReta: inicioDaReta });
    // Uma luva no meio da travessia: o ponto em que ela cruza a tela.
    juntas.push(inicioDaReta + comprimento / 2);
  }

  // Chegada: vira na altura do centro do destino e encosta na borda dele, se couber a curva e a
  // luva de saída. Sem espaço, o tubo termina no fim do último trecho.
  let chegaAoDestino = false;
  if (destino) {
    const x = c.x;
    const yDestino = (destino.topo + destino.base) / 2;
    const bordaX = destino.direita <= x ? destino.direita : destino.esquerda;
    const cabe =
      Math.abs(bordaX - x) >= curva + 2 * MEIA_LUVA * raio + 2 && yDestino - curva >= c.y;
    if (cabe) {
      const sInicio = c.s + Math.max(0, yDestino - curva - c.y);
      c.virarParaHorizontal(yDestino, bordaX, curva);
      const sReta = c.s;
      c.reta(bordaX, yDestino);
      travessias.push({ y: yDestino, sInicio, sFim: c.s, sReta });
      chegaAoDestino = true;
    }
  }
  if (!chegaAoDestino) c.reta(c.x, Math.max(c.y, ultimo.conteudo.base));

  const trajeto: Trajeto = {
    pontos: c.pontos,
    total: c.s,
    raio,
    juntas,
    travessias,
    chegaAoDestino,
    trilhosForaDaTela,
  };

  // Divisas no trilho fora da tela não teriam quem as visse.
  for (const y of trilhosForaDaTela ? [] : divisas) {
    const s = preenchimentoAte(trajeto, y);
    if (s > 0 && s < trajeto.total) juntas.push(s);
  }
  // A luva de saída fica rente à borda do destino; sem chegar a ele, é a tampa que fecha o tubo.
  juntas.push(trajeto.total - MEIA_LUVA * raio);

  // Todas, em ordem: o renderizador escolhe as que caem no canvas (`MAXIMO_DE_JUNTAS`).
  trajeto.juntas = juntas.sort((a, b) => a - b);
  return trajeto;
}

/** Atributos por vértice da faixa: x, y, s, v (posição através do tubo, em raios), nx, ny. */
export const FLOATS_POR_VERTICE = 6;

/**
 * Faixa de triângulos ao longo do trajeto, pronta para `TRIANGLE_STRIP`.
 *
 * O shader desenha o cilindro a partir de `v`: em |v| < 1 é vidro, além disso é sombra e brilho.
 */
export function malha(trajeto: Trajeto): Float32Array {
  const dados = new Float32Array(trajeto.pontos.length * 2 * FLOATS_POR_VERTICE);
  let i = 0;
  for (const p of trajeto.pontos) {
    const nx = -p.ty;
    const ny = p.tx;
    for (const lado of [1, -1]) {
      const v = lado * MEIA_FAIXA;
      dados[i++] = p.x + nx * v * trajeto.raio;
      dados[i++] = p.y + ny * v * trajeto.raio;
      dados[i++] = p.s;
      dados[i++] = v;
      dados[i++] = nx;
      dados[i++] = ny;
    }
  }
  return dados;
}
