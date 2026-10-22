import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const VERSAO = '17 de outubro de 2026';
const AVISO = 'Socialio está em desenvolvimento, com um beta Android em preparação para teste fechado. O aplicativo oferece modo convidado e conta opcional por e-mail com código. A preparação do beta não significa que o jogo já foi liberado em produção.';
const relacionados = [
  { href: ROTAS.projetoSocialio, rotulo: 'Sobre o Socialio' },
  { href: ROTAS.socialioSuporte, rotulo: 'Suporte do Socialio' },
  { href: ROTAS.socialioPrivacidade, rotulo: 'Privacidade do Socialio' },
  { href: ROTAS.socialioTermos, rotulo: 'Termos do Socialio' },
  { href: ROTAS.socialioExclusao, rotulo: 'Excluir conta do Socialio' },
] as const;
const contato = (rotulo: string, assunto: string) => ({ tipo: 'contato' as const, rotulo, email: site.emailEstudio, assunto });

const atualizacaoBeta = { definido: true as const, valor: '17 de outubro de 2026', fonte: 'Conferência do código do beta Android e atualização autorizada pelo titular.' };

export const privacidadeSocialio: LegalDocument = {
  rota: ROTAS.socialioPrivacidade, kind: 'privacidade', produto: 'Socialio', titulo: 'Política de Privacidade do Socialio',
  resumo: 'Dados do beta Android: modo convidado e conta opcional por e-mail.', estado: 'publicado', atualizacao: atualizacaoBeta,
  secoes: [
    { id: 'responsavel', titulo: '1. Responsável e contato', blocos: [{ tipo: 'paragrafo', texto: 'Socialio é um jogo da Blajeen Labs, publicado por 57.194.521 BRENO RICARDO GUIMARAES, CNPJ 57.194.521/0001-44. Esta política descreve o beta Android em preparação para teste fechado. Contato de privacidade: brg.ftw@gmail.com.' }] },
    { id: 'convidado', titulo: '2. Modo convidado', blocos: [{ tipo: 'paragrafo', texto: 'Você pode escolher Continuar local sem criar uma conta. Nome do personagem, país escolhido, aparência, preferências, progresso e interações locais ficam no aparelho. O país é informado pela própria pessoa; o jogo não usa GPS para localizar jogadores. Limpar os dados ou desinstalar o aplicativo pode apagar esses dados locais. O jogo consulta servidores de horário para sincronizar as rádios; a conexão expõe o endereço IP ao serviço de horário.' }] },
    { id: 'conta', titulo: '3. Conta opcional por e-mail', blocos: [{ tipo: 'paragrafo', texto: 'Se você escolher Entrar com e-mail, o endereço é enviado ao Supabase para criar ou acessar sua conta. A confirmação ocorre por um código enviado ao seu e-mail; não pedimos senha. O serviço mantém um identificador de conta e registros técnicos de autenticação, incluindo endereço IP e horários de acesso. Ao salvar o perfil, são enviados o nome do personagem, o país escolhido e os índices de aparência do avatar. Esses dados permitem recuperar o perfil em outro aparelho. O e-mail não é usado para anúncios.' }, { tipo: 'paragrafo', texto: 'A sessão e uma cópia do perfil ficam guardadas no armazenamento do aplicativo para retomar o acesso. Esse armazenamento local não deve ser considerado um cofre criptografado. Sair da conta remove a sessão e o perfil de conta deste aparelho; não exclui a conta no servidor.' }] },
    { id: 'operadores', titulo: '4. Serviços que recebem dados', blocos: [{ tipo: 'paragrafo', texto: 'O Supabase fornece autenticação e armazenamento do perfil. O envio do código utiliza a infraestrutura de e-mail configurada no projeto, com Resend como serviço SMTP. Esses fornecedores recebem os dados necessários para prestar seus serviços e podem processá-los fora do Brasil. O transporte dos dados da conta usa HTTPS. A autorização de acesso ao perfil no servidor é vinculada à conta autenticada.' }, { tipo: 'paragrafo', texto: 'Este beta Android não ativa o modo multiplayer do Photon: a cidade e o chat desta versão funcionam localmente. Não há envio de fotos, voz, vídeos, contatos ou localização GPS pelo jogo. Não há anúncios nem compras com dinheiro real neste beta. As músicas são embarcadas no aplicativo. Não vendemos dados pessoais.' }] },
    { id: 'finalidades', titulo: '5. Finalidades e retenção', blocos: [{ tipo: 'paragrafo', texto: 'Usamos os dados da conta para autenticar você, enviar o código, guardar e recuperar seu perfil e proteger o serviço contra abuso. O fornecimento desses dados é opcional: o modo local permanece disponível. O perfil e a conta são mantidos enquanto a conta existir. Você pode pedir acesso, correção e exclusão pelo contato abaixo. Não adotamos prazo adicional de retenção do perfil na base ativa após a exclusão; registros cuja conservação seja legalmente necessária serão limitados a essa finalidade, e o motivo e o prazo serão informados ao titular.' }] },
    { id: 'exclusao', titulo: '6. Excluir conta e dados', blocos: [{ tipo: 'paragrafo', texto: 'Abra Configurações no jogo e escolha Excluir conta e dados, ou acesse a página pública de exclusão nos documentos relacionados. Envie a solicitação para brg.ftw@gmail.com a partir do e-mail da conta, com o assunto Exclusão Socialio. A equipe confirma a titularidade e exclui a conta de autenticação e o perfil associado da base ativa. O atendimento é manual; o prazo de conclusão é informado na resposta, respeitando a legislação aplicável. Você não precisa reinstalar o aplicativo para fazer o pedido. Para apagar o modo convidado, limpe os dados do aplicativo nas configurações do Android.' }] },
    { id: 'publico', titulo: '7. Público do beta e alterações', blocos: [{ tipo: 'paragrafo', texto: 'O teste fechado é destinado a pessoas com 16 anos ou mais. Uma eventual classificação indicativa livre descreve o conteúdo do jogo e não muda o público escolhido para este teste. Recursos online adicionais terão sua coleta de dados descrita antes de serem distribuídos. Atualizações desta política serão publicadas nesta página.' }] },
    { id: 'contato', titulo: '8. Fale sobre seus dados', blocos: [contato('Privacidade do Socialio', 'Privacidade Socialio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Privacidade do Socialio — Blajeen Labs', metaDescricao: 'Dados locais, conta opcional por e-mail e exclusão de dados no beta Android do Socialio.',
};

export const termosSocialio: LegalDocument = {
  rota: ROTAS.socialioTermos, kind: 'termos', produto: 'Socialio', titulo: 'Termos de Uso do Socialio',
  resumo: 'Finalidade e estado atual do jogo social em desenvolvimento.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Versão de trabalho baseada na direção atual do projeto.' },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }, contato('Contato', 'Termos Socialio')] },
    { id: 'finalidade', titulo: '2. Finalidade', blocos: [{ tipo: 'paragrafo', texto: 'Socialio é um jogo de entretenimento social em desenvolvimento. A cidade, os personagens, as rádios, as atividades e os mistérios são ficcionais e podem mudar durante a criação.' }] },
    { id: 'disponibilidade', titulo: '3. Conta, interação e compras', blocos: [{ tipo: 'paragrafo', texto: 'O beta Android permite jogar como convidado ou entrar por e-mail com código para guardar o perfil. A cidade e as interações deste beta são locais; o multiplayer do Photon não está ativado nesta versão. Não há assinatura, anúncios ou compras com dinheiro real no beta. Consulte a política de privacidade e a página de exclusão nos documentos relacionados.' }] },
  ], relacionados: [...relacionados], metaTitulo: 'Termos do Socialio — Blajeen Labs', metaDescricao: 'Termos de uso do Socialio, jogo social em desenvolvimento na Blajeen Labs.',
};

