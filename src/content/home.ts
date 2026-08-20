import { ROTAS } from '@/lib/routes';

/** Conteúdo editorial da home. Promessas comerciais permanecem nas páginas dos produtos. */
export const hero = {
  eyebrow: 'DESENVOLVIMENTO DE SOFTWARE / JOGOS / LABORATÓRIO DE IDEIAS',
  titulo: ['Criamos coisas estranhas.', 'E fazemos com que importem.'],
  texto:
    'Um estúdio independente construindo jogos, produtos digitais e experiências que ainda não existem.',
  cta: { rotulo: 'ENTRAR NO LABORATÓRIO', href: '#laboratorio' },
  estado: 'SISTEMA ATIVO',
} as const;

export const laboratorio = {
  id: 'laboratorio',
  indice: '01 / O ESTÚDIO',
  titulo: 'Ideias autorais, construídas até virarem produto.',
  paragrafos: [
    'A Blajeen Labs é um estúdio independente de software. Criamos jogos e produtos digitais próprios, da primeira pergunta à experiência que chega às pessoas.',
    'Cada projeto nasce pequeno, é testado no mundo real e evolui com aquilo que aprendemos no caminho. Nos produtos para negócios, essa evolução também considera as necessidades, a identidade e as regras de cada operação.',
  ],
  linhaTecnica: 'PERGUNTA → PROTÓTIPO → PRODUTO → APRENDIZADO',
} as const;

export const experimentos = {
  id: 'jogos',
  indice: '02 / JOGOS',
  titulo: 'Três mundos. Três perguntas diferentes.',
} as const;

export const produtosComerciais = {
  id: 'produtos',
  indice: '03 / PRODUTOS',
  titulo: 'Tecnologia própria para rotinas reais.',
  texto:
    'Plataformas funcionais para negócios que vivem de agenda, prontas para receber a identidade e as regras de cada operação.',
  cta: { rotulo: 'EXPLORAR OS PRODUTOS', href: ROTAS.projetos },
} as const;

export const proximo = {
  id: 'proximo',
  indice: '04 / EM ABERTO',
  titulo: 'O laboratório continua em movimento.',
  paragrafos: [
    'Publicamos o que aprendemos, o que muda e o que ganha forma. Sem promessas vazias: mostramos quando existe algo real para mostrar.',
  ],
  cta: { rotulo: 'ACOMPANHAR AS NOVIDADES', href: ROTAS.novidades },
} as const;

export const rodapeCopy = {
  linha: 'Estúdio independente de software, jogos e produtos digitais.',
  base: 'TODOS OS SISTEMAS NORMAIS',
} as const;

export const metadados = {
  titulo: 'Blajeen Labs — Jogos, produtos e experimentos',
  descricao:
    'Estúdio independente criando jogos, produtos digitais e experiências na interseção entre tecnologia, aprendizagem e imaginação.',
  ogTitulo: 'BLAJEEN LABS',
  ogDescricao: 'Criamos coisas estranhas. E fazemos com que importem.',
} as const;
