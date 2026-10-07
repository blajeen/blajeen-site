import type { ManifestoDoModelo, PecaPorRegiao, RegiaoDoCarro } from './contrato';
import { espelharPeca } from './pecas';

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

/**
 * As portas do Jaecoo, recortadas da malha pelas emendas da lataria (medidas em vistas laterais
 * ortográficas do arquivo, com grade em metros). A porta é tudo que fica de x 0,685 para fora dentro
 * do contorno de lado: a lata, a forração de dentro (x 0,70 a 0,76), a moldura do vidro e, na da
 * frente, o retrovisor. Os bancos e o fim do painel ficam aquém de x 0,68, e a borda do teto (x 0,60
 * a 0,68) também: a moldura escura vai com a porta, o teto na cor da lataria fica.
 */
const DE_FORA_DA_CABINE: readonly [number, number] = [0.685, 1.3];

/**
 * Dianteira esquerda: a emenda da frente desce do canto do retrovisor por trás do para-lama; em
 * cima, a moldura acompanha a coluna A até o teto; atrás, a emenda da coluna B (z −0,163), que divide
 * a coluna preta entre as duas portas, como no carro.
 */
const DIANTEIRA_ESQUERDA: PecaPorRegiao = {
  contornos: [
    {
      plano: 'zy',
      pontos: [
        // A emenda da frente, de baixo até o canto do retrovisor.
        [0.888, 0.355], [0.92, 1.16],
        // A borda de baixo da coluna A (onde a lataria vira a moldura preta), 1,2 cm para dentro do preto.
        [0.88, 1.188], [0.84, 1.224], [0.8, 1.256], [0.76, 1.282], [0.72, 1.32], [0.68, 1.352], [0.64, 1.382], [0.6, 1.406], [0.56, 1.432],
        [0.52, 1.454], [0.48, 1.478], [0.44, 1.502], [0.4, 1.524], [0.36, 1.548], [0.32, 1.568], [0.28, 1.586], [0.24, 1.6], [0.2, 1.612],
        [0.16, 1.62], [0.12, 1.626], [0.06, 1.631], [-0.04, 1.636], [-0.163, 1.64],
        // A emenda da coluna B, até embaixo.
        [-0.166, 0.355],
      ],
      faixa: DE_FORA_DA_CABINE,
    },
    // O retrovisor, que é preso na porta e passa da coluna A para a frente, de lado.
    { plano: 'zy', pontos: [[0.56, 1.1], [0.87, 1.1], [0.87, 1.43], [0.56, 1.43]], faixa: [0.84, 1.3] },
  ],
  // A dobradiça um pouco à frente da borda da porta, perto da lata: a borda sai sem entrar no para-lama.
  dobradica: [0.9, 0.8, 0.93],
  eixo: 'y',
  graus: -65,
};

/**
 * Traseira esquerda: da emenda da coluna B até a da coluna C; embaixo, a emenda contorna a caixa da
 * roda de trás. Em cima, a moldura vai até o vidro fixo de trás (z −1,13).
 */
const TRASEIRA_ESQUERDA: PecaPorRegiao = {
  contornos: [
    {
      plano: 'zy',
      pontos: [
        // A emenda da coluna B; em cima, a moldura até 1 cm abaixo da borda do teto (y 1,655).
        [-0.166, 0.355], [-0.163, 1.64], [-0.6, 1.645], [-1.1, 1.645], [-1.13, 1.642],
        // A moldura até o vidro fixo de trás, e a emenda que desce da linha de cintura até o arco.
        [-1.13, 1.27], [-1.184, 1.25], [-1.184, 1.22], [-1.18, 1.18], [-1.17, 1.14], [-1.16, 1.1], [-1.148, 1.06], [-1.136, 1.02], [-1.12, 0.96],
        [-1.106, 0.92], [-1.086, 0.88], [-1.066, 0.86], [-1.045, 0.82], [-1.025, 0.785],
        // O arco da roda (onde a lataria vira o escuro do arco), 1 cm para o lado da porta.
        [-1.012, 0.76], [-0.968, 0.72], [-0.936, 0.68], [-0.91, 0.64], [-0.892, 0.6], [-0.876, 0.56], [-0.866, 0.52], [-0.858, 0.48],
        [-0.854, 0.44], [-0.852, 0.4], [-0.852, 0.355],
      ],
      faixa: DE_FORA_DA_CABINE,
    },
  ],
  dobradica: [0.9, 0.8, -0.15],
  eixo: 'y',
  graus: -65,
};