export const suporteSocialio: LegalDocument = {
  rota: ROTAS.socialioSuporte, kind: 'suporte', produto: 'Socialio', titulo: 'Suporte do Socialio',
  resumo: 'Canal para dúvidas sobre o projeto e o beta Android.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Versão de trabalho baseada na direção atual do projeto.' },
  secoes: [
    { id: 'estado', titulo: 'Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    { id: 'canal', titulo: 'Canal de atendimento', blocos: [contato('E-mail de suporte do Socialio', 'Suporte Socialio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Suporte do Socialio — Blajeen Labs', metaDescricao: 'Suporte do Socialio e informações sobre o estado do projeto.',
};

export const exclusaoSocialio: LegalDocument = {
  rota: ROTAS.socialioExclusao, kind: 'exclusao', produto: 'Socialio', titulo: 'Excluir sua conta do Socialio',
  resumo: 'Solicite a exclusão da conta por e-mail ou apague os dados do modo convidado no Android.', estado: 'publicado', atualizacao: atualizacaoBeta,
  secoes: [
    { id: 'pedido', titulo: '1. Solicitar exclusão da conta', blocos: [{ tipo: 'paragrafo', texto: 'Envie um e-mail para brg.ftw@gmail.com com o assunto Exclusão Socialio. Use o mesmo endereço utilizado para entrar no jogo e informe que deseja excluir a conta e os dados associados. Não envie código de acesso, senha ou documento de identidade no pedido inicial. Este caminho funciona mesmo sem o aplicativo instalado. No jogo, o acesso está em Configurações > Excluir conta e dados.' }, contato('Solicitar exclusão da conta Socialio', 'Exclusão Socialio')] },
    { id: 'processo', titulo: '2. O que acontece com o pedido', blocos: [{ tipo: 'paragrafo', texto: 'A equipe verifica a titularidade pelo e-mail e atende a solicitação manualmente. O prazo de conclusão é informado na resposta, respeitando a legislação aplicável. Depois de concluída a exclusão, a conta de autenticação e o perfil associado são removidos da base ativa. Um novo acesso por e-mail poderá criar uma conta nova, sem recuperar o perfil excluído.' }] },
    { id: 'dados', titulo: '3. Dados excluídos e retenção', blocos: [{ tipo: 'lista', itens: ['endereço de e-mail e identificador da conta no serviço de autenticação;', 'nome do personagem, país escolhido e aparência do avatar gravados no perfil da conta;', 'vínculo entre a conta e o perfil armazenado no Supabase.'] }, { tipo: 'paragrafo', texto: 'Não há prazo adicional de retenção do perfil na base ativa após a exclusão. Se algum registro precisar ser conservado por obrigação legal, informaremos o motivo e o prazo ao titular e limitaremos seu uso a essa finalidade. A remoção no servidor não apaga automaticamente dados locais de um aparelho que esteja desconectado.' }] },
    { id: 'convidado', titulo: '4. Apagar dados do convidado ou do aparelho', blocos: [{ tipo: 'paragrafo', texto: 'O modo convidado não cria uma conta online. Para apagar seus dados locais, abra Configurações do Android > Aplicativos > Socialio > Armazenamento > Limpar dados. Isso também remove preferências, progresso e sessões guardadas nesse aparelho. Sair da conta no jogo encerra o acesso local, mas não substitui o pedido de exclusão da conta no servidor.' }] },
    { id: 'ajuda', titulo: '5. Dúvidas', blocos: [contato('Ajuda com dados do Socialio', 'Dados Socialio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Excluir conta do Socialio — Blajeen Labs', metaDescricao: 'Como solicitar a exclusão da conta e do perfil do Socialio ou apagar dados do modo convidado.',
};
