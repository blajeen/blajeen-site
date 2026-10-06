'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { reservarGpu } from '@/lib/fila-da-gpu';
import type { Modo } from '@/lib/torrelio/tipos';
import type { CenaHolograma, EstadoDoHolograma, LayoutDoHolograma } from '../3d/holograma';
import styles from '../Torrelio.module.css';

type Props = {
  layout: LayoutDoHolograma;
  modo: Modo;
  luzes: Uint8Array;
  disponiveis: Uint8Array;
  movimento: boolean;
  aoLayout(layout: LayoutDoHolograma): void;
  aoFechar(): void;
};

/** Como a demonstração, o holograma abre de dia (pedido do titular); a noite fica a um toque. */
const HORAS = { dia: 10, noite: 20.5 } as const;
type Hora = keyof typeof HORAS;

const FORMATOS: readonly { id: LayoutDoHolograma; rotulo: string; dica: string }[] = [
  { id: 'piramide', rotulo: 'Pirâmide', dica: 'Tela deitada, pirâmide de ponta para baixo no centro.' },
  { id: 'vitrine', rotulo: 'Vitrine', dica: 'Vidro a 45° diante da tela. Para ventilador de LED, grave o vídeo.' },
];

/** Depois de quanto tempo sem mexer os controles somem (no stand, fica só o holograma). */
const OCIOSO_MS = 3500;

const FOCAVEIS = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Situacao = 'carregando' | 'pronto' | 'falhou' | 'perdido';

/**
 * O modo holograma: a tela inteira preta com o prédio girando, para pirâmide, vitrine holográfica
 * ou ventilador de LED. Segue o estado da demonstração (as luzes mudam se o painel mudar, inclusive
 * em outra janela do mesmo navegador) e grava o vídeo de uma volta, sem mandar nada a lugar nenhum.
 *
 * Girar é a função do holograma, e o botão Girar é dele: vale mesmo com movimento reduzido. Com o
 * movimento reduzido (no sistema ou no rodapé do site), o holograma abre parado, e a dica e os
 * controles ficam à vista até alguém escolher.
 */
