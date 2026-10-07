import type { Ambiente, PontoDoInterior, PortaId, Vista } from '@/lib/carrelio/tipos';

/**
 * O contrato entre a interface do Carrelio e a cena 3D do carro.
 *
 * Só tipos, sem importar o three.js: a interface depende dele sem carregar o 3D, que chega por
 * import dinâmico (`carregar.ts`) quando a pessoa mostra intenção de usar o carro. A cena não
 * conhece o catálogo: recebe a cor já em hex e os itens de versão já resolvidos.
 */

/** O que a cena precisa desenhar. A interface manda o estado inteiro; a cena aplica só a diferença. */
export type EstadoVisualCarro = {
  /** Cor da carroceria, em hex sRGB (`#rrggbb`). */
  pintura: string;
  /** Teto pintado de preto (bicolor), quando o modelo tem o teto como peça própria. */
  tetoPreto: boolean;
  /** Itens de versão que aparecem no 3D; a cena ignora os que o modelo não tem. */
  tetoPanoramico: boolean;
  rackDeTeto: boolean;
  /** Portas e porta-malas abertos. Abrem e fecham animados (ou na hora, sem movimento). */
  portas: Readonly<Record<PortaId, boolean>>;
  /** Faróis e lanternas acesos. */
  farois: boolean;
  /** Por fora (girando em volta) ou por dentro (olhando em volta a partir de um ponto). */
  vista: Vista;
  ponto: PontoDoInterior;
  ambiente: Ambiente;
  /**
   * A mesa gira sozinha. É escolha de quem olha e vale mesmo com movimento reduzido (a interface
   * só liga sozinha quando o movimento está liberado). Arrastar para a mesa.
   */
  girando: boolean;
  /** `false` com movimento reduzido ou o MOTION do rodapé desligado: transições na hora. */
  movimento: boolean;
};

/** Um ponto de toque projetado na tela, em pixels do palco (canto superior esquerdo do host). */
export type Projecao = { id: string; x: number; y: number; visivel: boolean };

/** Espaço tomado por painéis sobre o palco, em pixels: o carro se centra no que sobra. */
export type AreaLivre = { esquerda: number; direita: number; topo: number; base: number };

export interface CenaCarro {
  /** Desenha o estado. Chamado a cada mudança; a cena anima só o que mudou. */
  aplicar(estado: EstadoVisualCarro): void;
  /** Volta a câmera ao enquadramento inicial da vista atual. */
  enquadrar(): void;
  zoom(passo: 1 | -1): void;
  /** Espaço tomado por painéis sobre o palco, em pixels, para o carro ficar centrado no que sobra. */
  definirAreaLivre(area: AreaLivre): void;
  /**
   * Os pontos de toque (ids do catálogo que o manifesto do modelo posiciona) da vista atual,
   * projetados a cada quadro desenhado. Devolve a função que cancela.
   */
  aoProjetar(ouvinte: (pontos: readonly Projecao[]) => void): () => void;
  /** Toque (clique) numa porta ou no porta-malas, para a interface abrir ou fechar. */
  aoTocarPeca(ouvinte: (peca: PortaId) => void): () => void;
  /** A pessoa arrastou: a interface desliga o "girar". */
  aoArrastar(ouvinte: () => void): () => void;
  /** Contexto WebGL perdido (GPU reiniciada, aba em segundo plano no celular) ou restaurado. */
  aoMudarContexto(ouvinte: (situacao: 'perdido' | 'restaurado') => void): () => void;
  /**
   * Para "ver na sua garagem" no iPhone (Quick Look): o carro, na cor atual, em USDZ. `null` se a
   * exportação falhar. A cena não abre nada: só devolve o arquivo.
   */
  exportarUsdz(): Promise<Blob | null>;
  /** Números para o QA. */
  readonly diagnostico: { quadros: number; chamadas: number; triangulos: number };
  descartar(): void;
}

