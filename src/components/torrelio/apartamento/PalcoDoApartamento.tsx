'use client';

import { getImageProps } from 'next/image';
import { useCallback, useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react';
import { reservarGpu } from '@/lib/fila-da-gpu';
import { formatarArea, PLANTA, type ComodoId } from '@/lib/torrelio/planta';
import type { CenaApartamento, EstadoDoApartamento } from './3d/contrato';
import { numeroDoComodo } from './Comodos';
import { caixaDoDesenho, cotasDesenhadas, emPorcentagem, norteNoDesenho, type Orientacao } from './desenho';
import { PlantaTecnica } from './PlantaTecnica';
import styles from './Apartamento.module.css';

/** Depois do primeiro quadro, a fila da GPU fica reservada mais um pouco, como no LabHero. */
const QUADROS_PESADOS_MS = 700;

export type SituacaoDoPalco = 'poster' | 'carregando' | 'pronto' | 'falhou';

const posterPaisagem = getImageProps({
  src: '/produtos/torrelio/poster-apartamento.webp',
  alt: '',
  width: 1600,
  height: 900,
  sizes: '(min-width: 1024px) 70vw, 100vw',
}).props;
const posterRetrato = getImageProps({
  src: '/produtos/torrelio/poster-apartamento-retrato.webp',
  alt: '',
  width: 960,
  height: 1200,
  sizes: '100vw',
}).props;

const COTAS = cotasDesenhadas();

/** Celular, economia de dados ou ponteiro grosso: o 3D só abre pelo botão. */
function soPeloBotao(): boolean {
  const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conexao?.saveData) || !window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
}

type Props = {
  estado: EstadoDoApartamento;
  /** O que a planta mostra, em uma frase, para leitores de tela. */
  descricao: string;
  aoEscolher(id: ComodoId | null): void;
  aoPassar(id: ComodoId | null): void;
  /** O botão do palco pede a maquete: a seção troca o modo e a cena carrega. */
  aoPedirMaquete(): void;
};

