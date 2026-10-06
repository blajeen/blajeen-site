import { TIPOLOGIAS } from './dados';

/**
 * A planta fictícia do Residencial Vértice: 2 dormitórios com suíte, 66,45 m² privativos. É a
 * planta-base do final 02 (canto noroeste); o final 03 (canto sudoeste) usa a mesma, espelhada.
 *
 * Coordenadas em metros, no plano do desenho: x para a direita (leste, no final 02) e y para baixo
 * (sul). A origem é a quina noroeste da face externa das paredes. A frente do prédio (norte) fica
 * no alto do desenho; a varanda de canto avança 1,20 m para fora, como as varandas da torre.
 *
 * - Fachada norte (alto, 9,00 m): estar e jantar, dormitório e suíte.
 * - Fachada oeste (esquerda): estar e jantar, com a varanda, e a cozinha.
 * - Divisa leste (direita): parede do apartamento vizinho, sem janela.
 * - Corredor do prédio (embaixo): a porta de entrada, na cozinha integrada à sala.
 *
 * Os mesmos dados desenham a planta técnica em SVG, a maquete 3D, a lista de cômodos e a tabela de
 * áreas, para os quatro nunca se contradizerem. Tudo inventado para a demonstração.
 */

export type Ponto = readonly [number, number];

export type ComodoId =
  | 'sala'
  | 'varanda'
  | 'cozinha'
  | 'servico'
  | 'circulacao'
  | 'suite'
  | 'banho-suite'
  | 'dormitorio'
  | 'banho-social';

export type Comodo = {
  id: ComodoId;
  nome: string;
  /** Como o desenho escreve o nome dentro do cômodo, à maneira das plantas de venda. */
  sigla: string;
  /** Polígono do piso, pelas faces internas das paredes, no sentido horário do desenho. */
  poligono: readonly Ponto[];
  /** Área declarada, em centésimos de m² (1428 = 14,28 m²), para somar sem float. */
  areaCentesimos: number;
  /** Onde o rótulo do cômodo fica no desenho: o meio da parte mais larga do piso. */
  rotulo: Ponto;
};

/** Parede pelo eixo: de um ponto a outro, com a espessura repartida dos dois lados. */
export type Parede = {
  id: string;
  de: Ponto;
  ate: Ponto;
  espessura: number;
  /** Na fachada do prédio (recebe janela). As de divisa e do corredor não são externas. */
  externa: boolean;
};

export type TipoDeAbertura = 'porta' | 'porta-de-correr' | 'passagem' | 'janela' | 'balcao';

export type Abertura = {
  id: string;
  /** Id da parede que recebe a abertura. */
  parede: string;
  tipo: TipoDeAbertura;
  /** Distância, ao longo do eixo da parede a partir de `de`, até o meio da abertura. */
  centro: number;
  largura: number;
  /** Altura livre do vão, acima do peitoril. A verga fica em `peitoril + altura`. */
  altura: number;
  peitoril: number;
  /** Portas de giro: o batente da dobradiça (o mais perto de `de` ou de `ate`) e o cômodo para onde a folha abre. */
  abre: null | { dobradica: 'de' | 'ate'; para: ComodoId };
};

export type TipoDeMovel =
  | 'sofa'
  | 'mesa-de-jantar'
  | 'cama-casal'
  | 'cama-solteiro'
  | 'guarda-roupa'
  | 'bancada'
  | 'geladeira'
  | 'pia'
  | 'vaso'
  | 'box'
  | 'maquina'
  | 'tapete'
  | 'planta'
  | 'mesa-da-varanda';

/**
 * Um móvel de referência. `rotacao` diz para onde fica a frente (o lado de uso): 0 para baixo do
 * desenho (+y), 90 para a esquerda (−x), 180 para cima (−y), 270 para a direita (+x).
 */
export type Movel = { tipo: TipoDeMovel; posicao: Ponto; rotacao: 0 | 90 | 180 | 270; comodo: ComodoId };

