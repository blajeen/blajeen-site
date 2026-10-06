import type { Comando } from '@/lib/torrelio/link';
import { ROTAS } from '@/lib/routes';

/**
 * Torrelio: os textos da página (pedido do titular em 06/10/2026).
 *
 * É uma demonstração do que o estúdio constrói sob medida para incorporadoras e hotéis, sobre um
 * prédio fictício. Regras destes textos, conferidas em `torrelio.test.ts`:
 * - nada de número de resultado ("vende X% mais"), valorização, prazo ou preço do serviço;
 * - nada de cliente, usuário ou parceria que não exista: os únicos projetos citados são os de
 *   hospedagem do portfólio, e o texto diz que eles não usam o 3D;
 * - vista e sol são simulações sobre um entorno simplificado, e a página diz isso.
 */

export type Vantagem = { titulo: string; texto?: string; comando?: Comando; links?: readonly { rotulo: string; href: string }[] };

/**
 * Atalhos acima da demonstração: um toque e a maquete mostra a coisa, em vez de um parágrafo
 * explicando (pedido do titular: "menos texto enrolativo e mais demonstrativo").
 */
export const atalhos: readonly { rotulo: string; comando: Comando }[] = [
  // A vista no fim de tarde: à noite, a paisagem some no escuro.
  { rotulo: 'Ver a vista do 18º', comando: { unidade: '1803', vista: 'sul', hora: 17.5 } },
  { rotulo: 'Ver à noite', comando: { hora: 20.5 } },
  { rotulo: 'Marcar uma venda', comando: { aba: 'painel' } },
  { rotulo: 'Ver a obra', comando: { camada: 'obra' } },
  { rotulo: 'Virar hotel', comando: { modo: 'hotel' } },
];

/** Frases curtas: cada uma com o atalho que mostra na maquete. */
export const vantagens: readonly { publico: string; itens: readonly Vantagem[] }[] = [
  {
    publico: 'Para a incorporadora',
    itens: [
      { titulo: 'Vender na planta com o prédio à vista.', comando: { unidade: '1803' } },
      { titulo: 'Mudou no painel, mudou na fachada.', comando: { aba: 'painel' } },
      { titulo: 'Tabela, condição e parcelas num lugar só.', comando: { aba: 'painel' } },
      { titulo: 'A obra acompanhada de longe.', comando: { camada: 'obra' } },
      { titulo: 'No stand, no site e no celular, sem instalar nada.' },
    ],
  },
  {
    publico: 'Para quem compra',
    itens: [
      // No fim de tarde: à noite, a paisagem some no escuro.
      { titulo: 'Ver a vista antes de comprar.', comando: { unidade: '1803', vista: 'sul', hora: 17.5 } },
      { titulo: 'Saber de que lado bate o sol.', comando: { unidade: '1803', hora: 17.5 } },
      { titulo: 'Comparar andares, preços e parcelas.', comando: { unidade: '1204' } },
      { titulo: 'Ver o apartamento por dentro.', comando: { foco: 'apartamento', unidade: '1803' } },
      { titulo: 'Mandar a unidade por link: ele abre direto nela.', comando: { unidade: '1204' } },
    ],
  },
  {
    publico: 'Para hotéis',
    itens: [
      { titulo: 'O hóspede escolhe o quarto pela vista e pelo andar.', comando: { modo: 'hotel' } },
      { titulo: 'Vista e andar com diária própria.', comando: { modo: 'hotel', aba: 'painel' } },
      { titulo: 'A ocupação de cada noite acesa na fachada.', comando: { modo: 'hotel', aba: 'painel', hora: 20.5 } },
      {
        titulo: 'Reserva direta pelo site.',
        texto: 'Já fizemos sites com reservas para hospedagem, sem o 3D:',
        links: [
          { rotulo: 'Spot Hotel e Pousada', href: ROTAS.trabalhoSpotHotel },
          { rotulo: 'Pousada Dona Lia', href: ROTAS.trabalhoDonaLia },
        ],
      },
    ],
  },
];

export const letraMiudaDasVantagens =
  'Não substitui memorial descritivo, contrato, estudo de insolação nem projeto legal. Vista e sol são simulações sobre um entorno simplificado; no projeto, o entorno vem de mapas.';

