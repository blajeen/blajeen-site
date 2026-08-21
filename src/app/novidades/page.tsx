import type { Metadata } from 'next';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container } from '@/components/layout/Section';
import { dataPorExtenso, novidadesPublicadas, paginaDeNovidades, type Novidade } from '@/content/news';
import { projetoPorId, rotasDoProjeto } from '@/content/projects';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';
import { listManagedNews } from '@/lib/news/repository';

export const metadata: Metadata = metadadosDaRota({
  titulo: paginaDeNovidades.metaTitulo,
  descricao: paginaDeNovidades.metaDescricao,
  rota: ROTAS.novidades,
});

/*
 * A página se regenera de hora em hora.
 *
 * É o que faz um item datado para o futuro aparecer sozinho no dia certo, sem alguém precisar
 * republicar o site. Sem isso a lista congelaria no momento do build.
 */
export const revalidate = 60;

export default async function Page() {
  const manuais = await listManagedNews(true).catch(() => []);
  const itens: readonly Novidade[] = [
    ...manuais.map(({ slug, data, rotulo, titulo, texto, href, cta }) => ({
      id: slug, data, rotulo, titulo, texto,
      ...(href && cta ? { href, cta } : {}),
    })),
    ...novidadesPublicadas(),
  ].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <article className="relative isolate overflow-hidden pb-[clamp(4rem,10vw,9rem)] pt-[clamp(3rem,7vw,6rem)]">
      <LabBackdrop />
      <Container>
        <p className="tecnica text-signal">{paginaDeNovidades.eyebrow}</p>

        <h1 className="mt-8 text-[clamp(2.4rem,7vw,5rem)] leading-[0.98] tracking-[-0.05em]">
          {paginaDeNovidades.titulo}
        </h1>

        <p className="medida-texto mt-8 text-[1.1rem] leading-relaxed text-mineral">
          {paginaDeNovidades.introducao}
        </p>

        {itens.length === 0 ? (
          <p className="mt-16 text-mineral">{paginaDeNovidades.vazio}</p>
        ) : (
          <ol className="mt-16">
            {itens.map((item) => {
              const projeto = item.projeto ? projetoPorId[item.projeto] : null;

              return (
                <li
                  key={item.id}
                  id={item.id}
                  className="grid gap-x-10 gap-y-4 border-t border-line py-10 last:border-b lg:grid-cols-12 lg:py-12"
                >
                  <div className="lg:col-span-3">
                    <p className="tecnica text-signal">{item.rotulo}</p>
                    <time dateTime={item.data} className="mt-2 block text-sm text-mineral-dim">
                      {dataPorExtenso(item.data)}
                    </time>
                  </div>

                  <div className="lg:col-span-8 lg:col-start-5">
                    <h2 className="text-[clamp(1.4rem,2.8vw,2.1rem)] leading-tight tracking-[-0.04em]">
                      {item.titulo}
                    </h2>

                    {item.texto.map((paragrafo) => (
                      <p
                        key={paragrafo}
                        className="medida-texto mt-4 text-[1rem] leading-relaxed text-mineral"
                      >
                        {paragrafo}
                      </p>
                    ))}

                    {projeto ? (
                      <Link
                        href={rotasDoProjeto[projeto.id].pagina}
                        className="alvo-toque tecnica mt-6 inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
                      >
                        Ver {projeto.nome}
                        <span aria-hidden="true">→</span>
                      </Link>
                    ) : item.href && item.cta ? (
                      <Link
                        href={item.href}
                        className="alvo-toque tecnica mt-6 inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors duration-150 hover:border-signal hover:text-signal"
                      >
                        {item.cta}
                        <span aria-hidden="true">→</span>
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Container>
    </article>
  );
}
