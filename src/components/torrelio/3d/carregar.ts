import type { CarregarTorre } from './contrato';

/**
 * Entrada do import dinâmico da cena da torre.
 *
 * PROVISÓRIO (etapa 0): a cena em three.js ainda está sendo construída. Até lá, a carga falha e o
 * palco fica no pôster com a mensagem de reserva, enquanto o espelho e o cartão fazem tudo.
 */
export const carregarTorre: CarregarTorre = async () => {
  throw new Error('A cena 3D da torre ainda não foi construída.');
};
