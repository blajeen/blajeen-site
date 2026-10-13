import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const VERSAO = '26 de setembro de 2026';
const FONTE_DATA = 'Disponibilidade conferida na ficha pública do Catelio na App Store; revisão de dados ainda pendente.';
const AVISO =
  'Catelio está disponível na App Store. Esta documentação está em revisão para refletir integralmente a versão distribuída; a publicação do jogo não confirma que os textos antigos sobre dados, compras ou conta permaneçam válidos.';

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
  resumo: 'Informações de privacidade e canal de contato do Catelio. Documento em revisão.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: '29 de setembro de 2026', fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    {
      id: 'hoje',
      titulo: '2. O que é tratado hoje',
      blocos: [
        { tipo: 'paragrafo', texto: 'A versão pública do Catelio está disponível na App Store. O inventário de dados e prestadores desta versão está em revisão; para uma dúvida ou solicitação específica, use o contato abaixo.' },
        { tipo: 'paragrafo', texto: 'A navegação nesta página faz parte do site da Blajeen Labs e é coberta pela política geral do site.' },
      ],
    },
    {
      id: 'meta',
      titulo: '3. Medição de anúncios (SDK da Meta)',
      blocos: [
        { tipo: 'paragrafo', texto: 'A partir da versão 1.3 para iPhone e iPad, o Catelio inclui o SDK da Meta (Meta Platforms), usado só para medir se os anúncios do Catelio no Facebook e no Instagram trazem instalações. Ele envia à Meta a instalação, as aberturas do app e as compras feitas no jogo (valor e moeda), com dados técnicos do aparelho (modelo, versão do sistema, idioma, fuso horário e endereço IP) e um identificador anônimo criado pelo próprio SDK.' },
        { tipo: 'paragrafo', texto: 'O app não pede permissão de rastreamento e não coleta o identificador de publicidade do aparelho, nome nem e-mail. A medição vem ligada e pode ser desligada em Conforto (no menu de pausa) → Medição de anúncios; desligada, o SDK nem inicia. Fora do iPhone e do iPad o SDK não existe.' },
        { tipo: 'paragrafo', texto: 'Política de privacidade da Meta: facebook.com/privacy/policy' },
      ],
    },
    {
      id: 'compromissos',
      titulo: '4. Revisão da versão distribuída',
      blocos: [{ tipo: 'paragrafo', texto: 'O texto definitivo desta seção deve ser conferido contra o aplicativo distribuído e as declarações feitas à App Store antes de afirmar categorias de dados, retenção ou compartilhamento.' }],
    },
    {
      id: 'contato',
      titulo: '5. Dúvidas sobre dados',
      blocos: [{ tipo: 'contato', rotulo: 'Privacidade do Catelio', email: site.emailEstudio, assunto: 'Privacidade Catelio' }],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Privacidade do Catelio — Blajeen Labs',
  metaDescricao: 'Privacidade do Catelio, disponível na App Store. Documento em revisão e canal de contato.',
};

export const termosCatelio: LegalDocument = {
  rota: ROTAS.catelioTermos,
  kind: 'termos',
  produto: 'Catelio',
  titulo: 'Termos de Uso do Catelio',
  resumo: 'Finalidade e limites do jogo disponível na App Store. Documento em revisão.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'contato', rotulo: 'Contato', email: site.emailEstudio, assunto: 'Termos Catelio' }] },
    { id: 'finalidade', titulo: '2. Finalidade', blocos: [{ tipo: 'paragrafo', texto: 'Catelio é um jogo casual de exploração e entretenimento. Gatos, regiões, objetos e situações são ficcionais.' }, { tipo: 'destaque', texto: 'O jogo não oferece orientação sobre cuidados, alimentação ou saúde de animais reais.' }] },
    { id: 'uso', titulo: '3. Uso aceitável', blocos: [{ tipo: 'lista', itens: ['não tentar acessar recursos sem autorização;', 'não distribuir malware ou automatizar abuso;', 'não apresentar o jogo como canal oficial de terceiros.'] }] },
    { id: 'futuro', titulo: '4. Conta, compras e disponibilidade', blocos: [{ tipo: 'paragrafo', texto: 'Catelio está disponível na App Store. Condições de conta e compras devem ser verificadas na versão distribuída e na ficha da loja; esta seção aguarda revisão editorial e jurídica.' }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Termos do Catelio — Blajeen Labs',
  metaDescricao: 'Termos de uso do Catelio, jogo casual disponível na App Store. Documento em revisão.',
};

export const suporteCatelio: LegalDocument = {
  rota: ROTAS.catelioSuporte,
  kind: 'suporte',
  produto: 'Catelio',
  titulo: 'Suporte do Catelio',
  resumo: 'Canal para dúvidas e relatos sobre o jogo publicado.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: 'Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'Em pedidos de ajuda, informe o aparelho, a versão do jogo e o que aconteceu, sem enviar informações pessoais desnecessárias.' }] },
    { id: 'canal', titulo: 'Canal de atendimento', blocos: [{ tipo: 'contato', rotulo: 'E-mail de suporte do Catelio', email: site.emailEstudio, assunto: 'Suporte Catelio' }] },
    { id: 'relato', titulo: 'Como relatar um problema', blocos: [{ tipo: 'passos', itens: ['O que você fez.', 'O que esperava que acontecesse.', 'O que aconteceu.', 'Aparelho e versão do jogo.', 'Captura sem dados pessoais, se necessário.'] }] },
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
  resumo: 'Canal para pedidos relacionados à exclusão de dados do Catelio.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'hoje', titulo: 'Versão publicada', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'Para solicitar informações ou exclusão de dados relacionados ao Catelio, use o contato abaixo. O procedimento específico da versão distribuída está em revisão.' }] },
    { id: 'futuro', titulo: 'Solicitação', blocos: [{ tipo: 'contato', rotulo: 'Dúvidas sobre dados do Catelio', email: site.emailEstudio, assunto: 'Exclusão Catelio' }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Excluir conta do Catelio — Blajeen Labs',
  metaDescricao: 'Página de exclusão de conta do Catelio e estado atual do projeto.',
};
