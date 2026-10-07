'use client';

import type { Ambiente, PontoDoInterior, Vista } from '@/lib/carrelio/tipos';
import { IconeCentralizar, IconeFarol, IconeGaragem, IconeGirar, IconeNoite } from './Icones';
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

type Props = {
  vista: Vista;
  ponto: PontoDoInterior;
  /** Pontos de dentro que o modelo 3D tem; sem nenhum (o carro gerado no Tripo), não há "Por dentro". */
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
 * Os controles por cima do carro, numa fileira só: do que mostra o carro (noite, faróis) ao que mexe
 * na câmera (girar, zoom) e, por último, o "Na sua garagem", com o sinal verde. No celular a fileira
 * cabe na tela sem deslizar: os ícones saem e o zoom sobe para o canto do palco (lá ele é a
 * alternativa de um dedo à pinça). Cada botão de ligar e desligar usa `aria-pressed`; os de ícone
 * têm nome acessível.
 */
export function BarraDoPalco(props: Props) {
  const { vista, ponto, pontosDisponiveis, portasAbertas, temPortas, farois, ambiente, girando, com3d } = props;
  const pontos = PONTOS.filter((p) => pontosDisponiveis.includes(p.id));
  const noite = ambiente === 'noite';
  return (
    <div className={styles.barra3d} role="group" aria-label="Controles do carro" data-barra="">
      {pontos.length > 0 ? (
        <div role="group" aria-label="Vista" className={styles.segmento}>
          {VISTAS.map((v) => (
            <button key={v.id} type="button" aria-pressed={vista === v.id} onClick={() => props.aoVista(v.id)}>
              {v.rotulo}
            </button>
          ))}
        </div>
      ) : null}
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
      <button type="button" className={styles.segmentoSolto} aria-pressed={noite} onClick={() => props.aoAmbiente(noite ? 'estudio' : 'noite')}>
        <IconeNoite />
        Noite
      </button>
      <button type="button" className={styles.segmentoSolto} aria-pressed={farois} onClick={() => props.aoFarois(!farois)}>
        <IconeFarol />
        Faróis
      </button>
      {vista === 'fora' ? (
        <button type="button" className={styles.segmentoSolto} aria-pressed={girando} onClick={() => props.aoGirar(!girando)}>
          <IconeGirar />
          Girar
        </button>
      ) : null}
      <ControlesDoZoom com3d={com3d} aoZoom={props.aoZoom} aoEnquadrar={props.aoEnquadrar} className={styles.soNoLargo} />
      <button type="button" className={`${styles.segmentoSolto} ${styles.botaoDaGaragem}`} onClick={props.aoGaragem}>
        <IconeGaragem />
        Na sua garagem
      </button>
    </div>
  );
}

/** Afastar, centralizar (voltar ao enquadramento) e aproximar: na barra, ou no canto do palco no celular. */
export function ControlesDoZoom({ com3d, aoZoom, aoEnquadrar, className }: { com3d: boolean; aoZoom(passo: 1 | -1): void; aoEnquadrar(): void; className?: string | undefined }) {
  return (
    <div role="group" aria-label="Zoom" className={`${styles.segmento} ${styles.zoom}${className ? ` ${className}` : ''}`}>
      <button type="button" aria-label="Afastar" onClick={() => aoZoom(-1)} disabled={!com3d}>
        <span aria-hidden="true">−</span>
      </button>
      <button type="button" aria-label="Centralizar" title="Centralizar" onClick={aoEnquadrar} disabled={!com3d}>
        <IconeCentralizar />
      </button>
      <button type="button" aria-label="Aproximar" onClick={() => aoZoom(1)} disabled={!com3d}>
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
