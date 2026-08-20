import { ROTAS } from '@/lib/routes';

/**
 * Conteúdo da home.
 *
 * A home voltou a ser uma página de rolagem, por decisão do titular em 17/08/2026 — as abas
 * ficaram para trás. As sete seções seguem a ordem original do plano mestre; o que mudou desde
 * então é o idioma: toda a interface é em português.
 *
 * O sentido e o nível de precisão da copy aprovada foram preservados: nada de recurso, data,
 * plataforma ou métrica que não exista.
 */

export const hero = {
  eyebrow: 'DESENVOLVIMENTO DE SOFTWARE / JOGOS / LABORATÓRIO DE IDEIAS',
  titulo: ['Criamos coisas estranhas.', 'E fazemos com que importem.'],
  texto:
    'Um estúdio independente de desenvolvimento de software — jogos, principalmente — construindo coisas que ainda não existem.',
  cta: { rotulo: 'ENTRAR NO LABORATÓRIO', href: '#laboratorio' },
  estado: 'SISTEMA ATIVO',
} as const;

export const laboratorio = {
  id: 'laboratorio',
  indice: '01 / O LABORATÓRIO',
  titulo: 'Algumas ideias precisam de um laboratório.',
  paragrafos: [
    'A Blajeen Labs desenvolve software próprio, com foco em jogos. O laboratório existe para testar ideias que talvez não funcionem — porque é justamente aí que coisas interessantes começam.',
    'Experimentamos. Construímos. Quebramos. Aprendemos. Construímos de novo.',
    'Não somos uma agência. Criamos jogos e experiências que gostaríamos que já existissem.',
  ],
  linhaTecnica: 'JOGOS × TECNOLOGIA × APRENDIZAGEM → RESULTADOS DESCONHECIDOS',
} as const;

export const experimentos = {
  id: 'experimentos',
  indice: '02 / EXPERIMENTOS ATIVOS',
  titulo: 'Três experimentos. Cada um começou com uma pergunta diferente.',
} as const;

export const estado = {
  id: 'estado',
  indice: '03 / ESTADO ATUAL',
  titulo: 'O laboratório está ativo.',
  texto:
    'Estamos construindo os projetos da Blajeen Labs, um de cada vez. Mostraremos mais quando houver algo real para mostrar.',
} as const;

export const hipotese = {
  id: 'hipotese',
  indice: '04 / HIPÓTESE',
  titulo: 'Aprender não precisa parecer estudar.',
  paragrafos: [
    'Assuntos importantes costumam chegar cercados de peso, repetição e distância. Queremos explorar outra possibilidade: aprender tomando decisões, percebendo consequências e querendo descobrir o que acontece depois.',
  ],
  pergunta: 'E se aprender pudesse ser uma aventura?',
} as const;

export const origem = {
  id: 'origem',
  indice: '05 / ORIGEM',
  titulo: 'A curiosidade virou uma mudança de carreira. A mudança virou um estúdio.',
  paragrafos: [
    'A Blajeen Labs nasceu de uma trajetória entre operações, dados, qualidade e tecnologia. O que começou como uma mudança deliberada em direção à engenharia de software se transformou na vontade de criar produtos próprios — e mundos em que ideias possam ser testadas de verdade.',
    'O laboratório é o formato dessa vontade: desenvolver software autoral, começando pelos jogos, e inovar onde ainda há espaço para tentar.',
  ],
} as const;

export const instrumentos = {
  id: 'instrumentos',
  indice: '06 / INSTRUMENTOS',
  titulo: 'A IA não substituiu a ideia. Ela abriu espaço para ela.',
  paragrafos: [
    'Engenharia de software, desenvolvimento de jogos, 3D, sistemas interativos e inteligência artificial fazem parte do laboratório.',
    'A IA mudou o custo de tentar. O que antes exigia uma equipe para sair do papel hoje cabe em um protótipo de fim de semana — e o gargalo deixou de ser a execução para voltar a ser a ideia. É essa folga que um estúdio pequeno usa para arriscar.',
    'As ferramentas mudam; a intenção, não. A tecnologia é instrumento, a experiência é o produto.',
  ],
} as const;

export const proximo = {
  id: 'proximo',
  indice: '07 / EM ABERTO',
  titulo: 'Estes são os primeiros experimentos. Não os últimos.',
  paragrafos: [
    'Revalio começou como uma pergunta. Docalio abriu outra. Gramelio veio de um lugar completamente diferente — e é o primeiro que não fala de medicina. O laboratório continua.',
  ],
  // Não existe newsletter: acompanhar o laboratório é ler as novidades.
  cta: { rotulo: 'ACOMPANHAR O LABORATÓRIO', href: ROTAS.novidades },
} as const;

export const rodapeCopy = {
  linha: 'Estúdio independente de desenvolvimento de software e jogos.',
  base: 'TODOS OS SISTEMAS NORMAIS',
} as const;

export const metadados = {
  titulo: 'Blajeen Labs — Jogos, ideias e experimentos',
  descricao:
    'Estúdio independente de desenvolvimento de software e jogos, inovando na interseção entre tecnologia, aprendizagem e imaginação.',
  ogTitulo: 'BLAJEEN LABS',
  ogDescricao: 'Criamos coisas estranhas. E fazemos com que importem.',
} as const;
