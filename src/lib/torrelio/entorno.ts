import { ANDAR_VISTA_MAR, cota, LARGURA_DO_VAO, NORMAL_DA_FACHADA, TORRE } from './predio';
import type { Fachada, Quarto, Trecho, Unidade } from './tipos';

/**
 * O entorno fictício de Porto Lume, em volta do Residencial Vértice: o que se vê de cada andar e
 * de cada fachada. É a fonte do texto da vista ("Ver a vista desta unidade") e do 3D da paisagem,
 * para os dois nunca se contradizerem.
 *
 * - Frente (norte): avenida arborizada, uma fileira de prédios do outro lado e, mais longe, o centro.
 * - Fundos (sul): parque linear com lago, casas baixas, a orla e o mar ao fundo; morros e farol a sudeste.
 * - Lateral leste: uma torre vizinha, perto, que fecha a vista dos andares baixos.
 * - Lateral oeste: rua lateral e casario; é o lado do pôr do sol.
 *
 * PROVISÓRIO (etapa 0): as visibilidades abaixo são regras por andar. A versão final calcula com
 * as caixas e os marcos da paisagem (os mesmos que o 3D desenha), mantendo assinaturas e testes.
 */

export type MarcoId =
  | 'avenida' | 'predios-da-avenida' | 'centro' | 'parque' | 'lago' | 'mar' | 'morros' | 'farol' | 'torre-vizinha' | 'casario';

export type Visibilidade = 'visivel' | 'parcial' | 'oculto';

export const NOMES_DOS_MARCOS: Readonly<Record<MarcoId, string>> = {
  avenida: 'a avenida arborizada',
  'predios-da-avenida': 'os prédios do outro lado da avenida',
  centro: 'as torres do centro',
  parque: 'o parque',
  lago: 'o lago',
  mar: 'o mar',
  morros: 'os morros',
  farol: 'o farol',
  'torre-vizinha': 'a torre vizinha',
  casario: 'o casario',
};

/** A partir deste andar, a lateral leste vê por cima da torre vizinha. */
export const ANDAR_ACIMA_DO_VIZINHO = 14;
/** A partir deste andar, a frente vê o centro por cima dos prédios do outro lado da avenida. */
export const ANDAR_VISTA_CENTRO = 6;

export type PontoDeVista = {
  pavimento: number;
  fachada: Fachada;
  /** Olho de quem está na varanda: centro do trecho, 1,55 m acima da laje, 0,6 m para fora. */
  olho: readonly [number, number, number];
  direcao: readonly [number, number, number];
};

const ALTURA_DO_OLHO = 1.55;
const PARA_FORA = 0.6;

export function pontoDeVista(alvo: { pavimento: number; trecho: Trecho }): PontoDeVista {
  const { pavimento, trecho } = alvo;
  const { fachada } = trecho;
  const meio = (LARGURA_DO_VAO[fachada] * (trecho.de + trecho.ate)) / 2;
  const normal = NORMAL_DA_FACHADA[fachada];
  const x0 = fachada === 'norte' || fachada === 'sul' ? -TORRE.largura / 2 + meio : (normal[0] * TORRE.largura) / 2;
  const z0 = fachada === 'leste' || fachada === 'oeste' ? -TORRE.profundidade / 2 + meio : (normal[2] * TORRE.profundidade) / 2;
  const olho: [number, number, number] = [x0 + normal[0] * PARA_FORA, cota(pavimento) + ALTURA_DO_OLHO, z0 + normal[2] * PARA_FORA];
  return { pavimento, fachada, olho, direcao: normal };
}

