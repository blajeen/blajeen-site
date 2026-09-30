/**
 * Tipos dos modelos de contrato e do catálogo de serviços.
 *
 * Os dados-base vivem em `modelos.generated.ts`, exportado pelo kit comercial. Os preços que o
 * titular publica no painel (Catálogo) sobrescrevem os preços-base sem alterar esse arquivo.
 */

export const SERVICOS_IDS = ['site', 'sistema', 'video', 'jogo', 'projeto'] as const;
export type ServicoId = (typeof SERVICOS_IDS)[number];

export type ItemDeClausula =
  | { html: string; lista?: string[] }
  | { bloco: string };

export type Clausula = { n: number; titulo: string; itens: ItemDeClausula[] };

export type ModeloContrato = {
  slug: ServicoId;
  codigo: string;
  indice: string;
  tituloCurto: string;
  h1: string;
  lead: string;
  revisoesCurto: string;
  garantiaCurto: string;
  pagamento: string;
  multiPlano: boolean;
  etapas: Array<{ titulo: string; descricao: string }>;
  anexo2: string[][];
  entregaveis: string[];
  clausulas: Clausula[];
};

export type PlanoCatalogo = {
  id: string;
  nivel: string;
  nome: string;
  preco: number;
  unidade: string;
  aPartir: boolean;
  prazo: string;
  itens: string[];
  destaque: boolean;
};

export type MensalCatalogo = { id: string; nome: string; preco: number; unidade: string; descricao: string };

/** `preco` textual ("sob orçamento") não é editável como número. */
export type AdicionalCatalogo = { id: string; nome: string; preco: number | string; qualificador: string };

export type ServicoCatalogo = {
  numero: string;
  nome: string;
  rotulo: string;
  tag: string;
  intro: string;
  ideal: string[];
  destaque: string[] | null;
  planos: PlanoCatalogo[];
  mensais: MensalCatalogo[];
  adicionais: AdicionalCatalogo[];
};
