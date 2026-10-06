'use client';

import { memo, useState } from 'react';
import { EMPREENDIMENTO } from '@/lib/torrelio/dados';
import { formatarPercentual } from '@/lib/torrelio/formatar';
import type { LinhaDoEspelho, ResumoComercial } from '@/lib/torrelio/seletores';
import styles from '../Torrelio.module.css';
import { EspelhoPorPavimento } from './EspelhoPorPavimento';

type Props = {
  /** No computador o espelho abre aberto; no celular, fechado, para o cartão ficar logo abaixo. */
  espelhoAberto: boolean;
  resumo: ResumoComercial;
  linhas: readonly LinhaDoEspelho[];
  tabela: number;
  selecionada: string;
  aoEscolher(id: string): void;
  aoDestacar(pavimento: number | null): void;
};

export function Legenda() {
  return (
    <ul className={styles.legenda} aria-label="Legenda">
      <li data-status="vendida">
        <span className={styles.marcaDoStatus} aria-hidden="true" />
        Luz acesa · vendida
      </li>
      <li data-status="reservada">
        <span className={styles.marcaDoStatus} aria-hidden="true" />
        Luz azul · reservada
      </li>
      <li data-status="disponivel">
        <span className={styles.marcaDoStatus} aria-hidden="true" />
        Apagada · disponível
      </li>
      <li data-status="indisponivel">
        <span className={styles.marcaDoStatus} aria-hidden="true" />
        Indisponível (permuta)
      </li>
    </ul>
  );
}

/** O painel da esquerda na visão do cliente: o empreendimento, quanto já vendeu e o espelho. */
export const PainelDoEmpreendimento = memo(function PainelDoEmpreendimento({ espelhoAberto, resumo, linhas, tabela, selecionada, aoEscolher, aoDestacar }: Props) {
  const [soDisponiveis, setSoDisponiveis] = useState(false);
  return (
    <section className={styles.painelEsquerdo} aria-labelledby="torrelio-empreendimento">
      <header>
        <p className={styles.seloFicticio}>EMPREENDIMENTO FICTÍCIO</p>
        <h3 id="torrelio-empreendimento" className={styles.nomeDoEmpreendimento}>
          {EMPREENDIMENTO.nome}
        </h3>
        <p className="text-mineral">
          {EMPREENDIMENTO.cidade} (cidade fictícia) · {resumo.total} unidades · {tabela === 1 ? 'tabela de lançamento' : `tabela ${tabela}`}
        </p>
      </header>
      <div className={styles.vendido}>
        <p>
          <strong>{formatarPercentual(resumo.fracaoVendida)}</strong> <span className="tecnica">VENDIDO</span>
        </p>
        <span className={styles.barraFina} aria-hidden="true">
          <span style={{ width: `${(resumo.fracaoVendida * 100).toFixed(1)}%` }} />
        </span>
        <p className={styles.contagem}>
          {resumo.porStatus.vendida} vendidas · {resumo.porStatus.reservada} reservadas · {resumo.porStatus.disponivel} disponíveis
        </p>
      </div>
      <Legenda />
      <details className={styles.espelhoRecolhivel} open={espelhoAberto}>
        <summary>
          <span>Espelho por pavimento</span>
          <span className="tecnica text-mineral">74 UNIDADES</span>
        </summary>
        <label className={styles.filtro}>
          <input type="checkbox" checked={soDisponiveis} onChange={(e) => setSoDisponiveis(e.target.checked)} />
          Destacar só as disponíveis
        </label>
        <EspelhoPorPavimento
          linhas={linhas}
          selecionada={selecionada}
          aoEscolher={aoEscolher}
          aoDestacar={aoDestacar}
          soDisponiveis={soDisponiveis}
          rotulo="Espelho por pavimento: escolha uma unidade"
        />
      </details>
    </section>
  );
});
