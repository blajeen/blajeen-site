'use client';

import type { Ambiente, PontoDoInterior, Vista } from '@/lib/carrelio/tipos';
import styles from './Carrelio.module.css';

const VISTAS: readonly { id: Vista; rotulo: string }[] = [
  { id: 'fora', rotulo: 'Por fora' },
  { id: 'dentro', rotulo: 'Por dentro' },
];

const PONTOS: readonly { id: PontoDoInterior; rotulo: string }[] = [
  { id: 'motorista', rotulo: 'Motorista' },
  { id: 'bancoTraseiro', rotulo: 'Banco de trás' },
  { id: 'portaMalas', rotulo: 'Porta-malas' },
];

const AMBIENTES: readonly { id: Ambiente; rotulo: string }[] = [
  { id: 'estudio', rotulo: 'Estúdio' },
  { id: 'noite', rotulo: 'Noite' },
];

type Props = {
  vista: Vista;
  ponto: PontoDoInterior;
  /** Pontos de dentro que o modelo 3D tem (o provisório não tem banco de trás, por exemplo). */
  pontosDisponiveis: readonly PontoDoInterior[];
  portasAbertas: boolean;
  temPortas: boolean;
  farois: boolean;
  ambiente: Ambiente;
  girando: boolean;
  com3d: boolean;
  aoVista(vista: Vista): void;
  aoPonto(ponto: PontoDoInterior): void;
  aoPortas(abertas: boolean): void;
  aoFarois(acesos: boolean): void;
  aoAmbiente(ambiente: Ambiente): void;
  aoGirar(girando: boolean): void;
  aoZoom(passo: 1 | -1): void;
  aoEnquadrar(): void;
  aoGaragem(): void;
};

/**
 * Os controles por cima do carro, numa fileira só: no celular ela desliza de lado (com a borda
 * esmaecida dizendo que há mais), no computador cabe inteira. Cada botão de ligar e desligar usa
 * `aria-pressed`; as escolhas de uma entre várias são grupos de botões.
 */
export function BarraDoPalco(props: Props) {
  const { vista, ponto, pontosDisponiveis, portasAbertas, temPortas, farois, ambiente, girando, com3d } = props;
  const pontos = PONTOS.filter((p) => pontosDisponiveis.includes(p.id));
  return (
    <div className={styles.barra3d} role="group" aria-label="Controles do carro">
      <div role="group" aria-label="Vista" className={styles.segmento}>
        {VISTAS.map((v) => (
          <button key={v.id} type="button" aria-pressed={vista === v.id} onClick={() => props.aoVista(v.id)}>
            {v.rotulo}
          </button>
        ))}
      </div>
      {vista === 'dentro' && pontos.length > 1 ? (
        <div role="group" aria-label="De onde olhar" className={styles.segmento}>
          {pontos.map((p) => (
            <button key={p.id} type="button" aria-pressed={ponto === p.id} onClick={() => props.aoPonto(p.id)}>
              {p.rotulo}
            </button>
          ))}
        </div>
      ) : null}
      {vista === 'fora' && temPortas ? (
        <button type="button" className={styles.segmentoSolto} aria-pressed={portasAbertas} onClick={() => props.aoPortas(!portasAbertas)}>
          Portas
        </button>
      ) : null}
      <button type="button" className={styles.segmentoSolto} aria-pressed={farois} onClick={() => props.aoFarois(!farois)}>
        Faróis
      </button>
      <div role="group" aria-label="Ambiente" className={styles.segmento}>
        {AMBIENTES.map((a) => (
          <button key={a.id} type="button" aria-pressed={ambiente === a.id} onClick={() => props.aoAmbiente(a.id)}>
            {a.rotulo}
          </button>
        ))}
      </div>
      {vista === 'fora' ? (
        <button type="button" className={styles.segmentoSolto} aria-pressed={girando} onClick={() => props.aoGirar(!girando)}>
          Girar
        </button>
      ) : null}
      <div role="group" aria-label="Zoom" className={styles.segmento}>
        <button type="button" aria-label="Afastar" onClick={() => props.aoZoom(-1)} disabled={!com3d}>
          −
        </button>
        <button type="button" aria-label="Aproximar" onClick={() => props.aoZoom(1)} disabled={!com3d}>
          +
        </button>
      </div>
      <button type="button" className={styles.segmentoSolto} onClick={props.aoEnquadrar} disabled={!com3d}>
        Centralizar
      </button>
      <button type="button" className={`${styles.segmentoSolto} ${styles.botaoDaGaragem}`} onClick={props.aoGaragem}>
        Na sua garagem
      </button>
    </div>
  );
}
