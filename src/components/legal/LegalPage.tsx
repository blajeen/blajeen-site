import Link from 'next/link';
import { Container } from '@/components/layout/Section';
import { PendingNotice } from '@/components/legal/PendingNotice';
import type { LegalBlock, LegalDocument } from '@/content/types';

function Bloco({ bloco }: { bloco: LegalBlock }) {
  switch (bloco.tipo) {
    case 'paragrafo':
      return <p className="medida-texto mt-5 text-[1rem] leading-relaxed text-mineral">{bloco.texto}</p>;

    case 'lista':
      return (
        <ul className="medida-texto mt-5 flex flex-col gap-2">
          {bloco.itens.map((item) => (
            <li key={item} className="flex gap-3 text-[1rem] leading-relaxed text-mineral">
              <span aria-hidden="true" className="mt-[0.7em] size-1 flex-none rounded-full bg-steel" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'passos':
      return (
        <ol className="medida-texto mt-5 flex flex-col gap-3">
          {bloco.itens.map((item, indice) => (
            <li key={item} className="flex gap-4 text-[1rem] leading-relaxed text-mineral">
              <span className="tecnica mt-[0.25em] flex-none text-signal">
                {String(indice + 1).padStart(2, '0')}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );

    case 'destaque':
      return (
        <p className="medida-texto mt-6 border-l-2 border-signal/50 pl-5 text-[1rem] leading-relaxed text-paper">
          {bloco.texto}
        </p>
      );

    case 'contato':
      return bloco.email.definido ? (
        <p className="mt-6">
          <span className="tecnica block text-mineral-dim">{bloco.rotulo}</span>
          <a
            href={`mailto:${bloco.email.valor}${bloco.assunto ? `?subject=${encodeURIComponent(bloco.assunto)}` : ''}`}
            className="alvo-toque mt-2 inline-flex items-center border-b border-signal/60 pb-1 text-[1.05rem] text-paper transition-colors duration-150 hover:text-signal"
          >
            {bloco.email.valor}
          </a>
        </p>
      ) : (
        <PendingNotice
          bloqueador={bloco.email.bloqueador}
          explicacao="Este canal ainda não foi criado e por isso não é publicado aqui."
        />
      );

    case 'pendente':
      return <PendingNotice bloqueador={bloco.bloqueador} explicacao={bloco.explicacao} />;
  }
}

/**
 * Página jurídica ou de suporte.
 *
 * Renderizada no servidor e utilizável sem JavaScript: não há acordeão, gaveta ou script entre
 * a pessoa e o texto. É o que permite que estas URLs sirvam de infraestrutura pública para
 * App Store Connect e Google Play Console.
 */
export function LegalPage({ documento }: { documento: LegalDocument }) {
  /*
   * Sem arte de fundo, e a decisão foi medida — não é preferência.
   *
   * `npm run qa:contraste` acusou parágrafos destes documentos em 2,98:1, contra os 4,5:1 do AA.
   * A causa é a forma da página: coluna larga de texto corrido, sem a coluna vazia que nas outras
   * telas guarda a ilustração. E é aqui que a leitura mais importa — quem chega está tentando
   * entender o que é feito com seus dados ou apagar a própria conta.
   */
  return (
    <article className="pb-[clamp(4rem,9vw,8rem)] pt-[clamp(3rem,7vw,6rem)]">
      <Container>
        <header className="border-b border-line pb-10">
          <p className="tecnica text-signal">{documento.produto}</p>

          <h1 className="mt-6 max-w-[20ch] text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.03] tracking-[-0.045em]">
            {documento.titulo}
          </h1>

          <p className="medida-texto mt-6 text-[1.05rem] leading-relaxed text-mineral">
            {documento.resumo}
          </p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <dt className="tecnica text-mineral-dim">Estado</dt>
              <dd className="mt-1 text-sm text-paper">
                {documento.estado === 'publicado' ? 'Documento publicado' : 'Versão de trabalho pública'}
              </dd>
            </div>
            {documento.atualizacao.definido ? (
              <div>
                <dt className="tecnica text-mineral-dim">Atualizado em</dt>
                <dd className="mt-1 text-sm text-paper">{documento.atualizacao.valor}</dd>
              </div>
            ) : null}
          </dl>

          {documento.estado === 'preparacao' ? (
            <p className="medida-texto mt-8 rounded-[var(--radius-control)] border border-line bg-raised/50 px-5 py-4 text-sm leading-relaxed text-mineral">
              Este texto descreve o comportamento auditado dos produtos, mas ainda depende de
              decisões do titular e de revisão jurídica. Os pontos abertos aparecem marcados como
              <span className="text-paper"> Em definição</span> ao longo da página, em vez de serem
              preenchidos com informação estimada.
            </p>
          ) : null}
        </header>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {documento.secoes.map((secao) => (
              <section key={secao.id} id={secao.id} className="mb-14 last:mb-0">
                <h2 className="text-[clamp(1.35rem,2.6vw,1.85rem)] leading-tight tracking-[-0.035em]">
                  {secao.titulo}
                </h2>
                {secao.blocos.map((bloco, indice) => (
                  <Bloco key={`${secao.id}-${indice}`} bloco={bloco} />
                ))}
              </section>
            ))}
          </div>

          <nav
            aria-label="Documentos relacionados"
            className="lg:col-span-3 lg:col-start-10 lg:sticky lg:top-28 lg:self-start"
          >
            <h2 className="tecnica text-mineral-dim">Relacionados</h2>
            <ul className="mt-4 flex flex-col">
              {documento.relacionados.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center border-b border-line text-sm text-mineral transition-colors duration-150 hover:text-signal"
                  >
                    {link.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </article>
  );
}
