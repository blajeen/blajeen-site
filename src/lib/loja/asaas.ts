import { timingSafeEqual } from 'node:crypto';
import type { PedidoLoja, PedidoLojaStatus } from './tipos';

/**
 * Pagamento pelo Asaas.
 *
 * O site nunca toca em dado de cartão: cria o cliente e uma cobrança com `billingType: UNDEFINED`
 * e manda a pessoa para a página de pagamento do próprio Asaas, onde ela escolhe Pix, cartão ou
 * boleto. A confirmação chega depois, pelo webhook (`/api/loja/asaas`).
 *
 * Variáveis na Vercel (nunca no código):
 * - `ASAAS_API_KEY`: chave da API, em Integrações no painel do Asaas;
 * - `ASAAS_AMBIENTE`: `sandbox` para testar; qualquer outro valor (ou nada) é produção;
 * - `ASAAS_WEBHOOK_TOKEN`: o mesmo token informado ao cadastrar o webhook no Asaas.
 */

const BASES = { producao: 'https://api.asaas.com/v3', sandbox: 'https://api-sandbox.asaas.com/v3' };

export function asaasConfigurado(): boolean {
  return Boolean(process.env.ASAAS_API_KEY?.trim());
}

function base(): string {
  return process.env.ASAAS_AMBIENTE?.trim() === 'sandbox' ? BASES.sandbox : BASES.producao;
}

type ErroAsaas = { errors?: Array<{ code?: string; description?: string }> };

async function chamar<T>(caminho: string, corpo: unknown): Promise<T> {
  const chave = process.env.ASAAS_API_KEY?.trim();
  if (!chave) throw new Error('Pagamento online não configurado.');
  const resposta = await fetch(`${base()}${caminho}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      access_token: chave,
      // O Asaas exige um User-Agent com o nome da aplicação.
      'User-Agent': 'BlajeenLabsSite/1.0.0',
    },
    body: JSON.stringify(corpo),
    cache: 'no-store',
  });
  const dados = await resposta.json().catch(() => ({})) as T & ErroAsaas;
  if (!resposta.ok) {
    const motivo = dados.errors?.map((e) => e.description).filter(Boolean).join(' ') || `status ${resposta.status}`;
    throw new ErroDoAsaas(motivo, resposta.status);
  }
  return dados;
}

export class ErroDoAsaas extends Error {
  constructor(motivo: string, readonly status: number) {
    super(`Asaas: ${motivo}`);
  }
}

/** Vencimento da cobrança: três dias depois de hoje, no horário de Brasília. */
export function vencimento(agora = new Date()): string {
  const depois = new Date(agora.getTime() + 3 * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(depois);
}

/**
 * Cria o cliente e a cobrança do pedido e devolve o endereço da página de pagamento.
 *
 * Com `sucessoUrl`, o Asaas manda a pessoa de volta ao site depois de pagar. Se a conta recusar o
 * retorno (o domínio do site precisa estar no cadastro do Asaas), a cobrança sai sem ele: a
 * pessoa paga do mesmo jeito, só não volta sozinha.
 */
export async function criarCobranca(pedido: PedidoLoja, sucessoUrl: string): Promise<{ cobrancaId: string; url: string; status: string }> {
  const e = pedido.endereco;
  const cliente = await chamar<{ id: string }>('/customers', {
    name: pedido.nome,
    cpfCnpj: pedido.cpfCnpj,
    email: pedido.email,
    mobilePhone: pedido.telefone.replace(/\D/g, ''),
    ...(e ? { postalCode: e.cep, address: e.logradouro, addressNumber: e.numero, complement: e.complemento, province: e.bairro } : {}),
    externalReference: pedido.id,
  });
  const cobranca = {
    customer: cliente.id,
    billingType: 'UNDEFINED',
    value: pedido.totalCentavos / 100,
    dueDate: vencimento(),
    description: `Pedido ${pedido.numero} — Loja Blajeen Labs`.slice(0, 500),
    externalReference: pedido.id,
  };
  type Cobranca = { id: string; invoiceUrl: string; status: string };
  let criada: Cobranca;
  try {
    criada = await chamar<Cobranca>('/payments', { ...cobranca, callback: { successUrl: sucessoUrl, autoRedirect: true } });
  } catch (erro) {
    if (!(erro instanceof ErroDoAsaas) || erro.status >= 500) throw erro;
    criada = await chamar<Cobranca>('/payments', cobranca);
  }
  return { cobrancaId: criada.id, url: criada.invoiceUrl, status: criada.status };
}

/** O webhook só vale com o token cadastrado no Asaas. Sem token configurado, nada passa. */
export function tokenDoWebhookValido(recebido: string | null): boolean {
  const esperado = process.env.ASAAS_WEBHOOK_TOKEN?.trim();
  if (!esperado || !recebido) return false;
  const a = Buffer.from(esperado);
  const b = Buffer.from(recebido.trim());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Que situação do pedido cada evento do Asaas produz. Eventos fora daqui só atualizam o registro. */
export function statusDoEvento(evento: string): PedidoLojaStatus | null {
  if (evento === 'PAYMENT_CONFIRMED' || evento === 'PAYMENT_RECEIVED') return 'PAGO';
  if (evento === 'PAYMENT_REFUNDED' || evento === 'PAYMENT_CHARGEBACK_REQUESTED') return 'ESTORNADO';
  if (evento === 'PAYMENT_DELETED') return 'CANCELADO';
  return null;
}
