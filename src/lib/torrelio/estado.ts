import { LIMITES_DO_REAJUSTE, formatarPontosBase, reajustar, validarCondicao } from './calculos';
import {
  CONDICAO_INICIAL, FIM_DE_SEMANA_PONTOS_BASE, NOMES_DOS_GRUPOS, OBRA_INICIAL, PAVIMENTOS_DA_ESTRUTURA, precoInicialCentavos,
  statusInicial, type CondicaoPagamento, type Obra,
} from './dados';
import { formatarCentavos, formatarDiaCurto } from './formatar';
import {
  DIARIAS_INICIAIS, ehDia, quartoLivre, reservasIniciais, validarPeriodo, type Bloqueio, type Dia, type EstadoHotel, type Reserva,
} from './hotel';
import { QUARTOS, ULTIMO_TIPO, UNIDADES } from './predio';
import type { CategoriaId, StatusUnidade } from './tipos';

/**
 * O estado da demonstração e o reducer que o muda. Puro e total: uma ação inválida devolve o
 * mesmo estado, e a interface valida antes, com as mesmas funções, para explicar o porquê.
 * Cada mudança deixa uma linha no histórico, com a hora que `despachar` carimba na ação.
 */

export type EscopoDoReajuste = 'disponiveis' | 'nao-vendidas' | 'todas';

export type Tabela = { numero: number; pontosBase: number; escopo: EscopoDoReajuste; quando: string | null; afetadas: number };

export type TipoDoHistorico = 'status' | 'preco' | 'tabela' | 'condicao' | 'obra' | 'hotel' | 'demo';

export type EntradaDoHistorico = { id: string; quando: string; texto: string; tipo: TipoDoHistorico };

export type EstadoUnidade = { status: StatusUnidade; precoCentavos: number };

export type EstadoTorrelio = {
  versao: 1;
  unidades: Readonly<Record<string, EstadoUnidade>>;
  tabelas: readonly Tabela[];
  condicao: CondicaoPagamento;
  obra: Obra;
  hotel: EstadoHotel | null;
  historico: readonly EntradaDoHistorico[];
  /** Contador das linhas do histórico e das reservas, para ids estáveis sem relógio nem sorteio. */
  sequencia: number;
};

export type AcaoTorrelio = (
  | { tipo: 'unidade/status'; ids: readonly string[]; status: StatusUnidade }
  | { tipo: 'unidade/preco'; id: string; precoCentavos: number }
  | { tipo: 'tabela/reajustar'; pontosBase: number; escopo: EscopoDoReajuste }
  | { tipo: 'condicao/definir'; condicao: CondicaoPagamento }
  | { tipo: 'obra/definir'; obra: Partial<Omit<Obra, 'etapas'>> & { etapas?: Partial<Obra['etapas']> } }
  | { tipo: 'hotel/iniciar'; hoje: Dia }
  | { tipo: 'hotel/diaria'; categoria: CategoriaId; centavos: number }
  | { tipo: 'hotel/fim-de-semana'; pontosBase: number }
  | { tipo: 'hotel/reservar'; quarto: string; entrada: Dia; saida: Dia; hospedes: number; origem: 'cliente' | 'painel' }
  | { tipo: 'hotel/cancelar'; reservaId: string }
  | { tipo: 'hotel/bloquear'; quarto: string; de: Dia; ate: Dia }
  | { tipo: 'hotel/desbloquear'; bloqueioId: string }
  | { tipo: 'demo/restaurar' }
) & { quando?: string };

export const HISTORICO_MAXIMO = 40;
export const PRECO_MINIMO_CENTAVOS = 10_000_00;
export const PRECO_MAXIMO_CENTAVOS = 50_000_000_00;
export const DIARIA_MINIMA_CENTAVOS = 50_00;
export const DIARIA_MAXIMA_CENTAVOS = 10_000_00;

export const NOMES_DO_STATUS: Readonly<Record<StatusUnidade, { singular: string; plural: string }>> = {
  disponivel: { singular: 'disponível', plural: 'disponíveis' },
  reservada: { singular: 'reservada', plural: 'reservadas' },
  vendida: { singular: 'vendida', plural: 'vendidas' },
  indisponivel: { singular: 'indisponível', plural: 'indisponíveis' },
};

