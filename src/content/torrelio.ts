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

export type Vantagem = { titulo: string; texto: string; comando?: Comando; links?: readonly { rotulo: string; href: string }[] };

export const vantagens: readonly { publico: string; itens: readonly Vantagem[] }[] = [
  {
    publico: 'Para a incorporadora',
    itens: [
      {
        titulo: 'Vender na planta com o prédio à vista.',
        texto: 'Quem compra vê a torre, o andar e a posição da unidade antes de a obra subir, em vez de imaginar a partir de uma planilha.',
        comando: { unidade: '1803' },
      },
      {
        titulo: 'Corretor e cliente olhando a mesma unidade.',
        texto: 'Um link abre a demonstração já na unidade escolhida, e dá para mandar pelo WhatsApp.',
        comando: { unidade: '1204' },
      },
      {
        titulo: 'Espelho sempre atualizado.',
        texto:
          'A equipe muda status e preço num painel, e o site, o link do corretor e a tela do stand mostram a mesma tabela. Na demonstração, as mudanças ficam no seu navegador; no projeto, num servidor do empreendimento.',
        comando: { aba: 'painel' },
      },
      {
        titulo: 'Menos dúvida sobre posição, andar e valor.',
        texto: 'Cada unidade mostra pavimento, altura, fachada, sol, vista, área, vagas, preço por m² e o fluxo de pagamento calculado.',
      },
      {
        titulo: 'Tabela e condição num lugar só.',
        texto: 'O reajuste vale para todas as unidades escolhidas de uma vez, a condição é editável e as parcelas fecham no centavo.',
        comando: { aba: 'painel' },
      },
      {
        titulo: 'A obra acompanhada de longe.',
        texto: 'Até que pavimento a estrutura subiu e onde o vidro já chegou, sem precisar ir ao canteiro.',
        comando: { camada: 'obra' },
      },
      {
        titulo: 'No stand, no site e no celular.',
        texto: 'Abre no navegador, em tela grande no stand ou no celular do cliente, sem instalar aplicativo.',
      },
    ],
  },
  {
    publico: 'Para quem compra',
    itens: [
      {
        titulo: 'Ver a vista antes de comprar.',
        texto:
          'A câmera vai até a varanda da unidade e mostra o que se vê dali. Dá para subir e descer andares e comparar a paisagem de cada um: no Vértice, o mar aparece pelos fundos a partir do 12º.',
        comando: { unidade: '1803', vista: 'sul' },
      },
      {
        titulo: 'Saber de que lado bate o sol.',
        texto: 'Manhã ou tarde em cada fachada, no verão, no inverno e no equinócio, com a luz da maquete seguindo a hora. É uma simulação aproximada.',
        comando: { unidade: '1803', hora: 17.5 },
      },
      {
        titulo: 'Comparar andares e valores.',
        texto: 'O espelho mostra o preço de cada unidade, e na vista dá para subir e descer andar vendo paisagem e valor juntos.',
      },
      {
        titulo: 'Entender o pagamento antes da conversa.',
        texto: 'Entrada, mensais, reforços e chaves, cada parcela com o seu valor, somando o preço da tabela.',
      },
      {
        titulo: 'Ver o apartamento por dentro.',
        texto: 'Planta e maquete da tipologia, com a área de cada cômodo (item opcional do projeto).',
        comando: { foco: 'apartamento', unidade: '1803' },
      },
      {
        titulo: 'Acompanhar a obra do próprio andar.',
        texto: 'Na camada de obra, o cartão diz se o andar da unidade já tem estrutura e fachada.',
        comando: { camada: 'obra', unidade: '1803' },
      },
      {
        titulo: 'Mandar a unidade para alguém antes de decidir.',
        texto: 'O botão de compartilhar gera um link que abre direto naquela unidade.',
      },
    ],
  },
  {
    publico: 'Para hotéis',
    itens: [
      {
        titulo: 'O hóspede escolhe o quarto pela vista e pelo andar.',
        texto: 'Mar, parque ou cidade, andar alto ou baixo: como quem escolhe o assento no avião, olhando o prédio.',
        comando: { modo: 'hotel' },
      },
      {
        titulo: 'Quartos melhores com diária própria.',
        texto: 'Vista e andar viram categoria, com diária e acréscimo de fim de semana definidos no painel.',
        comando: { modo: 'hotel', aba: 'painel' },
      },
      {
        titulo: 'A ocupação na fachada.',
        texto: 'A equipe vê o hotel aceso pela ocupação de cada noite dos próximos dias e bloqueia quartos para manutenção.',
        comando: { modo: 'hotel', aba: 'painel' },
      },
      {
        titulo: 'Reserva direta pelo site.',
        texto:
          'Na demonstração, a reserva é fictícia e fica no seu navegador; no projeto, ela entra no painel de reservas do hotel. O estúdio já fez sites com painel de reservas para hospedagem, sem o 3D:',
        links: [
          { rotulo: 'Spot Hotel e Pousada', href: ROTAS.trabalhoSpotHotel },
          { rotulo: 'Pousada Dona Lia', href: ROTAS.trabalhoDonaLia },
        ],
      },
    ],
  },
];