export function ModoHolograma({ layout, modo, luzes, disponiveis, movimento, aoLayout, aoFechar }: Props) {
  const raiz = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [cena, setCena] = useState<CenaHolograma | null>(null);
  const [situacao, setSituacao] = useState<Situacao>('carregando');
  const [espelhar, setEspelhar] = useState(true);
  const [girar180, setGirar180] = useState(false);
  const [hora, setHora] = useState<Hora>('dia');
  // null: segue a preferência de movimento; true ou false: o que a pessoa escolheu no botão Girar.
  const [escolha, setEscolha] = useState<boolean | null>(null);
  const [gravando, setGravando] = useState<number | null>(null);
  const [video, setVideo] = useState<{ url: string; extensao: 'mp4' | 'webm' } | null>(null);
  const [ocioso, setOcioso] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const [anuncio, setAnuncio] = useState('');
  const urlDoVideo = useRef<string | null>(null);
  // O destino do portal é decidido ao abrir: dentro da tela cheia da demonstração, se ela estiver ligada.
  const [destino] = useState<Element | null>(() => (typeof document === 'undefined' ? null : (document.fullscreenElement ?? document.body)));
  const fechar = useRef(aoFechar);
  useEffect(() => {
    fechar.current = aoFechar;
  });

  const girando = escolha ?? movimento;
  const paradoPelaPreferencia = escolha === null && !movimento;

  const estado = useMemo<EstadoDoHolograma>(
    () => ({ modo, luzes, disponiveis, hora: HORAS[hora], estacao: 'verao', movimento, layout, espelhar, girar180, girando }),
    [modo, luzes, disponiveis, hora, movimento, layout, espelhar, girar180, girando],
  );

  // A carga lê o estado mais novo por ref: o efeito roda uma vez só.
  const atual = useRef(estado);
  useEffect(() => {
    atual.current = estado;
  });

  useEffect(() => {
    const alvo = host.current;
    if (!alvo) return;
    let viva = true;
    let pronta: CenaHolograma | null = null;
    const liberarGpu = reservarGpu();
    import('../3d/carregar-holograma')
      .then(({ carregarHolograma }) => carregarHolograma(alvo, atual.current))
      .then((nova) => {
        if (!viva) {
          nova.descartar();
          liberarGpu();
          return;
        }
        pronta = nova;
        setCena(nova);
        setSituacao('pronto');
        window.setTimeout(liberarGpu, 700);
      })
      .catch(() => {
        liberarGpu();
        if (viva) setSituacao('falhou');
      });
    return () => {
      viva = false;
      pronta?.descartar();
    };
  }, []);

  useEffect(() => {
    cena?.aplicar(estado);
  }, [cena, estado]);

  useEffect(() => cena?.aoMudarContexto((s) => setSituacao(s === 'perdido' ? 'perdido' : 'pronto')), [cena]);

  // Rolagem do fundo presa, foco no primeiro controle, Esc fecha, Tab não sai do holograma.
  useEffect(() => {
    const no = raiz.current;
    if (!no) return;
    const antes = document.body.dataset['scrollLocked'];
    document.body.dataset['scrollLocked'] = 'true';
    // O foco vai para o próprio holograma, e não para um botão: com um botão focado, os controles
    // não sumiriam nunca no PC do stand. O Tab leva aos controles.
    no.focus({ preventScroll: true });
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && !document.fullscreenElement) {
        evento.preventDefault();
        fechar.current();
        return;
      }
      if (evento.key !== 'Tab') return;
      const focaveis = [...no.querySelectorAll<HTMLElement>(FOCAVEIS)].filter((el) => el.getClientRects().length > 0);
      const primeiro = focaveis[0];
      const ultimo = focaveis.at(-1);
      if (!primeiro || !ultimo) return;
      if (evento.shiftKey && (document.activeElement === primeiro || document.activeElement === no)) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => {
      window.removeEventListener('keydown', aoTeclar);
      if (antes === undefined) delete document.body.dataset['scrollLocked'];
      else document.body.dataset['scrollLocked'] = antes;
    };
  }, []);

  // Sem mexer por alguns segundos, os controles somem; qualquer gesto os traz de volta.
  useEffect(() => {
    const no = raiz.current;
    if (!no) return;
    let espera = window.setTimeout(() => setOcioso(true), OCIOSO_MS);
    const acordar = () => {
      setOcioso(false);
      window.clearTimeout(espera);
      espera = window.setTimeout(() => setOcioso(true), OCIOSO_MS);
    };
    for (const evento of ['pointermove', 'pointerdown', 'keydown'] as const) no.addEventListener(evento, acordar);
    return () => {
      window.clearTimeout(espera);
      for (const evento of ['pointermove', 'pointerdown', 'keydown'] as const) no.removeEventListener(evento, acordar);
    };
  }, []);

  useEffect(() => {
    const aoMudar = () => setTelaCheia(document.fullscreenElement === raiz.current);
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);

  // O vídeo gravado vive até o holograma fechar (ou até a próxima gravação).
  useEffect(
    () => () => {
      if (urlDoVideo.current) URL.revokeObjectURL(urlDoVideo.current);
      if (document.fullscreenElement && document.fullscreenElement === raiz.current) void document.exitFullscreen();
    },
    [],
  );

  const alternarTelaCheia = () => {
    if (document.fullscreenElement === raiz.current) {
      void document.exitFullscreen();
      return;
    }
    raiz.current?.requestFullscreen?.().catch(() => {});
  };

  const gravar = async () => {
    if (!cena) return;
    if (gravando !== null) {
      cena.pararGravacao();
      return;
    }
    if (urlDoVideo.current) URL.revokeObjectURL(urlDoVideo.current);
    urlDoVideo.current = null;
    setVideo(null);
    setGravando(0);
    setAnuncio('Gravando uma volta do prédio.');
    let ultimo = -1;
    const resultado = await cena.gravar((fracao) => {
      const pct = Math.floor(fracao * 100);
      if (pct === ultimo) return;
      ultimo = pct;
      setGravando(fracao);
    });
    setGravando(null);
    if (!resultado) {
      setAnuncio('A gravação parou, ou este navegador não grava vídeo.');
      return;
    }
    const url = URL.createObjectURL(resultado.arquivo);
    urlDoVideo.current = url;
    setVideo({ url, extensao: resultado.extensao });
    setAnuncio(`Vídeo pronto, em ${resultado.extensao.toUpperCase()}.`);
  };

  const formato = FORMATOS.find((f) => f.id === layout)!;
  if (!destino) return null;

  return createPortal(
    <div
      ref={raiz}
      className={styles.holograma}
      data-ocioso={ocioso && !paradoPelaPreferencia ? 'sim' : 'nao'}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="torrelio-holograma-titulo"
    >
      <h2 id="torrelio-holograma-titulo" className="sr-only">
        Modo holograma
      </h2>
      <div ref={host} className={styles.palcoDoHolograma} aria-hidden="true" />
      {situacao === 'carregando' ? (
        <p className={styles.avisoDoHolograma} role="status">
          Montando o holograma…
        </p>
      ) : null}
      {situacao === 'perdido' ? (
        <p className={styles.avisoDoHolograma} role="status">
          Recarregando o holograma…
        </p>
      ) : null}
      {situacao === 'falhou' ? (
        <p className={styles.avisoDoHolograma} role="status">
          Seu navegador não abriu o 3D, e o holograma precisa dele.
        </p>
      ) : null}

      <p className={styles.dicaDoHolograma} data-aviso={paradoPelaPreferencia ? 'sim' : undefined}>
        {paradoPelaPreferencia ? 'Movimento reduzido neste aparelho: toque em Girar.' : formato.dica}
      </p>

      <div className={styles.controlesDoHolograma} role="group" aria-label="Controles do holograma">
        <div role="group" aria-label="Formato" className={styles.segmento}>
          {FORMATOS.map((f) => (
            <button key={f.id} type="button" aria-pressed={layout === f.id} onClick={() => aoLayout(f.id)}>
              {f.rotulo}
            </button>
          ))}
        </div>
        <button type="button" className={styles.segmentoSolto} aria-pressed={espelhar} onClick={() => setEspelhar((e) => !e)}>
          Espelhar
        </button>
        {layout === 'vitrine' ? (
          <button type="button" className={styles.segmentoSolto} aria-pressed={girar180} onClick={() => setGirar180((g) => !g)}>
            Girar 180°
          </button>
        ) : null}
        <div role="group" aria-label="Hora" className={styles.segmento}>
          {(['dia', 'noite'] as const).map((h) => (
            <button key={h} type="button" aria-pressed={hora === h} onClick={() => setHora(h)}>
              {h === 'dia' ? 'Dia' : 'Noite'}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.segmentoSolto}
          aria-pressed={girando}
          data-aviso={paradoPelaPreferencia ? 'sim' : undefined}
          onClick={() => setEscolha(!girando)}
        >
          Girar
        </button>
        <button type="button" className={styles.segmentoSolto} onClick={() => void gravar()} disabled={!cena} aria-pressed={gravando !== null}>
          {gravando !== null ? `Parar gravação · ${Math.round(gravando * 100)}%` : 'Gravar vídeo (1 volta)'}
        </button>
        {video ? (
          <a className={styles.segmentoSolto} href={video.url} download={`torrelio-holograma.${video.extensao}`}>
            Baixar vídeo ({video.extensao.toUpperCase()})
          </a>
        ) : null}
        <button type="button" className={styles.segmentoSolto} aria-pressed={telaCheia} onClick={alternarTelaCheia}>
          {telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
        </button>
        <button type="button" className={styles.segmentoSolto} onClick={() => fechar.current()}>
          Fechar
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>
    </div>,
    destino,
  );
}