const NOMES_DO_ESCOPO: Readonly<Record<EscopoDoReajuste, string>> = {
  disponiveis: 'disponíveis',
  'nao-vendidas': 'não vendidas',
  todas: 'unidades',
};

export function estadoInicial(): EstadoTorrelio {
  const unidades: Record<string, EstadoUnidade> = {};
  for (const unidade of UNIDADES) unidades[unidade.id] = { status: statusInicial(unidade), precoCentavos: precoInicialCentavos(unidade) };
  return {
    versao: 1,
    unidades,
    tabelas: [{ numero: 1, pontosBase: 0, escopo: 'todas', quando: null, afetadas: UNIDADES.length }],
    condicao: CONDICAO_INICIAL,
    obra: OBRA_INICIAL,
    hotel: null,
    historico: [],
    sequencia: 0,
  };
}

const IDS_DAS_UNIDADES = new Set(UNIDADES.map((u) => u.id));
const QUARTO_POR_ID = new Map(QUARTOS.map((q) => [q.id, q]));

function registrar(estado: EstadoTorrelio, quando: string, tipo: TipoDoHistorico, texto: string): Pick<EstadoTorrelio, 'historico' | 'sequencia'> {
  const sequencia = estado.sequencia + 1;
  return { sequencia, historico: [{ id: `h${sequencia}`, quando, texto, tipo }, ...estado.historico].slice(0, HISTORICO_MAXIMO) };
}

export function inteiroEntre(valor: unknown, min: number, max: number): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= min && valor <= max;
}

/** A obra é coerente: o vidro não passa da estrutura, e tudo dentro dos limites. */
export function obraValida(obra: Obra): boolean {
  return (
    inteiroEntre(obra.meses, 1, 120) && inteiroEntre(obra.mes, 0, obra.meses) &&
    inteiroEntre(obra.estruturaAte, 1, PAVIMENTOS_DA_ESTRUTURA) &&
    inteiroEntre(obra.fachadaAte, 1, Math.min(ULTIMO_TIPO + 2, obra.estruturaAte)) &&
    (['fundacao', 'alvenaria', 'instalacoes', 'acabamento'] as const).every((etapa) => inteiroEntre(obra.etapas[etapa], 0, 100))
  );
}

/** "18º", "20º–21º": o andar como aparece na interface. */
export function andarDe(id: string): string {
  const unidade = UNIDADES.find((u) => u.id === id);
  if (!unidade) return '';
  return unidade.pavimentos.map((p) => `${p}º`).join('–');
}

function textoDoStatus(ids: readonly string[], status: StatusUnidade): string {
  const nome = NOMES_DO_STATUS[status];
  if (ids.length === 1) return `Unidade ${ids[0]} marcada como ${nome.singular}`;
  const andares = new Set(ids.map(andarDe));
  const onde = andares.size === 1 ? ` do ${[...andares][0]}` : '';
  return `${ids.length} unidades${onde} marcadas como ${nome.plural}`;
}

