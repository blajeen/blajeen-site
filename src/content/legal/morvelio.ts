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

const VERSAO_EXCLUSAO = '11 de outubro de 2026';
const FONTE_EXCLUSAO = 'Comportamento do EXCLUIR DADOS no build de teste do Morvelio para iPhone (TestFlight) de 11 de outubro de 2026.';

export const exclusaoMorvelio: LegalDocument = {
  rota: ROTAS.morvelioExclusao,
  kind: 'exclusao',
  produto: 'Morvelio',
  titulo: 'Excluir sua conta do Morvelio',
  resumo: 'Você apaga a conta e os dados do Morvelio pelo próprio jogo, em CONFIG › EXCLUIR DADOS. Sem acesso ao jogo, peça por e-mail.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO_EXCLUSAO, fonte: FONTE_EXCLUSAO },
  secoes: [
    {
      id: 'no-jogo',
      titulo: 'Pelo jogo',
      blocos: [
        {
          tipo: 'passos',
          itens: [
            'Abra o Morvelio e toque em CONFIG, na barra de baixo.',
            'Toque em EXCLUIR DADOS.',
            'Na janela “EXCLUIR TODOS OS DADOS?”, segure EXCLUIR até o botão completar.',
            'Se você entrou com a Apple, confirme na janela da Apple que aparece. Ela desliga o login do Morvelio na sua conta Apple.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'É preciso estar com internet. Se o jogo não conseguir apagar os dados no servidor, ele avisa, mantém a conta e os aventureiros no aparelho, e você pode tentar de novo.',
        },
      ],
    },
    {
      id: 'apagado',
      titulo: 'O que é apagado',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'os aventureiros, o progresso, o ouro, as gemas, a casa e os itens guardados no aparelho;',
            'as preferências do jogo, como som, vibração e números de dano;',
            'a cópia do progresso guardada na nuvem;',
            'a carteira de gemas e de compras guardada no servidor;',
            'as pontuações nos rankings em andamento e as insígnias de temporada;',
            'a conta do jogador no serviço de login e progresso online usado pelo Morvelio (Unity Gaming Services);',
            'a autorização do “Entrar com a Apple”, quando a conta foi criada assim.',
          ],
        },
      ],
    },
    {
      id: 'mantido',
      titulo: 'O que não é apagado',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'o registro de cada compra, com o identificador da transação, para que a mesma compra não seja creditada duas vezes. Esse registro não tem nome, e-mail nem dados de pagamento;',
            'as posições em rankings de semanas e temporadas já encerradas, que ficam no histórico do ranking com o nome do aventureiro;',
            'os registros das compras na App Store ou no Google Play, que ficam com a loja que fez a cobrança.',
          ],
        },
        {
          tipo: 'destaque',
          texto:
            'O que foi comprado no jogo é perdido junto com a conta. Excluir a conta não gera reembolso; pedidos de reembolso seguem as regras da App Store ou do Google Play.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Se você entrou com o Google, o Morvelio continua listado nos acessos da sua Conta Google até você removê-lo nas configurações de segurança do Google.',
        },
      ],
    },
    {
      id: 'sem-jogo',
      titulo: 'Sem acesso ao jogo',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Se você entrou com a Apple, com o Google ou com e-mail, o caminho mais rápido é instalar o Morvelio de novo, entrar com a mesma conta e usar EXCLUIR DADOS.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Se não puder, envie um e-mail com o assunto “Exclusão de conta Morvelio”, dizendo como você entrava no jogo (Apple, Google ou e-mail) e o nome do seu aventureiro. Poderemos pedir mais informações para localizar a conta e confirmar que ela é sua.',
        },
        contato('Pedido de exclusão', 'Exclusão de conta Morvelio'),
        {
          tipo: 'paragrafo',
          texto:
            'A conta de convidado fica presa ao aparelho e não guarda nome real, e-mail ou telefone. Use EXCLUIR DADOS antes de desinstalar o jogo: depois disso não há como confirmar que a conta era sua.',
        },
      ],
    },
    {
      id: 'prazo',
      titulo: 'Prazo',
      blocos: [
        { tipo: 'paragrafo', texto: 'Pelo jogo, a exclusão acontece na hora.' },
        {
          tipo: 'pendente',
          bloqueador: 'prazoExclusao',
          explicacao:
            'O prazo para concluir pedidos feitos por e-mail ainda não foi definido pelo titular. Ele será publicado nesta página antes do envio às lojas, porque um prazo estimado aqui viraria um compromisso não verificado.',
        },
        { tipo: 'paragrafo', texto: 'A conclusão do pedido é informada pelo mesmo e-mail.' },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Excluir conta do Morvelio — Blajeen Labs',
  metaDescricao: 'Como excluir a conta e os dados do Morvelio: pelo jogo, em CONFIG › EXCLUIR DADOS, ou por e-mail, e o que é apagado.',
};
