import type { ProductIconId } from '@/components/projects/ProductIcon';

/**
 * Software à venda na loja.
 *
 * Os sistemas que o site apresentava como SaaS viraram produtos da loja, na categoria Software
 * (pedido do titular em 05/10/2026). Cada um é vendido inteiro e uma vez só: o código-fonte, o site
 * e a marca vão para quem compra, que pode manter o nome ou pedir para o estúdio trocar, e passa a
 * cuidar do SaaS como negócio próprio. O Espacelio e o Pipelio nunca chegaram a existir e saíram.
 *
 * Preço, disponibilidade e textos de venda moram no produto da loja, editável no painel (ele nasce
 * desta ficha, ver `src/lib/loja/exemplos.ts`). Aqui fica o que o painel não edita: a demonstração,
 * o site, os recursos e as legendas das telas. A ficha encontra o produto pelo endereço (`slug`).
 *
 * Os recursos e as legendas vêm das páginas de SaaS aprovadas em 02/09/2026; os endereços do site e
 * da demonstração foram conferidos naquela data.
 */

export type TelaDoSoftware = {
  src: string;
  titulo: string;
  descricao: string;
  tipo: 'Demonstração do produto' | 'Prévia ilustrativa do painel';
};

export type Software = {
  /** Endereço na loja (`/loja/<slug>`) e a chave que liga o produto do painel a esta ficha. */
  slug: string;
  nome: string;
  icone: ProductIconId;
  /** Para quem o sistema foi feito: vira a "linha" do produto na loja. */
  segmento: string;
  /** O site do produto, que vai junto na compra. */
  site: string;
  demo: string;
  nomeDemo: string;
  /** O mote do próprio produto, como ele se apresenta aos clientes dele. */
  titulo: string;
  /** Resumo de venda: cartão da vitrine e descrição da página. */
  resumo: string;
  /** O que o sistema faz, em um parágrafo. */
  descricao: string;
  publico: string;
  recursos: readonly { titulo: string; texto: string }[];
  observacao?: string;
  telas: readonly [TelaDoSoftware, TelaDoSoftware, TelaDoSoftware];
  /** Preço sugerido, em centavos, para o titular ajustar no painel. */
  precoSugerido: number;
};

export const avisoDemonstracao =
  'As demonstrações usam dados, fotos, preços e operações fictícios para apresentar a experiência de cada produto. As prévias ilustrativas dos painéis estão identificadas nas legendas.';

/** O que vem em toda compra de software, seja qual for o sistema. */
export const vemNaCompra = [
  { titulo: 'O código inteiro', texto: 'O código-fonte completo: o site, o painel de gestão e o sistema que roda a demonstração.' },
  { titulo: 'O site e a marca', texto: 'O site do produto, o nome e a identidade visual. Pode manter o nome ou pedir para a Blajeen Labs trocar pelo que você escolher.' },
  { titulo: 'Venda única', texto: 'Cada sistema é vendido uma vez só. Depois da compra, ele sai de venda e não é vendido igual para mais ninguém.' },
  { titulo: 'Um negócio seu', texto: 'Com o sistema e a marca nas mãos, você oferece o serviço aos seus clientes e cuida do SaaS como negócio próprio.' },
] as const;

function tela(id: string, numero: number, titulo: string, descricao: string, ilustrativa = false): TelaDoSoftware {
  return {
    src: `/loja/software/${id}/${numero}.webp`, titulo, descricao,
    tipo: ilustrativa ? 'Prévia ilustrativa do painel' : 'Demonstração do produto',
  };
}

