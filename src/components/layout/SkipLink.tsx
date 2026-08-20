/** Primeiro alvo tabulável da página: pula o header e a gaveta e vai direto ao conteúdo. */
export function SkipLink() {
  return (
    <a
      href="#conteudo"
      className="alvo-toque tecnica sr-only inline-flex items-center rounded-full bg-signal px-5 text-ink focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-100"
    >
      Ir para o conteúdo
    </a>
  );
}
