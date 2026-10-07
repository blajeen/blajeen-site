import { criarCenaCarro } from './cena-carro';
import type { CarregarCarro } from './contrato';

/**
 * Entrada do import dinâmico da cena do carro: cria o renderizador dentro de `host`, gera o estúdio,
 * baixa e monta o modelo do manifesto em fatias, compila os shaders (`compileAsync`), desenha o
 * primeiro quadro e só então resolve. Quem chama reserva a fila da GPU antes e libera depois, como
 * no Torrelio. Sem WebGL2 ou com erro na montagem, a promessa é rejeitada e o pôster fica.
 */
export const carregarCarro: CarregarCarro = (host, opcoes) => criarCenaCarro(host, opcoes);
