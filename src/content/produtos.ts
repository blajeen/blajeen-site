import type { ProductIconId } from '@/components/projects/ProductIcon';
import { ROTAS } from '@/lib/routes';

/**
 * Produtos do estúdio: coisa que a pessoa leva pra máquina dela e usa.
 *
 * Categoria própria porque não é jogo nem SaaS. Isso muda o que a página precisa dizer:
 * em vez de prometer uma experiência abstrata, ela precisa explicar como o produto é entregue,
 * onde ficam os arquivos e, quando houver serviço remoto, exatamente em que momento ele é usado.
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
  'https://github.com/blajeen/clearlio-download/releases/download/v0.2.0';

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
  /**
   * O terceiro caderno, quando o produto tem um que precisa de explicação própria.
   *
   * A lista de coisas pra fazer não cabe na vitrine (`faz`) por um motivo: o formato do
   * arquivo é metade da promessa. Dizer "tem lista de tarefas" e não mostrar que ela é
   * Markdown de caixinhas, legível no Bloco de Notas, é esconder justamente a parte que
   * separa este produto de qualquer aplicativo de tarefas com banco de dados próprio.
   */
  lista?: {
    titulo: string;
    resumo: string;
    detalhes: readonly string[];
    exemplo: { arquivo: string; texto: string };
    fecho: string;
  };
  /**
   * O pedido de contribuição, quando existe.
   *
   * Ganha bloco no fim da página, e não um botão no alto, porque a ordem é a mesma que o
   * programa usa: primeiro o que ele faz e o que ele custa (nada), e só então o pedido.
   * Um pedido antes da entrega é cobrança.
   */
  apoiar?: {
    titulo: string;
    texto: string;
    canais: readonly { nome: string; valor: string }[];
    fecho: readonly string[];
  };
  /**
   * A anotação à parte que dá pra trancar, e o preço de trancar.
   *
   * Ganha bloco próprio na página porque é a única coisa do programa que cobra algo da
   * pessoa em troca: a senha sem recuperação, e as versões anteriores que somem. Enterrar
   * isso numa lista de recursos seria vender a parte boa e esconder a conta.
   */
  gaveta?: {
    titulo: string;
    resumo: string;
    avisos: readonly { titulo: string; texto: string }[];
    fecho: string;
  };
  /**
   * Onde ficam os arquivos que a pessoa cria, e por que isso importa.
   *
   * Só existe em produto que guarda alguma coisa da pessoa. O Clearlio não guarda nada
   * dela — ele tira coisa do lugar —, então não preenche este campo.
   */
  ondeFicam?: {
    titulo: string;
    texto: string;
    /**
     * A pasta desenhada, quando a lista de arquivos passou de dois ou três.
     *
     * Prosa dá conta de "um texto.txt e uma tabela.csv". Não dá conta de quatro cadernos
     * numerados, mais a gaveta, mais as versões anteriores: aí a pessoa precisa ver a
     * forma da pasta, e não ler a descrição dela.
     */
    arvore?: readonly string[];
  };
  /**
   * As promessas que organizam a página, quando o produto tem uma lista dessas.
   *
   * O Clearlio organiza a dele pelo posicionamento; o Notalio nasceu com cinco promessas
   * escritas, e são elas que dizem o que ele é.
   */
  /**
   * A `excecao` existe pra promessa que tem uma, e ela mora colada na promessa.
   *
   * Promessa com exceção escrita noutro lugar da página é promessa quebrada: quem lê a
   * lista e para ali sai com a informação errada.
   */
  promessas?: readonly { titulo: string; texto: string; excecao?: string }[];
  /**
   * O buraco conhecido, medido, dito antes de a pessoa esbarrar nele.
   *
   * Todo programa tem um. Publicar o do produto ao lado das promessas é o que separa uma
   * promessa de uma propaganda: quem lista só as duas primeiras está escondendo a
   * terceira.
   */
  naoPromete?: { titulo: string; texto: string };
  /** Os atalhos de teclado, pra quem já usa e quer ir rápido. */
  atalhos?: readonly { teclas: string; faz: string }[];
  /**
   * O guia: cada botão do programa, o que ele faz e o atalho dele.
   *
   * A lista de vitrine (`faz`) responde "por que eu ia querer isso". O guia responde
   * "o que é esse botãozinho aqui" — que é a pergunta de quem já baixou. As duas coisas
   * são diferentes, e juntar numa lista só deixa as duas piores.
   */
  guia?: readonly {
    grupo: string;
    nota?: string;
    itens: readonly { nome: string; teclas?: string; texto: string }[];
  }[];
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
  };
};

/**
 * Um site: não se baixa, se visita.
 *
 * Ele entra nesta página e não na de projetos porque compartilha com os outros dois o
 * que a página promete — sem conta, sem mensalidade, sem função trancada. O que ele não
 * compartilha é o "fica com você" literal: o que fica na máquina da pessoa são os
 * favoritos dela, guardados no próprio aparelho e em mais lugar nenhum.
 */
