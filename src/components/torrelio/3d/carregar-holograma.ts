import { criarCenaHolograma } from './cena-holograma';
import type { CarregarHolograma } from './holograma';

/**
 * Entrada do import dinâmico do holograma: só o prédio, em fundo preto, num renderizador próprio.
 * Quem chama reserva a fila da GPU antes (`reservarGpu`) e a libera depois do primeiro quadro.
 */
export const carregarHolograma: CarregarHolograma = (host, inicial) => criarCenaHolograma(host, inicial);
