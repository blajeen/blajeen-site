'use client';

import { useEffect, useRef } from 'react';
import { descricaoDaVista } from '@/lib/torrelio/entorno';
import { NOMES_DO_STATUS } from '@/lib/torrelio/estado';
import { formatarCentavos, formatarCota } from '@/lib/torrelio/formatar';
import { cota } from '@/lib/torrelio/predio';
import type { Fachada, Quarto, Unidade } from '@/lib/torrelio/tipos';
import { NOMES_DAS_FACHADAS, PRESETS_DE_HORA, presetDaHora } from '../interface';
import styles from '../Torrelio.module.css';

type Props = {
  alvo: Unidade | Quarto;
  /** "Vista do 1803" ou "Vista do quarto 1806". */
  titulo: string;
  fachada: Fachada;
  /** Status e preço (ou diária) do andar atual, para comparar subindo e descendo. */
  detalhe: string;
  /** `rotulo` completo ("Subir: 1903 · R$ 792.392,33"); `curto` é o que cabe no celular ("1903"). */
  acima: { rotulo: string; curto: string } | null;
  abaixo: { rotulo: string; curto: string } | null;
  com3d: boolean;
  /** A hora da cena: na vista, a barra do palco some, e sem isto a paisagem ficava presa à noite. */
  hora: number;
  aoHora(hora: number): void;
  aoTrocarFachada(fachada: Fachada): void;
  aoSubir(): void;
  aoDescer(): void;
  aoOlhar(direcao: 'esquerda' | 'direita'): void;
  aoVoltar(): void;
};

/**
 * A faixa sobre o palco quando a câmera está na varanda: de onde é a vista, o que se vê, e o
 * "elevador" para comparar andares. Funciona também sem o 3D, só com o texto da vista.
 *
 * No computador é um painel no canto. Abaixo de 1024 px ela se divide: o título e o "Voltar" numa
 * barra fina em cima, o texto e os controles embaixo, e a paisagem fica livre no meio (no celular,
 * o painel inteiro cobria dois terços da vista).
 */
export function FaixaDaVista({ alvo, titulo, fachada, detalhe, acima, abaixo, com3d, hora, aoHora, aoTrocarFachada, aoSubir, aoDescer, aoOlhar, aoVoltar }: Props) {
  const preset = presetDaHora(hora);
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
        <button ref={voltar} type="button" className={styles.botao} onClick={aoVoltar} aria-label="Voltar para o prédio">
          <span aria-hidden="true">←</span>{' '}
          {/* Um item só no flex do botão: o espaço antes de "para" não vira um vão duplo. */}
          <span>
            Voltar<span className={styles.soNoLargo}> para o prédio</span>
          </span>
        </button>
      </div>
      <div className={styles.vistaCorpo}>
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
          <div role="group" aria-label="Hora do dia" className={styles.segmento}>
            {PRESETS_DE_HORA.map((p) => (
              <button key={p.id} type="button" aria-pressed={preset === p.id} onClick={() => aoHora(p.hora)}>
                {p.rotulo}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Trocar de andar" className={styles.elevador}>
            <BotaoDoElevador seta="▲" andar={acima} semAndar="Último andar" aoTrocar={aoSubir} />
            <BotaoDoElevador seta="▼" andar={abaixo} semAndar="Primeiro andar" aoTrocar={aoDescer} />
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
      </div>
    </section>
  );
}

/** Subir ou descer um andar. No celular, só o número da unidade; o nome acessível é sempre o completo. */
function BotaoDoElevador({ seta, andar, semAndar, aoTrocar }: { seta: string; andar: { rotulo: string; curto: string } | null; semAndar: string; aoTrocar(): void }) {
  return (
    <button type="button" className={styles.botao} onClick={aoTrocar} disabled={!andar} aria-label={andar?.rotulo}>
      <span aria-hidden="true">{seta}</span>{' '}
      {andar ? (
        <>
          <span className={styles.soNoLargo}>{andar.rotulo}</span>
          <span className={styles.soNoEstreito}>{andar.curto}</span>
        </>
      ) : (
        semAndar
      )}
    </button>
  );
}

/** "Disponível · R$ 785.619,74" para a faixa da vista. */
export function detalheDaUnidade(status: keyof typeof NOMES_DO_STATUS, precoCentavos: number): string {
  const nome = NOMES_DO_STATUS[status].singular;
  return `${nome[0]!.toUpperCase()}${nome.slice(1)} · ${formatarCentavos(precoCentavos)}`;
}
