import type {
  OnboardingField,
  OnboardingSchema,
  OnboardingSection,
  ProjectType,
} from './types';

const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const horarios: OnboardingField = {
  key: 'horariosAtendimento',
  label: 'Horários de atendimento',
  type: 'hours',
  options: dias,
};

const secoesComuns = (): readonly OnboardingSection[] => [
  {
    key: 'responsavel',
    title: 'Você e o negócio',
    description: 'Só o necessário para identificar o projeto e manter o contato.',
    fields: [
      { key: 'nomeResponsavel', label: 'Seu nome', type: 'text', required: true },
      { key: 'emailResponsavel', label: 'E-mail', type: 'email', required: true },
      { key: 'telefoneResponsavel', label: 'WhatsApp', type: 'tel', required: true },
      { key: 'nomeFantasia', label: 'Nome do negócio', type: 'text', required: true },
      {
        key: 'cidadeEstado',
        label: 'Cidade e estado',
        type: 'text',
        required: true,
        placeholder: 'Ex.: Uberlândia, MG',
      },
      {
        key: 'siteOuInstagram',
        label: 'Site ou Instagram atual',
        type: 'url',
        description: 'Opcional. Ajuda a entender a comunicação que já existe.',
      },
    ],
  },
  {
    key: 'marca',
    title: 'Marca e direção',
    description: 'O suficiente para acertarmos o tom sem transformar o briefing em interrogatório.',
    fields: [
      {
        key: 'objetivoPrincipal',
        label: 'O que você mais quer melhorar com o produto?',
        type: 'textarea',
        required: true,
        placeholder: 'Ex.: organizar a agenda, apresentar melhor os serviços ou vender pelo próprio site.',
      },
      {
        key: 'publicoPrincipal',
        label: 'Quem é o seu cliente principal?',
        type: 'textarea',
        required: true,
      },
      {
        key: 'descricaoCurta',
        label: 'Descreva o negócio em poucas linhas',
        type: 'textarea',
        required: true,
      },
      { key: 'logo', label: 'Logo atual', type: 'file', accept: 'logo' },
      { key: 'corPrimaria', label: 'Cor principal', type: 'color' },
      {
        key: 'referenciasVisuais',
        label: 'Referências visuais',
        type: 'files',
        accept: 'image',
        maxFiles: 4,
        description: 'Até quatro imagens ou telas que representem o estilo desejado.',
      },
      {
        key: 'personalidade',
        label: 'Como a marca deve ser percebida?',
        type: 'checklist',
        options: ['Moderna', 'Sofisticada', 'Acolhedora', 'Energética', 'Minimalista', 'Tradicional'],
      },
    ],
  },
];

const secaoDeConteudo: OnboardingSection = {
  key: 'conteudo',
  title: 'Conteúdo e materiais',
  description: 'Envie o que já estiver pronto. O que faltar pode ser alinhado depois com a equipe.',
  fields: [
    { key: 'whatsappPublico', label: 'WhatsApp que aparecerá no produto', type: 'tel', required: true },
    { key: 'emailPublico', label: 'E-mail público', type: 'email' },
    { key: 'dominioDesejado', label: 'Domínio desejado', type: 'domain' },
    {
      key: 'fotos',
      label: 'Fotos do negócio, equipe, produtos ou trabalhos',
      type: 'files',
      accept: 'image',
      maxFiles: 12,
      description: 'Escolha as melhores. Não é necessário enviar tudo agora.',
    },
    {
      key: 'arquivoConteudo',
      label: 'Arquivo com textos ou informações existentes',
      type: 'file',
      accept: 'image-or-document',
    },
    {
      key: 'autorizacaoMateriais',
      label: 'Confirmo que posso autorizar o uso dos materiais enviados',
      type: 'toggle',
      required: true,
    },
    { key: 'observacoesFinais', label: 'Algo importante que ainda não perguntamos?', type: 'textarea' },
  ],
};

