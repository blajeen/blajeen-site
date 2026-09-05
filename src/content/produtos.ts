import { ROTAS } from '@/lib/routes';

/**
 * Aplicativos de computador do estúdio.
 *
 * Categoria própria porque não é jogo nem SaaS: é programa que a pessoa baixa e roda na
 * máquina dela, sem conta e sem servidor no meio. Isso muda tudo o que a página precisa
 * dizer — em vez de preço e plano, ela precisa dizer o que o programa faz com os
 * arquivos de quem instalou, e como desfazer.
 */

/**
 * Onde os arquivos ficam hospedados.
 *
 * O código do Clearlio é fechado, e anexo de release em repositório privado não é
 * baixável sem login — então os binários moram num repositório público separado, que
 * guarda só os arquivos, os hashes e o texto de quem vai baixar. O código continua onde
 * estava.
 *
 * A URL aponta para a etiqueta da versão, e não para `latest`, porque o nome de cada
 * arquivo carrega o número da versão: apontar para `latest` daria 404 no dia em que
 * saísse a 0.2.0. Versão nova, uma linha para trocar aqui — junto dos hashes, que também
 * mudam.
 */
export const BASE_DE_DOWNLOAD =
  'https://github.com/blajeen/clearlio-download/releases/download/v0.1.0';

/** A página de todas as versões, para quem quiser uma anterior ou conferir o histórico. */
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

export type Produto = {
  id: string;
  nome: string;
  versao: string;
  rota: string;
  estado: string;
  /** Sistema mínimo, escrito como a pessoa reconhece. */
  requisitos: string;
  lema: string;
  resumo: string;
  descricao: readonly string[];
  /** O que ele faz. Cada item é verificável abrindo o programa. */
  faz: readonly { titulo: string; texto: string }[];
  /** O que ele se recusa a fazer, e por quê. É a parte que decide a confiança. */
  naoFaz: readonly string[];
  arquivos: readonly ArquivoParaBaixar[];
  /** Uma imagem do programa rodando. Print de verdade, não montagem. */
  imagem: { src: string; alt: string; legenda: string };
  /**
   * O aviso do Windows, dito antes de a pessoa esbarrar nele.
   *
   * Sem assinatura de código, o Windows e o navegador vão barrar o download e dar medo
   * em quem não é técnico — justo o público deste programa. Explicar depois não serve:
   * quem se assusta fecha a aba e não volta. Então a explicação fica na mesma tela do
   * botão, com o nome exato de cada botão que a pessoa vai ter que clicar.
   */
  avisoDoWindows: {
    porque: string;
    passos: readonly { onde: string; texto: string }[];
  };
  codigoAberto: boolean;
};

export const clearlio: Produto = {
  id: 'clearlio',
  nome: 'Clearlio',
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
  imagem: {
    src: '/produtos/clearlio/tela.webp',
    alt: 'A tela inicial do Clearlio, com a pergunta "Por onde vamos começar?" e os lugares do computador que costumam acumular arquivo, cada um com uma explicação do que tem ali.',
    legenda: 'A primeira tela: os lugares que costumam acumular coisa, cada um explicado antes de você clicar.',
  },
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

export const produtos: readonly Produto[] = [clearlio];
