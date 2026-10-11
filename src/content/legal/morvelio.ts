import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const VERSAO = '11 de outubro de 2026';
const FONTE_DATA = 'Comportamento auditado no build de teste do Morvelio para iPhone e Android (TestFlight) de 11 de outubro de 2026.';
const AVISO =
  'Morvelio está em teste fechado (TestFlight) e ainda não está à venda nas lojas. Este texto descreve o build de teste e será revisto antes do lançamento.';

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
  resumo: 'O que o Morvelio guarda no aparelho e no servidor, com quem fala e como apagar tudo.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    {
      id: 'responsavel',
      titulo: '2. Quem é responsável',
      blocos: [
        { tipo: 'paragrafo', texto: 'O Morvelio é um jogo da Blajeen Labs, estúdio independente que responde pelos dados tratados no jogo.' },
        {
          tipo: 'pendente',
          bloqueador: 'titularNome',
          explicacao: 'O nome civil ou a razão social do responsável ainda não foi definido pelo titular e será publicado aqui antes do lançamento.',
        },
      ],
    },
    {
      id: 'aparelho',
      titulo: '3. O que fica no aparelho',
      blocos: [
        { tipo: 'paragrafo', texto: 'Os aventureiros, o progresso, o ouro, as gemas, a casa e as preferências (som, vibração, números de dano, reduzir movimento) ficam guardados no aparelho.' },
      ],
    },
    {
      id: 'conta',
      titulo: '4. Conta e login',
      blocos: [
        { tipo: 'paragrafo', texto: 'Você entra como convidado, com a Apple (no iPhone) ou com o Google. O serviço de login cria um identificador de jogador para reconhecer você entre as sessões.' },
        { tipo: 'paragrafo', texto: 'Com a Apple ou o Google, a própria loja confirma quem você é e entrega ao serviço de login um identificador da sua conta. O Morvelio não guarda seu e-mail, seu telefone nem sua senha.' },
        { tipo: 'paragrafo', texto: 'A conta de convidado fica presa ao aparelho e não guarda nome real, e-mail ou telefone.' },
      ],
    },
    {
      id: 'servidor',
      titulo: '5. O que fica no servidor',
      blocos: [
        { tipo: 'paragrafo', texto: 'O login, a cópia na nuvem e o ranking usam o Unity Gaming Services, da Unity Technologies. Ficam lá, ligados ao identificador do jogador:' },
        {
          tipo: 'lista',
          itens: [
            'a cópia do progresso, para recuperar os aventureiros num aparelho novo ou depois de reinstalar (contas Apple e Google);',
            'a carteira de gemas e as compras já creditadas, com o produto e o identificador da transação;',
            'as partidas da Provação e as insígnias de temporada;',
            'as pontuações no ranking, com o nome do aventureiro, a classe e o tempo.',
          ],
        },
        { tipo: 'destaque', texto: 'No ranking, outros jogadores veem o nome que você deu ao aventureiro, a classe e a pontuação. Não use seu nome real no aventureiro se não quiser que ele apareça.' },
        { tipo: 'paragrafo', texto: 'Para funcionar, o serviço também recebe dados técnicos da conexão, como o endereço IP.' },
      ],
    },
    {
      id: 'compras',
      titulo: '6. Compras',
      blocos: [
        { tipo: 'paragrafo', texto: 'As compras são feitas e cobradas pela App Store ou pelo Google Play. O Morvelio não recebe dados de cartão nem de pagamento.' },
        { tipo: 'paragrafo', texto: 'Para creditar uma compra no iPhone, o servidor do jogo confirma a transação com a Apple e guarda o identificador dela, para que a mesma compra não seja creditada duas vezes.' },
      ],
    },
    {
      id: 'meta',
      titulo: '7. Medição de anúncios (SDK da Meta)',
      blocos: [
        { tipo: 'paragrafo', texto: 'O Morvelio inclui o SDK da Meta (Meta Platforms), usado só para medir se os anúncios do Morvelio no Facebook e no Instagram trazem jogadores. Ele envia à Meta a instalação e as aberturas do jogo, cada nível alcançado pelo aventureiro e as compras (produto, valor e moeda), com dados técnicos do aparelho (modelo, versão do sistema, idioma, fuso horário e endereço IP) e um identificador criado pelo próprio SDK.' },
        { tipo: 'paragrafo', texto: 'No iPhone, o jogo não pede permissão para rastrear você entre apps de outras empresas. Por isso o identificador de publicidade do aparelho não é compartilhado, e a Meta mede as campanhas pela SKAdNetwork da Apple.' },
        { tipo: 'paragrafo', texto: 'No Android, o SDK também envia à Meta o ID de publicidade do aparelho. Você pode redefinir ou apagar esse ID nas configurações do Android, em Google › Anúncios.' },
        { tipo: 'paragrafo', texto: 'O Morvelio não mostra anúncios dentro do jogo e não vende seus dados. Política de privacidade da Meta: facebook.com/privacy/policy' },
      ],
    },
    {
      id: 'nao-faz',
      titulo: '8. O que o Morvelio não faz',
      blocos: [
        { tipo: 'lista', itens: ['não pede localização, contatos, fotos, câmera ou microfone;', 'não mostra anúncios dentro do jogo;', 'não vende dados de jogadores;', 'não envia notificações pela internet: os avisos do jogo aparecem só com o jogo aberto.'] },
      ],
    },
    {
      id: 'prestadores',
      titulo: '9. Com quem o jogo fala',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'Unity Technologies (Unity Gaming Services): login, cópia na nuvem, carteira e ranking. Política: unity.com/legal/game-player-and-app-user-privacy-policy;',
            'Apple: login com a Apple e compras na App Store;',
            'Google: login com o Google, Google Play Games e compras no Google Play;',
            'Meta Platforms: medição de anúncios, como descrito na seção 7.',
          ],
        },
      ],
    },
    {
      id: 'retencao',
      titulo: '10. Por quanto tempo e como apagar',
      blocos: [
        { tipo: 'paragrafo', texto: 'Os dados ficam enquanto a conta existir. Em CONFIG › EXCLUIR DADOS, o jogo apaga os dados do aparelho, a cópia na nuvem, a carteira, as pontuações nos rankings em andamento, as insígnias e a conta, e desliga o login com a Apple.' },
        { tipo: 'paragrafo', texto: 'Ficam o registro das compras (só o identificador da transação, contra crédito em dobro) e as posições em rankings de semanas e temporadas já encerradas. Os passos completos estão na página Excluir conta do Morvelio.' },
      ],
    },
    {
      id: 'direitos',
      titulo: '11. Seus direitos',
      blocos: [
        { tipo: 'paragrafo', texto: 'Pela LGPD, você pode pedir confirmação de que tratamos seus dados, acesso, correção, exclusão e informações sobre o compartilhamento. Faça o pedido pelo e-mail abaixo; respondemos em até 15 dias.' },
      ],
    },
    {
      id: 'criancas',
      titulo: '12. Crianças',
      blocos: [{ tipo: 'paragrafo', texto: 'O Morvelio não é dirigido a crianças menores de 13 anos e não coleta de propósito dados de crianças.' }],
    },
    {
      id: 'mudancas',
      titulo: '13. Mudanças',
      blocos: [{ tipo: 'paragrafo', texto: 'Quando o jogo passar a tratar dados de outro jeito, esta página muda antes da versão que traz a mudança, com a nova data no topo.' }],
    },
    { id: 'contato', titulo: '14. Dúvidas sobre dados', blocos: [contato('Privacidade do Morvelio', 'Privacidade Morvelio')] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Privacidade do Morvelio — Blajeen Labs',
  metaDescricao: 'Política de privacidade do Morvelio: o que fica no aparelho e no servidor, compras, medição de anúncios e como apagar os dados.',
};