/**
 * A tampa traseira, de trás: o aerofólio no alto, o vidro entre as colunas D e o painel de baixo,
 * com a parte de dentro das lanternas, até o para-choque. Ela gira na borda de trás do teto.
 */
const TAMPA_TRASEIRA: PecaPorRegiao = {
  // As emendas da vista de trás, meio centímetro para dentro da tampa (a linha escura fica na
  // carroceria). O arquivo não é simétrico: a emenda da direita (x < 0) fica 2 cm mais perto do
  // centro. Por dentro, a tampa é só a casca (aerofólio, vidro e painel): na frente do vidro ficam o
  // forro do teto e a tampa do bagageiro, que são da cabine. Por isso a profundidade muda com a
  // altura, em três faixas.
  contornos: [
    {
      // Acima do vidro: o aerofólio, da emenda no teto para trás.
      plano: 'xy',
      pontos: [[0.675, 1.765], [0.675, 1.62], [0.615, 1.6], [-0.595, 1.6], [-0.655, 1.62], [-0.655, 1.765]],
      faixa: [-2.6, -1.655],
    },
    {
      // O alto do vidro, que faz curva (de cima, ele avança nos cantos): atrás de uma linha entre o
      // vidro e o forro, a 1 a 4 cm de cada um (medidos de 20 em 20 cm).
      plano: 'xz',
      pontos: [
        [0.6155, -2.6], [0.6155, -1.58], [0.55, -1.58], [0.5, -1.6], [0.4, -1.665], [0.2, -1.722], [0, -1.738],
        [-0.2, -1.722], [-0.4, -1.665], [-0.5, -1.6], [-0.55, -1.58], [-0.5955, -1.58], [-0.5955, -2.6],
      ],
      faixa: [1.53, 1.6],
    },
    {
      // O resto do vidro e o painel: atrás de z −1,70 (a tampa do bagageiro acaba em −1,693).
      plano: 'xy',
      pontos: [
        [0.6162, 1.53], [0.62, 1.3], [0.655, 1.255], [0.66, 1.13], [0.666, 1.0], [0.67, 0.8], [0.655, 0.745], [0.62, 0.732],
        [-0.6, 0.732], [-0.633, 0.745], [-0.648, 0.8], [-0.643, 1.0], [-0.638, 1.13], [-0.632, 1.255], [-0.6, 1.3], [-0.5962, 1.53],
      ],
      faixa: [-2.6, -1.7],
    },
  ],
  // No alto da emenda, logo acima do aerofólio (y 1,707): ao abrir, nada da tampa entra na cabine.
  dobradica: [0, 1.71, -1.655],
  eixo: 'x',
  graus: 75,
};

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
      // A forração das portas (x 0,70 a 0,76), que aparece com a porta aberta: é interior, não lataria.
      ...espelhar({ centro: [0.73, 0.79, -0.14], meias: [0.065, 0.42, 1.03] }),
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
    // As janelas das portas vêm vazadas no arquivo: um vidro por porta, por dentro da moldura, que
    // vai junto quando a porta abre (a coluna B esconde a junta). A borda de cima desce para trás e a
    // de trás para na coluna C: ali a lataria entra, e o vidro passava da moldura (conferido com o
    // vidro pintado de vermelho, de lado e de ¾).
    ...quadEspelhado([[0.8, 1.21, 0.78], [0.66, 1.68, 0.2], [0.665, 1.665, -0.12], [0.8, 1.21, -0.12]]),
    ...quadEspelhado([[0.8, 1.21, -0.21], [0.665, 1.665, -0.21], [0.67, 1.648, -1.09], [0.8, 1.21, -1.15]]),
  ],
  portas: {
    dianteiraEsquerda: DIANTEIRA_ESQUERDA,
    dianteiraDireita: espelharPeca(DIANTEIRA_ESQUERDA),
    traseiraEsquerda: TRASEIRA_ESQUERDA,
    traseiraDireita: espelharPeca(TRASEIRA_ESQUERDA),
    portaMalas: TAMPA_TRASEIRA,
  },
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
