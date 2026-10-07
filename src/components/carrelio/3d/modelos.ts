import type { ManifestoDoModelo } from './contrato';

/**
 * Os modelos 3D do Carrelio. Provisório até a cena ficar pronta: o agente do 3D refaz este
 * arquivo com o mapeamento conferido no próprio glTF (pivôs das portas, pontos e câmeras).
 */

/** "Car Concept" das amostras glTF da Khronos (CC BY 4.0), até o Jaecoo 5 chegar. */
export const MODELO_PROVISORIO: ManifestoDoModelo = {
  id: 'conceito',
  url: '/produtos/carrelio/modelos/conceito.glb',
  credito: 'Carro provisório: Car Concept, de Eric Chadwick (Darmstadt Graphics Group), CC BY 4.0.',
  provisorio: true,
  comprimentoM: 4.38,
  pintura: ['Paint 1 Carmine', 'Paint 2 Carmine'],
  teto: ['BodyRoofPanel'],
  rack: [],
  farois: ['Headlight'],
  lanternas: ['Brakelight', 'Signallight'],
  esconder: ['License Plate', 'InteriorSteeringEmblem'],
  portas: {
    dianteiraEsquerda: { no: 'BodyDoorLColor1', eixo: 'y', graus: 65 },
    dianteiraDireita: { no: 'BodyDoorRColor1', eixo: 'y', graus: -65 },
  },
  pontos: {},
  interior: {},
};

export const MODELO_ATUAL: ManifestoDoModelo = MODELO_PROVISORIO;
