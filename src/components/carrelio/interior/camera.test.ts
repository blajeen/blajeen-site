import { describe, expect, it } from 'vitest';
import { aproximar, arrastar, chegou, prender, projetar, tamanhoBase, zoomEm, type CameraDaFoto } from './camera';

const FOTO = { largura: 3840, altura: 2560 };
const QUADRADO = { largura: 400, altura: 400 };
const LARGO = { largura: 1200, altura: 600 };

describe('a câmera da foto do interior', () => {
  it('com zoom 1, a foto cobre o palco: no quadrado, sobra largura; no largo, altura', () => {
    expect(tamanhoBase(QUADRADO, FOTO)).toEqual({ largura: 600, altura: 400 });
    expect(tamanhoBase(LARGO, FOTO)).toEqual({ largura: 1200, altura: 800 });
  });

  it('nunca mostra borda: o centro fica onde a foto ainda cobre o palco', () => {
    // No quadrado, dá para olhar de lado até a borda da foto, e nada para cima ou para baixo.
    expect(prender({ zoom: 1, x: 0, y: 0 }, QUADRADO, FOTO)).toEqual({ zoom: 1, x: 1 / 3, y: 0.5 });
    const direita = prender({ zoom: 1, x: 1, y: 1 }, QUADRADO, FOTO);
    expect(direita.x).toBeCloseTo(2 / 3);
    expect(direita.y).toBe(0.5);
    // Com zoom, sobra para os dois lados; o zoom fica na faixa.
    const perto = prender({ zoom: 9, x: 0, y: 1 }, QUADRADO, FOTO);
    expect(perto.zoom).toBe(3);
    expect(perto.x).toBeCloseTo(1 / 9);
    expect(perto.y).toBeCloseTo(1 - 1 / 6);
  });

  it('projeta um ponto da foto no palco', () => {
    const camera: CameraDaFoto = { zoom: 1, x: 0.5, y: 0.5 };
    expect(projetar({ x: 0.5, y: 0.5 }, camera, QUADRADO, FOTO)).toEqual({ x: 200, y: 200 });
    // Um terço da foto para a esquerda do meio: a borda do quadrado.
    expect(projetar({ x: 1 / 6, y: 0.5 }, camera, QUADRADO, FOTO).x).toBeCloseTo(0);
  });

  it('o zoom guarda o ponto debaixo do dedo', () => {
    const camera: CameraDaFoto = { zoom: 1, x: 0.5, y: 0.5 };
    const ancora = { x: 300, y: 120 };
    const antes = { x: (300 - (200 - 0.5 * 600)) / 600, y: (120 - (200 - 0.5 * 400)) / 400 };
    const depois = zoomEm(camera, 2, ancora, QUADRADO, FOTO);
    const deVolta = projetar(antes, depois, QUADRADO, FOTO);
    expect(deVolta.x).toBeCloseTo(300);
    expect(deVolta.y).toBeCloseTo(120);
  });

  it('arrastar leva a foto junto com o dedo, até a borda', () => {
    const camera: CameraDaFoto = { zoom: 1, x: 0.5, y: 0.5 };
    // Arrastar 60 px para a direita mostra o que estava à esquerda: o centro vai para 0,4.
    expect(arrastar(camera, 60, 0, QUADRADO, FOTO).x).toBeCloseTo(0.4);
    const noFim = arrastar(camera, 5000, 5000, QUADRADO, FOTO);
    expect(noFim.x).toBeCloseTo(1 / 3);
    expect(noFim.y).toBe(0.5);
  });

  it('aproxima do alvo pelo tempo, não pelo número de quadros', () => {
    const de: CameraDaFoto = { zoom: 1, x: 0.5, y: 0.5 };
    const para: CameraDaFoto = { zoom: 2, x: 0.3, y: 0.6 };
    let emDois = de;
    for (let i = 0; i < 2; i++) emDois = aproximar(emDois, para, 1 / 60);
    const emUm = aproximar(de, para, 2 / 60);
    expect(emDois.zoom).toBeCloseTo(emUm.zoom, 6);
    let atual = de;
    for (let i = 0; i < 240 && !chegou(atual, para); i++) atual = aproximar(atual, para, 1 / 60);
    expect(chegou(atual, para)).toBe(true);
  });
});