/** O que aparece, para quem olha pela fachada, e em que estado. Na ordem de perto para longe. */
export function marcosVisiveis(p: PontoDeVista): readonly { id: MarcoId; nome: string; estado: Visibilidade }[] {
  const { pavimento } = p;
  const marco = (id: MarcoId, estado: Visibilidade) => ({ id, nome: NOMES_DOS_MARCOS[id], estado });
  switch (p.fachada) {
    case 'norte':
      return [
        marco('avenida', 'visivel'),
        marco('predios-da-avenida', 'visivel'),
        marco('centro', pavimento >= ANDAR_VISTA_CENTRO ? 'visivel' : 'parcial'),
      ];
    case 'sul':
      return [
        marco('parque', 'visivel'),
        marco('lago', pavimento >= 5 ? 'visivel' : 'parcial'),
        marco('mar', pavimento >= ANDAR_VISTA_MAR ? 'visivel' : 'oculto'),
        marco('morros', 'visivel'),
        marco('farol', 'visivel'),
      ];
    case 'leste': {
      const acima = pavimento >= ANDAR_ACIMA_DO_VIZINHO;
      return [
        marco('torre-vizinha', 'visivel'),
        marco('morros', acima ? 'visivel' : 'oculto'),
        marco('farol', acima ? 'visivel' : 'oculto'),
        marco('mar', acima ? 'parcial' : 'oculto'),
      ];
    }
    case 'oeste':
      return [marco('casario', 'visivel'), marco('centro', pavimento >= 10 ? 'parcial' : 'oculto')];
  }
}

const trechoDa = (alvo: Unidade | Quarto, fachada: Fachada): Trecho =>
  alvo.trechos.find((t) => t.fachada === fachada) ?? alvo.trechos[0]!;
/** As coberturas duplex olham do andar de baixo. */
const pavimentoDa = (alvo: Unidade | Quarto): number => alvo.pavimentos[0]!;

function estados(alvo: Unidade | Quarto, fachada: Fachada) {
  const ponto = pontoDeVista({ pavimento: pavimentoDa(alvo), trecho: trechoDa(alvo, fachada) });
  const lista = marcosVisiveis(ponto);
  return (id: MarcoId): Visibilidade => lista.find((m) => m.id === id)?.estado ?? 'oculto';
}

/**
 * A vista em uma frase, para a faixa da vista e para leitores de tela.
 * Ex.: "O parque e o lago em primeiro plano, o mar ao fundo, por cima da orla. Morros e farol à esquerda."
 */
export function descricaoDaVista(alvo: Unidade | Quarto, fachada: Fachada): string {
  const estado = estados(alvo, fachada);
  switch (fachada) {
    case 'norte':
      return estado('centro') === 'visivel'
        ? 'A avenida arborizada e, por cima dos prédios do outro lado, as torres do centro.'
        : 'A avenida arborizada e a fileira de prédios do outro lado; o centro aparece só nos andares mais altos.';
    case 'sul':
      return estado('mar') === 'visivel'
        ? 'O parque e o lago em primeiro plano e o mar ao fundo, por cima da orla. Morros e farol à esquerda.'
        : 'O parque e o lago em primeiro plano; a orla esconde o mar, que aparece do 12º andar para cima. Morros e farol à esquerda.';
    case 'leste':
      return estado('morros') === 'oculto'
        ? 'A torre vizinha, a 20 m: a lateral leste fica fechada até o 13º andar.'
        : 'Por cima da torre vizinha, os morros e o farol, com um pedaço de mar à direita.';
    case 'oeste':
      return estado('centro') === 'oculto'
        ? 'A rua lateral e o casario; é o lado do pôr do sol.'
        : 'O casario e, à direita, as torres do centro ao longe; é o lado do pôr do sol.';
  }
}

/** A vista em poucas palavras, para a ficha do cartão: "mar e parque", "avenida e centro". */
export function resumoDaVista(alvo: Unidade | Quarto, fachada: Fachada): string {
  const estado = estados(alvo, fachada);
  switch (fachada) {
    case 'norte':
      return estado('centro') === 'visivel' ? 'avenida e centro' : 'avenida';
    case 'sul':
      return estado('mar') === 'visivel' ? 'mar e parque' : 'parque e lago';
    case 'leste':
      return estado('morros') === 'oculto' ? 'torre vizinha' : 'morros e farol';
    case 'oeste':
      return 'casario e pôr do sol';
  }
}
