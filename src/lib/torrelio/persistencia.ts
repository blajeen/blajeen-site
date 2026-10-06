import { validarCondicao } from './calculos';
import { CONDICAO_INICIAL, EMPREENDIMENTO, type CondicaoPagamento } from './dados';
import {
  DIARIA_MAXIMA_CENTAVOS, DIARIA_MINIMA_CENTAVOS, HISTORICO_MAXIMO, NOMES_DO_STATUS, PRECO_MAXIMO_CENTAVOS, PRECO_MINIMO_CENTAVOS,
  inteiroEntre, obraValida, type EntradaDoHistorico, type EscopoDoReajuste, type EstadoTorrelio, type EstadoUnidade, type Tabela,
} from './estado';
import { ehDia, validarPeriodo, type Bloqueio, type EstadoHotel, type Reserva } from './hotel';
import { QUARTOS, UNIDADES } from './predio';
import type { CategoriaId, StatusUnidade } from './tipos';

/**
 * O estado da demonstração no navegador de quem testa: só ali, sem servidor. O registro é
 * versionado e conferido campo a campo na leitura; qualquer coisa estranha (outra versão, outra
 * base, um id desconhecido, um número fora da faixa) faz a demonstração voltar ao estado-base.
 */

export const CHAVE_DO_ARMAZENAMENTO = 'blajeen:torrelio:v1';

type Registro = { v: 1; base: string; salvoEm: string; estado: EstadoTorrelio };

export function serializar(estado: EstadoTorrelio, salvoEm: string): string {
  const registro: Registro = { v: 1, base: EMPREENDIMENTO.base, salvoEm, estado };
  return JSON.stringify(registro);
}

const objeto = (valor: unknown): valor is Record<string, unknown> => typeof valor === 'object' && valor !== null && !Array.isArray(valor);
const texto = (valor: unknown, maximo = 240): valor is string => typeof valor === 'string' && valor.length <= maximo;
const lista = (valor: unknown, maximo: number): valor is unknown[] => Array.isArray(valor) && valor.length <= maximo;

const STATUS = new Set(Object.keys(NOMES_DO_STATUS));
const ESCOPOS = new Set<EscopoDoReajuste>(['disponiveis', 'nao-vendidas', 'todas']);
const TIPOS_DO_HISTORICO = new Set(['status', 'preco', 'tabela', 'condicao', 'obra', 'hotel', 'demo']);
const CAPACIDADE = new Map(QUARTOS.map((q) => [q.id, q.capacidade]));
const CATEGORIAS: readonly CategoriaId[] = ['cidade', 'canto-cidade', 'vista-parque', 'vista-mar', 'suite-cobertura'];

function lerUnidades(valor: unknown): Record<string, EstadoUnidade> | null {
  if (!objeto(valor)) return null;
  const unidades: Record<string, EstadoUnidade> = {};
  for (const { id } of UNIDADES) {
    const item = valor[id];
    if (!objeto(item) || !STATUS.has(item.status as string) || !inteiroEntre(item.precoCentavos, PRECO_MINIMO_CENTAVOS, PRECO_MAXIMO_CENTAVOS)) return null;
    unidades[id] = { status: item.status as StatusUnidade, precoCentavos: item.precoCentavos };
  }
  return Object.keys(valor).length === UNIDADES.length ? unidades : null;
}

function lerTabelas(valor: unknown): Tabela[] | null {
  if (!lista(valor, 200) || !valor.length) return null;
  const tabelas: Tabela[] = [];
  for (const item of valor) {
    if (!objeto(item) || !inteiroEntre(item.numero, 1, 1000) || !inteiroEntre(item.pontosBase, -1000, 3000)) return null;
    if (!ESCOPOS.has(item.escopo as EscopoDoReajuste) || !(item.quando === null || texto(item.quando, 40)) || !inteiroEntre(item.afetadas, 0, UNIDADES.length)) return null;
    tabelas.push({ numero: item.numero, pontosBase: item.pontosBase, escopo: item.escopo as EscopoDoReajuste, quando: item.quando as string | null, afetadas: item.afetadas });
  }
  return tabelas;
}

function lerCondicao(valor: unknown): CondicaoPagamento | null {
  if (!objeto(valor) || !['INCC', 'IPCA', 'nenhum'].includes(valor.indice as string) || !lista(valor.grupos, 4)) return null;
  const grupos = valor.grupos.map((g, i) => {
    const esperado = CONDICAO_INICIAL.grupos[i]!.id;
    return objeto(g) && g.id === esperado ? { id: esperado, pontosBase: g.pontosBase as number, parcelas: g.parcelas as number } : null;
  });
  if (grupos.length !== 4 || grupos.some((g) => g === null)) return null;
  const condicao: CondicaoPagamento = { indice: valor.indice as CondicaoPagamento['indice'], grupos: grupos as CondicaoPagamento['grupos'] };
  return validarCondicao(condicao) === null ? condicao : null;
}

