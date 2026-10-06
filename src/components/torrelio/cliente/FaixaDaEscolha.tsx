import { NOMES_DO_STATUS, type EstadoTorrelio } from '@/lib/torrelio/estado';
import { formatarCentavos } from '@/lib/torrelio/formatar';
import type { Modo, Quarto, Unidade } from '@/lib/torrelio/tipos';
import { NOME_DA_CATEGORIA } from '../interface';
import styles from '../Torrelio.module.css';

/**
 * No celular, o cartão fica embaixo do palco: esta faixa, no pé da maquete, diz o que está
 * escolhido e leva até ele. No computador ela some, porque o cartão está ao lado.
 */
export function FaixaDaEscolha({ modo, unidade, quarto, estado }: { modo: Modo; unidade: Unidade; quarto: Quarto | null; estado: EstadoTorrelio }) {
  if (modo === 'hotel') {
    if (!quarto) return null;
    return (
      <a href={`#quarto-${quarto.id}`} className={styles.faixaDaEscolha}>
        <strong>{quarto.id}</strong> · {NOME_DA_CATEGORIA[quarto.categoria]} · {quarto.pavimento}º <span>Detalhes ↓</span>
      </a>
    );
  }
  const situacao = estado.unidades[unidade.id]!;
  return (
    <a href={`#cartao-${unidade.id}`} className={styles.faixaDaEscolha}>
      <strong>{unidade.id}</strong> · {NOMES_DO_STATUS[situacao.status].singular} · {formatarCentavos(situacao.precoCentavos)} <span>Detalhes ↓</span>
    </a>
  );
}
