'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import type { LuzId, VersaoId } from '@/lib/carrelio/tipos';
import type { AreaLivre } from '../3d/contrato';
import type { PontoNoPalco } from '../PalcoCarro';
import { aproximar, arrastar, chegou, prender, projetar, tamanhoBase, transformacao, zoomEm, type CameraDaFoto, type Tamanho } from './camera';
import { CORES_DA_LUZ, corDaLuz, type FotoDoInterior } from './foto';
import styles from '../Carrelio.module.css';
import css from './Interior.module.css';

export type ControleDoInterior = { zoom(passo: 1 | -1): void; enquadrar(): void };

type Props = {
  foto: FotoDoInterior;
  /** A pessoa está dentro do carro. Fora, a vista fica montada, escondida e parada. */
  ativo: boolean;
  /** Os pontos de toque com o texto da versão escolhida. */
  pontos: readonly PontoNoPalco[];
  pontoAberto: string | null;
  luz: LuzId;
  noite: boolean;
  movimento: boolean;
  versao: VersaoId;
  areaLivre: AreaLivre;
  controleRef: RefObject<ControleDoInterior | null>;
  aoAbrirPonto(id: string | null): void;
  aoMudarLuz(luz: LuzId): void;
  /** Troca para a versão da foto (o aviso "só na Prestige" leva até ela). */
  aoVerNaVersaoDaFoto(): void;
};

/** De onde a câmera chega quando a pessoa entra no carro: mais perto, e desce até o lugar. */
const ZOOM_DA_ENTRADA = 1.28;
/** Abaixo disso o arrasto não conta (um toque que treme ainda é um toque). */
const ARRASTO_MINIMO_PX = 4;
/** Quanto o mouse vira a cabeça, em fração da foto (só no computador, com movimento). */
const PARALAXE = { x: 0.035, y: 0.025 };
/** A dica de uso some sozinha depois deste tempo, ou no primeiro arrasto. */
const DICA_MS = 6500;

type Gesto =
  | { tipo: 'nenhum' }
  | { tipo: 'arrasto'; id: number; x: number; y: number; moveu: boolean; vx: number; vy: number; t: number }
  | { tipo: 'pinca'; distancia: number; zoom: number };

/**
 * O carro por dentro, em foto: a pessoa arrasta para olhar em volta, aproxima, abre os pontos (a
 * câmera vai até o item e o resto escurece), troca a cor da luz ambiente e vê à noite, quando só as
 * telas e a luz ambiente ficam acesas. Tudo por CSS sobre a foto: máscaras para a luz, as telas e as
 * janelas, e `mix-blend-mode: color` para a cor da luz (a luz da foto mantém o brilho, troca o tom).
 *
 * A câmera anda por estilo direto, num laço que só roda enquanto há o que mover; os pontos são
 * posicionados no mesmo quadro, como os do 3D.
 */
