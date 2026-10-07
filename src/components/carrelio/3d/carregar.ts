import type { CarregarCarro } from './contrato';

/**
 * Entrada do import dinâmico da cena do carro. Provisório: até a cena ficar pronta, a carga é
 * recusada e o palco fica no pôster, com o aviso de que o 3D não abriu (o cartão funciona inteiro).
 */
export const carregarCarro: CarregarCarro = async () => {
  throw new Error('A cena do carro ainda não está pronta.');
};
