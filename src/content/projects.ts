import { ROTAS } from '@/lib/routes';
import type { Project, ProjectId } from './types';

/**
 * Copy aprovada em `docs/COPY_FINAL_DO_SITE.md`.
 *
 * Recursos só aparecem quando existem no build auditado. Para o Revalio, a evidência está em
 * `C:\dev\revalio\docs\FICHA_GOOGLE_PLAY.md`, `docs\publicacao\INVENTARIO_RELEASE.md` e
 * `docs\publicacao\RASCUNHO_TERMOS_DE_USO.md` §2. Para o Docalio, nada além do conceito foi
 * aprovado para comunicação — ver `docs/COPY_FINAL_DO_SITE.md`, "Limite editorial". Para o
 * Gramelio, a fonte é a descrição do titular em 19/08/2026, e ela descreve o desenho do jogo:
 * por isso o produto tem `pilares` e continua com `recursos` vazio.
 *
 * `plataformas` fica vazio de propósito: `INVENTARIO_RELEASE.md` registra que o pacote de produção
 * do Revalio ainda não foi gerado e que o iOS depende de macOS/Xcode. Nenhuma loja foi anunciada.
 */

export const revalio: Project = {
  id: 'revalio',
  nome: 'Revalio',
  indice: 'EXPERIMENTO 01',
  estado: 'ATIVO',
  categoria: 'APP DE MICROAPRENDIZAGEM',
  // Estado até o lançamento; a partir de `lancamento` o site mostra DISPONÍVEL sozinho.
  status: 'EM DESENVOLVIMENTO',
  lancamento: '2026-08-25',
  frase: 'Estudo médico em doses que cabem no dia.',
  descricao:
    'Um aplicativo de microaprendizagem para quem estuda para o Revalida e para a residência. Sessões curtas que transformam a preparação em decisões, prática, revisão e progresso que você consegue enxergar.',
  cta: 'EXPLORAR REVALIO',
  notaCurta: 'Conteúdo educacional. Não substitui formação, protocolos ou decisão clínica.',
  eyebrow: 'EXPERIMENTO 01 / EDUCAÇÃO MÉDICA',
  subtitulo: 'Estudo médico em doses que cabem no dia.',
  introducao:
    'Microaprendizagem para quem estuda para o Revalida e para a residência: decisões, prática, revisão e um progresso que você consegue enxergar.',
  manifesto: [
    'Estudar medicina exige constância. O Revalio foi criado para que essa constância tenha ritmo, feedback e significado.',
    'Você avança por trilhas, enfrenta atividades curtas, aprende com os erros e constrói uma jornada própria — sem promessas de atalhos.',
  ],
  /*
   * Os cinco itens autorizados pela copy aprovada, cada um confirmado em
   * `C:\dev\revalio\docs\FICHA_GOOGLE_PLAY.md` e `docs\publicacao\RASCUNHO_TERMOS_DE_USO.md` §2.
   * Sala Vermelha, Sprint e Revalio TV existem no build, mas ficam fora até serem aprovados
   * para comunicação no site.
   */
  recursos: [
    {
      titulo: 'Trilhas',
      texto: 'Trilha Objetiva e Trilha Prática, com progresso acompanhado por especialidade.',
    },
    {
      titulo: 'Atividades',
      texto:
        'Questões e estações organizadas a partir de provas e gabaritos de anos anteriores, além de flashcards para revisão rápida.',
    },
    {
      titulo: 'Revisão',
      texto: 'Correção com explicação curta e uma fila para rever o que você errou.',
    },
    {
      titulo: 'Progressão',
      texto: 'Média, sequência, conquistas e uma coleção de itens para personalizar a jornada.',
    },
    {
      titulo: 'Ritmo',
      texto: 'Sessões curtas, pensadas para caber na rotina sem virar maratona.',
    },
  ],
  aviso:
    'O Revalio tem finalidade exclusivamente educacional. Não presta atendimento, não realiza diagnóstico, não prescreve tratamento, não substitui formação, supervisão profissional ou protocolos oficiais e não garante aprovação ou resultado em prova. É um produto independente, sem vínculo oficial com órgãos examinadores, salvo declaração expressa e documentada.',
  banner: {
    src: '/projects/revalio/revalio-banner-final.png',
    alt: 'Key art do Revalio: campus médico futurista com uma trilha contínua de nós que atravessa o elenco do jogo e termina em uma porta iluminada. A arte traz o título REVALIO e a assinatura Blajeen Labs.',
    largura: 1672,
    altura: 941,
  },
  icone: {
    src: '/projects/revalio/revalio-icon-512.png',
    alt: '',
    tamanho: 512,
  },
  galeria: [],
  galeriaBloqueador: 'screenshotsRevalio',
  plataformas: [],
  /*
   * O titular informou em 18/08/2026 que o Revalio já está publicado nas duas lojas.
   * As URLs das fichas ainda não foram passadas — ver o bloqueador `lojasRevalio`. Enquanto elas
   * não existirem, o site anuncia a disponibilidade sem prometer um link que não abre.
   */
  disponibilidade: [
    { loja: 'appStore', nome: 'App Store', estado: 'disponivel', url: null, bloqueador: 'lojasRevalio' },
    { loja: 'googlePlay', nome: 'Google Play', estado: 'disponivel', url: null, bloqueador: 'lojasRevalio' },
  ],
  ogDescricao: 'Microaprendizagem para quem estuda para o Revalida e a residência.',
  metaTitulo: 'Revalio — Blajeen Labs',
  metaDescricao:
    'Revalio é o app de microaprendizagem da Blajeen Labs para quem estuda para o Revalida e para a residência: trilhas, atividades curtas e revisão dos erros.',
};

