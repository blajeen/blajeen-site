import type { EstadoVisualCarro } from './contrato';

/**
 * O estado do primeiro quadro, o mesmo do pôster (`tools/carrelio-poster.mjs`): Prestige, Azul
 * Gaia, por fora, no estúdio, faróis apagados, portas fechadas, câmera ¾ de frente. A interface abre
 * neste estado (`interfaceInicial`), e o 3D troca o pôster sem salto.
 */
export const COR_DO_POSTER = '#435a8a';

export function estadoDoPoster(movimento: boolean): EstadoVisualCarro {
  return {
    pintura: COR_DO_POSTER,
    tetoPreto: false,
    tetoPanoramico: true,
    rackDeTeto: true,
    portas: { dianteiraEsquerda: false, dianteiraDireita: false, traseiraEsquerda: false, traseiraDireita: false, portaMalas: false },
    farois: false,
    vista: 'fora',
    ponto: 'motorista',
    ambiente: 'estudio',
    girando: false,
    movimento,
  };
}
