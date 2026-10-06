'use client';

import { useCallback, useEffect, useEffectEvent, useRef, useState, type ReactNode, type RefObject } from 'react';
import { reservarGpu } from '@/lib/fila-da-gpu';
import type { Enquadramento, Fachada } from '@/lib/torrelio/tipos';
import type { CenaTorre, EstadoVisualTorre, ModoDaCamera } from './3d/contrato';
import styles from './Torrelio.module.css';

/** Depois do primeiro quadro, a fila da GPU fica reservada mais um pouco, como no LabHero. */
const QUADROS_PESADOS_MS = 700;

export type ControleDoPalco = {
  carregar(): void;
  zoom(passo: 1 | -1): void;
  olhar(direcao: 'esquerda' | 'direita' | 'cima' | 'baixo'): void;
  girarUmPasso(): void;
};

export type SituacaoDoPalco = 'poster' | 'carregando' | 'pronto' | 'falhou';

type Props = {
  estadoVisual: EstadoVisualTorre;
  enquadramento: Enquadramento;
  girando: boolean;
  vista: { indice: number; fachada: Fachada } | null;
  areaLivre: { esquerda: number; direita: number; topo: number; base: number };
  /** Texto do pino da unidade escolhida: "1803" e "18º · +53,58 m". */
  marcador: { titulo: string; detalhe: string } | null;
  controleRef: RefObject<ControleDoPalco | null>;
  aoEscolher(indice: number | null): void;
  aoMudarCamera(modo: ModoDaCamera): void;
  aoMudarSituacao?(situacao: SituacaoDoPalco): void;
  /** Camadas por cima da maquete: a barra de controles, a faixa da vista. */
  children?: ReactNode;
};

/**
 * Os pôsteres, com a densidade da tela: o de 2× só baixa em tela Retina, e o do celular cobre até
 * 3× (pedido do titular: nada borrado). As imagens do site não passam pelo otimizador do Next
 * (`images.unoptimized`), então o `srcset` é escrito aqui.
 */
const POSTER = {
  paisagem: '/produtos/torrelio/poster-noite.webp',
  paisagem2x: '/produtos/torrelio/poster-noite@2x.webp',
  retrato: '/produtos/torrelio/poster-noite-retrato.webp',
} as const;

/** Celular, economia de dados ou ponteiro grosso: o 3D só abre pelo botão (ou ao escolher uma unidade). */
function soPeloBotao(): boolean {
  const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conexao?.saveData) || !window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
}