export const docalio: Project = {
  id: 'docalio',
  nome: 'Docalio',
  indice: 'EXPERIMENTO 02',
  estado: 'EM FORMAÇÃO',
  categoria: 'JOGO DE ESTRATÉGIA MÉDICA',
  status: 'EM DESENVOLVIMENTO',
  frase: 'Cada paciente muda a história.',
  descricao:
    'Um jogo de estratégia por níveis: cada plantão traz pacientes que precisam ser salvos a tempo. O segredo não é a rapidez, e sim saber priorizar na hora da emergência.',
  cta: 'CONHECER DOCALIO',
  notaCurta: 'Conceito em desenvolvimento. Escopo, plataformas e lançamento ainda não foram anunciados.',
  eyebrow: 'EXPERIMENTO 02 / ESTRATÉGIA MÉDICA',
  subtitulo: 'Cada paciente muda a história.',
  introducao:
    'Um jogo de estratégia por níveis sobre salvar todos os pacientes a tempo — e sobre a ordem em que você decide atender.',
  manifesto: [
    'Docalio começou como uma ideia de aplicativo médico e cresceu até pedir um mundo próprio.',
    'Cada nível é um plantão com pacientes que se agravam em ritmos diferentes. Não dá para atender todos ao mesmo tempo, e é aí que está o jogo: priorizar sob pressão, sabendo que quem espera tem consequência.',
  ],
  /*
   * Vazio de propósito. `docs/COPY_FINAL_DO_SITE.md` proíbe listar sistemas, plataformas ou
   * escopo do Docalio antes de existirem no produto E estarem aprovados para comunicação.
   */
  recursos: [],
  aviso:
    'Docalio é uma experiência de entretenimento e aprendizagem em desenvolvimento. Casos e personagens são ficcionais. O produto não oferece diagnóstico, prescrição ou orientação para pacientes reais e não substitui formação, supervisão profissional ou protocolos oficiais.',
  banner: {
    src: '/projects/docalio/docalio-banner-final.png',
    alt: 'Key art do Docalio: cena low-poly de uma clínica de campanha vista de cima, com o médico central de uniforme branco e amarelo entre estações de atendimento. A arte traz o título DOCALIO e a assinatura Blajeen Labs.',
    largura: 1672,
    altura: 941,
  },
  icone: {
    src: '/projects/docalio/docalio-icon-512.png',
    alt: '',
    tamanho: 512,
  },
  galeria: [],
  galeriaBloqueador: 'conceptArtDocalio',
  plataformas: [],
  // Ainda sem build distribuído: as duas lojas entram como "em breve", sem data.
  disponibilidade: [
    { loja: 'appStore', nome: 'App Store', estado: 'em-breve', url: null },
    { loja: 'googlePlay', nome: 'Google Play', estado: 'em-breve', url: null },
  ],
  ogDescricao: 'Estratégia e prioridade na emergência. Experimento 02 da Blajeen Labs.',
  metaTitulo: 'Docalio — Blajeen Labs',
  metaDescricao:
    'Docalio é o jogo de estratégia médica em desenvolvimento na Blajeen Labs: salvar todos os pacientes a tempo depende de saber priorizar.',
};

