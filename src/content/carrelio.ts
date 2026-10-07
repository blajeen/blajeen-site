import type { Comando } from '@/lib/carrelio/link';
import { ROTAS } from '@/lib/routes';

/**
 * Carrelio: os textos da página (pedido do titular em 07/10/2026). Uma demonstração do que o
 * estúdio constrói sob medida para concessionárias, preparada para a Comeri Omoda, que pediu
 * carros chineses para atrair clientes. O titular autorizou o nome da loja na demonstração.
 *
 * Regras destes textos:
 * - nada de número de resultado ("vende X% mais"), prazo ou preço do serviço;
 * - a Comeri aparece como a loja para quem a demonstração foi preparada, nunca como cliente que
 *   comprou ou aprovou: a página não diz que ela usa o Carrelio;
 * - o carro é real (Jaecoo 5): ficha, versões, cores e preços de lançamento vêm das fontes do
 *   catálogo; estoque, preço da loja, campanha e pedidos são de demonstração e a página diz isso;
 * - nada de logotipo de marca: o nome do carro e da marca aparece em texto.
 */

export type Vantagem = { titulo: string; comando?: Comando };

/** Atalhos acima da demonstração: um toque e o carro mostra a coisa (pedido do titular). */
export const atalhos: readonly { rotulo: string; comando: Comando }[] = [
  { rotulo: 'Ver à noite', comando: { ambiente: 'noite', farois: true } },
  { rotulo: 'Preto Andromeda', comando: { cor: 'preto-andromeda' } },
  { rotulo: 'Branco com teto preto', comando: { versao: 'prestige', cor: 'branco-arctic' } },
  { rotulo: 'Mexer no estoque', comando: { aba: 'painel' } },
  { rotulo: 'Na sua garagem', comando: { garagem: true } },
];

export const vantagens: readonly { publico: string; itens: readonly Vantagem[] }[] = [
  {
    publico: 'Para a loja',
    itens: [
      { titulo: 'O showroom no celular de quem viu o anúncio.' },
      { titulo: 'Estoque por cor e versão, mudado no painel e visto na hora.', comando: { aba: 'painel' } },
      { titulo: 'Pedido de test drive com o carro, a cor e o dia.', comando: { aba: 'cliente' } },
      { titulo: 'Na TV da loja, em tela cheia, girando sozinho.' },
      { titulo: 'Um link por carro, para o vendedor mandar no WhatsApp.' },
    ],
  },
  {
    publico: 'Para quem compra',
    itens: [
      { titulo: 'Ver a cor certa antes de ir à loja.', comando: { cor: 'cinza-centaurus' } },
      { titulo: 'Girar o carro com o dedo, de todos os lados.' },
      { titulo: 'Comparar as versões pelo que muda de verdade.', comando: { versao: 'comfort' } },
      { titulo: 'Ver o carro em tamanho real na garagem.', comando: { garagem: true } },
      { titulo: 'Saber se tem pronta entrega naquela cor.', comando: { versao: 'prestige', cor: 'preto-andromeda' } },
    ],
  },
];

/** O que a concessionária envia para o projeto começar. */
export const materiais: readonly { titulo: string; texto: string }[] = [
  { titulo: 'Os carros de cada marca', texto: 'Modelos, versões e cores à venda. O 3D vem do material da marca ou é comprado à parte.' },
  { titulo: 'Fotos 360° de cada interior', texto: 'Feitas na loja com uma câmera 360, ou do material da marca.' },
  { titulo: 'Tabela de preços e condições', texto: 'A do dia, com as campanhas em vigor.' },
  { titulo: 'O estoque', texto: 'Planilha ou o sistema que a loja usa, com cor, versão e chegada.' },
  { titulo: 'Contatos dos vendedores', texto: 'WhatsApp para o test drive e para o link de cada carro.' },
  { titulo: 'Identidade da loja', texto: 'Logo, cores e endereço.' },
];

export const notaDosMateriais = 'O que faltar, a gente resolve junto.';

export const ondeFica: readonly { titulo: string; texto: string }[] = [
  { titulo: 'Numa página do site da loja', texto: 'No domínio da loja, se preferirem.' },
  { titulo: 'Num link por carro', texto: 'Para anúncio, Instagram e WhatsApp.' },
  { titulo: 'Na TV ou no totem da loja', texto: 'Em tela cheia, girando sozinho.' },
  { titulo: 'No painel da equipe', texto: 'Atrás do login, ou como uma aba do sistema que a loja já usa.' },
];

export const notaDeOndeFica = 'Ligar ao site ou ao sistema da loja depende de como eles foram feitos: isso entra no orçamento.';

export const entregas: readonly { titulo: string; opcional?: boolean }[] = [
  { titulo: 'Cada carro em 3D, leve para o celular' },
  { titulo: 'Cores e versões de cada carro' },
  { titulo: 'Interior em foto 360°, feita na loja' },
  { titulo: 'Painel com estoque, preços e campanhas' },
  { titulo: 'Pedido de test drive para o WhatsApp da loja' },
  { titulo: '"Na sua garagem", em realidade aumentada', opcional: true },
];

export const passos: readonly { titulo: string; texto: string }[] = [
  { titulo: 'Materiais', texto: 'A loja manda a lista abaixo.' },
  { titulo: 'Carros em 3D', texto: 'Leves para o celular, com as cores de fábrica.' },
  { titulo: 'Painel e dados', texto: 'Estoque, preços e campanhas, ou a planilha da loja.' },
  { titulo: 'Publicação', texto: 'No site, no link de cada carro e na TV da loja.' },
  { titulo: 'Ajustes', texto: 'Com as garantias de todo projeto do estúdio.' },
];

export const demonstracao = {
  real: [
    'o Jaecoo 5: ficha, versões, itens de série, cores e preços de lançamento, como a marca divulgou em 30/09/2026',
    'o código: a demonstração roda no seu navegador, e o que você muda fica só nele',
  ],
  deDemonstracao: [
    'o estoque, o preço da loja e a campanha',
    'os pedidos de test drive',
    'os tons das cores no 3D, que são aproximados',
  ],
  naoFaz: 'Não vende, não reserva carro, não simula financiamento e não fala em nome da loja. No projeto, essas ligações são combinadas à parte.',
  semLogin: 'O painel está sem login porque é demonstração; no projeto, fica atrás do login da equipe.',
};

/** O que o visitante leva para o formulário do projeto. */
export function linkDoProjeto(): string {
  const ideia = 'Quero um Carrelio para a minha concessionária: os carros em 3D, por dentro e por fora, ligados ao estoque, com o painel da equipe.';
  return `${ROTAS.crieSeuProjeto}?tipo=${encodeURIComponent('Sistema ou plataforma')}&ideia=${encodeURIComponent(ideia)}#comecar`;
}
