'use client';

import { useEffect, useRef, useState } from 'react';
import { formatarHora } from '@/lib/torrelio/formatar';
import type { Enquadramento, Estacao, Modo } from '@/lib/torrelio/tipos';
import { ENQUADRAMENTOS, NOMES_DAS_ESTACOES, PRESETS_DE_HORA, presetDaHora, type Camada } from './interface';
import styles from './Torrelio.module.css';

type Props = {
  modo: Modo;
  camada: Camada;
  hora: number;
  estacao: Estacao;
  enquadramento: Enquadramento;
  contornar: boolean;
  deDia: boolean;
  girando: boolean;
  movimento: boolean;
  com3d: boolean;
  aoCamada(camada: Camada): void;
  aoHora(hora: number): void;
  aoEstacao(estacao: Estacao): void;
  aoEnquadrar(enquadramento: Enquadramento): void;
  aoContornar(contornar: boolean): void;
  aoGirar(): void;
  aoZoom(passo: 1 | -1): void;
};

/** A barra do 3D, a mesma nas duas abas: camada, hora e sol, câmera, contorno, girar e zoom. */
export function BarraDoPalco(props: Props) {
  const { modo, camada, hora, estacao, enquadramento, contornar, deDia, girando, movimento, com3d } = props;
  const [solAberto, setSolAberto] = useState(false);
  const [animando, setAnimando] = useState(false);
  const painelDoSol = useRef<HTMLDivElement>(null);
  const botaoDoSol = useRef<HTMLButtonElement>(null);
  const preset = presetDaHora(hora);
  const aoHora = useRef(props.aoHora);
  useEffect(() => {
    aoHora.current = props.aoHora;
  });

  // "Animar o dia": das 6h às 19h em 13 s, 12 passos por segundo; para no gesto seguinte.
  useEffect(() => {
    if (!animando || !movimento) return;
    let h = 6;
    aoHora.current(h);
    const passo = window.setInterval(() => {
      h = Math.round((h + 1 / 12) * 100) / 100;
      if (h > 19) {
        window.clearInterval(passo);
        setAnimando(false);
        return;
      }
      aoHora.current(h);
    }, 1000 / 12);
    return () => window.clearInterval(passo);
  }, [animando, movimento]);

  useEffect(() => {
    if (!solAberto) return;
    const fechar = (evento: PointerEvent | KeyboardEvent) => {
      if (evento instanceof KeyboardEvent) {
        if (evento.key !== 'Escape') return;
        setSolAberto(false);
        botaoDoSol.current?.focus();
        return;
      }
      if (!painelDoSol.current?.contains(evento.target as Node) && !botaoDoSol.current?.contains(evento.target as Node)) setSolAberto(false);
    };
    window.addEventListener('pointerdown', fechar);
    window.addEventListener('keydown', fechar);
    return () => {
      window.removeEventListener('pointerdown', fechar);
      window.removeEventListener('keydown', fechar);
    };
  }, [solAberto]);

  return (
    <div className={styles.barra3d} role="group" aria-label="Controles da maquete">
      {modo === 'incorporadora' ? (
        <div role="group" aria-label="Camada" className={styles.segmento}>
          {(['comercial', 'obra'] as const).map((c) => (
            <button key={c} type="button" aria-pressed={camada === c} onClick={() => props.aoCamada(c)}>
              {c === 'comercial' ? 'Comercial' : 'Obra'}
            </button>
          ))}
        </div>
      ) : null}

      <div role="group" aria-label="Hora do dia" className={styles.segmento}>
        {PRESETS_DE_HORA.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={preset === p.id}
            onClick={() => {
              setAnimando(false);
              props.aoHora(p.hora);
            }}
          >
            {p.rotulo}
          </button>
        ))}
      </div>

      <div className={styles.solControle}>
        <button
          ref={botaoDoSol}
          type="button"
          className={styles.segmentoSolto}
          aria-expanded={solAberto}
          aria-controls="torrelio-sol"
          onClick={() => setSolAberto((aberto) => !aberto)}
        >
          Sol · {formatarHora(hora)}
        </button>
        {solAberto ? (
          <div ref={painelDoSol} id="torrelio-sol" className={styles.popoverDoSol}>
            <label className={styles.rotuloDoSol} htmlFor="torrelio-hora">
              Hora solar <strong>{formatarHora(hora)}</strong>
            </label>
            <input
              id="torrelio-hora"
              type="range"
              min={5}
              max={23}
              step={0.25}
              value={hora}
              aria-valuetext={formatarHora(hora)}
              onChange={(e) => {
                setAnimando(false);
                props.aoHora(Number(e.target.value));
              }}
            />
            <div role="group" aria-label="Estação" className={styles.segmento}>
              {(Object.keys(NOMES_DAS_ESTACOES) as Estacao[]).map((e) => (
                <button key={e} type="button" aria-pressed={estacao === e} onClick={() => props.aoEstacao(e)}>
                  {NOMES_DAS_ESTACOES[e]}
                </button>
              ))}
            </div>
            {movimento ? (
              <button type="button" className={styles.botao} aria-pressed={animando} onClick={() => setAnimando((a) => !a)}>
                {animando ? 'Parar o dia' : 'Animar o dia (6h às 19h)'}
              </button>
            ) : (
              <div role="group" aria-label="Horas do dia" className={styles.segmento}>
                {[6, 9, 12, 15, 18].map((h) => (
                  <button key={h} type="button" aria-pressed={hora === h} onClick={() => props.aoHora(h)}>
                    {h}h
                  </button>
                ))}
              </div>
            )}
            <p className={styles.notaMiuda}>Simulação aproximada: hora solar e latitude fictícia (20° S).</p>
          </div>
        ) : null}
      </div>

      <div role="group" aria-label="Câmera" className={styles.segmento}>
        {ENQUADRAMENTOS.map((e) => (
          <button key={e.id} type="button" aria-pressed={enquadramento === e.id} onClick={() => props.aoEnquadrar(e.id)}>
            {e.rotulo}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.segmentoSolto}
        aria-pressed={contornar || deDia}
        disabled={deDia}
        title={deDia ? 'De dia a luz das janelas não aparece: o contorno fica ligado.' : undefined}
        onClick={() => props.aoContornar(!contornar)}
      >
        {modo === 'hotel' ? 'Contornar livres' : 'Contornar disponíveis'}
      </button>

      {com3d ? (
        <>
          <button type="button" className={styles.segmentoSolto} aria-pressed={movimento ? girando : undefined} onClick={props.aoGirar}>
            {movimento ? 'Girar' : 'Girar 90°'}
          </button>
          <div role="group" aria-label="Aproximar" className={styles.segmento}>
            <button type="button" onClick={() => props.aoZoom(1)} aria-label="Aproximar">
              +
            </button>
            <button type="button" onClick={() => props.aoZoom(-1)} aria-label="Afastar">
              −
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