export function InteriorEmFoto(props: Props) {
  const { foto, ativo, pontos, pontoAberto, luz, noite, movimento, versao, areaLivre, controleRef, aoAbrirPonto, aoMudarLuz, aoVerNaVersaoDaFoto } = props;
  const visor = useRef<HTMLDivElement>(null);
  const quadro = useRef<HTMLDivElement>(null);
  const holofote = useRef<HTMLDivElement>(null);
  const fileira = useRef<HTMLElement>(null);
  /** A fileira de cores (ou o aviso da versão), em px do palco: os pontos debaixo dela somem. */
  const caixaDaFileira = useRef<{ esquerda: number; direita: number; topo: number } | null>(null);
  const marcadores = useRef(new Map<string, HTMLDivElement>());
  const tamanhoDaFoto = useMemo<Tamanho>(() => ({ largura: foto.largura, altura: foto.altura }), [foto]);
  const centro = useMemo<CameraDaFoto>(() => ({ zoom: 1, ...foto.centro }), [foto]);
  const [palco, setPalco] = useState<Tamanho | null>(null);
  const [aproximado, setAproximado] = useState(false);
  const [dica, setDica] = useState(false);
  // A foto acesa (a que aparece à noite) só é montada quando a noite é usada pela primeira vez.
  const [noiteUsada, setNoiteUsada] = useState(noite);
  if (noite && !noiteUsada) setNoiteUsada(true);
  // Cada entrada no carro começa sem zoom e com a dica de uso à vista.
  const [ativoAntes, setAtivoAntes] = useState(false);
  if (ativo !== ativoAntes) {
    setAtivoAntes(ativo);
    if (ativo) {
      setAproximado(false);
      setDica(true);
    }
  }

  const medida = useRef<Tamanho | null>(null);
  const atual = useRef<CameraDaFoto>(centro);
  const alvo = useRef<CameraDaFoto>(centro);
  const paralaxe = useRef({ x: 0, y: 0, alvoX: 0, alvoY: 0 });
  const antesDoFoco = useRef<CameraDaFoto | null>(null);
  const pedido = useRef(0);
  const ultimoQuadro = useRef(0);
  const gesto = useRef<Gesto>({ tipo: 'nenhum' });
  const toques = useRef(new Map<number, { x: number; y: number }>());
  // O laço de quadros lê as props mais novas por ref.
  const atuais = useRef({ movimento, pontoAberto, areaLivre });
  useEffect(() => {
    atuais.current = { movimento, pontoAberto, areaLivre };
  });

  const desenhar = useCallback(() => {
    const tamanho = medida.current;
    const no = quadro.current;
    if (!tamanho || !no) return;
    const { x: px, y: py } = paralaxe.current;
    const camera = prender({ ...atual.current, x: atual.current.x + px, y: atual.current.y + py }, tamanho, tamanhoDaFoto);
    const t = transformacao(camera, tamanho, tamanhoDaFoto);
    no.style.transform = `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0) scale(${t.escala.toFixed(4)})`;
    // Os pontos que caem debaixo da barra do pé, debaixo da fileira de cores ou fora do palco somem
    // até a pessoa olhar para eles.
    const limiteDeBaixo = tamanho.altura - atuais.current.areaLivre.base - 10;
    const cores = caixaDaFileira.current;
    const debaixoDasCores = (p: { x: number; y: number }) => cores !== null && p.y > cores.topo - 16 && p.x > cores.esquerda - 16 && p.x < cores.direita + 16;
    for (const ponto of foto.pontos) {
      const marcador = marcadores.current.get(ponto.id);
      if (!marcador) continue;
      const p = projetar(ponto, camera, tamanho, tamanhoDaFoto);
      const visivel = p.x > 14 && p.x < tamanho.largura - 14 && p.y > 14 && p.y < limiteDeBaixo && !debaixoDasCores(p);
      marcador.hidden = !visivel;
      if (!visivel) continue;
      marcador.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
      const lado = p.x < tamanho.largura * 0.3 ? 'inicio' : p.x > tamanho.largura * 0.7 ? 'fim' : 'meio';
      const vertical = p.y < 150 ? 'abaixo' : 'acima';
      if (marcador.dataset['lado'] !== lado) marcador.dataset['lado'] = lado;
      if (marcador.dataset['vertical'] !== vertical) marcador.dataset['vertical'] = vertical;
    }
    const aberto = atuais.current.pontoAberto ? foto.pontos.find((p) => p.id === atuais.current.pontoAberto) : undefined;
    if (aberto && holofote.current) {
      const p = projetar(aberto, camera, tamanho, tamanhoDaFoto);
      holofote.current.style.setProperty('--x', `${p.x.toFixed(1)}px`);
      holofote.current.style.setProperty('--y', `${p.y.toFixed(1)}px`);
    }
  }, [foto, tamanhoDaFoto]);

  // O laço de quadros: só roda enquanto a câmera ou a paralaxe ainda estão a caminho.
  const passo = useRef<(agora: number) => void>(() => {});
  useEffect(() => {
    passo.current = (agora: number) => {
      pedido.current = 0;
      const dt = ultimoQuadro.current ? Math.min(0.05, (agora - ultimoQuadro.current) / 1000) : 1 / 60;
      ultimoQuadro.current = agora;
      const p = paralaxe.current;
      if (atuais.current.movimento) {
        atual.current = aproximar(atual.current, alvo.current, dt);
        const k = 1 - Math.exp(-dt * 3.5);
        p.x += (p.alvoX - p.x) * k;
        p.y += (p.alvoY - p.y) * k;
      } else {
        atual.current = alvo.current;
        p.x = p.alvoX = 0;
        p.y = p.alvoY = 0;
      }
      const parado = chegou(atual.current, alvo.current) && Math.abs(p.alvoX - p.x) < 1e-4 && Math.abs(p.alvoY - p.y) < 1e-4;
      if (parado) {
        atual.current = alvo.current;
        ultimoQuadro.current = 0;
      }
      desenhar();
      if (!parado) pedido.current = requestAnimationFrame((t) => passo.current(t));
    };
  }, [desenhar]);

  const animar = useCallback(() => {
    if (!pedido.current) pedido.current = requestAnimationFrame((t) => passo.current(t));
  }, []);

  /** Muda para onde a câmera vai (e, sem movimento, ela vai na hora). */
  const mirar = useCallback(
    (proximo: CameraDaFoto) => {
      const tamanho = medida.current;
      alvo.current = tamanho ? prender(proximo, tamanho, tamanhoDaFoto) : proximo;
      setAproximado(alvo.current.zoom > 1.02);
      animar();
    },
    [animar, tamanhoDaFoto],
  );

  // O tamanho do palco: a foto cobre o que houver, e a câmera se prende de novo a ele.
  useEffect(() => {
    const no = visor.current;
    if (!no) return;
    const medir = () => {
      const tamanho = { largura: no.clientWidth, altura: no.clientHeight };
      if (!tamanho.largura || !tamanho.altura) return;
      const caixa = fileira.current?.getBoundingClientRect();
      const origem = no.getBoundingClientRect();
      caixaDaFileira.current =
        caixa && caixa.height ? { esquerda: caixa.left - origem.left, direita: caixa.right - origem.left, topo: caixa.top - origem.top } : null;
      medida.current = tamanho;
      setPalco((antes) => (antes && antes.largura === tamanho.largura && antes.altura === tamanho.altura ? antes : tamanho));
      atual.current = prender(atual.current, tamanho, tamanhoDaFoto);
      alvo.current = prender(alvo.current, tamanho, tamanhoDaFoto);
      desenhar();
    };
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(medir);
    observador.observe(no);
    if (fileira.current) observador.observe(fileira.current);
    return () => observador.disconnect();
  }, [desenhar, tamanhoDaFoto, versao]);

  // Entrar no carro: a câmera chega de perto e assenta; a dica aparece por um tempo. Sair para tudo.
  useEffect(() => {
    if (!ativo) return;
    antesDoFoco.current = null;
    paralaxe.current = { x: 0, y: 0, alvoX: 0, alvoY: 0 };
    const tamanho = medida.current;
    const destino = tamanho ? prender(centro, tamanho, tamanhoDaFoto) : centro;
    alvo.current = destino;
    atual.current =
      atuais.current.movimento && tamanho ? prender({ zoom: ZOOM_DA_ENTRADA, x: centro.x, y: centro.y + 0.03 }, tamanho, tamanhoDaFoto) : destino;
    desenhar();
    animar();
    const fimDaDica = window.setTimeout(() => setDica(false), DICA_MS);
    return () => {
      window.clearTimeout(fimDaDica);
      cancelAnimationFrame(pedido.current);
      pedido.current = 0;
      ultimoQuadro.current = 0;
    };
  }, [ativo, animar, centro, desenhar, tamanhoDaFoto]);

  // Abrir um ponto leva a câmera até ele; fechar devolve para onde a pessoa estava.
  useEffect(() => {
    if (!ativo) return;
    const ponto = pontoAberto ? foto.pontos.find((p) => p.id === pontoAberto) : undefined;
    if (ponto) {
      antesDoFoco.current ??= alvo.current;
      mirar({ zoom: Math.max(ponto.zoom, alvo.current.zoom), x: ponto.x, y: ponto.y });
    } else if (antesDoFoco.current) {
      const volta = antesDoFoco.current;
      antesDoFoco.current = null;
      mirar(volta);
    }
  }, [ativo, pontoAberto, foto, mirar]);

  useEffect(() => {
    controleRef.current = {
      zoom: (passoDoZoom) => {
        const tamanho = medida.current;
        if (!tamanho) return;
        const fator = passoDoZoom > 0 ? 1.45 : 1 / 1.45;
        mirar(zoomEm(alvo.current, alvo.current.zoom * fator, { x: tamanho.largura / 2, y: tamanho.altura / 2 }, tamanho, tamanhoDaFoto));
      },
      enquadrar: () => {
        antesDoFoco.current = null;
        mirar(centro);
      },
    };
  }, [controleRef, mirar, centro, tamanhoDaFoto]);

  useEffect(() => () => cancelAnimationFrame(pedido.current), []);

  const pontoDoPalco = (evento: { clientX: number; clientY: number }) => {
    const caixa = visor.current!.getBoundingClientRect();
    return { x: evento.clientX - caixa.left, y: evento.clientY - caixa.top };
  };

  const aoApertar = (evento: PointerEvent<HTMLDivElement>) => {
    if (evento.pointerType === 'mouse' && evento.button !== 0) return;
    evento.currentTarget.setPointerCapture?.(evento.pointerId);
    toques.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    if (toques.current.size === 1) {
      gesto.current = { tipo: 'arrasto', id: evento.pointerId, x: evento.clientX, y: evento.clientY, moveu: false, vx: 0, vy: 0, t: evento.timeStamp };
    } else if (toques.current.size === 2) {
      const [a, b] = [...toques.current.values()];
      gesto.current = { tipo: 'pinca', distancia: Math.hypot(a!.x - b!.x, a!.y - b!.y) || 1, zoom: atual.current.zoom };
    }
  };

  const aoMover = (evento: PointerEvent<HTMLDivElement>) => {
    const tamanho = medida.current;
    if (!tamanho) return;
    if (!toques.current.has(evento.pointerId)) {
      // O mouse passando vira a cabeça um pouco: só no computador, com movimento e sem zoom.
      if (evento.pointerType !== 'mouse' || !atuais.current.movimento || alvo.current.zoom > 1.02) return;
      const p = pontoDoPalco(evento);
      paralaxe.current.alvoX = (p.x / tamanho.largura - 0.5) * PARALAXE.x;
      paralaxe.current.alvoY = (p.y / tamanho.altura - 0.5) * PARALAXE.y;
      animar();
      return;
    }
    toques.current.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    const atualGesto = gesto.current;
    if (atualGesto.tipo === 'pinca' && toques.current.size >= 2) {
      const [a, b] = [...toques.current.values()];
      const distancia = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const caixa = visor.current!.getBoundingClientRect();
      const meio = { x: (a!.x + b!.x) / 2 - caixa.left, y: (a!.y + b!.y) / 2 - caixa.top };
      atual.current = alvo.current = zoomEm(atual.current, (atualGesto.zoom * distancia) / atualGesto.distancia, meio, tamanho, tamanhoDaFoto);
      setAproximado(alvo.current.zoom > 1.02);
      desenhar();
      return;
    }
    if (atualGesto.tipo !== 'arrasto' || atualGesto.id !== evento.pointerId) return;
    const dx = evento.clientX - atualGesto.x;
    const dy = evento.clientY - atualGesto.y;
    if (!atualGesto.moveu && Math.hypot(dx, dy) < ARRASTO_MINIMO_PX) return;
    const intervalo = Math.max(1, evento.timeStamp - atualGesto.t) / 1000;
    gesto.current = { ...atualGesto, x: evento.clientX, y: evento.clientY, moveu: true, vx: dx / intervalo, vy: dy / intervalo, t: evento.timeStamp };
    if (!atualGesto.moveu) setDica(false);
    // O dedo move o centro; um zoom que ainda estava a caminho continua (arrastar não o congela).
    const movida = arrastar(atual.current, dx, dy, tamanho, tamanhoDaFoto);
    atual.current = movida;
    alvo.current = prender({ ...alvo.current, x: movida.x, y: movida.y }, tamanho, tamanhoDaFoto);
    desenhar();
    if (!chegou(atual.current, alvo.current)) animar();
  };

  const aoSoltar = (evento: PointerEvent<HTMLDivElement>) => {
    toques.current.delete(evento.pointerId);
    const atualGesto = gesto.current;
    const tamanho = medida.current;
    if (atualGesto.tipo === 'arrasto' && atualGesto.id === evento.pointerId) {
      gesto.current = { tipo: 'nenhum' };
      if (atualGesto.moveu) {
        // Solto com velocidade, a foto ainda desliza um pouco (só com movimento).
        if (tamanho && atuais.current.movimento && evento.timeStamp - atualGesto.t < 80) {
          mirar(arrastar(alvo.current, atualGesto.vx * 0.16, atualGesto.vy * 0.16, tamanho, tamanhoDaFoto));
        }
      } else if (evento.type === 'pointerup' && atuais.current.pontoAberto) {
        // Um toque fora dos pontos fecha o que está aberto.
        aoAbrirPonto(null);
      }
      return;
    }
    if (atualGesto.tipo === 'pinca') {
      // Sobrou um dedo: ele continua arrastando dali.
      const [restante] = [...toques.current.entries()];
      gesto.current = restante
        ? { tipo: 'arrasto', id: restante[0], x: restante[1].x, y: restante[1].y, moveu: true, vx: 0, vy: 0, t: evento.timeStamp }
        : { tipo: 'nenhum' };
    }
  };

  const aoSair = (evento: PointerEvent<HTMLDivElement>) => {
    if (evento.pointerType !== 'mouse') return;
    paralaxe.current.alvoX = 0;
    paralaxe.current.alvoY = 0;
    animar();
  };

  const aoDuploClique = (evento: { clientX: number; clientY: number }) => {
    const tamanho = medida.current;
    if (!tamanho) return;
    if (alvo.current.zoom > 1.3) mirar({ ...alvo.current, zoom: 1 });
    else mirar(zoomEm(alvo.current, 2, pontoDoPalco(evento), tamanho, tamanhoDaFoto));
  };

  // A pinça do trackpad chega como roda com Ctrl: aproxima em volta do ponteiro. A roda sozinha rola a página.
  useEffect(() => {
    const no = visor.current;
    if (!no) return;
    const aoRolar = (evento: WheelEvent) => {
      const tamanho = medida.current;
      if (!evento.ctrlKey || !tamanho) return;
      evento.preventDefault();
      const caixa = no.getBoundingClientRect();
      const ancora = { x: evento.clientX - caixa.left, y: evento.clientY - caixa.top };
      atual.current = alvo.current = zoomEm(atual.current, atual.current.zoom * Math.exp(-evento.deltaY * 0.01), ancora, tamanho, tamanhoDaFoto);
      setAproximado(alvo.current.zoom > 1.02);
      desenhar();
    };
    no.addEventListener('wheel', aoRolar, { passive: false });
    return () => no.removeEventListener('wheel', aoRolar);
  }, [desenhar, tamanhoDaFoto]);

  const aoTeclar = (evento: KeyboardEvent<HTMLDivElement>) => {
    const tamanho = medida.current;
    if (!tamanho || evento.target !== evento.currentTarget) return;
    const passoDoTeclado = 80;
    const mover: Record<string, [number, number]> = {
      ArrowLeft: [passoDoTeclado, 0],
      ArrowRight: [-passoDoTeclado, 0],
      ArrowUp: [0, passoDoTeclado],
      ArrowDown: [0, -passoDoTeclado],
    };
    const deslocamento = mover[evento.key];
    if (deslocamento) mirar(arrastar(alvo.current, deslocamento[0], deslocamento[1], tamanho, tamanhoDaFoto));
    else if (evento.key === '+' || evento.key === '=') controleRef.current?.zoom(1);
    else if (evento.key === '-' || evento.key === '_') controleRef.current?.zoom(-1);
    else if (evento.key === '0') controleRef.current?.enquadrar();
    else if (evento.key === 'Escape' && pontoAberto) aoAbrirPonto(null);
    else return;
    evento.preventDefault();
  };

  const base = palco ? tamanhoBase(palco, tamanhoDaFoto) : null;
  // A foto é desenhada no tamanho do zoom 1 e ampliada por `transform`: com zoom, o navegador
  // precisa saber que ela aparece maior para buscar a largura certa.
  const tamanhos = base ? `${Math.ceil(base.largura * (aproximado ? 2 : 1))}px` : '100vw';
  const fontes = (formato: 'avif' | 'webp') => foto.larguras.map((largura) => `${foto.arquivo(largura, formato)} ${largura}w`).join(', ');
  const fotoDaVersao = versao === foto.versao;
  const cor = corDaLuz(luz);
  const pontosNaFoto = pontos.filter((ponto) => foto.pontos.some((p) => p.id === ponto.id));

  const variaveis = {
    '--luz': cor.hex,
    '--mascara-faixas': `url(${foto.mascaras.faixas})`,
    '--mascara-brilho': `url(${foto.mascaras.brilho})`,
    '--mascara-telas': `url(${foto.mascaras.telas})`,
    '--mascara-acesas': `url(${foto.mascaras.acesas})`,
    '--mascara-janelas': `url(${foto.mascaras.janelas})`,
  } as CSSProperties;

  return (
    <div
      className={css.interior}
      data-ativo={ativo ? 'sim' : 'nao'}
      data-noite={noite ? 'sim' : 'nao'}
      data-movimento={movimento ? 'sim' : 'nao'}
      data-aproximado={aproximado ? 'sim' : 'nao'}
      style={variaveis}
      inert={!ativo}
    >
      <div
        ref={visor}
        className={css.visor}
        role="group"
        aria-label="Interior do carro. Arraste ou use as setas para olhar em volta; + e − aproximam."
        tabIndex={0}
        onPointerDown={aoApertar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onPointerLeave={aoSair}
        onDoubleClick={aoDuploClique}
        onKeyDown={aoTeclar}
      >
        <div ref={quadro} className={css.quadro} style={base ? { width: base.largura, height: base.altura } : undefined}>
          <picture>
            <source type="image/avif" srcSet={fontes('avif')} sizes={tamanhos} />
            <img
              className={`${css.camada} ${css.base}`}
              src={foto.arquivo(1920, 'webp')}
              srcSet={fontes('webp')}
              sizes={tamanhos}
              width={foto.largura}
              height={foto.altura}
              alt={foto.descricao}
              draggable={false}
              decoding="async"
            />
          </picture>
          <div className={`${css.camada} ${css.janelas}`} />
          {noiteUsada ? (
            <picture>
              <source type="image/avif" srcSet={fontes('avif')} sizes={tamanhos} />
              <img
                className={`${css.camada} ${css.acesas}`}
                src={foto.arquivo(1920, 'webp')}
                srcSet={fontes('webp')}
                sizes={tamanhos}
                width={foto.largura}
                height={foto.altura}
                alt=""
                draggable={false}
                decoding="async"
              />
            </picture>
          ) : null}
          <div className={`${css.camada} ${css.telasApagadas}`} />
          <div className={`${css.camada} ${css.faixasApagadas}`} />
          <div className={`${css.camada} ${css.corDaLuz}`} />
          <div className={`${css.camada} ${css.brilhoDaLuz}`} />
        </div>
        <div className={css.veu} />
        <div ref={holofote} className={css.holofote} data-aceso={pontoAberto && pontosNaFoto.some((p) => p.id === pontoAberto) ? 'sim' : 'nao'} />
      </div>

      <div className={styles.pontos} role="group" aria-label="Destaques por dentro" data-revelado="sim">
        {pontosNaFoto.map((ponto) => {
          const aberto = pontoAberto === ponto.id;
          const detalhe = foto.detalhes[ponto.id];
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
                  setDica(false);
                  aoAbrirPonto(aberto ? null : ponto.id);
                }}
              >
                <span aria-hidden="true" />
              </button>
              {aberto ? (
                <p className={`${styles.pontoBalao} ${detalhe ? css.balaoComFoto : ''}`} aria-hidden="true">
                  {detalhe ? (
                    <picture>
                      <img src={detalhe.src} width={detalhe.largura} height={detalhe.altura} alt="" className={css.fotoDoBalao} />
                    </picture>
                  ) : null}
                  <strong>{ponto.rotulo}</strong>
                  <span>{ponto.texto}</span>
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {dica && ativo ? (
        <p className={css.dica} aria-hidden="true">
          Arraste para olhar em volta · os + mostram os itens
        </p>
      ) : null}

      {fotoDaVersao ? (
        <fieldset ref={fileira as RefObject<HTMLFieldSetElement | null>} className={css.luzes}>
          <legend className={css.tituloDasLuzes}>
            Luz ambiente <span>cores de exemplo</span>
          </legend>
          <div className={css.amostras}>
            {CORES_DA_LUZ.map((opcao) => (
              <label key={opcao.id} className={css.amostra} style={{ '--amostra': opcao.hex } as CSSProperties} title={opcao.nome}>
                <input type="radio" name="carrelio-luz" value={opcao.id} checked={luz === opcao.id} onChange={() => aoMudarLuz(opcao.id)} />
                <span className="sr-only">{opcao.nome}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <p ref={fileira as RefObject<HTMLParagraphElement | null>} className={`${css.luzes} ${css.avisoDaVersao}`}>
          <span>
            Na foto, o interior da Prestige. <strong>Luz ambiente, teto de vidro e carregador são da Prestige.</strong>
          </span>
          <button type="button" className={css.botaoDaVersao} onClick={aoVerNaVersaoDaFoto}>
            Ver na Prestige
          </button>
        </p>
      )}
    </div>
  );
}
