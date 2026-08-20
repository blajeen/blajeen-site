import { ROTAS } from '@/lib/routes';

/**
 * Páginas institucionais. Todo texto deriva de `docs/COPY_FINAL_DO_SITE.md`.
 * Sem biografia extensa, empresas anteriores, títulos inflados ou fotografia — regra da copy.
 */

export const sobre = {
  eyebrow: 'O LABORATÓRIO / ORIGEM',
  titulo: 'Algumas ideias precisam de um laboratório.',
  introducao:
    'A Blajeen Labs desenvolve software próprio, com foco em jogos. O laboratório existe para testar ideias que talvez não funcionem — porque é justamente aí que coisas interessantes começam.',
  secoes: [
    {
      id: 'metodo',
      indice: '01 / MÉTODO',
      titulo: 'Experimentamos. Construímos. Quebramos. Aprendemos. Construímos de novo.',
      paragrafos: [
        'Não somos uma agência. Desenvolvemos software autoral — jogos, principalmente — e criamos as experiências que gostaríamos que já existissem.',
        'Cada projeto começa como uma pergunta e só vira produto quando sobrevive ao teste. É por isso que este site mostra três projetos, e não um catálogo.',
      ],
    },
    {
      id: 'origem',
      indice: '02 / ORIGEM',
      titulo: 'A curiosidade virou uma mudança de carreira. A mudança virou um estúdio.',
      paragrafos: [
        'A Blajeen Labs nasceu de uma trajetória entre operações, dados, qualidade e tecnologia. O que começou como uma mudança deliberada em direção à engenharia de software se transformou na vontade de criar produtos próprios — e mundos em que ideias possam ser testadas de verdade.',
      ],
    },
    {
      id: 'instrumentos',
      indice: '03 / INSTRUMENTOS',
      titulo: 'A IA não substituiu a ideia. Ela abriu espaço para ela.',
      paragrafos: [
        'Engenharia de software, desenvolvimento de jogos, 3D, sistemas interativos e inteligência artificial fazem parte do laboratório.',
        'A IA mudou o custo de tentar: o que antes exigia uma equipe inteira para sair do papel hoje cabe em um protótipo, e o gargalo voltou a ser a ideia. É essa folga que um estúdio pequeno usa para arriscar.',
        'As ferramentas mudam; a intenção, não. A tecnologia é instrumento, a experiência é o produto.',
      ],
    },
    {
      id: 'hipotese',
      indice: '04 / HIPÓTESE',
      titulo: 'Aprender não precisa parecer estudar.',
      paragrafos: [
        'Assuntos importantes costumam chegar cercados de peso, repetição e distância. Queremos explorar outra possibilidade: aprender tomando decisões, percebendo consequências e querendo descobrir o que acontece depois.',
        'E se aprender pudesse ser uma aventura?',
      ],
    },
  ],
  linhaTecnica: 'JOGOS × TECNOLOGIA × APRENDIZAGEM → RESULTADOS DESCONHECIDOS',
  metaTitulo: 'Sobre — Blajeen Labs',
  metaDescricao:
    'A Blajeen Labs é um estúdio independente de desenvolvimento de software e jogos, inovando na interseção entre tecnologia, aprendizagem e imaginação.',
} as const;

export const contato = {
  eyebrow: 'TRANSMISSÃO',
  titulo: 'Tem algo estranho em mente?',
  introducao:
    'Esta página é para falar com o estúdio: parceria, imprensa, uma ideia ou só curiosidade. O contato acontece por e-mail — o site não tem formulário, então nada é enviado a um servidor nem armazenado por aqui.',
  /*
   * Contato e Suporte deixaram de dizer a mesma coisa.
   *
   * Aqui é o estúdio; problema com um aplicativo, dúvida de uso e bug vão para Suporte, onde cada
   * produto tem canal próprio e há um roteiro de como relatar. Esta página só aponta o caminho.
   */
  desvio: {
    titulo: 'Problema em um aplicativo?',
    texto:
      'Se for algo travando, uma dúvida de uso, um bug ou um pedido sobre seus dados, o Suporte resolve mais rápido: cada produto tem o seu canal e um roteiro do que informar.',
    rotulo: 'Ir para o suporte',
    href: ROTAS.suporte,
  },
  observacoes: [
    'Não envie dados reais de pacientes, prontuários ou imagens clínicas em nenhuma mensagem.',
  ],
  atalhos: [
    { rotulo: 'Suporte', descricao: 'Ajuda com o app, dúvidas e bugs.', href: ROTAS.suporte },
    { rotulo: 'Privacidade', descricao: 'Como cada produto trata dados.', href: ROTAS.privacidade },
  ],
  metaTitulo: 'Contato — Blajeen Labs',
  metaDescricao:
    'Fale com a Blajeen Labs sobre parceria, imprensa ou o laboratório. Suporte de produto tem página própria.',
} as const;

export const naoEncontrado = {
  codigo: '404',
  eyebrow: 'SINAL PERDIDO',
  titulo: 'Este experimento não está neste endereço.',
  texto:
    'A página que você procurou não existe ou mudou de lugar. O laboratório continua ativo — escolha um caminho abaixo.',
  metaTitulo: 'Página não encontrada — Blajeen Labs',
} as const;

export const erro = {
  codigo: '500',
  eyebrow: 'FALHA DE CONTENÇÃO',
  titulo: 'Algo quebrou deste lado.',
  texto:
    'Um erro inesperado interrompeu a renderização desta página. Você pode tentar novamente ou voltar para o início.',
} as const;