/** Na ordem em que o titular listou os sistemas. */
export const SOFTWARE: readonly Software[] = [
  {
    slug: 'lojalio', nome: 'Lojalio', icone: 'ecommerce', segmento: 'Lojas e e-commerce',
    site: 'https://site-lojalio.vercel.app', demo: 'https://site-lojalio.vercel.app/loja', nomeDemo: 'Lojalio Market',
    titulo: 'Sua loja com vitrine própria e operação conectada.',
    resumo: 'Sistema de e-commerce com vitrine, catálogo, estoque, checkout e pedidos. Vendido inteiro: código, site e marca.',
    descricao: 'Uma estrutura completa para lojas venderem com mais confiança. Catálogo, categorias, estoque, ofertas, checkout, pedidos e comunicação reunidos em uma vitrine própria, clara e pronta para crescer.',
    publico: 'Para lojas e marcas que precisam de um catálogo próprio e querem organizar produtos, estoque e pedidos em uma mesma estrutura.',
    recursos: [
      { titulo: 'Vitrine e catálogo', texto: 'Apresente os produtos por categoria, facilite a busca e destaque suas ofertas.' },
      { titulo: 'Estoque organizado', texto: 'Acompanhe os itens do catálogo e gerencie o estoque da operação.' },
      { titulo: 'Checkout e pedidos', texto: 'Conecte a escolha dos produtos à finalização e ao acompanhamento dos pedidos.' },
      { titulo: 'Sua marca e seus canais', texto: 'Configure a apresentação do negócio e os canais de comunicação da loja.' },
    ],
    telas: [
      tela('lojalio', 1, 'Sua marca no centro da vitrine', 'Página pública do Lojalio Market, a demonstração do Lojalio.'),
      tela('lojalio', 2, 'A identidade da loja no painel', 'Prévia das configurações de marca e canais de comunicação.', true),
      tela('lojalio', 3, 'Visibilidade sobre o estoque', 'Prévia da gestão de estoque com produtos e quantidades fictícios.', true),
    ],
    precoSugerido: 290000,
  },
  {
    slug: 'foodelio', nome: 'Foodelio', icone: 'food', segmento: 'Restaurantes e delivery',
    site: 'https://site-foodelio.vercel.app', demo: 'https://site-foodelio.vercel.app/cardapio/sabor-da-vila-demo', nomeDemo: 'Sabor da Vila',
    titulo: 'Do cardápio ao pedido, no ritmo do seu restaurante.',
    resumo: 'Sistema para restaurantes e delivery, com cardápio visual, complementos, retirada ou entrega e pedidos acompanhados. Vendido inteiro: código, site e marca.',
    descricao: 'Seu restaurante no ritmo dos pedidos. Crie um cardápio visual, destaque ofertas, aceite retirada ou entrega, organize complementos e variações e acompanhe cada pedido até a finalização.',
    publico: 'Para restaurantes, lanchonetes e operações de delivery que querem apresentar o cardápio e organizar o fluxo de pedidos.',
    recursos: [
      { titulo: 'Cardápio visual', texto: 'Organize categorias, apresente os pratos e destaque as ofertas do negócio.' },
      { titulo: 'Escolhas do cliente', texto: 'Estruture variações e complementos para que cada pedido reflita as opções do cardápio.' },
      { titulo: 'Retirada ou entrega', texto: 'Ofereça as modalidades de atendimento conforme as regras da sua operação.' },
      { titulo: 'Pedidos acompanhados', texto: 'Acompanhe o fluxo de preparação e o andamento dos pedidos até a finalização.' },
    ],
    telas: [
      tela('foodelio', 1, 'Um cardápio que convida a escolher', 'Cardápio público do Sabor da Vila, a demonstração do Foodelio.'),
      tela('foodelio', 2, 'Cada pedido na sua etapa', 'Prévia da fila de preparo e da organização dos pedidos.', true),
      tela('foodelio', 3, 'O cardápio sob seu controle', 'Prévia da área de gestão dos itens e categorias do cardápio.', true),
    ],
    precoSugerido: 250000,
  },
  {
    slug: 'doutelio', nome: 'Doutelio', icone: 'medico', segmento: 'Consultórios médicos',
    site: 'https://doutelio.com.br', demo: 'https://doutelio.com.br/demo', nomeDemo: 'Consultório Dr. João Silva',
    titulo: 'Mais organização para cuidar de cada atendimento.',
    resumo: 'Sistema para consultórios, com site profissional, agenda, pacientes, prontuário e portal do paciente. Vendido inteiro: código, site e marca.',
    descricao: 'A plataforma que transforma a rotina do consultório em um fluxo simples e organizado. Site profissional, agenda, pacientes, prontuário, documentos, pagamentos e portal do paciente em um só lugar.',
    publico: 'Para médicos que atendem de forma independente e consultórios que precisam organizar a presença digital e o acompanhamento dos pacientes.',
    recursos: [
      { titulo: 'Presença e agenda', texto: 'Apresente o consultório, receba solicitações e organize os horários de atendimento.' },
      { titulo: 'Pacientes e prontuário', texto: 'Reúna cadastros e registros clínicos para acompanhar o histórico de cada paciente.' },
      { titulo: 'Documentos e pagamentos', texto: 'Organize documentos do atendimento e o acompanhamento financeiro da operação.' },
      { titulo: 'Portal do paciente', texto: 'Ofereça um espaço para o paciente acompanhar seus agendamentos e documentos disponibilizados.' },
    ],
    observacao: 'As decisões clínicas, a revisão dos documentos e a confirmação dos atendimentos permanecem sob responsabilidade do profissional. Prontuários e dados de pacientes são dados sensíveis pela LGPD: quem assume o sistema passa a responder pelo tratamento deles.',
    telas: [
      tela('doutelio', 1, 'A agenda no centro da rotina', 'Visão demonstrativa dos horários e atendimentos do consultório.'),
      tela('doutelio', 2, 'Histórico para acompanhar cada paciente', 'Prontuário demonstrativo com os registros e as informações do atendimento.'),
      tela('doutelio', 3, 'O paciente também tem seu espaço', 'Portal demonstrativo para consultar agendamentos e documentos disponibilizados.'),
    ],
    precoSugerido: 350000,
  },
  {
    slug: 'beautelio', nome: 'Beautelio', icone: 'salao', segmento: 'Estética e beleza',
    site: 'https://site-beautelio.vercel.app', demo: 'https://site-beautelio.vercel.app/loja', nomeDemo: 'Lumi Beauty Studio',
    titulo: 'A experiência do seu espaço começa antes da visita.',
    resumo: 'Sistema para espaços de beleza, com serviços, profissionais, clientes, agenda e portfólio. Vendido inteiro: código, site e marca.',
    descricao: 'A experiência completa para salões e espaços de beleza que querem encantar desde o primeiro clique. Gerencie serviços, profissionais, clientes, agenda, portfólio e presença digital com a identidade do seu negócio.',
    publico: 'Para espaços de estética facial e corporal, nail designers, profissionais de sobrancelhas, cílios e maquiagem que atendem sozinhos ou em equipe.',
    recursos: [
      { titulo: 'Vitrine de serviços', texto: 'Apresente os cuidados oferecidos, seus diferenciais e a identidade visual do espaço.' },
      { titulo: 'Agenda e profissionais', texto: 'Organize horários, equipe e solicitações para acompanhar a rotina de atendimento.' },
      { titulo: 'Relacionamento com clientes', texto: 'Mantenha os cadastros e as informações da operação reunidos no painel.' },
      { titulo: 'Portfólio e presença digital', texto: 'Mostre seus trabalhos e mantenha a apresentação dos serviços alinhada à sua marca.' },
    ],
    telas: [
      tela('beautelio', 1, 'Uma primeira impressão com identidade', 'Página pública da Lumi Beauty Studio, a demonstração do Beautelio.'),
      tela('beautelio', 2, 'Atendimentos organizados na agenda', 'Prévia da organização de horários e profissionais com dados fictícios.', true),
      tela('beautelio', 3, 'Seu trabalho ganha uma vitrine', 'Prévia da área de gestão do portfólio e das imagens do espaço.', true),
    ],
    precoSugerido: 260000,
  },
  {
    slug: 'studelio', nome: 'Studelio', icone: 'personal', segmento: 'Personal trainers e estúdios',
    site: 'https://site-studelio.vercel.app', demo: 'https://site-studelio.vercel.app/estudio/studio-move-demo', nomeDemo: 'Studio Move',
    titulo: 'Mais clareza para acompanhar alunos e sessões.',
    resumo: 'Sistema para personal trainers e estúdios, com modalidades, planos, sessões e presenças. Vendido inteiro: código, site e marca.',
    descricao: 'O sistema para studios e personal trainers acompanharem alunos com mais clareza. Organize modalidades, profissionais, planos, sessões, presenças e novos pedidos em uma experiência moderna e profissional.',
    publico: 'Para personal trainers e estúdios de treinamento que precisam apresentar suas modalidades e organizar alunos, profissionais e sessões.',
    recursos: [
      { titulo: 'Apresentação do estúdio', texto: 'Divulgue modalidades, apresente a equipe e receba novos pedidos de avaliação.' },
      { titulo: 'Agenda de sessões', texto: 'Organize os horários e acompanhe as atividades previstas para os profissionais.' },
      { titulo: 'Alunos e presenças', texto: 'Reúna os cadastros e acompanhe a participação nas sessões.' },
      { titulo: 'Planos e modalidades', texto: 'Estruture as opções de atendimento e os planos oferecidos pelo seu negócio.' },
    ],
    telas: [
      tela('studelio', 1, 'Seu estúdio pronto para ser conhecido', 'Página pública do Studio Move, a demonstração do Studelio.'),
      tela('studelio', 2, 'Sessões em uma agenda organizada', 'Prévia da agenda do estúdio com horários e dados demonstrativos.', true),
      tela('studelio', 3, 'Planos que acompanham a operação', 'Prévia da organização dos planos de atendimento no painel.', true),
    ],
    precoSugerido: 220000,
  },
  {
    slug: 'barbelio', nome: 'Barbelio', icone: 'barbearia', segmento: 'Barbearias',
    site: 'https://site-barbelio.vercel.app', demo: 'https://site-barbelio.vercel.app/barbearia-aurora-demo', nomeDemo: 'Barbearia Aurora',
    titulo: 'Sua barbearia bem apresentada. Sua agenda organizada.',
    resumo: 'Sistema para barbearias, com vitrine de serviços e equipe, pedido de horário sem conta e painel da agenda. Vendido inteiro: código, site e marca.',
    descricao: 'A agenda inteligente para barbearias que querem mais organização e uma presença digital marcante. Mostre seus serviços, apresente sua equipe, receba pedidos de horário e mantenha cada atendimento sob controle.',
    publico: 'Para barbeiros independentes e barbearias com equipe que querem facilitar o primeiro contato e acompanhar o movimento do dia.',
    recursos: [
      { titulo: 'Uma vitrine própria', texto: 'Mostre seus serviços, apresente os profissionais e valorize o estilo da barbearia.' },
      { titulo: 'Pedido de horário sem conta', texto: 'O cliente escolhe o serviço e informa seus dados de contato sem precisar criar uma conta.' },
      { titulo: 'Agenda e equipe', texto: 'Visualize os horários e organize a rotina dos profissionais em um mesmo sistema.' },
      { titulo: 'Controle dos atendimentos', texto: 'Acompanhe solicitações e a operação pelo painel de gestão da barbearia.' },
    ],
    observacao: 'O pedido de horário não representa confirmação automática: a barbearia analisa e confirma o atendimento.',
    telas: [
      tela('barbelio', 1, 'O estilo da barbearia, logo na chegada', 'Página pública da Barbearia Aurora, a demonstração do Barbelio.'),
      tela('barbelio', 2, 'Uma visão clara dos horários', 'Prévia da agenda semanal de atendimentos com dados fictícios.', true),
      tela('barbelio', 3, 'A operação reunida no painel', 'Prévia da visão geral da barbearia, com indicadores demonstrativos.', true),
    ],
    precoSugerido: 180000,
  },
];

/** A ficha do produto da loja, pelo endereço. Produto de software criado no painel não tem ficha. */
export function fichaDoSoftware(slug: string): Software | null {
  return SOFTWARE.find((software) => software.slug === slug) ?? null;
}

/** Legenda de uma foto do produto: a da tela, quando a foto é uma das telas da ficha. */
export function legendaDaTela(ficha: Software | null, url: string): TelaDoSoftware | null {
  return ficha?.telas.find((t) => t.src === url) ?? null;
}
