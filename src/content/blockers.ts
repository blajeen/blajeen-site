/**
 * Bloqueadores humanos.
 *
 * Cada item aqui é uma informação que NÃO pode ser inferida, deduzida ou inventada por um agente:
 * ela depende de decisão do titular, de conta externa ou de revisão jurídica. A lista espelha
 * `docs/DECISOES_ANTES_DE_PUBLICAR.md` e é a fonte de verdade do `npm run check:content`.
 *
 * Regra do projeto: nenhum valor bloqueado pode ser renderizado como se fosse informação válida.
 * A interface só pode mostrá-lo como estado explícito de "em definição".
 */

export const BLOQUEADORES = {
  titularNome: {
    titulo: 'Nome civil ou razão social do controlador',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Identidade e infraestrutura',
    // TODO(bloqueador): `C:\dev\revalio\docs\publicacao\DECISOES_DO_TITULAR.md` confirma a grafia
    // "Breno Ricardo Guimaraes", mas NÃO confirma se o titular publicado será pessoa física ou
    // jurídica. Enquanto a escolha não existir, nenhum documento jurídico pode nomear o controlador.
  },
  titularDocumento: {
    titulo: 'CPF ou CNPJ do controlador',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Identidade e infraestrutura',
    // TODO(bloqueador): depende de `titularNome`.
  },
  titularEndereco: {
    titulo: 'Endereço legal publicável',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Identidade e infraestrutura',
    // TODO(bloqueador): exigido por Apple, Google e LGPD nos documentos públicos.
  },
  prazoExclusao: {
    titulo: 'Prazo operacional para concluir pedidos de titulares',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Privacidade e jurídico',
    // TODO(bloqueador): prazo em dias. Apple e Google aceitam a página sem número, mas a LGPD
    // exige prazo informado; não estimar.
  },
  canalLgpd: {
    titulo: 'Encarregado ou canal LGPD aplicável',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Privacidade e jurídico',
    // TODO(bloqueador): depende da escolha entre pessoa física e jurídica.
  },
  revisaoJuridica: {
    titulo: 'Revisão jurídica dos textos publicados',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Privacidade e jurídico',
    // TODO(bloqueador): enquanto aberto, todo documento legal deste site é "versão de trabalho".
  },
  foroJuridico: {
    titulo: 'Lei aplicável e método de resolução de conflitos',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Privacidade e jurídico',
    // TODO(bloqueador): `C:\dev\revalio\docs\publicacao\RASCUNHO_TERMOS_DE_USO.md` §13 marca o foro
    // como pendente de validação jurídica.
  },
  hospedagemLogs: {
    titulo: 'Retenção dos registros de acesso da hospedagem',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Site',
    // O provedor já está definido: Vercel, desde o deploy de 17/08/2026, e a política já o nomeia.
    // TODO(bloqueador): falta o que depende de conta e contrato — por quanto tempo os registros
    // ficam guardados no plano contratado e a confirmação do acordo de tratamento de dados da
    // Vercel. Sem isso a política não pode declarar prazo de retenção.
  },
  onboardingRetencao: {
    titulo: 'Prazo de retenção dos dados e arquivos de onboarding',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Portal de onboarding',
    // TODO(bloqueador): definir por quanto tempo respostas, arquivos, revisões e histórico serão
    // mantidos depois da publicação ou do arquivamento do projeto. Não estimar prazo jurídico.
  },
  lojasRevalio: {
    titulo: 'URLs das fichas do Revalio na App Store e no Google Play',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Revalio',
    // TODO(bloqueador): o titular informou em 18/08/2026 que o app já está publicado nas duas
    // lojas, mas os endereços das fichas ainda não foram passados. Sem eles os botões de loja não
    // podem virar link — um botão que não abre a loja é pior do que a ausência dele.
  },
  screenshotsRevalio: {
    titulo: 'Capturas reais do Revalio aprovadas para o site',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Site',
    // TODO(bloqueador): a galeria de `/projects/revalio` só renderiza quando
    // `projetoRevalio.galeria` receber capturas selecionadas pelo titular. Não usar mockup.
  },
  conceptArtDocalio: {
    titulo: 'Concept art autorizada do Docalio',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Site',
    // TODO(bloqueador): idem para `/projects/docalio`. Key art aprovada ≠ screenshot de loja.
  },
  contaDocalio: {
    titulo: 'Decisão sobre conta, nuvem e telemetria no Docalio',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Docalio',
    // TODO(bloqueador): a auditoria de 16/08/2026 em `C:\dev\docalio` mostra save 100% local,
    // sem conta e sem backend. Enquanto isso não mudar, a política do Docalio não pode descrever
    // fluxo de conta como existente.
  },
  escopoGramelio: {
    titulo: 'Decisão sobre conta, nuvem, compras e telemetria no Gramelio',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Gramelio',
    // TODO(bloqueador): em 19/08/2026 `C:\dev\gramelio` contém apenas arte — não há build, código
    // ou backend a auditar. A loja de cosméticos descrita pelo titular é desenho de jogo, não
    // comportamento verificado, então nenhuma política pode descrever compra, conta ou
    // sincronização como existentes.
  },
  arteGramelio: {
    titulo: 'Capturas reais ou concept art autorizada do Gramelio',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Site',
    // TODO(bloqueador): as folhas de referência visual entregues em `C:\dev\gramelio\art`
    // (mapas, loja/vestuário, splash) são documentos internos de desenho — trazem anotações de
    // produção e o nome anterior do projeto. Publicá-las como galeria daria a entender que são
    // telas do jogo.
  },
  conceptArtCatelio: {
    titulo: 'Capturas reais ou concept art autorizada do Catelio',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Site',
    // TODO(bloqueador): o ícone oficial existe, mas capturas de gameplay ainda não foram
    // selecionadas para comunicação pública.
  },
  conceptArtDogolio: {
    titulo: 'Capturas reais ou concept art autorizada do Dogolio',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Site',
    // TODO(bloqueador): a logo do Dogolio foi criada para a apresentação do conceito;
    // capturas de gameplay ainda não foram selecionadas para comunicação pública.
  },
  conceptArtMorvelio: {
    titulo: 'Capturas reais ou concept art autorizada do Morvelio',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Site',
    // TODO(bloqueador): o banner e o ícone apresentam a identidade do conceito; capturas de
    // gameplay ainda não foram selecionadas para comunicação pública.
  },
  conceptArtMazelio: {
    titulo: 'Capturas reais ou concept art adicional autorizada do Mazelio',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Site',
  },
  conceptArtSocialio: {
    titulo: 'Capturas reais ou concept art adicional autorizada do Socialio',
    docs: 'docs/DECISOES_ANTES_DE_PUBLICAR.md — Site',
  },
} as const satisfies Record<string, { titulo: string; docs: string }>;

export type BloqueadorId = keyof typeof BLOQUEADORES;

/** Um valor que ainda depende de decisão humana. */
export type Pendente = {
  readonly definido: false;
  readonly bloqueador: BloqueadorId;
};

/** Um valor confirmado por documentação auditada. */
export type Definido<T> = {
  readonly definido: true;
  readonly valor: T;
  /** De onde veio a confirmação. Mantém o rastro auditável dentro do código. */
  readonly fonte: string;
};

export type Campo<T> = Pendente | Definido<T>;

export function definido<T>(valor: T, fonte: string): Definido<T> {
  return { definido: true, valor, fonte };
}

export function pendente(bloqueador: BloqueadorId): Pendente {
  return { definido: false, bloqueador };
}

export function valorOu<T>(campo: Campo<T>, alternativa: T): T {
  return campo.definido ? campo.valor : alternativa;
}
