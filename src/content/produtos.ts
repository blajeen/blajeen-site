import type { ProductIconId } from '@/components/projects/ProductIcon';
import { ROTAS } from '@/lib/routes';

/**
 * Produtos do estúdio: coisa que a pessoa leva pra máquina dela e usa.
 *
 * Categoria própria porque não é jogo nem SaaS — não tem conta, não tem servidor no meio
 * e não tem mensalidade. Isso muda tudo o que a página precisa dizer: em vez de preço e
 * plano, ela precisa dizer o que aquilo faz com os arquivos de quem instalou, e como
 * desfazer.
 */

/**
 * Onde os arquivos do Clearlio ficam hospedados.
 *
 * O código é fechado, e anexo de release em repositório privado não é baixável sem login
 * — então os binários moram num repositório público separado, que guarda só os arquivos,
 * os hashes e o texto de quem vai baixar. O código continua onde estava.
 *
 * A URL aponta pra etiqueta da versão, e não pra `latest`, porque o nome de cada arquivo
 * carrega o número da versão: `latest` daria 404 no dia em que saísse a 0.2.0. Versão
 * nova, uma linha pra trocar aqui — junto dos hashes, que também mudam.
 */
export const BASE_DE_DOWNLOAD =
  'https://github.com/blajeen/clearlio-download/releases/download/v0.1.0';

/** A página de todas as versões, pra quem quiser uma anterior ou conferir o histórico. */
export const PAGINA_DE_RELEASES = 'https://github.com/blajeen/clearlio-download/releases';

export type ArquivoParaBaixar = {
  id: string;
  nome: string;
  arquivo: string;
  tamanho: string;
  /** Uma linha dizendo pra quem é este formato. */
  paraQuem: string;
  recomendado?: boolean;
  /** SHA-256 do arquivo publicado. É o que a pessoa tem pra conferir sem assinatura. */
  hash: string;
};

/** O que todo produto tem, seja programa ou planilha. */
type Comum = {
  id: string;
  nome: string;
  /** O ícone que representa o produto na gaveta do menu. */
  simbolo: ProductIconId;
  rota: string;
  estado: string;
  lema: string;
  resumo: string;
  descricao: readonly string[];
  /** Uma imagem do produto de verdade. Print, não montagem. */
  imagem: { src: string; alt: string; legenda: string };
  /** O que ele faz. Cada item é verificável abrindo o produto. */
  faz: readonly { titulo: string; texto: string }[];
};

export type Aplicativo = Comum & {
  tipo: 'aplicativo';
  versao: string;
  /** Sistema mínimo, escrito como a pessoa reconhece. */
  requisitos: string;
  /** O que ele se recusa a fazer, e por quê. É a parte que decide a confiança. */
  naoFaz: readonly string[];
  arquivos: readonly ArquivoParaBaixar[];
  /**
   * O aviso do Windows, dito antes de a pessoa esbarrar nele.
   *
   * Sem assinatura de código, o Windows e o navegador vão barrar o download e dar medo em
   * quem não é técnico — justo o público deste programa. Explicar depois não serve: quem
   * se assusta fecha a aba e não volta. Então a explicação fica na mesma tela do botão,
   * com o nome exato de cada botão que a pessoa vai ter que clicar.
   */
  avisoDoWindows: {
    porque: string;
    passos: readonly { onde: string; texto: string }[];
  };
  codigoAberto: boolean;
};

export type Planilha = Comum & {
  tipo: 'planilha';
  /** O que cada aba faz, do jeito que já está escrito dentro do arquivo. */
  abas: readonly { nome: string; texto: string }[];
  /** A ordem de uso, tirada da própria aba de instruções da planilha. */
  comoUsar: readonly { passo: string; texto: string }[];
  /** As regras que a planilha ensina na primeira aba. */
  regras: readonly { titulo: string; texto: string }[];
  links: {
    /**
     * `/copy`, e nunca o link de edição.
     *
     * O endereço que sai do botão "Compartilhar" do Drive termina em `/edit`, e ele leva
     * a pessoa pro arquivo **original**. Compartilhado como leitor ela não estraga nada,
     * mas também não consegue usar: planilha de controle financeiro só serve se der pra
     * escrever nela. O `/copy` abre a caixa "Fazer uma cópia", e cada pessoa sai com a
     * planilha dela, na conta dela, sem encostar no original.
     */
    copiar: string;
    /** Pra quem não usa Google: o mesmo arquivo em formato de Excel. */
    excel: string;
  };
  /** O que se perde ao baixar em Excel em vez de copiar no Google. */
  diferencaDoExcel: string;
};

export type Produto = Aplicativo | Planilha;

