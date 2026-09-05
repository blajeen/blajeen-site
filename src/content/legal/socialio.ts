import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const VERSAO = '5 de setembro de 2026';
const AVISO = 'Socialio está em desenvolvimento e ainda não foi distribuído em nenhuma loja. Não existe build público, conta de jogador, compra, servidor aberto ou data de lançamento anunciada.';
const relacionados = [
  { href: ROTAS.projetoSocialio, rotulo: 'Sobre o Socialio' },
  { href: ROTAS.socialioSuporte, rotulo: 'Suporte do Socialio' },
  { href: ROTAS.socialioPrivacidade, rotulo: 'Privacidade do Socialio' },
  { href: ROTAS.socialioTermos, rotulo: 'Termos do Socialio' },
  { href: ROTAS.socialioExclusao, rotulo: 'Excluir conta do Socialio' },
] as const;
const contato = (rotulo: string, assunto: string) => ({ tipo: 'contato' as const, rotulo, email: site.emailEstudio, assunto });

export const privacidadeSocialio: LegalDocument = {
  rota: ROTAS.socialioPrivacidade, kind: 'privacidade', produto: 'Socialio', titulo: 'Política de Privacidade do Socialio',
  resumo: 'O jogo está em desenvolvimento; esta página descreve o que não existe publicamente hoje.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Versão de trabalho baseada na direção atual do projeto.' },
  secoes: [
    { id: 'estado', titulo: '1. Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    { id: 'dados', titulo: '2. Dados tratados hoje', blocos: [{ tipo: 'paragrafo', texto: 'Como não há build público nem servidor aberto, o Socialio não recebe cadastro, conversa, progresso, lista de amigos ou compra em um serviço disponível ao público.' }, { tipo: 'paragrafo', texto: 'A navegação nesta página pertence ao site da Blajeen Labs e é coberta pela política geral do site.' }] },
    { id: 'futuro', titulo: '3. Antes de uma distribuição', blocos: [{ tipo: 'lista', itens: ['explicar quais dados são necessários para qualquer função online;', 'publicar uma política atualizada antes de abrir servidores ou distribuição;', 'oferecer ferramentas de segurança e canais de denúncia adequados à interação entre jogadores;', 'oferecer um caminho público de exclusão se uma conta for criada.'] }] },
    { id: 'contato', titulo: '4. Dúvidas sobre dados', blocos: [contato('Privacidade do Socialio', 'Privacidade Socialio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Privacidade do Socialio — Blajeen Labs', metaDescricao: 'Política de privacidade do Socialio, jogo social em desenvolvimento na Blajeen Labs.',
};

export const termosSocialio: LegalDocument = {
  rota: ROTAS.socialioTermos, kind: 'termos', produto: 'Socialio', titulo: 'Termos de Uso do Socialio',
  resumo: 'Finalidade e estado atual do jogo social em desenvolvimento.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Versão de trabalho baseada na direção atual do projeto.' },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }, contato('Contato', 'Termos Socialio')] },
    { id: 'finalidade', titulo: '2. Finalidade', blocos: [{ tipo: 'paragrafo', texto: 'Socialio é um jogo de entretenimento social em desenvolvimento. A cidade, os personagens, as rádios, as atividades e os mistérios são ficcionais e podem mudar durante a criação.' }] },
    { id: 'disponibilidade', titulo: '3. Conta, interação e compras', blocos: [{ tipo: 'paragrafo', texto: 'Não existem conta, chat, servidor aberto, assinatura ou compras disponíveis no projeto atual. Se essas funções forem implementadas, os termos serão atualizados antes da publicação.' }] },
  ], relacionados: [...relacionados], metaTitulo: 'Termos do Socialio — Blajeen Labs', metaDescricao: 'Termos de uso do Socialio, jogo social em desenvolvimento na Blajeen Labs.',
};

export const suporteSocialio: LegalDocument = {
  rota: ROTAS.socialioSuporte, kind: 'suporte', produto: 'Socialio', titulo: 'Suporte do Socialio',
  resumo: 'Canal para dúvidas sobre o projeto e futuros builds.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Versão de trabalho baseada na direção atual do projeto.' },
  secoes: [
    { id: 'estado', titulo: 'Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    { id: 'canal', titulo: 'Canal de atendimento', blocos: [contato('E-mail de suporte do Socialio', 'Suporte Socialio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Suporte do Socialio — Blajeen Labs', metaDescricao: 'Suporte do Socialio e informações sobre o estado do projeto.',
};

export const exclusaoSocialio: LegalDocument = {
  rota: ROTAS.socialioExclusao, kind: 'exclusao', produto: 'Socialio', titulo: 'Excluir sua conta do Socialio',
  resumo: 'Hoje não existe conta a excluir; a página será atualizada para o primeiro build público.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Versão de trabalho baseada na direção atual do projeto.' },
  secoes: [
    { id: 'hoje', titulo: 'Hoje não existe conta a excluir', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'O projeto não tem conta, servidor aberto ou perfil de jogador disponível ao público.' }] },
    { id: 'futuro', titulo: 'Quando uma conta existir', blocos: [{ tipo: 'paragrafo', texto: 'Uma conta só será habilitada depois que existir um processo público e testado para exclusão de dados.' }, contato('Dúvidas sobre dados do Socialio', 'Exclusão Socialio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Excluir conta do Socialio — Blajeen Labs', metaDescricao: 'Página de exclusão de conta do Socialio e estado atual do projeto.',
};
