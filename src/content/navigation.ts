import { ROTAS } from '@/lib/routes';
import { statusVisivel } from './estado-do-projeto';
import { projetos, rotasDoProjeto } from './projects';
import type { MenuId, NavLink } from './types';
import { produtos } from './produtos';
import { doutelio, espacelio } from './saas';

/**
 * Barra de navegação do desktop.
 *
 * "Produtos" e "Jogos" não são links: abrem um submenu. Produtos reúne os programas pra baixar e
 * os sistemas SaaS, em duas colunas (pedido do titular: o SaaS deixou de ser um item próprio).
 * Os demais levam direto à sua rota.
 */
export const barraDeNavegacao = [
  { rotulo: 'Crie seu projeto', tipo: 'link', href: ROTAS.crieSeuProjeto, destaque: 'servico' },
  { rotulo: 'Projetos feitos', tipo: 'link', href: ROTAS.trabalhos },
  { rotulo: 'Produtos', tipo: 'submenu', menu: 'produtos' },
  { rotulo: 'Jogos', tipo: 'submenu', menu: 'jogos' },
  { rotulo: 'Loja', tipo: 'link', href: ROTAS.loja },
  { rotulo: 'Estúdio', tipo: 'link', href: ROTAS.sobre },
  { rotulo: 'Novidades', tipo: 'link', href: ROTAS.novidades },
  { rotulo: 'Contato', tipo: 'link', href: ROTAS.contato, destaque: 'contato' },
] as const;

/** Destinos da barra lateral usada no mobile. */
export const navegacaoPrincipal: readonly NavLink[] = [
  {
    indice: '00',
    rotulo: 'Início',
    descricao: 'Visão geral do laboratório, do SaaS e dos projetos.',
    href: ROTAS.home,
    icone: 'inicio',
  },
  {
    indice: '01',
    rotulo: 'Crie seu projeto',
    descricao: 'Sua ideia transformada em site, aplicativo, sistema ou produto digital.',
    href: ROTAS.crieSeuProjeto,
    icone: 'engenharia',
  },
  {
    indice: '02',
    rotulo: 'Projetos feitos',
    descricao: 'Alguns dos projetos feitos para clientes e colocados no mundo real.',
    href: ROTAS.trabalhos,
    icone: 'projetos-feitos',
  },
  {
    indice: '03',
    rotulo: 'Produtos',
    descricao: 'Programas pra baixar e usar sem conta, e sistemas SaaS para negócios.',
    href: ROTAS.produtos,
    icone: 'produtos',
    menu: 'produtos',
  },
  {
    indice: '04',
    rotulo: 'Jogos',
    descricao: 'Jogos autorais da Blajeen Labs: experiências de estratégia, exploração, convivência e mundos próprios.',
    href: ROTAS.projetoRevalio,
    icone: 'jogos',
    menu: 'jogos',
  },
  {
    indice: '05',
    rotulo: 'Loja',
    descricao: 'Bonecos 3D, camisetas, canecas e o Livro de Morvelio.',
    href: ROTAS.loja,
    icone: 'loja',
  },
  {
    indice: '06',
    rotulo: 'Estúdio',
    descricao: 'De onde vem o laboratório e o que ele procura.',
    href: ROTAS.sobre,
    icone: 'estudio',
  },
  {
    indice: '07',
    rotulo: 'Novidades',
    descricao: 'Lançamentos e andamento dos projetos.',
    href: ROTAS.novidades,
    icone: 'novidades',
  },
  {
    indice: '08',
    rotulo: 'Contato',
    descricao: 'Projetos, parcerias e conversa com o estúdio.',
    href: ROTAS.contato,
    icone: 'contato',
  },
] as const;

/**
 * Atalhos secundários para escolher entre os jogos do laboratório.
 *
 * Derivados de `projetos` para que nome, ícone e estado venham da mesma fonte tipada: o estado
 * mostrado aqui não pode divergir do estado mostrado na página do produto.
 * O `alt` do ícone é vazio de propósito — ele acompanha o nome do jogo no próprio link, então
 * descrevê-lo criaria leitura duplicada.
 */
export const atalhosDeJogo = projetos.map((projeto) => ({
  rotulo: projeto.nome,
  estado: statusVisivel(projeto),
  icone: projeto.icone,
  href: rotasDoProjeto[projeto.id].pagina,
}));

/**
 * Os produtos do estúdio no menu: cada um leva à sua própria página.
 *
 * Sai da mesma fonte que a página `/produtos`, pra o menu não poder discordar dela.
 */
export const atalhosDeProduto = produtos.map((produto) => ({
  rotulo: produto.nome,
  estado: produto.estado,
  simbolo: produto.simbolo,
  href: produto.rota,
}));

/** Os SaaS no menu: o Espacelio, que reúne os sistemas para negócios locais, e o Doutelio. */
export const atalhosDeProjeto = [espacelio, doutelio()].map((produto) => ({
  rotulo: produto.nome, estado: produto.estado, simbolo: produto.icone, href: produto.rota,
}));