const barbearia: OnboardingSchema = {
  version: 2,
  projectType: 'BARBERSHOP',
  title: 'Barbearia',
  description: 'Para donos e gestores de barbearias com uma ou mais unidades.',
  sections: [
    ...secoesComuns(),
    {
      key: 'operacao',
      title: 'Serviços e agenda',
      description: 'As decisões que realmente mudam a experiência do cliente e da equipe.',
      fields: [
        {
          key: 'estrutura',
          label: 'Como a barbearia funciona?',
          type: 'select',
          required: true,
          options: ['Uma unidade e um profissional', 'Uma unidade e uma equipe', 'Mais de uma unidade'],
        },
        { key: 'quantidadeProfissionais', label: 'Quantos profissionais atendem?', type: 'text', required: true },
        {
          key: 'servicosPrincipais',
          label: 'Quais são os principais serviços?',
          type: 'textarea',
          required: true,
          placeholder: 'Informe nome, duração e valor quando possível.',
        },
        {
          key: 'catalogoEquipe',
          label: 'Planilha ou documento com serviços e equipe',
          type: 'file',
          accept: 'document',
          description: 'Opcional. Evita digitar informações que você já tem organizadas.',
        },
        horarios,
        {
          key: 'regrasAgenda',
          label: 'Regras importantes da agenda',
          type: 'textarea',
          placeholder: 'Antecedência, intervalos, cancelamento, feriados e encaixes.',
        },
        {
          key: 'modulos',
          label: 'O que precisa entrar na primeira versão?',
          type: 'checklist',
          options: ['Site público', 'Agendamento sem conta', 'Agenda da equipe', 'Clientes', 'Barber Club', 'Mais de uma unidade'],
        },
      ],
    },
    secaoDeConteudo,
  ],
};

const personal: OnboardingSchema = {
  version: 2,
  projectType: 'PERSONAL_TRAINER',
  title: 'Personal',
  description: 'Para personal trainers autônomos e estúdios de treinamento.',
  sections: [
    ...secoesComuns(),
    {
      key: 'operacao',
      title: 'Método e acompanhamento',
      description: 'O que muda entre um personal autônomo e um estúdio com equipe.',
      fields: [
        {
          key: 'modelo',
          label: 'Qual é o seu modelo de atendimento?',
          type: 'select',
          required: true,
          options: ['Personal autônomo', 'Estúdio com equipe', 'Atendimento híbrido'],
        },
        { key: 'quantidadeProfissionais', label: 'Quantos profissionais participarão?', type: 'text' },
        { key: 'quantidadeUnidades', label: 'Quantos locais de treino?', type: 'text' },
        {
          key: 'servicosPlanos',
          label: 'Quais serviços, aulas ou planos serão oferecidos?',
          type: 'textarea',
          required: true,
        },
        {
          key: 'arquivoServicos',
          label: 'Planilha ou documento com planos e equipe',
          type: 'file',
          accept: 'document',
        },
        horarios,
        {
          key: 'acompanhamento',
          label: 'Como você acompanha a evolução dos alunos hoje?',
          type: 'textarea',
        },
        {
          key: 'modulos',
          label: 'O que precisa entrar na primeira versão?',
          type: 'checklist',
          options: ['Site público', 'Agenda', 'Área do aluno', 'Treinos', 'Evolução', 'Portal do personal', 'Gestão do estúdio'],
        },
      ],
    },
    secaoDeConteudo,
  ],
};

