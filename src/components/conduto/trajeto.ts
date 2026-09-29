/**
 * Trajeto do conduto de energia.
 *
 * Geometria pura, sem DOM: recebe as caixas medidas na página e devolve a linha central do tubo,
 * amostrada, com o comprimento de arco de cada ponto. O tubo é rígido como vidro de laboratório:
 * trechos retos e curvas de 90°, nunca curva livre.
 *
 * Três regras sustentam o desenho:
 * - o tubo corre na margem lateral, fora da caixa de conteúdo de cada trecho marcado. Quando a
 *   margem é estreita (celular, tablet em pé), o trilho vertical sai da tela: ali um tubo fino
 *   colado à borda pareceria barra de rolagem e ficaria na área do gesto de voltar. Aparecem só as
 *   travessias e a chegada ao botão, como canos que passam por trás da página;
 * - ele só atravessa a página numa faixa livre entre dois trechos, fora dos obstáculos (a faixa
 *   opaca de chamadas logo abaixo do hero, por exemplo);
 * - ele nunca sobe: `y` não diminui ao longo do trajeto. É isso que permite ligar o nível do
 *   líquido à rolagem com uma busca binária.
 */

export type Lado = 'esquerda' | 'direita';

/** Retângulo em pixels CSS, nas coordenadas da camada do conduto. */
export type Caixa = {
  topo: number;
  base: number;
  esquerda: number;
  direita: number;
};

export type Trecho = {
  /** Margem por onde o tubo corre ao lado deste trecho. */
  lado: Lado;
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
  /** Margem estreita: os trilhos verticais correm fora da tela. */
  trilhosForaDaTela: boolean;
};

/** Meia largura da faixa desenhada, em raios: o vidro vai até 1; sombra e brilho, até aqui. */
export const MEIA_FAIXA = 2.3;

/** Meio comprimento de uma luva de metal, em raios. */
export const MEIA_LUVA = 0.95;

/** Máximo de luvas que o shader aceita. */
export const MAXIMO_DE_JUNTAS = 8;

/** Distância máxima entre o eixo do tubo e o conteúdo, em telas largas. */
const AFASTAMENTO_MAXIMO = 40;

/** Abaixo desta margem lateral, o trilho vertical sai da tela (ver o comentário do topo). */
const MARGEM_PARA_TRILHO = 28;

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
 * Nos trechos verticais, o líquido acompanha a linha. Numa travessia, ele avança na proporção da
 * rolagem ao longo de uma faixa de altura `faixa` que termina na altura dela: o líquido só corre de
 * lado enquanto a pessoa rola, e para quando ela para. Sem isso, a travessia inteira encheria de uma
 * vez e o líquido dispararia sozinho pela largura da tela.
 */
export function preenchimentoPelaLeitura(trajeto: Trajeto, y: number, faixa: number): number {
  let s = preenchimentoAte(trajeto, y);
  for (const t of trajeto.travessias) {
    const entrada = t.y - faixa;
    if (y <= entrada) break;
    const progresso = Math.min(1, (y - entrada) / faixa);
    const inicio = preenchimentoAte(trajeto, entrada);
    s = Math.max(s, inicio + (t.sFim - inicio) * progresso);
  }
  return s;
}

/**
 * Leva um nível do trajeto antigo para o novo quando a página muda de tamanho. Dentro de uma
 * travessia, guarda o progresso de lado (a mesma fração da mesma travessia); fora delas, guarda a
 * altura na página. Só pela altura, uma frente no meio da travessia saltaria para o fim dela.
 */
export function remapear(antigo: Trajeto, novo: Trajeto, s: number): number {
  const indice = antigo.travessias.findIndex((t) => s > t.sInicio && s < t.sFim);
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
 * Monta o trajeto a partir das caixas da página.
 *
 * Devolve `null` quando não há trecho marcado.
 */
export function montarTrajeto(entrada: Entrada): Trajeto | null {
  const { largura, trechos, destino } = entrada;
  const primeiro = trechos[0];
  const ultimo = trechos[trechos.length - 1];
  if (!primeiro || !ultimo) return null;

  const conteudoEsquerda = Math.min(...trechos.map((t) => t.conteudo.esquerda));
  const conteudoDireita = Math.max(...trechos.map((t) => t.conteudo.direita));
  const margem = Math.min(conteudoEsquerda, largura - conteudoDireita);
  const trilhosForaDaTela = margem < MARGEM_PARA_TRILHO;

  const afastamento = Math.min(margem / 2, AFASTAMENTO_MAXIMO);
  // Fora da tela o tubo não disputa a margem com o texto, então engrossa um pouco para o vidro ler.
  const raio = trilhosForaDaTela ? limitar(largura * 0.014, 4.5, 7) : limitar(afastamento * 0.5, 3.5, 10.5);
  // A curva precisa ser mais larga que a faixa desenhada, senão o lado de dentro se dobra.
  const curva = Math.max(raio * 3.2, raio * MEIA_FAIXA + 4);
  // Fora da tela, o trilho fica além da sombra e do brilho: nem a borda da faixa aparece.
  const foraDaBorda = raio * MEIA_FAIXA + 4;
  const trilho: Record<Lado, number> = trilhosForaDaTela
    ? { esquerda: -foraDaBorda, direita: largura + foraDaBorda }
    : { esquerda: conteudoEsquerda - afastamento, direita: conteudoDireita + afastamento };

  // O tubo entra pelo alto da página, por trás do cabeçalho fixo.
  const c = new Construtor(trilho[primeiro.lado], 0);
  const juntas: number[] = [];
  const divisas: number[] = [];
  const travessias: Travessia[] = [];

  for (let i = 1; i < trechos.length; i++) {
    const anterior = trechos[i - 1];
    const atual = trechos[i];
    if (!anterior || !atual) continue;

    if (atual.lado === anterior.lado) {
      // Mesmo lado: uma luva marca a divisa entre os dois trechos.
      divisas.push(atual.borda.topo);
      continue;
    }

    const faixa =
      faixaLivre(anterior.conteudo.base, atual.conteudo.topo, atual.obstaculos, 2 * raio + 8) ??
      ([anterior.conteudo.base, atual.conteudo.topo] as [number, number]);
    const y = Math.max((faixa[0] + faixa[1]) / 2, c.y + curva);
    const destinoX = trilho[atual.lado];

    const sInicio = c.s + Math.max(0, y - curva - c.y);
    const dir = c.virarParaHorizontal(y, destinoX, curva);
    const inicioDaReta = c.s;
    const comprimento = Math.abs(destinoX - c.x) - curva;
    c.virarParaBaixo(destinoX, dir, curva);
    travessias.push({ y, sInicio, sFim: c.s });
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
      c.reta(bordaX, yDestino);
      travessias.push({ y: yDestino, sInicio, sFim: c.s });
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
  // A luva de saída fica rente à borda do destino.
  if (chegaAoDestino) juntas.push(trajeto.total - MEIA_LUVA * raio);

  trajeto.juntas = juntas.sort((a, b) => a - b).slice(0, MAXIMO_DE_JUNTAS);
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