/** Como achar as partes do carro dentro do arquivo do modelo. Um por modelo (ver `modelos.ts`). */
export type ManifestoDoModelo = {
  id: string;
  /** O .glb, servido de `public/`. */
  url: string;
  /** Crédito exigido pela licença do modelo (CC BY, por exemplo); `null` quando não há. */
  credito: string | null;
  /** O modelo é um carro provisório, diferente do carro do catálogo: a interface avisa. */
  provisorio: boolean;
  /** Medidas reais do carro, em metros, para a escala (o modelo é ajustado a elas). */
  comprimentoM: number;
  /** Nomes de materiais da pintura que recebem a cor. */
  pintura: readonly string[];
  /** Nós do teto (para o bicolor e o teto panorâmico). */
  teto: readonly string[];
  /** Nós do rack de teto, que só aparecem quando a versão tem. */
  rack: readonly string[];
  /** Materiais que acendem com os faróis e com as lanternas. */
  farois: readonly string[];
  lanternas: readonly string[];
  /** Nós escondidos (logotipos e placas de terceiros, por exemplo). */
  esconder: readonly string[];
  /** Peças que abrem: o nó (com o pivô na dobradiça), o eixo local e o ângulo de abertura. */
  portas: Readonly<Partial<Record<PortaId, { no: string; eixo: 'x' | 'y' | 'z'; graus: number }>>>;
  /** Posições dos pontos de toque, em metros, no espaço do carro já ajustado (frente para +Z). */
  pontos: Readonly<Record<string, readonly [number, number, number]>>;
  /** Câmeras de dentro: olho e alvo, no mesmo espaço. */
  interior: Readonly<Partial<Record<PontoDoInterior, { olho: readonly [number, number, number]; alvo: readonly [number, number, number] }>>>;

  // ------------------------------------------------------------------------------------------
  // Campos opcionais, acrescentados pela cena (a interface não precisa deles). Todos têm um padrão
  // que vale para o modelo comum; `modelos.ts` traz `manifestoDeIa` para os modelos gerados por IA.

  /** Ids de `pontos` que são da vista de dentro; os demais são de fora. Sem a lista, todos são de fora. */
  pontosDeDentro?: readonly string[];
  /** Variante do `KHR_materials_variants` a carregar (o arquivo pode trazer várias); sem o campo, a padrão. */
  variante?: string;
  /**
   * Rotação aplicada ao modelo antes do ajuste, em graus (X, Y, Z, nessa ordem), para quando a
   * frente não vem para +Z ou o "para cima" não é +Y (comum em modelo gerado por IA). Depois dela, a
   * cena põe o comprimento em `comprimentoM`, centra o carro e apoia as rodas em y = 0.
   */
  rotacao?: readonly [number, number, number];
  /**
   * Pintura por máscara, para o modelo sem materiais de pintura separados (malha única gerada por
   * IA, com a cor da lataria assada na textura): o shader tinge o que tem a cor da lataria e mantém
   * o sombreado assado. `corBase` é a cor da lataria no arquivo (sRGB); `tolerancia` (0 a 1,
   * distância no OKLab, para mais claro e para mais escuro) diz o quanto ainda conta como lataria.
   * Metal, vidro e luzes nunca são tingidos; o que tiver a cor da lataria sem ser lataria (rodas,
   * por exemplo) sai por material ou por região. Só vale quando `pintura` está vazia.
   */
  pinturaPorMascara?: {
    corBase: string;
    tolerancia: number;
    excluirMateriais?: readonly string[];
    excluirRegioes?: readonly RegiaoDoCarro[];
    /**
     * Tinge também o que o arquivo marcou como metal (padrão: não, para cromado e espelho ficarem).
     * Para arquivos em que a própria pintura é metálica; aí cromados saem por material.
     */
    tingirMetal?: boolean;
  };
  /**
   * Vidros assados na textura (o modelo de IA não tem vidro de verdade: a janela é uma pintura
   * opaca, às vezes com os bancos assados atrás). Nessas regiões a cena não tinge e desenha vidro
   * escuro com reflexo, mantendo o que a textura mostra, bem mais escuro.
   */
  vidrosPorRegiao?: readonly RegiaoDoCarro[];
  /**
   * Vidros que o arquivo não tem (janela vazada, comum em modelo de IA: dá para ver o fundo através
   * do carro): quadriláteros de vidro escuro com reflexo, pelos quatro cantos no espaço do carro, um
   * pouco para dentro da lataria (a moldura da janela esconde as bordas). A primeira aresta (do 1º
   * para o 2º canto) sobe pela janela: é nela que o vidro faz curva, recuando 2 cm no meio, como o
   * vidro de verdade (chato, ele refletia uma faixa de luz inteira numa mancha só).
   */
  janelas?: readonly (readonly [readonly [number, number, number], readonly [number, number, number], readonly [number, number, number], readonly [number, number, number]])[];
  /**
   * O verniz da lataria. Superfície gerada por IA costuma ser ondulada, e o reflexo nítido do verniz
   * denuncia a ondulação: um verniz mais fosco (rugosidade maior) ou mais fraco esconde. Sem o
   * campo, verniz de fábrica (intensidade 1, rugosidade 0,03).
   */
  verniz?: { intensidade: number; rugosidade: number };
  /**
   * Refaz as normais soldando os vértices de mesma posição (média pesada pela área): a malha gerada
   * por IA vem cortada nas costuras da textura e com normais ruidosas, que o reflexo denuncia.
   */
  suavizarNormais?: boolean;
  /**
   * O teto do modelo de malha única (sem nó próprio para `teto`): nessa região a pintura vale mesmo
   * onde o assado é mais claro, e o teto fica preto (`tetoPreto`) ou de vidro (`tetoPanoramico`).
   */
  tetoPorRegiao?: readonly RegiaoDoCarro[];
  /** Metal por região (as rodas do modelo de malha única): a parte clara da textura vira alumínio polido. */
  metalPorRegiao?: readonly RegiaoDoCarro[];
  /**
   * Faróis e lanternas por região, para o modelo em que eles são parte da textura (sem material
   * próprio): regiões no espaço do carro onde os faróis acendem (a parte clara da textura brilha;
   * nas lanternas, a vermelha) e de onde saem os halos e a poça de luz.
   */
  regioesDeLuz?: { farois?: readonly RegiaoDoCarro[]; lanternas?: readonly RegiaoDoCarro[] };
  /** Materiais que são telas (painel, multimídia): só eles mantêm a textura emissiva, além das luzes. */
  telas?: readonly string[];
  /** Por material, mapas com marcas de terceiros: a cena tira o mapa e o material fica liso. */
  semMarcas?: Readonly<Record<string, readonly ('map' | 'normalMap' | 'emissiveMap')[]>>;
  /** Ajustes finos de acabamento por material, para o que o arquivo trouxe fora do tom. */
  acabamentos?: Readonly<Record<string, { cor?: string; rugosidade?: number; metalico?: number }>>;
};

