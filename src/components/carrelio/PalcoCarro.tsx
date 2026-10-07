'use client';

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { reservarGpu } from '@/lib/fila-da-gpu';
import type { PortaId, Vista } from '@/lib/carrelio/tipos';
import type { AreaLivre, CenaCarro, EstadoVisualCarro, ManifestoDoModelo } from './3d/contrato';
import { IconeGirar } from './Icones';
import styles from './Carrelio.module.css';

/** Depois do primeiro quadro, a fila da GPU fica reservada mais um pouco, como no Torrelio. */
const QUADROS_PESADOS_MS = 700;
/** Quanto tempo o palco precisa ficar à vista para o carro abrir sozinho (quem passa rolando não paga a carga). */
const PERMANENCIA_MS = 400;
/** O pôster se dissolve no 3D (a transição do CSS); só depois a mesa começa a girar e os pontos aparecem. */
const REVELACAO_MS = 650;
/** A dica de uso some sozinha depois deste tempo, ou no primeiro arrasto ou toque num ponto. */
const DICA_MS = 7000;

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
  areaLivre: AreaLivre;
  controleRef: RefObject<ControleDoPalco | null>;
  aoTocarPeca(peca: PortaId): void;
  aoArrastar(): void;
  aoAbrirPonto(id: string | null): void;
  aoMudarSituacao?(situacao: SituacaoDoPalco): void;
  /** Camadas por cima do carro: a barra de controles, o canto de cima, o "na sua garagem". */
  children?: ReactNode;
};

/**
 * Os pôsteres são o primeiro quadro da própria cena 3D (`tools/carrelio-poster.mjs`), no formato do
 * palco e com a barra de controles no pé: quadrado no celular, 4:3 do tablet para cima. O 3D entra
 * por baixo e o pôster se dissolve nele sem o carro pular. As imagens do site não passam pelo
 * otimizador do Next, então o `srcset` é escrito aqui.
 */
