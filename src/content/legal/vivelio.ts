import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalBlock, LegalDocument } from '../types';

/**
 * Documentos legais do Vivelio.
 *
 * Mesmo formato do Clearlio, com uma diferença que muda o texto: o Vivelio vai pra Google Play
 * e pra App Store, e as duas abrem a política durante a análise. Por isso o responsável vem
 * nomeado, como na política do Socialio, e a acessibilidade do Android tem seção própria —
 * ela lê a tela de outros apps, e a Google Play cobra que isso seja dito com todas as letras.
 *
 * Não tem página de exclusão de conta: o app não tem conta. A regra do site é que conta criada
 * no app exige exclusão no app e na web; sem conta, uma página "excluir sua conta" ensinaria a
 * apagar uma coisa que não existe. O que existe — os dados no celular — se apaga no próprio
 * celular, e a seção 7 da política diz como.
 *
 * Escrito a partir do que o titular descreveu do Vivelio 0.1.0, e não de uma auditoria do
 * build. Fica como versão de trabalho até ele ler e aprovar, como os outros; é o teste
 * `só publica documento que o titular aprovou` que segura isso.
 */

const VERSAO = '24 de outubro de 2026';
const FONTE_DATA = 'Escrito a partir da descrição do Vivelio 0.1.0 passada pelo titular em 24/10/2026.';

const relacionados = [
  { href: ROTAS.produtoVivelio, rotulo: 'Sobre o Vivelio' },
  { href: ROTAS.vivelioSuporte, rotulo: 'Suporte do Vivelio' },
  { href: ROTAS.vivelioPrivacidade, rotulo: 'Privacidade do Vivelio' },
  { href: ROTAS.vivelioTermos, rotulo: 'Termos do Vivelio' },
  { href: ROTAS.contato, rotulo: 'Contato do estúdio' },
] as const;

function contato(rotulo: string, assunto: string): LegalBlock {
  return { tipo: 'contato', rotulo, email: site.emailVivelio, assunto };
}

const RESPONSAVEL = `O Vivelio é um aplicativo da Blajeen Labs, publicado por ${site.razaoSocial}, CNPJ ${site.cnpj}.`;

