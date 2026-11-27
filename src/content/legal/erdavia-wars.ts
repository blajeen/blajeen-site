import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const relacionados = [
  { href: ROTAS.projetoErdaviaWars, rotulo: 'Sobre o Erdavia Wars' },
  { href: ROTAS.erdaviaWarsSuporte, rotulo: 'Suporte do Erdavia Wars' },
  { href: ROTAS.erdaviaWarsPrivacidade, rotulo: 'Privacidade do Erdavia Wars' },
  { href: ROTAS.erdaviaWarsTermos, rotulo: 'Termos do Erdavia Wars' },
  { href: ROTAS.erdaviaWarsExclusao, rotulo: 'Excluir conta do Erdavia Wars' },
] as const;

const base = {
  produto: 'Erdavia Wars',
  estado: 'preparacao',
  atualizacao: {
    definido: true,
    valor: '27 de novembro de 2026',
    fonte: 'Documentação e código do protótipo do Erdavia Wars, em 27 de novembro de 2026.',
  },
  relacionados,
} as const;

const contato = (rotulo: string, assunto: string) => ({
  tipo: 'contato' as const,
  rotulo,
  email: site.emailEstudio,
  assunto,
});

export const privacidadeErdaviaWars: LegalDocument = {
  ...base,
  rota: ROTAS.erdaviaWarsPrivacidade,
  kind: 'privacidade',
  titulo: 'Política de Privacidade do Erdavia Wars',
  resumo: 'Como o protótipo guarda o progresso e as preferências, e como falar com o estúdio sobre dados pessoais.',
  secoes: [
    {
      id: 'versao',
      titulo: 'Versão em desenvolvimento',
      blocos: [
        { tipo: 'destaque', texto: 'O Erdavia Wars ainda está em desenvolvimento. Esta política descreve a versão de teste com acesso local como convidado.' },
      ],
    },
    {
      id: 'dados-locais',
      titulo: 'Progresso e preferências',
      blocos: [
        { tipo: 'paragrafo', texto: 'O protótipo guarda no aparelho o progresso, o baralho e as preferências, como idioma, música, sons e vibração, para que você possa continuar de onde parou e manter seus ajustes.' },
        { tipo: 'paragrafo', texto: 'Na versão descrita aqui, a sessão de convidado é local. As condições de login online, sincronização e compras serão detalhadas nesta página antes de esses recursos serem oferecidos ao público.' },
      ],
    },
    {
      id: 'contato-e-direitos',
      titulo: 'Contato e direitos de privacidade',
      blocos: [
        { tipo: 'paragrafo', texto: 'Ao escrever para o suporte, o estúdio usa seu endereço de e-mail e as informações do relato para responder e acompanhar o pedido. Envie apenas o necessário.' },
        { tipo: 'paragrafo', texto: 'Você pode usar o contato abaixo para perguntar sobre os dados associados ao seu atendimento ou solicitar acesso, correção ou eliminação, conforme a legislação aplicável.' },
        contato('Contato da Blajeen Labs', 'Erdavia Wars - Privacidade'),
      ],
    },
  ],
  metaTitulo: 'Privacidade do Erdavia Wars — Blajeen Labs',
  metaDescricao: 'Política do Erdavia Wars em desenvolvimento sobre progresso local, preferências e direitos de privacidade.',
};

