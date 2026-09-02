import type { BloqueadorId, Campo } from './blockers';

export type ProjectId = 'revalio' | 'docalio' | 'gramelio' | 'catelio' | 'dogolio' | 'morvelio';

export type ProjectStatus = 'EM DESENVOLVIMENTO' | 'DISPONÍVEL';

export type ExperimentState = 'ATIVO' | 'EM FORMAÇÃO';

export type Plataforma = {
  readonly nome: string;
  readonly estado: string;
};

/** Onde um produto pode ser obtido, e em que estado. */
export type LojaId = 'appStore' | 'googlePlay';

export type Disponibilidade = {
  readonly loja: LojaId;
  readonly nome: string;
  /** `disponivel` só quando o app está publicado e a ficha responde. */
  readonly estado: 'disponivel' | 'em-breve';
  /**
   * URL da ficha. Fica vazia enquanto o endereço não for confirmado: um botão de loja que não
   * leva a lugar nenhum é pior do que a ausência dele, e reprova a revisão das próprias lojas.
   */
  readonly url: string | null;
  /** Qual decisão humana falta, quando `url` é nula por pendência e não por escolha. */
  readonly bloqueador?: BloqueadorId;
};

/** Recurso confirmado por documentação auditada do build. Nunca por suposição. */
export type Recurso = {
  readonly titulo: string;
  readonly texto: string;
};

/**
 * Pilar de desenho de um jogo que ainda não tem build público.
 *
 * Existe para separar duas coisas que o site não pode confundir: o que já roda no aplicativo
 * (`recursos`, apresentado como "o que existe no build hoje") e o que o jogo está sendo desenhado
 * para ser. A página rotula o bloco como desenho, não como recurso pronto.
 */
export type Pilar = {
  readonly titulo: string;
  readonly texto: string;
};

export type Captura = {
  readonly src: string;
  readonly alt: string;
  readonly largura: number;
  readonly altura: number;
  readonly legenda: string;
};

export type Project = {
  readonly id: ProjectId;
  readonly nome: string;
  readonly indice: string;
  readonly estado: ExperimentState;
  readonly categoria: string;
  readonly status: ProjectStatus;
  readonly frase: string;
  readonly descricao: string;
  readonly cta: string;
  readonly notaCurta: string;
  readonly eyebrow: string;
  readonly subtitulo: string;
  readonly introducao: string;
  readonly manifesto: readonly string[];
  /** Vazio quando nada foi confirmado no build e aprovado para comunicação. */
  readonly recursos: readonly Recurso[];
  /**
   * O desenho do jogo, para produtos que ainda não têm build público. Nunca substitui `recursos`:
   * os dois blocos existem separados porque a página precisa dizer qual é qual.
   */
  readonly pilares?: readonly Pilar[];
  readonly aviso: string;
  readonly banner: {
    readonly src: string;
    readonly alt: string;
    readonly largura: number;
    readonly altura: number;
  };
  /** Ícone do produto, usado onde a pessoa escolhe entre os dois jogos. */
  readonly icone: {
    readonly src: string;
    readonly alt: string;
    readonly tamanho: number;
  };
  /** Vazio enquanto o titular não selecionar mídia aprovada. Nunca preencher com mockup. */
  readonly galeria: readonly Captura[];
  readonly galeriaBloqueador: BloqueadorId;
  /** Somente plataformas confirmadas por documentação auditada. */
  readonly plataformas: readonly Plataforma[];
  /** Presença nas lojas, uma entrada por loja. */
  readonly disponibilidade: readonly Disponibilidade[];
  /**
   * Data de publicação nas lojas, em ISO. Até ela chegar, o site mostra o produto como em
   * desenvolvimento — ver `estado-do-projeto.ts`. Ausente enquanto não houver data.
   */
  readonly lancamento?: string;
  readonly ogDescricao: string;
  readonly metaTitulo: string;
  readonly metaDescricao: string;
};

export type LegalBlock =
  | { readonly tipo: 'paragrafo'; readonly texto: string }
  | { readonly tipo: 'lista'; readonly itens: readonly string[] }
  | { readonly tipo: 'passos'; readonly itens: readonly string[] }
  | { readonly tipo: 'destaque'; readonly texto: string }
  | { readonly tipo: 'contato'; readonly rotulo: string; readonly email: Campo<string>; readonly assunto?: string }
  | { readonly tipo: 'pendente'; readonly bloqueador: BloqueadorId; readonly explicacao: string };

export type LegalSection = {
  readonly id: string;
  readonly titulo: string;
  readonly blocos: readonly LegalBlock[];
};

export type LegalDocumentKind = 'privacidade' | 'termos' | 'suporte' | 'exclusao';

export type LegalDocument = {
  readonly rota: string;
  readonly kind: LegalDocumentKind;
  readonly produto: 'Blajeen Labs' | 'Revalio' | 'Docalio' | 'Gramelio' | 'Catelio' | 'Dogolio' | 'Morvelio';
  readonly titulo: string;
  readonly resumo: string;
  /**
   * `preparacao` enquanto houver bloqueador humano aberto. O documento continua público e
   * navegável, mas se declara versão de trabalho — nunca finge estar aprovado.
   */
  readonly estado: 'preparacao' | 'publicado';
  readonly atualizacao: Campo<string>;
  readonly secoes: readonly LegalSection[];
  readonly relacionados: readonly { readonly href: string; readonly rotulo: string }[];
  readonly metaTitulo: string;
  readonly metaDescricao: string;
};

export type NavLink = {
  readonly indice: string;
  readonly rotulo: string;
  readonly descricao: string;
  readonly href: string;
  readonly icone: NavIconId;
};

export type NavIconId =
  | 'inicio'
  | 'engenharia'
  | 'projetos-feitos'
  | 'produtos'
  | 'jogos'
  | 'estudio'
  | 'novidades'
  | 'contato';
