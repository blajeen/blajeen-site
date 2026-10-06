import type { EntradaDoHistorico } from '@/lib/torrelio/estado';
import styles from '../Torrelio.module.css';

/** O que mudou na demonstração, do mais novo para o mais antigo, na hora local de quem mudou. */
export function Historico({ historico }: { historico: readonly EntradaDoHistorico[] }) {
  if (!historico.length) {
    return <p className={styles.vazio}>Nada mudou ainda. Marque uma venda ou reajuste a tabela: cada mudança aparece aqui.</p>;
  }
  return (
    <ol className={styles.historico} aria-label="Histórico de mudanças">
      {historico.map((entrada) => (
        <li key={entrada.id} data-tipo={entrada.tipo}>
          <time dateTime={entrada.quando}>
            {new Date(entrada.quando).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </time>
          <span>{entrada.texto}</span>
        </li>
      ))}
    </ol>
  );
}
