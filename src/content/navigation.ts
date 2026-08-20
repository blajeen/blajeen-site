import { ROTAS } from '@/lib/routes';
import { statusVisivel } from './estado-do-projeto';
import { projetos, rotasDoProjeto } from './projects';
import type { NavLink } from './types';

/**
 * Barra de navegação do desktop.
 *
 * "Jogos" não é link: ele abre os jogos do laboratório em um
 * submenu. Os demais levam direto à sua rota.
 */
export const barraDeNavegacao = [
  { rotulo: 'Sobre', tipo: 'link', href: ROTAS.sobre },
  { rotulo: 'Jogos', tipo: 'submenu' },
  { rotulo: 'Projetos', tipo: 'link', href: ROTAS.projetos },
  { rotulo: 'Novidades', tipo: 'link', href: ROTAS.novidades },
  { rotulo: 'Suporte', tipo: 'link', href: ROTAS.suporte },
  { rotulo: 'Contato', tipo: 'link', href: ROTAS.contato },
  { rotulo: 'Privacidade', tipo: 'link', href: ROTAS.privacidade },
] as const;

/** Índice da gaveta usada no mobile. */
export const navegacaoPrincipal: readonly NavLink[] = [
  {
    indice: '01',
    rotulo: 'Sobre',
    descricao: 'De onde vem o laboratório e o que ele procura.',
    href: ROTAS.sobre,
  },
  {
    indice: '02',
    rotulo: 'Jogos',
    descricao: 'Revalio, Docalio e Gramelio: os jogos do laboratório.',
    href: ROTAS.projetoRevalio,
  },
  {
    indice: '03',
    rotulo: 'Projetos',
    descricao: 'Sites e aplicativos em construção.',
    href: ROTAS.projetos,
  },
  {
    indice: '04',
    rotulo: 'Novidades',
    descricao: 'Lançamentos e andamento dos projetos.',
    href: ROTAS.novidades,
  },
  {
    indice: '05',
    rotulo: 'Suporte',
    descricao: 'Problema no app, dúvida de uso ou reportar um bug.',
    href: ROTAS.suporte,
  },
  {
    indice: '06',
    rotulo: 'Contato',
    descricao: 'Assuntos do estúdio: parcerias, imprensa e conversa.',
    href: ROTAS.contato,
  },
  {
    indice: '07',
    rotulo: 'Privacidade',
    descricao: 'Como os dados são tratados em cada produto.',
    href: ROTAS.privacidade,
  },
] as const;

/**
 * Atalhos secundários para escolher entre os dois jogos.
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
  ],
  projetos: [
    { rotulo: 'Barbearia — em breve', href: `${ROTAS.projetos}#barbearia` },
    { rotulo: 'Personal / Estúdio — em breve', href: `${ROTAS.projetos}#personal-estudio` },
  ],
  estudio: [
    { rotulo: 'Sobre', href: ROTAS.sobre },
    { rotulo: 'Novidades', href: ROTAS.novidades },
    { rotulo: 'Contato', href: ROTAS.contato },
    { rotulo: 'Suporte', href: ROTAS.suporte },
  ],
  legal: [
    { rotulo: 'Privacidade', href: ROTAS.privacidade },
    { rotulo: 'Termos', href: ROTAS.termos },
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
    ],
  },
} as const;