/** Largura (de lado a lado), profundidade (de trás para a frente) e altura, em metros. */
export const DIMENSOES_DOS_MOVEIS: Readonly<Record<TipoDeMovel, { largura: number; profundidade: number; altura: number }>> = {
  sofa: { largura: 2.0, profundidade: 0.85, altura: 0.8 },
  'mesa-de-jantar': { largura: 1.2, profundidade: 1.3, altura: 0.75 },
  'cama-casal': { largura: 1.4, profundidade: 1.9, altura: 0.5 },
  'cama-solteiro': { largura: 0.9, profundidade: 1.9, altura: 0.5 },
  'guarda-roupa': { largura: 1.8, profundidade: 0.55, altura: 2.1 },
  bancada: { largura: 0.8, profundidade: 0.6, altura: 0.9 },
  geladeira: { largura: 0.7, profundidade: 0.7, altura: 1.8 },
  pia: { largura: 0.8, profundidade: 0.6, altura: 0.9 },
  vaso: { largura: 0.38, profundidade: 0.65, altura: 0.75 },
  box: { largura: 0.9, profundidade: 0.9, altura: 1.9 },
  maquina: { largura: 0.6, profundidade: 0.65, altura: 0.85 },
  tapete: { largura: 1.6, profundidade: 1.1, altura: 0.01 },
  planta: { largura: 0.45, profundidade: 0.45, altura: 1.2 },
  'mesa-da-varanda': { largura: 1.3, profundidade: 0.9, altura: 0.75 },
};

/** Cota externa: um trecho do contorno, desenhado do lado de fora, no primeiro ou no segundo nível. */
export type Cota = { de: number; ate: number; lado: 'norte' | 'oeste'; nivel: 1 | 2 };

