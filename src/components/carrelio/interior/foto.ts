import type { LuzId, VersaoId } from '@/lib/carrelio/tipos';

/**
 * A vista de dentro do Jaecoo 5, em foto: o modelo 3D gerado no Tripo não tem interior, e uma foto
 * de verdade ganha de qualquer interior feito por IA, que erra justo o que se vê de perto (telas,
 * letras, costuras). A foto é de divulgação da marca, trazida pelo titular (07/10/2026), e era de
 * mão inglesa: `tools/carrelio-interior.mjs` espelha (volante à esquerda, como no Brasil), devolve as
 * letras ao normal e gera as máscaras da luz ambiente, das telas e das janelas.
 *
 * Os pontos ficam em fração da foto (0 a 1, da esquerda e do alto), já espelhada.
 */

const PASTA = '/produtos/carrelio/interior';

export type PontoNaFoto = {
  /** Id do ponto de toque no catálogo (`JAECOO_5.pontos`). */
  id: string;
  x: number;
  y: number;
  /** Quanto a câmera aproxima quando a pessoa abre o ponto. */
  zoom: number;
};

export type DetalheDoPonto = { src: string; largura: number; altura: number; alt: string };

export type FotoDoInterior = {
  largura: number;
  altura: number;
  larguras: readonly number[];
  /** A foto numa largura e num formato, como `tools/carrelio-interior.mjs` grava. */
  arquivo(largura: number, formato: 'avif' | 'webp'): string;
  mascaras: { faixas: string; brilho: string; telas: string; acesas: string; janelas: string };
  /** Texto alternativo da foto. */
  descricao: string;
  /** A versão que aparece na foto (as outras ganham um aviso). */
  versao: VersaoId;
  legenda: string;
  pontos: readonly PontoNaFoto[];
  /** Uma foto de perto, mostrada no balão do ponto. */
  detalhes: Readonly<Record<string, DetalheDoPonto>>;
  /** Onde a câmera para quando a pessoa entra no carro (o centro, em fração da foto). */
  centro: { x: number; y: number };
  /** O quadradinho do convite "Entrar no carro" (112 px). */
  miniatura: string;
};

export const INTERIOR_DO_JAECOO_5: FotoDoInterior = {
  largura: 3840,
  altura: 2560,
  larguras: [1280, 1920, 2560, 3840],
  arquivo: (largura, formato) => `${PASTA}/interior-${largura}.${formato}`,
  mascaras: {
    faixas: `${PASTA}/faixas.webp`,
    brilho: `${PASTA}/faixas-brilho.webp`,
    telas: `${PASTA}/telas.webp`,
    acesas: `${PASTA}/acesas.webp`,
    janelas: `${PASTA}/janelas.webp`,
  },
  descricao:
    'O interior do Jaecoo 5 visto do banco de trás: volante à esquerda, painel de instrumentos digital, multimídia vertical no meio do painel, faixas de luz ambiente no painel e nas portas, bancos de couro e teto de vidro.',
  versao: 'prestige',
  legenda: 'Imagem ilustrativa · foto de divulgação Jaecoo',
  pontos: [
    // No forro, logo abaixo do vidro: no alto do palco ficam a legenda e o canto (a câmera, ao abrir, sobe até o vidro).
    { id: 'teto', x: 0.47, y: 0.18, zoom: 1.35 },
    { id: 'painel', x: 0.361, y: 0.57, zoom: 2.1 },
    { id: 'volante', x: 0.271, y: 0.625, zoom: 1.7 },
    // No alto da tela: no celular, a fileira de cores cobre o pé do painel.
    { id: 'multimidia', x: 0.499, y: 0.575, zoom: 1.9 },
    { id: 'luzAmbiente', x: 0.651, y: 0.605, zoom: 1.5 },
    { id: 'som', x: 0.815, y: 0.596, zoom: 1.6 },
    { id: 'carregador', x: 0.5, y: 0.75, zoom: 1.9 },
    { id: 'bancos', x: 0.27, y: 0.88, zoom: 1.4 },
  ],
  detalhes: {
    multimidia: {
      src: `${PASTA}/multimidia.webp`,
      largura: 640,
      altura: 360,
      alt: 'A multimídia vertical de perto, com o mapa, a música e o ar-condicionado de duas zonas.',
    },
  },
  centro: { x: 0.5, y: 0.5 },
  miniatura: `${PASTA}/miniatura.webp`,
};

export type CorDaLuz = { id: LuzId; nome: string; hex: string };

/** As cores de exemplo da luz ambiente. A primeira é a da foto. */
export const CORES_DA_LUZ: readonly CorDaLuz[] = [
  { id: 'azul', nome: 'Azul', hex: '#2f8cff' },
  { id: 'ciano', nome: 'Ciano', hex: '#22d3ee' },
  { id: 'verde', nome: 'Verde', hex: '#34f08a' },
  { id: 'roxo', nome: 'Roxo', hex: '#9b5cff' },
  { id: 'rosa', nome: 'Rosa', hex: '#ff4fb3' },
  { id: 'vermelho', nome: 'Vermelho', hex: '#ff2d3c' },
  { id: 'ambar', nome: 'Âmbar', hex: '#ffae2b' },
  { id: 'branco', nome: 'Branco', hex: '#eef2ff' },
];

export function corDaLuz(id: LuzId): CorDaLuz {
  return CORES_DA_LUZ.find((c) => c.id === id) ?? CORES_DA_LUZ[0]!;
}
