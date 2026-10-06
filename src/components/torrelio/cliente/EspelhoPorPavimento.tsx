'use client';

import { memo, useRef, useState, type KeyboardEvent } from 'react';
import { NOMES_DO_STATUS } from '@/lib/torrelio/estado';
import { formatarCentavos, formatarCentavosCurto } from '@/lib/torrelio/formatar';
import type { LinhaDoEspelho } from '@/lib/torrelio/seletores';
import styles from '../Torrelio.module.css';

type Props = {
  linhas: readonly LinhaDoEspelho[];
  selecionada: string;
  aoEscolher(id: string): void;
  /** Passar sobre o cabeçalho de um andar destaca a faixa dele na torre. */
  aoDestacar?(pavimento: number | null): void;
  /** No painel, a célula mostra o preço. */
  comPreco?: boolean;
  /** No celular, as outras unidades esmaecem. */
  soDisponiveis?: boolean;
  rotulo: string;
};

const FINAIS = ['01', '02', '03', '04'];

/**
 * O espelho de vendas como grade do APG: uma parada de Tab, setas entre as células, Home e End na
 * linha, Ctrl+Home e Ctrl+End nas pontas, Enter ou Espaço escolhem. Status por forma e por texto,
 * nunca só por cor.
 */
export const EspelhoPorPavimento = memo(function EspelhoPorPavimento({
  linhas, selecionada, aoEscolher, aoDestacar, comPreco = false, soDisponiveis = false, rotulo,
}: Props) {
  const tabela = useRef<HTMLTableElement>(null);
  // A célula que recebe o Tab: a escolhida, ou a primeira.
  const [ativa, setAtiva] = useState<string | null>(null);
  const focavel = ativa ?? selecionada;

  // Coordenadas lógicas: as coberturas ocupam duas colunas, então a coluna é a do final.
  const grade = linhas.map((linha) => linha.celulas.map((c) => c.id));

  function mover(evento: KeyboardEvent<HTMLButtonElement>, linha: number, coluna: number) {
    const ultimaLinha = grade.length - 1;
    const naLinha = (l: number) => grade[l]!;
    const colunaPara = (l: number, c: number) => Math.min(c, naLinha(l).length - 1);
    let destino: [number, number] | null = null;
    switch (evento.key) {
      case 'ArrowRight':
        destino = [linha, Math.min(coluna + 1, naLinha(linha).length - 1)];
        break;
      case 'ArrowLeft':
        destino = [linha, Math.max(coluna - 1, 0)];
        break;
      case 'ArrowDown':
        destino = [Math.min(linha + 1, ultimaLinha), 0];
        destino[1] = colunaPara(destino[0], linha === 0 ? coluna * 2 : coluna);
        break;
      case 'ArrowUp': {
        const acima = Math.max(linha - 1, 0);
        destino = [acima, colunaPara(acima, acima === 0 ? Math.floor(coluna / 2) : coluna)];
        break;
      }
      case 'Home':
        destino = evento.ctrlKey ? [0, 0] : [linha, 0];
        break;
      case 'End':
        destino = evento.ctrlKey ? [ultimaLinha, naLinha(ultimaLinha).length - 1] : [linha, naLinha(linha).length - 1];
        break;
      default:
        return;
    }
    evento.preventDefault();
    const id = naLinha(destino[0])[destino[1]];
    if (!id) return;
    setAtiva(id);
    tabela.current?.querySelector<HTMLButtonElement>(`[data-unidade="${id}"]`)?.focus();
  }

  return (
    <table ref={tabela} role="grid" aria-label={rotulo} className={styles.espelho} data-com-preco={comPreco ? 'sim' : 'nao'}>
      <thead>
        <tr>
          <th scope="col">
            <span className="sr-only">Andar</span>
          </th>
          {FINAIS.map((final) => (
            <th key={final} scope="col">
              {final}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((linha, l) => (
          <tr key={linha.rotulo}>
            <th
              scope="row"
              onPointerEnter={() => aoDestacar?.(linha.pavimentos[0]!)}
              onPointerLeave={() => aoDestacar?.(null)}
            >
              {linha.rotulo}
            </th>
            {linha.celulas.map((celula, c) => {
              const nome = NOMES_DO_STATUS[celula.status].singular;
              const escolhida = celula.id === selecionada;
              const apagada = soDisponiveis && celula.status !== 'disponivel';
              return (
                <td key={celula.id} role="gridcell" colSpan={celula.colunas} aria-selected={escolhida}>
                  <button
                    type="button"
                    data-unidade={celula.id}
                    data-status={celula.status}
                    data-apagada={apagada ? 'sim' : 'nao'}
                    tabIndex={celula.id === focavel ? 0 : -1}
                    className={styles.celula}
                    aria-label={`Apartamento ${celula.id}, final ${celula.final}, ${linha.rotulo} pavimento, ${nome}, ${formatarCentavos(celula.precoCentavos)}`}
                    onClick={() => {
                      setAtiva(celula.id);
                      aoEscolher(celula.id);
                    }}
                    onFocus={() => aoDestacar?.(linha.pavimentos[0]!)}
                    onBlur={() => aoDestacar?.(null)}
                    onKeyDown={(evento) => mover(evento, l, c)}
                  >
                    <span className={styles.marcaDoStatus} aria-hidden="true" />
                    <span className={styles.numeroDaCelula}>{celula.id}</span>
                    {comPreco ? <span className={styles.precoDaCelula}>{formatarCentavosCurto(celula.precoCentavos)}</span> : null}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
});
