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

export const catelio: Project = {
  id: 'catelio',
  nome: 'Catelio',
  indice: 'EXPERIMENTO 04',
  estado: 'EM FORMAÇÃO',
  categoria: 'JOGO CASUAL DE EXPLORAÇÃO',
  status: 'EM DESENVOLVIMENTO',
  frase: 'Um toque, um gato e um mundo para descobrir.',
  descricao:
    'Um jogo casual de exploração em que você guia um gato por regiões pequenas, encontra comida, conhece personagens e descobre novos caminhos.',
  cta: 'CONHECER CATELIO',
  notaCurta:
    'Jogo em desenvolvimento. Ainda não há build público, plataforma ou data de lançamento anunciada.',
  eyebrow: 'EXPERIMENTO 04 / JOGO CASUAL',
  subtitulo: 'Um toque, um gato e um mundo para descobrir.',
  introducao:
    'Catelio é um jogo casual em desenvolvimento sobre explorar, cuidar e voltar para casa — com mapas compactos, interações leves e um gato como protagonista.',
  manifesto: [
    'Catelio nasceu de uma ideia simples: transformar a curiosidade de um gato em uma jornada que cabe na tela e convida a explorar sem pressa.',
    'Cada região combina caminhos, comida, personagens e pequenos acontecimentos. O jogador decide para onde ir, o que descobrir e quando voltar.',
  ],
  recursos: [],
  pilares: [
    {
      titulo: 'Um toque',
      texto: 'Toque no destino e o gato caminha até lá. O comando é direto, legível e pensado para celular.',
    },
    {
      titulo: 'Exploração em regiões',
      texto: 'Mapas compactos, com passagens e pontos de interesse que incentivam voltar e observar melhor.',
    },
    {
      titulo: 'Fome e cuidado',
      texto: 'Encontrar alimentos e administrar a fome cria um ritmo leve entre explorar, interagir e retornar.',
    },
    {
      titulo: 'Momentos de gato',
      texto: 'Interações opcionais com personagens e objetos dão personalidade ao caminho sem interromper o controle.',
    },
    {
      titulo: 'Novos mundos',
      texto: 'A estrutura foi pensada para receber regiões, animais, objetos e desafios novos ao longo do tempo.',
    },
  ],
  aviso:
    'Catelio é um jogo de entretenimento em desenvolvimento. Não existe build público, conta, compra ou data de lançamento anunciada. Personagens, regiões e situações são ficcionais e não representam orientação sobre cuidados reais com animais.',
  banner: {
    src: '/projects/catelio/catelio-banner-city.png',
    alt: 'Catelio em uma cidade noturna low-poly: um gato laranja explora telhados iluminados e caminhos cheios de descobertas.',
    largura: 1672,
    altura: 941,
  },
  icone: {
    src: '/projects/catelio/catelio-icon-512.png',
    alt: '',
    tamanho: 512,
  },
  galeria: [],
  galeriaBloqueador: 'conceptArtCatelio',
  plataformas: [],
  disponibilidade: [
    { loja: 'appStore', nome: 'App Store', estado: 'em-breve', url: null },
    { loja: 'googlePlay', nome: 'Google Play', estado: 'em-breve', url: null },
  ],
  ogDescricao: 'Exploração casual com um gato. Experimento 04 da Blajeen Labs.',
  metaTitulo: 'Catelio — Blajeen Labs',
  metaDescricao:
    'Catelio é o jogo casual de exploração em desenvolvimento na Blajeen Labs: um toque guia o gato por regiões, alimentos e descobertas.',
};

