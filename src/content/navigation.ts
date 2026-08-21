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
  { rotulo: 'Crie seu projeto', tipo: 'link', href: ROTAS.crieSeuProjeto, destaque: 'servico' },
  { rotulo: 'Projetos feitos', tipo: 'link', href: ROTAS.trabalhos },
  { rotulo: 'Produtos', tipo: 'submenu', menu: 'projetos' },
  { rotulo: 'Jogos', tipo: 'submenu', menu: 'jogos' },
  { rotulo: 'Estúdio', tipo: 'link', href: ROTAS.sobre },
  { rotulo: 'Novidades', tipo: 'link', href: ROTAS.novidades },
  { rotulo: 'Contato', tipo: 'link', href: ROTAS.contato, destaque: 'contato' },
] as const;

/** Destinos da barra lateral usada no mobile. */
export const navegacaoPrincipal: readonly NavLink[] = [
  {
    indice: '00',
    rotulo: 'Início',
    descricao: 'Visão geral do laboratório, dos produtos e dos projetos.',
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
    descricao: 'Plataformas próprias adaptadas a negócios reais.',
    href: ROTAS.projetos,
    icone: 'produtos',
  },
  {
    indice: '04',
    rotulo: 'Jogos',
    descricao: 'Revalio, Docalio e Gramelio: os jogos do laboratório.',
    href: ROTAS.projetoRevalio,
    icone: 'jogos',
  },
  {
    indice: '05',
    rotulo: 'Estúdio',
    descricao: 'De onde vem o laboratório e o que ele procura.',
    href: ROTAS.sobre,
    icone: 'estudio',
  },
  {
    indice: '06',
    rotulo: 'Novidades',
    descricao: 'Lançamentos e andamento dos projetos.',
    href: ROTAS.novidades,
    icone: 'novidades',
  },
  {
    indice: '07',
    rotulo: 'Contato',
    descricao: 'Projetos, parcerias e conversa com o estúdio.',
    href: ROTAS.contato,
    icone: 'contato',
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

/** Projetos de software apresentados no menu do estúdio. */
export const atalhosDeProjeto = [
  {
    rotulo: 'Barbearias',
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    simbolo: 'barbearia',
    href: ROTAS.barbearia,
  },
  {
    rotulo: 'Personal',
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    simbolo: 'personal',
    href: ROTAS.personalStudio,
  },
  {
    rotulo: 'Studio Beauty',
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    simbolo: 'salao',
    href: ROTAS.salaoEstetica,
  },
  {
    rotulo: 'E-commerce',
    estado: 'DEMONSTRAÇÃO DISPONÍVEL',
    simbolo: 'ecommerce',
    href: ROTAS.ecommerce,
  },
  {
    rotulo: 'Clínica Médica',
    estado: 'EM BREVE',
    simbolo: 'medico',
    href: ROTAS.clinicaMedica,
  },
] as const;

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
    { rotulo: 'Barbearias', href: ROTAS.barbearia },
    { rotulo: 'Personal', href: ROTAS.personalStudio },
    { rotulo: 'Studio Beauty', href: ROTAS.salaoEstetica },
    { rotulo: 'E-commerce', href: ROTAS.ecommerce },
    { rotulo: 'Clínica Médica', href: ROTAS.clinicaMedica },
  ],
  estudio: [
    { rotulo: 'Sobre', href: ROTAS.sobre },
    { rotulo: 'Crie seu projeto', href: ROTAS.crieSeuProjeto },
    { rotulo: 'Projetos feitos', href: ROTAS.trabalhos },
    { rotulo: 'Novidades', href: ROTAS.novidades },
    { rotulo: 'Contato', href: ROTAS.contato },
    { rotulo: 'Suporte', href: ROTAS.suporte },
  ],
  legal: [
    { rotulo: 'Privacidade', href: ROTAS.privacidade },
    { rotulo: 'Termos', href: ROTAS.termos },
  ],
  social: [
    { rotulo: '@blajeenlab', href: 'https://www.instagram.com/blajeenlab/' },
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
