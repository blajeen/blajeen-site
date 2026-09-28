'use client';
import { useState } from 'react';
import Image from 'next/image';

export function AtlasViewer({ image }: { image: { src: string; alt: string; caption: string; width: number; height: number } }) {
  const [zoom, setZoom] = useState(1);
  return <figure>
    <div className="mw-map-tools mb-3">
      <button type="button" aria-label="Diminuir mapa" disabled={zoom === 1} onClick={() => setZoom(Math.max(1, zoom - .5))}>−</button>
      <button type="button" aria-label="Ampliar mapa" disabled={zoom === 3} onClick={() => setZoom(Math.min(3, zoom + .5))}>+</button>
      <button type="button" onClick={() => setZoom(1)}>Ajustar</button>
      <span className="mw-muted self-center" aria-live="polite">{Math.round(zoom * 100)}%</span>
    </div>
    <div tabIndex={0} role="region" aria-label="Mapa ampliável; use as barras de rolagem para explorar" style={{ overflow: 'auto', maxHeight: '75vh', borderRadius: 8 }}>
      <div style={{ width: `${zoom * 100}%` }}><Image src={image.src} alt={image.alt} width={image.width} height={image.height} className="mw-map" sizes="(max-width: 760px) 100vw, 1000px" /></div>
    </div>
    <figcaption className="mw-map-caption">{image.caption}. <a href={image.src} target="_blank" rel="noreferrer">Abrir imagem inteira ↗</a></figcaption>
  </figure>;
}
