import { ROTAS } from '@/lib/routes';

/**
 * Páginas institucionais. Todo texto deriva de `docs/COPY_FINAL_DO_SITE.md`.
 * Sem biografia extensa, empresas anteriores, títulos inflados ou fotografia — regra da copy.
 */

export const sobre = {
  eyebrow: 'BLAJEEN LABS / O ESTÚDIO',
  titulo: 'Pequeno por escolha. Ambicioso por natureza.',
  introducao:
    'A Blajeen Labs existe para transformar perguntas, ideias e necessidades em produtos digitais — próprios ou criados para clientes — construídos com atenção ao que realmente importa.',
  secoes: [
    {
      id: 'origem',
      indice: '01 / ORIGEM',
      titulo: 'Uma mudança de carreira que ganhou forma de estúdio.',
      paragrafos: [
        'A Blajeen Labs nasceu de uma trajetória entre operações, dados, qualidade e tecnologia. A vontade de construir software próprio transformou aprendizado técnico em um espaço permanente para experimentar.',
        'O laboratório é esse espaço: compacto o bastante para preservar intenção e livre o bastante para seguir uma boa pergunta até onde ela levar.',
      ],
    },
    {
      id: 'principios',
      indice: '02 / PRINCÍPIOS',
      titulo: 'Produto antes de volume. Clareza antes de ruído.',
      paragrafos: [
        'Escolhemos os projetos com cuidado e damos a cada um uma razão clara para existir. Não repetimos soluções sem contexto; construímos produtos que carregam uma visão e respondem a uma necessidade.',
        'Isso significa mostrar o que já é real, assumir o que ainda está em formação e deixar que a qualidade da experiência fale mais alto que a quantidade de promessas.',
      ],
    },
    {
      id: 'metodo',
      indice: '03 / MÉTODO',
      titulo: 'Perguntar. Prototipar. Provar. Aprender.',
      paragrafos: [
        'Cada projeto começa com uma hipótese e avança por versões pequenas que podem ser avaliadas de verdade. O processo não protege uma ideia do teste; usa o teste para torná-la melhor.',
        'O que funciona ganha profundidade. O que não funciona vira aprendizado para o próximo ciclo.',
      ],
    },
    {
      id: 'instrumentos',
      indice: '04 / INSTRUMENTOS',
      titulo: 'Tecnologia amplifica intenção.',
      paragrafos: [
        'Engenharia de software, desenvolvimento de jogos, 3D, sistemas interativos e inteligência artificial fazem parte do laboratório.',
        'As ferramentas reduzem a distância entre uma ideia e uma experiência testável. Mas continuam sendo instrumentos: o produto é aquilo que a pessoa entende, sente e consegue fazer.',
      ],
    },
  ],
  linhaTecnica: 'INTENÇÃO × TECNOLOGIA × ITERAÇÃO → PRODUTOS AUTORAIS',
  metaTitulo: 'Sobre — Blajeen Labs',
  metaDescricao:
    'A Blajeen Labs é um estúdio independente de engenharia de software aplicada, produtos digitais e jogos.',
} as const;

export const contato = {
  eyebrow: 'CONTATO / TRANSMISSÃO',
  titulo: 'Vamos conversar sobre o que você quer construir.',
  introducao:
    'Fale com o estúdio sobre um projeto, parceria, imprensa ou uma ideia. O formulário prepara a mensagem no seu aplicativo de e-mail: nada é enviado a um servidor nem armazenado pelo site.',
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
    'Entre em contato com a Blajeen Labs sobre produtos digitais, parcerias, imprensa ou o laboratório.',
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
