import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Section';
import { naoEncontrado } from '@/content/pages';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = {
  title: { absolute: naoEncontrado.metaTitulo },
  robots: { index: false, follow: true },
};

const destinos = [
  { href: ROTAS.home, rotulo: 'Início', texto: 'O laboratório e seus experimentos.' },
  { href: ROTAS.projetoRevalio, rotulo: 'Revalio', texto: 'Aprendizagem médica gamificada.' },
  { href: ROTAS.projetoDocalio, rotulo: 'Docalio', texto: 'Estratégia e prioridade na emergência.' },
  { href: ROTAS.projetoGramelio, rotulo: 'Gramelio', texto: 'Jogo casual de fazenda, a um toque.' },
  { href: ROTAS.projetoCatelio, rotulo: 'Catelio', texto: 'Exploração casual em uma cidade colorida.' },
  { href: ROTAS.projetoDogolio, rotulo: 'Dogolio', texto: 'Um cachorro caramelo e novas histórias pela cidade.' },
  { href: ROTAS.suporte, rotulo: 'Suporte', texto: 'Ajuda, privacidade e exclusão de dados.' },
];

export default function NotFound() {
  return (
    <article className="flex min-h-[70svh] items-center py-[clamp(4rem,10vw,9rem)]">
      <Container>
        <p className="tecnica flex items-center gap-3 text-signal">
          <span
            aria-hidden="true"
            className="inline-block size-[5px] rounded-full bg-signal shadow-[0_0_8px_var(--color-signal)]"
          />
          {naoEncontrado.eyebrow} / {naoEncontrado.codigo}
        </p>

        <h1 className="mt-8 max-w-[16ch] text-[clamp(2.2rem,6.5vw,4.5rem)] leading-[1] tracking-[-0.05em]">
          {naoEncontrado.titulo}
        </h1>

        <p className="medida-texto mt-6 text-[1.05rem] leading-relaxed text-mineral">
          {naoEncontrado.texto}
        </p>

        <nav aria-label="Destinos principais" className="mt-14">
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-2">
            {destinos.map((destino) => (
              <li key={destino.href}>
                <Link
                  href={destino.href}
                  className="flex h-full flex-col bg-surface px-6 py-6 transition-colors duration-150 hover:bg-raised"
                >
                  <span className="flex items-center justify-between gap-4 text-[1.1rem] text-paper">
                    {destino.rotulo}
                    <span aria-hidden="true" className="text-signal">
                      →
                    </span>
                  </span>
                  <span className="mt-1 text-sm leading-snug text-mineral">{destino.texto}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </article>
  );
}
