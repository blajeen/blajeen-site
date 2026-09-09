/**
 * O mesmo programa numa loja, quando ele está lá.
 *
 * Fica na seção de baixar, junto dos arquivos, porque é ali que a pessoa está decidindo
 * como instalar — e não no fim da página, onde ela chegaria depois de já ter baixado.
 *
 * Quando `url` é `null`, o bloco continua aparecendo e diz que ainda não saiu. A
 * alternativa seria esconder, e aí quem procurasse o produto na loja concluiria que ele
 * não vai estar lá.
 */
export function LojaDoProduto({
  loja,
  produto,
}: {
  loja: { nome: string; url: string | null; nota: string };
  produto: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[var(--radius-panel)] border border-line bg-raised/40 p-6 sm:p-7">
      <div className="min-w-[16ch] flex-1">
        <p className="tecnica text-mineral-dim">Também na loja</p>
        <p className="mt-2 text-[1.05rem] leading-snug tracking-[-0.02em] text-paper">
          {loja.nome}
        </p>
        <p className="medida-texto mt-2 text-sm leading-relaxed text-mineral">{loja.nota}</p>
      </div>

      {loja.url ? (
        <a
          href={loja.url}
          target="_blank"
          rel="noreferrer"
          className="alvo-toque tecnica inline-flex items-center justify-center rounded-full border border-signal/40 px-5 text-signal transition-colors hover:border-signal hover:bg-raised"
        >
          ABRIR NA {loja.nome.toUpperCase()} →
        </a>
      ) : (
        <span className="tecnica inline-flex items-center justify-center rounded-full border border-line px-5 py-3 text-mineral-dim">
          EM BREVE
        </span>
      )}

      <span className="sr-only">
        {loja.url
          ? `${produto} também está disponível na ${loja.nome}.`
          : `${produto} ainda não está na ${loja.nome}.`}
      </span>
    </div>
  );
}