export const dogolio: Project = {
  id: 'dogolio',
  nome: 'Dogolio',
  indice: 'EXPERIMENTO 05',
  estado: 'EM FORMAÇÃO',
  categoria: 'JOGO CASUAL DE EXPLORAÇÃO',
  status: 'EM DESENVOLVIMENTO',
  frase: 'A cidade também é casa.',
  descricao:
    'Um jogo casual sobre um cachorro caramelo que percorre a mesma cidade do Catelio, encontra pessoas, descobre caminhos e transforma cada passeio em uma nova história.',
  cta: 'CONHECER DOGOLIO',
  notaCurta:
    'Jogo em desenvolvimento. Ainda não há build público, plataforma ou data de lançamento anunciada.',
  eyebrow: 'EXPERIMENTO 05 / JOGO CASUAL',
  subtitulo: 'A cidade também é casa.',
  introducao:
    'Dogolio acompanha um cachorro caramelo andando pela cidade do Catelio: uma aventura leve sobre vizinhança, encontros e pequenas descobertas.',
  manifesto: [
    'Dogolio compartilha o mesmo mapa-base do Catelio, mas olha para a cidade a partir da rua: calçadas, praças, lojas e pessoas que fazem cada bairro ter seu próprio ritmo.',
    'O cachorro caramelo é o guia. Em cada passeio, ele encontra personagens, cria vínculos e abre novas possibilidades para continuar explorando.',
  ],
  recursos: [],
  pilares: [
    {
      titulo: 'Passeios pela cidade',
      texto: 'Caminhos curtos e legíveis para explorar bairros, praças e pontos de encontro sem pressa.',
    },
    {
      titulo: 'O cachorro caramelo',
      texto: 'Um protagonista carismático que reage ao ambiente e dá personalidade a cada descoberta.',
    },
    {
      titulo: 'Encontros de rua',
      texto: 'Personagens e situações cotidianas que transformam um passeio simples em uma pequena história.',
    },
    {
      titulo: 'Cidade compartilhada',
      texto: 'Regiões do Dogolio e do Catelio se conectam para construir um universo comum, com novos caminhos a cada capítulo.',
    },
    {
      titulo: 'Histórias que continuam',
      texto: 'A estrutura foi pensada para receber bairros, missões e encontros novos ao longo do tempo.',
    },
  ],
  aviso:
    'Dogolio é um jogo de entretenimento em desenvolvimento sobre um cachorro caramelo. Não existe build público, conta, compra ou data de lançamento anunciada. A cidade, os personagens e as situações são ficcionais e não representam orientação sobre cuidados reais com animais.',
  banner: {
    src: '/projects/dogolio/dogolio-banner-city.png',
    alt: 'Dogolio em uma cidade noturna detalhada: um cachorro caramelo caminha por ruas iluminadas em direção ao centro da cidade.',
    largura: 1672,
    altura: 941,
  },
  icone: {
    src: '/projects/dogolio/dogolio-icon-512.png',
    alt: '',
    tamanho: 512,
  },
  galeria: [],
  galeriaBloqueador: 'conceptArtDogolio',
  plataformas: [],
  disponibilidade: [
    { loja: 'appStore', nome: 'App Store', estado: 'em-breve', url: null },
    { loja: 'googlePlay', nome: 'Google Play', estado: 'em-breve', url: null },
  ],
  ogDescricao: 'Exploração casual com um cachorro caramelo. Experimento 05 da Blajeen Labs.',
  metaTitulo: 'Dogolio — Blajeen Labs',
  metaDescricao:
    'Dogolio é o jogo casual em desenvolvimento na Blajeen Labs sobre um cachorro caramelo explorando a mesma cidade do Catelio.',
};

