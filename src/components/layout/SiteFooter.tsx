import Link from 'next/link';
import { Container } from '@/components/layout/Section';
import { MotionToggle } from '@/components/motion/MotionToggle';
import { rodape } from '@/content/navigation';
import { site } from '@/content/site';
import { rodapeCopy } from '@/content/home';

const grupos = [
  { titulo: 'Jogos', links: rodape.jogos },
  { titulo: 'Produtos', links: rodape.projetos },
  { titulo: 'Estúdio', links: rodape.estudio },
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

          <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
            {grupos.map((grupo) => (
              <div key={grupo.titulo}>
                <h2 className="tecnica text-mineral-dim">{grupo.titulo}</h2>
                <ul className="mt-2 flex flex-col">
                  {grupo.links.map((link) => (
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
          <MotionToggle />
        </div>
      </Container>
    </footer>
  );
}