const POSTER = {
  largo: '/produtos/carrelio/palco.webp',
  largo2x: '/produtos/carrelio/palco@2x.webp',
  quadrado: '/produtos/carrelio/palco-quadrado.webp',
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
 *
 * O pé do palco conta a história da carga num lugar só: "Abrir o carro em 3D", depois "Preparando",
 * e então a barra de controles, que só aparece com o carro pronto para eles.
 */
export function PalcoCarro({
  estadoVisual, modelo, pontos, pontoAberto, areaLivre, controleRef, aoTocarPeca, aoArrastar, aoAbrirPonto, aoMudarSituacao, children,
}: Props) {
  const palco = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const botaoDeAbrir = useRef<HTMLButtonElement>(null);
  const marcadores = useRef(new Map<string, HTMLDivElement>());
  const tamanho = useRef({ largura: 0, altura: 0 });
  const [cena, setCena] = useState<CenaCarro | null>(null);
  const [situacao, setSituacao] = useState<SituacaoDoPalco>('poster');
  const [contextoPerdido, setContextoPerdido] = useState(false);
  // O pôster já se dissolveu no 3D: a mesa pode girar, e os pontos e a dica aparecem.
  const [revelado, setRevelado] = useState(false);
  const [dica, setDica] = useState<'espera' | 'visivel' | 'fim'>('espera');
  const pedido = useRef(false);

  // O carregamento é chamado de efeitos e de cliques: lê as props mais novas por ref.
  const atuais = useRef({ estadoVisual, modelo, areaLivre, aoMudarSituacao });
  useEffect(() => {
    atuais.current = { estadoVisual, modelo, areaLivre, aoMudarSituacao };
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
      // O estado atual vai junto: o primeiro quadro já sai com a cor, a versão, a vista e o enquadramento
      // da página (acima da barra), parado, igual ao pôster que ele substitui.
      .then(({ carregarCarro }) =>
        carregarCarro(alvo, { modelo: atuais.current.modelo, estado: { ...atuais.current.estadoVisual, girando: false }, areaLivre: atuais.current.areaLivre }),
      )
      .then((pronta) => {
        if (!host.current) {
          pronta.descartar();
          liberarGpu();
          return;
        }
        // Quem esperava com o foco no "Abrir" (ele some agora) continua na barra, que aparece.
        const tinhaFoco = botaoDeAbrir.current !== null && botaoDeAbrir.current === document.activeElement;
        flushSync(() => {
          setCena(pronta);
          mudarSituacao('pronto');
        });
        if (tinhaFoco) palco.current?.querySelector<HTMLElement>('[data-barra] button:not(:disabled)')?.focus();
        window.setTimeout(liberarGpu, QUADROS_PESADOS_MS);
        window.setTimeout(() => {
          setRevelado(true);
          setDica((atual) => (atual === 'espera' ? 'visivel' : atual));
          window.setTimeout(() => setDica('fim'), DICA_MS);
        }, atuais.current.estadoVisual.movimento ? REVELACAO_MS : 0);
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

  // O tamanho do palco, para o balão de cada ponto abrir para dentro (lido fora do laço dos quadros).
  useEffect(() => {
    const no = host.current;
    if (!no || typeof ResizeObserver === 'undefined') return;
    const medir = () => {
      tamanho.current = { largura: no.clientWidth, altura: no.clientHeight };
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(no);
    return () => observador.disconnect();
  }, []);

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
  const arrastar = useEffectEvent(() => {
    setDica('fim');
    aoArrastar();
  });
  useEffect(() => {
    if (!cena) return;
    const cancelar = [
      cena.aoTocarPeca((peca) => tocarPeca(peca)),
      cena.aoArrastar(() => arrastar()),
      // Os marcadores andam por estilo direto, sem render do React a cada quadro. Perto da borda, o
      // balão abre para dentro do palco (de lado e, no alto, para baixo).
      cena.aoProjetar((projecoes) => {
        const { largura } = tamanho.current;
        for (const projecao of projecoes) {
          const no = marcadores.current.get(projecao.id);
          if (!no) continue;
          no.hidden = !projecao.visivel;
          if (!projecao.visivel) continue;
          no.style.transform = `translate3d(${projecao.x.toFixed(1)}px, ${projecao.y.toFixed(1)}px, 0)`;
          const lado = largura && projecao.x < largura * 0.3 ? 'inicio' : largura && projecao.x > largura * 0.7 ? 'fim' : 'meio';
          const vertical = projecao.y < 120 ? 'abaixo' : 'acima';
          if (no.dataset['lado'] !== lado) no.dataset['lado'] = lado;
          if (no.dataset['vertical'] !== vertical) no.dataset['vertical'] = vertical;
        }
      }),
      // Se a GPU derrubar o contexto, o pôster volta até a cena se refazer.
      cena.aoMudarContexto((estado) => setContextoPerdido(estado === 'perdido')),
    ];
    return () => cancelar.forEach((f) => f());
  }, [cena]);

  // A mesa só gira depois que o pôster se dissolveu: o primeiro quadro é o próprio pôster, parado.
  const estadoNaCena = useMemo<EstadoVisualCarro>(
    () => (revelado || !estadoVisual.girando ? estadoVisual : { ...estadoVisual, girando: false }),
    [estadoVisual, revelado],
  );

  useEffect(() => {
    cena?.aplicar(estadoNaCena);
  }, [cena, estadoNaCena]);

  useEffect(() => {
    cena?.definirAreaLivre(areaLivre);
  }, [cena, areaLivre]);

  const com3d = situacao === 'pronto' && !contextoPerdido;

  return (
    <div
      ref={palco}
      className={styles.palco}
      data-situacao={situacao}
      data-com3d={com3d ? 'sim' : 'nao'}
      data-vista={estadoVisual.vista}
      data-ambiente={estadoVisual.ambiente}
      data-movimento={estadoVisual.movimento ? 'sim' : 'nao'}
      data-ancora="palco"
    >
      <div ref={host} className={styles.host} aria-hidden="true" />
      <picture className={styles.poster} data-oculto={com3d ? 'sim' : 'nao'}>
        <source media="(max-width: 767px)" srcSet={POSTER.quadrado} width={1080} height={1080} />
        <img
          src={POSTER.largo}
          srcSet={`${POSTER.largo} 1600w, ${POSTER.largo2x} 2400w`}
          sizes="(min-width: 1024px) 64vw, 94vw"
          width={1600}
          height={1200}
          fetchPriority="high"
          decoding="async"
          alt="O Jaecoo 5 em 3D, num estúdio escuro, visto de três quartos de frente."
        />
      </picture>

      {/* A legenda do palco: o selo da demonstração e o crédito que a licença do modelo pede. */}
      <div className={styles.legendaDoPalco}>
        <p className={styles.marcaDagua}>{modelo.provisorio ? 'CARRO PROVISÓRIO · DEMONSTRAÇÃO' : 'DEMONSTRAÇÃO'}</p>
        {modelo.credito ? <p className={styles.credito}>{modelo.credito}</p> : null}
      </div>

      {/* Montados junto com o 3D (a primeira projeção já os posiciona, mesmo com a câmera parada) e revelados depois do pôster. */}
      {com3d ? (
        <div className={styles.pontos} role="group" aria-label={`Destaques ${NOME_DA_VISTA[estadoVisual.vista]}`} data-revelado={revelado ? 'sim' : 'nao'}>
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
                  onClick={() => {
                    setDica('fim');
                    aoAbrirPonto(aberto ? null : ponto.id);
                  }}
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

      {com3d && revelado && dica === 'visivel' && estadoVisual.vista === 'fora' ? (
        <p className={styles.dica} aria-hidden="true">
          Arraste para girar{pontos.length > 0 ? ' · os + mostram os itens' : ''}
        </p>
      ) : null}

      {situacao === 'poster' || situacao === 'carregando' ? (
        // Um botão só, do pôster até o carro pronto: quem chegou nele pelo teclado não perde o foco.
        <button
          ref={botaoDeAbrir}
          type="button"
          className={styles.abrir3d}
          onClick={carregar}
          aria-disabled={situacao === 'carregando' ? true : undefined}
          data-carregando={situacao === 'carregando' ? 'sim' : 'nao'}
        >
          {situacao === 'carregando' ? <span className={styles.carregando} aria-hidden="true" /> : <IconeGirar />}
          {situacao === 'carregando' ? 'Preparando o carro em 3D…' : 'Abrir o carro em 3D'}
        </button>
      ) : null}
      <p className="sr-only" role="status">
        {situacao === 'carregando' ? 'Preparando o carro em 3D…' : ''}
      </p>
      {situacao === 'pronto' && contextoPerdido ? (
        <p className={styles.avisoDoPalco} role="status">
          <span className={styles.carregando} aria-hidden="true" />
          Recarregando o carro…
        </p>
      ) : null}
      {situacao === 'falhou' ? (
        <p className={styles.avisoDoPalco} role="status">
          Seu navegador não abriu o 3D. Cores, versões, preço e ficha continuam no cartão.
        </p>
      ) : null}
      {children}
    </div>
  );
}