const ret = (x0: number, y0: number, x1: number, y1: number): Ponto[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

const COMODOS: readonly Comodo[] = [
  { id: 'sala', nome: 'Estar e jantar', sigla: 'Estar/jantar', poligono: ret(0.15, 0.15, 3.55, 4.35), areaCentesimos: 1428, rotulo: [1.85, 1.15] },
  {
    id: 'varanda',
    nome: 'Varanda',
    sigla: 'Varanda',
    // Em L, contornando a quina: o guarda-corpo de vidro tem 5 cm.
    poligono: [
      [-1.15, -1.15],
      [3.55, -1.15],
      [3.55, 0],
      [0, 0],
      [0, 1.775],
      [-1.15, 1.775],
    ],
    areaCentesimos: 745,
    rotulo: [0.3, -0.58],
  },
  { id: 'cozinha', nome: 'Cozinha', sigla: 'Cozinha', poligono: ret(0.15, 4.45, 3.55, 6.35), areaCentesimos: 646, rotulo: [1.55, 5.2] },
  { id: 'servico', nome: 'Área de serviço', sigla: 'A.S.', poligono: ret(3.65, 4.45, 4.85, 6.35), areaCentesimos: 228, rotulo: [4.25, 5.05] },
  { id: 'circulacao', nome: 'Circulação', sigla: 'Circ.', poligono: ret(3.65, 3.35, 7.25, 4.35), areaCentesimos: 360, rotulo: [5.45, 3.85] },
  { id: 'dormitorio', nome: 'Dormitório', sigla: 'Dorm.', poligono: ret(3.65, 0.15, 5.95, 3.25), areaCentesimos: 713, rotulo: [4.55, 2.45] },
  { id: 'suite', nome: 'Suíte', sigla: 'Suíte', poligono: ret(6.05, 0.15, 8.85, 3.25), areaCentesimos: 868, rotulo: [7.7, 2.6] },
  { id: 'banho-suite', nome: 'Banho da suíte', sigla: 'Banho', poligono: ret(7.35, 3.35, 8.85, 6.35), areaCentesimos: 450, rotulo: [8.1, 4.75] },
  { id: 'banho-social', nome: 'Banho social', sigla: 'Banho', poligono: ret(4.95, 4.45, 6.65, 6.35), areaCentesimos: 323, rotulo: [5.8, 5.05] },
];

const PAREDES: readonly Parede[] = [
  // Contorno: 15 cm. As de norte e sul vão de ponta a ponta; as laterais encaixam entre elas.
  { id: 'norte', de: [0, 0.075], ate: [9, 0.075], espessura: 0.15, externa: true },
  { id: 'oeste', de: [0.075, 0.15], ate: [0.075, 6.35], espessura: 0.15, externa: true },
  { id: 'leste', de: [8.925, 0.15], ate: [8.925, 6.35], espessura: 0.15, externa: false },
  { id: 'sul', de: [0, 6.425], ate: [9, 6.425], espessura: 0.15, externa: false },
  // Internas: 10 cm, encaixadas nas faces das outras.
  { id: 'sala-quartos', de: [3.6, 0.15], ate: [3.6, 6.35], espessura: 0.1, externa: false },
  { id: 'quartos-circulacao', de: [3.65, 3.3], ate: [8.85, 3.3], espessura: 0.1, externa: false },
  { id: 'dormitorio-suite', de: [6.0, 0.15], ate: [6.0, 3.25], espessura: 0.1, externa: false },
  { id: 'sala-cozinha', de: [0.15, 4.4], ate: [3.55, 4.4], espessura: 0.1, externa: false },
  { id: 'circulacao-servico', de: [3.65, 4.4], ate: [7.25, 4.4], espessura: 0.1, externa: false },
  { id: 'banho-suite', de: [7.3, 3.35], ate: [7.3, 6.35], espessura: 0.1, externa: false },
  { id: 'servico-banho', de: [4.9, 4.45], ate: [4.9, 6.35], espessura: 0.1, externa: false },
  { id: 'banho-shaft', de: [6.7, 4.45], ate: [6.7, 6.35], espessura: 0.1, externa: false },
];

const giro = (dobradica: 'de' | 'ate', para: ComodoId) => ({ dobradica, para });

const ABERTURAS: readonly Abertura[] = [
  // Entrada, vinda do corredor do prédio: abre para dentro, com a folha encostada na parede leste da cozinha.
  { id: 'entrada', parede: 'sul', tipo: 'porta', centro: 3.0, largura: 0.9, altura: 2.1, peitoril: 0, abre: giro('ate', 'cozinha') },
  // A sala se abre para a varanda nas duas fachadas.
  { id: 'sala-varanda-norte', parede: 'norte', tipo: 'porta-de-correr', centro: 1.7, largura: 2.5, altura: 2.1, peitoril: 0, abre: null },
  { id: 'sala-varanda-oeste', parede: 'oeste', tipo: 'porta-de-correr', centro: 0.75, largura: 1.2, altura: 2.1, peitoril: 0, abre: null },
  { id: 'janela-dormitorio', parede: 'norte', tipo: 'janela', centro: 4.8, largura: 1.4, altura: 1.1, peitoril: 1.0, abre: null },
  { id: 'janela-suite', parede: 'norte', tipo: 'janela', centro: 7.7, largura: 1.5, altura: 1.0, peitoril: 1.1, abre: null },
  { id: 'janela-cozinha', parede: 'oeste', tipo: 'janela', centro: 4.9, largura: 0.8, altura: 1.0, peitoril: 1.1, abre: null },
  // Cozinha integrada: um vão de passagem e um balcão para a sala.
  { id: 'cozinha-sala', parede: 'sala-cozinha', tipo: 'passagem', centro: 2.85, largura: 0.9, altura: 2.1, peitoril: 0, abre: null },
  { id: 'balcao', parede: 'sala-cozinha', tipo: 'balcao', centro: 1.25, largura: 1.9, altura: 1.05, peitoril: 1.05, abre: null },
  { id: 'sala-circulacao', parede: 'sala-quartos', tipo: 'passagem', centro: 3.7, largura: 0.8, altura: 2.1, peitoril: 0, abre: null },
  { id: 'servico', parede: 'sala-quartos', tipo: 'porta', centro: 4.75, largura: 0.7, altura: 2.1, peitoril: 0, abre: giro('de', 'servico') },
  { id: 'dormitorio', parede: 'quartos-circulacao', tipo: 'porta', centro: 0.6, largura: 0.8, altura: 2.1, peitoril: 0, abre: giro('de', 'dormitorio') },
  { id: 'suite', parede: 'quartos-circulacao', tipo: 'porta', centro: 2.9, largura: 0.8, altura: 2.1, peitoril: 0, abre: giro('de', 'suite') },
  { id: 'banho-suite', parede: 'quartos-circulacao', tipo: 'porta', centro: 4.45, largura: 0.7, altura: 2.1, peitoril: 0, abre: giro('ate', 'banho-suite') },
  { id: 'banho-social', parede: 'circulacao-servico', tipo: 'porta', centro: 1.85, largura: 0.7, altura: 2.1, peitoril: 0, abre: giro('ate', 'banho-social') },
];

const MOVEIS: readonly Movel[] = [
  { tipo: 'tapete', posicao: [1.85, 1.15], rotacao: 0, comodo: 'sala' },
  { tipo: 'sofa', posicao: [1.85, 2.2], rotacao: 180, comodo: 'sala' },
  { tipo: 'mesa-de-jantar', posicao: [1.85, 3.6], rotacao: 0, comodo: 'sala' },
  { tipo: 'planta', posicao: [3.25, 0.5], rotacao: 0, comodo: 'sala' },
  { tipo: 'mesa-da-varanda', posicao: [2.5, -0.58], rotacao: 0, comodo: 'varanda' },
  { tipo: 'planta', posicao: [-0.72, -0.72], rotacao: 0, comodo: 'varanda' },
  { tipo: 'planta', posicao: [-0.62, 1.3], rotacao: 0, comodo: 'varanda' },
  { tipo: 'geladeira', posicao: [0.5, 6.0], rotacao: 180, comodo: 'cozinha' },
  { tipo: 'pia', posicao: [1.3, 6.05], rotacao: 180, comodo: 'cozinha' },
  { tipo: 'bancada', posicao: [2.1, 6.05], rotacao: 180, comodo: 'cozinha' },
  { tipo: 'maquina', posicao: [4.525, 5.45], rotacao: 90, comodo: 'servico' },
  { tipo: 'pia', posicao: [4.25, 6.05], rotacao: 180, comodo: 'servico' },
  { tipo: 'cama-solteiro', posicao: [5.45, 1.15], rotacao: 0, comodo: 'dormitorio' },
  { tipo: 'guarda-roupa', posicao: [3.95, 1.05], rotacao: 270, comodo: 'dormitorio' },
  { tipo: 'cama-casal', posicao: [7.7, 1.13], rotacao: 0, comodo: 'suite' },
  { tipo: 'guarda-roupa', posicao: [6.35, 1.1], rotacao: 270, comodo: 'suite' },
  { tipo: 'pia', posicao: [7.66, 4.3], rotacao: 270, comodo: 'banho-suite' },
  { tipo: 'vaso', posicao: [7.7, 5.15], rotacao: 270, comodo: 'banho-suite' },
  { tipo: 'box', posicao: [8.1, 5.9], rotacao: 0, comodo: 'banho-suite' },
  { tipo: 'box', posicao: [6.2, 5.9], rotacao: 0, comodo: 'banho-social' },
  { tipo: 'vaso', posicao: [5.3, 6.02], rotacao: 180, comodo: 'banho-social' },
  { tipo: 'pia', posicao: [5.27, 5.0], rotacao: 270, comodo: 'banho-social' },
];

export const PLANTA = {
  nome: 'Planta-tipo de 2 dormitórios com suíte (fictícia)',
  tipologia: 'tipo-2d',
  /** Para onde fica o norte no desenho, em graus no sentido horário a partir do alto. */
  norte: 0,
  peDireito: 2.6,
  /** Na maquete, as paredes são cortadas nesta altura para se ver dentro. */
  alturaDoCorte: 2.2,
  /** Contorno da área privativa: faces externas das paredes e borda da varanda. */
  contorno: [
    [-1.2, -1.2],
    [3.6, -1.2],
    [3.6, 0],
    [9, 0],
    [9, 6.5],
    [0, 6.5],
    [0, 1.825],
    [-1.2, 1.825],
  ] as readonly Ponto[],
  areaPrivativaCentesimos: TIPOLOGIAS['tipo-2d'].areaCentesimos,
  areaUtilCentesimos: 5761,
  /** Borda de fora da varanda, por onde corre o guarda-corpo de vidro (1,10 m). */
  guardaCorpo: [
    [3.6, 0],
    [3.6, -1.2],
    [-1.2, -1.2],
    [-1.2, 1.825],
    [0, 1.825],
  ] as readonly Ponto[],
  alturaDoGuardaCorpo: 1.1,
  /** O vão técnico entre os banheiros (prumada hidráulica), sem piso de cômodo. */
  shaft: ret(6.75, 4.45, 7.25, 6.35) as readonly Ponto[],
  cotas: [
    { de: -1.2, ate: 3.6, lado: 'norte', nivel: 1 },
    { de: 3.6, ate: 9, lado: 'norte', nivel: 1 },
    { de: -1.2, ate: 9, lado: 'norte', nivel: 2 },
    { de: -1.2, ate: 0, lado: 'oeste', nivel: 1 },
    { de: 0, ate: 6.5, lado: 'oeste', nivel: 1 },
    { de: -1.2, ate: 6.5, lado: 'oeste', nivel: 2 },
  ] as readonly Cota[],
  comodos: COMODOS,
  paredes: PAREDES,
  aberturas: ABERTURAS,
  moveis: MOVEIS,
  entrada: 'entrada',
} as const;

export const IDS_DOS_COMODOS: readonly ComodoId[] = COMODOS.map((c) => c.id);

// ------------------------------------------------------------------ geometria pura

/** Área de um polígono simples pela fórmula do cadarço (shoelace), em m². */
export function areaDoPoligono(poligono: readonly Ponto[]): number {
  let soma = 0;
  for (let i = 0; i < poligono.length; i += 1) {
    const [x0, y0] = poligono[i]!;
    const [x1, y1] = poligono[(i + 1) % poligono.length]!;
    soma += x0 * y1 - x1 * y0;
  }
  return Math.abs(soma) / 2;
}

/** O ponto está dentro do polígono? (Raio para a direita; borda não conta como dentro.) */
export function contemPonto(poligono: readonly Ponto[], [x, y]: Ponto): boolean {
  let dentro = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i, i += 1) {
    const [xi, yi] = poligono[i]!;
    const [xj, yj] = poligono[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

export function comodo(id: ComodoId): Comodo {
  return COMODOS.find((c) => c.id === id)!;
}

export function parede(id: string): Parede {
  const achada = PAREDES.find((p) => p.id === id);
  if (!achada) throw new Error(`Parede desconhecida: ${id}`);
  return achada;
}

export function comprimentoDaParede(p: Parede): number {
  return Math.hypot(p.ate[0] - p.de[0], p.ate[1] - p.de[1]);
}

/** Vetor unitário de `de` para `ate`. */
export function direcaoDaParede(p: Parede): Ponto {
  const comprimento = comprimentoDaParede(p);
  return [(p.ate[0] - p.de[0]) / comprimento, (p.ate[1] - p.de[1]) / comprimento];
}

/** Ponto do eixo da parede a `distancia` metros de `de`. */
export function pontoNaParede(p: Parede, distancia: number): Ponto {
  const [dx, dy] = direcaoDaParede(p);
  return [p.de[0] + dx * distancia, p.de[1] + dy * distancia];
}

export function comodoNoPonto(ponto: Ponto): ComodoId | null {
  return COMODOS.find((c) => contemPonto(c.poligono, ponto))?.id ?? null;
}

/**
 * Os dois lados de uma abertura: o cômodo à esquerda e à direita do eixo (no sentido de `de` para
 * `ate`), ou 'fora' quando o lado é a rua, a varanda vizinha ou o corredor do prédio.
 */
export function ladosDaAbertura(a: Abertura): readonly [ComodoId | 'fora', ComodoId | 'fora'] {
  const p = parede(a.parede);
  const [cx, cy] = pontoNaParede(p, a.centro);
  const [dx, dy] = direcaoDaParede(p);
  const passo = p.espessura / 2 + 0.08;
  const lado = (sinal: 1 | -1): ComodoId | 'fora' => comodoNoPonto([cx + -dy * passo * sinal, cy + dx * passo * sinal]) ?? 'fora';
  return [lado(1), lado(-1)];
}

/** As aberturas por onde se anda de um cômodo a outro. */
export const ABERTURAS_DE_PASSAGEM: readonly TipoDeAbertura[] = ['porta', 'porta-de-correr', 'passagem'];

/** Os quatro cantos da pegada de um móvel, já girado. */
export function pegadaDoMovel(m: Movel): readonly Ponto[] {
  const { largura, profundidade } = DIMENSOES_DOS_MOVEIS[m.tipo];
  const deitado = m.rotacao === 90 || m.rotacao === 270;
  const meiaX = (deitado ? profundidade : largura) / 2;
  const meiaY = (deitado ? largura : profundidade) / 2;
  const [x, y] = m.posicao;
  return ret(x - meiaX, y - meiaY, x + meiaX, y + meiaY);
}

// ----------------------------------------------------------------------- texto

const NUMERO = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "14,28 m²" */
export function formatarArea(centesimos: number): string {
  return `${NUMERO.format(centesimos / 100)} m²`;
}

/** "9,00" (metros, como nas cotas). */
export function formatarMedida(metros: number): string {
  return NUMERO.format(metros);
}

/** O norte da unidade no desenho: o final 03 é o 02 espelhado de norte para sul. */
export function norteDaUnidade(espelhada: boolean): number {
  return espelhada ? (540 - PLANTA.norte) % 360 : PLANTA.norte;
}
