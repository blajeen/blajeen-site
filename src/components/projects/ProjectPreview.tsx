'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Drawer } from '@/components/overlays/Drawer';
import { StoreBadges } from '@/components/projects/StoreBadges';
import { disponibilidadeVisivel, statusVisivel } from '@/content/estado-do-projeto';
import { rotasDoProjeto } from '@/content/projects';
import type { Project } from '@/content/types';

/**
 * Gaveta de prévia de um projeto.
 *
 * É melhoria progressiva: o showcase já é um link comum para a página do produto, e esta gaveta
 * só existe quando há JavaScript. Ela não substitui `/projects/[projeto]`, não altera a URL, não
 * abre sozinha e nunca empilha com a gaveta de navegação.
 */
export function ProjectPreview({ projeto }: { projeto: Project }) {
  const [aberto, setAberto] = useState(false);
  const acionador = useRef<HTMLButtonElement>(null);
  const id = `previa-${projeto.id}`;
  const rotas = rotasDoProjeto[projeto.id];

  return (
    <>
      <button
        ref={acionador}
        type="button"
        onClick={() => setAberto(true)}
        aria-expanded={aberto}
        aria-controls={id}
        className="alvo-toque tecnica inline-flex items-center gap-2 rounded-full border border-line px-4 text-mineral transition-colors duration-150 hover:border-signal/50 hover:text-signal"
      >
        Prévia rápida
        <span aria-hidden="true">↗</span>
      </button>

      <Drawer
        id={id}
        aberto={aberto}
        aoFechar={() => setAberto(false)}
        titulo={`${projeto.indice} / ${projeto.estado}`}
        variante="previa"
        acionador={acionador}
      >
        <div className="px-6 pb-10 pt-4 sm:px-8">
          {/* A gaveta herda a cor do projeto apenas pela imagem; a interface segue o sistema. */}
          <Image
            src={projeto.banner.src}
            alt={projeto.banner.alt}
            width={projeto.banner.largura}
            height={projeto.banner.altura}
            sizes="(min-width: 48rem) 40rem, 100vw"
            loading="lazy"
            className="block h-auto w-full rounded-[var(--radius-control)] border border-line"
          />

          <p className="tecnica mt-6 text-mineral-dim">{projeto.categoria}</p>
          <h3 className="mt-2 text-[clamp(1.75rem,5vw,2.5rem)] leading-none tracking-[-0.045em]">
            {projeto.nome}
          </h3>
          <p className="mt-3 text-lg leading-snug text-paper">{projeto.frase}</p>
          <p className="medida-texto mt-4 text-sm leading-relaxed text-mineral">{projeto.descricao}</p>

          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-control)] border border-line bg-line sm:grid-cols-2">
            <div className="bg-surface px-4 py-3">
              <dt className="tecnica text-mineral-dim">Estado</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm text-paper">
                <span
                  aria-hidden="true"
                  className="inline-block size-[5px] rounded-full bg-signal shadow-[0_0_8px_var(--color-signal)]"
                />
                {statusVisivel(projeto)}
              </dd>
            </div>
            <div className="bg-surface px-4 py-3">
              <dt className="tecnica text-mineral-dim">Plataformas</dt>
              <dd className="mt-1 text-sm text-mineral">
                {projeto.plataformas.length > 0
                  ? projeto.plataformas.map((plataforma) => plataforma.nome).join(' · ')
                  : 'Ainda não anunciadas'}
              </dd>
            </div>
          </dl>

          <StoreBadges disponibilidade={disponibilidadeVisivel(projeto)} className="mt-7" />

          <p className="mt-6 border-l border-signal/40 pl-4 text-sm leading-relaxed text-mineral">
            {projeto.notaCurta}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={rotas.pagina}
              className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full bg-signal px-5 text-ink transition-opacity duration-150 hover:opacity-88"
            >
              Ver projeto
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={rotas.suporte}
              className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal/60 hover:text-signal"
            >
              Suporte
            </Link>
          </div>
        </div>
      </Drawer>
    </>
  );
}
