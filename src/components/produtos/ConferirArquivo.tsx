import type { ArquivoParaBaixar } from '@/content/produtos';

/**
 * A conferência do arquivo baixado, dobrada.
 *
 * O hash é o que substitui a assinatura de código: sem ele a pessoa não tem como saber
 * se o arquivo que chegou é o que saiu daqui. Então ele fica publicado, sempre.
 *
 * Mas ele estava aberto no meio da página, e um paredão de sessenta e quatro letras
 * aleatórias é a coisa mais técnica de um site que promete não ter palavra difícil.
 * Quase ninguém que baixa um bloco de notas sabe o que aquilo é, e quem sabe procura.
 * Dobrado atrás de uma linha em português, ele some pra maioria e continua a um clique
 * pra quem quer — que é exatamente o público dele.
 *
 * `details` e não um botão com estado: abre sem JavaScript, o navegador já dá o
 * teclado e o leitor de tela de graça, e o conteúdo é achável pelo Ctrl+F da página
 * mesmo fechado.
 */
export function ConferirArquivo({
  arquivos,
  produto,
  versao,
}: {
  arquivos: readonly ArquivoParaBaixar[];
  produto: string;
  versao: string;
}) {
  const primeiro = arquivos[0]?.arquivo ?? '';

  return (
    <details className="group mt-6 rounded-[var(--radius-control)] border border-line bg-raised/40">
      <summary className="alvo-toque tecnica flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-mineral transition-colors hover:text-paper">
        <span
          aria-hidden="true"
          className="text-signal transition-transform group-open:rotate-90"
        >
          ›
        </span>
        CONFERIR O ARQUIVO QUE VOCÊ BAIXOU
      </summary>

      <div className="border-t border-line px-5 pt-4 pb-5">
        <p className="medida-texto text-sm leading-relaxed text-mineral">
          Cada arquivo tem uma impressão digital, e ela muda se um único byte mudar. Se a
          do que você baixou for igual à daqui, é o arquivo certo — ninguém trocou nada no
          caminho. No Windows, abra o PowerShell na pasta do download e rode:
        </p>

        <pre className="mt-4 overflow-x-auto rounded-[var(--radius-control)] border border-line bg-surface p-4 font-mono text-xs text-paper/85">
          <code>{`Get-FileHash .\\${primeiro} -Algorithm SHA256`}</code>
        </pre>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
            <caption className="sr-only">
              SHA-256 de cada arquivo publicado do {produto} {versao}
            </caption>
            <thead>
              <tr className="border-b border-line-strong">
                <th scope="col" className="tecnica py-3 pr-6 text-mineral">
                  ARQUIVO
                </th>
                <th scope="col" className="tecnica py-3 text-mineral">
                  SHA-256
                </th>
              </tr>
            </thead>
            <tbody className="font-mono text-mineral-dim">
              {arquivos.map((arquivo) => (
                <tr key={arquivo.id} className="border-b border-line align-top last:border-0">
                  <td className="py-3 pr-6 whitespace-nowrap">{arquivo.arquivo}</td>
                  <td className="py-3 break-all">{arquivo.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