export function reduzir(estado: EstadoTorrelio, acao: AcaoTorrelio): EstadoTorrelio {
  const quando = acao.quando ?? new Date(0).toISOString();
  switch (acao.tipo) {
    case 'unidade/status': {
      const ids = [...new Set(acao.ids)].filter((id) => IDS_DAS_UNIDADES.has(id) && estado.unidades[id]!.status !== acao.status);
      if (!ids.length || !(acao.status in NOMES_DO_STATUS)) return estado;
      const unidades = { ...estado.unidades };
      for (const id of ids) unidades[id] = { ...unidades[id]!, status: acao.status };
      return { ...estado, unidades, ...registrar(estado, quando, 'status', textoDoStatus(ids, acao.status)) };
    }
    case 'unidade/preco': {
      const atual = estado.unidades[acao.id];
      if (!atual || !inteiroEntre(acao.precoCentavos, PRECO_MINIMO_CENTAVOS, PRECO_MAXIMO_CENTAVOS) || atual.precoCentavos === acao.precoCentavos) return estado;
      const unidades = { ...estado.unidades, [acao.id]: { ...atual, precoCentavos: acao.precoCentavos } };
      return { ...estado, unidades, ...registrar(estado, quando, 'preco', `Preço da ${acao.id} alterado para ${formatarCentavos(acao.precoCentavos)}`) };
    }
    case 'tabela/reajustar': {
      const { pontosBase, escopo } = acao;
      if (!inteiroEntre(pontosBase, LIMITES_DO_REAJUSTE.min, LIMITES_DO_REAJUSTE.max) || pontosBase === 0 || !(escopo in NOMES_DO_ESCOPO)) return estado;
      const entra = (status: StatusUnidade) =>
        escopo === 'todas' || status === 'disponivel' || (escopo === 'nao-vendidas' && status !== 'vendida');
      const unidades = { ...estado.unidades };
      let afetadas = 0;
      for (const [id, unidade] of Object.entries(unidades)) {
        if (!entra(unidade.status)) continue;
        unidades[id] = { ...unidade, precoCentavos: reajustar(unidade.precoCentavos, pontosBase) };
        afetadas += 1;
      }
      if (!afetadas) return estado;
      const numero = (estado.tabelas.at(-1)?.numero ?? 1) + 1;
      const sinal = pontosBase > 0 ? '' : '−';
      const texto = `Tabela ${numero}: reajuste de ${sinal}${formatarPontosBase(Math.abs(pontosBase))} em ${afetadas} ${NOMES_DO_ESCOPO[escopo]}`;
      return { ...estado, unidades, tabelas: [...estado.tabelas, { numero, pontosBase, escopo, quando, afetadas }], ...registrar(estado, quando, 'tabela', texto) };
    }
    case 'condicao/definir': {
      if (validarCondicao(acao.condicao) !== null) return estado;
      const ids = acao.condicao.grupos.map((g) => g.id).join();
      if (ids !== CONDICAO_INICIAL.grupos.map((g) => g.id).join() || !['INCC', 'IPCA', 'nenhum'].includes(acao.condicao.indice)) return estado;
      if (JSON.stringify(acao.condicao) === JSON.stringify(estado.condicao)) return estado;
      const resumo = acao.condicao.grupos
        .filter((g) => g.pontosBase > 0)
        .map((g) => `${NOMES_DOS_GRUPOS[g.id].toLowerCase()} ${formatarPontosBase(g.pontosBase)}`)
        .join(', ');
      return { ...estado, condicao: acao.condicao, ...registrar(estado, quando, 'condicao', `Condição de pagamento: ${resumo}`) };
    }
    case 'obra/definir': {
      const obra: Obra = { ...estado.obra, ...acao.obra, etapas: { ...estado.obra.etapas, ...acao.obra.etapas } };
      if (!obraValida(obra) || JSON.stringify(obra) === JSON.stringify(estado.obra)) return estado;
      const partes: string[] = [];
      if (obra.estruturaAte !== estado.obra.estruturaAte) partes.push(`estrutura até o ${obra.estruturaAte}º`);
      if (obra.fachadaAte !== estado.obra.fachadaAte) partes.push(obra.fachadaAte > 1 ? `fachada até o ${obra.fachadaAte}º` : 'fachada por começar');
      if (obra.mes !== estado.obra.mes) partes.push(`mês ${obra.mes} de ${obra.meses}`);
      if (JSON.stringify(obra.etapas) !== JSON.stringify(estado.obra.etapas)) partes.push('etapas atualizadas');
      return { ...estado, obra, ...registrar(estado, quando, 'obra', `Obra: ${partes.join(', ')}`) };
    }
    case 'hotel/iniciar': {
      if (estado.hotel || !ehDia(acao.hoje)) return estado;
      // As reservas iniciais não entram no estado: saem de `reservasIniciais(diaBase)`.
      reservasIniciais(acao.hoje);
      return {
        ...estado,
        hotel: { diaBase: acao.hoje, diarias: DIARIAS_INICIAIS, fimDeSemanaPb: FIM_DE_SEMANA_PONTOS_BASE, reservas: [], canceladas: [], bloqueios: [] },
      };
    }
    case 'hotel/diaria': {
      const hotel = estado.hotel;
      if (!hotel || !(acao.categoria in hotel.diarias) || !inteiroEntre(acao.centavos, DIARIA_MINIMA_CENTAVOS, DIARIA_MAXIMA_CENTAVOS)) return estado;
      if (hotel.diarias[acao.categoria] === acao.centavos) return estado;
      const texto = `Diária ${acao.categoria === 'suite-cobertura' ? 'da suíte' : 'da categoria'} alterada para ${formatarCentavos(acao.centavos)}`;
      return { ...estado, hotel: { ...hotel, diarias: { ...hotel.diarias, [acao.categoria]: acao.centavos } }, ...registrar(estado, quando, 'hotel', texto) };
    }
    case 'hotel/fim-de-semana': {
      const hotel = estado.hotel;
      if (!hotel || !inteiroEntre(acao.pontosBase, 0, 5000) || hotel.fimDeSemanaPb === acao.pontosBase) return estado;
      return {
        ...estado,
        hotel: { ...hotel, fimDeSemanaPb: acao.pontosBase },
        ...registrar(estado, quando, 'hotel', `Fim de semana: diárias +${formatarPontosBase(acao.pontosBase)}`),
      };
    }
    case 'hotel/reservar': {
      const hotel = estado.hotel;
      const quarto = QUARTO_POR_ID.get(acao.quarto);
      if (!hotel || !quarto || validarPeriodo(acao.entrada, acao.saida) !== null) return estado;
      if (!inteiroEntre(acao.hospedes, 1, quarto.capacidade) || !quartoLivre(hotel, quarto.id, acao.entrada, acao.saida)) return estado;
      const proximo = registrar(estado, quando, 'hotel', `Quarto ${quarto.id} reservado de ${formatarDiaCurto(acao.entrada)} a ${formatarDiaCurto(acao.saida)} (${acao.origem === 'cliente' ? 'pelo cliente' : 'pelo painel'})`);
      const reserva: Reserva = { id: `r${proximo.sequencia}`, quarto: quarto.id, entrada: acao.entrada, saida: acao.saida, hospedes: acao.hospedes, origem: acao.origem };
      return { ...estado, hotel: { ...hotel, reservas: [...hotel.reservas, reserva] }, ...proximo };
    }
    case 'hotel/cancelar': {
      const hotel = estado.hotel;
      if (!hotel) return estado;
      const feita = hotel.reservas.find((r) => r.id === acao.reservaId);
      const inicial = feita ? null : reservasIniciais(hotel.diaBase).find((r) => r.id === acao.reservaId);
      if ((!feita && !inicial) || hotel.canceladas.includes(acao.reservaId)) return estado;
      const reserva = (feita ?? inicial)!;
      const texto = `Reserva do quarto ${reserva.quarto} (${formatarDiaCurto(reserva.entrada)} a ${formatarDiaCurto(reserva.saida)}) cancelada`;
      const novo: EstadoHotel = feita
        ? { ...hotel, reservas: hotel.reservas.filter((r) => r.id !== acao.reservaId) }
        : { ...hotel, canceladas: [...hotel.canceladas, acao.reservaId] };
      return { ...estado, hotel: novo, ...registrar(estado, quando, 'hotel', texto) };
    }
    case 'hotel/bloquear': {
      const hotel = estado.hotel;
      const quarto = QUARTO_POR_ID.get(acao.quarto);
      if (!hotel || !quarto || validarPeriodo(acao.de, acao.ate) !== null || !quartoLivre(hotel, quarto.id, acao.de, acao.ate)) return estado;
      const proximo = registrar(estado, quando, 'hotel', `Quarto ${quarto.id} bloqueado para manutenção de ${formatarDiaCurto(acao.de)} a ${formatarDiaCurto(acao.ate)}`);
      const bloqueio: Bloqueio = { id: `b${proximo.sequencia}`, quarto: quarto.id, de: acao.de, ate: acao.ate };
      return { ...estado, hotel: { ...hotel, bloqueios: [...hotel.bloqueios, bloqueio] }, ...proximo };
    }
    case 'hotel/desbloquear': {
      const hotel = estado.hotel;
      const bloqueio = hotel?.bloqueios.find((b) => b.id === acao.bloqueioId);
      if (!hotel || !bloqueio) return estado;
      return {
        ...estado,
        hotel: { ...hotel, bloqueios: hotel.bloqueios.filter((b) => b.id !== acao.bloqueioId) },
        ...registrar(estado, quando, 'hotel', `Quarto ${bloqueio.quarto} liberado`),
      };
    }
    case 'demo/restaurar': {
      const inicial = estadoInicial();
      return { ...inicial, ...registrar(inicial, quando, 'demo', 'Demonstração restaurada') };
    }
  }
}

/** A tabela vigente, para o cartão ("tabela 2"). */
export function tabelaVigente(estado: EstadoTorrelio): Tabela {
  return estado.tabelas.at(-1)!;
}