/**
 * O que cada item com lista desdobra, no menu do desktop e na gaveta do celular.
 *
 * As listas são as mesmas das páginas de cada categoria. Produtos tem dois grupos, programas e
 * SaaS; `todos` só existe onde há uma página que reúne o grupo inteiro (os jogos não têm uma, e
 * apontar pro primeiro jogo repetiria o item que já está logo abaixo).
 */
export const submenus: Record<MenuId, Submenu> = {
  produtos: {
    grupos: [
      { titulo: 'Programas', todos: { rotulo: 'Ver todos os programas', href: ROTAS.produtos }, itens: atalhosDeProduto },
      { titulo: 'SaaS', todos: { rotulo: 'Ver todos os sistemas', href: ROTAS.projetos }, itens: atalhosDeProjeto },
    ],
    extras: [],
  },
  jogos: {
    grupos: [{ titulo: null, todos: null, itens: atalhosDeJogo }],
    extras: [{ rotulo: 'Morvelio Wiki', descricao: 'Atlas, classes e histórias', href: ROTAS.morvelioWiki }],
  },
};

export type AtalhoDeMenu =
  | (typeof atalhosDeJogo)[number]
  | (typeof atalhosDeProduto)[number]
  | (typeof atalhosDeProjeto)[number];

type Submenu = {
  readonly grupos: readonly {
    readonly titulo: string | null;
    readonly todos: { readonly rotulo: string; readonly href: string } | null;
    readonly itens: readonly AtalhoDeMenu[];
  }[];
  readonly extras: readonly { readonly rotulo: string; readonly descricao: string; readonly href: string }[];
};

/**
 * Links do rodapé, agrupados por responsabilidade.
 *
 * A coluna "Lojas" saiu: ela repetia as políticas de cada produto, que `/privacy` já lista.
 * As páginas de exclusão viraram um subgrupo de "Legal" e continuam a um clique do rodapé — as
 * rotas terminadas em `delete-account` não mudaram, porque são elas que vão para o Google Play
 * Console.
 *
 * A palavra "excluir" permanece explícita onde ela decide algo: no rótulo do subgrupo, no título
 * de cada página, nos documentos das páginas de produto e na gaveta do mobile.
 */
export const rodape = {
  jogos: [
    { rotulo: 'Revalio', href: ROTAS.projetoRevalio },
    { rotulo: 'Docalio', href: ROTAS.projetoDocalio },
    { rotulo: 'Gramelio', href: ROTAS.projetoGramelio },
    { rotulo: 'Catelio', href: ROTAS.projetoCatelio },
    { rotulo: 'Morvelio', href: ROTAS.projetoMorvelio },
    { rotulo: 'Morvelio Wiki', href: ROTAS.morvelioWiki },
    { rotulo: 'Mazelio', href: ROTAS.projetoMazelio },
    { rotulo: 'Socialio', href: ROTAS.projetoSocialio },
  ],
  projetos: atalhosDeProjeto.map(({ rotulo, href }) => ({ rotulo, href })),
  produtos: atalhosDeProduto.map(({ rotulo, href }) => ({ rotulo, href })),
  estudio: [
    { rotulo: 'Sobre', href: ROTAS.sobre },
    { rotulo: 'Crie seu projeto', href: ROTAS.crieSeuProjeto },
    { rotulo: 'Projetos feitos', href: ROTAS.trabalhos },
    { rotulo: 'Novidades', href: ROTAS.novidades },
    { rotulo: 'Loja', href: ROTAS.loja },
    { rotulo: 'Contato', href: ROTAS.contato },
    { rotulo: 'Suporte', href: ROTAS.suporte },
  ],
  legal: [
    { rotulo: 'Privacidade', href: ROTAS.privacidade },
    { rotulo: 'Termos', href: ROTAS.termos },
  ],
  social: [
    { rotulo: '@blajeenlab', href: 'https://www.instagram.com/blajeenlab/' },
    { rotulo: 'GitHub / blajeen', href: 'https://github.com/blajeen' },
  ],
  /**
   * Subgrupo de "Legal", com um destino por produto.
   *
   * O rótulo mantém a palavra "excluir" porque é ela que a pessoa procura quando quer sair — e é
   * o que as lojas esperam encontrar sem precisar abrir a política. O nome do jogo basta como
   * link, já que o título do subgrupo diz o que acontece ali.
   */
  dados: {
    titulo: 'Excluir dados',
    links: [
      { rotulo: 'Revalio', href: ROTAS.revalioExclusao },
      { rotulo: 'Docalio', href: ROTAS.docalioExclusao },
      { rotulo: 'Gramelio', href: ROTAS.gramelioExclusao },
      { rotulo: 'Catelio', href: ROTAS.catelioExclusao },
      { rotulo: 'Morvelio', href: ROTAS.morvelioExclusao },
      { rotulo: 'Mazelio', href: ROTAS.mazelioExclusao },
      { rotulo: 'Socialio', href: ROTAS.socialioExclusao },
    ],
  },
} as const;
