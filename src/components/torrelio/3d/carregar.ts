import { criarCenaTorre } from './cena-torre';
import type { CarregarTorre } from './contrato';

/**
 * Entrada do import dinâmico da cena da torre: cria o renderizador dentro de `host`, monta a cena
 * em fatias, compila os shaders (`compileAsync`), desenha o primeiro quadro e só então resolve.
 * Quem chama reserva a fila da GPU (`reservarGpu`) antes e a libera depois, como o LabHero.
 * Sem WebGL2 ou com erro na montagem, a promessa é rejeitada e o pôster fica.
 */
export const carregarTorre: CarregarTorre = (host, opcoes) => criarCenaTorre(host, opcoes);
