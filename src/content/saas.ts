import type { ProductIconId } from '@/components/projects/ProductIcon';
import { ROTAS } from '@/lib/routes';

export type SaasImage = {
  src: string;
  titulo: string;
  descricao: string;
  tipo: 'Demonstração do produto' | 'Prévia ilustrativa do painel';
};

export type SaasProduct = {
  id: string;
  nome: string;
  icone: ProductIconId;
  rota: string;
  contato: string;
  formulario?: string;
  segmento: string;
  estado: 'ATIVO · DISPONÍVEL';
  site: string;
  demo: string;
  nomeDemo: string;
  titulo: string;
  resumo: string;
  descricao: string;
  publico: string;
  recursos: readonly { titulo: string; texto: string }[];
  observacao?: string;
  imagens: readonly [SaasImage, SaasImage, SaasImage];
};

export const avisoDemonstracao =
  'As demonstrações usam dados, fotos, preços e operações fictícios para apresentar a experiência de cada produto. As prévias ilustrativas dos painéis estão identificadas nas legendas.';

function tela(id: string, numero: number, titulo: string, descricao: string, ilustrativa = false): SaasImage {
  return {
    src: `/saas/${id}/${numero}.webp`, titulo, descricao,
    tipo: ilustrativa ? 'Prévia ilustrativa do painel' : 'Demonstração do produto',
  };
}

