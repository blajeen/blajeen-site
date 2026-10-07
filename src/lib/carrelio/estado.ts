import { JAECOO_5, corPorId, versaoPorId } from './catalogo';
import { formatarDiaCurto, formatarReais } from './formatar';
import { CORES, VERSOES, type CorId, type Situacao, type VersaoId } from './tipos';

/**
 * O estado da loja na demonstração e o reducer que o muda: o estoque de cada cor em cada versão,
 * o preço da loja, a campanha e os pedidos de test drive. Puro e total: uma ação inválida devolve
 * o mesmo estado, e a interface valida antes, com as mesmas funções, para explicar o porquê.
 * Cada mudança deixa uma linha no histórico, com a hora que `despachar` carimba na ação.
 *
 * Estoque, preço da loja, campanha e pedidos são de demonstração: não são os da Comeri.
 */

/** Dia do calendário, `AAAA-MM-DD`, sem fuso. */
export type Dia = string;

export type Periodo = 'manha' | 'tarde';

/**
 * Unidades na loja agora e, quando não há, a previsão de chegada (em dias) ou nenhuma (sob
 * encomenda). A situação é derivada: ver `situacaoDe`.
 */
export type ItemDoEstoque = { quantidade: number; chegaEmDias: number | null };

export type Estoque = Readonly<Record<VersaoId, Readonly<Record<CorId, ItemDoEstoque>>>>;

/** Pedido de test drive da demonstração: sem nome, telefone nem e-mail. */
export type PedidoDeTestDrive = { id: string; versao: VersaoId; cor: CorId; dia: Dia; periodo: Periodo; atendido: boolean };

export type TipoDoHistorico = 'estoque' | 'preco' | 'campanha' | 'test-drive' | 'demo';

export type EntradaDoHistorico = { id: string; quando: string; texto: string; tipo: TipoDoHistorico };

export type EstadoCarrelio = {
  versao: 1;
  estoque: Estoque;
  /** Preço da loja por versão, em centavos. Começa no preço de lançamento da marca. */
  precos: Readonly<Record<VersaoId, number>>;
  campanha: { ativa: boolean; texto: string };
  testDrives: readonly PedidoDeTestDrive[];
  historico: readonly EntradaDoHistorico[];
  /** Contador das linhas do histórico e dos pedidos, para ids estáveis sem relógio nem sorteio. */
  sequencia: number;
};

export type AcaoCarrelio = (
  | { tipo: 'estoque/quantidade'; versao: VersaoId; cor: CorId; quantidade: number }
  | { tipo: 'estoque/chegada'; versao: VersaoId; cor: CorId; dias: number | null }
  | { tipo: 'preco'; versao: VersaoId; centavos: number }
  | { tipo: 'campanha'; ativa: boolean; texto?: string }
  | { tipo: 'test-drive/pedir'; versao: VersaoId; cor: CorId; dia: Dia; periodo: Periodo }
  | { tipo: 'test-drive/atender'; id: string }
  | { tipo: 'test-drive/remover'; id: string }
  | { tipo: 'demo/restaurar' }
) & { quando?: string };

export const HISTORICO_MAXIMO = 40;
export const PEDIDOS_MAXIMOS = 30;
export const QUANTIDADE_MAXIMA = 99;
export const CHEGADA_MAXIMA_DIAS = 120;
/** O preço da loja fica entre R$ 50 mil e R$ 1 milhão (fora disso é erro de digitação). */
export const PRECO_MINIMO_CENTAVOS = 50_000_00;
export const PRECO_MAXIMO_CENTAVOS = 1_000_000_00;
export const CAMPANHA_MAXIMA = 90;
/** Até quantos dias à frente dá para pedir o test drive. */
export const JANELA_DO_TEST_DRIVE_DIAS = 30;

export const CAMPANHA_INICIAL = 'Preço de lançamento nas primeiras 3.600 unidades do Brasil.';

export const NOMES_DO_PERIODO: Readonly<Record<Periodo, string>> = { manha: 'de manhã', tarde: 'à tarde' };

/** O estoque de demonstração com que a loja abre. Inventado: não é o estoque da Comeri. */
const ESTOQUE_INICIAL: Estoque = {
  comfort: {
    'branco-arctic': { quantidade: 3, chegaEmDias: null },
    'preto-andromeda': { quantidade: 2, chegaEmDias: null },
    'cinza-centaurus': { quantidade: 0, chegaEmDias: 12 },
    'azul-gaia': { quantidade: 1, chegaEmDias: null },
  },
  prestige: {
    'branco-arctic': { quantidade: 2, chegaEmDias: null },
    'preto-andromeda': { quantidade: 0, chegaEmDias: null },
    'cinza-centaurus': { quantidade: 1, chegaEmDias: null },
    'azul-gaia': { quantidade: 0, chegaEmDias: 20 },
  },
};

