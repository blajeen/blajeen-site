import { ROTAS } from '@/lib/routes';
import { definido } from '../blockers';
import { site } from '../site';
import type { LegalDocument, LegalSection } from '../types';
import { ofertonauta } from '../ofertonauta';

const atualizacao = definido('10 de novembro de 2026', 'Leitura do código web, app Expo e migrações Supabase em C:/dev/ofertonauta.');
const relacionados = [
  { href: ROTAS.produtoOfertonauta, rotulo: 'Sobre o Ofertonauta' },
  ...ofertonauta.documentos,
];
const contato: LegalSection = {
  id: 'contato', titulo: 'Contato sobre o Ofertonauta',
  blocos: [
    { tipo: 'paragrafo', texto: 'O atendimento desta página é feito pelo canal de suporte do Ofertonauta. Identifique o aplicativo no assunto. Não envie senha, código de acesso, documento de identidade ou dados bancários.' },
    { tipo: 'contato', rotulo: 'Blajeen Labs — Ofertonauta', email: site.emailOfertonauta, assunto: 'Ofertonauta — atendimento' },
  ],
};
function documento(kind: LegalDocument['kind'], rota: string, titulo: string, resumo: string, secoes: LegalSection[]): LegalDocument {
  return { kind, rota, produto: 'Ofertonauta', titulo, resumo, estado: 'preparacao', atualizacao,
    secoes: [...secoes, contato], relacionados, metaTitulo: `${titulo} — Blajeen Labs`, metaDescricao: resumo };
}

export const privacidadeOfertonauta = documento('privacidade', ROTAS.ofertonautaPrivacidade,
  'Política de Privacidade do Ofertonauta',
  'Como o site e o aplicativo Ofertonauta tratam dados da conta, participação na comunidade e ofertas salvas.', [
    { id: 'escopo', titulo: '1. Serviço e responsável', blocos: [
      { tipo: 'paragrafo', texto: 'Esta política cobre o site e o aplicativo Ofertonauta, produto da Blajeen Labs para descobrir ofertas de lojas externas. O Ofertonauta não recebe o pagamento das compras realizadas nessas lojas.' },
      { tipo: 'pendente', bloqueador: 'titularNome', explicacao: 'A identificação jurídica do controlador deve ser confirmada pelo titular antes do envio desta política às lojas.' },
      { tipo: 'pendente', bloqueador: 'canalLgpd', explicacao: 'O canal formal de titulares ainda depende da definição do responsável. O suporte do Ofertonauta abaixo recebe contato sobre o produto.' },
    ] },
    { id: 'conta', titulo: '2. Dados da conta e conteúdo', blocos: [
      { tipo: 'lista', itens: [
        'E-mail, identificador da conta e registros de autenticação para entrar e manter a sessão. O login é operado pelo Supabase; métodos disponíveis podem variar entre site e app.',
        'Apelido espacial, avatar e biografia opcional do perfil. Esses dados são públicos; o e-mail não aparece no perfil público.',
        'Ofertas, comentários, respostas e discussões publicados ficam associados ao apelido e podem ser lidos por outras pessoas.',
        'Votos individuais, ofertas salvas, alertas e notificações ficam associados à conta para entregar essas funções. A pontuação das ofertas é pública; o histórico individual de votos não é exibido publicamente.',
        'Denúncias, decisões de moderação, restrições e registros administrativos para combater abuso e aplicar as regras. Acesso restrito à equipe autorizada.',
        'Mensagens enviadas ao suporte, incluindo e-mail de contato, relato e anexos que a própria pessoa decidir fornecer.',
      ] },
      { tipo: 'paragrafo', texto: 'Usamos esses dados para prestar o serviço solicitado, autenticar a conta, guardar preferências, exibir contribuições, responder ao suporte e proteger a comunidade. Não publique dados pessoais de terceiros nos comentários.' },
    ] },
    { id: 'aparelho', titulo: '3. Dados no aparelho e sessão', blocos: [
      { tipo: 'paragrafo', texto: 'O aplicativo usa armazenamento local para manter a sessão de login e renová-la. O site usa os mecanismos de sessão necessários à autenticação. Sair da conta encerra a sessão naquele ambiente; desinstalar o app não exclui a conta armazenada no servidor.' },
      { tipo: 'paragrafo', texto: 'O código examinado não implementa coleta de localização precisa, contatos, microfone ou câmera para a comunidade, nem contém SDK publicitário ou ferramenta de analytics de terceiros. As permissões e os SDKs do pacote efetivamente enviado às lojas devem ser conferidos novamente antes de cada lançamento.' },
    ] },
    { id: 'metricas', titulo: '4. Métricas e registros técnicos', blocos: [
      { tipo: 'paragrafo', texto: 'O site pode registrar visualizações de ofertas e cliques de saída: oferta, tipo de evento, horário e sinalização de robô ou equipe. Esses eventos não gravam e-mail, ID da conta, endereço IP nem identificação completa do navegador na tabela de métricas. O servidor consulta a sessão e o agente do navegador para classificar equipe e robôs.' },
      { tipo: 'paragrafo', texto: 'Supabase e hospedagem processam dados técnicos de conexão, como IP, horário e requisição, para entregar e proteger o serviço. Esses registros de infraestrutura são distintos das métricas simplificadas do Ofertonauta.' },
    ] },
    { id: 'fornecedores', titulo: '5. Fornecedores e lojas externas', blocos: [
      { tipo: 'lista', itens: [
        'Supabase: autenticação, banco de dados e armazenamento de arquivos do serviço.',
        'Vercel: hospedagem da aplicação web e processamento das requisições do site.',
        'Provedores de login e entrega de e-mail, quando o método correspondente estiver habilitado, recebem os dados necessários ao acesso.',
        'Ao abrir uma oferta, você acessa uma loja externa sob as políticas dela. Links de afiliado, quando utilizados, podem permitir atribuição da compra e comissão ao Ofertonauta.',
      ] },
      { tipo: 'paragrafo', texto: 'O Ofertonauta não recebe dados de cartão ou pagamento da compra externa. Não identificamos no código examinado mecanismo de venda de dados pessoais ou rastreamento publicitário entre aplicativos. A infraestrutura dos prestadores pode processar dados fora do país; suas condições e os mecanismos aplicáveis precisam acompanhar a configuração contratada.' },
    ] },
    { id: 'retencao', titulo: '6. Retenção, direitos e exclusão', blocos: [
      { tipo: 'paragrafo', texto: 'Os dados da conta são mantidos para operar o serviço e atender solicitações. Não há rotina de expiração geral configurada no código examinado. Os prazos operacionais por categoria, tratamento dos backups e eventuais retenções justificadas ainda precisam ser definidos pelo responsável; esta página não promete remoção instantânea.' },
      { tipo: 'pendente', bloqueador: 'prazoExclusao', explicacao: 'O prazo para concluir pedidos e a retenção residual precisam ser confirmados antes do lançamento público do aplicativo.' },
      { tipo: 'paragrafo', texto: 'Você pode solicitar acesso, correção, informações sobre tratamento e exclusão pelo canal abaixo. A página Excluir conta explica como iniciar o pedido sem instalar o aplicativo. Podemos confirmar o controle do e-mail da conta para impedir que outra pessoa peça a exclusão em seu nome.' },
    ] },
    { id: 'mudancas', titulo: '7. Alterações desta política', blocos: [
      { tipo: 'paragrafo', texto: 'Esta versão corresponde ao código examinado em 10 de novembro de 2026. Mudanças de login, SDKs, permissões, publicidade ou dados tratados devem atualizar esta política e as declarações das lojas antes de entrar em distribuição.' },
    ] },
  ]);

