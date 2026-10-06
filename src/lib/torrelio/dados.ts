import { ANDAR_VISTA_MAR, PRIMEIRO_TIPO, UNIDADES } from './predio';
import type { CategoriaId, StatusUnidade, TipologiaId, Unidade } from './tipos';

/**
 * Os dados-base da demonstração: tudo inventado para ela. Nenhum valor aqui vem de um
 * empreendimento real, e a página diz isso em cada bloco.
 */

export const EMPREENDIMENTO = {
  nome: 'Residencial Vértice',
  cidade: 'Porto Lume',
  /** A identidade do estado salvo no navegador: muda quando os dados-base mudarem. */
  base: 'vertice-1',
} as const;

export type Tipologia = {
  id: TipologiaId;
  nome: string;
  dormitorios: number;
  suites: number;
  /** Área privativa em centésimos de m² (8490 = 84,90 m²), para não somar float. */
  areaCentesimos: number;
  vagas: number;
};

export const TIPOLOGIAS: Readonly<Record<TipologiaId, Tipologia>> = {
  'tipo-3d': { id: 'tipo-3d', nome: '3 dormitórios, 1 suíte', dormitorios: 3, suites: 1, areaCentesimos: 8490, vagas: 2 },
  'tipo-2d': { id: 'tipo-2d', nome: '2 dormitórios, 1 suíte', dormitorios: 2, suites: 1, areaCentesimos: 6645, vagas: 1 },
  cobertura: { id: 'cobertura', nome: 'Cobertura duplex, 3 suítes', dormitorios: 3, suites: 3, areaCentesimos: 16800, vagas: 3 },
};

/** O canto do prédio de cada final, para o cartão ("canto sudoeste"). */
export const CANTO_DO_FINAL: Readonly<Record<string, string>> = {
  '01': 'nordeste',
  '02': 'noroeste',
  '03': 'sudoeste',
  '04': 'sudeste',
};

/**
 * Situação de lançamento, escrita à mão andar por andar (finais 01 a 04) para a fachada noturna ter
 * desenho: andares baixos quase todos vendidos, o alto do prédio mais escuro. V vendida,
 * R reservada, I indisponível (permuta), D disponível. Somam 41 V, 4 R, 2 I e 27 D: 55,4% vendido.
 */
const SITUACAO_POR_ANDAR: Readonly<Record<number, string>> = {
  2: 'VVVV',
  3: 'VVIV',
  4: 'VDVV',
  5: 'VDVV',
  6: 'VVDR',
  7: 'VVDD',
  8: 'DVVV',
  9: 'VIVD',
  10: 'VDVV',
  11: 'RVDV',
  12: 'DVVD',
  13: 'VDVD',
  14: 'VVDR',
  15: 'DVVD',
  16: 'DDVD',
  17: 'DVRD',
  18: 'VDDV',
  19: 'DVDD',
};
/** As coberturas: a da frente vendida, a dos fundos disponível. */
const SITUACAO_DAS_COBERTURAS: Readonly<Record<string, StatusUnidade>> = { '2001': 'vendida', '2002': 'disponivel' };

const LETRA: Readonly<Record<string, StatusUnidade>> = { V: 'vendida', R: 'reservada', I: 'indisponivel', D: 'disponivel' };

export function statusInicial(unidade: Unidade): StatusUnidade {
  if (unidade.tipologia === 'cobertura') return SITUACAO_DAS_COBERTURAS[unidade.id] ?? 'disponivel';
  const linha = SITUACAO_POR_ANDAR[unidade.pavimentos[0]!] ?? 'DDDD';
  return LETRA[linha[Number(unidade.final) - 1] ?? 'D'] ?? 'disponivel';
}

/** A unidade em destaque quando a demonstração abre: disponível, fundos, vista para o mar. */
export const UNIDADE_EM_DESTAQUE = '1803';

/**
 * Tabela de lançamento (fictícia): área × R$ 9.800/m², mais 1% por andar acima do 2º, mais 4% com
 * vista para o mar (fundos, do andar do mar para cima), mais 2% nos cantos do leste. Coberturas a
 * R$ 14.500/m². Arredondado ao centavo uma vez, no fim.
 */
export const PRECO_M2_TIPO_CENTAVOS = 980_000;
export const PRECO_M2_COBERTURA_CENTAVOS = 1_450_000;

export function veOMar(unidade: Unidade): boolean {
  return unidade.fachadas.includes('sul') && unidade.pavimentos[0]! >= ANDAR_VISTA_MAR;
}