export const privacidadeVivelio: LegalDocument = {
  rota: ROTAS.vivelioPrivacidade,
  kind: 'privacidade',
  produto: 'Vivelio',
  titulo: 'Privacidade do Vivelio',
  resumo: 'O que fica no seu celular, o que ele lê pra funcionar, e por que nada vem pra gente.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'resumo',
      titulo: '1. Em uma frase',
      blocos: [
        {
          tipo: 'destaque',
          texto:
            'O Vivelio não tem conta, não tem servidor próprio e não envia nenhum dado seu para a Blajeen Labs. O que ele guarda fica no seu celular. O que você faz numa rede vai do seu celular direto para a rede, como num navegador.',
        },
      ],
    },
    {
      id: 'responsavel',
      titulo: '2. Quem é responsável',
      blocos: [
        { tipo: 'paragrafo', texto: RESPONSAVEL },
        contato('Privacidade do Vivelio', 'Privacidade Vivelio'),
      ],
    },
    {
      id: 'redes',
      titulo: '3. As redes que você abre nele',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Vivelio abre o site oficial de cada rede — Instagram, YouTube, Facebook, X, Reddit, LinkedIn e Pinterest — dentro dele. Você entra com a sua conta na página da própria rede. O Vivelio não vê nem guarda a sua senha.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Enquanto você usa uma rede, ela trata os seus dados do jeito dela e sob a política dela, como faria no navegador ou no app oficial. Isso acontece entre você e a rede. A Blajeen Labs não recebe nada disso.',
        },
      ],
    },
    {
      id: 'no-celular',
      titulo: '4. O que fica no seu celular',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'quanto tempo você usou cada rede, por dia, nos últimos 35 dias;',
            'as suas rotinas, os limites e as preferências;',
            'os cookies da sessão de cada rede, dentro do app — é o que mantém você conectado.',
          ],
        },
        {
          tipo: 'destaque',
          texto: 'Nada disso sai do seu celular. Não existe cópia em servidor, nosso ou de terceiro.',
        },
      ],
    },
    {
      id: 'android',
      titulo: '5. O que ele lê no Android, se você ligar',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Duas permissões do Android são opcionais e ficam desligadas até você ligar. Sem elas, o Vivelio funciona com as redes dentro dele; com elas, ele alcança também os apps oficiais.',
        },
        {
          tipo: 'lista',
          itens: [
            'Serviço de acessibilidade: lê só os nomes técnicos e a posição dos elementos da tela do Instagram, do YouTube, do TikTok e do Snapchat, e qual app está aberto. É o que permite esconder o botão de Reels e de Shorts, sair de um Reel ou de um Short que abrir, deixar o TikTok e o Snapchat só nas mensagens e medir o tempo. Ele não lê o conteúdo das suas conversas.',
            'Acesso a notificações: só repassa as notificações das redes, pra elas abrirem dentro do Vivelio.',
          ],
        },
        {
          tipo: 'destaque',
          texto:
            'O que essas permissões leem é usado na hora, no celular, e não é enviado a lugar nenhum. Você desliga as duas quando quiser, nas configurações do Android.',
        },
      ],
    },
    {
      id: 'terceiros',
      titulo: '6. Terceiros, anúncio e medição',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'não há anúncio de nenhum tipo;',
            'não há ferramenta de análise de uso nem rastreador;',
            'o Vivelio não curte, não segue e não faz nada sozinho na sua conta;',
            'nada é vendido nem compartilhado, porque nada é coletado.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'A Google Play e a App Store medem a instalação do jeito delas e sob a política delas. Isso acontece fora do app, e nós não recebemos dado individual de ninguém. O plano Vivelio+, quando for ligado, será pago pela loja: a cobrança fica com a Google ou com a Apple, e o Vivelio não recebe o número do seu cartão.',
        },
      ],
    },
    {
      id: 'apagar',
      titulo: '7. Como apagar tudo',
      blocos: [
        {
          tipo: 'passos',
          itens: [
            'No Android, abra as configurações do sistema, vá em Apps, escolha o Vivelio e limpe os dados. Isso apaga o histórico de tempo, as rotinas, as preferências e as sessões das redes.',
            'No iPhone, ou se preferir no Android, desinstale o app: os dados dele vão junto.',
            'Pronto. Não existe conta nossa a encerrar nem pedido a fazer, porque não temos nada seu.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'Apagar o Vivelio não apaga a sua conta em nenhuma rede. Isso se faz na própria rede.',
        },
      ],
    },
    {
      id: 'criancas',
      titulo: '8. Crianças',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Vivelio não coleta dados de ninguém, de nenhuma idade. Cada rede que você abre nele tem idade mínima e regras próprias, que continuam valendo.',
        },
      ],
    },
    {
      id: 'mudanca',
      titulo: '9. Se isto mudar',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Uma versão que passe a enviar qualquer dado para fora do celular terá esta página atualizada antes de ser publicada, e a data no topo muda junto.',
        },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Privacidade do Vivelio — Blajeen Labs',
  metaDescricao:
    'O que o Vivelio guarda no seu celular, o que ele lê no Android quando você liga a acessibilidade, e por que nada vem pra gente: ele não tem conta nem servidor.',
};

