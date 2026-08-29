import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { ProjectBanner } from '@/components/projects/ProjectBanner';
import { ProjectPreview } from '@/components/projects/ProjectPreview';
import { StoreBadges } from '@/components/projects/StoreBadges';
import { disponibilidadeVisivel, statusVisivel } from '@/content/estado-do-projeto';
import { rotasDoProjeto } from '@/content/projects';
import type { Project } from '@/content/types';

type Props = {
  projeto: Project;
  /** Alterna a direção da composição para criar ritmo entre os experimentos. */
  invertido?: boolean;
  /**
   * Versão para o painel de abas da home, onde os experimentos dividem uma tela.
   * Encolhe a tipografia e a mídia; não corta informação nem transforma o bloco em card.
   */
  compacto?: boolean;
};

/**
 * Showcase editorial de um projeto.
 *
 * Não é um card: a arte ocupa a maior parte da composição e o texto acompanha em coluna estreita.
 * No mobile a mídia vem antes do texto, índice e estado ficam sempre visíveis e nenhuma informação
 * depende de hover.
 */
export function ProjectShowcase({ projeto, invertido = false, compacto = false }: Props) {
  const rota = rotasDoProjeto[projeto.id].pagina;
  const tituloId = `showcase-${projeto.id}`;

  return (
    <article
      aria-labelledby={tituloId}
      className={[
        'group/showcase grid lg:grid-cols-12 lg:items-center',
        compacto ? 'gap-5 lg:gap-8' : 'gap-8 lg:gap-12',
      ].join(' ')}
    >
      {/* Seis colunas para a arte: mantém o banner amplo e encurta a altura do bloco. */}
      <Reveal
        className={[
          'lg:col-span-6',
          invertido ? 'lg:order-2 lg:col-start-7' : 'lg:order-1',
        ].join(' ')}
      >
        <Link
          href={rota}
          tabIndex={-1}
          aria-hidden="true"
          className="block rounded-[var(--radius-panel)]"
        >
          <ProjectBanner
            projeto={projeto}
            sizes="(min-width: 64rem) 48vw, (min-width: 48rem) 90vw, 100vw"
          />
        </Link>
      </Reveal>

      <Reveal
        atraso={80}
        className={[
          'lg:col-span-5',
          invertido ? 'lg:order-1 lg:col-start-1 lg:row-start-1' : 'lg:order-2 lg:col-start-8',
        ].join(' ')}
      >
        <p className="tecnica flex flex-wrap items-center gap-x-3 gap-y-1 text-mineral-dim">
          <span className="text-signal">{projeto.indice}</span>
          <span aria-hidden="true">/</span>
          <span>{projeto.estado}</span>
        </p>

        <h3
          id={tituloId}
          className="mt-2 text-[clamp(1.9rem,4vw,2.8rem)] leading-none tracking-[-0.05em]"
        >
          {projeto.nome}
        </h3>

        <p className="tecnica mt-2 text-mineral-dim">{projeto.categoria}</p>

        <p className="mt-4 text-[clamp(1.05rem,1.8vw,1.25rem)] leading-snug tracking-[-0.02em] text-paper">
          {projeto.frase}
        </p>

        {compacto ? null : (
          <p className="medida-texto mt-3 text-[0.95rem] leading-relaxed text-mineral">
            {projeto.descricao}
          </p>
        )}

        <p className="mt-4 flex items-center gap-2 text-sm text-mineral">
          <span
            aria-hidden="true"
            className="inline-block size-[5px] flex-none rounded-full bg-signal shadow-[0_0_8px_var(--color-signal)]"
          />
          {statusVisivel(projeto)}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={rota}
            className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
          >
            {projeto.cta}
            <span aria-hidden="true">→</span>
          </Link>
          <ProjectPreview projeto={projeto} />
        </div>

        <StoreBadges disponibilidade={disponibilidadeVisivel(projeto)} className="mt-6" />

        <p className="medida-texto mt-5 border-l border-signal/40 pl-4 text-sm leading-relaxed text-mineral-dim">
          {projeto.notaCurta}
        </p>
      </Reveal>
    </article>
  );
}