export const termosErdaviaWars: LegalDocument = {
  ...base,
  rota: ROTAS.erdaviaWarsTermos,
  kind: 'termos',
  titulo: 'Termos de Uso do Erdavia Wars',
  resumo: 'Condições da versão em desenvolvimento do jogo de cartas e torres da Blajeen Labs.',
  secoes: [
    {
      id: 'jogo',
      titulo: 'O jogo',
      blocos: [
        { tipo: 'paragrafo', texto: 'Erdavia Wars é um jogo de estratégia ambientado em um mundo ficcional. O jogo ainda está em desenvolvimento e está anunciado como Em breve.' },
      ],
    },
    {
      id: 'testes',
      titulo: 'Versões de teste',
      blocos: [
        { tipo: 'paragrafo', texto: 'As versões de teste podem mudar entre atualizações, inclusive as regras, as cartas e o progresso salvo. A versão descrita aqui guarda o progresso de convidado no aparelho.' },
        { tipo: 'paragrafo', texto: 'Esta página será atualizada antes do lançamento, com as condições dos recursos que estiverem disponíveis.' },
      ],
    },
    { id: 'contato', titulo: 'Dúvidas', blocos: [contato('Contato da Blajeen Labs', 'Erdavia Wars - Termos')] },
  ],
  metaTitulo: 'Termos do Erdavia Wars — Blajeen Labs',
  metaDescricao: 'Termos de uso da versão em desenvolvimento do Erdavia Wars e contato do estúdio.',
};

export const suporteErdaviaWars: LegalDocument = {
  ...base,
  rota: ROTAS.erdaviaWarsSuporte,
  kind: 'suporte',
  titulo: 'Suporte do Erdavia Wars',
  resumo: 'Fale com a Blajeen Labs sobre o jogo em desenvolvimento ou sobre o acesso à versão de teste.',
  secoes: [
    {
      id: 'atendimento',
      titulo: 'Fale com o estúdio',
      blocos: [
        contato('E-mail da Blajeen Labs', 'Erdavia Wars - Suporte'),
        { tipo: 'paragrafo', texto: 'Se estiver testando o jogo, informe a versão, o modelo do aparelho e o que aconteceu. Uma captura sem dados pessoais pode ajudar.' },
      ],
    },
    {
      id: 'progresso',
      titulo: 'Progresso de convidado',
      blocos: [
        { tipo: 'paragrafo', texto: 'Na versão local de teste, o progresso pertence ao aparelho usado. Consulte a página de exclusão se quiser apagar os dados guardados pelo jogo.' },
      ],
    },
  ],
  metaTitulo: 'Suporte do Erdavia Wars — Blajeen Labs',
  metaDescricao: 'Canal de suporte da Blajeen Labs para o Erdavia Wars.',
};

export const exclusaoErdaviaWars: LegalDocument = {
  ...base,
  rota: ROTAS.erdaviaWarsExclusao,
  kind: 'exclusao',
  titulo: 'Excluir conta e dados do Erdavia Wars',
  resumo: 'Como apagar os dados de convidado da versão de teste ou enviar um pedido de exclusão ao estúdio.',
  secoes: [
    {
      id: 'pedido',
      titulo: 'Pedir exclusão pela web',
      blocos: [
        { tipo: 'paragrafo', texto: 'Se você enviou dados ao suporte ou precisa de ajuda com uma versão de teste, envie um pedido por e-mail. Informe a versão do jogo e descreva o que deseja apagar.' },
        contato('Solicitar exclusão de dados', 'Erdavia Wars - Pedido de exclusão de dados'),
      ],
    },
    {
      id: 'aparelho',
      titulo: 'Apagar o progresso de convidado',
      blocos: [
        { tipo: 'passos', itens: ['Abra o Erdavia Wars no aparelho em que jogou.', 'Entre em Ajustes e selecione Apagar dados.', 'Confirme a exclusão.'] },
        { tipo: 'paragrafo', texto: 'A exclusão local apaga o progresso e as preferências daquela instalação. Se você jogou como convidado local, a sessão fica no aparelho e não há uma conta online associada a ela.' },
      ],
    },
    {
      id: 'tratamento-do-pedido',
      titulo: 'Tratamento do pedido',
      blocos: [
        { tipo: 'paragrafo', texto: 'O estúdio pode pedir confirmação de titularidade para localizar os dados com segurança. A resposta será enviada por e-mail e informará a conclusão ou as razões de eventual retenção exigida por lei.' },
      ],
    },
  ],
  metaTitulo: 'Excluir conta do Erdavia Wars — Blajeen Labs',
  metaDescricao: 'Apague o progresso local do Erdavia Wars ou envie um pedido de exclusão de dados ao estúdio.',
};
