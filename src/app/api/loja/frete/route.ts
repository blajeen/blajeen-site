import { cotarFrete, melhorEnvioConfigurado } from '@/lib/loja/melhor-envio';
import { lerConfiguracaoLoja, listarProdutos } from '@/lib/loja/repositorio';
import { calcularPedido, enviaSobEncomenda, parseCep, parseItens } from '@/lib/loja/validacao';
import { checkRateLimit, clientIp, jsonError } from '@/lib/onboarding/http';

/** Opções de frete para a sacola e o CEP informados. Sem Melhor Envio, o frete fica a combinar. */
export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`frete:${clientIp(request)}`, 30, 10 * 60_000)) {
      return jsonError(new Error('Muitas consultas seguidas. Tente novamente em alguns minutos.'), 429);
    }
    if (!melhorEnvioConfigurado()) return Response.json({ opcoes: [], aCombinar: true });
    const corpo = await request.json() as Record<string, unknown>;
    const cep = parseCep(corpo.cep);
    const produtos = await listarProdutos({ publicados: true });
    const { itens } = calcularPedido(parseItens(corpo.itens), produtos);
    const configuracao = await lerConfiguracaoLoja();
    const sobEncomenda = enviaSobEncomenda(itens, produtos);
    const opcoes = await cotarFrete({
      cepOrigem: configuracao.cepOrigem, cepDestino: cep, itens, produtos, diasParaPostar: sobEncomenda ? 0 : configuracao.diasParaPostar,
    });
    if (!opcoes.length) throw new Error('Nenhuma transportadora atende esse CEP com esses itens. Fale com a gente pelo contato.');
    return Response.json({ opcoes, aCombinar: false, sobEncomenda });
  } catch (error) {
    return jsonError(error);
  }
}