export const termosVivelio: LegalDocument = {
  rota: ROTAS.vivelioTermos,
  kind: 'termos',
  produto: 'Vivelio',
  titulo: 'Termos de Uso do Vivelio',
  resumo: 'Para que serve, o que é seu, e o que não prometemos.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'oque',
      titulo: '1. O que é',
      blocos: [
        { tipo: 'paragrafo', texto: RESPONSAVEL },
        {
          tipo: 'paragrafo',
          texto:
            'O Vivelio abre as redes sociais pelo site oficial de cada uma, dentro dele, e tira da frente Reels, Shorts, feed de sugestões e anúncios. A página inicial mostra só quem você segue.',
        },
        {
          tipo: 'destaque',
          texto:
            'O Vivelio é independente. Ele não é feito, aprovado nem patrocinado por nenhuma das redes que abre. Os nomes delas são marcas dos seus donos.',
        },
      ],
    },
    {
      id: 'contas',
      titulo: '2. A sua conta em cada rede',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Você entra em cada rede pela página dela, com a sua conta. Os termos de cada rede continuam valendo dentro do Vivelio, e a conta continua sendo sua e sob a sua responsabilidade.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'O Vivelio não faz nada sozinho na sua conta: não curte, não segue, não publica e não manda mensagem. Tudo o que acontece lá é você quem faz.',
        },
      ],
    },
    {
      id: 'redes-mudam',
      titulo: '3. As redes mudam',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'As redes mudam o site e o app delas sem avisar. Quando isso acontece, um filtro pode deixar passar alguma coisa, ou uma tela pode parar de abrir, até o Vivelio ser atualizado. Não prometemos que todo filtro funcione o tempo todo.',
        },
      ],
    },
    {
      id: 'plano',
      titulo: '4. Preço e o plano Vivelio+',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Hoje tudo é grátis. Existe um plano opcional, o Vivelio+, por assinatura na Google Play e na App Store, que ainda está desligado.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Quando ele ligar, o que é grátis continua grátis: todas as redes, com o bloqueio padrão. A assinatura será cobrada, renovada e cancelada pela loja onde você assinou, sob as regras dela, e estes termos serão atualizados antes disso.',
        },
      ],
    },
    {
      id: 'garantia',
      titulo: '5. Sem garantia',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O app é fornecido como está, sem garantia. Ele ajuda a usar menos o feed; não promete um número de horas economizadas. A estimativa da introdução é uma conta, e ela aparece escrita junto do número.',
        },
      ],
    },
    {
      id: 'uso',
      titulo: '6. Uso aceitável',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'não usar o Vivelio para descumprir as regras de uma rede;',
            'não instalar no celular de outra pessoa sem a autorização dela;',
            'não redistribuir o app alterado apresentando-o como oficial;',
            'não usar o nome ou o mascote para se passar pelo estúdio.',
          ],
        },
      ],
    },
    {
      id: 'contato',
      titulo: '7. Contato',
      blocos: [contato('Termos do Vivelio', 'Termos Vivelio')],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Termos do Vivelio — Blajeen Labs',
  metaDescricao:
    'Termos de uso do Vivelio: as redes continuam com as regras delas, o app não age sozinho na sua conta, e hoje tudo é grátis.',
};

export const suporteVivelio: LegalDocument = {
  rota: ROTAS.vivelioSuporte,
  kind: 'suporte',
  produto: 'Vivelio',
  titulo: 'Suporte do Vivelio',
  resumo: 'Onde pedir ajuda, e o que conferir antes.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'canal',
      titulo: 'Onde falar com a gente',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'É o mesmo endereço que aparece dentro do app, em "Fale com a gente".',
        },
        contato('E-mail de suporte do Vivelio', 'Suporte Vivelio'),
      ],
    },
    {
      id: 'senha',
      titulo: 'A gente nunca pede a sua senha',
      blocos: [
        {
          tipo: 'destaque',
          texto:
            'O Vivelio não guarda senha, e ninguém do estúdio vai pedir a sua — nem por e-mail, nem por mensagem. Se alguém pedir em nome do Vivelio, não é a gente.',
        },
      ],
    },
    {
      id: 'reels',
      titulo: 'O Reels ou o Short continua aparecendo no app oficial',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'No Android, confira se o serviço de acessibilidade do Vivelio está ligado nas configurações do sistema. Sem ele, o Vivelio não alcança os apps oficiais — só as redes abertas dentro dele. No iPhone, essa parte não existe: lá o caminho é usar as redes dentro do Vivelio.',
        },
      ],
    },
    {
      id: 'filtro',
      titulo: 'Uma rede parou de abrir, ou o filtro deixou passar alguma coisa',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'As redes mudam o site delas sem avisar, e às vezes o filtro precisa de ajuste. Conte qual rede, o que apareceu e quando: é o que mais ajuda a consertar.',
        },
      ],
    },
    {
      id: 'relato',
      titulo: 'O que contar',
      blocos: [
        {
          tipo: 'passos',
          itens: [
            'Qual rede, e o que você estava fazendo.',
            'O que esperava que acontecesse.',
            'O que aconteceu.',
            'O modelo do celular, a versão do Android ou do iOS e a versão do Vivelio.',
            'Um print da tela, se não mostrar conversa, nome ou rosto de ninguém.',
          ],
        },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Suporte do Vivelio — Blajeen Labs',
  metaDescricao:
    'Suporte do Vivelio: o e-mail de contato, o que conferir quando o Reels ou o Short aparece, e o que contar ao pedir ajuda.',
};
