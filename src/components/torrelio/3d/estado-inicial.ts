import { OBRA_INICIAL, statusInicial, UNIDADE_EM_DESTAQUE } from '@/lib/torrelio/dados';
import { LUZ } from '@/lib/torrelio/luz';
import { UNIDADES } from '@/lib/torrelio/predio';
import type { EstadoVisualTorre } from './contrato';

/**
 * O estado do pôster e do primeiro quadro quando a interface não manda o dela: a tabela de
 * lançamento (fictícia), a 1803 selecionada, contorno desligado, noite de verão às 20h30.
 */
export function estadoInicialDaTorre(movimento = true): EstadoVisualTorre {
  const luzes = new Uint8Array(UNIDADES.length);
  const disponiveis = new Uint8Array(UNIDADES.length);
  for (const unidade of UNIDADES) {
    const status = statusInicial(unidade);
    luzes[unidade.indice] = status === 'vendida' || status === 'indisponivel' ? LUZ.acesa : status === 'reservada' ? LUZ.baixa : LUZ.apagada;
    disponiveis[unidade.indice] = status === 'disponivel' ? 1 : 0;
  }
  return {
    modo: 'incorporadora',
    camada: 'comercial',
    luzes,
    disponiveis,
    selecionada: UNIDADES.find((u) => u.id === UNIDADE_EM_DESTAQUE)?.indice ?? null,
    pavimentoEmDestaque: null,
    contornar: false,
    hora: 20.5,
    estacao: 'verao',
    obra: { estruturaAte: OBRA_INICIAL.estruturaAte, fachadaAte: OBRA_INICIAL.fachadaAte },
    movimento,
  };
}
