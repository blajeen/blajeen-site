'use client';

import { useEffect, useRef } from 'react';
import { descricaoDaVista } from '@/lib/torrelio/entorno';
import { NOMES_DO_STATUS } from '@/lib/torrelio/estado';
import { formatarCentavos, formatarCota } from '@/lib/torrelio/formatar';
import { cota } from '@/lib/torrelio/predio';
import type { Fachada, Quarto, Unidade } from '@/lib/torrelio/tipos';
import { NOMES_DAS_FACHADAS } from '../interface';
import styles from '../Torrelio.module.css';

type Props = {
  alvo: Unidade | Quarto;
  /** "Vista do 1803" ou "Vista do quarto 1806". */
  titulo: string;
  fachada: Fachada;
  /** Status e preço (ou diária) do andar atual, para comparar subindo e descendo. */
  detalhe: string;
  acima: { rotulo: string } | null;
  abaixo: { rotulo: string } | null;
  com3d: boolean;
  aoTrocarFachada(fachada: Fachada): void;
  aoSubir(): void;
  aoDescer(): void;
  aoOlhar(direcao: 'esquerda' | 'direita'): void;
  aoVoltar(): void;
};

/**
 * A faixa sobre o palco quando a câmera está na varanda: de onde é a vista, o que se vê, e o
 * "elevador" para comparar andares. Funciona também sem o 3D, só com o texto da vista.
 */
export function FaixaDaVista({ alvo, titulo, fachada, detalhe, acima, abaixo, com3d, aoTrocarFachada, aoSubir, aoDescer, aoOlhar, aoVoltar }: Props) {
  const voltar = useRef<HTMLButtonElement>(null);
  // Ao entrar na vista, o foco vai para "Voltar" (e Esc também volta).
  useEffect(() => {
    voltar.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') aoVoltar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aoVoltar]);

  return (
    <section className={styles.faixaDaVista} aria-labelledby="torrelio-vista-titulo">
      <div className={styles.vistaCabeca}>
        <h3 id="torrelio-vista-titulo">
          {titulo} · {NOMES_DAS_FACHADAS[fachada]} · {formatarCota(cota(alvo.pavimentos[0]!))}
        </h3>
        <button ref={voltar} type="button" className={styles.botao} onClick={aoVoltar}>
          <span aria-hidden="true">←</span> Voltar para o prédio
        </button>
      </div>
      <p className={styles.vistaTexto} aria-live="polite">
        {descricaoDaVista(alvo, fachada)} <span className="text-mineral">Entorno fictício.</span>
      </p>
      <div className={styles.vistaControles}>
        {alvo.fachadas.length > 1 ? (
          <div role="group" aria-label="Fachada da vista" className={styles.segmento}>
            {alvo.fachadas.map((f) => (
              <button key={f} type="button" aria-pressed={f === fachada} onClick={() => aoTrocarFachada(f)}>
                {NOMES_DAS_FACHADAS[f]}
              </button>
            ))}
          </div>
        ) : null}
        <div role="group" aria-label="Trocar de andar" className={styles.elevador}>
          <button type="button" className={styles.botao} onClick={aoSubir} disabled={!acima}>
            <span aria-hidden="true">▲</span> {acima ? acima.rotulo : 'Último andar'}
          </button>
          <button type="button" className={styles.botao} onClick={aoDescer} disabled={!abaixo}>
            <span aria-hidden="true">▼</span> {abaixo ? abaixo.rotulo : 'Primeiro andar'}
          </button>
        </div>
        {com3d ? (
          <div role="group" aria-label="Olhar em volta" className={styles.segmento}>
            <button type="button" onClick={() => aoOlhar('esquerda')} aria-label="Olhar para a esquerda">
              ◀
            </button>
            <button type="button" onClick={() => aoOlhar('direita')} aria-label="Olhar para a direita">
              ▶
            </button>
          </div>
        ) : null}
      </div>
      <p className={styles.vistaDetalhe} aria-live="polite">
        {detalhe}
      </p>
    </section>
  );
}

/** "Disponível · R$ 785.619,74" para a faixa da vista. */
export function detalheDaUnidade(status: keyof typeof NOMES_DO_STATUS, precoCentavos: number): string {
  const nome = NOMES_DO_STATUS[status].singular;
  return `${nome[0]!.toUpperCase()}${nome.slice(1)} · ${formatarCentavos(precoCentavos)}`;
}