export const gramelio: Project = {
  id: 'gramelio',
  nome: 'Gramelio',
  indice: 'EXPERIMENTO 03',
  estado: 'EM FORMAÇÃO',
  categoria: 'JOGO CASUAL PARA CELULAR',
  status: 'EM DESENVOLVIMENTO',
  frase: 'Coma a grama, encha o estômago, volte ao curral.',
  descricao:
    'Um jogo casual em que um toque na tela move o animal pelo mapa. Na campanha da vaca, a regra é fácil de entender e difícil de otimizar: comer a grama certa, controlar o estômago e voltar ao curral a tempo de produzir leite.',
  cta: 'CONHECER GRAMELIO',
  notaCurta:
    'Jogo em desenvolvimento. Ainda não há build público, plataforma ou data de lançamento anunciada.',
  eyebrow: 'EXPERIMENTO 03 / JOGO CASUAL',
  subtitulo: 'Coma a grama, encha o estômago, volte ao curral.',
  introducao:
    'Um toque por vez, mapas pequenos e um estômago que decide o próximo passo. Gramelio é o terceiro experimento do laboratório — e o primeiro que não fala de medicina.',
  manifesto: [
    'Gramelio nasceu de uma vontade simples: um jogo que você entende no primeiro toque e continua jogando porque quer acertar melhor.',
    'O mapa cabe na tela e o comando é um só — tocar. A dificuldade não vem de reflexo nem de pressa: vem da ordem em que você decide comer, do espaço que sobra no estômago e do caminho de volta até o curral.',
    'A vaca é a primeira campanha. O laboratório desenha outras, com outros animais e outras regras de fazenda.',
  ],
  /*
   * Vazio de propósito. Em 19/08/2026 `C:\dev\gramelio` contém somente arte: não há build,
   * código ou pacote a auditar, então nada pode ser apresentado como "o que existe hoje".
   * O que o titular descreveu é o desenho do jogo, e ele vive em `pilares`.
   */
  recursos: [],
  pilares: [
    {
      titulo: 'Um toque',
      texto:
        'Toda a partida cabe em um gesto: você toca no destino e o animal caminha até lá. Sem controle virtual, sem botão escondido.',
    },
    {
      titulo: 'O estômago',
      texto:
        'Comer enche o estômago, e um estômago cheio muda o que dá para fazer no restante da fase. Administrar esse limite é o centro do jogo.',
    },
    {
      titulo: 'O curral',
      texto:
        'A grama vira leite quando o animal volta ao curral. Cada fase é um ciclo curto entre o pasto e a volta para casa.',
    },
    {
      titulo: 'Mapas e mundos',
      texto:
        'Mapas pequenos, que cabem inteiros na tela, distribuídos por mundos com cenários e obstáculos diferentes.',
    },
    {
      titulo: 'Missões e progresso',
      texto:
        'Cada fase tem um objetivo próprio, com desafios, estrelas e conquistas para quem quiser fechar tudo.',
    },
    {
      titulo: 'Customização',
      texto:
        'Chapéus, acessórios e currais para deixar a vaca e a fazenda com a sua cara. A loja de cosméticos está no desenho; moeda, preço e forma de compra ainda não foram definidos.',
    },
  ],
  aviso:
    'Gramelio é um jogo de entretenimento em desenvolvimento. Nada nesta página descreve um aplicativo distribuído: não existe build público, ficha de loja, preço, plataforma ou data de lançamento. Fazendas, animais e missões são ficcionais e não representam prática agropecuária ou cuidado animal real.',
  banner: {
    src: '/projects/gramelio/gramelio-banner-final.png',
    alt: 'Key art do Gramelio: uma vaca de desenho mastigando grama no centro de uma fazenda ensolarada, com celeiro, moinho e riacho ao fundo. A arte traz o título GRAMELIO em uma placa de madeira, o lema "Coma. Planeje. Produza. Repita!", uma fileira de cinco mundos na base e a assinatura Blajeen Labs sobre o céu, no alto à esquerda.',
    largura: 1536,
    altura: 1024,
  },
  icone: {
    src: '/projects/gramelio/gramelio-icon-512.png',
    alt: '',
    tamanho: 512,
  },
  galeria: [],
  galeriaBloqueador: 'arteGramelio',
  plataformas: [],
  // Sem build e sem ficha: as duas lojas entram como "em breve", sem data.
  disponibilidade: [
    { loja: 'appStore', nome: 'App Store', estado: 'em-breve', url: null },
    { loja: 'googlePlay', nome: 'Google Play', estado: 'em-breve', url: null },
  ],
  ogDescricao: 'Um toque, um pasto e um estômago para administrar. Experimento 03 da Blajeen Labs.',
  metaTitulo: 'Gramelio — Blajeen Labs',
  metaDescricao:
    'Gramelio é o jogo casual em desenvolvimento na Blajeen Labs: um toque move o animal, a grama vira leite no curral e cada mapa é uma fase curta de decisões.',
};

