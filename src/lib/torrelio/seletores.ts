import { TIPOLOGIAS } from './dados';
import type { EstadoTorrelio } from './estado';
import { bloqueioNaNoite, quartoLivre, reservaNaNoite, validarPeriodo, type Dia } from './hotel';
import { LUZ } from './luz';
import { PRIMEIRO_TIPO, QUARTOS, ULTIMO_TIPO, UNIDADES, idDaUnidade } from './predio';
import type { CategoriaId, Modo, Quarto, StatusUnidade, Unidade } from './tipos';

/**
 * O que a interface e a cena leem do estado: o resumo comercial, as linhas do espelho, as luzes
 * da fachada e o contorno das disponíveis. Tudo derivado; nada aqui guarda nada.
 */

export type ResumoComercial = {
  total: number;
  porStatus: Readonly<Record<StatusUnidade, number>>;
  /** Soma da tabela de todas as unidades. */
  vgvTabelaCentavos: number;
  vgvVendidoCentavos: number;
  /** Vendidas sobre o total, de 0 a 1. */
  fracaoVendida: number;
  ticketMedioCentavos: number | null;
  /** Média do R$/m² das disponíveis, em centavos por m². */
  m2MedioDisponiveisCentavos: number | null;
};

export function resumoComercial(estado: EstadoTorrelio): ResumoComercial {
  const porStatus = { disponivel: 0, reservada: 0, vendida: 0, indisponivel: 0 };
  let vgvTabelaCentavos = 0;
  let vgvVendidoCentavos = 0;
  let somaM2 = 0;
  for (const unidade of UNIDADES) {
    const { status, precoCentavos } = estado.unidades[unidade.id]!;
    porStatus[status] += 1;
    vgvTabelaCentavos += precoCentavos;
    if (status === 'vendida') vgvVendidoCentavos += precoCentavos;
    if (status === 'disponivel') somaM2 += precoCentavos / (TIPOLOGIAS[unidade.tipologia].areaCentesimos / 100);
  }
  return {
    total: UNIDADES.length,
    porStatus,
    vgvTabelaCentavos,
    vgvVendidoCentavos,
    fracaoVendida: porStatus.vendida / UNIDADES.length,
    ticketMedioCentavos: porStatus.vendida ? Math.round(vgvVendidoCentavos / porStatus.vendida) : null,
    m2MedioDisponiveisCentavos: porStatus.disponivel ? Math.round(somaM2 / porStatus.disponivel) : null,
  };
}

export type CelulaDoEspelho = {
  id: string;
  indice: number;
  final: string;
  status: StatusUnidade;
  precoCentavos: number;
  /** As coberturas ocupam duas colunas do espelho. */
  colunas: 1 | 2;
};

export type LinhaDoEspelho = { rotulo: string; pavimentos: readonly number[]; celulas: readonly CelulaDoEspelho[] };

/** O espelho de cima para baixo, como o prédio: coberturas, depois do 19º ao 2º. */
export function linhasDoEspelho(estado: EstadoTorrelio): readonly LinhaDoEspelho[] {
  const celula = (unidade: Unidade, colunas: 1 | 2): CelulaDoEspelho => ({
    id: unidade.id,
    indice: unidade.indice,
    final: unidade.final,
    colunas,
    ...estado.unidades[unidade.id]!,
  });
  const coberturas = UNIDADES.filter((u) => u.tipologia === 'cobertura');
  const linhas: LinhaDoEspelho[] = [{ rotulo: '20º–21º', pavimentos: [20, 21], celulas: coberturas.map((u) => celula(u, 2)) }];
  for (let pavimento = ULTIMO_TIPO; pavimento >= PRIMEIRO_TIPO; pavimento -= 1) {
    const doAndar = UNIDADES.filter((u) => u.tipologia !== 'cobertura' && u.pavimentos[0] === pavimento);
    linhas.push({ rotulo: `${pavimento}º`, pavimentos: [pavimento], celulas: doAndar.map((u) => celula(u, 1)) });
  }
  return linhas;
}

