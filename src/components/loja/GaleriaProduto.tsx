'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ImagemProduto } from '@/lib/loja/tipos';

/** Foto grande e miniaturas. Com uma foto só, não há miniaturas para escolher. */
export function GaleriaProduto({ imagens, nome }: { imagens: ImagemProduto[]; nome: string }) {
  const [atual, setAtual] = useState(0);
  const foto = imagens[atual] ?? imagens[0];

  if (!foto) {
    return (
      <div className="tecnica grid aspect-square place-items-center rounded-[var(--radius-panel)] border border-line bg-surface text-mineral-dim">
        SEM FOTO AINDA
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-panel)] border border-line bg-surface">
        <Image src={foto.url} alt={foto.alt || nome} fill priority sizes="(min-width: 64rem) 48vw, 92vw" className="object-contain" />
      </div>
      {imagens.length > 1 ? (
        <div role="group" aria-label="Fotos do produto" className="mt-3 flex flex-wrap gap-3">
          {imagens.map((imagem, i) => (
            <button
              key={imagem.id}
              type="button"
              aria-label={`Ver foto ${i + 1} de ${imagens.length}`}
              aria-pressed={i === atual}
              onClick={() => setAtual(i)}
              className={`relative size-20 overflow-hidden rounded-[var(--radius-control)] border bg-surface transition-colors ${i === atual ? 'border-signal' : 'border-line hover:border-line-strong'}`}
            >
              <Image src={imagem.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
