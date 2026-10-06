import type { CategoriaId, Fachada, Modo, Quarto, TipologiaId, Trecho, Unidade } from './tipos';

/**
 * O Residencial Vértice (fictício): dimensões, pavimentos, vãos de fachada e o que mora atrás de
 * cada vão — a unidade, no modo incorporadora, ou o quarto, no modo hotel.
 *
 * É a fonte única da geometria: a cena 3D desenha a partir daqui, e o espelho, o cartão e a vista
 * da janela também. Coordenadas em metros, y para cima, −z para o norte (frente), +x para o leste.
 * A torre ocupa x ∈ [−12, 12] e z ∈ [−8, 8], sobre um embasamento de 32 × 26 m.
 */

export const TORRE = { largura: 24, profundidade: 16 } as const;
export const EMBASAMENTO = { largura: 32, profundidade: 26, altura: 7.5 } as const;
export const PISO_A_PISO = 2.88;

/** Pavimentos-tipo, com quatro apartamentos (ou oito quartos) cada. */
export const PRIMEIRO_TIPO = 2;
export const ULTIMO_TIPO = 19;
/** As duas coberturas duplex (ou as duas suítes do hotel) ocupam o 20º e o 21º. */
export const PAVIMENTOS_COBERTURA = [20, 21] as const;
/** Todos os pavimentos com vãos de fachada, de baixo para cima. */
export const PAVIMENTOS: readonly number[] = Array.from({ length: 21 - PRIMEIRO_TIPO + 1 }, (_, i) => PRIMEIRO_TIPO + i);

/**
 * A partir deste andar, quem olha pelos fundos (sul) vê o mar por cima da orla. A paisagem
 * fictícia (`entorno.ts`) é desenhada para concordar com este número, e um teste confere.
 */
export const ANDAR_VISTA_MAR = 12;

/** Nível da laje do pavimento, em metros acima da rua. O 18º fica a +53,58 m. */
export function cota(pavimento: number): number {
  return Math.round((EMBASAMENTO.altura + (pavimento - PRIMEIRO_TIPO) * PISO_A_PISO) * 100) / 100;
}

/** Ordem das fachadas no índice global dos vãos de um pavimento. */
export const FACHADAS: readonly Fachada[] = ['norte', 'leste', 'sul', 'oeste'];
export const VAOS_NA_FACHADA: Readonly<Record<Fachada, number>> = { norte: 8, leste: 4, sul: 8, oeste: 4 };
export const LARGURA_DO_VAO: Readonly<Record<Fachada, number>> = { norte: 3, leste: 4, sul: 3, oeste: 4 };
const INICIO_DA_FACHADA: Readonly<Record<Fachada, number>> = { norte: 0, leste: 8, sul: 12, oeste: 20 };
export const VAOS_POR_PAVIMENTO = 24;
export const TOTAL_DE_VAOS = PAVIMENTOS.length * VAOS_POR_PAVIMENTO;

/** O vão na posição `posicao` da fachada, no pavimento: o índice global, de 0 a `TOTAL_DE_VAOS - 1`. */
export function indiceDoVao(pavimento: number, fachada: Fachada, posicao: number): number {
  return (pavimento - PRIMEIRO_TIPO) * VAOS_POR_PAVIMENTO + INICIO_DA_FACHADA[fachada] + posicao;
}

export function vaoDoIndice(indice: number): { pavimento: number; fachada: Fachada; posicao: number } {
  const pavimento = PRIMEIRO_TIPO + Math.floor(indice / VAOS_POR_PAVIMENTO);
  const resto = indice % VAOS_POR_PAVIMENTO;
  const fachada = [...FACHADAS].reverse().find((f) => resto >= INICIO_DA_FACHADA[f])!;
  return { pavimento, fachada, posicao: resto - INICIO_DA_FACHADA[fachada] };
}

/** Para onde a fachada olha, no plano. */
export const NORMAL_DA_FACHADA: Readonly<Record<Fachada, readonly [number, number, number]>> = {
  norte: [0, 0, -1],
  sul: [0, 0, 1],
  leste: [1, 0, 0],
  oeste: [-1, 0, 0],
};

