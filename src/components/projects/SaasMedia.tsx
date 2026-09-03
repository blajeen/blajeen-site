import Image from 'next/image';
import type { SaasImage } from '@/content/saas';

/** A mesma janela em todos os produtos, sem cortar ou esticar a interface. */
export function SaasMedia({ imagem, prioridade = false, legenda = true }: {
  imagem: SaasImage; prioridade?: boolean; legenda?: boolean;
}) {
  return (
    <figure className="min-w-0">
      <a href={imagem.src} target="_blank" rel="noopener noreferrer"
        aria-label={`Ampliar imagem: ${imagem.titulo} (nova aba)`}
        className="group relative block aspect-[8/5] overflow-hidden rounded-[var(--radius-control)] border border-line bg-[#f4f4f0] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">
        <Image src={imagem.src} alt={imagem.descricao} fill priority={prioridade}
          sizes="(min-width: 1800px) 820px, (min-width: 1024px) 46vw, calc(100vw - 7rem)"
          className="object-contain transition-opacity group-hover:opacity-90" />
        <span aria-hidden="true" className="absolute right-2 bottom-2 rounded-full border border-white/20 bg-ink/85 px-3 py-1 text-xs text-paper">Ampliar ↗</span>
      </a>
      {legenda && <figcaption className="mt-4">
        <p className="tecnica text-[9px] text-mineral-dim">{imagem.tipo}</p>
        <h3 className="mt-2 text-lg leading-snug tracking-tight text-paper">{imagem.titulo}</h3>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-mineral">{imagem.descricao}</p>
      </figcaption>}
    </figure>
  );
}
