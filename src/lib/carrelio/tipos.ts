/**
 * Carrelio: os tipos do domínio, sem React nem three.js.
 *
 * O Carrelio é o showroom 3D de concessionária que o estúdio constrói sob medida. A demonstração
 * usa um carro real (o Jaecoo 5, com ficha, versões, cores e preços de lançamento divulgados pela
 * marca) e uma loja real que pediu a demonstração; o estoque, as condições e os pedidos de test
 * drive são de demonstração e ficam só no navegador de quem mexe.
 */

export type VersaoId = 'comfort' | 'prestige';

export type CorId = 'branco-arctic' | 'preto-andromeda' | 'cinza-centaurus' | 'azul-gaia';

/** As peças que abrem. Nem todo modelo 3D tem todas: o manifesto do modelo diz quais existem. */
export type PortaId = 'dianteiraEsquerda' | 'dianteiraDireita' | 'traseiraEsquerda' | 'traseiraDireita' | 'portaMalas';

/** De onde a câmera olha quando a pessoa "entra" no carro. */
export type PontoDoInterior = 'motorista' | 'bancoTraseiro' | 'portaMalas';

/** Estúdio claro de showroom, ou noite, com faróis e lanternas em evidência. */
export type Ambiente = 'estudio' | 'noite';

export type Vista = 'fora' | 'dentro';

/** Situação de uma cor numa versão, no estoque da loja. */
export type Situacao = 'pronta-entrega' | 'a-caminho' | 'sob-encomenda';

export type Aba = 'cliente' | 'painel';

/**
 * A cor da luz ambiente na vista de dentro (o Prestige tem luz ambiente personalizável). As cores
 * da demonstração são de exemplo: a interface diz isso.
 */
export type LuzId = 'azul' | 'ciano' | 'verde' | 'roxo' | 'rosa' | 'vermelho' | 'ambar' | 'branco';

export const VERSOES: readonly VersaoId[] = ['comfort', 'prestige'];
export const CORES: readonly CorId[] = ['branco-arctic', 'preto-andromeda', 'cinza-centaurus', 'azul-gaia'];
export const PORTAS: readonly PortaId[] = ['dianteiraEsquerda', 'dianteiraDireita', 'traseiraEsquerda', 'traseiraDireita', 'portaMalas'];
export const PONTOS_DO_INTERIOR: readonly PontoDoInterior[] = ['motorista', 'bancoTraseiro', 'portaMalas'];
/** A primeira é a da foto (o azul de fábrica). */
export const LUZES: readonly LuzId[] = ['azul', 'ciano', 'verde', 'roxo', 'rosa', 'vermelho', 'ambar', 'branco'];
