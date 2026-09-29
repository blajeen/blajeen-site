import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const VERSAO = '26 de setembro de 2026';
const AVISO = 'Mazelio está disponível na App Store. Esta documentação está em revisão para refletir integralmente a versão distribuída; informações antigas do protótipo não devem ser tomadas como descrição da publicação atual.';
const relacionados = [
  { href: ROTAS.projetoMazelio, rotulo: 'Sobre o Mazelio' },
  { href: ROTAS.mazelioSuporte, rotulo: 'Suporte do Mazelio' },
  { href: ROTAS.mazelioPrivacidade, rotulo: 'Privacidade do Mazelio' },
  { href: ROTAS.mazelioTermos, rotulo: 'Termos do Mazelio' },
  { href: ROTAS.mazelioExclusao, rotulo: 'Excluir conta do Mazelio' },
] as const;
const contato = (rotulo: string, assunto: string) => ({ tipo: 'contato' as const, rotulo, email: site.emailEstudio, assunto });

export const privacidadeMazelio: LegalDocument = {
  rota: ROTAS.mazelioPrivacidade, kind: 'privacidade', produto: 'Mazelio', titulo: 'Política de Privacidade do Mazelio',
  resumo: 'Privacidade do Mazelio e canal de contato. Documento em revisão.', estado: 'preparacao',
  atualizacao: { definido: true, valor: '29 de setembro de 2026', fonte: 'Disponibilidade conferida na App Store; revisão do inventário de dados ainda pendente.' },
  secoes: [
    { id: 'estado', titulo: '1. Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    { id: 'dados', titulo: '2. Versão distribuída', blocos: [{ tipo: 'paragrafo', texto: 'O inventário de dados, permissões e prestadores da versão publicada está em revisão. Para perguntas ou solicitações sobre seus dados, use o contato abaixo.' }, { tipo: 'paragrafo', texto: 'A navegação nesta página pertence ao site da Blajeen Labs e é coberta pela política geral do site.' }] },
    {
      id: 'meta',
      titulo: '3. Medição de anúncios (SDK da Meta)',
      blocos: [
        { tipo: 'paragrafo', texto: 'A partir da versão 1.2 para iPhone e iPad, o Mazelio inclui o SDK da Meta (Meta Platforms), usado só para medir se os anúncios do Mazelio no Facebook e no Instagram trazem instalações. Ele envia à Meta a instalação, as aberturas do app e a compra do jogo completo (valor e moeda), com dados técnicos do aparelho (modelo, versão do sistema, idioma, fuso horário e endereço IP) e um identificador anônimo criado pelo próprio SDK.' },
        { tipo: 'paragrafo', texto: 'O app não pede permissão de rastreamento e não coleta o identificador de publicidade do aparelho, nome nem e-mail. A medição vem ligada e pode ser desligada em Configurações → Medição de anúncios; desligada, o SDK nem inicia. Fora do iPhone e do iPad o SDK não existe.' },
        { tipo: 'paragrafo', texto: 'Política de privacidade da Meta: facebook.com/privacy/policy' },
      ],
    },
    { id: 'futuro', titulo: '4. Revisão', blocos: [{ tipo: 'paragrafo', texto: 'Esta seção será confrontada com o aplicativo distribuído e as declarações da App Store antes de informar categorias de dados, retenção ou compartilhamento.' }] },
    { id: 'contato', titulo: '5. Dúvidas sobre dados', blocos: [contato('Privacidade do Mazelio', 'Privacidade Mazelio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Privacidade do Mazelio — Blajeen Labs', metaDescricao: 'Privacidade do Mazelio, disponível na App Store. Documento em revisão.',
};

export const termosMazelio: LegalDocument = {
  rota: ROTAS.mazelioTermos, kind: 'termos', produto: 'Mazelio', titulo: 'Termos de Uso do Mazelio',
  resumo: 'Finalidade e estado do jogo publicado. Documento em revisão.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Disponibilidade conferida na App Store; revisão do documento ainda pendente.' },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }, contato('Contato', 'Termos Mazelio')] },
    { id: 'finalidade', titulo: '2. Finalidade', blocos: [{ tipo: 'paragrafo', texto: 'Mazelio é um jogo de entretenimento. Torres, criaturas, elementos, fases e cenários são ficcionais.' }] },
    { id: 'disponibilidade', titulo: '3. Conta, compras e disponibilidade', blocos: [{ tipo: 'paragrafo', texto: 'Mazelio está disponível na App Store. Condições de conta e compras devem ser verificadas na versão distribuída e na ficha da loja; esta seção aguarda revisão editorial e jurídica.' }] },
  ], relacionados: [...relacionados], metaTitulo: 'Termos do Mazelio — Blajeen Labs', metaDescricao: 'Termos de uso do Mazelio, disponível na App Store. Documento em revisão.',
};

export const suporteMazelio: LegalDocument = {
  rota: ROTAS.mazelioSuporte, kind: 'suporte', produto: 'Mazelio', titulo: 'Suporte do Mazelio',
  resumo: 'Canal para dúvidas e relatos sobre o jogo publicado.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Disponibilidade conferida na App Store.' },
  secoes: [
    { id: 'estado', titulo: 'Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    { id: 'canal', titulo: 'Canal de atendimento', blocos: [contato('E-mail de suporte do Mazelio', 'Suporte Mazelio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Suporte do Mazelio — Blajeen Labs', metaDescricao: 'Suporte do Mazelio e informações sobre o estado do projeto.',
};

export const exclusaoMazelio: LegalDocument = {
  rota: ROTAS.mazelioExclusao, kind: 'exclusao', produto: 'Mazelio', titulo: 'Excluir sua conta do Mazelio',
  resumo: 'Canal para pedidos relacionados à exclusão de dados do Mazelio.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Disponibilidade conferida na App Store; revisão do procedimento ainda pendente.' },
  secoes: [
    { id: 'hoje', titulo: 'Versão publicada', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'Para solicitar informações ou exclusão de dados relacionados ao Mazelio, use o contato abaixo. O procedimento específico da versão distribuída está em revisão.' }] },
    { id: 'futuro', titulo: 'Solicitação', blocos: [contato('Dúvidas sobre dados do Mazelio', 'Exclusão Mazelio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Excluir conta do Mazelio — Blajeen Labs', metaDescricao: 'Página de exclusão de conta do Mazelio e estado atual do projeto.',
};