export const projetos: readonly Project[] = [revalio, docalio, gramelio];

export const projetoPorId: Record<ProjectId, Project> = {
  revalio,
  docalio,
  gramelio,
};

/**
 * As rotas de cada produto, em um lugar só.
 *
 * Antes esse mapa existia copiado em quatro componentes, e cada projeto novo exigia lembrar dos
 * quatro. Aqui o tipo cobra: um `ProjectId` sem rotas não compila.
 */
export const rotasDoProjeto = {
  revalio: {
    pagina: ROTAS.projetoRevalio,
    suporte: ROTAS.revalioSuporte,
    privacidade: ROTAS.revalioPrivacidade,
    termos: ROTAS.revalioTermos,
    exclusao: ROTAS.revalioExclusao,
  },
  docalio: {
    pagina: ROTAS.projetoDocalio,
    suporte: ROTAS.docalioSuporte,
    privacidade: ROTAS.docalioPrivacidade,
    termos: ROTAS.docalioTermos,
    exclusao: ROTAS.docalioExclusao,
  },
  gramelio: {
    pagina: ROTAS.projetoGramelio,
    suporte: ROTAS.gramelioSuporte,
    privacidade: ROTAS.gramelioPrivacidade,
    termos: ROTAS.gramelioTermos,
    exclusao: ROTAS.gramelioExclusao,
  },
} as const satisfies Record<
  ProjectId,
  { pagina: string; suporte: string; privacidade: string; termos: string; exclusao: string }
>;

/**
 * O próximo experimento a partir de um deles, em círculo.
 *
 * Com dois produtos "o outro" bastava; com três, a página de cada jogo aponta para o seguinte da
 * lista e o último volta ao primeiro, sem nenhum caminho morto.
 */
export function proximoProjeto(projeto: Project): Project {
  const posicao = projetos.findIndex((item) => item.id === projeto.id);
  return projetos[(posicao + 1) % projetos.length]!;
}