export const termosMorvelio: LegalDocument = {
  rota: ROTAS.morvelioTermos,
  kind: 'termos',
  produto: 'Morvelio',
  titulo: 'Termos de Uso do Morvelio',
  resumo: 'As regras do jogo fora do jogo: conta, compras, moedas, ranking e conduta.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }, contato('Contato', 'Termos Morvelio')] },
    {
      id: 'finalidade',
      titulo: '2. O que é',
      blocos: [
        { tipo: 'paragrafo', texto: 'Morvelio é um jogo de ação e exploração da Blajeen Labs, ambientado em Erdávia. Personagens, reinos, criaturas e acontecimentos são ficcionais.' },
      ],
    },
    {
      id: 'conta',
      titulo: '3. Conta',
      blocos: [
        { tipo: 'paragrafo', texto: 'Você joga como convidado ou entra com a Apple ou com o Google. A conta é pessoal: cuide do acesso à sua conta Apple ou Google, porque quem entra nela entra no seu Morvelio.' },
        { tipo: 'paragrafo', texto: 'A conta de convidado fica presa ao aparelho. Se o aparelho for perdido ou o jogo for desinstalado, o progresso de convidado não volta.' },
      ],
    },
    {
      id: 'compras',
      titulo: '4. Compras, ouro e gemas',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'o ouro, as gemas e os itens do jogo são uma licença de uso dentro do Morvelio. Eles não têm valor em dinheiro, não podem ser trocados por dinheiro e não podem ser passados para outra conta;',
            'as compras são cobradas pela App Store ou pelo Google Play, e os reembolsos seguem as regras dessas lojas;',
            'o Pacote Inicial do Aventureiro pode ser comprado uma vez por conta;',
            'excluir a conta apaga o que foi comprado e não gera reembolso;',
            'se uma compra não aparecer, use RESTAURAR COMPRAS, em LOJA › OFERTAS.',
          ],
        },
      ],
    },
    {
      id: 'conduta',
      titulo: '5. Ranking e conduta',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'não use programas, automação ou modificações para jogar, pontuar ou ganhar itens;',
            'não explore falhas do jogo ou do servidor; se encontrar uma, conte pelo suporte;',
            'não dê ao aventureiro um nome ofensivo, enganoso ou com dados pessoais de outra pessoa.',
          ],
        },
        { tipo: 'paragrafo', texto: 'Quem descumprir estas regras pode ter pontuações removidas do ranking, ficar fora das insígnias de temporada ou ter a conta suspensa.' },
      ],
    },
    {
      id: 'disponibilidade',
      titulo: '6. Disponibilidade',
      blocos: [
        { tipo: 'paragrafo', texto: 'O ranking, a cópia na nuvem e as compras precisam de internet. O jogo pode mudar com atualizações: conteúdo, preços, equilíbrio e funções podem ser ajustados, e funções online podem ficar fora do ar por um tempo.' },
      ],
    },
    {
      id: 'foro',
      titulo: '7. Lei aplicável',
      blocos: [
        {
          tipo: 'pendente',
          bloqueador: 'foroJuridico',
          explicacao: 'A lei aplicável e a forma de resolver conflitos ainda dependem de revisão jurídica e serão publicadas aqui antes do lançamento.',
        },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Termos do Morvelio — Blajeen Labs',
  metaDescricao: 'Termos de uso do Morvelio: conta, compras, ouro e gemas, ranking e conduta.',
};

export const suporteMorvelio: LegalDocument = {
  rota: ROTAS.morvelioSuporte,
  kind: 'suporte',
  produto: 'Morvelio',
  titulo: 'Suporte do Morvelio',
  resumo: 'Onde falar com a gente e o que resolve a maioria dos problemas.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: 'Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }] },
    { id: 'canal', titulo: 'Canal de atendimento', blocos: [contato('E-mail de suporte do Morvelio', 'Suporte Morvelio')] },
    {
      id: 'antes',
      titulo: 'Antes de escrever',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'compra que não apareceu: use RESTAURAR COMPRAS, em LOJA › OFERTAS, com a mesma conta da loja;',
            'progresso que não voltou num aparelho novo: entre com a mesma conta Apple ou Google. A conta de convidado não passa de um aparelho para outro;',
            'reembolso: é pedido à loja que cobrou, a App Store ou o Google Play;',
            'excluir a conta: CONFIG › EXCLUIR DADOS, ou a página Excluir conta do Morvelio.',
          ],
        },
      ],
    },
    { id: 'relato', titulo: 'O que contar', blocos: [{ tipo: 'passos', itens: ['O que você fez.', 'O que esperava que acontecesse.', 'O que aconteceu.', 'Aparelho e versão do jogo.', 'Como você entra no jogo (convidado, Apple ou Google).', 'Captura sem dados pessoais, se ajudar.'] }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Suporte do Morvelio — Blajeen Labs',
  metaDescricao: 'Suporte do Morvelio: compras, progresso, reembolso e exclusão de conta.',
};

export const exclusaoMorvelio: LegalDocument = {
  rota: ROTAS.morvelioExclusao,
  kind: 'exclusao',
  produto: 'Morvelio',
  titulo: 'Excluir sua conta do Morvelio',
  resumo: 'Você apaga a conta e os dados do Morvelio pelo próprio jogo, em CONFIG › EXCLUIR DADOS. Sem acesso ao jogo, peça por e-mail.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
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
            'Se você entrou com a Apple ou com o Google, o caminho mais rápido é instalar o Morvelio de novo, entrar com a mesma conta e usar EXCLUIR DADOS.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Se não puder, envie um e-mail com o assunto “Exclusão de conta Morvelio”, dizendo como você entrava no jogo (Apple ou Google) e o nome do seu aventureiro. Poderemos pedir mais informações para localizar a conta e confirmar que ela é sua.',
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
        { tipo: 'paragrafo', texto: 'Pedidos feitos por e-mail são concluídos em até 15 dias, e a conclusão é informada pelo mesmo e-mail.' },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Excluir conta do Morvelio — Blajeen Labs',
  metaDescricao: 'Como excluir a conta e os dados do Morvelio: pelo jogo, em CONFIG › EXCLUIR DADOS, ou por e-mail, e o que é apagado.',
};