export const letraMiudaDasVantagens =
  'O Torrelio não substitui memorial descritivo, contrato, estudo de insolação nem projeto legal. Vista e sol são simulações sobre um entorno modelado de forma simplificada; num projeto real, o entorno vem de mapas e do material que vocês tiverem.';

/** O que a incorporadora (ou o hotel) envia para o projeto começar. Pedido do titular. */
export const materiais: readonly { publico: string; itens: readonly { titulo: string; texto: string }[] }[] = [
  {
    publico: 'Incorporadora',
    itens: [
      { titulo: 'Plantas de cada tipologia', texto: 'Em PDF ou DWG, com as áreas privativas e a numeração dos finais.' },
      {
        titulo: 'Implantação, fachadas e cortes',
        texto: 'Ou o projeto de arquitetura: número de pavimentos, pé-direito, varandas e coroamento, para a torre sair com as proporções certas.',
      },
      {
        titulo: 'A situação de cada apartamento',
        texto: 'A tabela de vendas com status (disponível, reservada, vendida), preço, área e vagas de cada unidade, na planilha que vocês já usam.',
      },
      {
        titulo: 'Informações gerais do empreendimento',
        texto: 'Nome, incorporadora e construtora, número de torres e de unidades, áreas de lazer, memorial descritivo e prazo de obra.',
      },
      { titulo: 'Endereço', texto: 'O endereço exato do terreno: é a partir dele, e de mapas, que o entorno e a vista de cada andar são modelados.' },
      {
        titulo: 'Fotos e imagens de vários ângulos',
        texto: 'Fachadas, perspectivas, áreas comuns e decorado; se existirem, fotos de drone tiradas em alturas diferentes, que ajudam a acertar a vista.',
      },
      { titulo: 'Condição de pagamento', texto: 'Entrada, mensais, reforços, chaves e o índice de correção.' },
      { titulo: 'Andamento da obra', texto: 'O cronograma e o que já foi feito, se a obra for aparecer.' },
      { titulo: 'Identidade visual', texto: 'Logo, cores e fontes do empreendimento, e os contatos de venda que devem aparecer.' },
    ],
  },
  {
    publico: 'Hotel',
    itens: [
      { titulo: 'Mapa dos quartos', texto: 'Andar por andar: número, categoria, capacidade e para que lado dá a janela de cada quarto.' },
      { titulo: 'Categorias e diárias', texto: 'Com as regras de fim de semana e de temporada.' },
      { titulo: 'Fotos dos quartos e das vistas', texto: 'De cada categoria; plantas, se houver.' },
      { titulo: 'Endereço e informações gerais', texto: 'Comodidades, horários de entrada e saída e políticas do hotel.' },
      {
        titulo: 'Como as reservas são feitas hoje',
        texto: 'Sistema, planilha ou motor de reservas: é isso que decide como o Torrelio se liga às reservas de vocês.',
      },
    ],
  },
];

export const notaDosMateriais =
  'Se faltar alguma coisa da lista, a gente conversa sobre o que dá para fazer com o material que vocês têm.';