/** Mesma fonte para home, catálogo, navegação e páginas. URLs conferidas em 02/09/2026. */
export const saas: readonly SaasProduct[] = [
  {
    id: 'doutelio', nome: 'Doutelio', icone: 'medico', rota: ROTAS.clinicaMedica,
    contato: 'clinica-medica', segmento: 'Consultórios médicos', estado: 'ATIVO · DISPONÍVEL',
    site: 'https://doutelio.com.br', demo: 'https://doutelio.com.br/demo', nomeDemo: 'Consultório Dr. João Silva',
    titulo: 'Mais organização para cuidar de cada atendimento.',
    resumo: 'Site profissional, agenda, pacientes, prontuário e portal do paciente conectados à rotina do consultório.',
    descricao: 'A plataforma que transforma a rotina do consultório em um fluxo simples e organizado. Site profissional, agenda, pacientes, prontuário, documentos, pagamentos e portal do paciente em um só lugar.',
    publico: 'Para médicos que atendem de forma independente e consultórios que precisam organizar a presença digital e o acompanhamento dos pacientes.',
    recursos: [
      { titulo: 'Presença e agenda', texto: 'Apresente o consultório, receba solicitações e organize os horários de atendimento.' },
      { titulo: 'Pacientes e prontuário', texto: 'Reúna cadastros e registros clínicos para acompanhar o histórico de cada paciente.' },
      { titulo: 'Documentos e pagamentos', texto: 'Organize documentos do atendimento e o acompanhamento financeiro da operação.' },
      { titulo: 'Portal do paciente', texto: 'Ofereça um espaço para o paciente acompanhar seus agendamentos e documentos disponibilizados.' },
    ],
    observacao: 'As decisões clínicas, a revisão dos documentos e a confirmação dos atendimentos permanecem sob responsabilidade do profissional.',
    imagens: [
      tela('doutelio', 1, 'A agenda no centro da rotina', 'Visão demonstrativa dos horários e atendimentos do consultório.'),
      tela('doutelio', 2, 'Histórico para acompanhar cada paciente', 'Prontuário demonstrativo com os registros e as informações do atendimento.'),
      tela('doutelio', 3, 'O paciente também tem seu espaço', 'Portal demonstrativo para consultar agendamentos e documentos disponibilizados.'),
    ],
  },
  {
    id: 'beautelio', nome: 'Beautelio', icone: 'salao', rota: ROTAS.salaoEstetica,
    contato: 'salao-estetica', formulario: 'salao-estetica', segmento: 'Estética e beleza', estado: 'ATIVO · DISPONÍVEL',
    site: 'https://site-beautelio.vercel.app', demo: 'https://site-beautelio.vercel.app/loja', nomeDemo: 'Lumi Beauty Studio',
    titulo: 'A experiência do seu espaço começa antes da visita.',
    resumo: 'Serviços, profissionais, clientes, agenda e portfólio com a identidade do seu espaço de beleza.',
    descricao: 'A experiência completa para salões e espaços de beleza que querem encantar desde o primeiro clique. Gerencie serviços, profissionais, clientes, agenda, portfólio e presença digital com a identidade do seu negócio.',
    publico: 'Para espaços de estética facial e corporal, nail designers, profissionais de sobrancelhas, cílios e maquiagem que atendem sozinhos ou em equipe.',
    recursos: [
      { titulo: 'Vitrine de serviços', texto: 'Apresente os cuidados oferecidos, seus diferenciais e a identidade visual do espaço.' },
      { titulo: 'Agenda e profissionais', texto: 'Organize horários, equipe e solicitações para acompanhar a rotina de atendimento.' },
      { titulo: 'Relacionamento com clientes', texto: 'Mantenha os cadastros e as informações da operação reunidos no painel.' },
      { titulo: 'Portfólio e presença digital', texto: 'Mostre seus trabalhos e mantenha a apresentação dos serviços alinhada à sua marca.' },
    ],
    imagens: [
      tela('beautelio', 1, 'Uma primeira impressão com identidade', 'Página pública da Lumi Beauty Studio, a demonstração do Beautelio.'),
      tela('beautelio', 2, 'Atendimentos organizados na agenda', 'Prévia da organização de horários e profissionais com dados fictícios.', true),
      tela('beautelio', 3, 'Seu trabalho ganha uma vitrine', 'Prévia da área de gestão do portfólio e das imagens do espaço.', true),
    ],
  },
  {
    id: 'barbelio', nome: 'Barbelio', icone: 'barbearia', rota: ROTAS.barbearia,
    contato: 'barbearia', formulario: 'barbearia', segmento: 'Barbearias', estado: 'ATIVO · DISPONÍVEL',
    site: 'https://site-barbelio.vercel.app', demo: 'https://site-barbelio.vercel.app/barbearia-aurora-demo', nomeDemo: 'Barbearia Aurora',
    titulo: 'Sua barbearia bem apresentada. Sua agenda organizada.',
    resumo: 'Apresente serviços e equipe, receba pedidos de horário sem exigir conta do cliente e organize os atendimentos.',
    descricao: 'A agenda inteligente para barbearias que querem mais organização e uma presença digital marcante. Mostre seus serviços, apresente sua equipe, receba pedidos de horário e mantenha cada atendimento sob controle.',
    publico: 'Para barbeiros independentes e barbearias com equipe que querem facilitar o primeiro contato e acompanhar o movimento do dia.',
    recursos: [
      { titulo: 'Uma vitrine própria', texto: 'Mostre seus serviços, apresente os profissionais e valorize o estilo da barbearia.' },
      { titulo: 'Pedido de horário sem conta', texto: 'O cliente escolhe o serviço e informa seus dados de contato sem precisar criar uma conta.' },
      { titulo: 'Agenda e equipe', texto: 'Visualize os horários e organize a rotina dos profissionais em um mesmo sistema.' },
      { titulo: 'Controle dos atendimentos', texto: 'Acompanhe solicitações e a operação pelo painel de gestão da barbearia.' },
    ],
    observacao: 'O pedido de horário não representa confirmação automática: a barbearia analisa e confirma o atendimento.',
    imagens: [
      tela('barbelio', 1, 'O estilo da barbearia, logo na chegada', 'Página pública da Barbearia Aurora, a demonstração do Barbelio.'),
      tela('barbelio', 2, 'Uma visão clara dos horários', 'Prévia da agenda semanal de atendimentos com dados fictícios.', true),
      tela('barbelio', 3, 'A operação reunida no painel', 'Prévia da visão geral da barbearia, com indicadores demonstrativos.', true),
    ],
  },
  {
    id: 'studelio', nome: 'Studelio', icone: 'personal', rota: ROTAS.personalStudio,
    contato: 'personal-studio', formulario: 'personal-studio', segmento: 'Personal trainers e estúdios', estado: 'ATIVO · DISPONÍVEL',
    site: 'https://site-studelio.vercel.app', demo: 'https://site-studelio.vercel.app/estudio/studio-move-demo', nomeDemo: 'Studio Move',
    titulo: 'Mais clareza para acompanhar alunos e sessões.',
    resumo: 'Modalidades, profissionais, planos, sessões e presenças organizados para a rotina do seu estúdio.',
    descricao: 'O sistema para studios e personal trainers acompanharem alunos com mais clareza. Organize modalidades, profissionais, planos, sessões, presenças e novos pedidos em uma experiência moderna e profissional.',
    publico: 'Para personal trainers e estúdios de treinamento que precisam apresentar suas modalidades e organizar alunos, profissionais e sessões.',
    recursos: [
      { titulo: 'Apresentação do estúdio', texto: 'Divulgue modalidades, apresente a equipe e receba novos pedidos de avaliação.' },
      { titulo: 'Agenda de sessões', texto: 'Organize os horários e acompanhe as atividades previstas para os profissionais.' },
      { titulo: 'Alunos e presenças', texto: 'Reúna os cadastros e acompanhe a participação nas sessões.' },
      { titulo: 'Planos e modalidades', texto: 'Estruture as opções de atendimento e os planos oferecidos pelo seu negócio.' },
    ],
    imagens: [
      tela('studelio', 1, 'Seu estúdio pronto para ser conhecido', 'Página pública do Studio Move, a demonstração do Studelio.'),
      tela('studelio', 2, 'Sessões em uma agenda organizada', 'Prévia da agenda do estúdio com horários e dados demonstrativos.', true),
      tela('studelio', 3, 'Planos que acompanham a operação', 'Prévia da organização dos planos de atendimento no painel.', true),
    ],
  },
  {
    id: 'foodelio', nome: 'Foodelio', icone: 'food', rota: ROTAS.foodelio,
    contato: 'foodelio', segmento: 'Restaurantes e delivery', estado: 'ATIVO · DISPONÍVEL',
    site: 'https://site-foodelio.vercel.app', demo: 'https://site-foodelio.vercel.app/cardapio/sabor-da-vila-demo', nomeDemo: 'Sabor da Vila',
    titulo: 'Do cardápio ao pedido, no ritmo do seu restaurante.',
    resumo: 'Cardápio visual, ofertas, complementos e pedidos para retirada ou entrega em uma experiência própria.',
    descricao: 'Seu restaurante no ritmo dos pedidos. Crie um cardápio visual, destaque ofertas, aceite retirada ou entrega, organize complementos e variações e acompanhe cada pedido até a finalização.',
    publico: 'Para restaurantes, lanchonetes e operações de delivery que querem apresentar o cardápio e organizar o fluxo de pedidos.',
    recursos: [
      { titulo: 'Cardápio visual', texto: 'Organize categorias, apresente os pratos e destaque as ofertas do negócio.' },
      { titulo: 'Escolhas do cliente', texto: 'Estruture variações e complementos para que cada pedido reflita as opções do cardápio.' },
      { titulo: 'Retirada ou entrega', texto: 'Ofereça as modalidades de atendimento conforme as regras da sua operação.' },
      { titulo: 'Pedidos acompanhados', texto: 'Acompanhe o fluxo de preparação e o andamento dos pedidos até a finalização.' },
    ],
    imagens: [
      tela('foodelio', 1, 'Um cardápio que convida a escolher', 'Cardápio público do Sabor da Vila, a demonstração do Foodelio.'),
      tela('foodelio', 2, 'Cada pedido na sua etapa', 'Prévia da fila de preparo e da organização dos pedidos.', true),
      tela('foodelio', 3, 'O cardápio sob seu controle', 'Prévia da área de gestão dos itens e categorias do cardápio.', true),
    ],
  },
  {
    id: 'lojalio', nome: 'Lojalio', icone: 'ecommerce', rota: ROTAS.ecommerce,
    contato: 'ecommerce', formulario: 'ecommerce', segmento: 'Lojas e e-commerce', estado: 'ATIVO · DISPONÍVEL',
    site: 'https://site-lojalio.vercel.app', demo: 'https://site-lojalio.vercel.app/loja', nomeDemo: 'Lojalio Market',
    titulo: 'Sua loja com vitrine própria e operação conectada.',
    resumo: 'Catálogo, estoque, ofertas, checkout e pedidos reunidos para apresentar sua marca e acompanhar as vendas.',
    descricao: 'Uma estrutura completa para lojas venderem com mais confiança. Catálogo, categorias, estoque, ofertas, checkout, pedidos e comunicação reunidos em uma vitrine própria, clara e pronta para crescer.',
    publico: 'Para lojas e marcas que precisam de um catálogo próprio e querem organizar produtos, estoque e pedidos em uma mesma estrutura.',
    recursos: [
      { titulo: 'Vitrine e catálogo', texto: 'Apresente os produtos por categoria, facilite a busca e destaque suas ofertas.' },
      { titulo: 'Estoque organizado', texto: 'Acompanhe os itens do catálogo e gerencie o estoque da operação.' },
      { titulo: 'Checkout e pedidos', texto: 'Conecte a escolha dos produtos à finalização e ao acompanhamento dos pedidos.' },
      { titulo: 'Sua marca e seus canais', texto: 'Configure a apresentação do negócio e os canais de comunicação da loja.' },
    ],
    imagens: [
      tela('lojalio', 1, 'Sua marca no centro da vitrine', 'Página pública do Lojalio Market, a demonstração do Lojalio.'),
      tela('lojalio', 2, 'A identidade da loja no painel', 'Prévia das configurações de marca e canais de comunicação.', true),
      tela('lojalio', 3, 'Visibilidade sobre o estoque', 'Prévia da gestão de estoque com produtos e quantidades fictícios.', true),
    ],
  },
];

export function obterSaas(id: string): SaasProduct {
  const produto = saas.find((item) => item.id === id);
  if (!produto) throw new Error(`SaaS não cadastrado: ${id}`);
  return produto;
}

export const saasEmBreve = {
  nome: 'Pipelio', estado: 'EM BREVE', icone: 'crm' as const, rota: ROTAS.pipelio,
  descricao: 'CRM comercial em desenvolvimento para organizar contatos, oportunidades e o acompanhamento das vendas.',
};
