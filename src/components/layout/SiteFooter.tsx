import Link from 'next/link';
import { Container } from '@/components/layout/Section';
import { MotionToggle } from '@/components/motion/MotionToggle';
import { InstagramIcon } from '@/components/brand/InstagramIcon';
import { rodape } from '@/content/navigation';
import { site } from '@/content/site';
import { rodapeCopy } from '@/content/home';

const grupos = [
  { titulo: 'Jogos', links: rodape.jogos },
  { titulo: 'Produtos', links: rodape.projetos },
  { titulo: 'Estúdio', links: rodape.estudio },
  { titulo: 'Social', links: rodape.social },
  // "Excluir dados" é subgrupo de Legal: um destino por produto, sem repetir o nome do jogo.
  { titulo: 'Legal', links: rodape.legal, subgrupo: rodape.dados },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface/40">
      {/* Compacto de propósito: a home cabe em uma tela, e o rodapé não pode virar uma segunda. */}
      <Container className="py-[clamp(2.25rem,4vw,3.5rem)]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
          <div>
            <p className="text-[clamp(1.25rem,2.4vw,1.7rem)] leading-tight tracking-[-0.04em]">
              {site.nome}
            </p>
            <p className="medida-texto mt-2 text-sm leading-relaxed text-mineral">
              {rodapeCopy.linha}
            </p>
          </div>

          <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 xl:grid-cols-5">
            {grupos.map((grupo) => (
              <div key={grupo.titulo}>
                <h2 className="tecnica text-mineral-dim">{grupo.titulo}</h2>
                <ul className="mt-2 flex flex-col">
                  {grupo.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="inline-flex min-h-11 items-center text-sm leading-snug text-mineral transition-colors duration-150 hover:text-signal"
                      >
                        {grupo.titulo === 'Social' ? <InstagramIcon className="mr-2 size-4" /> : null}
                        {link.rotulo}
                      </Link>
                    </li>
                  ))}
                </ul>

                {'subgrupo' in grupo ? (
                  <div className="mt-3 border-l border-line pl-3">
                    <h3 className="tecnica text-mineral-dim">{grupo.subgrupo.titulo}</h3>
                    <ul className="mt-1 flex flex-col">
                      {grupo.subgrupo.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="inline-flex min-h-11 items-center text-sm leading-snug text-mineral transition-colors duration-150 hover:text-signal"
                          >
                            {link.rotulo}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          <p className="tecnica text-mineral-dim">
            © {site.ano} {site.nome.toUpperCase()}
          </p>
          <p className="tecnica hidden text-mineral-dim sm:block">{rodapeCopy.base}</p>
          <div className="flex items-center gap-1">
            <Link
              href="/admin/login"
              aria-label="Abrir painel administrativo"
              title="Painel"
              className="group grid size-11 place-items-center text-mineral-dim opacity-35 transition-all duration-200 hover:text-signal hover:opacity-100 focus-visible:text-signal focus-visible:opacity-100"
            >
              <span
                aria-hidden="true"
                className="relative h-4 w-3 rounded-[1px] border border-current transition-transform duration-200 group-hover:-translate-y-px"
              >
                <span className="absolute right-[2px] top-1/2 size-0.5 -translate-y-1/2 rounded-full bg-current" />
              </span>
            </Link>
            <MotionToggle />
          </div>
        </div>
      </Container>
    </footer>
  );
}