function lerObra(valor: unknown): EstadoTorrelio['obra'] | null {
  if (!objeto(valor) || !objeto(valor.etapas)) return null;
  const { etapas } = valor;
  const obra = {
    mes: valor.mes as number,
    meses: valor.meses as number,
    estruturaAte: valor.estruturaAte as number,
    fachadaAte: valor.fachadaAte as number,
    etapas: {
      fundacao: etapas.fundacao as number,
      alvenaria: etapas.alvenaria as number,
      instalacoes: etapas.instalacoes as number,
      acabamento: etapas.acabamento as number,
    },
  };
  return obraValida(obra) ? obra : null;
}

function lerReserva(item: unknown): Reserva | null {
  if (!objeto(item) || !texto(item.id, 40) || !CAPACIDADE.has(item.quarto as string)) return null;
  if (!ehDia(item.entrada) || !ehDia(item.saida) || validarPeriodo(item.entrada, item.saida) !== null) return null;
  if (!inteiroEntre(item.hospedes, 1, CAPACIDADE.get(item.quarto as string)!) || (item.origem !== 'cliente' && item.origem !== 'painel')) return null;
  return { id: item.id, quarto: item.quarto as string, entrada: item.entrada, saida: item.saida, hospedes: item.hospedes, origem: item.origem };
}

function lerBloqueio(item: unknown): Bloqueio | null {
  if (!objeto(item) || !texto(item.id, 40) || !CAPACIDADE.has(item.quarto as string)) return null;
  if (!ehDia(item.de) || !ehDia(item.ate) || validarPeriodo(item.de, item.ate) !== null) return null;
  return { id: item.id, quarto: item.quarto as string, de: item.de, ate: item.ate };
}

function lerHotel(valor: unknown): EstadoHotel | null | undefined {
  if (valor === null) return null;
  if (!objeto(valor) || !ehDia(valor.diaBase) || !objeto(valor.diarias) || !inteiroEntre(valor.fimDeSemanaPb, 0, 5000)) return undefined;
  const diarias = {} as Record<CategoriaId, number>;
  for (const categoria of CATEGORIAS) {
    const diaria = valor.diarias[categoria];
    if (!inteiroEntre(diaria, DIARIA_MINIMA_CENTAVOS, DIARIA_MAXIMA_CENTAVOS)) return undefined;
    diarias[categoria] = diaria;
  }
  if (!lista(valor.reservas, 300) || !lista(valor.canceladas, 3000) || !lista(valor.bloqueios, 300)) return undefined;
  const reservas = valor.reservas.map(lerReserva);
  const bloqueios = valor.bloqueios.map(lerBloqueio);
  if (reservas.some((r) => !r) || bloqueios.some((b) => !b) || !valor.canceladas.every((id) => texto(id, 40))) return undefined;
  return {
    diaBase: valor.diaBase,
    diarias,
    fimDeSemanaPb: valor.fimDeSemanaPb,
    reservas: reservas as Reserva[],
    canceladas: valor.canceladas as string[],
    bloqueios: bloqueios as Bloqueio[],
  };
}

function lerHistorico(valor: unknown): EntradaDoHistorico[] | null {
  if (!lista(valor, HISTORICO_MAXIMO)) return null;
  const historico: EntradaDoHistorico[] = [];
  for (const item of valor) {
    if (!objeto(item) || !texto(item.id, 40) || !texto(item.quando, 40) || !texto(item.texto) || !TIPOS_DO_HISTORICO.has(item.tipo as string)) return null;
    historico.push({ id: item.id, quando: item.quando, texto: item.texto, tipo: item.tipo as EntradaDoHistorico['tipo'] });
  }
  return historico;
}

/** O estado guardado, conferido; `null` quando não há nada aproveitável. */
export function lerRegistro(bruto: string | null): EstadoTorrelio | null {
  if (!bruto) return null;
  let registro: unknown;
  try {
    registro = JSON.parse(bruto);
  } catch {
    return null;
  }
  if (!objeto(registro) || registro.v !== 1 || registro.base !== EMPREENDIMENTO.base || !objeto(registro.estado)) return null;
  const { estado } = registro;
  if (estado.versao !== 1 || !inteiroEntre(estado.sequencia, 0, Number.MAX_SAFE_INTEGER)) return null;
  const unidades = lerUnidades(estado.unidades);
  const tabelas = lerTabelas(estado.tabelas);
  const condicao = lerCondicao(estado.condicao);
  const obra = lerObra(estado.obra);
  const hotel = lerHotel(estado.hotel);
  const historico = lerHistorico(estado.historico);
  if (!unidades || !tabelas || !condicao || !obra || hotel === undefined || !historico) return null;
  return { versao: 1, unidades, tabelas, condicao, obra, hotel, historico, sequencia: estado.sequencia };
}