export const morvelio: Project = {
  id: 'morvelio',
  nome: 'Morvelio',
  indice: 'EXPERIMENTO 06',
  estado: 'EM FORMAÇÃO',
  categoria: 'JOGO AUTORAL EM FORMAÇÃO',
  status: 'EM DESENVOLVIMENTO',
  frase: 'Monte um trio. Avance. Decida quando recuar.',
  descricao:
    'Um action-roguelite mobile em visão top-down: monte um trio, avance por uma cidadela congelada e decida a cada orbe se o próximo corredor vale o risco.',
  cta: 'CONHECER MORVELIO',
  notaCurta:
    'Jogo em desenvolvimento. O conceito, a plataforma e a data de lançamento ainda não foram anunciados.',
  eyebrow: 'EXPERIMENTO 06 / JOGO AUTORAL',
  subtitulo: 'Uma cidadela congelada. Um trio. Escolhas que cobram juros.',
  introducao:
    'Morvelio é um jogo autoral em desenvolvimento sobre atravessar uma cidadela congelada, alternar entre heróis e escolher entre continuar a expedição ou voltar ao acampamento.',
  manifesto: [
    'Morvelio nasceu para abrir espaço a uma nova ideia dentro do laboratório: um jogo de ação e exploração em que cada avanço muda o risco da próxima decisão.',
    'O mundo, o ritmo e as regras são prototipados antes de qualquer promessa. O que permanecerá no produto final será escolhido pelo que fizer sentido para a experiência.',
  ],
  recursos: [],
  pilares: [
    {
      titulo: 'Trio tático',
      texto: 'Monte uma equipe de heróis e alterne entre eles para atravessar cada encontro.',
    },
    {
      titulo: 'Avançar ou recuar',
      texto: 'Orbes e corredores criam decisões de risco antes do próximo combate.',
    },
    {
      titulo: 'Uma cidadela congelada',
      texto: 'Uma direção de arte fantástica dá unidade ao primeiro mapa e aos seus desafios.',
    },
    {
      titulo: 'Protótipos antes de promessas',
      texto: 'Cada mecânica é testada e refinada antes de ser apresentada como parte do jogo.',
    },
  ],
  aviso:
    'Morvelio é um jogo de entretenimento em desenvolvimento. Não existe build público, conta, compra, plataforma ou data de lançamento anunciada. O mundo, os personagens e as situações são ficcionais e qualquer detalhe do conceito pode mudar durante a criação.',
  banner: {
    src: '/projects/morvelio/morvelio-banner.png',
    alt: 'Banner oficial do Morvelio com uma cidadela fantástica iluminada por um eclipse violeta, personagens em primeiro plano e o título MORVELIO.',
    largura: 1536,
    altura: 1024,
  },
  icone: {
    src: '/projects/morvelio/morvelio-icon-512.png',
    alt: '',
    tamanho: 512,
  },
  galeria: [],
  galeriaBloqueador: 'conceptArtMorvelio',
  plataformas: [],
  disponibilidade: [
    { loja: 'appStore', nome: 'App Store', estado: 'em-breve', url: null },
    { loja: 'googlePlay', nome: 'Google Play', estado: 'em-breve', url: null },
  ],
  ogDescricao: 'Um novo mundo autoral em formação. Experimento 06 da Blajeen Labs.',
  metaTitulo: 'Morvelio — Blajeen Labs',
  metaDescricao:
    'Morvelio é o novo jogo autoral em formação da Blajeen Labs: um mundo próprio sendo descoberto por meio de protótipos e experimentos.',
};

export const projetos: readonly Project[] = [revalio, docalio, gramelio, catelio, dogolio, morvelio];

export const projetoPorId: Record<ProjectId, Project> = {
  revalio,
  docalio,
  gramelio,
  catelio,
  dogolio,
  morvelio,
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
  catelio: {
    pagina: ROTAS.projetoCatelio,
    suporte: ROTAS.catelioSuporte,
    privacidade: ROTAS.catelioPrivacidade,
    termos: ROTAS.catelioTermos,
    exclusao: ROTAS.catelioExclusao,
  },
  dogolio: {
    pagina: ROTAS.projetoDogolio,
    suporte: ROTAS.dogolioSuporte,
    privacidade: ROTAS.dogolioPrivacidade,
    termos: ROTAS.dogolioTermos,
    exclusao: ROTAS.dogolioExclusao,
  },
  morvelio: {
    pagina: ROTAS.projetoMorvelio,
    suporte: ROTAS.morvelioSuporte,
    privacidade: ROTAS.morvelioPrivacidade,
    termos: ROTAS.morvelioTermos,
    exclusao: ROTAS.morvelioExclusao,
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
