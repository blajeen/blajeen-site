'use client';

import { useCallback, useEffect, useEffectEvent, useRef, useState, type ReactNode, type RefObject } from 'react';
import { reservarGpu } from '@/lib/fila-da-gpu';
import type { PortaId, Vista } from '@/lib/carrelio/tipos';
import type { CenaCarro, EstadoVisualCarro, ManifestoDoModelo } from './3d/contrato';
import styles from './Carrelio.module.css';

/** Depois do primeiro quadro, a fila da GPU fica reservada mais um pouco, como no Torrelio. */
const QUADROS_PESADOS_MS = 700;
/** Quanto tempo o palco precisa ficar à vista para o carro abrir sozinho (quem passa rolando não paga a carga). */
const PERMANENCIA_MS = 400;

export type ControleDoPalco = {
  carregar(): void;
  zoom(passo: 1 | -1): void;
  enquadrar(): void;
  /** O carro em USDZ, para o Quick Look do iPhone; `null` se o 3D não abriu ou a exportação falhou. */
  exportarUsdz(): Promise<Blob | null>;
};

export type SituacaoDoPalco = 'poster' | 'carregando' | 'pronto' | 'falhou';

/** Um ponto de toque da vista atual, já com o texto da versão escolhida. */
export type PontoNoPalco = { id: string; rotulo: string; texto: string };

type Props = {
  estadoVisual: EstadoVisualCarro;
  modelo: ManifestoDoModelo;
  pontos: readonly PontoNoPalco[];
  pontoAberto: string | null;
  areaLivre: { esquerda: number; direita: number; topo: number; base: number };
  controleRef: RefObject<ControleDoPalco | null>;
  aoTocarPeca(peca: PortaId): void;
  aoArrastar(): void;
  aoAbrirPonto(id: string | null): void;
  aoMudarSituacao?(situacao: SituacaoDoPalco): void;
  /** Camadas por cima do carro: a barra de controles, o "ver na sua garagem". */
  children?: ReactNode;
};

/**
 * Os pôsteres, com a densidade da tela (as imagens do site não passam pelo otimizador do Next,
 * então o `srcset` é escrito aqui). São o primeiro quadro da própria cena 3D.
 */
const POSTER = {
  paisagem: '/produtos/carrelio/poster.webp',
  paisagem2x: '/produtos/carrelio/poster@2x.webp',
  retrato: '/produtos/carrelio/poster-retrato.webp',
} as const;

function economizandoDados(): boolean {
  const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conexao?.saveData);
}

const NOME_DA_VISTA: Readonly<Record<Vista, string>> = { fora: 'por fora', dentro: 'por dentro' };

/**
 * O palco do carro: o pôster enquanto o 3D não chega, o 3D quando a pessoa mostra intenção (o
 * mesmo critério do Torrelio: à vista por um instante, depois de mexer na página), e os pontos de
 * toque por cima, posicionados a cada quadro pela cena, por estilo direto, sem render do React.
 */