export const suporteOfertonauta = documento('suporte', ROTAS.ofertonautaSuporte,
  'Suporte do Ofertonauta', 'Ajuda com acesso à conta, ofertas, cupons e participação na tripulação.', [
    { id: 'ajuda', titulo: 'Como pedir ajuda', blocos: [
      { tipo: 'passos', itens: ['Escreva para o canal da Blajeen Labs abaixo com Ofertonauta no assunto.', 'Informe se o problema é no site, Android ou iOS e a versão do app, quando disponível.', 'Descreva o que aconteceu e inclua o link da oferta se o problema envolver uma promoção.', 'Capturas de tela ajudam, desde que não exponham códigos de login ou dados pessoais.'] },
    ] },
    { id: 'compras', titulo: 'Compras, frete e cupons', blocos: [
      { tipo: 'paragrafo', texto: 'A compra é realizada na loja de origem. Entrega, pagamento, garantia, cancelamento e reembolso são tratados com a loja. Podemos ajudar a corrigir uma publicação, mas não acessar o pedido de compra externo.' },
      { tipo: 'paragrafo', texto: 'Preço e cupom podem depender de Pix, aplicativo, região, vendedor, primeira compra ou valor mínimo. Confira as condições no carrinho.' },
    ] },
    { id: 'dados', titulo: 'Conta e dados pessoais', blocos: [
      { tipo: 'paragrafo', texto: 'Para encerrar a conta e pedir a exclusão de dados, abra Excluir conta nos documentos relacionados. Sair da sessão ou desinstalar não remove o cadastro.' },
    ] },
  ]);

