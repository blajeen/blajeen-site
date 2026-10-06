'use client';

import { Activity, useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import { useMotion } from '@/components/motion/MotionProvider';
import type { Obra } from '@/lib/torrelio/dados';
import { tabelaVigente, type AcaoTorrelio } from '@/lib/torrelio/estado';
import { formatarCentavos, formatarCota, formatarPercentual } from '@/lib/torrelio/formatar';
import { adicionarDias, hojeLocal } from '@/lib/torrelio/hotel';
import { consultaDoComando, hrefDoComando, lerLink, type Comando } from '@/lib/torrelio/link';
import { cota, QUARTOS, UNIDADES } from '@/lib/torrelio/predio';
import {
  disponiveisDaTorre, linhasDoEspelho, luzesDaTorre, proximaDisponivel, quartoNaPrumada, quartoServe, resumoComercial, vizinhaNaPrumada,
} from '@/lib/torrelio/seletores';
import type { Modo } from '@/lib/torrelio/tipos';
import type { EstadoVisualTorre } from './3d/contrato';
import { Abas } from './Abas';
import { BarraDoPalco } from './BarraDoPalco';
import { CartaoDaUnidade } from './cliente/CartaoDaUnidade';
import { detalheDaUnidade, FaixaDaVista } from './cliente/FaixaDaVista';
import { FaixaDaEscolha } from './cliente/FaixaDaEscolha';
import { Legenda, PainelDoEmpreendimento } from './cliente/PainelDoEmpreendimento';
import { CartaoDoQuarto } from './hotel/CartaoDoQuarto';
import { EscolhaDoQuarto } from './hotel/EscolhaDoQuarto';
import { PainelDoHotel } from './hotel/PainelDoHotel';
import {
  ehDeDia, fachadaDaVista, interfaceInicial, NOME_DA_CATEGORIA, periodoPadrao, quartoPorId, reduzirInterface, unidadePorId, type Aba,
} from './interface';
import { obterLoja, useTorrelio } from './loja';
import { PainelDeControle } from './painel/PainelDeControle';
import { PalcoTorre, type ControleDoPalco, type SituacaoDoPalco } from './PalcoTorre';
import { definirContextoDoApartamento, EVENTO_DE_COMANDO } from './ponte';
import styles from './Torrelio.module.css';

const ABAS: readonly { id: Aba; rotulo: string }[] = [
  { id: 'cliente', rotulo: 'Visão do cliente' },
  { id: 'painel', rotulo: 'Painel de controle' },
];

const MODOS: readonly { id: Modo; rotulo: string }[] = [
  { id: 'incorporadora', rotulo: 'Incorporadora' },
  { id: 'hotel', rotulo: 'Hotel' },
];

/** Largura em que os painéis passam a ficar por cima do palco (computador). */
const CONSULTA_LARGA = '(min-width: 1024px)';

export function DemonstracaoTorrelio() {
  const { estado, despachar, desfazer, podeDesfazer, restaurar, persistente } = useTorrelio();
  const [ui, mudar] = useReducer(reduzirInterface, undefined, interfaceInicial);
  const { ativo: movimento } = useMotion();
  const controle = useRef<ControleDoPalco | null>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const [situacao, setSituacao] = useState<SituacaoDoPalco>('poster');
  const [previaDaObra, setPreviaDaObra] = useState<Obra | null>(null);
  const [confirmandoRestaurar, setConfirmandoRestaurar] = useState(false);
  const [compartilhado, setCompartilhado] = useState<string | null>(null);
  const [reservado, setReservado] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState('');
  // Tela cheia (o stand de vendas): a API do navegador, ou uma camada fixa onde ela não existe (iPhone).
  const [telaCheia, setTelaCheia] = useState<'nao' | 'nativa' | 'camada'>('nao');
  const botaoDaTelaCheia = useRef<HTMLButtonElement>(null);
  // Só no navegador: a largura e o dia de hoje. O servidor não sabe nenhum dos dois.
  const largo = useSyncExternalStore(assinarLargura, () => window.matchMedia(CONSULTA_LARGA).matches, () => false);
  const hoje = useSyncExternalStore(assinarNada, () => hojeLocal(), () => null);
  const periodo = ui.periodo ?? (hoje ? periodoPadrao(hoje) : null);

  // O link profundo (?unidade=1803&vista=sul), lido uma vez depois da hidratação: a página é
  // estática, então o servidor sempre desenha o estado-base.
  useEffect(() => {
    const comando = lerLink(window.location.search);
    if (Object.keys(comando).length) mudar({ tipo: 'comando', comando });
  }, []);

  useEffect(() => {
    const aoMudar = () => setTelaCheia((atual) => (document.fullscreenElement ? 'nativa' : atual === 'nativa' ? 'nao' : atual));
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);

  useEffect(() => {
    if (telaCheia !== 'camada') return;
    document.body.dataset['scrollLocked'] = 'true';
    botaoDaTelaCheia.current?.focus();
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && !evento.defaultPrevented) setTelaCheia('nao');
    };
    window.addEventListener('keydown', aoTeclar);
    return () => {
      delete document.body.dataset['scrollLocked'];
      window.removeEventListener('keydown', aoTeclar);
    };
  }, [telaCheia]);

  const alternarTelaCheia = useCallback(() => {
    if (telaCheia === 'nativa') {
      void document.exitFullscreen();
      return;
    }
    if (telaCheia === 'camada') {
      setTelaCheia('nao');
      return;
    }
    const alvo = raiz.current;
    if (alvo && document.fullscreenEnabled && alvo.requestFullscreen) {
      alvo.requestFullscreen().catch(() => setTelaCheia('camada'));
    } else {
      setTelaCheia('camada');
    }
    controle.current?.carregar();
  }, [telaCheia]);

  // Os links "Ver na demonstração ↑" da página chegam aqui como comando, sem recarregar.
  useEffect(() => {
    const aoComando = (evento: Event) => {
      const comando = (evento as CustomEvent<Comando>).detail;
      mudar({ tipo: 'comando', comando });
      if (comando.unidade || comando.vista) controle.current?.carregar();
      raiz.current?.scrollIntoView({ behavior: movimento ? 'smooth' : 'auto', block: 'start' });
    };
    window.addEventListener(EVENTO_DE_COMANDO, aoComando);
    return () => window.removeEventListener(EVENTO_DE_COMANDO, aoComando);
  }, [movimento]);

  // O hotel abre na primeira vez que alguém escolhe o modo, com as reservas a partir de hoje.
  useEffect(() => {
    if (ui.modo === 'hotel' && !estado.hotel && hoje) despachar({ tipo: 'hotel/iniciar', hoje });
  }, [ui.modo, estado.hotel, hoje, despachar]);

  // E já com um quarto escolhido: o mais alto com vista para o mar livre no período (ou o primeiro livre).
  useEffect(() => {
    if (ui.modo !== 'hotel' || ui.quarto || !estado.hotel || !periodo) return;
    const filtroPadrao = { ...periodo, categoria: null };
    const livres = [...QUARTOS].reverse().filter((q) => quartoServe(estado, q, filtroPadrao));
    const escolhido = livres.find((q) => q.categoria === 'vista-mar') ?? livres[0];
    if (escolhido) mudar({ tipo: 'quarto', id: escolhido.id });
  }, [ui.modo, ui.quarto, periodo, estado]);

  // O endereço acompanha a escolha, para o link ser compartilhável (sem recarregar nem rolar).
  const primeiraUrl = useRef(true);
  useEffect(() => {
    if (primeiraUrl.current) {
      primeiraUrl.current = false;
      return;
    }
    const comando: Comando = {
      modo: ui.modo,
      aba: ui.aba,
      ...(ui.modo === 'incorporadora' ? { unidade: ui.unidade } : ui.quarto ? { quarto: ui.quarto } : {}),
      ...(ui.vista ? { vista: ui.vista.fachada } : {}),
    };
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${consultaDoComando(comando)}${window.location.hash}`);
  }, [ui.modo, ui.aba, ui.unidade, ui.quarto, ui.vista]);

  // Cada mudança feita aqui vira um anúncio curto para quem usa leitor de tela.
  const despacharEAnunciar = useCallback(
    (acao: AcaoTorrelio) => {
      const antes = obterLoja().obter().estado;
      despachar(acao);
      const depois = obterLoja().obter().estado;
      const entrada = depois.historico[0];
      if (depois !== antes && entrada) {
        setAnuncio(acao.tipo.startsWith('hotel') ? `${entrada.texto}.` : `${entrada.texto}. ${formatarPercentual(resumoComercial(depois).fracaoVendida)} vendido.`);
      }
    },
    [despachar],
  );

  const unidade = unidadePorId(ui.unidade)!;
  const quarto = ui.quarto ? quartoPorId(ui.quarto) ?? null : null;
  const resumo = useMemo(() => resumoComercial(estado), [estado]);
  const linhas = useMemo(() => linhasDoEspelho(estado), [estado]);
  const deDia = ehDeDia(ui.hora, ui.estacao);
  const filtro = useMemo(() => (periodo ? { ...periodo, categoria: ui.categoria } : null), [periodo, ui.categoria]);
  const diaDasLuzes = estado.hotel ? (ui.aba === 'painel' ? adicionarDias(estado.hotel.diaBase, ui.diaDoPainel) : periodo?.entrada ?? null) : null;

  const luzes = useMemo(() => luzesDaTorre(estado, ui.modo, diaDasLuzes), [estado, ui.modo, diaDasLuzes]);
  const disponiveis = useMemo(() => disponiveisDaTorre(estado, ui.modo, filtro), [estado, ui.modo, filtro]);
  const obra = previaDaObra ?? estado.obra;
  const indiceSelecionado = indiceDaEscolha(ui.modo, ui.unidade, ui.quarto);

  const estadoVisual = useMemo<EstadoVisualTorre>(
    () => ({
      modo: ui.modo,
      camada: ui.modo === 'hotel' ? 'comercial' : ui.camada,
      luzes,
      disponiveis,
      selecionada: indiceSelecionado,
      pavimentoEmDestaque: ui.pavimentoEmDestaque,
      contornar: ui.contornar || deDia,
      hora: ui.hora,
      estacao: ui.estacao,
      obra: { estruturaAte: obra.estruturaAte, fachadaAte: obra.fachadaAte },
      movimento,
    }),
    [ui.modo, ui.camada, luzes, disponiveis, indiceSelecionado, ui.pavimentoEmDestaque, ui.contornar, deDia, ui.hora, ui.estacao, obra.estruturaAte, obra.fachadaAte, movimento],
  );

  const vistaAlvo = ui.vista ? (ui.modo === 'incorporadora' ? unidadePorId(ui.vista.id) : quartoPorId(ui.vista.id)) ?? null : null;
  const vistaDoPalco = useMemo(
    () => (ui.vista && vistaAlvo ? { indice: vistaAlvo.indice, fachada: ui.vista.fachada } : null),
    [ui.vista, vistaAlvo],
  );

  // Os painéis ficam por cima do palco no computador: a torre se centra no que sobra.
  const areaLivre = useMemo(() => {
    if (!largo || ui.aba === 'painel') return { esquerda: 0, direita: 0, topo: 0, base: 72 };
    return { esquerda: ui.vista ? 0 : 372, direita: 392, topo: 0, base: 72 };
  }, [largo, ui.aba, ui.vista]);

  const marcador = ui.modo === 'incorporadora'
    ? { titulo: unidade.id, detalhe: `${unidade.pavimentos.map((p) => `${p}º`).join('–')} · ${formatarCota(cota(unidade.pavimentos[0]!))}` }
    : quarto ? { titulo: quarto.id, detalhe: `${quarto.pavimento}º · ${NOME_DA_CATEGORIA[quarto.categoria]}` } : null;

  const escolherUnidade = useCallback((id: string) => {
    mudar({ tipo: 'unidade', id });
    setCompartilhado(null);
    controle.current?.carregar();
  }, []);
  const escolherQuarto = useCallback((id: string) => {
    mudar({ tipo: 'quarto', id });
    setReservado(null);
    controle.current?.carregar();
  }, []);
  const destacar = useCallback((pavimento: number | null) => mudar({ tipo: 'destacar', pavimento }), []);

  const escolherNoPalco = useCallback(
    (indice: number | null) => {
      if (indice === null) return;
      if (ui.modo === 'incorporadora') {
        const alvo = UNIDADES[indice];
        if (alvo) escolherUnidade(alvo.id);
      } else {
        const alvo = QUARTOS[indice];
        if (alvo) escolherQuarto(alvo.id);
      }
    },
    [ui.modo, escolherUnidade, escolherQuarto],
  );

  const abrirVista = useCallback(() => {
    const alvo = ui.modo === 'incorporadora' ? unidade : quarto;
    if (!alvo) return;
    controle.current?.carregar();
    mudar({ tipo: 'vista', vista: { id: alvo.id, fachada: fachadaDaVista(alvo) } });
  }, [ui.modo, unidade, quarto]);

  const fecharVista = useCallback(() => mudar({ tipo: 'vista', vista: null }), []);

  const compartilhar = useCallback(async () => {
    const endereco = `${window.location.origin}${hrefDoComando({ unidade: unidade.id })}`;
    const texto = `Unidade ${unidade.id} do Residencial Vértice (demonstração fictícia do Torrelio)`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Torrelio', text: texto, url: endereco });
        return;
      }
      await navigator.clipboard.writeText(endereco);
      setCompartilhado('Link copiado. Quem abrir cai direto nesta unidade.');
    } catch (erro) {
      if ((erro as Error).name !== 'AbortError') setCompartilhado(`Copie o link: ${endereco}`);
    }
  }, [unidade.id]);

  const verApartamento = useCallback(() => {
    definirContextoDoApartamento({ unidade: { id: unidade.id, final: unidade.final, tipologia: unidade.tipologia }, hora: ui.hora, estacao: ui.estacao }, true);
  }, [unidade, ui.hora, ui.estacao]);

  // O "elevador" da vista: a mesma prumada um andar acima ou abaixo.
  const acima = vistaAlvo ? (ui.modo === 'incorporadora' ? vizinhaNaPrumada(vistaAlvo.id, 1) : quartoNaPrumada(vistaAlvo.id, 1)) : null;
  const abaixo = vistaAlvo ? (ui.modo === 'incorporadora' ? vizinhaNaPrumada(vistaAlvo.id, -1) : quartoNaPrumada(vistaAlvo.id, -1)) : null;
  const rotuloDoAndar = (id: string) => {
    if (ui.modo === 'incorporadora') {
      const s = estado.unidades[id]!;
      return `${id} · ${formatarCentavos(s.precoCentavos)}`;
    }
    return `Quarto ${id}`;
  };
  const irPara = (id: string) => (ui.modo === 'incorporadora' ? escolherUnidade(id) : escolherQuarto(id));
  const detalheDaVista = vistaAlvo
    ? ui.modo === 'incorporadora'
      ? detalheDaUnidade(estado.unidades[vistaAlvo.id]!.status, estado.unidades[vistaAlvo.id]!.precoCentavos)
      : `${NOME_DA_CATEGORIA[(vistaAlvo as (typeof QUARTOS)[number]).categoria]} · ${formatarCentavos(estado.hotel?.diarias[(vistaAlvo as (typeof QUARTOS)[number]).categoria] ?? 0)} a diária`
    : '';

  const com3d = situacao === 'pronto';
  const tabela = tabelaVigente(estado).numero;
  const outrasDisponiveis = proximaDisponivel(estado, unidade.id, 1);

  return (
    <div
      ref={raiz}
      className={styles.demo}
      data-aba={ui.aba}
      data-modo={ui.modo}
      data-vista={ui.vista ? 'sim' : 'nao'}
      data-tela-cheia={telaCheia === 'nao' ? 'nao' : 'sim'}
      role={telaCheia === 'camada' ? 'dialog' : undefined}
      aria-modal={telaCheia === 'camada' ? true : undefined}
      aria-label={telaCheia === 'camada' ? 'Demonstração do Torrelio em tela cheia' : undefined}
    >
      <div className={styles.topo}>
        <Abas rotulo="Visões da demonstração" abas={ABAS} ativa={ui.aba} aoMudar={(aba) => mudar({ tipo: 'aba', aba })} base="torrelio" />
        <div className={styles.linhaDeBotoes}>
          <div role="group" aria-label="Uso do prédio" className={styles.segmento}>
            {MODOS.map((m) => (
              <button key={m.id} type="button" aria-pressed={ui.modo === m.id} onClick={() => mudar({ tipo: 'modo', modo: m.id })}>
                {m.rotulo}
              </button>
            ))}
          </div>
          <button ref={botaoDaTelaCheia} type="button" className={styles.segmentoSolto} aria-pressed={telaCheia !== 'nao'} onClick={alternarTelaCheia}>
            {telaCheia === 'nao' ? 'Tela cheia' : 'Sair da tela cheia'}
          </button>
        </div>
      </div>

      <div className={styles.grade}>
        <PalcoTorre
          estadoVisual={estadoVisual}
          enquadramento={ui.enquadramento}
          girando={ui.girando}
          vista={vistaDoPalco}
          areaLivre={areaLivre}
          marcador={marcador}
          controleRef={controle}
          aoEscolher={escolherNoPalco}
          aoMudarCamera={() => {}}
          aoMudarSituacao={setSituacao}
        >
          {!ui.vista && ui.aba === 'cliente' ? <FaixaDaEscolha modo={ui.modo} unidade={unidade} quarto={quarto} estado={estado} /> : null}
          {ui.vista && vistaAlvo ? (
            <FaixaDaVista
              alvo={vistaAlvo}
              titulo={ui.modo === 'incorporadora' ? `Vista do ${vistaAlvo.id}` : `Vista do quarto ${vistaAlvo.id}`}
              fachada={ui.vista.fachada}
              detalhe={detalheDaVista}
              acima={acima ? { rotulo: `Subir: ${rotuloDoAndar(acima.id)}` } : null}
              abaixo={abaixo ? { rotulo: `Descer: ${rotuloDoAndar(abaixo.id)}` } : null}
              com3d={com3d}
              aoTrocarFachada={(fachada) => mudar({ tipo: 'vista', vista: { id: vistaAlvo.id, fachada } })}
              aoSubir={() => acima && irPara(acima.id)}
              aoDescer={() => abaixo && irPara(abaixo.id)}
              aoOlhar={(direcao) => controle.current?.olhar(direcao)}
              aoVoltar={fecharVista}
            />
          ) : (
            <BarraDoPalco
              modo={ui.modo}
              camada={ui.camada}
              hora={ui.hora}
              estacao={ui.estacao}
              enquadramento={ui.enquadramento}
              contornar={ui.contornar}
              deDia={deDia}
              girando={ui.girando}
              movimento={movimento}
              com3d={com3d}
              aoCamada={(camada) => mudar({ tipo: 'camada', camada })}
              aoHora={(hora) => mudar({ tipo: 'hora', hora })}
              aoEstacao={(estacao) => mudar({ tipo: 'estacao', estacao })}
              aoEnquadrar={(enquadramento) => mudar({ tipo: 'enquadrar', enquadramento })}
              aoContornar={(contornar) => mudar({ tipo: 'contornar', contornar })}
              aoGirar={() => (movimento ? mudar({ tipo: 'girar', girando: !ui.girando }) : controle.current?.girarUmPasso())}
              aoZoom={(passo) => controle.current?.zoom(passo)}
            />
          )}
        </PalcoTorre>

        <Activity mode={ui.aba === 'cliente' ? 'visible' : 'hidden'}>
          <div role="tabpanel" id="torrelio-painel-cliente" aria-labelledby="torrelio-aba-cliente" className={styles.cliente}>
            {ui.modo === 'incorporadora' ? (
              <>
                <PainelDoEmpreendimento
                  espelhoAberto={largo}
                  resumo={resumo}
                  linhas={linhas}
                  tabela={tabela}
                  selecionada={ui.unidade}
                  aoEscolher={escolherUnidade}
                  aoDestacar={destacar}
                />
                <CartaoDaUnidade
                  unidade={unidade}
                  situacao={estado.unidades[unidade.id]!}
                  condicao={estado.condicao}
                  tabela={tabela}
                  camada={ui.camada}
                  obra={estado.obra}
                  hora={ui.hora}
                  estacao={ui.estacao}
                  semOutras={!outrasDisponiveis || outrasDisponiveis === unidade.id}
                  aoVerVista={abrirVista}
                  aoVerApartamento={verApartamento}
                  aoNavegar={(sentido) => {
                    const proxima = proximaDisponivel(estado, unidade.id, sentido);
                    if (proxima) escolherUnidade(proxima);
                  }}
                  aoCompartilhar={compartilhar}
                  compartilhado={compartilhado}
                />
              </>
            ) : periodo ? (
              <>
                <EscolhaDoQuarto
                  estado={estado}
                  periodo={periodo}
                  categoria={ui.categoria}
                  quarto={ui.quarto}
                  aoPeriodo={(periodo) => mudar({ tipo: 'periodo', periodo })}
                  aoCategoria={(categoria) => mudar({ tipo: 'categoria', categoria })}
                  aoEscolher={escolherQuarto}
                />
                {quarto ? (
                  <CartaoDoQuarto
                    key={quarto.id}
                    estado={estado}
                    quarto={quarto}
                    periodo={periodo}
                    despachar={despacharEAnunciar}
                    aoVerVista={abrirVista}
                    reservado={reservado === quarto.id}
                    aoReservar={() => setReservado(quarto.id)}
                  />
                ) : (
                  <p className={styles.dicaDoCartao}>Escolha um quarto na grade (ou clique numa janela da torre) para ver a diária do período e a vista.</p>
                )}
              </>
            ) : null}
          </div>
        </Activity>

        <Activity mode={ui.aba === 'painel' ? 'visible' : 'hidden'}>
          <div role="tabpanel" id="torrelio-painel-painel" aria-labelledby="torrelio-aba-painel" className={styles.painel}>
            <div className={styles.faixaSemLogin}>
              <p>
                <strong>Painel aberto para teste, sem login.</strong> No projeto, ele fica atrás do login da equipe.
              </p>
              <div className={styles.linhaDeBotoes}>
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
            {ui.modo === 'incorporadora' ? (
              <PainelDeControle
                estado={estado}
                despachar={despacharEAnunciar}
                selecionada={ui.unidade}
                aoEscolher={escolherUnidade}
                aoDestacar={destacar}
                subAba={ui.subAbaDoPainel}
                aoSubAba={(subAba) => mudar({ tipo: 'sub-aba', subAba })}
                aoPreviaDaObra={setPreviaDaObra}
              />
            ) : estado.hotel ? (
              <PainelDoHotel
                estado={estado}
                hotel={estado.hotel}
                despachar={despacharEAnunciar}
                diaDoPainel={ui.diaDoPainel}
                aoDia={(dia) => mudar({ tipo: 'dia-do-painel', dia })}
                subAba={ui.subAbaDoHotel}
                aoSubAba={(subAba) => mudar({ tipo: 'sub-aba-do-hotel', subAba })}
                aoEscolherQuarto={(id) => {
                  escolherQuarto(id);
                }}
              />
            ) : null}
          </div>
        </Activity>
      </div>

      <div className={styles.rodapeDaDemo}>
        {ui.modo === 'incorporadora' && ui.aba === 'painel' ? <Legenda /> : null}
        <p>
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

/** O dia não muda enquanto a página está aberta (e, se mudar, o período escolhido continua valendo). */
function assinarNada() {
  return () => {};
}

function indiceDaEscolha(modo: Modo, unidade: string, quarto: string | null): number | null {
  if (modo === 'incorporadora') return UNIDADES.findIndex((u) => u.id === unidade);
  const indice = quarto ? QUARTOS.findIndex((q) => q.id === quarto) : -1;
  return indice >= 0 ? indice : null;
}
