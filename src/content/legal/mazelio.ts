import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const VERSAO = '5 de setembro de 2026';
const AVISO = 'Mazelio está em desenvolvimento e ainda não foi distribuído em nenhuma loja. O vertical slice é usado internamente para testes. Não existe build público, conta de jogador, compra ou serviço online anunciado.';
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
  resumo: 'O jogo está em desenvolvimento; esta página descreve o estado atual.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Versão de trabalho baseada no estado atual do protótipo.' },
  secoes: [
    { id: 'estado', titulo: '1. Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    { id: 'dados', titulo: '2. Dados tratados hoje', blocos: [{ tipo: 'paragrafo', texto: 'O build interno funciona offline. Como não há aplicativo público, conta ou serviço online anunciado, o Mazelio não recebe cadastro, progresso ou compra em um servidor próprio.' }, { tipo: 'paragrafo', texto: 'A navegação nesta página pertence ao site da Blajeen Labs e é coberta pela política geral do site.' }] },
    { id: 'futuro', titulo: '3. Antes de uma distribuição', blocos: [{ tipo: 'lista', itens: ['publicar uma política atualizada antes de qualquer distribuição;', 'explicar qualquer coleta necessária para uma função do jogo;', 'não solicitar permissões sem função documentada;', 'oferecer caminho público de exclusão caso uma conta venha a existir.'] }] },
    { id: 'contato', titulo: '4. Dúvidas sobre dados', blocos: [contato('Privacidade do Mazelio', 'Privacidade Mazelio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Privacidade do Mazelio — Blajeen Labs', metaDescricao: 'Política de privacidade do Mazelio, jogo em desenvolvimento na Blajeen Labs.',
};

export const termosMazelio: LegalDocument = {
  rota: ROTAS.mazelioTermos, kind: 'termos', produto: 'Mazelio', titulo: 'Termos de Uso do Mazelio',
  resumo: 'Finalidade e estado atual do jogo em desenvolvimento.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Versão de trabalho baseada no estado atual do protótipo.' },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }, contato('Contato', 'Termos Mazelio')] },
    { id: 'finalidade', titulo: '2. Finalidade', blocos: [{ tipo: 'paragrafo', texto: 'Mazelio é um jogo de entretenimento em desenvolvimento. Torres, criaturas, elementos, fases e cenários são ficcionais e podem mudar durante os testes.' }] },
    { id: 'disponibilidade', titulo: '3. Conta, compras e disponibilidade', blocos: [{ tipo: 'paragrafo', texto: 'Não existem conta, assinatura ou compras disponíveis no projeto atual. Se essas funções forem implementadas, estes termos serão atualizados antes da publicação.' }] },
  ], relacionados: [...relacionados], metaTitulo: 'Termos do Mazelio — Blajeen Labs', metaDescricao: 'Termos de uso do Mazelio, jogo em desenvolvimento na Blajeen Labs.',
};

export const suporteMazelio: LegalDocument = {
  rota: ROTAS.mazelioSuporte, kind: 'suporte', produto: 'Mazelio', titulo: 'Suporte do Mazelio',
  resumo: 'Canal para dúvidas sobre o projeto e futuros builds.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Versão de trabalho baseada no estado atual do protótipo.' },
  secoes: [
    { id: 'estado', titulo: 'Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    { id: 'canal', titulo: 'Canal de atendimento', blocos: [contato('E-mail de suporte do Mazelio', 'Suporte Mazelio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Suporte do Mazelio — Blajeen Labs', metaDescricao: 'Suporte do Mazelio e informações sobre o estado do projeto.',
};

export const exclusaoMazelio: LegalDocument = {
  rota: ROTAS.mazelioExclusao, kind: 'exclusao', produto: 'Mazelio', titulo: 'Excluir sua conta do Mazelio',
  resumo: 'Hoje não existe conta a excluir; a página será atualizada para o primeiro build público.', estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: 'Versão de trabalho baseada no estado atual do protótipo.' },
  secoes: [
    { id: 'hoje', titulo: 'Hoje não existe conta a excluir', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'O projeto não cria conta nem envia progresso para um servidor próprio.' }] },
    { id: 'futuro', titulo: 'Quando uma conta existir', blocos: [{ tipo: 'paragrafo', texto: 'A criação de conta só será habilitada depois que houver um processo público e testado para exclusão.' }, contato('Dúvidas sobre dados do Mazelio', 'Exclusão Mazelio')] },
  ], relacionados: [...relacionados], metaTitulo: 'Excluir conta do Mazelio — Blajeen Labs', metaDescricao: 'Página de exclusão de conta do Mazelio e estado atual do projeto.',
};
