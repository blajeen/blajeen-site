import type { ManifestoDoModelo, RegiaoDoCarro } from './contrato';

/**
 * Os modelos 3D do Carrelio: um manifesto por arquivo, conferido no próprio glTF (os testes leem o
 * `.glb` e provam que nós, materiais e pontos batem com ele).
 *
 * - `MODELO_ATUAL` é o que a página mostra: o Jaecoo 5 gerado no Tripo (malha única, cor assada na
 *   textura), pintado por máscara.
 * - `MODELO_PROVISORIO` é o "Car Concept" das amostras glTF da Khronos, só para desenvolvimento: tem
 *   portas, porta-malas, interior e materiais separados, e é com ele que a cena prova essas partes.
 *   O arquivo não é publicado (fica fora de `public/`); para usar, ponha `conceito.glb` em
 *   `public/produtos/carrelio/modelos/` só na sua máquina.
 *
 * Coordenadas: metros no espaço do carro já ajustado (frente para +Z, esquerda, o lado do
 * motorista, para +X, rodas em y = 0).
 */

const rodas = (frente: number, tras: number, x: number, y: number, raio: number, meiaLargura: number): RegiaoDoCarro[] =>
  [frente, tras].flatMap((z) => [x, -x].map((cx) => ({ centro: [cx, y, z] as const, raio, meiaLargura })));

const espelhar = (r: Extract<RegiaoDoCarro, { meias: unknown }>): RegiaoDoCarro[] => [r, { ...r, centro: [-r.centro[0], r.centro[1], r.centro[2]] as const }];

type Vetor = readonly [number, number, number];
const quadEspelhado = (q: readonly [Vetor, Vetor, Vetor, Vetor]) =>
  [q, q.map((p) => [-p[0], p[1], p[2]] as const).reverse() as unknown as readonly [Vetor, Vetor, Vetor, Vetor]] as const;

/**
 * O manifesto de um carro gerado por IA (malha única, sem portas nem interior), com o que vale para
 * todos eles: verniz acetinado e normais soldadas (a superfície gerada é ondulada e cortada nas
 * costuras da textura, e o reflexo nítido denuncia). A máscara da pintura, as regiões, os pontos e o
 * crédito são de cada arquivo.
 */
export function manifestoDeIa(m: Pick<ManifestoDoModelo, 'id' | 'url' | 'credito' | 'comprimentoM' | 'pontos'> & Partial<ManifestoDoModelo>): ManifestoDoModelo {
  return {
    provisorio: false,
    pintura: [],
    teto: [],
    rack: [],
    farois: [],
    lanternas: [],
    esconder: [],
    portas: {},
    interior: {},
    // Verniz acetinado: o reflexo nítido desenhava as ondas e os vincos da malha gerada.
    verniz: { intensidade: 0.75, rugosidade: 0.2 },
    suavizarNormais: true,
    ...m,
  };
}

/** As rodas do Jaecoo: entre-eixos de 2,62 m, aro de 18" com pneu de ~0,74 m. */
const RODAS_DO_JAECOO = rodas(1.37, -1.27, 0.82, 0.375, 0.39, 0.18);

/** O Jaecoo 5 de verdade, gerado no Tripo a partir de fotos (CC BY 4.0). */
export const MODELO_JAECOO_5: ManifestoDoModelo = manifestoDeIa({
  id: 'jaecoo-5',
  url: '/produtos/carrelio/modelos/jaecoo-5.glb',
  credito: 'Modelo 3D do Jaecoo 5 gerado com Tripo AI (CC BY 4.0)',
  comprimentoM: 4.38,
  pontos: {
    farois: [0.75, 0.94, 2.03],
    rodas: [0.98, 0.37, 1.37],
    teto: [0, 1.79, -0.35],
    portaMalas: [0, 1.02, -2.23],
  },
  pinturaPorMascara: {
    // O cinza neutro da lataria assada (por volta de 104 a 136 em sRGB).
    corBase: '#787a7b',
    tolerancia: 0.13,
    excluirRegioes: [
      // As quatro rodas: os aros têm o mesmo cinza da lataria.
      ...RODAS_DO_JAECOO,
      // A cabine por dentro (os bancos aparecem pelas janelas vazadas).
      { centro: [0, 1.05, -0.45], meias: [0.7, 0.55, 1.32] },
    ],
  },
  vidrosPorRegiao: [
    // Para-brisa (deitado 35°), vidro traseiro (48°) e os vidros fixos atrás das portas.
    { centro: [0, 1.372, 0.806], meias: [0.7, 0.06, 0.36], inclinacao: 35.3 },
    { centro: [0, 1.433, -1.897], meias: [0.6, 0.06, 0.19], inclinacao: -48.2 },
    { centro: [0, 1.43, -1.47], meias: [0.88, 0.15, 0.25] },
  ],
  // O painel do teto, entre os trilhos: pintura, preto (bicolor) ou vidro (teto panorâmico).
  tetoPorRegiao: [{ centro: [0, 1.705, -0.64], meias: [0.53, 0.07, 1.08] }],
  metalPorRegiao: RODAS_DO_JAECOO,
  janelas: [
    // As janelas das portas vêm vazadas no arquivo: um vidro de cada lado, por dentro da moldura. A
    // borda de cima desce para trás e a de trás para na coluna C: ali a lataria entra, e o vidro
    // passava da moldura (conferido com o vidro pintado de vermelho, de lado e de ¾).
    ...quadEspelhado([[0.8, 1.21, 0.78], [0.66, 1.68, 0.2], [0.67, 1.648, -1.09], [0.8, 1.21, -1.15]]),
  ],
  regioesDeLuz: {
    farois: espelhar({ centro: [0.72, 0.927, 1.96], meias: [0.17, 0.055, 0.14] }),
    lanternas: [...espelhar({ centro: [0.64, 1.175, -2.1], meias: [0.17, 0.035, 0.07] }), ...espelhar({ centro: [0.66, 0.62, -2.12], meias: [0.1, 0.03, 0.06] })],
  },
});