export function PalcoDoApartamento({ estado, descricao, aoEscolher, aoPassar, aoPedirMaquete }: Props) {
  const palco = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const agulha = useRef<HTMLSpanElement>(null);
  const rotulos3d = useRef(new Map<ComodoId, HTMLSpanElement>());
  const cotas3d = useRef<(HTMLSpanElement | null)[]>([]);
  const [cena, setCena] = useState<CenaApartamento | null>(null);
  const [situacao, setSituacao] = useState<SituacaoDoPalco>('poster');
  const [contextoPerdido, setContextoPerdido] = useState(false);
  const pedido = useRef(false);

  // A carga é chamada de ouvintes e de cliques: lê o estado mais novo por ref.
  const atual = useRef(estado);
  useEffect(() => {
    atual.current = estado;
  });

  const carregar = useCallback(() => {
    if (pedido.current || !host.current) return;
    pedido.current = true;
    setSituacao('carregando');
    const alvo = host.current;
    const liberarGpu = reservarGpu();
    import('./3d/carregar-apartamento')
      .then(({ carregarApartamento }) => carregarApartamento(alvo, atual.current))
      .then((pronta) => {
        if (!host.current) {
          pronta.descartar();
          liberarGpu();
          return;
        }
        setCena(pronta);
        setSituacao('pronto');
        window.setTimeout(liberarGpu, QUADROS_PESADOS_MS);
      })
      .catch(() => {
        liberarGpu();
        setSituacao('falhou');
      });
  }, []);

  // Intenção, no computador: o ponteiro entra no palco já à vista. No celular, só o botão.
  useEffect(() => {
    const no = palco.current;
    if (!no || soPeloBotao()) return;
    let visivel = false;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        visivel = Boolean(entrada && entrada.intersectionRatio >= 0.25);
      },
      { threshold: [0, 0.25, 0.5] },
    );
    observador.observe(no);
    const intencao = () => {
      if (visivel) carregar();
    };
    no.addEventListener('pointerenter', intencao);
    no.addEventListener('pointerdown', intencao);
    return () => {
      observador.disconnect();
      no.removeEventListener('pointerenter', intencao);
      no.removeEventListener('pointerdown', intencao);
    };
  }, [carregar]);

  useEffect(() => () => cena?.descartar(), [cena]);

  useEffect(() => {
    cena?.aplicar(estado);
  }, [cena, estado]);

  const escolher = useEffectEvent((id: ComodoId | null) => aoEscolher(id));
  const passar = useEffectEvent((id: ComodoId | null) => aoPassar(id));
  useEffect(() => {
    if (!cena) return;
    const cancelar = [
      cena.aoEscolher((id) => escolher(id)),
      cena.aoPassar((id) => passar(id)),
      // Rótulos, cotas e a seta andam por estilo direto, sem render do React a cada quadro.
      cena.aoProjetarRotulos((comodos, cotas) => {
        const { modo, selecionado, destacado } = atual.current;
        const foco = destacado ?? selecionado;
        for (const [id, ponto] of comodos) {
          const no = rotulos3d.current.get(id);
          if (!no) continue;
          no.hidden = !ponto.visivel || (modo === 'maquete' && id !== foco);
          if (!no.hidden) no.style.transform = `translate3d(${ponto.x.toFixed(1)}px, ${ponto.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        }
        cotas.forEach((ponto, i) => {
          const no = cotas3d.current[i];
          if (!no) return;
          no.hidden = !ponto.visivel || modo !== 'planta';
          if (!no.hidden) no.style.left = `${ponto.x.toFixed(1)}px`;
          if (!no.hidden) no.style.top = `${ponto.y.toFixed(1)}px`;
        });
      }),
      cena.aoMudarRumo((graus) => {
        if (agulha.current) agulha.current.style.transform = `rotate(${graus.toFixed(1)}deg)`;
      }),
      cena.aoMudarContexto((situacaoDoContexto) => setContextoPerdido(situacaoDoContexto === 'perdido')),
    ];
    return () => cancelar.forEach((f) => f());
  }, [cena]);

  const orientacao: Orientacao = { espelhada: estado.espelhada, giro: estado.giro };
  const mostrar3d = situacao === 'pronto' && !contextoPerdido;
  const mostrarPlanta = !mostrar3d && estado.modo === 'planta';
  const caixa = caixaDoDesenho(orientacao);
  const deitado = estado.giro % 180 !== 0;
  const foco = estado.destacado ?? estado.selecionado;
  const comodoEmFoco = PLANTA.comodos.find((c) => c.id === foco);
  const estadoDoRotulo = (id: ComodoId) => (id === estado.selecionado ? 'selecionado' : id === estado.destacado ? 'destaque' : undefined);
  const conteudoDoRotulo = (id: ComodoId) => {
    const c = PLANTA.comodos.find((x) => x.id === id)!;
    return (
      <>
        <span className={styles.rotuloNome}>{estado.modo === 'maquete' ? c.nome : c.sigla}</span>
        <span className={styles.rotuloArea}>{formatarArea(c.areaCentesimos)}</span>
        <span className={styles.rotuloNumero}>{numeroDoComodo(c.id)}</span>
      </>
    );
  };

  return (
    <div
      ref={palco}
      className={styles.palco}
      data-situacao={situacao}
      data-modo={estado.modo}
      data-testid="palco-do-apartamento"
    >
      <picture className={`${styles.camada} ${styles.poster}`} data-visivel={!mostrar3d && estado.modo === 'maquete' ? 'sim' : 'nao'}>
        <source media="(max-width: 767px)" srcSet={posterRetrato.srcSet} width={960} height={1200} />
        <img
          {...posterPaisagem}
          loading="lazy"
          alt="Maquete branca do apartamento fictício, com as paredes cortadas, vista de cima em perspectiva."
        />
      </picture>

      <div className={`${styles.camada} ${styles.caixaDaPlanta}`} data-visivel={mostrarPlanta ? 'sim' : 'nao'} aria-hidden={!mostrarPlanta}>
        <div className={styles.folhaDaPlanta} style={{ '--proporcao': caixa.largura / caixa.altura } as CSSProperties}>
          <PlantaTecnica
            orientacao={orientacao}
            selecionado={estado.selecionado}
            destacado={estado.destacado}
            aoPassar={aoPassar}
            aoEscolher={aoEscolher}
            descricao={descricao}
          />
          <div className={styles.rotulos} aria-hidden="true" data-modo="planta">
            {PLANTA.comodos.map((c) => {
              const p = emPorcentagem(c.rotulo, orientacao);
              return (
                <span key={c.id} className={styles.rotulo} data-estado={estadoDoRotulo(c.id)} style={{ left: `${p.esquerda}%`, top: `${p.topo}%` }}>
                  {conteudoDoRotulo(c.id)}
                </span>
              );
            })}
            {COTAS.map((cota, i) => {
              const p = emPorcentagem(cota.meio, orientacao);
              const nivel = PLANTA.cotas[i]?.nivel ?? 1;
              return (
                <span
                  key={i}
                  className={styles.textoDaCota}
                  data-nivel={nivel}
                  data-vertical={cota.vertical !== deitado ? 'sim' : 'nao'}
                  style={{ left: `${p.esquerda}%`, top: `${p.topo}%` }}
                >
                  {cota.texto}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div ref={host} className={`${styles.host} ${styles.camada}`} data-visivel={mostrar3d ? 'sim' : 'nao'} aria-hidden="true" />

      <div className={styles.rotulos} aria-hidden="true" data-modo={estado.modo} data-camada="3d" hidden={!mostrar3d}>
        {PLANTA.comodos.map((c) => (
          <span
            key={c.id}
            ref={(no) => {
              if (no) rotulos3d.current.set(c.id, no);
              else rotulos3d.current.delete(c.id);
            }}
            className={styles.rotulo}
            data-estado={estadoDoRotulo(c.id)}
            hidden
          >
            {conteudoDoRotulo(c.id)}
          </span>
        ))}
        {COTAS.map((cota, i) => (
          <span
            key={i}
            ref={(no) => {
              cotas3d.current[i] = no;
            }}
            className={styles.textoDaCota}
            data-nivel={PLANTA.cotas[i]?.nivel ?? 1}
            data-vertical={cota.vertical !== deitado ? 'sim' : 'nao'}
            hidden
          >
            {cota.texto}
          </span>
        ))}
      </div>

      <p className={styles.marcaDagua} aria-hidden="true">
        PLANTA FICTÍCIA
      </p>
      <span className={styles.norte} aria-hidden="true">
        <span
          ref={agulha}
          className={styles.agulha}
          style={mostrar3d ? undefined : { transform: `rotate(${norteNoDesenho(orientacao)}deg)` }}
        >
          N
        </span>
      </span>

      <p className={styles.legenda} aria-hidden="true">
        {comodoEmFoco ? (
          <>
            <strong>{comodoEmFoco.nome}</strong> · {formatarArea(comodoEmFoco.areaCentesimos)}
          </>
        ) : mostrar3d && estado.modo === 'maquete' ? (
          'Arraste para girar · escolha um cômodo'
        ) : (
          'Escolha um cômodo na planta ou na lista'
        )}
      </p>

      {situacao === 'poster' ? (
        <button
          type="button"
          className={styles.abrir}
          onClick={() => {
            aoPedirMaquete();
            carregar();
          }}
        >
          Abrir a maquete do apartamento <span aria-hidden="true">↗</span>
        </button>
      ) : null}
      {situacao === 'carregando' && estado.modo === 'maquete' ? (
        <p className={styles.situacao} role="status">
          Montando a maquete…
        </p>
      ) : null}
      {situacao === 'pronto' && contextoPerdido ? (
        <p className={styles.situacao} role="status">
          Recarregando a maquete…
        </p>
      ) : null}
      {situacao === 'falhou' ? (
        <p className={styles.situacao} role="status">
          Seu navegador não abriu o 3D. A planta e o quadro de áreas continuam valendo.
        </p>
      ) : null}
    </div>
  );
}
