import { ROTAS } from '@/lib/routes';

/** Conteúdo editorial da home. Promessas comerciais permanecem nas páginas dos produtos. */
export const hero = {
  eyebrow: 'DESENVOLVIMENTO DE SOFTWARE / JOGOS / LABORATÓRIO DE IDEIAS',
  titulo: ['Criamos coisas estranhas.', 'E fazemos com que importem.'],
  texto:
    'Engenharia de Software com IA aplicada a ideias próprias e projetos de clientes — de sites e aplicativos a jogos e sistemas completos.',
  cta: { rotulo: 'ENTRAR NO LABORATÓRIO', href: '#laboratorio' },
  estado: 'SISTEMA ATIVO',
} as const;

export const laboratorio = {
  id: 'laboratorio',
  indice: '03 / O ESTÚDIO',
  titulo: 'Ideias autorais, construídas até virarem produto.',
  paragrafos: [
    'A Blajeen Labs é um estúdio independente de software. Criamos produtos próprios e transformamos necessidades de clientes em experiências digitais completas.',
    'Cada projeto nasce pequeno, é testado no mundo real e evolui com aquilo que aprendemos no caminho. Nos produtos para negócios, essa evolução também considera as necessidades, a identidade e as regras de cada operação.',
  ],
  linhaTecnica: 'PERGUNTA → PROTÓTIPO → PRODUTO → APRENDIZADO',
} as const;

export const experimentos = {
  id: 'jogos',
  indice: '04 / JOGOS',
  titulo: 'Três mundos. Três perguntas diferentes.',
} as const;

export const produtosComerciais = {
  id: 'produtos',
  indice: '05 / PRODUTOS',
  titulo: 'Tecnologia própria para rotinas reais.',
  texto:
    'Bases funcionais para profissionais e negócios que querem começar com mais agilidade, sem abrir mão da própria identidade e das regras da operação.',
  cta: { rotulo: 'EXPLORAR OS PRODUTOS', href: ROTAS.projetos },
} as const;

export const proximo = {
  id: 'proximo',
  indice: '06 / EM ABERTO',
  titulo: 'O laboratório continua em movimento.',
  paragrafos: [
    'Publicamos o que aprendemos, o que muda e o que ganha forma. Sem promessas vazias: mostramos quando existe algo real para mostrar.',
  ],
  cta: { rotulo: 'ACOMPANHAR AS NOVIDADES', href: ROTAS.novidades },
} as const;

export const servicoPrincipal = {
  id: 'crie-seu-projeto',
  indice: '01 / SERVIÇO PRINCIPAL',
  eyebrow: 'ENGENHARIA DE SOFTWARE COM IA APLICADA',
  titulo: 'Sua ideia pode virar um produto com identidade própria.',
  texto:
    'Criamos sites, aplicativos, sistemas e experiências digitais do primeiro rascunho à publicação. Ajudamos a organizar a ideia, sugerimos caminhos e personalizamos cada detalhe para a sua necessidade.',
  cta: { rotulo: 'CRIE SEU PROJETO', href: ROTAS.crieSeuProjeto },
} as const;

export const trabalhosHome = {
  id: 'trabalhos',
  indice: '02 / TRABALHOS',
  titulo: 'Projetos que saíram da bancada e chegaram ao mundo real.',
  texto:
    'Entregas para clientes em que estratégia, identidade, experiência e engenharia precisaram funcionar juntas.',
  cta: { rotulo: 'VER TODOS OS TRABALHOS', href: ROTAS.trabalhos },
} as const;

export const rodapeCopy = {
  linha: 'Engenharia de Software com IA aplicada a ideias, negócios e produtos digitais.',
  base: 'TODOS OS SISTEMAS NORMAIS',
} as const;

export const metadados = {
  titulo: 'Blajeen Labs - Eng. de Software',
  descricao:
    'Sites, aplicativos, sistemas, produtos digitais e jogos construídos com Engenharia de Software com IA aplicada.',
  ogTitulo: 'BLAJEEN LABS',
  ogDescricao: 'Criamos coisas estranhas. E fazemos com que importem.',
} as const;
