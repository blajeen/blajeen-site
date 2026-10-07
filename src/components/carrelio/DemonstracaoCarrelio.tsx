'use client';

import { Activity, useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { useMotion } from '@/components/motion/MotionProvider';
import { JAECOO_5, LOJA, corPorId, temTetoPreto, versaoPorId } from '@/lib/carrelio/catalogo';
import { diaLocal, type AcaoCarrelio } from '@/lib/carrelio/estado';
import { consultaDoComando, hrefDoComando, lerLink, type Comando } from '@/lib/carrelio/link';
import { PONTOS_DO_INTERIOR, type Aba, type PontoDoInterior } from '@/lib/carrelio/tipos';
import type { AreaLivre, EstadoVisualCarro } from './3d/contrato';
import { MODELO_ATUAL } from './3d/modelos';
import { Abas, type SeloDaAba } from './Abas';
import { BarraDoPalco, ControlesDoZoom } from './BarraDoPalco';
import { CartaoDoCarro } from './cliente/CartaoDoCarro';
import { DETALHES_DO_JAECOO_5 } from './detalhes';
import { Garagem } from './Garagem';
import { IconeEntrar, IconeSairDaTelaCheia, IconeTelaCheia } from './Icones';
import { INTERIOR_DO_JAECOO_5 } from './interior/foto';
import { InteriorEmFoto, type ControleDoInterior } from './interior/InteriorEmFoto';
import { algumaPortaAberta, interfaceInicial, reduzirInterface } from './interface';
import { useCarrelio } from './loja';
import { ID_DOS_PEDIDOS, PainelDaLoja } from './painel/PainelDaLoja';
import { PalcoCarro, type ControleDoPalco, type PontoNoPalco, type SituacaoDoPalco } from './PalcoCarro';
import { EVENTO_DE_COMANDO } from './VerNaDemonstracao';
import styles from './Carrelio.module.css';

/** Largura em que o cartão fica ao lado do carro (computador). */
const CONSULTA_LARGA = '(min-width: 1024px)';

/** A barra de controles cobre o pé do palco: o carro se centra no que sobra (o pôster foi feito igual). */
const AREA_LIVRE: AreaLivre = { esquerda: 0, direita: 0, topo: 0, base: 64 };

const INICIAL = interfaceInicial();

type Props = {
  /**
   * Os atalhos da página ("Experimente"), na fileira das abas: no computador, acima do carro, com as
   * abas acima do cartão que elas trocam; no celular, numa fileira que desliza, acima das abas.
   */
  atalhos?: ReactNode;
};

export function DemonstracaoCarrelio({ atalhos }: Props) {
  const { estado, despachar, desfazer, podeDesfazer, restaurar, persistente } = useCarrelio();
  const [ui, mudar] = useReducer(reduzirInterface, undefined, interfaceInicial);
  const { ativo: movimento } = useMotion();
  const controle = useRef<ControleDoPalco | null>(null);
  const controleDeDentro = useRef<ControleDoInterior | null>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const quemAbriuAGaragem = useRef<HTMLElement | null>(null);
  const [situacao, setSituacao] = useState<SituacaoDoPalco>('poster');
  const [confirmandoRestaurar, setConfirmandoRestaurar] = useState(false);
  const [compartilhado, setCompartilhado] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState('');
  const [telaCheia, setTelaCheia] = useState(false);
  // Só no navegador: o dia de hoje, a largura e se a tela cheia existe (o iPhone não deixa um
  // elemento qualquer ocupar a tela: lá o botão nem aparece). O servidor não sabe nenhum dos três.
  const hoje = useSyncExternalStore(assinarNada, () => diaLocal(new Date()), () => null);
  const largo = useSyncExternalStore(assinarLargura, () => window.matchMedia(CONSULTA_LARGA).matches, () => false);
  const podeTelaCheia = useSyncExternalStore(assinarNada, () => Boolean(document.fullscreenEnabled), () => false);

  // O link profundo (?versao=prestige&cor=azul-gaia), lido uma vez depois da hidratação: a página
  // é estática, então o servidor sempre desenha o estado-base.
  useEffect(() => {
    const comando = lerLink(window.location.search);
    if (Object.keys(comando).length) mudar({ tipo: 'comando', comando });
  }, []);

  // Os atalhos da página chegam aqui como comando, sem recarregar.
  useEffect(() => {
    const aoComando = (evento: Event) => {
      const comando = (evento as CustomEvent<Comando>).detail;
      mudar({ tipo: 'comando', comando });
      controle.current?.carregar();
      raiz.current?.scrollIntoView?.({ behavior: movimento ? 'smooth' : 'auto', block: 'start' });
    };
    window.addEventListener(EVENTO_DE_COMANDO, aoComando);
    return () => window.removeEventListener(EVENTO_DE_COMANDO, aoComando);
  }, [movimento]);

  // O endereço acompanha a configuração: copiar a barra do navegador leva o carro do jeito que está.
  // O que é igual à abertura fica de fora (a página limpa continua com o endereço limpo).
  useEffect(() => {
    const comando: Comando = {
      aba: ui.aba,
      vista: ui.vista,
      ponto: ui.ponto,
      luz: ui.luz,
      ambiente: ui.ambiente,
      ...(ui.versao !== INICIAL.versao || ui.cor !== INICIAL.cor ? { versao: ui.versao, cor: ui.cor } : {}),
    };
    const url = `${window.location.pathname}${consultaDoComando(comando)}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(window.history.state, '', url);
  }, [ui.aba, ui.versao, ui.cor, ui.vista, ui.ponto, ui.luz, ui.ambiente]);

  useEffect(() => {
    const aoMudar = () => setTelaCheia(document.fullscreenElement === raiz.current);
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);

  const alternarTelaCheia = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    controle.current?.carregar();
    raiz.current?.requestFullscreen?.().catch(() => {});
  }, []);

  const despacharEAnunciar = useCallback(
    (acao: AcaoCarrelio) => {
      despachar(acao);
      if (acao.tipo === 'estoque/quantidade') setAnuncio(`${acao.quantidade} na loja.`);
    },
    [despachar],
  );

  const pontosDoInterior = useMemo(() => PONTOS_DO_INTERIOR.filter((p) => MODELO_ATUAL.interior[p]), []);
  const temPortas = Object.keys(MODELO_ATUAL.portas).length > 0;
  // Sem interior no modelo 3D, a vista de dentro é a foto do interior.
  const fotoDeDentro = pontosDoInterior.length > 0 ? null : INTERIOR_DO_JAECOO_5;
  const temInterior = pontosDoInterior.length > 0 || fotoDeDentro !== null;
  const vista = temInterior ? ui.vista : 'fora';
  const dentroEmFoto = vista === 'dentro' && fotoDeDentro !== null;
  // Com a foto à vista, o 3D fica por fora, parado, embaixo dela (e volta igual quando a pessoa sai).
  const vistaNo3d = dentroEmFoto ? 'fora' : vista;
  // A foto do interior só é montada na primeira entrada, e fica montada (sair e voltar é instantâneo).
  const [interiorMontado, setInteriorMontado] = useState(false);
  if (dentroEmFoto && !interiorMontado) setInteriorMontado(true);
  const versao = versaoPorId(JAECOO_5, ui.versao);
  const cor = corPorId(JAECOO_5, ui.cor);
  const girando = ui.girando ?? movimento;

  const estadoVisual = useMemo<EstadoVisualCarro>(
    () => ({
      pintura: cor.hex,
      tetoPreto: temTetoPreto(JAECOO_5, ui.versao, ui.cor),
      tetoPanoramico: versao.noTresD.tetoPanoramico,
      rackDeTeto: versao.noTresD.rackDeTeto,
      portas: ui.portas,
      farois: ui.farois,
      vista: vistaNo3d,
      ponto: ui.ponto,
      ambiente: ui.ambiente,
      girando: vista === 'fora' && girando,
      movimento,
    }),
    [cor.hex, ui.versao, ui.cor, versao, ui.portas, ui.farois, vistaNo3d, vista, ui.ponto, ui.ambiente, girando, movimento],
  );

  // Os pontos de toque da vista atual que o modelo 3D posiciona, com o texto da versão escolhida.
  const pontos = useMemo<PontoNoPalco[]>(
    () =>
      JAECOO_5.pontos.flatMap((ponto) => {
        const texto = ponto.texto[ui.versao];
        if (ponto.vista !== vistaNo3d || !texto || !MODELO_ATUAL.pontos[ponto.id]) return [];
        return [{ id: ponto.id, rotulo: ponto.rotulo, texto, detalhe: DETALHES_DO_JAECOO_5[ponto.id] }];
      }),
    [ui.versao, vistaNo3d],
  );

  // Os pontos da foto do interior. A foto é de uma versão: o que a outra não tem aparece assim mesmo,
  // dizendo de qual versão é (a pessoa está vendo o item na foto).
  const pontosDaFoto = useMemo<PontoNoPalco[]>(() => {
    if (!fotoDeDentro) return [];
    const versaoDaFoto = versaoPorId(JAECOO_5, fotoDeDentro.versao);
    return JAECOO_5.pontos.flatMap((ponto) => {
      if (!fotoDeDentro.pontos.some((p) => p.id === ponto.id)) return [];
      const texto = ponto.texto[ui.versao] ?? `Só na ${versaoDaFoto.nome}.`;
      return [{ id: ponto.id, rotulo: ponto.rotulo, texto, detalhe: DETALHES_DO_JAECOO_5[ponto.id] }];
    });
  }, [fotoDeDentro, ui.versao]);

  // Pedido de test drive que a loja ainda não confirmou: a aba do painel mostra quantos há.
  const pedidosNovos = estado.testDrives.filter((p) => !p.atendido).length;
  const abas = useMemo<readonly { id: Aba; rotulo: string; selo?: SeloDaAba | null }[]>(() => {
    const selo: SeloDaAba | null = pedidosNovos
      ? { texto: String(pedidosNovos), rotulo: pedidosNovos === 1 ? '1 pedido de test drive novo' : `${pedidosNovos} pedidos de test drive novos` }
      : null;
    return [
      { id: 'cliente', rotulo: 'Visão do cliente' },
      { id: 'painel', rotulo: 'Painel da loja', selo },
    ];
  }, [pedidosNovos]);

  const linkDaConfiguracao = useCallback(
    (extra: Comando = {}) => `${window.location.origin}${hrefDoComando({ versao: ui.versao, cor: ui.cor, ...extra })}`,
    [ui.versao, ui.cor],
  );

  const compartilhar = useCallback(async () => {
    const endereco = linkDaConfiguracao();
    const texto = `${JAECOO_5.nome} ${versao.nome} ${cor.nome} na ${LOJA} (demonstração do Carrelio)`;
    try {
      if (navigator.share) {
        await navigator.share({ title: JAECOO_5.nome, text: texto, url: endereco });
        return;
      }
      await navigator.clipboard.writeText(endereco);
      setCompartilhado('Link copiado. Quem abrir vê o carro nesta cor e versão.');
    } catch (erro) {
      if ((erro as Error).name !== 'AbortError') setCompartilhado(`Copie o link: ${endereco}`);
    }
  }, [linkDaConfiguracao, versao.nome, cor.nome]);

  const abrirGaragem = useCallback(() => {
    quemAbriuAGaragem.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    controle.current?.carregar();
    mudar({ tipo: 'garagem', aberta: true });
  }, []);

  const fecharGaragem = useCallback(() => {
    flushSync(() => mudar({ tipo: 'garagem', aberta: false }));
    const quem = quemAbriuAGaragem.current;
    quemAbriuAGaragem.current = null;
    // O foco volta a quem abriu (o botão da barra ou o atalho "Na sua garagem"), sem rolar a página.
    if (quem?.isConnected) quem.focus({ preventScroll: true });
  }, []);

  const mudarEMostrar = useCallback((acao: Parameters<typeof mudar>[0]) => {
    mudar(acao);
    controle.current?.carregar();
  }, []);

  // Do cartão para o painel: a aba troca e a página vai até os pedidos, com o novo no topo.
  const verPedidosNoPainel = useCallback(() => {
    flushSync(() => mudar({ tipo: 'aba', aba: 'painel' }));
    const titulo = document.getElementById(ID_DOS_PEDIDOS);
    titulo?.scrollIntoView?.({ behavior: movimento ? 'smooth' : 'auto', block: 'start' });
    titulo?.focus({ preventScroll: true });
  }, [movimento]);

  const com3d = situacao === 'pronto';
  const zoom = (passo: 1 | -1) => (dentroEmFoto ? controleDeDentro.current?.zoom(passo) : controle.current?.zoom(passo));
  const enquadrar = () => (dentroEmFoto ? controleDeDentro.current?.enquadrar() : controle.current?.enquadrar());

  return (
    <div ref={raiz} className={styles.demo} data-aba={ui.aba} data-tela-cheia={telaCheia ? 'sim' : 'nao'}>
      <div className={styles.topo}>
        {atalhos ? <div className={styles.atalhos}>{atalhos}</div> : null}
        <Abas rotulo="Visões da demonstração" abas={abas} ativa={ui.aba} aoMudar={(aba) => mudar({ tipo: 'aba', aba })} base="carrelio" />
      </div>

      <div className={styles.grade}>
        <div className={styles.colunaDoPalco}>
          <PalcoCarro
            estadoVisual={estadoVisual}
            modelo={MODELO_ATUAL}
            pontos={pontos}
            pontoAberto={ui.pontoAberto}
            areaLivre={AREA_LIVRE}
            controleRef={controle}
            aoTocarPeca={(porta) => mudar({ tipo: 'porta', porta })}
            aoArrastar={() => mudar({ tipo: 'girar', girando: false })}
            aoAbrirPonto={(id) => mudar({ tipo: 'ponto-de-toque', id })}
            aoMudarSituacao={setSituacao}
            dentro={dentroEmFoto}
            credito={dentroEmFoto ? fotoDeDentro?.legenda : undefined}
            camadaDeDentro={
              interiorMontado && fotoDeDentro ? (
                <InteriorEmFoto
                  foto={fotoDeDentro}
                  ativo={dentroEmFoto}
                  pontos={pontosDaFoto}
                  pontoAberto={dentroEmFoto ? ui.pontoAberto : null}
                  luz={ui.luz}
                  noite={ui.ambiente === 'noite'}
                  movimento={movimento}
                  versao={ui.versao}
                  areaLivre={AREA_LIVRE}
                  controleRef={controleDeDentro}
                  aoAbrirPonto={(id) => mudar({ tipo: 'ponto-de-toque', id })}
                  aoMudarLuz={(luz) => mudar({ tipo: 'luz', luz })}
                  aoVerNaVersaoDaFoto={() => mudar({ tipo: 'versao', versao: fotoDeDentro.versao })}
                />
              ) : null
            }
          >
            {/* O canto de cima: a tela cheia (a TV da loja) do tablet para cima; no celular, o zoom, que não cabe na barra. */}
            <div className={styles.cantoDoPalco}>
              {podeTelaCheia ? (
                <button type="button" className={`${styles.botaoDoCanto} ${styles.soNoLargo}`} onClick={alternarTelaCheia}>
                  {telaCheia ? <IconeSairDaTelaCheia /> : <IconeTelaCheia />}
                  {telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
                </button>
              ) : null}
              {com3d || dentroEmFoto ? (
                <ControlesDoZoom com3d aoZoom={zoom} aoEnquadrar={enquadrar} className={styles.soNoCelular} />
              ) : null}
            </div>
            {/* O convite para entrar no carro: no palco, à vista, e sem esperar o 3D (a foto não precisa dele). */}
            {temInterior && vista === 'fora' && !ui.garagem ? (
              <button type="button" className={styles.convite} onClick={() => mudarEMostrar({ tipo: 'vista', vista: 'dentro' })}>
                {fotoDeDentro ? (
                  <span className={styles.conviteMiniatura} aria-hidden="true">
                    <picture>
                      <img src={fotoDeDentro.miniatura} alt="" width={56} height={56} decoding="async" />
                    </picture>
                  </span>
                ) : null}
                <span className={styles.conviteTexto}>
                  <strong>Entrar no carro</strong>
                  <span>Painel, telas e luz ambiente</span>
                </span>
                <IconeEntrar />
              </button>
            ) : null}
            {ui.garagem ? (
              <Garagem
                urlDoModelo={MODELO_ATUAL.url}
                titulo={`${JAECOO_5.nome} ${versao.nome}`}
                link={typeof window === 'undefined' ? '' : linkDaConfiguracao({ garagem: true })}
                com3d={com3d}
                exportarUsdz={() => controle.current?.exportarUsdz() ?? Promise.resolve(null)}
                aoFechar={fecharGaragem}
              />
            ) : null}
            <BarraDoPalco
              vista={vista}
              ponto={ui.ponto}
              pontosDisponiveis={pontosDoInterior}
              portasAbertas={algumaPortaAberta(ui.portas)}
              temPortas={temPortas}
              farois={ui.farois}
              ambiente={ui.ambiente}
              girando={girando}
              com3d={com3d}
              aoVista={(vista) => mudarEMostrar({ tipo: 'vista', vista })}
              aoPonto={(ponto: PontoDoInterior) => mudarEMostrar({ tipo: 'ponto', ponto })}
              aoPortas={(abertas) => mudarEMostrar({ tipo: 'portas', abertas })}
              aoFarois={(acesos) => mudarEMostrar({ tipo: 'farois', acesos })}
              aoAmbiente={(ambiente) => mudarEMostrar({ tipo: 'ambiente', ambiente })}
              aoGirar={(valor) => mudarEMostrar({ tipo: 'girar', girando: valor })}
              aoZoom={zoom}
              aoEnquadrar={enquadrar}
              aoGaragem={abrirGaragem}
            />
          </PalcoCarro>
        </div>

        <Activity mode={ui.aba === 'cliente' ? 'visible' : 'hidden'}>
          <div role="tabpanel" id="carrelio-painel-cliente" aria-labelledby="carrelio-aba-cliente" className={styles.lateral}>
            <CartaoDoCarro
              carro={JAECOO_5}
              loja={LOJA}
              estado={estado}
              versao={ui.versao}
              cor={ui.cor}
              hoje={hoje}
              aoVersao={(v) => mudarEMostrar({ tipo: 'versao', versao: v })}
              aoCor={(c) => mudarEMostrar({ tipo: 'cor', cor: c })}
              aoCompartilhar={() => void compartilhar()}
              compartilhado={compartilhado}
              // A confirmação recebe o foco e é lida: nada de anúncio repetido aqui.
              aoPedirTestDrive={({ dia, periodo }) => despachar({ tipo: 'test-drive/pedir', versao: ui.versao, cor: ui.cor, dia, periodo })}
              aoVerPainel={verPedidosNoPainel}
            />
          </div>
        </Activity>

        <Activity mode={ui.aba === 'painel' ? 'visible' : 'hidden'}>
          <div role="tabpanel" id="carrelio-painel-painel" aria-labelledby="carrelio-aba-painel" className={styles.lateral}>
            <div className={styles.faixaSemLogin}>
              <p>
                <strong>Painel aberto para teste, sem login.</strong> No projeto, ele fica atrás do login da equipe da loja.
              </p>
              <div className={styles.acoes}>
                <button type="button" className={styles.botaoPequeno} onClick={desfazer} disabled={!podeDesfazer}>
                  Desfazer
                </button>
                {confirmandoRestaurar ? (
                  <span className={styles.confirmar} role="group" aria-label="Confirmar restauração">
                    Apagar as mudanças deste navegador?
                    <button
                      type="button"
                      className={styles.botaoPequeno}
                      onClick={() => {
                        restaurar();
                        setConfirmandoRestaurar(false);
                      }}
                    >
                      Restaurar
                    </button>
                    <button type="button" className={styles.botaoPequeno} onClick={() => setConfirmandoRestaurar(false)}>
                      Cancelar
                    </button>
                  </span>
                ) : (
                  <button type="button" className={styles.botaoPequeno} onClick={() => setConfirmandoRestaurar(true)}>
                    Restaurar demonstração
                  </button>
                )}
              </div>
            </div>
            <PainelDaLoja
              carro={JAECOO_5}
              estado={estado}
              despachar={despacharEAnunciar}
              versao={ui.versao}
              cor={ui.cor}
              aoMostrar={(v, c) => {
                mudarEMostrar({ tipo: 'versao', versao: v });
                mudarEMostrar({ tipo: 'cor', cor: c });
                if (!largo) document.querySelector('[data-ancora="palco"]')?.scrollIntoView?.({ behavior: movimento ? 'smooth' : 'auto', block: 'center' });
              }}
            />
          </div>
        </Activity>
      </div>

      <div className={styles.rodapeDaDemo}>
        <p>
          Estoque, preço da loja, campanha e pedidos são de demonstração, não os da {LOJA}.{' '}
          {persistente
            ? 'Suas mudanças ficam só neste navegador (armazenamento local). Nada é enviado ao estúdio.'
            : 'Este navegador não deixa guardar: as mudanças valem até você sair da página. Nada é enviado ao estúdio.'}
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>
    </div>
  );
}

function assinarLargura(aoMudar: () => void) {
  const consulta = window.matchMedia(CONSULTA_LARGA);
  consulta.addEventListener('change', aoMudar);
  return () => consulta.removeEventListener('change', aoMudar);
}

/** O dia não muda enquanto a página está aberta (e, se mudar, o formulário confere de novo). */
function assinarNada() {
  return () => {};
}
