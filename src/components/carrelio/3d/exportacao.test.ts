import { describe, expect, it } from 'vitest';
import { dilatar } from './exportacao';

describe('a textura assada para o USDZ', () => {
  it('estica a cor das ilhas para os pixels vazios em volta, sem tocar no resto', () => {
    const lado = 5;
    const pixels = new Uint8Array(lado * lado * 4);
    // Uma ilha de um pixel no meio.
    pixels.set([200, 100, 50, 255], (2 * lado + 2) * 4);
    dilatar(pixels, lado, 1);
    const cor = (x: number, y: number) => Array.from(pixels.slice((y * lado + x) * 4, (y * lado + x) * 4 + 4));
    for (const [x, y] of [[1, 2], [3, 2], [2, 1], [2, 3]] as const) expect(cor(x, y)).toEqual([200, 100, 50, 255]);
    // A diagonal ainda está vazia depois de uma passada; com duas, enche.
    expect(cor(1, 1)[3]).toBe(0);
    dilatar(pixels, lado, 1);
    expect(cor(1, 1)).toEqual([200, 100, 50, 255]);
    expect(cor(0, 0)[3]).toBe(0);
  });
});