/** Onde o Torrelio fica no projeto real. Pedido do titular: página no site da empresa e aba no painel dela. */
export const ondeFica: readonly { titulo: string; texto: string }[] = [
  {
    titulo: 'Numa página do site de vocês',
    texto: 'Se a empresa preferir, a demonstração vira uma página dentro do site que vocês já têm, no domínio de vocês, em vez de um endereço separado.',
  },
  {
    titulo: 'Num endereço do empreendimento',
    texto: 'Um site próprio, para mandar a corretores e clientes e para divulgar o lançamento.',
  },
  { titulo: 'Na tela do stand', texto: 'Em tela cheia, na TV ou no totem do stand de vendas.' },
  {
    titulo: 'No painel de vocês',
    texto:
      'O painel de controle fica atrás do login da equipe. Pode ser um painel próprio ou uma aba nova dentro do painel (sistema) que a empresa já usa.',
  },
];

export const notaDeOndeFica =
  'Ligar a página ao site de vocês, ou o painel ao sistema de vocês, depende de como eles foram feitos: isso é visto antes e entra no orçamento.';

/** O que o estúdio se dispõe a entregar no projeto real (confirmado pelo titular). */
export const entregas: readonly { titulo: string; texto: string; opcional?: boolean }[] = [
  { titulo: 'A torre em 3D', texto: 'Modelada a partir do projeto de arquitetura, leve para abrir no navegador e no celular.' },
  { titulo: 'O entorno a partir de mapas', texto: 'Vizinhos, ruas e paisagem, para a vista de cada andar ficar próxima da real.' },
  { titulo: 'Cada unidade ligada à tabela', texto: 'Status, preço e condição vêm do painel, e a fachada responde na hora.' },
  { titulo: 'Painel com login da equipe', texto: 'Para status, preços, tabela, condição de pagamento e obra; ou diárias, reservas e bloqueios, no hotel.' },
  { titulo: 'Tabela importada da planilha', texto: 'A planilha que vocês já usam entra no painel, sem redigitar unidade por unidade.' },
  { titulo: 'Planta 3D de cada tipologia', texto: 'Maquete e planta com a área de cada cômodo, a partir das plantas enviadas.', opcional: true },
];

export const passos: readonly { titulo: string; texto: string }[] = [
  { titulo: 'Materiais', texto: 'Vocês mandam o que está na lista abaixo; o que faltar a gente resolve junto.' },
  { titulo: 'Maquete digital', texto: 'Torre e entorno simplificados, feitos para abrir rápido no navegador e no celular.' },
  { titulo: 'Painel e dados', texto: 'O painel da equipe guarda status, preços, condições e obra, ou importamos da planilha que vocês já usam.' },
  { titulo: 'Publicação', texto: 'Numa página do site de vocês, num endereço do empreendimento, no link dos corretores e na tela do stand.' },
  { titulo: 'Ajustes', texto: 'Com as garantias de todo projeto do estúdio.' },
];

export const ficticio = {
  lista: [
    'o prédio (Residencial Vértice) e a cidade (Porto Lume)',
    'o entorno e a vista de cada andar',
    'o sol, calculado para uma latitude fictícia, em hora solar aproximada',
    'os valores, a tabela e a condição de pagamento',
    'a obra e o seu andamento',
    'os quartos, as diárias e as reservas do hotel',
    'a planta do apartamento e o mobiliário',
  ],
  real: 'O que é real é o código: a demonstração roda inteira no seu navegador, e o que você muda nela fica guardado só nele.',
  naoFaz:
    'O Torrelio não fecha venda, não assina contrato, não cobra sinal nem diária e não aprova crédito. No projeto, cada ligação com pagamento, contrato ou CRM é escopo a combinar.',
  semLogin: 'O painel está aberto para teste, sem login, porque é demonstração. No projeto, ele fica atrás do login da equipe.',
};

/** O que o visitante leva para o formulário do projeto: o tipo e um resumo do que ele quer. */
export function linkDoProjeto(para: 'empreendimento' | 'hotel'): string {
  const ideia =
    para === 'empreendimento'
      ? 'Quero um Torrelio para o meu empreendimento: a torre em 3D ligada à tabela de vendas, com a vista de cada andar e um painel para a equipe.'
      : 'Quero um Torrelio para o meu hotel: o prédio em 3D com os quartos, para o hóspede escolher pela vista, e o painel de ocupação e reservas.';
  return `${ROTAS.crieSeuProjeto}?tipo=${encodeURIComponent('Sistema ou plataforma')}&ideia=${encodeURIComponent(ideia)}#comecar`;
}