export function precoInicialCentavos(unidade: Unidade): number {
  const area = TIPOLOGIAS[unidade.tipologia].areaCentesimos / 100;
  if (unidade.tipologia === 'cobertura') return Math.round(area * PRECO_M2_COBERTURA_CENTAVOS);
  const andar = 1 + 0.01 * (unidade.pavimentos[0]! - PRIMEIRO_TIPO);
  const mar = veOMar(unidade) ? 1.04 : 1;
  const cantoLeste = unidade.final === '01' || unidade.final === '04' ? 1.02 : 1;
  return Math.round(area * PRECO_M2_TIPO_CENTAVOS * andar * mar * cantoLeste);
}

export type GrupoDePagamento = 'entrada' | 'mensais' | 'reforcos' | 'chaves';

export type CondicaoPagamento = {
  indice: 'INCC' | 'IPCA' | 'nenhum';
  /** Pontos-base: 1000 = 10%. Os quatro grupos somam 10000. */
  grupos: readonly { id: GrupoDePagamento; pontosBase: number; parcelas: number }[];
};

/** Condição fictícia: 10% de entrada, 36 mensais (15%), 3 reforços anuais (15%) e 60% nas chaves. */
export const CONDICAO_INICIAL: CondicaoPagamento = {
  indice: 'INCC',
  grupos: [
    { id: 'entrada', pontosBase: 1000, parcelas: 1 },
    { id: 'mensais', pontosBase: 1500, parcelas: 36 },
    { id: 'reforcos', pontosBase: 1500, parcelas: 3 },
    { id: 'chaves', pontosBase: 6000, parcelas: 1 },
  ],
};

export const NOMES_DOS_GRUPOS: Readonly<Record<GrupoDePagamento, string>> = {
  entrada: 'Entrada',
  mensais: 'Mensais',
  reforcos: 'Reforços anuais',
  chaves: 'Chaves',
};

export type EtapaId = 'fundacao' | 'estrutura' | 'alvenaria' | 'instalacoes' | 'fachada' | 'acabamento';

export const ETAPAS: readonly { id: EtapaId; nome: string; peso: number }[] = [
  { id: 'fundacao', nome: 'Fundação', peso: 10 },
  { id: 'estrutura', nome: 'Estrutura', peso: 30 },
  { id: 'alvenaria', nome: 'Alvenaria', peso: 15 },
  { id: 'instalacoes', nome: 'Instalações', peso: 15 },
  { id: 'fachada', nome: 'Fachada', peso: 15 },
  { id: 'acabamento', nome: 'Acabamento', peso: 15 },
];

/** A estrutura sobe do térreo (1) ao coroamento (22); o vidro vai do 2º ao 21º. */
export const PAVIMENTOS_DA_ESTRUTURA = 22;

export type Obra = {
  mes: number;
  meses: number;
  /** Último pavimento com laje, de 1 a 22. */
  estruturaAte: number;
  /** Último pavimento com vidro, de 1 (nenhum) a 21. */
  fachadaAte: number;
  /** Percentual das etapas que não se medem em pavimentos. */
  etapas: Readonly<Record<'fundacao' | 'alvenaria' | 'instalacoes' | 'acabamento', number>>;
};

/** Obra fictícia, sem datas: mês 14 de 36, estrutura até o 12º, vidro até o 4º. */
export const OBRA_INICIAL: Obra = {
  mes: 14,
  meses: 36,
  estruturaAte: 12,
  fachadaAte: 4,
  etapas: { fundacao: 100, alvenaria: 35, instalacoes: 20, acabamento: 0 },
};

export type Categoria = { id: CategoriaId; nome: string; diariaCentavos: number; descricao: string };

/** Diárias fictícias por categoria; no fim de semana, +15%. */
export const CATEGORIAS: readonly Categoria[] = [
  { id: 'cidade', nome: 'Cidade', diariaCentavos: 38_000, descricao: 'Frente, para a avenida e o centro.' },
  { id: 'canto-cidade', nome: 'Canto cidade', diariaCentavos: 43_000, descricao: 'Frente, no canto, com janela em duas fachadas.' },
  { id: 'vista-parque', nome: 'Vista parque', diariaCentavos: 41_000, descricao: 'Fundos, até o 11º andar: parque e lago.' },
  { id: 'vista-mar', nome: 'Vista mar', diariaCentavos: 52_000, descricao: 'Fundos, do 12º andar para cima: o mar por cima da orla.' },
  { id: 'suite-cobertura', nome: 'Suíte cobertura', diariaCentavos: 120_000, descricao: 'Duplex no topo, com terraço.' },
];
export const FIM_DE_SEMANA_PONTOS_BASE = 1500;

export const TOTAL_DE_UNIDADES = UNIDADES.length;