/** O que a incorporadora (ou o hotel) envia para o projeto começar. Pedido do titular. */
export const materiais: readonly { publico: string; itens: readonly { titulo: string; texto: string }[] }[] = [
  {
    publico: 'Incorporadora',
    itens: [
      { titulo: 'Plantas de cada tipologia', texto: 'PDF ou DWG, com áreas e finais.' },
      { titulo: 'Implantação, fachadas e cortes', texto: 'Ou o projeto de arquitetura.' },
      { titulo: 'A situação de cada apartamento', texto: 'A tabela de vendas: status, preço, área e vagas.' },
      { titulo: 'Informações gerais do empreendimento', texto: 'Nome, construtora, torres, lazer, memorial e cronograma.' },
      { titulo: 'Endereço', texto: 'Dele e de mapas sai a vista de cada andar.' },
      { titulo: 'Fotos e imagens de vários ângulos', texto: 'Fachadas, áreas comuns, decorado e, se houver, drone.' },
      { titulo: 'Condição de pagamento', texto: 'Entrada, mensais, reforços, chaves e índice.' },
      { titulo: 'Andamento da obra', texto: 'Se a obra for aparecer.' },
      { titulo: 'Identidade visual', texto: 'Logo, cores, fontes e contatos de venda.' },
    ],
  },
  {
    publico: 'Hotel',
    itens: [
      { titulo: 'Mapa dos quartos', texto: 'Número, categoria, capacidade e janela de cada um.' },
      { titulo: 'Categorias e diárias', texto: 'Com fim de semana e temporada.' },
      { titulo: 'Fotos dos quartos e das vistas', texto: 'De cada categoria.' },
      { titulo: 'Endereço e informações gerais', texto: 'Comodidades, horários e políticas.' },
      { titulo: 'Como as reservas são feitas hoje', texto: 'Sistema, planilha ou motor de reservas.' },
    ],
  },
];

export const notaDosMateriais = 'O que faltar, a gente resolve junto.';

/** Onde o Torrelio fica no projeto real. Pedido do titular: página no site da empresa e aba no painel dela. */
export const ondeFica: readonly { titulo: string; texto: string }[] = [
  { titulo: 'Numa página do site de vocês', texto: 'No domínio de vocês, se preferirem.' },
  { titulo: 'Num endereço do empreendimento', texto: 'Para corretores e clientes.' },
  { titulo: 'Na tela do stand', texto: 'Em tela cheia, na TV ou no totem.' },
  { titulo: 'No painel de vocês', texto: 'Atrás do login da equipe, ou como uma aba nova dentro do painel que a empresa já usa.' },
];

export const notaDeOndeFica = 'Ligar ao site ou ao sistema de vocês depende de como eles foram feitos: isso entra no orçamento.';

/** O que o estúdio se dispõe a entregar no projeto real (confirmado pelo titular). */
export const entregas: readonly { titulo: string; opcional?: boolean }[] = [
  { titulo: 'A torre em 3D, leve para o celular' },
  { titulo: 'O entorno a partir de mapas' },
  { titulo: 'Cada unidade ligada à tabela' },
  { titulo: 'Painel com login da equipe' },
  { titulo: 'Tabela importada da planilha' },
  { titulo: 'Planta 3D de cada tipologia', opcional: true },
];

export const passos: readonly { titulo: string; texto: string }[] = [
  { titulo: 'Materiais', texto: 'Vocês mandam a lista abaixo.' },
  { titulo: 'Maquete digital', texto: 'Torre e entorno, leves para o celular.' },
  { titulo: 'Painel e dados', texto: 'Status, preços e obra, ou a planilha de vocês.' },
  { titulo: 'Publicação', texto: 'No site, no link dos corretores ou no stand.' },
  { titulo: 'Ajustes', texto: 'Com as garantias de todo projeto do estúdio.' },
];

export const ficticio = {
  lista: [
    'o prédio (Residencial Vértice) e a cidade (Porto Lume)',
    'o entorno, a vista e o sol',
    'os valores e a condição de pagamento',
    'a obra',
    'os quartos e as reservas do hotel',
    'a planta e o mobiliário',
  ],
  real: 'Real é o código: a demonstração roda no seu navegador, e o que você muda fica só nele.',
  naoFaz: 'Não fecha venda, não assina contrato, não cobra e não aprova crédito. No projeto, essas ligações são combinadas à parte.',
  semLogin: 'O painel está sem login porque é demonstração; no projeto, fica atrás do login da equipe.',
};

/** O que o visitante leva para o formulário do projeto: o tipo e um resumo do que ele quer. */
export function linkDoProjeto(para: 'empreendimento' | 'hotel'): string {
  const ideia =
    para === 'empreendimento'
      ? 'Quero um Torrelio para o meu empreendimento: a torre em 3D ligada à tabela de vendas, com a vista de cada andar e um painel para a equipe.'
      : 'Quero um Torrelio para o meu hotel: o prédio em 3D com os quartos, para o hóspede escolher pela vista, e o painel de ocupação e reservas.';
  return `${ROTAS.crieSeuProjeto}?tipo=${encodeURIComponent('Sistema ou plataforma')}&ideia=${encodeURIComponent(ideia)}#comecar`;
}