export type GeometriaDoVao = {
  pavimento: number;
  fachada: Fachada;
  posicao: number;
  /** Centro do vidro, no plano da fachada. */
  centro: readonly [number, number, number];
  normal: readonly [number, number, number];
  largura: number;
  /** Altura do vidro, entre o piso acabado e a viga. */
  altura: number;
};

/** O vidro ocupa do piso acabado (laje + 0,10 m) até a viga (0,38 m abaixo da laje de cima). */
export const VIDRO = { acimaDaLaje: 0.1, abaixoDaViga: 0.38 } as const;

export function geometriaDoVao(indice: number): GeometriaDoVao {
  const { pavimento, fachada, posicao } = vaoDoIndice(indice);
  const largura = LARGURA_DO_VAO[fachada];
  const altura = PISO_A_PISO - VIDRO.acimaDaLaje - VIDRO.abaixoDaViga;
  const y = cota(pavimento) + VIDRO.acimaDaLaje + altura / 2;
  const meiaLargura = TORRE.largura / 2;
  const meiaProfundidade = TORRE.profundidade / 2;
  const ao = (inicio: number) => inicio + largura * (posicao + 0.5);
  const centro: readonly [number, number, number] =
    fachada === 'norte' ? [ao(-meiaLargura), y, -meiaProfundidade]
      : fachada === 'sul' ? [ao(-meiaLargura), y, meiaProfundidade]
        : fachada === 'leste' ? [meiaLargura, y, ao(-meiaProfundidade)]
          : [-meiaLargura, y, ao(-meiaProfundidade)];
  return { pavimento, fachada, posicao, centro, normal: NORMAL_DA_FACHADA[fachada], largura, altura };
}

const trecho = (fachada: Fachada, de: number, ate: number): Trecho => ({ fachada, de, ate });
const fachadasDe = (trechos: readonly Trecho[]) => [...new Set(trechos.map((t) => t.fachada))];

// ------------------------------------------------------------------ incorporadora

/**
 * Os quatro finais do pavimento-tipo, um em cada canto. Os de leste (01 e 04) são os de 3
 * dormitórios e levam cinco vãos da frente ou dos fundos; os de oeste (02 e 03), de 2 dormitórios,
 * levam três. As laterais se dividem ao meio.
 */
export const FINAIS_DO_TIPO: Readonly<Record<string, { tipologia: TipologiaId; trechos: readonly Trecho[] }>> = {
  '01': { tipologia: 'tipo-3d', trechos: [trecho('norte', 3, 8), trecho('leste', 0, 2)] },
  '02': { tipologia: 'tipo-2d', trechos: [trecho('norte', 0, 3), trecho('oeste', 0, 2)] },
  '03': { tipologia: 'tipo-2d', trechos: [trecho('sul', 0, 3), trecho('oeste', 2, 4)] },
  '04': { tipologia: 'tipo-3d', trechos: [trecho('sul', 3, 8), trecho('leste', 2, 4)] },
};

/** As coberturas duplex: a da frente e a dos fundos, cada uma com metade das laterais. */
const COBERTURAS: readonly { final: string; trechos: readonly Trecho[] }[] = [
  { final: '01', trechos: [trecho('norte', 0, 8), trecho('leste', 0, 2), trecho('oeste', 0, 2)] },
  { final: '02', trechos: [trecho('sul', 0, 8), trecho('leste', 2, 4), trecho('oeste', 2, 4)] },
];

/** Número do apartamento: o andar seguido do final, como "1803" ou "201". */
export const idDaUnidade = (pavimento: number, final: string) => `${pavimento}${final}`;

function montarUnidades(): Unidade[] {
  const lista: Unidade[] = [];
  for (let pavimento = PRIMEIRO_TIPO; pavimento <= ULTIMO_TIPO; pavimento += 1) {
    for (const [final, { tipologia, trechos }] of Object.entries(FINAIS_DO_TIPO)) {
      lista.push({ id: idDaUnidade(pavimento, final), indice: lista.length, pavimentos: [pavimento], final, tipologia, trechos, fachadas: fachadasDe(trechos) });
    }
  }
  for (const { final, trechos } of COBERTURAS) {
    lista.push({
      id: idDaUnidade(PAVIMENTOS_COBERTURA[0], final), indice: lista.length, pavimentos: [...PAVIMENTOS_COBERTURA], final,
      tipologia: 'cobertura', trechos, fachadas: fachadasDe(trechos),
    });
  }
  return lista;
}

