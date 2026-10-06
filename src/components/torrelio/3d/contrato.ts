import type { Enquadramento, Estacao, Fachada, Modo } from '@/lib/torrelio/tipos';

/**
 * O contrato entre a interface do Torrelio e a cena 3D da torre.
 *
 * Este arquivo só tem tipos, sem importar o three.js: a interface depende dele sem carregar o 3D,
 * que chega por import dinâmico (`carregar.ts`) quando a pessoa mostra intenção de usar a maquete.
 * Os índices são os de `UNIDADES` (modo incorporadora) ou de `QUARTOS` (modo hotel), em
 * `src/lib/torrelio/predio.ts`; o mapa de cada vão para o seu dono é `mapaDeVaos(modo)`.
 */

/** A tabela de luzes mora no domínio, que a calcula; a cena só a desenha. */
export { LUZ, type Luz } from '@/lib/torrelio/luz';

/** O que a cena precisa desenhar. A interface manda o estado inteiro; a cena aplica só a diferença. */
export type EstadoVisualTorre = {
  modo: Modo;
  camada: 'comercial' | 'obra';
  /** Um valor de `LUZ` por unidade (ou quarto), na ordem dos índices. */
  luzes: Uint8Array;
  /** 1 nas unidades (ou quartos) que o contorno de "disponíveis" deve marcar. */
  disponiveis: Uint8Array;
  selecionada: number | null;
  /** Andar com a faixa de destaque (passar o mouse no espelho), ou nenhum. */
  pavimentoEmDestaque: number | null;
  contornar: boolean;
  /** Hora solar, de 5 a 23 (aceita fração: 17,5 é 17h30). */
  hora: number;
  estacao: Estacao;
  /** Andamento da obra fictícia: a estrutura sobe até um pavimento, o vidro até outro. */
  obra: { estruturaAte: number; fachadaAte: number };
  /** `false` com movimento reduzido no sistema ou o botão MOVIMENTO desligado: nada anima. */
  movimento: boolean;
};

/** Um ponto da cena projetado na tela, em pixels do palco. */
export type Projecao = { x: number; y: number; visivel: boolean };

/** O que a câmera está mostrando. */
export type ModoDaCamera = 'predio' | 'transicao' | 'vista';

export interface CenaTorre {
  /** Desenha o estado. Chamado a cada mudança; luzes acendem com fade (ou na hora, sem movimento). */
  aplicar(estado: EstadoVisualTorre): void;
  enquadrar(alvo: Enquadramento): void;
  /** Contorna o prédio até a unidade ficar de frente para a câmera, se ela estiver de costas. */
  mostrarUnidade(indice: number): void;
  /** Leva a câmera à varanda da unidade (ou quarto), olhando para fora pela fachada pedida. */
  verVista(alvo: { indice: number; fachada: Fachada }): void;
  /** Dentro da vista: troca para outra unidade (outro andar, mesmo final) sem sair dela. */
  mudarAndarDaVista(indice: number): void;
  olhar(direcao: 'esquerda' | 'direita' | 'cima' | 'baixo'): void;
  voltarAoPredio(): void;
  girar(modo: 'continuo' | 'parar' | 'passo'): void;
  zoom(passo: 1 | -1): void;
  /** Espaço tomado pelos painéis sobre o palco, em pixels, para a torre ficar centrada no que sobra. */
  definirAreaLivre(area: { esquerda: number; direita: number; topo: number; base: number }): void;
  /** Clique (ou toque) numa unidade, ou fora dela (`null`). Devolve a função que cancela. */
  aoEscolher(ouvinte: (indice: number | null) => void): () => void;
  /** Ponteiro passando sobre uma unidade. */
  aoPassar(ouvinte: (indice: number | null) => void): () => void;
  /** Posição na tela do marcador da unidade selecionada, a cada quadro em que ela muda. */
  aoProjetar(ouvinte: (marcador: Projecao | null) => void): () => void;
  /** Rumo da câmera, em graus a partir do norte, no sentido horário: para a bússola. */
  aoMudarRumo(ouvinte: (rumo: number) => void): () => void;
  aoMudarCamera(ouvinte: (modo: ModoDaCamera) => void): () => void;
  /**
   * Opcional: o contexto WebGL caiu (GPU reiniciada, aba em segundo plano no celular) ou voltou.
   * Perdido, a interface pode mostrar o pôster com "Recarregando a torre…"; restaurado, a cena já
   * se redesenhou sozinha.
   */
  aoMudarContexto?(ouvinte: (situacao: 'perdido' | 'restaurado') => void): () => void;
  /** Números para o QA: quadros desenhados e o custo do último. */
  readonly diagnostico: { quadros: number; chamadas: number; triangulos: number };
  descartar(): void;
}

export type OpcoesDaTorre = {
  movimento: boolean;
  /** Celular e aparelho fraco pedem menos (sem sombra, resolução menor). */
  qualidade?: 'alto' | 'medio' | 'baixo';
  /**
   * Opcional: o estado que a interface já tem. Assim o primeiro quadro (o que substitui o pôster)
   * já sai com a hora, as luzes e a seleção certas. Sem ele, a cena abre no estado do pôster
   * (tabela de lançamento, 1803 selecionada, dia de verão às 10h, contorno das disponíveis ligado).
   */
  estado?: EstadoVisualTorre;
};

/** A entrada do import dinâmico: `import('./carregar').then((m) => m.carregarTorre(host, opcoes))`. */
export type CarregarTorre = (host: HTMLElement, opcoes: OpcoesDaTorre) => Promise<CenaTorre>;