export const clearlio: Aplicativo = {
  tipo: 'aplicativo',
  id: 'clearlio',
  nome: 'Clearlio',
  simbolo: 'limpeza',
  versao: '0.1.0',
  rota: ROTAS.produtoClearlio,
  estado: 'ATIVO · GRATUITO',
  requisitos: 'Windows 10 ou 11, 64 bits',
  lema: 'Limpeza de verdade. Sem susto, sem cobrança, sem letra miúda.',
  resumo:
    'Acha o que não serve mais no seu computador, explica em português o que é cada coisa, e limpa só o que você mandar. Nada é apagado: vai pra uma lixeira dele, fica 30 dias, e volta inteiro com um clique.',
  descricao: [
    'A maioria dos limpadores de disco funciona no escuro: eles varrem, mostram um número grande, e você aperta um botão confiando que nada importante vai junto. Quando alguma coisa quebra, não tem volta e não tem explicação.',
    'O Clearlio inverte isso. Cada coisa que ele encontra vem com uma frase dizendo o que é aquilo, por que dá pra tirar e como aquilo volta. Nada sai sem você marcar. E o que sai não é apagado: é movido pra uma lixeira dele, onde fica trinta dias esperando você mudar de ideia.',
    'Ele também segura a própria mão. Se uma pasta de projeto tem trabalho que ainda não foi salvo no Git, ele não encosta nela — e escreve na tela por que deixou aquilo de fora.',
  ],
  imagem: {
    src: '/produtos/clearlio/tela.webp',
    alt: 'A tela inicial do Clearlio, com a pergunta "Por onde vamos começar?" e os lugares do computador que costumam acumular arquivo, cada um com uma explicação do que tem ali.',
    legenda: 'A primeira tela: os lugares que costumam acumular coisa, cada um explicado antes de você clicar.',
  },
  faz: [
    {
      titulo: 'Explica antes de limpar',
      texto:
        'Cada achado vem com uma frase em português dizendo o que é, por que dá pra tirar e como volta. Sem sigla, sem nome técnico, sem "arquivos temporários do sistema".',
    },
    {
      titulo: 'Tudo volta com um clique',
      texto:
        'O que sai vai pra uma lixeira própria e fica 30 dias. Desfazer devolve cada arquivo no lugar exato de onde saiu.',
    },
    {
      titulo: 'Segura a própria mão',
      texto:
        'Pasta de projeto com trabalho não salvo no Git, arquivo aberto, coisa do sistema: ele não encosta, e escreve na tela por que deixou de fora.',
    },
    {
      titulo: 'Você escolhe onde olhar',
      texto:
        'Uma tela com os lugares que costumam acumular coisa — o navegador, os programas do dia a dia, as sobras do Windows, os Downloads — e um botão pra cada um.',
    },
    {
      titulo: 'Acha a praga que o antivírus ignora',
      texto:
        'A página inicial que mudou sozinha, o atalho do navegador que abre propaganda antes, o programa que passou a ligar junto com o Windows. Ele mostra e ensina a tirar; não mexe em nada disso sozinho.',
    },
    {
      titulo: 'Português e inglês',
      texto: 'Troca o idioma sem fechar o programa. Ele começa no idioma do seu Windows.',
    },
  ],
  naoFaz: [
    'Não mexe no registro do Windows. Limpeza de registro não devolve espaço nem velocidade mensurável, e um erro ali quebra o computador de um jeito difícil de consertar.',
    'Não é antivírus, e não se apresenta como um. Ele confere se o Windows Defender está fazendo o trabalho dele, e aponta o que não tem explicação inocente num computador de casa.',
    'Não instala driver e não recomenda driver que você não precisa.',
    'Não fica rodando no fundo, não avisa nada, não abre junto com o Windows. Abre quando você chama e some quando você fecha.',
    'Não tem conta, não tem cadastro, não manda nada pra lugar nenhum. Nenhum dado sai da sua máquina.',
    'Não tem anúncio, não tem versão paga e não tem função trancada.',
  ],
  arquivos: [
    {
      id: 'instalador',
      nome: 'Instalador',
      arquivo: 'Clearlio-0.1.0-instalador.exe',
      tamanho: '2,1 MB',
      paraQuem:
        'O normal. Instala pro seu usuário sem pedir senha de administrador, põe o atalho no menu Iniciar e aparece em "Adicionar ou remover programas" como qualquer programa.',
      recomendado: true,
      hash: '0654fee37de50d30c250b8a842d5c35cebe0d7c43008fb68c862908ab89cad95',
    },
    {
      id: 'portatil',
      nome: 'Portátil',
      arquivo: 'Clearlio-0.1.0-portatil.exe',
      tamanho: '10 MB',
      paraQuem:
        'Não instala nada: roda direto, inclusive de pendrive. É o formato pra quem vai arrumar o computador de outra pessoa e não quer deixar programa instalado na máquina dela.',
      hash: '15b2449568b5365b496a9e3ec6025833857c475a37a2bbfce87b1adee1fb68a3',
    },
    {
      id: 'terminal',
      nome: 'Terminal',
      arquivo: 'clearlio-0.1.0-cli.exe',
      tamanho: '2,2 MB',
      paraQuem: 'A mesma coisa por linha de comando, pra quem prefere assim.',
      hash: '873326f960beed2b35659357baf2cace69483e6893ffdf8288df78f1f3c48129',
    },
  ],
  avisoDoWindows: {
    porque:
      'Este programa ainda não tem assinatura de código, então o Windows vai dizer "Editor desconhecido" na primeira vez que você abrir. Isso não quer dizer que tem alguma coisa errada com o arquivo: quer dizer que ninguém pagou o certificado que faz o Windows reconhecer quem publicou. Certificado é caro e é anual, e enquanto ele não existe o que a gente publica no lugar é o SHA-256 de cada arquivo, aqui embaixo — dá pra conferir que o que você baixou é exatamente o que saiu daqui.',
    passos: [
      {
        onde: 'No navegador, ao terminar de baixar',
        texto:
          'O Chrome e o Edge costumam esconder o arquivo dizendo que ele "não é baixado com frequência". Clique na setinha ao lado do download e escolha **Manter assim mesmo**. No Edge pode aparecer "Manter" e depois "Mostrar mais → Manter mesmo assim".',
      },
      {
        onde: 'Ao abrir o arquivo',
        texto:
          'O Windows mostra uma tela azul escrita "O Windows protegeu o seu PC". Clique em **Mais informações** — o aviso cresce e aparece um botão novo — e depois em **Executar assim mesmo**.',
      },
      {
        onde: 'Só isso',
        texto:
          'Esses dois cliques acontecem uma vez. Da segunda em diante o Windows não pergunta mais nada.',
      },
    ],
  },
  codigoAberto: false,
};

