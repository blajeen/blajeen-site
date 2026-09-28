import { ScreenshotFrame } from './ScreenshotFrame';
import type { SaasImage } from '@/content/saas';

/** A mesma janela em todos os produtos, sem cortar ou esticar a interface. */
export function SaasMedia({ imagem, prioridade = false, legenda = true }: {
  imagem: SaasImage; prioridade?: boolean; legenda?: boolean;
}) {
  return (
    <figure className="min-w-0">
      <ScreenshotFrame src={imagem.src} alt={imagem.descricao} label={imagem.titulo} priority={prioridade}/>
      {legenda && <figcaption className="mt-4">
        <p className="tecnica text-[9px] text-mineral-dim">{imagem.tipo}</p>
        <h3 className="mt-2 text-lg leading-snug tracking-tight text-paper">{imagem.titulo}</h3>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-mineral">{imagem.descricao}</p>
      </figcaption>}
    </figure>
  );
}
