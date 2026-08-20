import type { Disponibilidade } from '@/content/types';

/**
 * Onde obter um produto.
 *
 * Quando a ficha da loja tem endereço confirmado, o item vira link. Sem endereço ele permanece
 * um selo informativo — anunciar "disponível" já é a informação; um botão que não abre a loja
 * seria pior do que a ausência dele, e é o tipo de coisa que a revisão das lojas reprova.
 *
 * O mesmo componente atende "em breve", sem data: o estado é dito, a promessa não.
 */
export function StoreBadges({
  disponibilidade,
  className,
}: {
  disponibilidade: readonly Disponibilidade[];
  className?: string;
}) {
  if (disponibilidade.length === 0) return null;

  const publicado = disponibilidade.some((item) => item.estado === 'disponivel');

  return (
    <div className={className}>
      <p className="tecnica text-mineral-dim">{publicado ? 'Onde baixar' : 'Em breve em'}</p>

      <ul className="mt-3 flex flex-wrap gap-2">
        {disponibilidade.map((item) => {
          const conteudo = (
            <>
              <StoreGlyph loja={item.loja} />
              <span className="flex flex-col leading-tight">
                <span className="text-[0.65rem] uppercase tracking-[0.14em] text-mineral-dim">
                  {item.estado === 'disponivel' ? 'Baixe na' : 'Em breve na'}
                </span>
                <span className="text-[0.95rem] text-paper">{item.nome}</span>
              </span>
            </>
          );

          const base =
            'flex items-center gap-3 rounded-[var(--radius-control)] border px-4 py-2.5 min-h-11 transition-colors duration-150';

          return (
            <li key={item.loja}>
              {item.url ? (
                <a
                  href={item.url}
                  className={`${base} border-line-strong hover:border-signal`}
                  rel="noopener"
                >
                  {conteudo}
                </a>
              ) : (
                <span className={`${base} border-line`} data-estado={item.estado}>
                  {conteudo}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Marca da loja, desenhada como glifo neutro.
 *
 * Não são os selos oficiais da Apple e do Google: aqueles têm arte e regras de uso próprias e
 * precisam vir das duas empresas. Estes são sinais discretos, dentro do sistema visual do site,
 * até os arquivos oficiais existirem no repositório.
 */
function StoreGlyph({ loja }: { loja: Disponibilidade['loja'] }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-7 flex-none items-center justify-center rounded-md border border-line text-signal"
    >
      {loja === 'appStore' ? (
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
          <path d="M12 3.6c.5-1.4 1.7-2.4 3-2.6.2 1.4-.4 2.7-1.2 3.6-.8.9-1.9 1.5-3 1.4-.2-1.3.4-2.6 1.2-3.4Zm4.2 6.6c-1.4-.1-2.6.8-3.3.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.6 2.2-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 1.9-1.1 2.7-2.2.8-1.2 1.1-2.4 1.1-2.5 0 0-2.1-.8-2.1-3.2 0-2 1.6-3 1.7-3-1-1.4-2.4-1.4-2.9-1.4Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
          <path d="M3.6 2.2c-.3.3-.5.8-.5 1.4v16.8c0 .6.2 1.1.5 1.4l.1.1 9.4-9.4v-.2L3.6 2.2Zm12.6 6.3-2.6 2.6v.2l2.6 2.6.1-.1 3.1-1.8c.9-.5.9-1.4 0-1.9l-3.2-1.6Zm-1 3.9L4.5 22.6c.3.3.8.3 1.4 0l9.9-5.6-1.6-1.6Zm0-4.8L4.5 1.4c-.6-.3-1.1-.3-1.4 0l10.7 10.7 1.4-1.5Z" />
        </svg>
      )}
    </span>
  );
}