/**
 * Uma região no espaço do carro já ajustado, em metros, com borda suave de 2 cm: uma caixa (centro,
 * meias medidas e inclinação em graus em torno de X, para vidro deitado como o para-brisa) ou um
 * cilindro deitado em X (roda: centro, raio e meia largura).
 */
export type RegiaoDoCarro =
  | { centro: readonly [number, number, number]; meias: readonly [number, number, number]; inclinacao?: number }
  | { centro: readonly [number, number, number]; raio: number; meiaLargura: number };

export type OpcoesDoCarro = {
  modelo: ManifestoDoModelo;
  /** O estado que a interface já tem: o primeiro quadro (o que substitui o pôster) já sai certo. */
  estado: EstadoVisualCarro;
  /**
   * A área livre do palco desde o primeiro quadro (a barra de controles no pé): o carro já nasce
   * centrado no que sobra, como no pôster, sem deslizar para o lugar depois da carga.
   */
  areaLivre?: AreaLivre;
};

/**
 * A entrada do import dinâmico: `import('./carregar').then((m) => m.carregarCarro(host, opcoes))`.
 *
 * Comportamentos da cena que a interface pode contar com eles:
 * - na vista de dentro pelo ponto `portaMalas`, a tampa abre sozinha enquanto a câmera está lá (a
 *   câmera olha de trás para dentro do porta-malas), sem mudar `portas.portaMalas`;
 * - vista `dentro` num ponto sem câmera no manifesto mantém a câmera de fora;
 * - `aoProjetar` manda só os pontos da vista atual (`pontosDeDentro` separa os de dentro).
 */
export type CarregarCarro = (host: HTMLElement, opcoes: OpcoesDoCarro) => Promise<CenaCarro>;