export function PalcoCarro({
  estadoVisual, modelo, pontos, pontoAberto, areaLivre, controleRef, aoTocarPeca, aoArrastar, aoAbrirPonto, aoMudarSituacao, children,
}: Props) {
  const palco = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const marcadores = useRef(new Map<string, HTMLDivElement>());
  const [cena, setCena] = useState<CenaCarro | null>(null);
  const [situacao, setSituacao] = useState<SituacaoDoPalco>('poster');
  const [contextoPerdido, setContextoPerdido] = useState(false);
  const pedido = useRef(false);

  // O carregamento é chamado de efeitos e de cliques: lê as props mais novas por ref.
  const atuais = useRef({ estadoVisual, modelo, aoMudarSituacao });
  useEffect(() => {
    atuais.current = { estadoVisual, modelo, aoMudarSituacao };
  });

  const carregar = useCallback(() => {
    if (pedido.current || !host.current) return;
    pedido.current = true;
    const mudarSituacao = (proxima: SituacaoDoPalco) => {
      setSituacao(proxima);
      atuais.current.aoMudarSituacao?.(proxima);
    };
    mudarSituacao('carregando');
    const alvo = host.current;
    const liberarGpu = reservarGpu();
    import('./3d/carregar')
      // O estado atual vai junto: o primeiro quadro já sai com a cor, a versão e a vista da página.
      .then(({ carregarCarro }) => carregarCarro(alvo, { modelo: atuais.current.modelo, estado: atuais.current.estadoVisual }))
      .then((pronta) => {
        if (!host.current) {
          pronta.descartar();
          liberarGpu();
          return;
        }
        setCena(pronta);
        mudarSituacao('pronto');
        window.setTimeout(liberarGpu, QUADROS_PESADOS_MS);
      })
      .catch(() => {
        liberarGpu();
        mudarSituacao('falhou');
      });
  }, []);

  // O carro abre sozinho quando o palco fica à vista, mas só depois de a pessoa mexer na página:
  // quem só abre a página (uma ferramenta de medição, por exemplo) não carrega o 3D, e o pôster
  // continua sendo o LCP. No computador, o ponteiro entrando no palco também conta.
  useEffect(() => {
    const no = palco.current;
    if (!no || economizandoDados() || typeof IntersectionObserver === 'undefined') return;
    let visivel = false;
    let mexeu = false;
    let espera = 0;
    const tentar = () => {
      window.clearTimeout(espera);
      if (visivel && mexeu) espera = window.setTimeout(carregar, PERMANENCIA_MS);
    };
    const observador = new IntersectionObserver(
      ([entrada]) => {
        visivel = Boolean(entrada && entrada.intersectionRatio >= 0.4);
        tentar();
      },
      { threshold: [0, 0.25, 0.4, 0.6] },
    );
    observador.observe(no);
    const EVENTOS = ['scroll', 'wheel', 'pointerdown', 'keydown', 'touchstart'] as const;
    const interagiu = () => {
      if (mexeu) return;
      mexeu = true;
      tentar();
    };
    for (const evento of EVENTOS) window.addEventListener(evento, interagiu, { passive: true });
    const intencao = () => {
      if (no.getBoundingClientRect().bottom > 0) carregar();
    };
    no.addEventListener('pointerenter', intencao);
    no.addEventListener('focusin', intencao);
    return () => {
      window.clearTimeout(espera);
      observador.disconnect();
      for (const evento of EVENTOS) window.removeEventListener(evento, interagiu);
      no.removeEventListener('pointerenter', intencao);
      no.removeEventListener('focusin', intencao);
    };
  }, [carregar]);

  useEffect(() => {
    controleRef.current = {
      carregar,
      zoom: (passo) => cena?.zoom(passo),
      enquadrar: () => cena?.enquadrar(),
      exportarUsdz: () => (cena ? cena.exportarUsdz() : Promise.resolve(null)),
    };
  }, [cena, controleRef, carregar]);

  // Descarte ao sair da página.
  useEffect(() => () => cena?.descartar(), [cena]);

  const tocarPeca = useEffectEvent((peca: PortaId) => aoTocarPeca(peca));
  const arrastar = useEffectEvent(() => aoArrastar());
  useEffect(() => {
    if (!cena) return;
    const cancelar = [
      cena.aoTocarPeca((peca) => tocarPeca(peca)),
      cena.aoArrastar(() => arrastar()),
      // Os marcadores andam por estilo direto, sem render do React a cada quadro.
      cena.aoProjetar((projecoes) => {
        for (const projecao of projecoes) {
          const no = marcadores.current.get(projecao.id);
          if (!no) continue;
          no.hidden = !projecao.visivel;
          if (projecao.visivel) no.style.transform = `translate3d(${projecao.x.toFixed(1)}px, ${projecao.y.toFixed(1)}px, 0)`;
        }
      }),
      // Se a GPU derrubar o contexto, o pôster volta até a cena se refazer.
      cena.aoMudarContexto((estado) => setContextoPerdido(estado === 'perdido')),
    ];
    return () => cancelar.forEach((f) => f());
  }, [cena]);

  useEffect(() => {
    cena?.aplicar(estadoVisual);
  }, [cena, estadoVisual]);

  useEffect(() => {
    cena?.definirAreaLivre(areaLivre);
  }, [cena, areaLivre]);

  const com3d = situacao === 'pronto' && !contextoPerdido;

  return (
    <div
      ref={palco}
      className={styles.palco}
      data-situacao={situacao}
      data-vista={estadoVisual.vista}
      data-ambiente={estadoVisual.ambiente}
      data-ancora="palco"
    >
      <picture className={styles.poster} data-oculto={com3d ? 'sim' : 'nao'}>
        <source media="(max-width: 767px)" srcSet={POSTER.retrato} width={1080} height={1350} />
        <img
          src={POSTER.paisagem}
          srcSet={`${POSTER.paisagem} 1600w, ${POSTER.paisagem2x} 2560w`}
          sizes="(min-width: 1024px) 64vw, 94vw"
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
          alt="O Jaecoo 5 em 3D, num estúdio escuro, visto de três quartos de frente."
        />
      </picture>
      <div ref={host} className={styles.host} aria-hidden="true" />

      <p className={styles.marcaDagua} aria-hidden="true">
        {modelo.provisorio ? 'CARRO PROVISÓRIO · DEMONSTRAÇÃO' : 'DEMONSTRAÇÃO'}
      </p>

      {com3d ? (
        <div className={styles.pontos} role="group" aria-label={`Destaques ${NOME_DA_VISTA[estadoVisual.vista]}`}>
          {pontos.map((ponto) => {
            const aberto = pontoAberto === ponto.id;
            return (
              <div
                key={ponto.id}
                ref={(no) => {
                  if (no) marcadores.current.set(ponto.id, no);
                  else marcadores.current.delete(ponto.id);
                }}
                className={styles.ponto}
                data-aberto={aberto ? 'sim' : 'nao'}
                hidden
              >
                <button
                  type="button"
                  className={styles.pontoBotao}
                  aria-expanded={aberto}
                  aria-label={`${ponto.rotulo}: ${ponto.texto}`}
                  onClick={() => aoAbrirPonto(aberto ? null : ponto.id)}
                >
                  <span aria-hidden="true" />
                </button>
                {aberto ? (
                  <p className={styles.pontoBalao} aria-hidden="true">
                    <strong>{ponto.rotulo}</strong>
                    <span>{ponto.texto}</span>
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {situacao === 'poster' ? (
        <button type="button" className={styles.abrir3d} onClick={carregar}>
          Abrir o carro em 3D <span aria-hidden="true">↗</span>
        </button>
      ) : null}
      {situacao === 'carregando' ? (
        <p className={styles.avisoDoPalco} role="status">
          Preparando o carro…
        </p>
      ) : null}
      {situacao === 'pronto' && contextoPerdido ? (
        <p className={styles.avisoDoPalco} role="status">
          Recarregando o carro…
        </p>
      ) : null}
      {situacao === 'falhou' ? (
        <p className={styles.avisoDoPalco} role="status">
          Seu navegador não abriu o 3D. Cores, versões, preço e ficha continuam ao lado.
        </p>
      ) : null}
      {modelo.credito ? <p className={styles.credito}>{modelo.credito}</p> : null}
      {children}
    </div>
  );
}
