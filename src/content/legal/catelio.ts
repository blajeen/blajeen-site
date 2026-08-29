import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const VERSAO = '28 de agosto de 2026';
const FONTE_DATA = 'Versão de trabalho criada a partir da auditoria do projeto Catelio.';
const AVISO =
  'Catelio está em desenvolvimento e ainda não foi distribuído em nenhuma loja. Não existe build público, conta de jogador ou serviço online anunciado. Esta é uma versão de trabalho e será atualizada quando o primeiro build público existir.';

const relacionados = [
  { href: ROTAS.projetoCatelio, rotulo: 'Sobre o Catelio' },
  { href: ROTAS.catelioSuporte, rotulo: 'Suporte do Catelio' },
  { href: ROTAS.catelioPrivacidade, rotulo: 'Privacidade do Catelio' },
  { href: ROTAS.catelioTermos, rotulo: 'Termos do Catelio' },
  { href: ROTAS.catelioExclusao, rotulo: 'Excluir conta do Catelio' },
  { href: ROTAS.contato, rotulo: 'Contato do estúdio' },
] as const;

export const privacidadeCatelio: LegalDocument = {
  rota: ROTAS.catelioPrivacidade,
  kind: 'privacidade',
  produto: 'Catelio',
  titulo: 'Política de Privacidade do Catelio',
  resumo: 'O jogo ainda está em desenvolvimento; esta página explica o que existe hoje.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    {
      id: 'hoje',
      titulo: '2. O que é tratado hoje',
      blocos: [
        { tipo: 'paragrafo', texto: 'Como não há aplicativo público, o Catelio não recebe cadastro, progresso, compra ou outro dado de jogador em um serviço próprio.' },
        { tipo: 'paragrafo', texto: 'A navegação nesta página faz parte do site da Blajeen Labs e é coberta pela política geral do site.' },
      ],
    },
    {
      id: 'compromissos',
      titulo: '3. Compromissos para o primeiro build',
      blocos: [{ tipo: 'lista', itens: ['jogar sem conta sempre que tecnicamente possível;', 'não solicitar localização, contatos, câmera ou microfone sem função documentada;', 'não usar anúncios comportamentais nem vender dados;', 'publicar uma política atualizada antes de qualquer distribuição;', 'oferecer um caminho público para exclusão caso uma conta venha a existir.'] }],
    },
    {
      id: 'contato',
      titulo: '4. Dúvidas sobre dados',
      blocos: [{ tipo: 'contato', rotulo: 'Privacidade do Catelio', email: site.emailEstudio, assunto: 'Privacidade Catelio' }],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Privacidade do Catelio — Blajeen Labs',
  metaDescricao: 'Política de privacidade do Catelio, jogo em desenvolvimento na Blajeen Labs.',
};

export const termosCatelio: LegalDocument = {
  rota: ROTAS.catelioTermos,
  kind: 'termos',
  produto: 'Catelio',
  titulo: 'Termos de Uso do Catelio',
  resumo: 'Finalidade, limites e estado atual do jogo em desenvolvimento.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'contato', rotulo: 'Contato', email: site.emailEstudio, assunto: 'Termos Catelio' }] },
    { id: 'finalidade', titulo: '2. Finalidade', blocos: [{ tipo: 'paragrafo', texto: 'Catelio é um jogo casual de exploração e entretenimento. Gatos, regiões, objetos e situações são ficcionais.' }, { tipo: 'destaque', texto: 'O jogo não oferece orientação sobre cuidados, alimentação ou saúde de animais reais.' }] },
    { id: 'uso', titulo: '3. Uso aceitável', blocos: [{ tipo: 'lista', itens: ['não tentar acessar recursos sem autorização;', 'não distribuir malware ou automatizar abuso;', 'não apresentar o jogo como canal oficial de terceiros.'] }] },
    { id: 'futuro', titulo: '4. Conta, compras e disponibilidade', blocos: [{ tipo: 'paragrafo', texto: 'Não existem conta, assinatura ou compras disponíveis no projeto atual. Se alguma dessas funções for implementada, os termos serão atualizados antes da publicação.' }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Termos do Catelio — Blajeen Labs',
  metaDescricao: 'Termos de uso do Catelio, jogo casual em desenvolvimento.',
};

export const suporteCatelio: LegalDocument = {
  rota: ROTAS.catelioSuporte,
  kind: 'suporte',
  produto: 'Catelio',
  titulo: 'Suporte do Catelio',
  resumo: 'Canal para dúvidas sobre o projeto e futuros builds.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: 'Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'Como não há build distribuído, não existe instalação, conta, compra ou progresso a recuperar.' }] },
    { id: 'canal', titulo: 'Canal de atendimento', blocos: [{ tipo: 'contato', rotulo: 'E-mail de suporte do Catelio', email: site.emailEstudio, assunto: 'Suporte Catelio' }] },
    { id: 'relato', titulo: 'Quando o jogo existir', blocos: [{ tipo: 'passos', itens: ['O que você fez.', 'O que esperava que acontecesse.', 'O que aconteceu.', 'Aparelho e versão do jogo.', 'Captura sem dados pessoais, se necessário.'] }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Suporte do Catelio — Blajeen Labs',
  metaDescricao: 'Suporte do Catelio e informações sobre o estado do projeto.',
};

export const exclusaoCatelio: LegalDocument = {
  rota: ROTAS.catelioExclusao,
  kind: 'exclusao',
  produto: 'Catelio',
  titulo: 'Excluir sua conta do Catelio',
  resumo: 'Hoje não existe conta a excluir; a página ficará atualizada para o primeiro build.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'hoje', titulo: 'Hoje não existe conta a excluir', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'O projeto não foi distribuído e não cria conta nem envia progresso para um servidor próprio.' }] },
    { id: 'futuro', titulo: 'Quando uma conta existir', blocos: [{ tipo: 'paragrafo', texto: 'A criação de conta só será habilitada depois que a exclusão dentro do jogo estiver implementada e testada.' }, { tipo: 'lista', itens: ['caminho de exclusão dentro do jogo;', 'pedido sem acesso ao jogo;', 'categorias apagadas e eventuais retenções obrigatórias;', 'prazo e canal de acompanhamento.'] }, { tipo: 'contato', rotulo: 'Dúvidas sobre dados do Catelio', email: site.emailEstudio, assunto: 'Exclusão Catelio' }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Excluir conta do Catelio — Blajeen Labs',
  metaDescricao: 'Página de exclusão de conta do Catelio e estado atual do projeto.',
};
