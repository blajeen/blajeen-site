import type { ServicoId } from '@/content/contratos/tipos';

export type ContratoStatus = 'AGUARDANDO_CLIENTE' | 'PREENCHIDO' | 'ASSINADO' | 'CANCELADO';

export const STATUS_ROTULO: Record<ContratoStatus, string> = {
  AGUARDANDO_CLIENTE: 'Aguardando cliente',
  PREENCHIDO: 'Preenchido pelo cliente',
  ASSINADO: 'Assinado',
  CANCELADO: 'Cancelado',
};

/**
 * Os campos do contrato usam as mesmas chaves dos marcadores `{{chave|...}}` dos modelos.
 * Caixas de seleção guardam `'1'` quando marcadas.
 */
export type CamposContrato = Record<string, string>;

export type Contrato = {
  id: string;
  numero: string;
  servico: ServicoId;
  status: ContratoStatus;
  /** Definidos pela Blajeen no painel: plano, valor, prazo, pagamento, combinado etc. */
  termos: CamposContrato;
  /** Dados do CONTRATANTE, enviados pelo cliente pelo link (ou preenchidos no painel). */
  cliente: CamposContrato;
  tokenHash: string;
  tokenEncrypted: string;
  tokenExpiresAt: string;
  clienteEnviadoEm: string | null;
  assinadoEm: string | null;
  /** Controle financeiro: 50% adiantado e 50% no final. */
  entradaRecebidaEm: string | null;
  saldoRecebidoEm: string | null;
  /** Pedido do "Crie seu projeto" que originou o contrato, quando houver. */
  pedidoId: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

/** Visão do painel: inclui o link do cliente, nunca o hash. */
export type ContratoAdmin = Omit<Contrato, 'tokenHash' | 'tokenEncrypted'> & { linkCliente: string };

/** Visão pública para o link do cliente: sem ids internos nem token. */
export type ContratoPublico = {
  numero: string;
  servico: ServicoId;
  status: ContratoStatus;
  termos: CamposContrato;
  cliente: CamposContrato;
  expiraEm: string;
};

/** Ajustes publicados no painel "Catálogo", sobre os preços-base do kit. */
export type AjustesCatalogo = {
  validade?: string;
  horaTecnica?: number;
  servicos?: Partial<Record<ServicoId, {
    planos?: Record<string, { preco?: number; prazo?: string; aPartir?: boolean }>;
    mensais?: Record<string, { preco?: number }>;
    adicionais?: Record<string, { preco?: number }>;
  }>>;
};