const studioBeauty: OnboardingSchema = {
  version: 2,
  projectType: 'BEAUTY_STUDIO',
  title: 'Studio Beauty',
  description: 'Para estúdios de estética, unhas, olhar, maquiagem e produção de beleza.',
  sections: [
    ...secoesComuns(),
    {
      key: 'operacao',
      title: 'Especialidades e atendimento',
      description: 'Categorias, profissionais e regras que definem a agenda do estúdio.',
      fields: [
        {
          key: 'especialidades',
          label: 'Quais especialidades fazem parte do estúdio?',
          type: 'checklist',
          required: true,
          options: ['Estética facial', 'Estética corporal', 'Unhas', 'Sobrancelhas', 'Cílios', 'Maquiagem', 'Noivas e eventos'],
        },
        { key: 'quantidadeProfissionais', label: 'Quantas profissionais atendem?', type: 'text', required: true },
        { key: 'quantidadeUnidades', label: 'Quantas unidades?', type: 'text' },
        {
          key: 'servicosPrincipais',
          label: 'Quais são os principais serviços e pacotes?',
          type: 'textarea',
          required: true,
          placeholder: 'Informe nome, duração e valor quando possível.',
        },
        {
          key: 'catalogoEquipe',
          label: 'Planilha ou documento com serviços e profissionais',
          type: 'file',
          accept: 'document',
        },
        horarios,
        {
          key: 'regrasAgenda',
          label: 'Regras importantes da agenda',
          type: 'textarea',
          placeholder: 'Cancelamento, atraso, sinal, intervalos e reservas de eventos.',
        },
        {
          key: 'modulos',
          label: 'O que precisa entrar na primeira versão?',
          type: 'checklist',
          options: ['Site público', 'Agendamento', 'Portfólio', 'Pacotes', 'Beauty Club', 'Noivas e eventos', 'Área da cliente', 'Gestão'],
        },
      ],
    },
    secaoDeConteudo,
  ],
};

const ecommerce: OnboardingSchema = {
  version: 2,
  projectType: 'ECOMMERCE',
  title: 'E-commerce',
  description: 'Para lojas e marcas que querem uma vitrine própria com atendimento pelo WhatsApp.',
  sections: [
    ...secoesComuns(),
    {
      key: 'operacao',
      title: 'Catálogo e venda',
      description: 'O essencial para organizar a vitrine e o fechamento assistido do pedido.',
      fields: [
        {
          key: 'tipoLoja',
          label: 'Que tipo de loja ou marca é?',
          type: 'text',
          required: true,
        },
        {
          key: 'modoCatalogo',
          label: 'Como prefere enviar o catálogo inicial?',
          type: 'select',
          required: true,
          options: ['Planilha', 'Documento ou PDF', 'Loja existente', 'Preencher depois com a equipe'],
        },
        {
          key: 'arquivoCatalogo',
          label: 'Arquivo do catálogo',
          type: 'file',
          accept: 'document',
        },
        {
          key: 'categoriasPrincipais',
          label: 'Quais são as categorias principais?',
          type: 'textarea',
          required: true,
        },
        {
          key: 'quantidadeProdutos',
          label: 'Quantos produtos entrarão no lançamento?',
          type: 'text',
        },
        {
          key: 'entrega',
          label: 'Como os pedidos serão entregues?',
          type: 'checklist',
          options: ['Retirada', 'Entrega local', 'Envio nacional'],
        },
        {
          key: 'regrasComerciais',
          label: 'Regras de entrega, troca e pagamento',
          type: 'textarea',
          description: 'O fechamento atual é assistido pelo WhatsApp; não precisamos de dados bancários.',
        },
        {
          key: 'modulos',
          label: 'O que precisa entrar na primeira versão?',
          type: 'checklist',
          options: ['Busca', 'Categorias', 'Ofertas', 'Mais vendidos', 'Carrinho', 'Checkout pelo WhatsApp', 'Estoque', 'Catálogo em PDF'],
        },
      ],
    },
    secaoDeConteudo,
  ],
};

export const onboardingSchemas: Record<ProjectType, OnboardingSchema> = {
  ECOMMERCE: ecommerce,
  BARBERSHOP: barbearia,
  PERSONAL_TRAINER: personal,
  BEAUTY_STUDIO: studioBeauty,
};

export function getOnboardingSchema(projectType: ProjectType): OnboardingSchema {
  return onboardingSchemas[projectType];
}

export function isFieldVisible(field: OnboardingField, answers: Record<string, unknown>): boolean {
  if (!field.condition) return true;
  const value = answers[field.condition.field];
  if ('equals' in field.condition) return value === field.condition.equals;
  return Array.isArray(value) && typeof field.condition.includes === 'string' && value.includes(field.condition.includes);
}