export function estadoInicial(): EstadoCarrelio {
  return {
    versao: 1,
    estoque: ESTOQUE_INICIAL,
    precos: { comfort: JAECOO_5.versoes[0]!.preco.lancamento * 100, prestige: JAECOO_5.versoes[1]!.preco.lancamento * 100 },
    campanha: { ativa: true, texto: CAMPANHA_INICIAL },
    testDrives: [],
    historico: [],
    sequencia: 0,
  };
}

export function inteiroEntre(valor: unknown, minimo: number, maximo: number): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= minimo && valor <= maximo;
}

export function ehVersao(valor: unknown): valor is VersaoId {
  return VERSOES.includes(valor as VersaoId);
}

export function ehCor(valor: unknown): valor is CorId {
  return CORES.includes(valor as CorId);
}

export function ehDia(valor: unknown): valor is Dia {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T12:00:00Z`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}

/** O dia `dias` depois de `dia` (aceita negativo). */
export function somarDias(dia: Dia, dias: number): Dia {
  const data = new Date(`${dia}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

/** O dia de hoje no relógio de quem usa (não em UTC: às 22h de Brasília ainda é hoje). */
export function diaLocal(agora: Date): Dia {
  const doisDigitos = (n: number) => String(n).padStart(2, '0');
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

export function situacaoDe(item: ItemDoEstoque): Situacao {
  if (item.quantidade > 0) return 'pronta-entrega';
  return item.chegaEmDias === null ? 'sob-encomenda' : 'a-caminho';
}

/** Por que um pedido de test drive não vale; `null` quando vale. */
export function validarTestDrive(dia: Dia, hoje: Dia): string | null {
  if (!ehDia(dia)) return 'Escolha um dia.';
  if (dia < hoje) return 'Esse dia já passou.';
  if (dia > somarDias(hoje, JANELA_DO_TEST_DRIVE_DIAS)) return `Escolha um dia nos próximos ${JANELA_DO_TEST_DRIVE_DIAS} dias.`;
  return null;
}

const nomeDoCarro = (versao: VersaoId, cor: CorId) => `${versaoPorId(JAECOO_5, versao).nome} ${corPorId(JAECOO_5, cor).nome}`;

function anotar(estado: EstadoCarrelio, tipo: TipoDoHistorico, texto: string, quando: string): Pick<EstadoCarrelio, 'historico' | 'sequencia'> {
  const sequencia = estado.sequencia + 1;
  const historico = [{ id: `h${sequencia}`, quando, texto, tipo }, ...estado.historico].slice(0, HISTORICO_MAXIMO);
  return { historico, sequencia };
}

function trocarItem(estoque: Estoque, versao: VersaoId, cor: CorId, item: ItemDoEstoque): Estoque {
  return { ...estoque, [versao]: { ...estoque[versao], [cor]: item } };
}

function rotuloDaChegada(dias: number | null): string {
  return dias === null ? 'sob encomenda' : `a caminho, chega em ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

export function reduzir(estado: EstadoCarrelio, acao: AcaoCarrelio): EstadoCarrelio {
  const quando = acao.quando ?? '';
  switch (acao.tipo) {
    case 'estoque/quantidade': {
      if (!ehVersao(acao.versao) || !ehCor(acao.cor) || !inteiroEntre(acao.quantidade, 0, QUANTIDADE_MAXIMA)) return estado;
      const atual = estado.estoque[acao.versao][acao.cor];
      if (atual.quantidade === acao.quantidade) return estado;
      // Chegou carro: a previsão de chegada deixa de valer. Acabou: fica sob encomenda até alguém dizer outra coisa.
      const item: ItemDoEstoque = { quantidade: acao.quantidade, chegaEmDias: acao.quantidade > 0 ? null : atual.chegaEmDias };
      const texto =
        acao.quantidade === 0
          ? `${nomeDoCarro(acao.versao, acao.cor)}: acabou na loja (${rotuloDaChegada(item.chegaEmDias)}).`
          : `${nomeDoCarro(acao.versao, acao.cor)}: ${atual.quantidade} → ${acao.quantidade} na loja.`;
      return { ...estado, estoque: trocarItem(estado.estoque, acao.versao, acao.cor, item), ...anotar(estado, 'estoque', texto, quando) };
    }
    case 'estoque/chegada': {
      if (!ehVersao(acao.versao) || !ehCor(acao.cor)) return estado;
      if (acao.dias !== null && !inteiroEntre(acao.dias, 1, CHEGADA_MAXIMA_DIAS)) return estado;
      const atual = estado.estoque[acao.versao][acao.cor];
      // A previsão só vale para quem não tem carro na loja.
      if (atual.quantidade > 0 || atual.chegaEmDias === acao.dias) return estado;
      const texto = `${nomeDoCarro(acao.versao, acao.cor)}: ${rotuloDaChegada(acao.dias)}.`;
      return {
        ...estado,
        estoque: trocarItem(estado.estoque, acao.versao, acao.cor, { quantidade: 0, chegaEmDias: acao.dias }),
        ...anotar(estado, 'estoque', texto, quando),
      };
    }
    case 'preco': {
      if (!ehVersao(acao.versao) || !inteiroEntre(acao.centavos, PRECO_MINIMO_CENTAVOS, PRECO_MAXIMO_CENTAVOS)) return estado;
      const anterior = estado.precos[acao.versao];
      if (anterior === acao.centavos) return estado;
      const texto = `${versaoPorId(JAECOO_5, acao.versao).nome}: preço da loja de ${formatarReais(anterior)} para ${formatarReais(acao.centavos)}.`;
      return { ...estado, precos: { ...estado.precos, [acao.versao]: acao.centavos }, ...anotar(estado, 'preco', texto, quando) };
    }
    case 'campanha': {
      const texto = (acao.texto ?? estado.campanha.texto).trim().replace(/\s+/g, ' ');
      if (typeof acao.ativa !== 'boolean' || texto.length > CAMPANHA_MAXIMA || (acao.ativa && texto.length === 0)) return estado;
      if (acao.ativa === estado.campanha.ativa && texto === estado.campanha.texto) return estado;
      const linha = acao.ativa ? `Campanha no ar: “${texto}”` : 'Campanha tirada do ar.';
      return { ...estado, campanha: { ativa: acao.ativa, texto }, ...anotar(estado, 'campanha', linha, quando) };
    }
    case 'test-drive/pedir': {
      if (!ehVersao(acao.versao) || !ehCor(acao.cor) || !ehDia(acao.dia) || (acao.periodo !== 'manha' && acao.periodo !== 'tarde')) return estado;
      if (estado.testDrives.length >= PEDIDOS_MAXIMOS) return estado;
      const sequencia = estado.sequencia + 1;
      const pedido: PedidoDeTestDrive = { id: `t${sequencia}`, versao: acao.versao, cor: acao.cor, dia: acao.dia, periodo: acao.periodo, atendido: false };
      const texto = `Pedido de test drive: ${nomeDoCarro(acao.versao, acao.cor)}, ${formatarDiaCurto(acao.dia)} ${NOMES_DO_PERIODO[acao.periodo]}.`;
      const comPedido = { ...estado, sequencia, testDrives: [pedido, ...estado.testDrives] };
      return { ...comPedido, ...anotar(comPedido, 'test-drive', texto, quando) };
    }
    case 'test-drive/atender': {
      const pedido = estado.testDrives.find((p) => p.id === acao.id);
      if (!pedido || pedido.atendido) return estado;
      const testDrives = estado.testDrives.map((p) => (p.id === acao.id ? { ...p, atendido: true } : p));
      const texto = `Test drive confirmado: ${nomeDoCarro(pedido.versao, pedido.cor)}, ${formatarDiaCurto(pedido.dia)} ${NOMES_DO_PERIODO[pedido.periodo]}.`;
      return { ...estado, testDrives, ...anotar(estado, 'test-drive', texto, quando) };
    }
    case 'test-drive/remover': {
      const pedido = estado.testDrives.find((p) => p.id === acao.id);
      if (!pedido) return estado;
      const texto = `Pedido de test drive removido: ${nomeDoCarro(pedido.versao, pedido.cor)}, ${formatarDiaCurto(pedido.dia)}.`;
      return { ...estado, testDrives: estado.testDrives.filter((p) => p.id !== acao.id), ...anotar(estado, 'test-drive', texto, quando) };
    }
    case 'demo/restaurar': {
      // A sequência continua de onde estava: os ids do histórico não se repetem.
      const base = { ...estadoInicial(), sequencia: estado.sequencia };
      return { ...base, ...anotar(base, 'demo', 'Demonstração restaurada.', quando) };
    }
    default:
      return estado;
  }
}
