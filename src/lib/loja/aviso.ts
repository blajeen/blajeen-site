import { formatarPreco, type PedidoLoja } from './tipos';

/** Linhas do e-mail de aviso ao estúdio: quem pediu, o que pediu e para onde vai. */
export function linhasDoPedido(pedido: PedidoLoja): Array<[string, string]> {
  const e = pedido.endereco;
  return [
    ['Pedido', pedido.numero],
    ['Nome', pedido.nome],
    ['E-mail', pedido.email],
    ['Telefone', pedido.telefone],
    ...pedido.itens.map((i, n): [string, string] => [
      `Item ${n + 1}`,
      `${i.quantidade} × ${i.nome}${i.opcaoRotulo ? ` (${i.opcaoRotulo})` : ''} — ${formatarPreco(i.precoCentavos * i.quantidade)}`,
    ]),
    ...(pedido.frete ? [['Frete', `${pedido.frete.servico} ${pedido.frete.transportadora} — ${formatarPreco(pedido.frete.precoCentavos)}, ${pedido.frete.prazoDias} dias úteis`] as [string, string]] : []),
    ['Total', formatarPreco(pedido.totalCentavos)],
    ...(e ? [['Entrega', `${e.logradouro}, ${e.numero}${e.complemento ? ` ${e.complemento}` : ''} — ${e.bairro}, ${e.cidade}/${e.uf}, CEP ${e.cep}`] as [string, string]] : []),
    ...(pedido.mensagem ? [['Mensagem', pedido.mensagem] as [string, string]] : []),
  ];
}
