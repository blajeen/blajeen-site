import type { CarregarApartamento } from './contrato';
import { criarCenaApartamento } from './cena-apartamento';

/**
 * Entrada do import dinâmico da maquete do apartamento: só chega quando a pessoa mostra intenção
 * (o botão do palco ou, no computador, o ponteiro entrando nele). O three.js vem junto, no chunk
 * que o site já compartilha com as outras cenas.
 */
export const carregarApartamento: CarregarApartamento = (host, estado) => criarCenaApartamento(host, estado);