export const termosOfertonauta = documento('termos', ROTAS.ofertonautaTermos,
  'Termos de uso do Ofertonauta', 'Regras de participação e limites do radar de ofertas do Ofertonauta.', [
    { id: 'servico', titulo: '1. O radar de ofertas', blocos: [
      { tipo: 'paragrafo', texto: 'O Ofertonauta reúne informações sobre promoções de terceiros e permite participação da comunidade. Não é a loja vendedora, não processa pagamentos e não garante estoque, disponibilidade ou manutenção de preço. Confira as condições diretamente na loja antes de comprar.' },
    ] },
    { id: 'conta', titulo: '2. Conta e participação', blocos: [
      { tipo: 'lista', itens: ['Use um e-mail sob seu controle e não compartilhe códigos ou credenciais.', 'Não manipule votos, crie contas para simular participação ou envie spam.', 'Comentários e ofertas devem ser pertinentes, verdadeiros e respeitar direitos de terceiros. Não publique dados privados, conteúdo ilícito ou ofensas.', 'A equipe pode ocultar publicações e restringir contas para aplicar as regras. Contestações podem ser enviadas ao suporte.'] },
    ] },
    { id: 'conteudo', titulo: '3. Conteúdo e marcas', blocos: [
      { tipo: 'paragrafo', texto: 'Ao enviar conteúdo, você autoriza sua exibição e processamento para operar o Ofertonauta, sem transferir direitos que não possui. Imagens, marcas e nomes de lojas pertencem aos respectivos titulares. Pedidos de correção ou remoção podem ser enviados ao suporte.' },
    ] },
    { id: 'afiliados', titulo: '4. Links e ofertas externas', blocos: [
      { tipo: 'paragrafo', texto: 'Alguns links podem gerar comissão de afiliado, identificada na oferta. As condições comerciais, o preço final e o tratamento de dados na loja externa são definidos por ela. A existência de um link não garante qualidade ou disponibilidade.' },
    ] },
    { id: 'responsavel', titulo: '5. Responsável e resolução de questões', blocos: [
      { tipo: 'pendente', bloqueador: 'titularNome', explicacao: 'A identificação jurídica aplicável ao Ofertonauta depende da confirmação do titular.' },
      { tipo: 'pendente', bloqueador: 'foroJuridico', explicacao: 'As disposições jurídicas finais dependem da revisão do responsável, sem afastar direitos legais do usuário.' },
    ] },
  ]);

export const exclusaoOfertonauta = documento('exclusao', ROTAS.ofertonautaExclusao,
  'Excluir conta do Ofertonauta', 'Como solicitar a exclusão da conta e dos dados vinculados ao Ofertonauta.', [
    { id: 'pedido', titulo: 'Solicitar exclusão da conta', blocos: [
      { tipo: 'passos', itens: ['Envie um e-mail ao canal abaixo com o assunto Ofertonauta — excluir conta.', 'Prefira enviar pelo mesmo endereço usado no cadastro. Informe o apelido para ajudar a localizar a conta.', 'Diga expressamente se deseja excluir a conta inteira e os dados associados ou apenas um conteúdo específico.', 'A equipe confirma o controle da conta e esclarece o tratamento do conteúdo público e de eventuais registros que precisem ser preservados. Não envie senha nem código de login.'] },
      { tipo: 'contato', rotulo: 'Solicitar exclusão — Ofertonauta / Blajeen Labs', email: site.emailOfertonauta, assunto: 'Ofertonauta — excluir conta' },
    ] },
    { id: 'abrangencia', titulo: 'Quais dados entram no pedido', blocos: [
      { tipo: 'paragrafo', texto: 'O pedido de exclusão da conta abrange o cadastro e os dados pessoais associados: perfil, votos, salvos, alertas, notificações e vínculos de conteúdo publicado. Comentários e ofertas associados devem ser removidos ou desassociados quando aplicável. A equipe informa eventuais exceções justificadas de retenção, sua finalidade e duração.' },
      { tipo: 'paragrafo', texto: 'Sair da conta e desinstalar o aplicativo não apagam os dados do servidor. A exclusão do Ofertonauta não exclui uma conta na loja externa nem a conta Google usada para entrar.' },
    ] },
    { id: 'estado', titulo: 'Disponibilidade e prazo', blocos: [
      { tipo: 'paragrafo', texto: 'O aplicativo examinado ainda não oferece um botão interno para iniciar a exclusão. Esta página disponibiliza o canal web de solicitação; ela não substitui a implementação do início de exclusão dentro do app antes da distribuição nas lojas.' },
      { tipo: 'pendente', bloqueador: 'prazoExclusao', explicacao: 'O prazo de atendimento, o procedimento operacional e o tratamento dos backups devem ser confirmados pelo responsável. Nenhuma exclusão foi executada apenas por abrir esta página.' },
    ] },
  ]);