export function PalcoTorre({
  estadoVisual, enquadramento, girando, vista, areaLivre, marcador, controleRef, aoEscolher, aoMudarCamera, aoMudarSituacao, children,
}: Props) {
  const palco = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const pino = useRef<HTMLDivElement>(null);
  const bussola = useRef<HTMLSpanElement>(null);
  const [cena, setCena] = useState<CenaTorre | null>(null);
  const [situacao, setSituacao] = useState<SituacaoDoPalco>('poster');
  const [contextoPerdido, setContextoPerdido] = useState(false);
  const pedido = useRef(false);

  // O carregamento é chamado de efeitos e de cliques: lê as props mais novas por ref.
  const atuais = useRef({ estadoVisual, aoMudarSituacao });
  useEffect(() => {
    atuais.current = { estadoVisual, aoMudarSituacao };
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
      // O estado atual vai junto: o primeiro quadro já sai com a hora, as luzes e a escolha da página.
      .then(({ carregarTorre }) => carregarTorre(alvo, { movimento: atuais.current.estadoVisual.movimento, estado: atuais.current.estadoVisual }))
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

  // A intenção, no computador: o ponteiro entra no palco, um clique, ou o foco chega à demonstração.
  useEffect(() => {
    const no = palco.current;
    if (!no || soPeloBotao()) return;
    let visivel = false;
    const observador = new IntersectionObserver(([entrada]) => {
      visivel = Boolean(entrada && entrada.intersectionRatio >= 0.25);
    }, { threshold: [0, 0.25, 0.5] });
    observador.observe(no);
    const intencao = () => {
      if (visivel) carregar();
    };
    no.addEventListener('pointerenter', intencao);
    no.addEventListener('pointerdown', intencao);
    no.addEventListener('focusin', intencao);
    return () => {
      observador.disconnect();
      no.removeEventListener('pointerenter', intencao);
      no.removeEventListener('pointerdown', intencao);
      no.removeEventListener('focusin', intencao);
    };
  }, [carregar]);

  useEffect(() => {
    controleRef.current = {
      carregar,
      zoom: (passo) => cena?.zoom(passo),
      olhar: (direcao) => cena?.olhar(direcao),
      girarUmPasso: () => cena?.girar('passo'),
    };
  }, [cena, controleRef, carregar]);

  // Descarte ao sair da página.
  useEffect(() => () => cena?.descartar(), [cena]);

  const escolher = useEffectEvent((indice: number | null) => aoEscolher(indice));
  const mudarCamera = useEffectEvent((modo: ModoDaCamera) => aoMudarCamera(modo));
  useEffect(() => {
    if (!cena) return;
    const cancelar = [
      cena.aoEscolher((indice) => escolher(indice)),
      cena.aoMudarCamera((modo) => mudarCamera(modo)),
      // O pino e a bússola andam por estilo direto, sem render do React a cada quadro.
      cena.aoProjetar((ponto) => {
        const no = pino.current;
        if (!no) return;
        no.hidden = !ponto?.visivel;
        if (ponto?.visivel) no.style.transform = `translate3d(${ponto.x.toFixed(1)}px, ${ponto.y.toFixed(1)}px, 0)`;
      }),
      cena.aoMudarRumo((rumo) => {
        if (bussola.current) bussola.current.style.transform = `rotate(${(-rumo).toFixed(1)}deg)`;
      }),
      // Se a GPU derrubar o contexto, o pôster volta até a cena se refazer.
      cena.aoMudarContexto?.((estado) => setContextoPerdido(estado === 'perdido')) ?? (() => {}),
    ];
    return () => cancelar.forEach((f) => f());
  }, [cena]);

  useEffect(() => {
    cena?.aplicar(estadoVisual);
  }, [cena, estadoVisual]);

  // Escolha vinda do espelho ou do cartão: se a unidade estiver de costas, a câmera contorna.
  useEffect(() => {
    if (cena && estadoVisual.selecionada !== null) cena.mostrarUnidade(estadoVisual.selecionada);
  }, [cena, estadoVisual.selecionada, estadoVisual.modo]);

  const primeiroEnquadramento = useRef(true);
  useEffect(() => {
    if (!cena) return;
    // O primeiro enquadramento é o da entrada da própria cena.
    if (primeiroEnquadramento.current) {
      primeiroEnquadramento.current = false;
      if (enquadramento === 'frente') return;
    }
    cena.enquadrar(enquadramento);
  }, [cena, enquadramento]);

  const vistaAnterior = useRef<{ indice: number; fachada: Fachada } | null>(null);
  useEffect(() => {
    if (!cena) return;
    const antes = vistaAnterior.current;
    vistaAnterior.current = vista;
    if (!vista) {
      if (antes) cena.voltarAoPredio();
      return;
    }
    if (antes && antes.fachada === vista.fachada && antes.indice !== vista.indice) cena.mudarAndarDaVista(vista.indice);
    else if (!antes || antes.fachada !== vista.fachada || antes.indice !== vista.indice) cena.verVista(vista);
  }, [cena, vista]);

  useEffect(() => {
    cena?.girar(girando ? 'continuo' : 'parar');
  }, [cena, girando]);

  useEffect(() => {
    cena?.definirAreaLivre(areaLivre);
  }, [cena, areaLivre]);

  return (
    <div ref={palco} className={styles.palco} data-situacao={situacao} data-vista={vista ? 'sim' : 'nao'}>
      <picture className={styles.poster} data-oculto={situacao === 'pronto' && !contextoPerdido ? 'sim' : 'nao'}>
        <source media="(max-width: 767px)" srcSet={POSTER.retrato} width={1080} height={1350} />
        <img
          src={POSTER.paisagem}
          srcSet={`${POSTER.paisagem} 1600w, ${POSTER.paisagem2x} 2560w`}
          sizes="(min-width: 1440px) 1312px, 94vw"
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
          alt="Maquete do Residencial Vértice, prédio fictício, à noite: as janelas acesas são unidades vendidas."
        />
      </picture>
      <div ref={host} className={styles.host} aria-hidden="true" />

      <p className={styles.marcaDagua} aria-hidden="true">
        DADOS FICTÍCIOS
      </p>
      <span className={styles.bussola} aria-hidden="true" data-visivel={situacao === 'pronto' ? 'sim' : 'nao'}>
        <span ref={bussola} className={styles.agulha}>
          <span>N</span>
        </span>
      </span>
      {marcador ? (
        <div ref={pino} className={styles.pino} aria-hidden="true" hidden>
          <span className={styles.pinoCaixa}>
            <strong>{marcador.titulo}</strong>
            <span>{marcador.detalhe}</span>
          </span>
        </div>
      ) : null}

      {situacao === 'poster' ? (
        <button type="button" className={styles.abrir3d} onClick={carregar}>
          Abrir a maquete 3D <span aria-hidden="true">↗</span>
        </button>
      ) : null}
      {situacao === 'carregando' ? (
        <p className={styles.avisoDoPalco} role="status">
          Montando a torre…
        </p>
      ) : null}
      {situacao === 'pronto' && contextoPerdido ? (
        <p className={styles.avisoDoPalco} role="status">
          Recarregando a torre…
        </p>
      ) : null}
      {situacao === 'falhou' ? (
        <p className={styles.avisoDoPalco} role="status">
          Seu navegador não abriu o 3D. O espelho e o cartão fazem tudo o que a torre faz.
        </p>
      ) : null}
      {children}
    </div>
  );
}