export const LUZ_DO_STATUS: Readonly<Record<StatusUnidade, number>> = {
  disponivel: LUZ.apagada,
  reservada: LUZ.baixa,
  vendida: LUZ.acesa,
  indisponivel: LUZ.acesa,
};

/** Uma luz por unidade (incorporadora) ou por quarto na noite do dia (hotel). */
export function luzesDaTorre(estado: EstadoTorrelio, modo: Modo, dia: Dia | null): Uint8Array {
  if (modo === 'incorporadora') {
    return Uint8Array.from(UNIDADES, (u) => LUZ_DO_STATUS[estado.unidades[u.id]!.status]);
  }
  const { hotel } = estado;
  if (!hotel || !dia) return new Uint8Array(QUARTOS.length);
  return Uint8Array.from(QUARTOS, (q) => {
    if (reservaNaNoite(hotel, q.id, dia)) return LUZ.acesa;
    return bloqueioNaNoite(hotel, q.id, dia) ? LUZ.bloqueada : LUZ.apagada;
  });
}

export type FiltroDoHotel = { entrada: Dia; saida: Dia; hospedes: number; categoria: CategoriaId | null };

/** Quartos que servem ao pedido: livres no período inteiro, com lugar para todos e da categoria. */
export function quartoServe(estado: EstadoTorrelio, quarto: Quarto, filtro: FiltroDoHotel): boolean {
  const { hotel } = estado;
  if (!hotel || validarPeriodo(filtro.entrada, filtro.saida) !== null) return false;
  if (quarto.capacidade < filtro.hospedes) return false;
  if (filtro.categoria && quarto.categoria !== filtro.categoria) return false;
  return quartoLivre(hotel, quarto.id, filtro.entrada, filtro.saida);
}

/** 1 onde o contorno de "disponíveis" deve marcar. */
export function disponiveisDaTorre(estado: EstadoTorrelio, modo: Modo, filtro: FiltroDoHotel | null): Uint8Array {
  if (modo === 'incorporadora') return Uint8Array.from(UNIDADES, (u) => (estado.unidades[u.id]!.status === 'disponivel' ? 1 : 0));
  if (!filtro) return new Uint8Array(QUARTOS.length);
  return Uint8Array.from(QUARTOS, (q) => (quartoServe(estado, q, filtro) ? 1 : 0));
}

/** A disponível seguinte (para cima) ou anterior (para baixo), dando a volta no prédio. */
export function proximaDisponivel(estado: EstadoTorrelio, id: string, sentido: 1 | -1): string | null {
  const atual = UNIDADES.findIndex((u) => u.id === id);
  if (atual < 0) return null;
  for (let passo = 1; passo < UNIDADES.length; passo += 1) {
    const candidata = UNIDADES[(atual + sentido * passo + UNIDADES.length) % UNIDADES.length]!;
    if (estado.unidades[candidata.id]!.status === 'disponivel') return candidata.id;
  }
  return null;
}

/** A mesma prumada (mesmo final) um andar acima ou abaixo: o "elevador" da vista. */
export function vizinhaNaPrumada(id: string, sentido: 1 | -1): Unidade | null {
  const unidade = UNIDADES.find((u) => u.id === id);
  if (!unidade || unidade.tipologia === 'cobertura') return null;
  const pavimento = unidade.pavimentos[0]! + sentido;
  if (pavimento < PRIMEIRO_TIPO || pavimento > ULTIMO_TIPO) return null;
  return UNIDADES.find((u) => u.id === idDaUnidade(pavimento, unidade.final)) ?? null;
}

/** No hotel, o mesmo final um andar acima ou abaixo. */
export function quartoNaPrumada(id: string, sentido: 1 | -1): Quarto | null {
  const quarto = QUARTOS.find((q) => q.id === id);
  if (!quarto || quarto.categoria === 'suite-cobertura') return null;
  const pavimento = quarto.pavimento + sentido;
  if (pavimento < PRIMEIRO_TIPO || pavimento > ULTIMO_TIPO) return null;
  return QUARTOS.find((q) => q.id === idDaUnidade(pavimento, quarto.final)) ?? null;
}
