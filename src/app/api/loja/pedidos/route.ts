import { emailDoPainel, enviarAvisoAoEstudio } from '@/lib/admin/email';
import { baseDoSite } from '@/lib/contracts/service';
import { asaasConfigurado, criarCobranca } from '@/lib/loja/asaas';
import { linhasDoPedido } from '@/lib/loja/aviso';
import { cotarFrete, melhorEnvioConfigurado } from '@/lib/loja/melhor-envio';
import {
  atualizarPedidoLoja, criarPedidoLoja, lerConfiguracaoLoja, listarProdutos,
} from '@/lib/loja/repositorio';
import { formatarPreco, type FreteEscolhido } from '@/lib/loja/tipos';
import { calcularPedido, numeroDoPedido, parsePedidoLoja, precisaEnvio, validarEndereco } from '@/lib/loja/validacao';
import { checkRateLimit, clientIp, jsonError } from '@/lib/onboarding/http';

/**
 * Pedido da loja.
 *
 * Com o Asaas configurado (e o Melhor Envio, quando há algo para enviar), o pedido nasce
 * "aguardando pagamento" e a resposta traz o endereço da página de pagamento do Asaas; quem marca
 * o pedido como pago é o webhook. Sem eles, o pedido nasce "novo", sem pagamento online, e o
 * estúdio recebe um e-mail para combinar o resto com a pessoa.
 *
 * Preço e frete são sempre recalculados aqui: o navegador só diz o que a pessoa escolheu.
 */
export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`loja:${clientIp(request)}`, 6, 10 * 60_000)) {
      return jsonError(new Error('Muitos pedidos seguidos. Tente novamente em alguns minutos.'), 429);
    }
    const online = asaasConfigurado();
    const entrada = parsePedidoLoja(await request.json(), { exigirDocumento: online });
    // Robôs recebem a mesma resposta de sucesso, sem gravar nada.
    if (entrada.robo) return Response.json({ ok: true, numero: numeroDoPedido() }, { status: 201 });

    const produtos = await listarProdutos({ publicados: true });
    const { itens, subtotalCentavos } = calcularPedido(entrada.itens, produtos);
    const envio = precisaEnvio(itens);
    const endereco = envio ? validarEndereco(entrada.endereco) : null;

    let frete: FreteEscolhido | null = null;
    if (envio && melhorEnvioConfigurado()) {
      if (!entrada.freteServicoId) throw new Error('Calcule e escolha uma opção de frete.');
      const configuracao = await lerConfiguracaoLoja();
      const opcoes = await cotarFrete({
        cepOrigem: configuracao.cepOrigem, cepDestino: endereco!.cep, itens, produtos, diasParaPostar: configuracao.diasParaPostar,
      });
      frete = opcoes.find((o) => o.servicoId === entrada.freteServicoId) ?? null;
      if (!frete) throw new Error('O frete escolhido mudou. Calcule o frete de novo e escolha uma opção.');
    }

    // Pagamento online só quando o valor está completo: sem frete calculado, ele é combinado depois.
    const pagamentoOnline = online && (!envio || frete !== null);
    const pedido = await criarPedidoLoja({
      numero: numeroDoPedido(), contato: entrada.contato, endereco, itens, subtotalCentavos, frete,
      status: pagamentoOnline ? 'AGUARDANDO_PAGAMENTO' : 'NOVO',
    });
    const linkDoPainel = `${baseDoSite()}/admin/loja?pedido=${pedido.id}`;

    if (pagamentoOnline) {
      try {
        const cobranca = await criarCobranca(pedido, `${baseDoSite()}/loja/pedido/obrigado?n=${encodeURIComponent(pedido.numero)}`);
        await atualizarPedidoLoja(pedido.id, { pagamento: { provedor: 'asaas', ...cobranca } });
        return Response.json({ ok: true, numero: pedido.numero, pagamentoUrl: cobranca.url }, { status: 201 });
      } catch (erro) {
        // O pedido fica registrado: o estúdio fala com a pessoa e combina o pagamento.
        const motivo = erro instanceof Error ? erro.message : 'falha desconhecida';
        await atualizarPedidoLoja(pedido.id, { status: 'NOVO', notas: `A cobrança não abriu: ${motivo}` });
        await enviarAvisoAoEstudio(
          `Pedido da loja sem cobrança — ${pedido.nome} (${pedido.numero})`,
          emailDoPainel('A cobrança do Asaas não abriu', linhasDoPedido(pedido), `Motivo: ${motivo}`, linkDoPainel, 'Ver no painel'),
          pedido.email,
        );
        return jsonError(new Error(
          `Seu pedido ${pedido.numero} foi registrado, mas o pagamento não abriu agora. Vamos falar com você pelo e-mail ou WhatsApp.`,
        ), 502);
      }
    }

    const aviso = await enviarAvisoAoEstudio(
      `Novo pedido da loja — ${pedido.nome} (${pedido.numero})`,
      emailDoPainel('Novo pedido da loja', linhasDoPedido(pedido),
        `Sem pagamento online. Total dos itens: ${formatarPreco(pedido.subtotalCentavos)}${envio ? ', frete a combinar.' : '.'}`,
        linkDoPainel, 'Ver no painel'),
      pedido.email,
    );
    if (aviso !== 'PENDING') await atualizarPedidoLoja(pedido.id, { emailStatus: aviso });
    return Response.json({ ok: true, numero: pedido.numero }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