const PLANILHA_ID = '1p9PekmcDt7nGOPetWt_pbwstjwBw899_VhAZRnUDjcs';

export const planilhaFinanceira: Planilha = {
  tipo: 'planilha',
  id: 'planilha-financeira',
  nome: 'Planilha de Controle Financeiro',
  simbolo: 'planilha',
  rota: ROTAS.produtoPlanilhaFinanceira,
  estado: 'ATIVO · GRATUITO',
  lema: 'Saber pra onde o seu dinheiro foi, sem virar contador.',
  resumo:
    'Uma planilha de controle financeiro pessoal, pronta pra usar. Você cadastra uma vez o que se repete todo mês, lança o resto conforme acontece, e o painel se vira sozinho. Tire uma cópia pro seu Google Drive, ou baixe em Excel.',
  descricao: [
    'Quase toda planilha de finanças que existe por aí é um de dois extremos: ou é uma folha em branco com três colunas, que não ajuda em nada, ou é um monstro de vinte abas com fórmula que ninguém entende — e que a pessoa abandona na segunda semana.',
    'Esta fica no meio. Ela tem o que faz diferença de verdade — o que entra, o que sai, o que se repete todo mês, a fatura do cartão separada das contas fixas, as metas com prazo — e para por aí. As contas se fazem sozinhas.',
    'A primeira aba é uma página de instruções que se lê uma vez e não se lê mais. Ela também diz o que fazer se alguma coisa parar de funcionar, o que é raro numa planilha e faz falta em todas.',
  ],
  imagem: {
    src: '/produtos/planilha-financeira/tela.webp',
    alt: 'A primeira aba da planilha, com os quatro passos para começar, o que cada uma das seis abas faz, e três regras de uso.',
    legenda:
      'A primeira aba: quatro passos pra começar, o que cada aba faz, e três regras. Lê uma vez e não lê mais.',
  },
  faz: [
    {
      titulo: 'O que se repete, você digita uma vez',
      texto:
        'Salário, aluguel, luz, faculdade: entra na aba Plano uma vez. Ao escolher o mês no Painel, essas linhas aparecem sozinhas nos Lançamentos, com data, categoria e valor. Se a luz veio diferente, você corrige o valor ali.',
    },
    {
      titulo: 'O painel se vira sozinho',
      texto:
        'Escolha o mês e ele mostra entradas, saídas, quanto sobrou, a taxa de economia, pra onde foi o dinheiro, o planejado contra o realizado e o que vence nos próximos dias.',
    },
    {
      titulo: 'Cartão é fatura, não conta fixa',
      texto:
        'Uma aba só pro cartão, com faturas por competência e parcelamentos, mostrando quanto ainda falta pagar. Misturar isso com as contas fixas é o erro que faz a conta do mês nunca fechar.',
    },
    {
      titulo: 'Metas com prazo',
      texto: 'A reserva de emergência e os objetivos com data, pra você ver se está no caminho.',
    },
    {
      titulo: 'O ano inteiro lado a lado',
      texto:
        'Os doze meses numa tela só, com a taxa de economia de cada um. É o número que diz se você está evoluindo — e é onde dá pra ver isso de um relance.',
    },
    {
      titulo: 'Categoria em tudo',
      texto:
        'Cada lançamento leva uma categoria, e é ela que responde "pra onde foi o dinheiro". Sem categoria o movimento não aparece no gráfico.',
    },
  ],
  abas: [
    { nome: 'Início', texto: 'As instruções. Leia uma vez; depois é só usar.' },
    { nome: 'Painel', texto: 'Resumo do mês escolhido. Aqui só se troca o mês e o ano.' },
    { nome: 'Lançamentos', texto: 'O caderno. As fixas entram sozinhas; o resto você digita.' },
    { nome: 'Plano', texto: 'O que se repete todo mês. Cadastra uma vez, revisa quando um valor mudar.' },
    { nome: 'Cartões', texto: 'Faturas por competência e parcelamentos, com quanto ainda falta pagar.' },
    { nome: 'Metas', texto: 'A reserva de emergência e os objetivos com prazo.' },
    { nome: 'Ano', texto: 'Os 12 meses lado a lado e a taxa de economia de cada um.' },
  ],
  comoUsar: [
    {
      passo: 'Cadastre o Plano',
      texto:
        'Na aba Plano, liste o que se repete todo mês: salário, aluguel, luz, faculdade. É uma vez só. Escolha a categoria de cada item — é ela que alimenta o gráfico.',
    },
    {
      passo: 'Troque o mês no Painel',
      texto:
        'Ao escolher um mês, as fixas do Plano entram sozinhas em Lançamentos, com data, categoria e valor. Se a luz veio diferente, corrija o valor ali.',
    },
    {
      passo: 'Lance o que não é fixo',
      texto:
        'Mercado, farmácia, lazer: uma linha por movimento na aba Lançamentos. Data, descrição, categoria e o valor em Entrada ou em Saída.',
    },
    {
      passo: 'Olhe o Painel e o Ano',
      texto:
        'Tudo se calcula sozinho. O Painel mostra o mês; o Ano mostra os 12 meses e a taxa de economia — o número que diz se você está evoluindo.',
    },
  ],
  regras: [
    {
      titulo: 'Categoria em tudo',
      texto:
        'Lançamento sem categoria não aparece no gráfico. É a categoria que responde pra onde o dinheiro foi — e essa é a pergunta que fez você abrir a planilha.',
    },
    {
      titulo: 'Cartão é fatura, não conta fixa',
      texto:
        'Lance a fatura no dia em que ela vence, com categoria Cartão. O detalhe das compras fica na aba Cartões. A fatura muda todo mês; tratar ela como conta fixa faz a planilha parecer quebrada.',
    },
    {
      titulo: 'A taxa de economia importa mais que o saldo',
      texto:
        'Saldo sobe quando o salário sobe. A porcentagem mostra comportamento. Acima de 30% é um bom lugar pra estar.',
    },
  ],
  links: {
    copiar: `https://docs.google.com/spreadsheets/d/${PLANILHA_ID}/copy`,
    excel: `https://docs.google.com/spreadsheets/d/${PLANILHA_ID}/export?format=xlsx`,
  },
  /**
   * A diferença entre as duas versões, dita antes de a pessoa escolher.
   *
   * A planilha tem um script que preenche as contas fixas sozinho quando você troca o mês.
   * Script é do Google Sheets: ele não atravessa a exportação pro Excel. As 112 fórmulas
   * atravessam — conferi abrindo o arquivo exportado — então a versão do Excel calcula
   * tudo igual; o que ela perde é o preenchimento automático das fixas, que passa a ser
   * digitado. Não dizer isso seria deixar a pessoa descobrir sozinha depois de escolher.
   */
  diferencaDoExcel:
    'A versão do Excel calcula tudo igual — as fórmulas vão junto. O que não vai é o script que preenche as contas fixas sozinho quando você troca de mês: no Excel, essas linhas você digita. Se isso for importante pra você, prefira a cópia no Google.',
};

export const produtos: readonly Produto[] = [clearlio, planilhaFinanceira];
