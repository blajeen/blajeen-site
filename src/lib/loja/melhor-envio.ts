import { destinoDosAvisos } from '@/lib/admin/email';
import type { FreteEscolhido, ItemPedido, Produto } from './tipos';

/**
 * Cotação de frete pelo Melhor Envio.
 *
 * Cada item físico vai como um pacote com o peso e as medidas cadastrados no painel, e o valor
 * declarado é o preço do item (o seguro). A etiqueta continua sendo comprada no painel do Melhor
 * Envio, como hoje; o site só cota e guarda a opção escolhida no pedido.
 *
 * Variáveis na Vercel (nunca no código):
 * - `MELHOR_ENVIO_TOKEN`: token gerado no painel do Melhor Envio (Integrações > Permissões de acesso);
 * - `MELHOR_ENVIO_AMBIENTE`: `sandbox` para testar; qualquer outro valor (ou nada) é produção.
 */

export type OpcaoDeFrete = FreteEscolhido;

export function melhorEnvioConfigurado(): boolean {
  return Boolean(process.env.MELHOR_ENVIO_TOKEN?.trim());
}

function base(): string {
  return process.env.MELHOR_ENVIO_AMBIENTE?.trim() === 'sandbox' ? 'https://sandbox.melhorenvio.com.br' : 'https://melhorenvio.com.br';
}

type ServicoCotado = {
  id?: number;
  name?: string;
  company?: { name?: string };
  price?: string | number;
  custom_price?: string | number;
  delivery_time?: number;
  custom_delivery_time?: number;
  error?: string;
};

export async function cotarFrete(entrada: {
  cepOrigem: string;
  cepDestino: string;
  itens: ItemPedido[];
  produtos: Produto[];
  diasParaPostar: number;
}): Promise<OpcaoDeFrete[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN?.trim();
  if (!token) throw new Error('Cálculo de frete não configurado.');
  if (entrada.cepOrigem.length !== 8) throw new Error('A loja ainda não tem CEP de origem. Fale com a gente pelo contato.');
  const pacotes = entrada.itens.filter((i) => !i.digital).map((item) => {
    const envio = entrada.produtos.find((p) => p.id === item.produtoId)?.envio;
    if (!envio) throw new Error(`Falta o pacote de ${item.nome} para calcular o frete.`);
    return {
      id: `${item.produtoId}:${item.opcaoId}`,
      width: envio.larguraCm,
      height: envio.alturaCm,
      length: envio.comprimentoCm,
      weight: envio.pesoKg,
      insurance_value: Math.round(item.precoCentavos) / 100,
      quantity: item.quantidade,
    };
  });
  if (!pacotes.length) return [];

  const resposta = await fetch(`${base()}/api/v2/me/shipment/calculate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // O Melhor Envio exige o nome da aplicação com um e-mail de contato técnico.
      'User-Agent': `Blajeen Labs (${destinoDosAvisos()})`,
    },
    body: JSON.stringify({ from: { postal_code: entrada.cepOrigem }, to: { postal_code: entrada.cepDestino }, products: pacotes }),
    cache: 'no-store',
  });
  if (resposta.status === 422) throw new Error('Não conseguimos calcular o frete para esse CEP. Confira o número.');
  if (!resposta.ok) throw new Error('O cálculo de frete não respondeu agora. Tente de novo em instantes.');
  const servicos = await resposta.json() as ServicoCotado[];
  return (Array.isArray(servicos) ? servicos : [])
    .filter((s) => !s.error && s.id && (s.custom_price ?? s.price) !== undefined)
    .map((s) => ({
      servicoId: Number(s.id),
      servico: String(s.name ?? 'Envio'),
      transportadora: String(s.company?.name ?? ''),
      precoCentavos: Math.round(Number(s.custom_price ?? s.price) * 100),
      prazoDias: Number(s.custom_delivery_time ?? s.delivery_time ?? 0) + entrada.diasParaPostar,
    }))
    .filter((s) => Number.isFinite(s.precoCentavos) && s.precoCentavos > 0)
    .sort((a, b) => a.precoCentavos - b.precoCentavos);
}