/** 18 pavimentos-tipo com 4 apartamentos, mais as 2 coberturas: 74 unidades. */
export const UNIDADES: readonly Unidade[] = montarUnidades();

// -------------------------------------------------------------------------- hotel

/** Oito quartos por andar: 01 a 04 na frente (cidade), 05 a 08 nos fundos (parque ou mar). */
export const FINAIS_DO_HOTEL: Readonly<Record<string, readonly Trecho[]>> = {
  '01': [trecho('norte', 0, 2), trecho('oeste', 0, 2)],
  '02': [trecho('norte', 2, 4)],
  '03': [trecho('norte', 4, 6)],
  '04': [trecho('norte', 6, 8), trecho('leste', 0, 2)],
  '05': [trecho('sul', 0, 2), trecho('oeste', 2, 4)],
  '06': [trecho('sul', 2, 4)],
  '07': [trecho('sul', 4, 6)],
  '08': [trecho('sul', 6, 8), trecho('leste', 2, 4)],
};

function categoriaDoQuarto(pavimento: number, final: string): CategoriaId {
  if (['01', '04'].includes(final)) return 'canto-cidade';
  if (['02', '03'].includes(final)) return 'cidade';
  return pavimento >= ANDAR_VISTA_MAR ? 'vista-mar' : 'vista-parque';
}

function montarQuartos(): Quarto[] {
  const lista: Quarto[] = [];
  for (let pavimento = PRIMEIRO_TIPO; pavimento <= ULTIMO_TIPO; pavimento += 1) {
    for (const [final, trechos] of Object.entries(FINAIS_DO_HOTEL)) {
      const canto = trechos.length > 1;
      lista.push({
        id: idDaUnidade(pavimento, final), indice: lista.length, pavimento, pavimentos: [pavimento], final,
        categoria: categoriaDoQuarto(pavimento, final), capacidade: canto ? 3 : 2, trechos, fachadas: fachadasDe(trechos),
      });
    }
  }
  for (const { final, trechos } of COBERTURAS) {
    lista.push({
      id: idDaUnidade(PAVIMENTOS_COBERTURA[0], final), indice: lista.length, pavimento: PAVIMENTOS_COBERTURA[0],
      pavimentos: [...PAVIMENTOS_COBERTURA], final, categoria: 'suite-cobertura', capacidade: 4, trechos, fachadas: fachadasDe(trechos),
    });
  }
  return lista;
}

/** 18 andares com 8 quartos, mais as 2 suítes da cobertura: 146 quartos. */
export const QUARTOS: readonly Quarto[] = montarQuartos();

// ------------------------------------------------------------------- mapa de vãos

function montarMapa(itens: readonly { indice: number; pavimentos: readonly number[]; trechos: readonly Trecho[] }[]): Int16Array {
  const mapa = new Int16Array(TOTAL_DE_VAOS).fill(-1);
  for (const item of itens) {
    for (const pavimento of item.pavimentos) {
      for (const { fachada, de, ate } of item.trechos) {
        for (let posicao = de; posicao < ate; posicao += 1) mapa[indiceDoVao(pavimento, fachada, posicao)] = item.indice;
      }
    }
  }
  return mapa;
}

const MAPAS: Readonly<Record<Modo, Int16Array>> = { incorporadora: montarMapa(UNIDADES), hotel: montarMapa(QUARTOS) };

/** Para cada vão do prédio, o índice da unidade (ou do quarto) que mora atrás dele. */
export function mapaDeVaos(modo: Modo): Int16Array {
  return MAPAS[modo];
}

/** Quantas unidades (ou quartos) o modo tem: o tamanho dos arrays de luz da cena. */
export function totalDoModo(modo: Modo): number {
  return modo === 'incorporadora' ? UNIDADES.length : QUARTOS.length;
}

/** O que a cena 3D precisa saber de cada unidade ou quarto, nos dois modos. */
export function itensDoModo(modo: Modo): readonly (Unidade | Quarto)[] {
  return modo === 'incorporadora' ? UNIDADES : QUARTOS;
}
