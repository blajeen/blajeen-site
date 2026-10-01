import { asaasConfigurado } from '@/lib/loja/asaas';
import { melhorEnvioConfigurado } from '@/lib/loja/melhor-envio';
import { lerConfiguracaoLoja, salvarConfiguracaoLoja } from '@/lib/loja/repositorio';
import { parseConfiguracao } from '@/lib/loja/validacao';
import { adminGuard, jsonError } from '@/lib/onboarding/http';

/**
 * Configuração da loja no painel. As chaves das integrações nunca passam por aqui: o painel só
 * mostra se elas estão configuradas na Vercel.
 */
function integracoes() {
  return {
    asaas: asaasConfigurado(),
    asaasAmbiente: process.env.ASAAS_AMBIENTE?.trim() === 'sandbox' ? 'sandbox' : 'produção',
    asaasWebhook: Boolean(process.env.ASAAS_WEBHOOK_TOKEN?.trim()),
    melhorEnvio: melhorEnvioConfigurado(),
    melhorEnvioAmbiente: process.env.MELHOR_ENVIO_AMBIENTE?.trim() === 'sandbox' ? 'sandbox' : 'produção',
  };
}

export async function GET() {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    return Response.json({ configuracao: await lerConfiguracaoLoja(), integracoes: integracoes() });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function PUT(request: Request) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const configuracao = await salvarConfiguracaoLoja(parseConfiguracao(await request.json()));
    return Response.json({ configuracao, integracoes: integracoes() });
  } catch (error) {
    return jsonError(error);
  }
}