export type Site = Comum & {
  tipo: 'site';
  /**
   * Onde ele está no ar, ou `null` enquanto não estiver.
   *
   * `null` de propósito, e não uma string vazia: um endereço vazio vira um link que não
   * leva a lugar nenhum, e a página precisa poder decidir entre mostrar um botão e
   * mostrar uma frase dizendo que ainda não dá.
   */
  endereco: string | null;
  /** O que ele se recusa a fazer, como nos programas. */
  naoFaz: readonly string[];
  /** O tamanho da base, em números que dá pra conferir abrindo o site. */
  numeros: readonly { valor: string; rotulo: string }[];
  /**
   * O que ainda não está pronto, dito aqui e não descoberto lá dentro.
   *
   * Um produto que se apresenta antes de estar completo tem duas saídas: esconder o que
   * falta, ou dizer. A segunda é a única que continua valendo quando a pessoa chegar na
   * parte que falta.
   */
  aindaNao: { titulo: string; texto: string };
};

export type Produto = Aplicativo | Planilha | Site;

export const clearlio: Aplicativo = {
  tipo: 'aplicativo',
  id: 'clearlio',
  nome: 'Clearlio',
  simbolo: 'limpeza',
  versao: '0.2.0',
  rota: ROTAS.produtoClearlio,
  estado: 'ATIVO · GRATUITO',
  requisitos: 'Windows 10 ou 11, 64 bits',
  lema: 'Limpeza de verdade. Sem susto, sem cobrança, sem letra miúda.',
  resumo:
    'Acha o que não serve mais no seu computador, explica em português o que é cada coisa, e limpa só o que você mandar. Nada é apagado: vai pra uma lixeira dele, fica 30 dias, e volta inteiro com um clique. Também desinstala programa de verdade, mostra o que abre junto com o Windows e confere o antivírus que você já tem.',
  descricao: [
    'A maioria dos limpadores de disco funciona no escuro: eles varrem, mostram um número grande, e você aperta um botão confiando que nada importante vai junto. Quando alguma coisa quebra, não tem volta e não tem explicação.',
    'O Clearlio inverte isso. Cada coisa que ele encontra vem com uma frase dizendo o que é aquilo, por que dá pra tirar e como aquilo volta. Nada sai sem você marcar. E o que sai não é apagado: é movido pra uma lixeira dele, onde fica trinta dias esperando você mudar de ideia.',
    'Ele também segura a própria mão. Se uma pasta de projeto tem trabalho que ainda não foi salvo no Git, ele não encosta nela — e escreve na tela por que deixou aquilo de fora.',
    'E ele deixou de ser só um limpador. Desinstalar um programa por completo, ver o que liga junto com o Windows, conferir o Defender, tirar os avisos que os sites ganharam permissão de mandar, trocar enfeite por velocidade — tudo isso mora nele agora, cada coisa na sua tela, e tudo com desfazer.',
  ],
  imagem: {
    src: '/produtos/clearlio/tela.webp',
    alt: 'A tela inicial do Clearlio, com a pergunta "Por onde vamos começar?" e os lugares do computador que costumam acumular arquivo, cada um com uma explicação do que tem ali. À esquerda, o trilho com as seis seções do programa e, ao lado dele, a seção aberta por inteiro.',
    legenda: 'A primeira tela. À esquerda, as seis seções do programa sempre à vista — nada fica atrás de um clique.',
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
      titulo: 'Desinstala de verdade',
      texto:
        'Chama o desinstalador do fabricante e, quando ele termina, vai atrás da pasta, dos dados e das anotações que ficaram no Windows. O Painel de Controle para na primeira parte — é por isso que sobra tanta coisa de programa que você já tirou.',
    },
    {
      titulo: 'Mostra o que abre com o Windows',
      texto:
        'Tudo que liga junto com o sistema, com o nome de quem é de verdade e não a sigla. Você desliga o que não precisa, e desligar não desinstala nada.',
    },
    {
      titulo: 'Confere o antivírus que você já tem',
      texto:
        'Se o Windows Defender está ligado, se as definições estão em dia e quando foi a última verificação — e manda ele verificar daqui. Não instala antivírus nenhum.',
    },
    {
      titulo: 'Avisos e extensões do navegador',
      texto:
        'Os sites que ganharam permissão de te mandar notificação, quase sempre sem você perceber que deu, e as extensões instaladas em cada navegador. Aviso ele tira; extensão ele só mostra, porque tirar por fora estraga o navegador.',
    },
    {
      titulo: 'Troca enfeite por velocidade',
      texto:
        'Desliga animação, transparência e gravação de fundo, e troca o plano de energia. Ajuda mais em computador antigo do que em novo, e tem desfazer pra tudo. Não promete número de quadro por segundo, porque não dá pra prometer.',
    },
    {
      titulo: 'Uma lista do que ele não pode tocar',
      texto:
        'Você escreve o que é intocável, e aquilo fica de fora de toda limpeza — sem exceção, nem se você mandar limpar a pasta que tem aquilo dentro.',
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
      arquivo: 'Clearlio-0.2.0-instalador.exe',
      tamanho: '2,3 MB',
      paraQuem:
        'O normal. Instala pro seu usuário sem pedir senha de administrador, põe o atalho no menu Iniciar e aparece em "Adicionar ou remover programas" como qualquer programa.',
      recomendado: true,
      hash: 'fa5863200e68bdc9c2c39aa7a367ddb2c875c64d08886074023315ab844452b6',
    },
    {
      id: 'portatil',
      nome: 'Portátil',
      arquivo: 'Clearlio-0.2.0-portatil.exe',
      tamanho: '10,9 MB',
      paraQuem:
        'Não instala nada: roda direto, inclusive de pendrive. É o formato pra quem vai arrumar o computador de outra pessoa e não quer deixar programa instalado na máquina dela.',
      hash: '3741db24467f06c8181bbeccb87566e3e86445ce4f4437caeee3ce216e96b968',
    },
    {
      id: 'terminal',
      nome: 'Terminal',
      arquivo: 'clearlio-0.2.0-cli.exe',
      tamanho: '2,4 MB',
      paraQuem: 'A mesma coisa por linha de comando, pra quem prefere assim.',
      hash: '0ce3a342e3a6bd06333bd4b53f0b31664ed5001b4fb74e40414a92bae6c62fd3',
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

const PLANILHA_ID = '1Cn21INdvyvpJwAPQZitDBdPSrVeX0yx0afSFjn7L_wQ';

export const planilhaFinanceira: Planilha = {
  tipo: 'planilha',
  id: 'planilha-financeira',
  nome: 'Planilha de Controle Financeiro',
  simbolo: 'planilha',
  rota: ROTAS.produtoPlanilhaFinanceira,
  estado: 'ATIVO · LICENÇA POR E-MAIL',
  lema: 'Saber pra onde o seu dinheiro foi, sem virar contador.',
  resumo:
    'Uma planilha de controle financeiro pessoal, pronta pra usar no Google Sheets. Solicite sua licença por e-mail, receba o código de ativação e então faça uma cópia no seu próprio Google Drive.',
  descricao: [
    'Quase toda planilha de finanças que existe por aí é um de dois extremos: ou é uma folha em branco com três colunas, que não ajuda em nada, ou é um monstro de vinte abas com fórmula que ninguém entende — e que a pessoa abandona na segunda semana.',
    'Esta fica no meio. Ela tem o que faz diferença de verdade — o que entra, o que sai, o que se repete todo mês, a fatura do cartão separada das contas fixas, as metas com prazo — e para por aí. As contas se fazem sozinhas.',
    'A primeira aba é uma página de instruções que se lê uma vez e não se lê mais. A automação usa uma licença emitida pela Blajeen: quando você pede uma ação automatizada, a planilha envia ao serviço da Blajeen somente os dados necessários para validar a licença e executar aquela ação.',
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
  },
};

const NOTALIO_DOWNLOAD = 'https://github.com/blajeen/notalio-download/releases';

/** Base dos arquivos do Notalio. Mesma regra do Clearlio: aponta pra etiqueta da versão. */
export const BASE_DE_DOWNLOAD_NOTALIO =
  'https://github.com/blajeen/notalio-download/releases/download/v0.2.0';

export const notalio: Aplicativo = {
  tipo: 'aplicativo',
  id: 'notalio',
  nome: 'Notalio',
  simbolo: 'notas',
  versao: '0.2.0',
  rota: ROTAS.produtoNotalio,
  estado: 'ATIVO · GRATUITO',
  requisitos: 'Windows 10 ou 11, 64 bits',
  lema: 'Escreve e pronto. Eu guardo sozinho, e o arquivo é seu.',
  resumo:
    'Um bloco de notas simples e leve pra Windows, com três cadernos que se alternam por um interruptor: texto corrido, tabela de duas colunas e lista de coisas pra fazer. A folha se parte em até quatro blocos, e tem uma gaveta à parte que dá pra trancar com senha. Ele guarda sozinho — não tem botão de salvar, não tem conta e não abre junto com o Windows.',
  descricao: [
    'Bloco de notas costuma pedir uma coisa estranha da pessoa: lembrar de salvar. É um pedido antigo, que sobrou de uma época em que gravar no disco era caro, e que hoje só serve pra fazer alguém perder meia hora de escrita por ter fechado a janela sem pensar.',
    'O Notalio não pede isso. Você escreve, ele guarda — sete décimos de segundo depois que você para de digitar. Fechar a janela, trocar de caderno ou clicar fora guardam na hora.',
    'E o que ele guarda são arquivos comuns, numa pasta que você acha sozinho: um texto.txt, uma tabela.csv e um checklist.md, dentro de Documentos. Se o Notalio sumir do mundo amanhã, os três continuam abrindo — o texto no Bloco de Notas do Windows, a tabela no Excel, e a lista em qualquer coisa que leia Markdown, inclusive o próprio Bloco de Notas.',
  ],
  imagem: {
    src: '/produtos/notalio/notalio-1-texto.webp',
    alt: 'A janela do Notalio no caderno de texto, com a folha partida em dois blocos numerados no canto. No alto, o interruptor de três posições — texto, tabela e lista — com "texto" aceso em verde. No texto, os números aparecem numa cor própria, a pontuação num cinza-azulado, e há trechos com marca-texto e trechos riscados.',
    legenda:
      'O caderno de texto, com a folha partida em dois. Cada bloco tem barra de rolagem, arquivo e história próprios — e os números e a pontuação saem em cores próprias, em qualquer tema.',
  },
  faz: [
    {
      titulo: 'Um interruptor, e só',
      texto:
        'Ele troca entre os três cadernos: texto, tabela e lista. É o gesto central do programa e a única navegação que existe nele. A cor da janela inteira muda junto — verde-limão no texto, azul na tabela, roxo na lista — pra você saber onde está sem precisar ler.',
    },
    {
      titulo: 'Três cadernos separados de verdade',
      texto:
        'O que está escrito num não aparece no outro, e cada um tem a própria história de versões. São três cadernos dividindo a mesma janela, não três vistas da mesma anotação.',
    },
    {
      titulo: 'A tabela abre no Excel',
      texto:
        'Duas colunas com linhas de grade visíveis. Vírgula, aspas e quebra de linha dentro de uma célula são tratadas certo — e um arquivo salvo pelo Excel em português, que usa ponto e vírgula, continua abrindo.',
    },
    {
      titulo: 'Arruma sem mudar a sua ordem',
      texto:
        'Tira linha repetida, deixa todo marcador de lista igual e aperta o espaçamento. Num brainstorm a ordem é o seu pensamento, e ele nunca mexe nela.',
    },
    {
      titulo: 'Lista, marca-texto e limpar',
      texto:
        'Vira as linhas em lista com marcadores ou numerada. Destaca um trecho com um retângulo cinza atrás das letras — e essa marca fica dentro do arquivo, entre crases, então ela sobrevive a fechar o programa e continua abrindo no Bloco de Notas. E um botão que limpa tudo isso de volta.',
    },
    {
      titulo: 'Riscar, e o risco fica no arquivo',
      texto:
        'Ctrl+R, do lado do marca-texto: um til de cada lado dentro do arquivo. É texto puro, então o risco sobrevive a fechar o programa e continua lá quando você abre o arquivo em qualquer outro lugar.',
    },
    {
      titulo: 'A letra é do jeito que você quiser',
      texto:
        'Quatro cores de letra, uma escolha por caderno. Os números sempre saem numa cor própria, com qualquer tema e qualquer cor de letra — porque número no meio do texto é o que o olho procura primeiro. E a pontuação sai num cinza-azulado de propósito: ela é o esqueleto da frase, não o conteúdo dela, e com uma cor forte o olho pularia pras vírgulas.',
    },
    {
      titulo: 'Acha e troca o que você quiser',
      texto:
        'Uma lupa do lado do interruptor abre o localizar, com contador de resultados e setas pra andar entre eles. Do lado, substituir um por um ou todos de uma vez — e substituir todos guarda uma versão anterior antes de mexer.',
    },
    {
      titulo: 'Trazer e levar',
      texto:
        'Traz um arquivo de fora pra dentro (.txt, .md, .markdown, .text, .log) sem nunca tocar no arquivo de origem, e leva uma cópia pra onde você escolher. Tem também uma foto da janela, que sai em JPEG direto na Área de trabalho.',
    },
    {
      titulo: 'A folha se parte em até quatro',
      texto:
        'O botão de divisão, na direita, parte a folha em 2, 3 ou 4 blocos — nos três cadernos. Cada bloco tem barra de rolagem, arquivo e história de versões próprios: não é o mesmo texto visto de quatro jeitos, são quatro anotações lado a lado. O bloco 1 continua se chamando texto.txt, então quem já usava não vê nada mudar de lugar.',
    },
    {
      titulo: 'O ícone é o estado',
      texto:
        'O desenho da divisão mostra em quantos pedaços a folha está, sem rótulo nenhum. E o botão de salvar txt pergunta de qual bloco — com quatro textos na tela, adivinhar errado quer dizer você abrir o arquivo depois e encontrar outra coisa.',
    },
    {
      titulo: 'Uma gaveta à parte',
      texto:
        'O pergaminho, grudado no interruptor, abre uma anotação separada: pro que você não quer no meio do resto. Escreve, fecha, e ela volta pro lugar. Dá pra trancar com senha — está explicado aqui embaixo, com o que isso custa.',
    },
    {
      titulo: 'Português e inglês, claro e escuro',
      texto:
        'Troca o idioma sem reiniciar, e o tema também. Ele começa no idioma do seu Windows.',
    },
    {
      titulo: 'Voltar ao padrão de fábrica',
      texto:
        'Na tela Sobre. Volta tema, idioma, divisão da folha e cor da letra — e não encosta em nenhuma palavra escrita, nem apaga nenhuma versão anterior.',
    },
  ],
  lista: {
    titulo: 'A lista de coisas pra fazer',
    resumo:
      'O terceiro caderno. Uma lista com subtarefa, prioridade, prazo e quanto já foi feito — e com a mesma divisão em blocos dos outros dois.',
    detalhes: [
      'A subtarefa entra pelo botão de seta ou com Tab. Reordenar é arrastar pelo punho, e arrastar o item de cima leva as subtarefas junto — o que estava dentro de uma tarefa continua dentro dela.',
      'Prioridade e prazo são etiquetas ao lado do item. Prazo vencido fica em âmbar, que é a única cor de alarme do programa inteiro.',
      'A porcentagem é contada das caixas na hora, e nunca guardada. Um número guardado pode discordar do que você está vendo na tela, e aí ele deixa de ser informação e vira ruído.',
    ],
    exemplo: {
      arquivo: 'checklist.md',
      texto:
        '- [ ] Fechar o orçamento da gráfica !alta @2026-09-12\n  - [x] Pedir as três cotações\n  - [ ] Comparar prazo de entrega\n- [x] Enviar o contrato assinado',
    },
    fecho:
      'É Markdown de verdade — a mesma lista de caixinhas que o GitHub e o Obsidian desenham. Abre no Bloco de Notas e se lê inteiro, sem programa nenhum no meio.',
  },
  gaveta: {
    titulo: 'A gaveta, e o que trancar ela custa',
    resumo:
      'Um pergaminho grudado no interruptor. Abre por cima, escreve, fecha — pro que você não quer no meio do resto. O botão da direita nela é colocar senha: aí o arquivo é fechado com Argon2id e XChaCha20-Poly1305 — nada inventado por mim — e ninguém lê o que está dentro sem a senha, inclusive eu.',
    avisos: [
      {
        titulo: 'Não existe recuperação',
        texto: 'Esqueceu a senha, acabou. Não tem segunda chave.',
      },
      {
        titulo: 'Trancar apaga as versões anteriores da gaveta',
        texto:
          'Elas ficam em texto aberto na pasta, e trancar a porta com a janela aberta não é trancar.',
      },
      {
        titulo: 'Sem senha, a gaveta é um arquivo de texto comum',
        texto: 'Ela serve pra separar, não pra esconder.',
      },
    ],
    fecho:
      'A senha não é guardada em lugar nenhum. A chave fica na memória enquanto a gaveta está aberta, e some quando ela fecha. Estas três linhas também estão escritas dentro do programa, antes do clique e não depois.',
  },
  ondeFicam: {
    titulo: 'Os seus arquivos são arquivos de verdade',
    texto:
      'Nada de formato só dele: os três abrem em qualquer programa. E desinstalar não leva isso junto — moram fora da pasta do programa, de propósito. Quando a folha está partida, cada bloco ganha o próprio arquivo numerado.',
    arvore: [
      'Documentos\\Notalio\\',
      '├── texto.txt        texto 2.txt   texto 3.txt   texto 4.txt',
      '├── tabela.csv       tabela 2.csv  …',
      '├── checklist.md     checklist 2.md …',
      '├── gaveta.txt       ← trancada, ela mesma diz que está trancada',
      '└── Versões anteriores\\',
    ],
  },
  promessas: [
    {
      titulo: 'Você nunca perde o que escreveu',
      texto:
        'Ele guarda sozinho, sete décimos de segundo depois que você para de digitar. Fechar a janela, trocar de caderno ou clicar fora guardam na hora. Na tela Sobre tem "voltar ao padrão de fábrica", que volta tema, idioma, divisão da folha e cor da letra — sem encostar em nenhuma palavra escrita e sem apagar nenhuma versão anterior.',
    },
    {
      titulo: 'O arquivo é um arquivo de verdade',
      texto:
        'Documentos\\Notalio\\texto.txt, tabela.csv e checklist.md. Se o Notalio sumir do mundo amanhã, os três continuam abrindo: o texto e a lista no Bloco de Notas do Windows, a tabela no Excel.',
      excecao:
        'A gaveta com senha é a única exceção, e ela é escolha sua: o arquivo continua sendo um .txt que abre no Bloco de Notas, e a primeira coisa que ele diz é o que ele é — que está trancado, com o quê, e que não existe segunda chave. O que não dá pra ler é só o conteúdo.',
    },
    {
      titulo: 'Dá pra voltar atrás',
      texto:
        'Escrever por cima guarda o de antes, numa pasta "Versões anteriores" ao lado dos arquivos. Trazer uma versão de volta também guarda o de agora — nem isso é caminho sem volta. Até 100 por caderno.',
    },
    {
      titulo: 'Sem conta, sem nuvem, sem rastreamento',
      texto: 'Não existe uma linha de rede no programa.',
    },
    {
      titulo: 'Não enche o saco',
      texto:
        'Não abre junto com o Windows, não tem atualizador, não conta quantas vezes você usou e não pede avaliação.',
    },
  ],
  apoiar: {
    titulo: 'Apoiar',
    texto:
      'O Notalio é de graça e vai continuar sendo. Nada fica trancado esperando alguém pagar. Quem quiser ajudar tem um botão "de graça · apoiar" no rodapé do programa — e ele fica quieto ali: nunca abre sozinho, nunca depois de um número de usos, nunca ao fechar.',
    canais: [
      { nome: 'Pix', valor: 'brg.ftw@gmail.com' },
      { nome: 'PayPal', valor: 'brenoricardoudi@yahoo.com.br' },
    ],
    fecho: [
      'O QR do Pix é desenhado na sua máquina. Nem pra pedir doação este programa fala com a internet — um pedido de doação que sabe quem pensou em doar é pior do que não pedir.',
      'E não existe valor sugerido: quem paga escolhe quanto.',
    ],
  },
  naoPromete: {
    titulo: 'E o que ele não promete',
    texto:
      'Se faltar luz naqueles sete décimos de segundo entre a última tecla e a hora em que ele grava, essas últimas palavras não chegaram no disco. É o único buraco que existe, está medido, e está escrito dentro do próprio programa. Uma promessa que esconde a exceção não é promessa.',
  },
  guia: [
    {
      grupo: 'O interruptor',
      nota: 'Fica no meio da barra de cima. É a única navegação do programa.',
      itens: [
        {
          nome: 'texto / tabela',
          teclas: 'Ctrl+Tab',
          texto:
            'Passa pelos três cadernos, em ordem. A cor da janela inteira muda junto — verde-limão no texto, azul na tabela, roxo na lista — pra você saber onde está sem precisar ler. O que estava escrito fica guardado antes da troca.',
        },
      ],
    },
    {
      grupo: 'A lupa, do lado do interruptor',
      itens: [
        {
          nome: 'Localizar e substituir',
          teclas: 'Ctrl+F',
          texto:
            'Abre a busca, com um contador de quantos resultados apareceram e setas pra andar de um pro outro. Do lado dela dá pra substituir um por um, ou todos de uma vez — e substituir todos guarda uma versão anterior antes de mexer, pra você poder voltar atrás.',
        },
      ],
    },
    {
      grupo: 'O pergaminho, grudado no interruptor',
      itens: [
        {
          nome: 'A gaveta',
          teclas: 'Ctrl+G',
          texto:
            'Abre uma anotação à parte, pro que você não quer no meio do resto. Escreve, fecha, e ela volta pro lugar. O botão da direita dentro dela coloca senha.',
        },
      ],
    },
    {
      grupo: 'A barra de cima, da esquerda pra direita',
      itens: [
        {
          nome: 'Desfazer e avançar',
          teclas: 'Ctrl+Z e Ctrl+Y',
          texto:
            'Cada caderno tem a própria pilha, então desfazer no texto não mexe na tabela.',
        },
        {
          nome: 'Arrumar',
          teclas: 'Ctrl+E',
          texto:
            'Tira linha repetida, deixa todo marcador de lista igual e aperta o espaçamento. Nunca muda a ordem do que você escreveu — se não gostar, é só desfazer.',
        },
        {
          nome: 'Lista',
          teclas: 'Ctrl+L, ou Shift+Ctrl+L',
          texto:
            'Vira as linhas que você marcou numa lista numerada — 1-, 2-, 3-. Com Shift, a lista sai com marcadores em vez de números.',
        },
        {
          nome: 'Limpar a formatação',
          teclas: 'Ctrl+D',
          texto: 'Tira as marcas e a formatação do trecho, deixando o texto puro de novo.',
        },
        {
          nome: 'Marca-texto',
          teclas: 'Ctrl+M',
          texto:
            'Destaca o trecho com um retângulo cinza atrás das letras. A marca fica dentro do arquivo, escrita entre crases: ela sobrevive a fechar o programa, e o arquivo continua abrindo no Bloco de Notas do Windows.',
        },
        {
          nome: 'Trazer um arquivo',
          teclas: 'Ctrl+O',
          texto:
            'Traz o conteúdo de um .txt, .md, .markdown, .text ou .log pra dentro do caderno. O arquivo de origem nunca é tocado.',
        },
        {
          nome: 'Salvar uma cópia',
          teclas: 'Ctrl+S',
          texto:
            'Guarda uma cópia num arquivo escolhido por você — .txt no caderno de texto, .csv no de tabela. É cópia: o seu arquivo de sempre continua onde está, e você não precisa disso pra não perder nada.',
        },
        {
          nome: 'Divisão da folha',
          teclas: 'Ctrl+1 a Ctrl+4, com Shift',
          texto:
            'Parte a folha em 2, 3 ou 4 blocos, cada um com arquivo e história próprios. O próprio desenho do botão mostra em quantos pedaços ela está — não tem rótulo. Sem Shift, o mesmo número pula pro bloco em vez de dividir.',
        },
        {
          nome: 'Foto da janela',
          teclas: 'Ctrl+P',
          texto:
            'Salva uma imagem da janela do jeito que ela está, em JPEG, direto na sua Área de trabalho.',
        },
      ],
    },
    {
      grupo: 'À direita',
      itens: [
        {
          nome: 'versões',
          teclas: 'Ctrl+H',
          texto:
            'Mostra o que estava escrito antes, até 100 por caderno. Trazer uma de volta guarda a de agora antes — nem isso é caminho sem volta.',
        },
        {
          nome: 'sobre',
          texto:
            'O que o programa é, e onde ficam os seus arquivos. Ali também fica o "voltar ao padrão de fábrica", que devolve tema, idioma, divisão da folha e cor da letra ao que eram — sem encostar em nenhuma palavra escrita e sem apagar nenhuma versão anterior.',
        },
        {
          nome: 'cor',
          teclas: 'Ctrl+K',
          texto:
            'Quatro cores de letra, uma escolha por caderno. Os números saem numa cor própria de qualquer jeito — com qualquer tema e qualquer cor escolhida —, porque número no meio do texto é o que o olho procura primeiro.',
        },
        { nome: 'tema', teclas: 'Shift+X', texto: 'Troca entre escuro e claro.' },
        {
          nome: 'português / English',
          teclas: 'Shift+I',
          texto: 'Troca o idioma na hora, sem fechar o programa.',
        },
      ],
    },
    {
      grupo: 'A barra de baixo',
      nota: 'Não tem botão nenhum aqui: ela só conta o que está acontecendo.',
      itens: [
        {
          nome: 'A bolinha e a hora',
          texto:
            'A hora em que ele guardou por conta própria. É a única confirmação de que você precisa.',
        },
        { nome: 'A contagem', texto: 'Quantas palavras tem no caderno aberto.' },
        {
          nome: 'O caminho',
          texto: 'Onde o arquivo está no seu computador, escrito por extenso.',
        },
      ],
    },
  ],
  atalhos: [
    { teclas: 'Ctrl+F', faz: 'localiza e substitui' },
    { teclas: 'Ctrl+G', faz: 'abre e fecha a gaveta' },
    { teclas: 'Ctrl+1 a Ctrl+4', faz: 'pula pro bloco (com Shift, divide a folha)' },
    { teclas: 'Ctrl+K', faz: 'a cor da letra' },
    { teclas: 'Shift+I', faz: 'troca de idioma' },
    { teclas: 'Ctrl+Tab', faz: 'troca de caderno' },
    { teclas: 'Ctrl+Z / Ctrl+Y', faz: 'desfaz e avança' },
    { teclas: 'Ctrl+E', faz: 'arruma' },
    { teclas: 'Ctrl+L', faz: 'numera (com Shift, marcadores)' },
    { teclas: 'Ctrl+M', faz: 'marca o trecho' },
    { teclas: 'Ctrl+D', faz: 'limpa a formatação' },
    { teclas: 'Ctrl+O', faz: 'traz um arquivo' },
    { teclas: 'Ctrl+R', faz: 'risca o trecho selecionado' },
    { teclas: 'Ctrl+S', faz: 'salva uma cópia' },
    { teclas: 'Ctrl+P', faz: 'tira a foto da janela' },
    { teclas: 'Ctrl+H', faz: 'mostra as versões' },
    { teclas: 'Shift+X', faz: 'troca o tema' },
  ],
  naoFaz: [
    'Não tem conta, não tem cadastro e não tem nuvem. Não existe uma linha de rede no programa: nada do que você escreve sai da sua máquina.',
    'Não guarda o que você escreve num formato só dele. São arquivos comuns — .txt, .csv e .md —, numa pasta que você acha sozinho. A gaveta trancada é a única exceção, e ela é escolha sua.',
    'Não abre junto com o Windows e não fica rodando no fundo.',
    'Não tem atualizador, não conta quantas vezes você usou e não pede avaliação.',
    'Não tem anúncio, não tem versão paga e não tem função trancada.',
  ],
  arquivos: [
    {
      id: 'instalador',
      nome: 'Instalador',
      arquivo: 'Notalio-0.2.0-instalador.exe',
      tamanho: '1,2 MB',
      paraQuem:
        'O normal. Instala pro seu usuário sem pedir senha de administrador, e aparece em "Adicionar ou remover programas" como qualquer programa. Pergunta o idioma na instalação, e em Windows 10 sem o WebView2 ele resolve isso sozinho.',
      recomendado: true,
      hash: '7469cf2830f45be5699c354dffe0c4f17ac0b57abd7a97d5a581d654dc992185',
    },
    {
      id: 'portatil',
      nome: 'Portátil',
      arquivo: 'Notalio-0.2.0-portatil.exe',
      tamanho: '3,3 MB',
      paraQuem:
        'Não instala nada: roda direto, inclusive de pendrive. Seus arquivos continuam indo pra Documentos\\Notalio.',
      hash: '471b1677a47a91257dabe51d53370d5336b1848833cf0b1f3f55f0a00db5e77d',
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

export { NOTALIO_DOWNLOAD };

export const vistalio: Site = {
  tipo: 'site',
  id: 'vistalio',
  nome: 'Vistalio',
  simbolo: 'vistas',
  rota: ROTAS.produtoVistalio,
  estado: 'EM CONSTRUÇÃO · GRATUITO',
  endereco: 'https://vistalio-chi.vercel.app',
  lema: 'Onde tirar fotos com as melhores vistas do Brasil.',
  resumo:
    'Um mapa do Brasil onde você escolhe um estado e encontra mirantes, praias, cachoeiras e arquitetura — cada lugar com foto, descrição e o caminho até lá no Google Maps. São 628 pontos nos 27 estados. Sem conta, sem cadastro e sem mensalidade.',
  descricao: [
    'Procurar "onde tirar foto em Minas" devolve lista de blog, post patrocinado e a mesma cachoeira em dez sites. O que falta não é lugar bonito: é uma lista que diga onde é, o que se vê e como chegar, sem você abrir quinze abas pra montar isso na mão.',
    'O Vistalio é essa lista. A home é o mapa do Brasil, e cada estado mostra quantos pontos tem antes de você clicar. Dentro do estado, busca e filtros; dentro do ponto, a foto, a descrição, as categorias e o botão que abre o caminho no Google Maps.',
    'Os favoritos ficam no seu aparelho, e em mais lugar nenhum. Não existe login pra fazer, conta pra criar nem lista sua num servidor nosso.',
  ],
  imagem: {
    src: '/produtos/vistalio/tela.webp',
    alt: 'A home do Vistalio: sobre um fundo azul-noite, o título "Onde tirar fotos com as melhores vistas do Brasil" e o mapa do Brasil em relevo, cada estado como um ladrilho com a sigla e a quantidade de pontos. Os estados pequenos do Nordeste têm o rótulo puxado por linha de chamada até a margem.',
    legenda:
      'A home. O mapa são 27 caminhos vetoriais das malhas do IBGE, e não um mapa de servidor — nenhuma requisição de tiles, nenhuma biblioteca de mapa.',
  },
  numeros: [
    { valor: '628', rotulo: 'pontos fotográficos' },
    { valor: '27', rotulo: 'estados, sem nenhum vazio' },
    { valor: '482', rotulo: 'com fotografia de verdade' },
    { valor: '24 KB', rotulo: 'o mapa inteiro do Brasil' },
  ],
  faz: [
    {
      titulo: 'O mapa é o menu',
      texto:
        'A home é o Brasil em relevo, e cada estado já diz quantos pontos tem antes do clique. São 27 caminhos vetoriais tirados das malhas do IBGE, num arquivo de 24 KB — sem servidor de mapa no meio, o que mantém a página leve em 3G.',
    },
    {
      titulo: 'Estado pequeno também tem nome',
      texto:
        'Alagoas, Sergipe e os vizinhos não cabem num rótulo dentro do próprio desenho. Em vez de encolher a letra até ninguém ler, o nome sai por linha de chamada até a margem — como numa planta, e não como num mapa que desistiu.',
    },
    {
      titulo: 'Foto certa, ou desenho',
      texto:
        'As fotos vêm do Wikimedia Commons com autor e licença. Toda candidata passa por uma conferência de nome antes de entrar, porque a busca solta erra feio — "Praça da Revolução" devolvia o escudo de um time. O que não passa fica com uma ilustração gerada do próprio lugar. Nenhum card fica vazio, e nenhum mostra outro lugar.',
    },
    {
      titulo: 'O caminho até lá',
      texto:
        'Cada ponto tem um botão que abre o Google Maps. Enquanto o lugar não foi conferido em campo, ele busca pelo nome e pela cidade em vez da coordenada: o nome sempre chega no lugar certo, a coordenada aproximada não.',
    },
    {
      titulo: 'Favoritos que não pedem conta',
      texto:
        'Você marca o que quiser e a lista fica no seu aparelho. Sem login, sem cadastro e sem lista sua guardada num servidor nosso.',
    },
    {
      titulo: 'Busca e filtro por estado',
      texto:
        'Dentro do estado dá pra procurar pelo nome e filtrar por categoria — mirante, praia, cachoeira, arquitetura. Os pontos com ficha completa aparecem primeiro.',
    },
  ],
  naoFaz: [
    'Não tem conta, não tem cadastro e não tem login. Os favoritos ficam no seu aparelho.',
    'Não vende ingresso, não agenda passeio e não indica guia. Ele diz onde é e como chegar; o resto é com você.',
    'Não usa servidor de mapa nem biblioteca de mapa. O desenho do Brasil é um arquivo de 24 KB que vem junto da página.',
    'Não inventa foto. Quando a imagem certa não existe ou não passa na conferência, entra uma ilustração — nunca a foto de outro lugar.',
    'Não tem anúncio e não tem versão paga.',
  ],
  aindaNao: {
    titulo: 'O que ainda não está pronto',
    texto:
      'As descrições dizem o que se vê em cada lugar, mas não foram conferidas em campo: todo ponto entra marcado como não revisado, e a interface diz isso na home, na ficha e no rodapé. Os campos de melhor horário, melhor época, dificuldade e acessibilidade já existem e estão preenchidos em 175 pontos — mas nenhuma tela os mostra ainda, porque mostrá-los agora encheria a maioria das fichas de "a definir" e diria menos, não mais.',
  },
};

export const produtos: readonly Produto[] = [clearlio, notalio, vistalio, planilhaFinanceira];
