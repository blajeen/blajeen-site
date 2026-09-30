import { rotuloMes, type LinhaMensal } from '@/lib/admin/relatorios';
import { reais } from '@/lib/contracts/valores';

/**
 * Colunas de uma série só (recebido por mês). Sem legenda: o título diz o que está plotado.
 * Colunas finas com topo arredondado, base comum, rótulo só no maior e no último mês; cada coluna
 * mostra o valor no foco/hover e a tabela mensal da página é a versão em tabela.
 */
export function GraficoMensal({ linhas, titulo }: { linhas: LinhaMensal[]; titulo: string }) {
  const maximo = Math.max(...linhas.map((l) => l.recebido), 0);
  const indiceMaior = linhas.findIndex((l) => l.recebido === maximo && maximo > 0);
  return (
    <figure className="m-0">
      <figcaption className="text-lg">{titulo}</figcaption>
      <div role="list" className="mt-6 flex h-48 items-end gap-2 border-b border-line-strong">
        {linhas.map((linha, indice) => {
          const altura = maximo > 0 ? Math.max((linha.recebido / maximo) * 100, linha.recebido > 0 ? 3 : 0) : 0;
          const mostrarRotulo = linha.recebido > 0 && (indice === indiceMaior || indice === linhas.length - 1);
          const descricao = `${rotuloMes(linha.mes)}: ${reais(linha.recebido)} recebidos`;
          return (
            <div key={linha.mes} role="listitem" tabIndex={0} aria-label={descricao}
              className="group relative flex h-full flex-1 flex-col items-center justify-end outline-none">
              <span className={`mb-1 text-[0.7rem] tabular-nums text-mineral ${mostrarRotulo ? '' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}>
                {linha.recebido > 0 ? reais(Math.round(linha.recebido)) : ''}
              </span>
              <span className="block w-full max-w-6 rounded-t-[4px] bg-signal transition-opacity group-hover:opacity-80" style={{ height: `${altura}%` }} />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2" aria-hidden="true">
        {linhas.map((linha) => <span key={linha.mes} className="flex-1 text-center text-[0.68rem] text-mineral-dim">{rotuloMes(linha.mes).split(' ')[0]}</span>)}
      </div>
    </figure>
  );
}
