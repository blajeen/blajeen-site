import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const VERSAO = '1 de setembro de 2026';
const FONTE_DATA = 'Versão de trabalho criada a partir da direção aprovada para o protótipo do projeto Morvelio.';
const AVISO =
  'Morvelio está em desenvolvimento e ainda não foi distribuído em nenhuma loja. Não existe build público, conta de jogador ou serviço online anunciado. Esta é uma versão de trabalho e será atualizada quando o primeiro build público existir.';

const relacionados = [
  { href: ROTAS.projetoMorvelio, rotulo: 'Sobre o Morvelio' },
  { href: ROTAS.morvelioSuporte, rotulo: 'Suporte do Morvelio' },
  { href: ROTAS.morvelioPrivacidade, rotulo: 'Privacidade do Morvelio' },
  { href: ROTAS.morvelioTermos, rotulo: 'Termos do Morvelio' },
  { href: ROTAS.morvelioExclusao, rotulo: 'Excluir conta do Morvelio' },
  { href: ROTAS.contato, rotulo: 'Contato do estúdio' },
] as const;

const contato = (rotulo: string, assunto: string) => ({
  tipo: 'contato' as const,
  rotulo,
  email: site.emailEstudio,
  assunto,
});

export const privacidadeMorvelio: LegalDocument = {
  rota: ROTAS.morvelioPrivacidade,
  kind: 'privacidade',
  produto: 'Morvelio',
  titulo: 'Política de Privacidade do Morvelio',
  resumo: 'O jogo ainda está em desenvolvimento; esta página explica o que existe hoje.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    {
      id: 'hoje',
      titulo: '2. O que é tratado hoje',
      blocos: [
        { tipo: 'paragrafo', texto: 'Como não há aplicativo público, o Morvelio não recebe cadastro, progresso, compra ou outro dado de jogador em um serviço próprio.' },
        { tipo: 'paragrafo', texto: 'A navegação nesta página faz parte do site da Blajeen Labs e é coberta pela política geral do site.' },
      ],
    },
    {
      id: 'compromissos',
      titulo: '3. Compromissos para o primeiro build',
      blocos: [{ tipo: 'lista', itens: ['jogar sem conta sempre que tecnicamente possível;', 'não solicitar localização, contatos, câmera ou microfone sem função documentada;', 'não usar anúncios comportamentais nem vender dados;', 'publicar uma política atualizada antes de qualquer distribuição;', 'oferecer um caminho público para exclusão caso uma conta venha a existir.'] }],
    },
    { id: 'contato', titulo: '4. Dúvidas sobre dados', blocos: [contato('Privacidade do Morvelio', 'Privacidade Morvelio')] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Privacidade do Morvelio — Blajeen Labs',
  metaDescricao: 'Política de privacidade do Morvelio, jogo em desenvolvimento na Blajeen Labs.',
};

export const termosMorvelio: LegalDocument = {
  rota: ROTAS.morvelioTermos,
  kind: 'termos',
  produto: 'Morvelio',
  titulo: 'Termos de Uso do Morvelio',
  resumo: 'Finalidade, limites e estado atual do jogo em desenvolvimento.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }, contato('Contato', 'Termos Morvelio')] },
    { id: 'finalidade', titulo: '2. Finalidade', blocos: [{ tipo: 'paragrafo', texto: 'Morvelio é um jogo de entretenimento em desenvolvimento, com uma campanha de ação e exploração em uma fortaleza fantástica. Personagens, regiões, objetos e situações são ficcionais.' }, { tipo: 'destaque', texto: 'O jogo não oferece orientação profissional, financeira ou de qualquer outra natureza para situações reais.' }] },
    { id: 'uso', titulo: '3. Uso aceitável', blocos: [{ tipo: 'lista', itens: ['não tentar acessar recursos sem autorização;', 'não distribuir malware ou automatizar abuso;', 'não apresentar o jogo como canal oficial de terceiros.'] }] },
    { id: 'futuro', titulo: '4. Conta, compras e disponibilidade', blocos: [{ tipo: 'paragrafo', texto: 'Não existem conta, assinatura ou compras disponíveis no projeto atual. Se alguma dessas funções for implementada, os termos serão atualizados antes da publicação.' }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Termos do Morvelio — Blajeen Labs',
  metaDescricao: 'Termos de uso do Morvelio, jogo em desenvolvimento na Blajeen Labs.',
};

export const suporteMorvelio: LegalDocument = {
  rota: ROTAS.morvelioSuporte,
  kind: 'suporte',
  produto: 'Morvelio',
  titulo: 'Suporte do Morvelio',
  resumo: 'Canal para dúvidas sobre o projeto e futuros builds.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: 'Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'Como não há build distribuído, não existe instalação, conta, compra ou progresso a recuperar.' }] },
    { id: 'canal', titulo: 'Canal de atendimento', blocos: [contato('E-mail de suporte do Morvelio', 'Suporte Morvelio')] },
    { id: 'relato', titulo: 'Quando o jogo existir', blocos: [{ tipo: 'passos', itens: ['O que você fez.', 'O que esperava que acontecesse.', 'O que aconteceu.', 'Aparelho e versão do jogo.', 'Captura sem dados pessoais, se necessário.'] }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Suporte do Morvelio — Blajeen Labs',
  metaDescricao: 'Suporte do Morvelio e informações sobre o estado do projeto.',
};

export const exclusaoMorvelio: LegalDocument = {
  rota: ROTAS.morvelioExclusao,
  kind: 'exclusao',
  produto: 'Morvelio',
  titulo: 'Excluir sua conta do Morvelio',
  resumo: 'Hoje não existe conta a excluir; a página ficará atualizada para o primeiro build.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'hoje', titulo: 'Hoje não existe conta a excluir', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'O projeto não foi distribuído e não cria conta nem envia progresso para um servidor próprio.' }] },
    { id: 'futuro', titulo: 'Quando uma conta existir', blocos: [{ tipo: 'paragrafo', texto: 'A criação de conta só será habilitada depois que a exclusão dentro do jogo estiver implementada e testada.' }, { tipo: 'lista', itens: ['caminho de exclusão dentro do jogo;', 'pedido sem acesso ao jogo;', 'categorias apagadas e eventuais retenções obrigatórias;', 'prazo e canal de acompanhamento.'] }, contato('Dúvidas sobre dados do Morvelio', 'Exclusão Morvelio')] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Excluir conta do Morvelio — Blajeen Labs',
  metaDescricao: 'Página de exclusão de conta do Morvelio e estado atual do projeto.',
};
