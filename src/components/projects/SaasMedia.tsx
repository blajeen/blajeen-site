import Image from 'next/image';
import type { SaasImage } from '@/content/saas';

/** A mesma janela em todos os produtos, sem cortar ou esticar a interface. */
export function SaasMedia({ imagem, prioridade = false, legenda = true }: {
  imagem: SaasImage; prioridade?: boolean; legenda?: boolean;
}) {
  return (
    <figure className="min-w-0">
      <div className="media-pattern relative block aspect-[8/5] overflow-hidden rounded-[var(--radius-control)] border border-line bg-[#f4f4f0]">
        <Image src={imagem.src} alt={imagem.descricao} fill priority={prioridade}
          sizes="(min-width: 1800px) 820px, (min-width: 1024px) 46vw, calc(100vw - 7rem)"
          quality={95}
          className="object-contain" />
      </div>
      {legenda && <figcaption className="mt-4">
        <p className="tecnica text-[9px] text-mineral-dim">{imagem.tipo}</p>
        <h3 className="mt-2 text-lg leading-snug tracking-tight text-paper">{imagem.titulo}</h3>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-mineral">{imagem.descricao}</p>
      </figcaption>}
    </figure>
  );
}
