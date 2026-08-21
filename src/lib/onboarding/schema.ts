import type { OnboardingField, OnboardingSchema, ProjectType } from './types';

const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const redes: OnboardingField = {
  key: 'redesSociais',
  label: 'Redes sociais',
  type: 'repeater',
  fields: [
    { key: 'rede', label: 'Rede', type: 'text', required: true },
    { key: 'url', label: 'Endereço do perfil', type: 'url', required: true },
  ],
};

const horarios: OnboardingField = {
  key: 'horariosAtendimento',
  label: 'Horários de atendimento',
  type: 'hours',
  options: dias,
};

const commonSections = () => [
  {
    key: 'responsavel',
    title: 'Responsável e negócio',
    description: 'Dados para identificar o projeto e manter contato durante a implantação.',
    fields: [
      { key: 'nomeResponsavel', label: 'Nome do responsável', type: 'text', required: true },
      { key: 'emailResponsavel', label: 'E-mail', type: 'email', required: true },
      { key: 'telefoneResponsavel', label: 'Telefone / WhatsApp', type: 'tel', required: true },
      { key: 'nomeFantasia', label: 'Nome fantasia', type: 'text', required: true },
      { key: 'razaoSocial', label: 'Razão social', type: 'text' },
      { key: 'documento', label: 'CPF ou CNPJ', type: 'cpfCnpj', required: true },
      { key: 'enderecoFiscal', label: 'Endereço fiscal', type: 'textarea', required: true },
      { key: 'enderecoAtendimento', label: 'Endereço de atendimento', type: 'textarea' },
    ],
  },
  {
    key: 'dominio',
    title: 'Domínio e acessos',
    description: 'Nunca informe senhas. Quando necessário, conceda acesso por convite.',
    fields: [
      { key: 'dominioDesejado', label: 'Domínio desejado', type: 'domain', required: true },
      { key: 'dominioAlternativa1', label: 'Primeira alternativa', type: 'domain' },
      { key: 'dominioAlternativa2', label: 'Segunda alternativa', type: 'domain' },
      { key: 'possuiDominio', label: 'Já possui o domínio?', type: 'toggle' },
      {
        key: 'registradorDominio',
        label: 'Onde o domínio está registrado?',
        type: 'text',
        description: 'Não envie senha. A Blajeen orientará como fazer o convite de acesso.',
        condition: { field: 'dominio.possuiDominio', equals: true },
      },
      {
        key: 'usuariosAdministrativos',
        label: 'Pessoas que precisarão de acesso administrativo',
        type: 'repeater',
        fields: [
          { key: 'nome', label: 'Nome', type: 'text', required: true },
          { key: 'email', label: 'E-mail', type: 'email', required: true },
          { key: 'papel', label: 'Função', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'marca',
    title: 'Marca e identidade',
    description: 'Tudo o que orienta a aparência e a voz do projeto.',
    fields: [
      { key: 'nomeMarca', label: 'Nome da marca', type: 'text', required: true },
      { key: 'nomeCurto', label: 'Nome curto', type: 'text' },
      { key: 'slogan', label: 'Slogan', type: 'text' },
      { key: 'descricaoCurta', label: 'Descrição curta', type: 'textarea', required: true },
      { key: 'historia', label: 'História da empresa', type: 'textarea' },
      { key: 'diferenciais', label: 'Diferenciais', type: 'textarea', required: true },
      { key: 'logo', label: 'Logo principal', type: 'file', accept: 'logo', required: true },
      { key: 'favicon', label: 'Favicon', type: 'file', accept: 'logo' },
      { key: 'corPrimaria', label: 'Cor primária', type: 'color', required: true },
      { key: 'corSecundaria', label: 'Cor secundária', type: 'color' },
      { key: 'corDestaque', label: 'Cor de destaque', type: 'color' },
      { key: 'manualMarca', label: 'Manual da marca', type: 'file', accept: 'document' },
      { key: 'referenciasVisuais', label: 'Referências visuais', type: 'files', accept: 'image', maxFiles: 8 },
    ],
  },
  {
    key: 'contatos',
    title: 'Contato público e operação',
    description: 'Dados que poderão aparecer no site ou ser usados na operação.',
    fields: [
      { key: 'whatsappPublico', label: 'WhatsApp público', type: 'tel', required: true },
      { key: 'emailPublico', label: 'E-mail público', type: 'email' },
      { key: 'telefonePublico', label: 'Telefone público', type: 'tel' },
      redes,
      horarios,
      { key: 'observacoesFinais', label: 'Observações finais', type: 'textarea' },
    ],
  },
] as const;

const fotosMarca: readonly OnboardingField[] = [
  { key: 'logoClaro', label: 'Logo para fundo claro', type: 'file', accept: 'logo' },
  { key: 'logoEscuro', label: 'Logo para fundo escuro', type: 'file', accept: 'logo' },
];

const unidades: OnboardingField = {
  key: 'unidades',
  label: 'Unidades',
  type: 'repeater',
  fields: [
    { key: 'nome', label: 'Nome', type: 'text', required: true },
    { key: 'foto', label: 'Foto', type: 'file', accept: 'image' },
    { key: 'endereco', label: 'Endereço completo', type: 'textarea', required: true },
    { key: 'telefone', label: 'Telefone', type: 'tel' },
    { key: 'whatsapp', label: 'WhatsApp', type: 'tel' },
    { key: 'mapa', label: 'Link do Google Maps', type: 'url' },
    { key: 'horarios', label: 'Horários', type: 'hours', options: dias },
    { key: 'intervalos', label: 'Intervalos', type: 'textarea' },
    { key: 'fuso', label: 'Fuso horário', type: 'text' },
    { key: 'ativa', label: 'Unidade ativa', type: 'toggle' },
  ],
};

const ecommerce: OnboardingSchema = {
  version: 1,
  projectType: 'ECOMMERCE',
  title: 'E-commerce',
  description: 'Conteúdo, catálogo e regras comerciais para sua loja.',
  sections: [
    ...commonSections(),
    {
      key: 'imagensLoja',
      title: 'Imagens da loja',
      description: 'Arquivos que formarão a primeira apresentação da marca.',
      fields: [
        ...fotosMarca,
        { key: 'imagemCompartilhamento', label: 'Imagem de compartilhamento 1200 × 630', type: 'file', accept: 'image' },
        { key: 'bannerDesktop', label: 'Banner principal desktop', type: 'file', accept: 'image', required: true },
        { key: 'bannerMobile', label: 'Banner principal mobile', type: 'file', accept: 'image', required: true },
        { key: 'bannersSecundarios', label: 'Banners secundários', type: 'files', accept: 'image', maxFiles: 3 },
        { key: 'fotosEmpresa', label: 'Fotos da empresa ou equipe', type: 'files', accept: 'image', maxFiles: 10 },
      ],
    },
    {
      key: 'catalogo',
      title: 'Catálogo inicial',
      description: 'Escolha como começaremos e informe as primeiras categorias e produtos.',
      fields: [
        {
          key: 'modoCatalogo',
          label: 'Como deseja iniciar o catálogo?',
          type: 'select',
          required: true,
          options: ['Importar da Shopee', 'Enviar planilha', 'Preencher manualmente', 'Começar sem catálogo'],
        },
        {
          key: 'planilhaCatalogo',
          label: 'Planilha do catálogo',
          type: 'file',
          accept: 'document',
          condition: { field: 'catalogo.modoCatalogo', equals: 'Enviar planilha' },
        },
        {
          key: 'categorias',
          label: 'Categorias',
          type: 'repeater',
          fields: [
            { key: 'nome', label: 'Nome', type: 'text', required: true },
            { key: 'descricao', label: 'Descrição', type: 'textarea' },
            { key: 'imagem', label: 'Ícone ou imagem', type: 'file', accept: 'image' },
            { key: 'ordem', label: 'Ordem', type: 'text' },
            { key: 'ativa', label: 'Ativa', type: 'toggle' },
            { key: 'mostrarMenu', label: 'Mostrar no menu', type: 'toggle' },
          ],
        },
        {
          key: 'produtos',
          label: 'Produtos',
          type: 'repeater',
          fields: [
            { key: 'nome', label: 'Nome', type: 'text', required: true },
            { key: 'sku', label: 'SKU', type: 'text' },
            { key: 'marca', label: 'Marca', type: 'text' },
            { key: 'categoria', label: 'Categoria', type: 'text', required: true },
            { key: 'descricao', label: 'Descrição', type: 'textarea', required: true },
            { key: 'precoAtual', label: 'Preço atual', type: 'text', required: true },
            { key: 'precoAnterior', label: 'Preço anterior', type: 'text' },
            { key: 'estoqueInicial', label: 'Estoque inicial', type: 'text' },
            { key: 'alertaEstoque', label: 'Alerta de estoque baixo', type: 'text' },
            { key: 'variacoes', label: 'Variações', type: 'textarea' },
            { key: 'especificacoes', label: 'Especificações', type: 'textarea' },
            { key: 'pesoDimensoes', label: 'Peso e dimensões', type: 'textarea' },
            { key: 'origemEnvio', label: 'Origem do envio', type: 'cep' },
            { key: 'tags', label: 'Tags', type: 'text' },
            { key: 'marcadores', label: 'Marcadores', type: 'checklist', options: ['Destaque', 'Oferta', 'Mais vendido'] },
            { key: 'fotos', label: 'Fotos (1 a 6)', type: 'files', accept: 'image', maxFiles: 6, required: true },
            { key: 'fotoPrincipal', label: 'Identificação da foto principal', type: 'text' },
            { key: 'altText', label: 'Texto alternativo', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      key: 'comercial',
      title: 'Comercial e entrega',
      description: 'Regras de pagamento, entrega, retirada e preparação.',
      fields: [
        { key: 'checkout', label: 'Tipo de checkout', type: 'select', required: true, options: ['WhatsApp', 'Gateway de pagamento'] },
        { key: 'formasPagamento', label: 'Formas de pagamento', type: 'checklist', options: ['Pix', 'Cartão', 'Boleto', 'Dinheiro'] },
        { key: 'descontoPix', label: 'Desconto no Pix', type: 'text' },
        { key: 'parcelamento', label: 'Parcelamento', type: 'text' },
        { key: 'modalidades', label: 'Modalidades', type: 'checklist', options: ['Entrega local', 'Retirada', 'Envio nacional'] },
        { key: 'cepOrigem', label: 'CEP de origem', type: 'cep', required: true },
        { key: 'areasAtendidas', label: 'Cidades e bairros atendidos', type: 'textarea' },
        { key: 'taxasEntrega', label: 'Taxas de entrega', type: 'textarea' },
        { key: 'freteGratis', label: 'Regra de frete grátis', type: 'text' },
        { key: 'prazoPreparacao', label: 'Prazo de preparação', type: 'text' },
        { key: 'transportadora', label: 'Transportadora ou integração desejada', type: 'text' },
      ],
    },
    {
      key: 'institucional',
      title: 'Conteúdo institucional e políticas',
      description: 'Textos que orientam a compra e o pós-venda.',
      fields: [
        { key: 'sobreEmpresa', label: 'Sobre a empresa', type: 'textarea', required: true },
        { key: 'trocasDevolucoes', label: 'Trocas e devoluções', type: 'textarea' },
        { key: 'garantia', label: 'Garantia', type: 'textarea' },
        { key: 'politicaEntrega', label: 'Política de entrega', type: 'textarea' },
        { key: 'politicaPrivacidade', label: 'Política de privacidade existente', type: 'textarea' },
        { key: 'termosUso', label: 'Termos de uso existentes', type: 'textarea' },
        { key: 'posVenda', label: 'Pós-venda', type: 'textarea' },
        { key: 'linkShopee', label: 'Link da Shopee', type: 'url' },
        { key: 'perfilGoogle', label: 'Perfil do Google', type: 'url' },
        { key: 'avaliacoes', label: 'Avaliações comprováveis', type: 'repeater', fields: [
          { key: 'autor', label: 'Autor', type: 'text', required: true },
          { key: 'texto', label: 'Avaliação', type: 'textarea', required: true },
          { key: 'fonte', label: 'Link ou origem', type: 'url' },
        ] },
      ],
    },
  ],
};

const barbershop: OnboardingSchema = {
  version: 1,
  projectType: 'BARBERSHOP',
  title: 'Barbearia',
  description: 'Conteúdo, equipe, serviços e agenda da barbearia.',
  sections: [
    ...commonSections(),
    {
      key: 'fotosBarbearia', title: 'Fotos e autorizações', description: 'Imagens reais da experiência e dos profissionais.',
      fields: [
        ...fotosMarca,
        { key: 'bannerSalao', label: 'Foto horizontal do salão', type: 'file', accept: 'image', required: true },
        { key: 'fachada', label: 'Foto da fachada', type: 'file', accept: 'image', required: true },
        { key: 'trabalhos', label: 'Trabalhos realizados (4 a 10)', type: 'files', accept: 'image', maxFiles: 10, minItems: 4, required: true },
        { key: 'autorizacaoImagens', label: 'Confirmo que tenho autorização para usar as imagens', type: 'toggle', required: true },
      ],
    },
    {
      key: 'conteudoBarbearia', title: 'Conteúdo e módulos', description: 'Narrativa da marca e partes que deverão aparecer no site.',
      fields: [
        { key: 'tituloPrincipal', label: 'Título principal', type: 'text', required: true },
        { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
        { key: 'textoBotoes', label: 'Textos dos botões', type: 'textarea' },
        { key: 'historiaBarbearia', label: 'História da barbearia', type: 'textarea' },
        { key: 'experiencia', label: 'Descrição da experiência', type: 'textarea' },
        { key: 'modulos', label: 'Módulos ativos', type: 'checklist', options: ['Serviços', 'Equipe', 'Experiência', 'Galeria', 'Barber Club', 'Avaliações', 'Unidades'] },
      ],
    },
    { key: 'unidadesBarbearia', title: 'Unidades', description: 'Locais de atendimento e seus horários.', fields: [unidades] },
    {
      key: 'servicosBarbearia', title: 'Serviços', description: 'Catálogo que poderá ser exibido e agendado.',
      fields: [{ key: 'servicos', label: 'Serviços', type: 'repeater', fields: [
        { key: 'categoria', label: 'Categoria', type: 'text', required: true },
        { key: 'nome', label: 'Nome', type: 'text', required: true },
        { key: 'descricao', label: 'Descrição', type: 'textarea' },
        { key: 'foto', label: 'Foto', type: 'file', accept: 'image' },
        { key: 'preco', label: 'Preço', type: 'text' },
        { key: 'aPartirDe', label: 'Preço a partir de', type: 'toggle' },
        { key: 'duracao', label: 'Duração', type: 'text', required: true },
        { key: 'destaque', label: 'Destaque na página inicial', type: 'toggle' },
        { key: 'agendavel', label: 'Disponível para agendamento', type: 'toggle' },
        { key: 'profissionais', label: 'Profissionais relacionados', type: 'text' },
      ] }],
    },
    {
      key: 'barbeiros', title: 'Barbeiros', description: 'Equipe, especialidades, unidades e disponibilidade.',
      fields: [{ key: 'profissionais', label: 'Barbeiros', type: 'repeater', fields: [
        { key: 'nome', label: 'Nome', type: 'text', required: true },
        { key: 'cargo', label: 'Cargo', type: 'text' },
        { key: 'biografia', label: 'Biografia', type: 'textarea' },
        { key: 'foto', label: 'Foto', type: 'file', accept: 'image', required: true },
        { key: 'telefone', label: 'Telefone', type: 'tel' },
        { key: 'email', label: 'E-mail para convite', type: 'email' },
        { key: 'especialidades', label: 'Especialidades', type: 'textarea' },
        { key: 'servicos', label: 'Serviços', type: 'text' },
        { key: 'unidades', label: 'Unidades', type: 'text' },
        { key: 'horarios', label: 'Horários', type: 'hours', options: dias },
        { key: 'aceitaAgendamento', label: 'Aceita agendamento pelo site', type: 'toggle' },
        { key: 'ativo', label: 'Ativo', type: 'toggle' },
      ] }],
    },
    {
      key: 'agendaBarbearia', title: 'Regras da agenda', description: 'Limites e automações para organizar os atendimentos.',
      fields: [
        { key: 'intervaloGrade', label: 'Intervalo da grade', type: 'text' },
        { key: 'antecedenciaMinima', label: 'Antecedência mínima', type: 'text' },
        { key: 'diasFuturos', label: 'Quantos dias no futuro', type: 'text' },
        { key: 'prazoCancelamento', label: 'Prazo de cancelamento', type: 'text' },
        { key: 'intervaloAtendimentos', label: 'Intervalo entre atendimentos', type: 'text' },
        { key: 'horarioLembrete', label: 'Horário do lembrete', type: 'text' },
        { key: 'primeiroDisponivel', label: 'Oferecer primeiro profissional disponível', type: 'toggle' },
        { key: 'diasFechados', label: 'Dias fechados e feriados', type: 'textarea' },
      ],
    },
    {
      key: 'clubeAvaliacoes', title: 'Barber Club e avaliações', description: 'Preencha somente os módulos que deseja ativar.',
      fields: [
        { key: 'barberClub', label: 'Planos do Barber Club', type: 'repeater', fields: [
          { key: 'nome', label: 'Nome', type: 'text', required: true },
          { key: 'descricao', label: 'Descrição', type: 'textarea' },
          { key: 'preco', label: 'Preço', type: 'text' },
          { key: 'creditos', label: 'Créditos', type: 'text' },
          { key: 'ciclo', label: 'Ciclo', type: 'text' },
          { key: 'beneficios', label: 'Benefícios', type: 'textarea' },
          { key: 'servicos', label: 'Serviços incluídos', type: 'textarea' },
        ] },
        { key: 'avaliacoes', label: 'Avaliações autorizadas', type: 'repeater', fields: [
          { key: 'autor', label: 'Autor', type: 'text', required: true },
          { key: 'texto', label: 'Texto', type: 'textarea', required: true },
          { key: 'autorizada', label: 'Uso autorizado', type: 'toggle', required: true },
        ] },
      ],
    },
  ],
};

const personalTrainer: OnboardingSchema = {
  version: 1,
  projectType: 'PERSONAL_TRAINER',
  title: 'Personal Trainer / Studio',
  description: 'Identidade, método, profissionais, serviços e rotina do acompanhamento.',
  sections: [
    {
      key: 'modeloPersonal', title: 'Modelo de atendimento', description: 'Esta escolha adapta as próximas etapas.',
      fields: [
        { key: 'modelo', label: 'Como você trabalha?', type: 'select', required: true, options: ['Personal autônomo', 'Studio com equipe'] },
        { key: 'habilitarRecursosStudio', label: 'Quero informar unidades, equipe ou aulas coletivas mesmo sendo autônomo', type: 'toggle', condition: { field: 'modeloPersonal.modelo', equals: 'Personal autônomo' } },
      ],
    },
    ...commonSections(),
    {
      key: 'identidadePersonal', title: 'Identidade e fotos', description: 'Imagens do trabalho, da estrutura e das pessoas.',
      fields: [
        { key: 'corFundo', label: 'Cor de fundo', type: 'color' },
        { key: 'banner', label: 'Foto principal / banner', type: 'file', accept: 'image', required: true },
        { key: 'espaco', label: 'Foto do espaço', type: 'file', accept: 'image' },
        { key: 'sessoes', label: 'Fotos de sessões (2 a 4)', type: 'files', accept: 'image', minItems: 2, maxFiles: 4, required: true },
        { key: 'equipe', label: 'Foto da equipe', type: 'file', accept: 'image', condition: { field: 'modeloPersonal.modelo', equals: 'Studio com equipe' } },
        { key: 'equipamentos', label: 'Equipamentos e estrutura', type: 'files', accept: 'image', maxFiles: 10 },
      ],
    },
    {
      key: 'conteudoPersonal', title: 'Conteúdo e método', description: 'A apresentação profissional sem inventar resultados ou indicadores.',
      fields: [
        { key: 'titulo', label: 'Título', type: 'text', required: true },
        { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
        { key: 'chamada', label: 'Chamada principal', type: 'text' },
        { key: 'metodologia', label: 'Metodologia', type: 'textarea', required: true },
        { key: 'etapasMetodo', label: 'Etapas do método', type: 'repeater', fields: [
          { key: 'titulo', label: 'Etapa', type: 'text', required: true },
          { key: 'descricao', label: 'Descrição', type: 'textarea', required: true },
        ] },
        { key: 'publico', label: 'Público atendido', type: 'textarea' },
        { key: 'objetivos', label: 'Objetivos trabalhados', type: 'textarea' },
        { key: 'estrutura', label: 'Texto sobre a estrutura', type: 'textarea' },
        { key: 'acompanhamento', label: 'Texto sobre o acompanhamento', type: 'textarea' },
        { key: 'ctaFinal', label: 'Chamada final', type: 'text' },
        { key: 'indicadores', label: 'Indicadores reais', type: 'repeater', fields: [
          { key: 'rotulo', label: 'Indicador', type: 'text', required: true },
          { key: 'valor', label: 'Valor comprovável', type: 'text', required: true },
          { key: 'fonte', label: 'Como foi verificado?', type: 'text' },
        ] },
        { key: 'depoimentos', label: 'Depoimentos autorizados', type: 'repeater', fields: [
          { key: 'autor', label: 'Autor', type: 'text', required: true },
          { key: 'texto', label: 'Depoimento', type: 'textarea', required: true },
          { key: 'autorizado', label: 'Uso autorizado', type: 'toggle', required: true },
        ] },
      ],
    },
    {
      key: 'profissionaisPersonal', title: 'Profissionais', description: 'Equipe e disponibilidade.',
      fields: [{ key: 'profissionais', label: 'Profissionais', type: 'repeater', condition: { field: 'modeloPersonal.modelo', equals: 'Studio com equipe' }, fields: [
        { key: 'nome', label: 'Nome', type: 'text', required: true },
        { key: 'foto', label: 'Foto', type: 'file', accept: 'image' },
        { key: 'email', label: 'E-mail', type: 'email' },
        { key: 'telefone', label: 'Telefone', type: 'tel' },
        { key: 'especialidade', label: 'Especialidade', type: 'text' },
        { key: 'biografia', label: 'Biografia', type: 'textarea' },
        { key: 'experiencia', label: 'Anos de experiência', type: 'text' },
        { key: 'cref', label: 'Registro / CREF a exibir', type: 'text' },
        { key: 'servicos', label: 'Serviços', type: 'text' },
        { key: 'unidades', label: 'Unidades', type: 'text' },
        { key: 'horarios', label: 'Horários', type: 'hours', options: dias },
        { key: 'novosAlunos', label: 'Aceita novos alunos', type: 'toggle' },
      ] }],
    },
    {
      key: 'ofertaPersonal', title: 'Serviços, planos e aulas', description: 'O que será oferecido e como será organizado.',
      fields: [
        { key: 'servicos', label: 'Serviços', type: 'repeater', fields: [
          { key: 'categoria', label: 'Categoria', type: 'text' },
          { key: 'nome', label: 'Nome', type: 'text', required: true },
          { key: 'descricao', label: 'Descrição', type: 'textarea' },
          { key: 'duracao', label: 'Duração', type: 'text' },
          { key: 'preco', label: 'Preço', type: 'text' },
          { key: 'capacidade', label: 'Capacidade', type: 'text' },
          { key: 'profissionais', label: 'Profissionais', type: 'text' },
        ] },
        { key: 'planos', label: 'Planos e pacotes', type: 'repeater', fields: [
          { key: 'nome', label: 'Nome', type: 'text', required: true },
          { key: 'descricao', label: 'Descrição', type: 'textarea' },
          { key: 'sessoes', label: 'Sessões por ciclo', type: 'text' },
          { key: 'preco', label: 'Preço', type: 'text' },
          { key: 'duracao', label: 'Duração', type: 'text' },
          { key: 'beneficios', label: 'Benefícios', type: 'textarea' },
          { key: 'destaque', label: 'Destaque', type: 'toggle' },
        ] },
        { key: 'aulas', label: 'Aulas coletivas', type: 'repeater', condition: { field: 'modeloPersonal.modelo', equals: 'Studio com equipe' }, fields: [
          { key: 'nome', label: 'Nome', type: 'text', required: true },
          { key: 'personal', label: 'Personal', type: 'text' },
          { key: 'unidade', label: 'Unidade', type: 'text' },
          { key: 'dias', label: 'Dias', type: 'text' },
          { key: 'horarios', label: 'Horários', type: 'text' },
          { key: 'capacidade', label: 'Capacidade', type: 'text' },
          { key: 'listaEspera', label: 'Lista de espera', type: 'toggle' },
        ] },
      ],
    },
    {
      key: 'operacaoPersonal', title: 'Operação', description: 'Regras da agenda e do acompanhamento.',
      fields: [
        unidades,
        { key: 'capacidade', label: 'Capacidade de atendimento', type: 'text' },
        { key: 'intervaloSessoes', label: 'Intervalo entre sessões', type: 'text' },
        { key: 'antecedencia', label: 'Antecedência', type: 'text' },
        { key: 'cancelamento', label: 'Política de cancelamento', type: 'textarea' },
        { key: 'cancelamentoTardio', label: 'Cancelamento tardio consome sessão', type: 'toggle' },
        { key: 'janelaAgenda', label: 'Janela de agenda', type: 'text' },
        { key: 'metricasEvolucao', label: 'Métricas de evolução', type: 'checklist', options: ['Peso', 'Medidas', 'Carga', 'Frequência', 'Fotos', 'Percepção de esforço', 'Outras'] },
        { key: 'tiposMetas', label: 'Tipos de metas', type: 'textarea' },
        { key: 'modelosTreino', label: 'Modelos iniciais de treino (opcional)', type: 'file', accept: 'document' },
      ],
    },
  ],
};

const beautyStudio: OnboardingSchema = {
  version: 1,
  projectType: 'BEAUTY_STUDIO',
  title: 'Estética / Beauty Studio',
  description: 'Serviços de estética e beleza, profissionais, portfólio e políticas.',
  sections: [
    ...commonSections(),
    {
      key: 'fotosEstetica', title: 'Fotos e portfólio', description: 'Imagens autorizadas do espaço, equipe e trabalhos.',
      fields: [
        { key: 'banner', label: 'Banner principal', type: 'file', accept: 'image', required: true },
        { key: 'fotoSobre', label: 'Foto da seção Sobre', type: 'file', accept: 'image' },
        { key: 'portfolio', label: 'Portfólio (mínimo 8 trabalhos ou 2 por categoria)', type: 'files', accept: 'image', minItems: 8, maxFiles: 40, required: true },
        { key: 'fotosNoivasEventos', label: 'Fotos de noivas e eventos', type: 'files', accept: 'image', maxFiles: 20, condition: { field: 'modulosEstetica.modulos', includes: 'Noivas e eventos' } },
        { key: 'consentimento', label: 'Confirmo que tenho autorização para usar as imagens', type: 'toggle', required: true },
      ],
    },
    {
      key: 'conteudoEstetica', title: 'Conteúdo editorial', description: 'Textos que apresentam o espaço e a experiência.',
      fields: [
        { key: 'titulo', label: 'Título', type: 'text', required: true },
        { key: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
        { key: 'botoes', label: 'Textos dos botões', type: 'textarea' },
        { key: 'historia', label: 'História', type: 'textarea' },
        { key: 'experiencia', label: 'Experiência', type: 'textarea' },
        { key: 'fraseEditorial', label: 'Frase editorial', type: 'text' },
        { key: 'indicadores', label: 'Indicadores reais', type: 'repeater', fields: [
          { key: 'rotulo', label: 'Indicador', type: 'text', required: true },
          { key: 'valor', label: 'Valor comprovável', type: 'text', required: true },
        ] },
        { key: 'faq', label: 'Perguntas frequentes', type: 'repeater', fields: [
          { key: 'pergunta', label: 'Pergunta', type: 'text', required: true },
          { key: 'resposta', label: 'Resposta', type: 'textarea', required: true },
        ] },
        { key: 'textoRodape', label: 'Texto do rodapé', type: 'textarea' },
      ],
    },
    {
      key: 'modulosEstetica', title: 'Módulos', description: 'Ative somente o que fará parte da operação inicial.',
      fields: [{ key: 'modulos', label: 'Módulos ativos', type: 'checklist', options: ['Pacotes e combos', 'Beauty Club', 'Noivas e eventos', 'Portfólio', 'Inspirações', 'Lista de espera', 'Avaliações', 'Múltiplas unidades'] }],
    },
    {
      key: 'unidadesEstetica', title: 'Unidades', description: 'Locais de atendimento.',
      fields: [{ ...unidades, fields: [
        ...(unidades.fields ?? []),
        { key: 'estacionamento', label: 'Estacionamento', type: 'textarea' },
        { key: 'acessibilidade', label: 'Acessibilidade', type: 'textarea' },
        { key: 'observacoes', label: 'Observações', type: 'textarea' },
      ] }],
    },
    {
      key: 'profissionaisEstetica', title: 'Profissionais', description: 'Perfis, especialidades e disponibilidade.',
      fields: [{ key: 'profissionais', label: 'Profissionais', type: 'repeater', fields: [
        { key: 'nome', label: 'Nome', type: 'text', required: true },
        { key: 'cargo', label: 'Cargo', type: 'text' },
        { key: 'biografia', label: 'Biografia', type: 'textarea' },
        { key: 'foto', label: 'Foto', type: 'file', accept: 'image', required: true },
        { key: 'capa', label: 'Foto de capa', type: 'file', accept: 'image' },
        { key: 'instagram', label: 'Instagram', type: 'url' },
        { key: 'especialidades', label: 'Especialidades', type: 'textarea' },
        { key: 'servicos', label: 'Serviços', type: 'text' },
        { key: 'unidades', label: 'Unidades', type: 'text' },
        { key: 'horarios', label: 'Horários', type: 'hours', options: dias },
        { key: 'intervalos', label: 'Intervalos', type: 'textarea' },
        { key: 'novosClientes', label: 'Aceita novos clientes', type: 'toggle' },
        { key: 'email', label: 'E-mail para convite', type: 'email' },
      ] }],
    },
    {
      key: 'catalogoEstetica', title: 'Categorias e serviços', description: 'Catálogo completo do Beauty Studio.',
      fields: [
        { key: 'categorias', label: 'Categorias', type: 'repeater', fields: [
          { key: 'nome', label: 'Nome', type: 'text', required: true },
          { key: 'slogan', label: 'Slogan', type: 'text' },
          { key: 'descricao', label: 'Descrição', type: 'textarea' },
          { key: 'imagem', label: 'Imagem', type: 'file', accept: 'image' },
          { key: 'cor', label: 'Cor', type: 'color' },
        ] },
        { key: 'servicos', label: 'Serviços', type: 'repeater', fields: [
          { key: 'nome', label: 'Nome', type: 'text', required: true },
          { key: 'descricaoCurta', label: 'Descrição curta', type: 'textarea' },
          { key: 'descricaoCompleta', label: 'Descrição completa', type: 'textarea' },
          { key: 'foto', label: 'Foto', type: 'file', accept: 'image' },
          { key: 'tipoPreco', label: 'Tipo de preço', type: 'select', options: ['Fixo', 'A partir de', 'Sob consulta', 'Personalizado'] },
          { key: 'preco', label: 'Preço', type: 'text' },
          { key: 'duracao', label: 'Duração', type: 'text' },
          { key: 'buffer', label: 'Buffer antes e depois', type: 'text' },
          { key: 'retorno', label: 'Intervalo de retorno', type: 'text' },
          { key: 'testeContato', label: 'Necessita teste de contato', type: 'toggle' },
          { key: 'permiteFotos', label: 'Permite fotos', type: 'toggle' },
          { key: 'profissionais', label: 'Profissionais', type: 'text' },
          { key: 'destaque', label: 'Destaque', type: 'toggle' },
          { key: 'tags', label: 'Tags', type: 'text' },
        ] },
      ],
    },
    {
      key: 'extrasEstetica', title: 'Pacotes e módulos especiais', description: 'Campos aparecem conforme os módulos escolhidos.',
      fields: [
        { key: 'pacotes', label: 'Pacotes e combos', type: 'repeater', condition: { field: 'modulosEstetica.modulos', includes: 'Pacotes e combos' }, fields: [
          { key: 'nome', label: 'Nome', type: 'text', required: true },
          { key: 'descricao', label: 'Descrição', type: 'textarea' },
          { key: 'servicos', label: 'Serviços incluídos', type: 'textarea' },
          { key: 'preco', label: 'Preço', type: 'text' },
        ] },
        { key: 'beautyClub', label: 'Beauty Club', type: 'repeater', condition: { field: 'modulosEstetica.modulos', includes: 'Beauty Club' }, fields: [
          { key: 'nome', label: 'Nome', type: 'text', required: true },
          { key: 'descricao', label: 'Descrição', type: 'textarea' },
          { key: 'preco', label: 'Preço', type: 'text' },
          { key: 'beneficios', label: 'Benefícios', type: 'textarea' },
        ] },
        { key: 'noivasEventos', label: 'Noivas e eventos', type: 'textarea', condition: { field: 'modulosEstetica.modulos', includes: 'Noivas e eventos' } },
        { key: 'inspiracoes', label: 'Inspirações', type: 'files', accept: 'image', maxFiles: 20, condition: { field: 'modulosEstetica.modulos', includes: 'Inspirações' } },
        { key: 'avaliacoes', label: 'Avaliações', type: 'repeater', condition: { field: 'modulosEstetica.modulos', includes: 'Avaliações' }, fields: [
          { key: 'autor', label: 'Autor', type: 'text', required: true },
          { key: 'texto', label: 'Texto', type: 'textarea', required: true },
          { key: 'autorizada', label: 'Uso autorizado', type: 'toggle', required: true },
        ] },
      ],
    },
    {
      key: 'politicasEstetica', title: 'Políticas e agenda', description: 'Regras claras para reservas e atendimentos.',
      fields: [
        { key: 'cancelamento', label: 'Cancelamento', type: 'textarea', required: true },
        { key: 'atraso', label: 'Atraso', type: 'textarea' },
        { key: 'sinal', label: 'Sinal', type: 'textarea' },
        { key: 'reservasEventos', label: 'Reservas de eventos', type: 'textarea' },
        { key: 'intervaloAgenda', label: 'Intervalo da agenda', type: 'text' },
        { key: 'antecedencia', label: 'Antecedência', type: 'text' },
        { key: 'janelaAgendamento', label: 'Janela de agendamento', type: 'text' },
        { key: 'preparacaoEventos', label: 'Tempo de preparação para eventos', type: 'text' },
      ],
    },
  ],
};

export const onboardingSchemas: Record<ProjectType, OnboardingSchema> = {
  ECOMMERCE: ecommerce,
  BARBERSHOP: barbershop,
  PERSONAL_TRAINER: personalTrainer,
  BEAUTY_STUDIO: beautyStudio,
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