/** "Car Concept" das amostras glTF da Khronos (CC BY 4.0): o carro de desenvolvimento. */
export const MODELO_PROVISORIO: ManifestoDoModelo = {
  id: 'conceito',
  url: '/produtos/carrelio/modelos/conceito.glb',
  credito: 'Carro provisório: Car Concept, de Eric Chadwick (Darmstadt Graphics Group), CC BY 4.0.',
  provisorio: true,
  comprimentoM: 4.36,
  pintura: ['Paint 1 Carmine'],
  teto: ['BodyRoofPanel'],
  rack: [],
  farois: ['Headlight'],
  lanternas: ['Brakelight'],
  // A placa traz o logotipo da Khronos.
  esconder: ['License Plate'],
  portas: {
    // Portas convencionais, com a dobradiça na frente; o pivô do arquivo já está nela.
    dianteiraEsquerda: { no: 'BodyDoorLColor1', eixo: 'z', graus: -62 },
    dianteiraDireita: { no: 'BodyDoorRColor1', eixo: 'z', graus: 62 },
    // A traseira inteira (vidro, lanternas e tampa) abre como uma concha, pela dobradiça de trás.
    portaMalas: { no: 'BodyRearPanelsColor1', eixo: 'x', graus: -36 },
  },
  pontos: {
    farois: [0.64, 0.68, 1.99],
    rodas: [1.1, 0.38, 1.25],
    teto: [0, 1.2, -0.32],
    portaMalas: [0, 1.02, -1.86],
    painel: [0, 0.8, 1.04],
    multimidia: [-0.34, 0.8, 1.16],
    bancos: [0.13, 0.92, -0.02],
    carregador: [0, 0.52, -0.3],
  },
  pontosDeDentro: ['painel', 'multimidia', 'bancos', 'carregador'],
  interior: {
    // O volante fica no centro (posição central de dirigir, 1 + 2 + 1 lugares).
    motorista: { olho: [0, 0.95, 0.13], alvo: [0, 0.74, 1.4] },
    bancoTraseiro: { olho: [0.43, 0.94, -0.52], alvo: [-0.05, 0.74, 1.3] },
    // A traseira abre pela dobradiça de trás: o porta-malas se vê do lado, por cima da porta.
    portaMalas: { olho: [1.3, 1.85, -0.3], alvo: [0, 0.55, -1.2] },
  },
  telas: ['Dashboard'],
  semMarcas: { Tireside: ['map', 'normalMap'] },
  acabamentos: {
    Tireside: { cor: '#1c1d1e', rugosidade: 0.82 },
    Tiretread: { rugosidade: 0.78 },
    Headlight: { cor: '#b9c1ca', metalico: 1, rugosidade: 0.16 },
    Brakelight: { cor: '#4a0a0c', rugosidade: 0.2 },
    Signallight: { cor: '#4a2a08', rugosidade: 0.2 },
    'Paint 2 Carmine': { cor: '#0e0f11', rugosidade: 0.28 },
    Rim1: { cor: '#1a1b1d', rugosidade: 0.32 },
  },
};

/**
 * Prova da pintura por máscara com o próprio Car Concept, na variante branca ("Pearly Swirly"):
 * sem materiais de pintura, só a máscara pela cor (como num modelo de IA) e as luzes por região.
 * Só a lataria pode mudar de cor; o interior branco sai por material.
 */
export const MODELO_DE_TESTE_DA_MASCARA: ManifestoDoModelo = {
  ...MODELO_PROVISORIO,
  id: 'conceito-mascara',
  variante: 'Pearly Swirly',
  pintura: [],
  farois: [],
  lanternas: [],
  teto: [],
  portas: {},
  interior: {},
  pontos: {
    farois: MODELO_PROVISORIO.pontos['farois']!,
    rodas: MODELO_PROVISORIO.pontos['rodas']!,
    teto: MODELO_PROVISORIO.pontos['teto']!,
    portaMalas: MODELO_PROVISORIO.pontos['portaMalas']!,
  },
  pontosDeDentro: [],
  // A pintura perolada do arquivo é metálica: tinge metal, e os cromados (aros, espelho, ferragens)
  // e o interior branco saem por material.
  pinturaPorMascara: { corBase: '#bcbcbc', tolerancia: 0.16, tingirMetal: true, excluirMateriais: ['Interior 3 Pearl', 'Rim2', 'Mirror', 'Hardware'] },
  verniz: { intensidade: 0.8, rugosidade: 0.14 },
  regioesDeLuz: {
    farois: espelhar({ centro: [0.62, 0.66, 1.94], meias: [0.2, 0.05, 0.1] }),
    lanternas: espelhar({ centro: [0.45, 0.96, -1.69], meias: [0.22, 0.03, 0.06] }),
  },
};

export const MODELO_ATUAL: ManifestoDoModelo = MODELO_JAECOO_5;
