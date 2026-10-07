/**
 * A câmera da foto do interior, sem DOM: o zoom e o ponto da foto (em fração, 0 a 1) que fica no
 * meio do palco. Com zoom 1 a foto cobre o palco inteiro (como `object-fit: cover`); a câmera nunca
 * deixa aparecer borda.
 */

export type CameraDaFoto = { zoom: number; x: number; y: number };
export type Tamanho = { largura: number; altura: number };
export type Ponto = { x: number; y: number };

export const ZOOM_MINIMO = 1;
export const ZOOM_MAXIMO = 3;

const prenderEntre = (valor: number, minimo: number, maximo: number) => Math.min(maximo, Math.max(minimo, valor));

/** O tamanho da foto no palco com zoom 1, em px: a menor escala que cobre o palco. */
export function tamanhoBase(palco: Tamanho, foto: Tamanho): Tamanho {
  const escala = Math.max(palco.largura / foto.largura, palco.altura / foto.altura);
  return { largura: foto.largura * escala, altura: foto.altura * escala };
}

/** Zoom na faixa e centro onde a foto ainda cobre o palco. */
export function prender(camera: CameraDaFoto, palco: Tamanho, foto: Tamanho): CameraDaFoto {
  const zoom = prenderEntre(camera.zoom, ZOOM_MINIMO, ZOOM_MAXIMO);
  const base = tamanhoBase(palco, foto);
  const meioX = Math.min(0.5, palco.largura / 2 / (base.largura * zoom));
  const meioY = Math.min(0.5, palco.altura / 2 / (base.altura * zoom));
  return { zoom, x: prenderEntre(camera.x, meioX, 1 - meioX), y: prenderEntre(camera.y, meioY, 1 - meioY) };
}

/** Onde fica o canto da foto (px) e a escala, para o `transform` do quadro (origem no canto). */
export function transformacao(camera: CameraDaFoto, palco: Tamanho, foto: Tamanho) {
  const base = tamanhoBase(palco, foto);
  return {
    x: palco.largura / 2 - camera.x * base.largura * camera.zoom,
    y: palco.altura / 2 - camera.y * base.altura * camera.zoom,
    escala: camera.zoom,
    base,
  };
}

/** Onde um ponto da foto (em fração) cai no palco, em px. */
export function projetar(ponto: Ponto, camera: CameraDaFoto, palco: Tamanho, foto: Tamanho): Ponto {
  const t = transformacao(camera, palco, foto);
  return { x: t.x + ponto.x * t.base.largura * t.escala, y: t.y + ponto.y * t.base.altura * t.escala };
}

/** Zoom em volta de um ponto do palco (px): o que estava debaixo dele continua debaixo dele. */
export function zoomEm(camera: CameraDaFoto, zoom: number, ancora: Ponto, palco: Tamanho, foto: Tamanho): CameraDaFoto {
  const t = transformacao(camera, palco, foto);
  const naFotoX = (ancora.x - t.x) / (t.base.largura * camera.zoom);
  const naFotoY = (ancora.y - t.y) / (t.base.altura * camera.zoom);
  const novo = prenderEntre(zoom, ZOOM_MINIMO, ZOOM_MAXIMO);
  return prender(
    {
      zoom: novo,
      x: naFotoX - (ancora.x - palco.largura / 2) / (t.base.largura * novo),
      y: naFotoY - (ancora.y - palco.altura / 2) / (t.base.altura * novo),
    },
    palco,
    foto,
  );
}

/** Arrastar: a foto acompanha o dedo, px por px. */
export function arrastar(camera: CameraDaFoto, dx: number, dy: number, palco: Tamanho, foto: Tamanho): CameraDaFoto {
  const base = tamanhoBase(palco, foto);
  return prender({ zoom: camera.zoom, x: camera.x - dx / (base.largura * camera.zoom), y: camera.y - dy / (base.altura * camera.zoom) }, palco, foto);
}

/** Um passo em direção ao alvo, amortecido (igual em 60 ou 120 quadros por segundo). `dt` em segundos. */
export function aproximar(atual: CameraDaFoto, alvo: CameraDaFoto, dt: number, rapidez = 8): CameraDaFoto {
  const k = 1 - Math.exp(-dt * rapidez);
  return { zoom: atual.zoom + (alvo.zoom - atual.zoom) * k, x: atual.x + (alvo.x - atual.x) * k, y: atual.y + (alvo.y - atual.y) * k };
}

/** Chegou (a diferença que sobra não se vê). */
export function chegou(atual: CameraDaFoto, alvo: CameraDaFoto): boolean {
  return Math.abs(atual.zoom - alvo.zoom) < 0.0015 && Math.abs(atual.x - alvo.x) < 0.0002 && Math.abs(atual.y - alvo.y) < 0.0002;
}
