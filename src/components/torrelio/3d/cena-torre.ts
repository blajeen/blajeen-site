import {
  Color, DirectionalLight, HemisphereLight, Mesh, NeutralToneMapping, PCFShadowMap, PerspectiveCamera, PlaneGeometry, Raycaster, Scene,
  SRGBColorSpace, Vector2, Vector3, WebGLRenderer, type BufferGeometry, type Group, type Material,
} from 'three';
import { paisagem, pontoDeVistaDa, raioLivre } from '@/lib/torrelio/entorno';
import { itensDoModo, NORMAL_DA_FACHADA } from '@/lib/torrelio/predio';
import type { Enquadramento, Fachada } from '@/lib/torrelio/tipos';
import {
  afastarDosObstaculos, ELEVACAO, fatorMaximoDoZoom, fovDaVista, menorDiferenca, normalizarGraus, OLHAR, PoseEmMola, poseDeAproximacao,
  poseDoEnquadramento, posicaoDaPose, RAIO_MINIMO, rumoDaDirecao, rumoDaPose, type Lente, type NomeDoEnquadramento, type Obstaculo, type Pose,
  type Vetor,
} from './camera';
import { atmosferaPara, DIRECAO_DO_LUAR, type Atmosfera } from './ceu';
import type { CenaTorre, EstadoVisualTorre, ModoDaCamera, OpcoesDaTorre, Projecao } from './contrato';
import { arvoresDoTerraco, construirEntorno } from './entorno3d';
import { estadoInicialDaTorre } from './estado-inicial';
import { construirFachada } from './fachada';
import {
  criarComuns, descartarMaterial, materialDaAgua, materialDoAnel, materialDoContorno, materialDoMergulho, materialDosHalos, materialDoVidro,
} from './materiais';
import { construirObra } from './obra';
import { ajustesDoNivel, escolherNivel, lerSinais, MedidorDeQuadros, nivelAbaixo, type Ajustes } from './qualidade';
import { CAMADA, construirTorre, construirVarandaPropria, criarMateriaisDaTorre } from './torre';

/**
 * A cena da torre: um `WebGLRenderer` próprio, desenho sob demanda e o contrato `CenaTorre`.
 *
 * - Laço: um rAF só quando há o que animar (mola da câmera, fade das luzes, entrada, giro, vista)
 *   e efeitos de ambiente (água, farol, lança do guindaste) até 5 s depois da última interação.
 *   Fora da tela ou com a aba oculta, nada desenha.
 * - Sem movimento (sistema ou botão MOVIMENTO): cortes secos, luzes na hora, nada gira sozinho.
 * - Montagem em fatias com `await`, `compileAsync` e o primeiro quadro antes de resolver.
 */

const FOV_DO_PREDIO = 32;
const PERTO_DO_PREDIO = 0.5;
const PERTO_DA_VISTA = 0.3;
const LONGE = 6500;
/** Depois de uma interação, por quanto tempo os efeitos de ambiente continuam. */
const DESCANSO_MS = 5000;
const MERGULHO = 0.15;
const CHEGADA = 0.6;
const VOO_MAXIMO = 0.95;

type OmegaDaMola = { transicao: number; arrasto: number; entrada: number; zoom: number };
const OMEGA: OmegaDaMola = { transicao: 4.6, arrasto: 14, entrada: 2.9, zoom: 7 };

/** Opções internas (harness e pôster): sem entrada animada, ou parada numa pose. */
export type OpcoesInternas = OpcoesDaTorre & {
  entrada?: boolean;
  pose?: NomeDoEnquadramento;
};

type AlvoDaVista = { indice: number; fachada: Fachada; pavimento: number; olho: Vector3; rumoBase: number; naVaranda: boolean };

type Transicao =
  | { tipo: 'voo'; t: number; alvo: AlvoDaVista }
  | { tipo: 'mergulho'; t: number; alvo: AlvoDaVista }
  | { tipo: 'chegada'; t: number }
  | { tipo: 'saida'; t: number; destino: Pose; aproximacao: Pose }
  | { tipo: 'retorno'; t: number }
  | null;

export type CenaTorreInterna = CenaTorre & {
  /** Para o harness e o QA: o renderizador, a cena e a câmera. */
  readonly interno: {
    renderer: WebGLRenderer;
    cena: Scene;
    camera: PerspectiveCamera;
    ajustes: Ajustes;
    /** Desenha um quadro agora (para capturas). */
    desenhar(): void;
    /** Posa a câmera num enquadramento sem animar. */
    posar(nome: NomeDoEnquadramento): void;
    estaAnimando(): boolean;
    /** O que está segurando o laço acordado, para depurar. */
    depurar(): Record<string, unknown>;
  };
};

const fatia = () =>
  new Promise<void>((resolver) => {
    const agendador = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (agendador?.yield) void agendador.yield().then(resolver);
    else setTimeout(resolver, 0);
  });

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export async function criarCenaTorre(host: HTMLElement, opcoes: OpcoesInternas): Promise<CenaTorreInterna> {
  const nivel = opcoes.qualidade ?? escolherNivel(lerSinais());
  let ajustes = ajustesDoNivel(nivel, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
  let movimento = opcoes.estado?.movimento ?? opcoes.movimento;

  // ------------------------------------------------------------ renderizador
  const renderer = new WebGLRenderer({ antialias: ajustes.msaa, alpha: false, stencil: false, powerPreference: 'default' });
  const canvas = renderer.domElement;
  const descartaveis: { geometrias: BufferGeometry[]; materiais: Material[] } = { geometrias: [], materiais: [] };
  let descartada = false;
  try {
    renderer.setPixelRatio(ajustes.dpr);
    renderer.outputColorSpace = SRGBColorSpace;
    // Neutral (Khronos PBR): mantém o âmbar das janelas e as cores do site; o AgX as deixava creme.
    renderer.toneMapping = NeutralToneMapping;
    renderer.shadowMap.enabled = ajustes.sombra > 0;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%', touchAction: 'pan-y', cursor: 'grab', outline: 'none' });
    host.appendChild(canvas);
  } catch (erro) {
    renderer.dispose();
    throw erro;
  }

  // Se algo falhar daqui em diante, o canvas sai do palco e a GPU é devolvida antes de rejeitar:
  // o pôster continua lá e a interface mostra a mensagem de reserva.
  try {
    // ------------------------------------------------------------------- cena
    const cena = new Scene();
    const comuns = criarComuns();
    const sol = new DirectionalLight(0xffffff, 0);
    sol.castShadow = ajustes.sombra > 0;
    if (ajustes.sombra > 0) {
      sol.shadow.mapSize.set(ajustes.sombra, ajustes.sombra);
      sol.shadow.bias = -0.00035;
      sol.shadow.normalBias = 0.06;
      sol.shadow.radius = 2.2;
      sol.shadow.camera.near = 10;
      sol.shadow.camera.far = 900;
    }
    const lua = new DirectionalLight(new Color('#90a4c8'), 0);
    lua.position.set(DIRECAO_DO_LUAR[0] * 300, DIRECAO_DO_LUAR[1] * 300, DIRECAO_DO_LUAR[2] * 300);
    const hemi = new HemisphereLight(0xffffff, 0x444444, 1);
    cena.add(sol, sol.target, lua, lua.target, hemi);
    const camera = new PerspectiveCamera(FOV_DO_PREDIO, 16 / 9, PERTO_DO_PREDIO, LONGE);
    camera.layers.enable(CAMADA.torre);
    cena.add(camera);
    await fatia();

    // ---------------------------------------------------------------- torre
    const materiaisDaTorre = criarMateriaisDaTorre(comuns);
    const aguaDaTorre = materialDaAgua(comuns);
    const torre = construirTorre(materiaisDaTorre, aguaDaTorre);
    cena.add(torre.grupo);
    await fatia();

    const vidro = materialDoVidro(comuns);
    vidro.uniforms.uInteriores.value = ajustes.interiores ? 1 : 0;
    const halos = materialDosHalos(comuns);
    const contorno = materialDoContorno();
    const anelMaterial = materialDoAnel();
    const fachada = construirFachada(
      { vidro: vidro.material, halos: halos.material, contorno: contorno.material, anel: anelMaterial },
      torre.forros,
      torre.luzDoForro,
      ajustes.halos,
    );
    torre.grupo.add(fachada.vidro, fachada.halos, fachada.contornos, fachada.anel);
    await fatia();

    // -------------------------------------------------------------- entorno
    const entorno = construirEntorno(comuns, { reduzido: ajustes.entorno === 'reduzido', lampadasDaTorre: torre.lampadas, arvoresDoTerraco: arvoresDoTerraco() });
    cena.add(entorno.grupo);
    await fatia();
    const { obra: obra3d, materiais: materiaisDaObra } = construirObra(comuns);
    cena.add(obra3d.grupo);
    const mergulho = new Mesh(new PlaneGeometry(1, 1), materialDoMergulho());
    mergulho.frustumCulled = false;
    mergulho.renderOrder = 100;
    mergulho.visible = false;
    cena.add(mergulho);
    const uMergulho = (mergulho.material as ReturnType<typeof materialDoMergulho>).uniforms['uAlfa']!;
    descartaveis.materiais.push(
      ...Object.values(materiaisDaTorre).filter((m): m is Material => !Array.isArray(m)),
      aguaDaTorre, vidro.material, halos.material, contorno.material, anelMaterial, mergulho.material as Material, ...entorno.materiais, ...materiaisDaObra,
    );
    descartaveis.geometrias.push(mergulho.geometry);
    await fatia();

    // Obstáculos perto do prédio, para a rede de segurança da câmera.
    const obstaculos: Obstaculo[] = paisagem().caixas.filter((c) => c.tipo !== 'embasamento' && Math.hypot((c.min[0] + c.max[0]) / 2, (c.min[2] + c.max[2]) / 2) < 260);

    // --------------------------------------------------------------- estado
    let estado: EstadoVisualTorre = opcoes.estado ?? estadoInicialDaTorre(movimento);
    let atmosfera: Atmosfera = atmosferaPara(estado.hora, estado.estacao);
    let sombraSuja = true;
    let relogio = 0;
    let fimDasLuzes = Number.NEGATIVE_INFINITY;
    let ultimaInteracao = -Infinity;
    let modoDaCamera: ModoDaCamera = 'predio';
    let transicao: Transicao = null;
    let girando = false;
    let arrastando = false;
    let enquadramentoAtual: NomeDoEnquadramento | null = opcoes.pose ?? (movimento && opcoes.entrada !== false ? 'abertura' : 'frente');
    let entrada: { t: number } | null = null;
    let entradaPendente = movimento && opcoes.entrada !== false && !opcoes.pose;
    let largura = Math.max(1, host.clientWidth || 960);
    let altura = Math.max(1, host.clientHeight || 540);
    const areaLivre = { esquerda: 0, direita: 0, topo: 0, base: 0 };
    const deslocamento = { x: 0, y: 0, vx: 0, vy: 0 };
    let vista: { alvo: AlvoDaVista; yaw: number; pitch: number; yawAlvo: number; pitchAlvo: number; zoom: number; zoomAlvo: number; propria: { grupo: Group; geometrias: BufferGeometry[] } | null; subida: { de: number; t: number } | null } | null = null;
    let poseAntesDaVista: Pose | null = null;
    const medidor = new MedidorDeQuadros();
    let animandoAntes = false;
    let ultimoQuadro = 0;
    const diagnostico = { quadros: 0, chamadas: 0, triangulos: 0 };
    let projecaoAnterior: Projecao | null | undefined;
    let rumoAnterior: number | null = null;

    const lente = (): Lente => ({
      fovVertical: FOV_DO_PREDIO,
      aspecto: largura / altura,
      livreX: Math.max(0.3, (largura - areaLivre.esquerda - areaLivre.direita) / largura),
      livreY: Math.max(0.3, (altura - areaLivre.topo - areaLivre.base) / altura),
    });
    const mola = new PoseEmMola(poseDoEnquadramento(enquadramentoAtual, lente()));

    // ------------------------------------------------------------- ouvintes
    const ouvintes = {
      escolher: new Set<(indice: number | null) => void>(),
      passar: new Set<(indice: number | null) => void>(),
      projetar: new Set<(marcador: Projecao | null) => void>(),
      rumo: new Set<(rumo: number) => void>(),
      camera: new Set<(modo: ModoDaCamera) => void>(),
      contexto: new Set<(situacao: 'perdido' | 'restaurado') => void>(),
    };
    const ouvir = <T>(conjunto: Set<T>) => (ouvinte: T) => {
      conjunto.add(ouvinte);
      return () => {
        conjunto.delete(ouvinte);
      };
    };
    const mudarCamera = (modo: ModoDaCamera) => {
      if (modo === modoDaCamera) return;
      modoDaCamera = modo;
      ouvintes.camera.forEach((f) => f(modo));
    };

    // ------------------------------------------------------- aplicar o estado
    function aplicarAtmosfera() {
      atmosfera = atmosferaPara(estado.hora, estado.estacao);
      const a = atmosfera;
      comuns.uSolDir.value.set(...a.direcaoDoSol);
      comuns.uCeuZenite.value.setRGB(...a.zenite);
      comuns.uCeuHorizonte.value.setRGB(...a.horizonte);
      comuns.uCeuOposto.value.setRGB(...a.horizonteOposto);
      comuns.uCeuChao.value.setRGB(...a.chao);
      comuns.uBrilhoDoSol.value.setRGB(...a.brilhoDoSol);
      comuns.uLuzDoSol.value.setRGB(a.corDoSol[0] * a.intensidadeDoSol, a.corDoSol[1] * a.intensidadeDoSol, a.corDoSol[2] * a.intensidadeDoSol);
      comuns.uHemiCeu.value.setRGB(a.hemisferioCeu[0] * a.intensidadeHemisferio, a.hemisferioCeu[1] * a.intensidadeHemisferio, a.hemisferioCeu[2] * a.intensidadeHemisferio);
      comuns.uHemiChao.value.setRGB(a.hemisferioChao[0] * a.intensidadeHemisferio, a.hemisferioChao[1] * a.intensidadeHemisferio, a.hemisferioChao[2] * a.intensidadeHemisferio);
      comuns.uNoite.value = a.noite;
      comuns.uEstrelas.value = a.estrelas;
      comuns.uNevoa.value = a.nevoa;
      sol.color.setRGB(...a.corDoSol);
      sol.intensity = a.intensidadeDoSol;
      lua.intensity = a.intensidadeDoLuar;
      hemi.color.setRGB(...a.hemisferioCeu);
      hemi.groundColor.setRGB(...a.hemisferioChao);
      hemi.intensity = a.intensidadeHemisferio;
      renderer.toneMappingExposure = a.exposicao;
      // A câmera de sombra cobre a torre e o começo da sombra dela no chão.
      const [dx, dy, dz] = a.direcaoDoSol;
      const horizontal = Math.hypot(dx, dz) || 1;
      const alcance = Math.min(70, 36 / Math.max(0.3, dy / horizontal));
      const cx = (-dx / horizontal) * alcance;
      const cz = (-dz / horizontal) * alcance;
      sol.target.position.set(cx, 18, cz);
      sol.position.set(cx + dx * 420, 18 + dy * 420, cz + dz * 420);
      sol.target.updateMatrixWorld();
      if (ajustes.sombra > 0) {
        const cam = sol.shadow.camera;
        cam.left = -125;
        cam.right = 125;
        cam.top = 125;
        cam.bottom = -125;
        cam.updateProjectionMatrix();
      }
      sombraSuja = true;
    }

    const obraAtiva = () => estado.modo === 'incorporadora' && estado.camada === 'obra';
    function aplicarObra() {
      const ativa = obraAtiva();
      const obra = ativa ? estado.obra : null;
      torre.recortar(obra);
      fachada.recortar(obra);
      obra3d.aplicar(obra);
      entorno.obra(ativa);
      const luzes = ativa ? 0 : 1;
      vidro.uniforms.uLuzesDaObra.value = luzes;
      (halos.material.uniforms['uLuzesDaObra'] as { value: number }).value = luzes;
      (materiaisDaTorre.madeira.userData['uLuzesDaObra'] as { value: number }).value = luzes;
      sombraSuja = true;
    }

    function aplicarSelecao() {
      const s = estado.selecionada ?? -1;
      vidro.uniforms.uSelecionada.value = s;
      contorno.uniforms.uSelecionada.value = s;
      fachada.selecionar(estado.selecionada);
      projecaoAnterior = undefined;
    }

    function aplicarTudo(instantaneo: boolean) {
      fachada.definirModo(estado.modo);
      fimDasLuzes = Math.max(fimDasLuzes, fachada.aplicarLuzes(estado.luzes, relogio, instantaneo ? 'instantaneo' : 'onda'));
      fachada.aplicarDisponiveis(estado.disponiveis, estado.luzes);
      contorno.uniforms.uContornar.value = estado.contornar ? 1 : 0;
      contorno.uniforms.uBloqueios.value = estado.modo === 'hotel' ? 1 : 0;
      vidro.uniforms.uPavimentoEmDestaque.value = estado.pavimentoEmDestaque ?? -1;
      fachada.destacarAndar(estado.pavimentoEmDestaque);
      aplicarSelecao();
      aplicarAtmosfera();
      aplicarObra();
    }

    aplicarTudo(true);

    // ----------------------------------------------------------------- câmera
    const vetor = new Vector3();
    const olhar = new Vector3();

    function atualizarProjecao() {
      camera.aspect = largura / altura;
      const fov = vista ? fovDaVista(largura / altura) * vista.zoom : FOV_DO_PREDIO;
      camera.fov = fov;
      camera.near = vista ? PERTO_DA_VISTA : PERTO_DO_PREDIO;
      if (Math.abs(deslocamento.x) > 0.25 || Math.abs(deslocamento.y) > 0.25) {
        camera.setViewOffset(largura, altura, -deslocamento.x, -deslocamento.y, largura, altura);
      } else {
        camera.clearViewOffset();
      }
      camera.updateProjectionMatrix();
      // Metros por pixel CSS a 1 m da câmera: a espessura do contorno acompanha a distância.
      contorno.uniforms.uMundoPorPixel.value = (2 * Math.tan((fov * Math.PI) / 360)) / altura;
    }

    function posicionarCamera() {
      if (vista) {
        const { alvo } = vista;
        const rumo = (alvo.rumoBase + vista.yaw) * (Math.PI / 180);
        const inclinacao = vista.pitch * (Math.PI / 180);
        let avanco = 0;
        if (transicao?.tipo === 'chegada') avanco = -0.5 * (1 - ease(Math.min(1, transicao.t / CHEGADA)));
        const [nx, , nz] = NORMAL_DA_FACHADA[alvo.fachada];
        const subida = vista.subida ? (vista.subida.de - alvo.olho.y) * (1 - ease(Math.min(1, vista.subida.t / 0.7))) : 0;
        camera.position.set(alvo.olho.x + nx * avanco, alvo.olho.y + subida, alvo.olho.z + nz * avanco);
        if (vista.propria) vista.propria.grupo.position.y = subida;
        olhar.set(Math.sin(rumo) * Math.cos(inclinacao), Math.sin(inclinacao), -Math.cos(rumo) * Math.cos(inclinacao));
        camera.lookAt(vetor.copy(camera.position).add(olhar));
        return;
      }
      const pose = mola.atual;
      const posicao = afastarDosObstaculos(posicaoDaPose(pose), obstaculos);
      camera.position.set(...posicao);
      camera.lookAt(pose.alvo[0], pose.alvo[1], pose.alvo[2]);
    }

    const rumoAtual = () => (vista ? normalizarGraus(vista.alvo.rumoBase + vista.yaw) : rumoDaPose(mola.atual));

    /** Para onde vai o marcador da selecionada: o alto do trecho mais de frente para a câmera. */
    function projetarMarcador(): Projecao | null {
      if (estado.selecionada === null || vista || transicao) return null;
      const retangulos = fachada.retangulos(estado.selecionada);
      if (retangulos.length === 0) return null;
      let melhor = retangulos[0]!;
      let frente = -Infinity;
      for (const r of retangulos) {
        const [nx, , nz] = NORMAL_DA_FACHADA[r.fachada];
        vetor.set(camera.position.x - r.centro[0], 0, camera.position.z - r.centro[2]).normalize();
        const d = vetor.x * nx + vetor.z * nz;
        if (d > frente) {
          frente = d;
          melhor = r;
        }
      }
      const [nx, , nz] = NORMAL_DA_FACHADA[melhor.fachada];
      vetor.set(melhor.centro[0] + nx * 0.6, melhor.centro[1] + melhor.altura / 2 + 0.25, melhor.centro[2] + nz * 0.6).project(camera);
      const x = ((vetor.x + 1) / 2) * largura;
      const y = ((1 - vetor.y) / 2) * altura;
      const naTela = vetor.z < 1 && vetor.x > -1.02 && vetor.x < 1.02 && vetor.y > -1.02 && vetor.y < 1.02;
      return { x, y, visivel: naTela && frente > 0.08 };
    }

    function emitirProjecoes() {
      const marcador = projetarMarcador();
      const anterior = projecaoAnterior;
      const mudou = anterior === undefined || (marcador === null) !== (anterior === null)
        || (marcador !== null && anterior !== null && (Math.abs(marcador.x - anterior.x) > 0.5 || Math.abs(marcador.y - anterior.y) > 0.5 || marcador.visivel !== anterior.visivel));
      if (mudou) {
        projecaoAnterior = marcador;
        ouvintes.projetar.forEach((f) => f(marcador));
      }
      const rumo = rumoAtual();
      if (rumoAnterior === null || Math.abs(menorDiferenca(rumoAnterior, rumo)) > 0.5) {
        rumoAnterior = rumo;
        ouvintes.rumo.forEach((f) => f(rumo));
      }
    }

    // ------------------------------------------------------------------ vista
    function alvoDaVista(indice: number, fachadaPedida: Fachada): AlvoDaVista | null {
      const item = itensDoModo(estado.modo)[indice];
      if (!item) return null;
      const fachadaUsada = item.fachadas.includes(fachadaPedida) ? fachadaPedida : item.fachadas[0]!;
      const ponto = pontoDeVistaDa(item, fachadaUsada);
      const [nx, , nz] = ponto.direcao;
      return {
        indice,
        fachada: fachadaUsada,
        pavimento: ponto.pavimento,
        olho: new Vector3(ponto.olho[0], ponto.olho[1], ponto.olho[2]),
        rumoBase: rumoDaDirecao(nx, nz),
        naVaranda: ponto.naVaranda,
      };
    }

    function montarPropria(alvo: AlvoDaVista) {
      if (vista?.propria) {
        cena.remove(vista.propria.grupo);
        for (const g of vista.propria.geometrias) g.dispose();
      }
      const propria = construirVarandaPropria(materiaisDaTorre, {
        pavimento: alvo.pavimento, fachada: alvo.fachada, naVaranda: alvo.naVaranda, olho: [alvo.olho.x, alvo.olho.y, alvo.olho.z],
      });
      cena.add(propria.grupo);
      return propria;
    }

    function entrarNaVista(alvo: AlvoDaVista) {
      poseAntesDaVista ??= { ...mola.destino, alvo: [...mola.destino.alvo] as Vetor };
      // Em pé (celular), o olhar desce um pouco: mais parque e lago, menos céu.
      const inclinacao = largura / altura < 1 ? -7 : -1.5;
      vista = { alvo, yaw: 0, pitch: inclinacao, yawAlvo: 0, pitchAlvo: inclinacao, zoom: 1, zoomAlvo: 1, propria: null, subida: null };
      vista.propria = montarPropria(alvo);
      camera.layers.disable(CAMADA.torre);
      camera.layers.enable(CAMADA.vista);
    }

    function sairDaVista() {
      if (vista?.propria) {
        cena.remove(vista.propria.grupo);
        for (const g of vista.propria.geometrias) g.dispose();
      }
      vista = null;
      camera.layers.enable(CAMADA.torre);
      camera.layers.disable(CAMADA.vista);
    }

    // ------------------------------------------------------------------- laço
    let pedido = 0;
    let visivelNaTela = true;
    let perdido = false;

    function pedirQuadro() {
      if (pedido || descartada || perdido || !visivelNaTela || document.hidden) return;
      pedido = requestAnimationFrame(quadro);
    }

    function interagir() {
      ultimaInteracao = performance.now();
    }

    /** Movimento desligado no meio de algo: tudo vai direto para o estado final. */
    function encerrarAnimacoes() {
      interromperEntrada();
      girando = false;
      fimDasLuzes = fachada.aplicarLuzes(estado.luzes, relogio, 'instantaneo');
      if (transicao) {
        if (transicao.tipo === 'voo' || transicao.tipo === 'mergulho') {
          entrarNaVista(transicao.alvo);
          mudarCamera('vista');
        } else if (transicao.tipo === 'saida') {
          sairDaVista();
          mola.cortar(transicao.destino);
          mudarCamera('predio');
        }
        transicao = null;
      }
      uMergulho.value = 0;
      mergulho.visible = false;
      mola.cortar(mola.destino);
      if (vista) {
        vista.yaw = vista.yawAlvo;
        vista.pitch = vista.pitchAlvo;
        vista.zoom = vista.zoomAlvo;
        vista.subida = null;
      }
      deslocamento.x = (areaLivre.esquerda - areaLivre.direita) / 2;
      deslocamento.y = (areaLivre.topo - areaLivre.base) / 2;
    }

    function interromperEntrada() {
      entradaPendente = false;
      if (!entrada) return;
      entrada = null;
      vidro.uniforms.uVarreduraForca.value = 0;
      contorno.uniforms.uOnda.value = 0;
    }

    function atualizar(dt: number, agoraMs: number): boolean {
      let anima = false;
      // Sem movimento o relógio da cena para: a água e o farol não andam entre um redesenho e outro.
      if (movimento) relogio += dt;
      comuns.uTempo.value = relogio;
      (entorno.luzes.material as unknown as { uniforms: Record<string, { value: number }> }).uniforms['uFarol']!.value = movimento ? 1 : 0;

      // Entrada: a câmera desliza da pose do pôster até a frente ¾; uma varredura sobe a fachada e
      // pisca o contorno das disponíveis uma vez.
      if (entradaPendente && movimento && !vista) {
        entradaPendente = false;
        entrada = { t: 0 };
        enquadramentoAtual = 'frente';
        mola.ir(poseDoEnquadramento('frente', lente()), OMEGA.entrada);
      }
      if (entrada) {
        entrada.t += dt;
        const p = Math.min(1, entrada.t / 2.0);
        const y = -3 + 82 * (0.5 - 0.5 * Math.cos(Math.PI * p));
        vidro.uniforms.uVarredura.value = y;
        vidro.uniforms.uVarreduraForca.value = Math.sin(Math.PI * Math.min(1, p * 1.05)) * 0.9;
        contorno.uniforms.uOndaY.value = y;
        contorno.uniforms.uOnda.value = p < 1 ? 1 : 0;
        if (p >= 1 && !mola.emMovimento) interromperEntrada();
        anima = true;
      }

      // Giro contínuo: uma volta em 60 s, parado durante o arrasto.
      if (girando && movimento && !arrastando && !vista && !transicao) {
        mola.destino.azimute += 6 * dt;
        mola.omega = OMEGA.arrasto;
        anima = true;
      }

      // Transições da vista.
      if (transicao) {
        transicao.t += dt;
        anima = true;
        switch (transicao.tipo) {
          case 'voo':
            if (transicao.t >= VOO_MAXIMO || !mola.emMovimento) transicao = { tipo: 'mergulho', t: 0, alvo: transicao.alvo };
            break;
          case 'mergulho':
            uMergulho.value = ease(Math.min(1, transicao.t / MERGULHO));
            if (transicao.t >= MERGULHO) {
              entrarNaVista(transicao.alvo);
              transicao = { tipo: 'chegada', t: 0 };
              mudarCamera('vista');
            }
            break;
          case 'chegada':
            uMergulho.value = 1 - ease(Math.min(1, transicao.t / 0.35));
            if (transicao.t >= CHEGADA) transicao = null;
            break;
          case 'saida':
            uMergulho.value = ease(Math.min(1, transicao.t / MERGULHO));
            if (transicao.t >= MERGULHO) {
              sairDaVista();
              mola.cortar(transicao.aproximacao);
              mola.ir(transicao.destino, OMEGA.transicao);
              transicao = { tipo: 'retorno', t: 0 };
              mudarCamera('predio');
            }
            break;
          case 'retorno':
            uMergulho.value = 1 - ease(Math.min(1, transicao.t / 0.3));
            if (transicao.t >= 0.3) transicao = null;
            break;
        }
        mergulho.visible = uMergulho.value > 0.002;
      } else if (mergulho.visible) {
        uMergulho.value = 0;
        mergulho.visible = false;
      }

      // Câmera: mola do prédio ou olhar da varanda.
      if (vista) {
        const k = movimento ? 1 - Math.exp(-12 * dt) : 1;
        vista.yaw += (vista.yawAlvo - vista.yaw) * k;
        vista.pitch += (vista.pitchAlvo - vista.pitch) * k;
        vista.zoom += (vista.zoomAlvo - vista.zoom) * k;
        if (Math.abs(vista.yawAlvo - vista.yaw) > 0.01 || Math.abs(vista.pitchAlvo - vista.pitch) > 0.01 || Math.abs(vista.zoomAlvo - vista.zoom) > 0.0005) anima = true;
        else {
          vista.yaw = vista.yawAlvo;
          vista.pitch = vista.pitchAlvo;
          vista.zoom = vista.zoomAlvo;
        }
        if (vista.subida) {
          vista.subida.t += dt;
          anima = true;
          if (vista.subida.t >= 0.7) vista.subida = null;
        }
      } else if (mola.passo(dt)) {
        anima = true;
      }

      // Deslocamento de lente para centrar a torre entre os painéis.
      const alvoX = (areaLivre.esquerda - areaLivre.direita) / 2;
      const alvoY = (areaLivre.topo - areaLivre.base) / 2;
      if (movimento) {
        const k = 1 - Math.exp(-9 * dt);
        deslocamento.x += (alvoX - deslocamento.x) * k;
        deslocamento.y += (alvoY - deslocamento.y) * k;
        if (Math.abs(alvoX - deslocamento.x) > 0.3 || Math.abs(alvoY - deslocamento.y) > 0.3) anima = true;
        else {
          deslocamento.x = alvoX;
          deslocamento.y = alvoY;
        }
      } else {
        deslocamento.x = alvoX;
        deslocamento.y = alvoY;
      }

      if (movimento && relogio < fimDasLuzes + 0.05) anima = true;
      const ambiente = movimento && agoraMs - ultimaInteracao < DESCANSO_MS;
      if (obra3d.animar(dt, ambiente)) anima = true;
      if (ambiente) anima = true;
      return anima;
    }

    function desenhar() {
      atualizarProjecao();
      posicionarCamera();
      if (sombraSuja && ajustes.sombra > 0) {
        // O mapa precisa existir mesmo à noite (os shaders amostram ele); depois, só com sol.
        if (atmosfera.sombra || !sol.shadow.map) renderer.shadowMap.needsUpdate = true;
        sombraSuja = false;
      }
      renderer.render(cena, camera);
      diagnostico.quadros += 1;
      diagnostico.chamadas = renderer.info.render.calls;
      diagnostico.triangulos = renderer.info.render.triangles;
      emitirProjecoes();
    }

    function quadro(agoraMs: number) {
      pedido = 0;
      if (descartada || perdido) return;
      // Tempo real entre quadros seguidos (a mola é exata para qualquer passo): em aparelho lento a
      // animação pula quadros, mas termina no mesmo tempo. Depois de um descanso, recomeça com 1/60 s.
      const continuo = ultimoQuadro !== 0;
      const dt = continuo ? Math.min(0.25, Math.max(0.001, (agoraMs - ultimoQuadro) / 1000)) : 1 / 60;
      const anima = atualizar(dt, agoraMs);
      desenhar();
      // O intervalo entre quadros seguidos de uma animação mede CPU e GPU juntas.
      if (anima && continuo) medidor.registrar(agoraMs - ultimoQuadro);
      if (animandoAntes && !anima && medidor.fecharAnimacao()) descerNivel();
      animandoAntes = anima;
      ultimoQuadro = anima ? agoraMs : 0;
      if (anima) pedirQuadro();
    }

    function descerNivel() {
      const novo = nivelAbaixo(ajustes.nivel);
      if (novo === ajustes.nivel) return;
      ajustes = { ...ajustesDoNivel(novo, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1), msaa: ajustes.msaa };
      renderer.setPixelRatio(novo === 'medio' ? Math.min(1.25, ajustes.dpr) : 1);
      renderer.setSize(largura, altura, false);
      if (sol.shadow.map && ajustes.sombra > 0) {
        sol.shadow.map.dispose();
        sol.shadow.map = null;
        sol.shadow.mapSize.set(ajustes.sombra, ajustes.sombra);
        sombraSuja = true;
      } else if (ajustes.sombra === 0) {
        sol.shadow.intensity = 0;
      }
      fachada.halos.visible = ajustes.halos;
      vidro.uniforms.uInteriores.value = ajustes.interiores ? 1 : 0;
    }

    // ------------------------------------------------------------- tamanho
    function redimensionar() {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      if (w === largura && h === altura && canvas.width > 0) return;
      largura = w;
      altura = h;
      renderer.setSize(w, h, false);
      // O enquadramento pronto (inclusive o destino da entrada) se refaz para o novo tamanho.
      if (enquadramentoAtual && !vista) {
        const destino = poseDoEnquadramento(enquadramentoAtual, lente());
        mola.destino.raio = destino.raio;
        if (!mola.emMovimento) mola.cortar({ ...mola.atual, raio: destino.raio });
      }
      pedirQuadro();
    }
    largura = Math.max(1, host.clientWidth || largura);
    altura = Math.max(1, host.clientHeight || altura);
    renderer.setSize(largura, altura, false);
    mola.cortar(poseDoEnquadramento(enquadramentoAtual ?? 'frente', lente()));

    // ------------------------------------------------- compilação e 1º quadro
    atualizarProjecao();
    posicionarCamera();
    await renderer.compileAsync(cena, camera);
    if (descartada) throw new Error('A cena foi descartada durante a carga.');
    await fatia();
    desenhar();

    // ------------------------------------------------------------ eventos
    const observadorDeTamanho = new ResizeObserver(redimensionar);
    observadorDeTamanho.observe(host);
    const observadorDeTela = new IntersectionObserver((entradas) => {
      visivelNaTela = entradas.some((e) => e.isIntersecting);
      if (visivelNaTela) pedirQuadro();
    });
    observadorDeTela.observe(host);
    const aoMudarVisibilidade = () => {
      if (!document.hidden) {
        ultimoQuadro = 0;
        pedirQuadro();
      }
    };
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    const aoPerder = (e: Event) => {
      e.preventDefault();
      perdido = true;
      cancelAnimationFrame(pedido);
      pedido = 0;
      ouvintes.contexto.forEach((f) => f('perdido'));
    };
    const aoRecuperar = () => {
      perdido = false;
      sombraSuja = true;
      ultimoQuadro = 0;
      ouvintes.contexto.forEach((f) => f('restaurado'));
      pedirQuadro();
    };
    canvas.addEventListener('webglcontextlost', aoPerder);
    canvas.addEventListener('webglcontextrestored', aoRecuperar);

    // ------------------------------------------------------------- ponteiro
    const raycaster = new Raycaster();
    raycaster.layers.enableAll();
    const ndc = new Vector2();
    const ponteiros = new Map<number, { x: number; y: number }>();
    let gesto: { x: number; y: number; arrastou: boolean; azimute: number; elevacao: number; yaw: number; pitch: number; amostras: { t: number; x: number }[] } | null = null;
    let pinca: { distancia: number; raio: number; zoom: number } | null = null;
    let passando: number | null = null;
    let ultimoPasso = 0;

    function donoNoPonto(clientX: number, clientY: number): number | null {
      const r = canvas.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const acerto = raycaster.intersectObjects([fachada.vidro, entorno.predios], false)[0];
      if (!acerto || acerto.object !== fachada.vidro || acerto.instanceId === undefined) return null;
      const dono = fachada.donoDoVao(acerto.instanceId);
      return dono >= 0 ? dono : null;
    }

    const cursor = () => {
      canvas.style.cursor = gesto?.arrastou ? 'grabbing' : passando !== null && !vista ? 'pointer' : 'grab';
    };

    function aoApertar(e: PointerEvent) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      interagir();
      interromperEntrada();
      ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ponteiros.size === 2) {
        const [a, b] = [...ponteiros.values()];
        pinca = { distancia: Math.hypot(a!.x - b!.x, a!.y - b!.y) || 1, raio: mola.destino.raio, zoom: vista?.zoomAlvo ?? 1 };
        gesto = null;
        return;
      }
      gesto = {
        x: e.clientX, y: e.clientY, arrastou: false, azimute: mola.destino.azimute, elevacao: mola.destino.elevacao,
        yaw: vista?.yawAlvo ?? 0, pitch: vista?.pitchAlvo ?? 0, amostras: [{ t: performance.now(), x: e.clientX }],
      };
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Ponteiro já liberado: segue sem captura.
      }
    }

    function aoMover(e: PointerEvent) {
      if (ponteiros.has(e.pointerId)) ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinca && ponteiros.size >= 2) {
        const [a, b] = [...ponteiros.values()];
        const d = Math.hypot(a!.x - b!.x, a!.y - b!.y) || 1;
        const fator = pinca.distancia / d;
        interagir();
        if (vista) vista.zoomAlvo = Math.min(1.35, Math.max(0.55, pinca.zoom * fator));
        else definirRaio(pinca.raio * fator, true);
        pedirQuadro();
        return;
      }
      if (gesto) {
        const dx = e.clientX - gesto.x;
        const dy = e.clientY - gesto.y;
        if (!gesto.arrastou && Math.hypot(dx, dy) > 5) {
          gesto.arrastou = true;
          arrastando = true;
          cursor();
        }
        if (!gesto.arrastou || transicao) return;
        interagir();
        gesto.amostras.push({ t: performance.now(), x: e.clientX });
        if (gesto.amostras.length > 6) gesto.amostras.shift();
        if (vista) {
          vista.yawAlvo = Math.max(-OLHAR.rumo, Math.min(OLHAR.rumo, gesto.yaw - dx * 0.16));
          if (e.pointerType === 'mouse') vista.pitchAlvo = Math.max(OLHAR.baixo, Math.min(OLHAR.cima, gesto.pitch + dy * 0.12));
          if (!movimento) {
            vista.yaw = vista.yawAlvo;
            vista.pitch = vista.pitchAlvo;
          }
        } else {
          enquadramentoAtual = null;
          mola.destino.azimute = gesto.azimute - dx * 0.32;
          if (e.pointerType === 'mouse') mola.destino.elevacao = Math.max(ELEVACAO.minima, Math.min(ELEVACAO.maxima, gesto.elevacao + dy * 0.14));
          mola.omega = OMEGA.arrasto;
          if (!movimento) mola.cortar(mola.destino);
        }
        pedirQuadro();
        return;
      }
      if (e.pointerType !== 'mouse' || vista || transicao) return;
      const agora = performance.now();
      if (agora - ultimoPasso < 40) return;
      ultimoPasso = agora;
      const dono = donoNoPonto(e.clientX, e.clientY);
      if (dono !== passando) {
        passando = dono;
        vidro.uniforms.uPassando.value = dono ?? -1;
        ouvintes.passar.forEach((f) => f(dono));
        cursor();
        pedirQuadro();
      }
    }

    function aoSoltar(e: PointerEvent) {
      ponteiros.delete(e.pointerId);
      if (pinca) {
        if (ponteiros.size < 2) pinca = null;
        return;
      }
      const g = gesto;
      gesto = null;
      arrastando = false;
      try {
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      } catch {
        // Sem captura para soltar.
      }
      cursor();
      if (!g) return;
      if (g.arrastou) {
        // Inércia curta do giro, só com movimento.
        if (movimento && !vista && g.amostras.length >= 2) {
          const a = g.amostras[0]!;
          const b = g.amostras.at(-1)!;
          const velocidade = (b.x - a.x) / Math.max(16, b.t - a.t);
          mola.destino.azimute -= Math.max(-40, Math.min(40, velocidade * 0.32 * 280));
          mola.omega = OMEGA.transicao;
        }
        pedirQuadro();
        return;
      }
      if (e.type === 'pointercancel' || vista || transicao) return;
      const dono = donoNoPonto(e.clientX, e.clientY);
      interagir();
      ouvintes.escolher.forEach((f) => f(dono));
      pedirQuadro();
    }

    function aoSair() {
      if (passando !== null) {
        passando = null;
        vidro.uniforms.uPassando.value = -1;
        ouvintes.passar.forEach((f) => f(null));
        cursor();
        pedirQuadro();
      }
    }

    function definirRaio(raio: number, imediato: boolean) {
      const base = poseDoEnquadramento('frente', lente()).raio;
      const limite = Math.max(RAIO_MINIMO, Math.min(base * fatorMaximoDoZoom, raio));
      enquadramentoAtual = null;
      mola.destino.raio = limite;
      mola.omega = imediato ? OMEGA.arrasto : OMEGA.zoom;
      if (!movimento) mola.cortar(mola.destino);
    }

    function aoRodar(e: WheelEvent) {
      // A roda sozinha rola a página; só Ctrl/⌘ + roda (a pinça do trackpad) aproxima.
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      interagir();
      interromperEntrada();
      const fator = Math.exp(Math.max(-60, Math.min(60, e.deltaY)) * 0.006);
      if (vista) vista.zoomAlvo = Math.min(1.35, Math.max(0.55, vista.zoomAlvo * fator));
      else definirRaio(mola.destino.raio * fator, true);
      pedirQuadro();
    }

    canvas.addEventListener('pointerdown', aoApertar);
    canvas.addEventListener('pointermove', aoMover);
    canvas.addEventListener('pointerup', aoSoltar);
    canvas.addEventListener('pointercancel', aoSoltar);
    canvas.addEventListener('pointerleave', aoSair);
    canvas.addEventListener('wheel', aoRodar, { passive: false });

    // --------------------------------------------------------------- contrato
    function irPara(pose: Pose, omega = OMEGA.transicao) {
      if (movimento) mola.ir(pose, omega);
      else mola.cortar(pose);
    }

    function enquadrar(alvo: Enquadramento) {
      interagir();
      interromperEntrada();
      enquadramentoAtual = alvo;
      const pose = poseDoEnquadramento(alvo, lente());
      if (vista || transicao?.tipo === 'chegada') {
        voltar(pose);
        return;
      }
      irPara(pose);
      pedirQuadro();
    }

    function voltar(destino: Pose) {
      if (!vista) return;
      const alvo = vista.alvo;
      const aproximacao = poseDeAproximacao([alvo.olho.x, alvo.olho.y, alvo.olho.z], NORMAL_DA_FACHADA[alvo.fachada], (a, b) => raioLivre(a, b));
      poseAntesDaVista = null;
      if (!movimento) {
        sairDaVista();
        transicao = null;
        mola.cortar(destino);
        mudarCamera('predio');
      } else {
        mudarCamera('transicao');
        transicao = { tipo: 'saida', t: 0, destino, aproximacao };
      }
      pedirQuadro();
    }

    const cenaTorre: CenaTorreInterna = {
      aplicar(novo) {
        const anterior = estado;
        estado = novo;
        const mudouMovimento = novo.movimento !== movimento;
        movimento = novo.movimento;
        if (mudouMovimento && !movimento) encerrarAnimacoes();
        interagir();
        const mudouModo = anterior.modo !== novo.modo;
        if (mudouModo) {
          fachada.definirModo(novo.modo);
          passando = null;
          vidro.uniforms.uPassando.value = -1;
          contorno.uniforms.uBloqueios.value = novo.modo === 'hotel' ? 1 : 0;
        }
        if (mudouModo || anterior.luzes !== novo.luzes || !iguais(anterior.luzes, novo.luzes)) {
          let jeito: 'instantaneo' | 'fade' | 'cascata' | 'onda' = 'instantaneo';
          if (movimento) {
            if (mudouModo) jeito = 'onda';
            else {
              let mudaram = 0;
              for (let i = 0; i < novo.luzes.length && mudaram < 2; i += 1) if (novo.luzes[i] !== anterior.luzes[i]) mudaram += 1;
              jeito = mudaram >= 2 ? 'cascata' : 'fade';
            }
          }
          fimDasLuzes = Math.max(fimDasLuzes, fachada.aplicarLuzes(novo.luzes, relogio, jeito));
        }
        if (mudouModo || !iguais(anterior.disponiveis, novo.disponiveis) || !iguais(anterior.luzes, novo.luzes)) fachada.aplicarDisponiveis(novo.disponiveis, novo.luzes);
        contorno.uniforms.uContornar.value = novo.contornar ? 1 : 0;
        if (mudouModo || anterior.selecionada !== novo.selecionada) aplicarSelecao();
        if (anterior.pavimentoEmDestaque !== novo.pavimentoEmDestaque) {
          vidro.uniforms.uPavimentoEmDestaque.value = novo.pavimentoEmDestaque ?? -1;
          fachada.destacarAndar(novo.pavimentoEmDestaque);
        }
        if (anterior.hora !== novo.hora || anterior.estacao !== novo.estacao) aplicarAtmosfera();
        if (mudouModo || anterior.camada !== novo.camada || anterior.obra.estruturaAte !== novo.obra.estruturaAte || anterior.obra.fachadaAte !== novo.obra.fachadaAte) aplicarObra();
        if (mudouMovimento) ultimoQuadro = 0;
        pedirQuadro();
      },
      enquadrar,
      mostrarUnidade(indice) {
        interagir();
        if (vista || transicao) return;
        const retangulos = fachada.retangulos(indice);
        if (retangulos.length === 0) return;
        const camX = camera.position.x;
        const camZ = camera.position.z;
        const h = Math.hypot(camX, camZ) || 1;
        let melhor = -Infinity;
        let soma = [0, 0];
        for (const r of retangulos) {
          const [nx, , nz] = NORMAL_DA_FACHADA[r.fachada];
          melhor = Math.max(melhor, (nx * camX + nz * camZ) / h);
          soma = [soma[0]! + nx * r.largura, soma[1]! + nz * r.largura];
        }
        if (melhor > 0.35) return;
        interromperEntrada();
        enquadramentoAtual = null;
        irPara({ ...mola.destino, alvo: [...mola.destino.alvo] as Vetor, azimute: rumoDaDirecao(soma[0]!, soma[1]!) });
        pedirQuadro();
      },
      verVista({ indice, fachada: fachadaPedida }) {
        interagir();
        interromperEntrada();
        girando = false;
        const alvo = alvoDaVista(indice, fachadaPedida);
        if (!alvo) return;
        if (vista) {
          // Já na varanda: troca de unidade (ou de fachada) sem voo.
          vista.subida = movimento && Math.abs(vista.alvo.olho.y - alvo.olho.y) > 0.01 && vista.alvo.fachada === alvo.fachada ? { de: camera.position.y, t: 0 } : null;
          vista.alvo = alvo;
          vista.yawAlvo = 0;
          if (!movimento) vista.yaw = 0;
          vista.propria = montarPropria(alvo);
          pedirQuadro();
          return;
        }
        poseAntesDaVista = { ...mola.destino, alvo: [...mola.destino.alvo] as Vetor };
        if (!movimento) {
          entrarNaVista(alvo);
          transicao = null;
          mudarCamera('vista');
        } else {
          const aproximacao = poseDeAproximacao([alvo.olho.x, alvo.olho.y, alvo.olho.z], NORMAL_DA_FACHADA[alvo.fachada], (a, b) => raioLivre(a, b));
          mola.ir(aproximacao, 6.4);
          transicao = { tipo: 'voo', t: 0, alvo };
          mudarCamera('transicao');
        }
        pedirQuadro();
      },
      mudarAndarDaVista(indice) {
        interagir();
        if (!vista) return;
        const alvo = alvoDaVista(indice, vista.alvo.fachada);
        if (!alvo) return;
        vista.subida = movimento ? { de: camera.position.y, t: 0 } : null;
        vista.alvo = alvo;
        vista.propria = montarPropria(alvo);
        pedirQuadro();
      },
      olhar(direcao) {
        interagir();
        if (!vista) return;
        if (direcao === 'esquerda') vista.yawAlvo = Math.max(-OLHAR.rumo, vista.yawAlvo - OLHAR.passoRumo);
        if (direcao === 'direita') vista.yawAlvo = Math.min(OLHAR.rumo, vista.yawAlvo + OLHAR.passoRumo);
        if (direcao === 'cima') vista.pitchAlvo = Math.min(OLHAR.cima, vista.pitchAlvo + OLHAR.passoInclinacao);
        if (direcao === 'baixo') vista.pitchAlvo = Math.max(OLHAR.baixo, vista.pitchAlvo - OLHAR.passoInclinacao);
        if (!movimento) {
          vista.yaw = vista.yawAlvo;
          vista.pitch = vista.pitchAlvo;
        }
        pedirQuadro();
      },
      voltarAoPredio() {
        interagir();
        if (!vista) return;
        voltar(poseAntesDaVista ?? poseDoEnquadramento('frente', lente()));
      },
      girar(modo) {
        interagir();
        interromperEntrada();
        if (vista) return;
        if (modo === 'parar') {
          girando = false;
        } else if (modo === 'continuo' && movimento) {
          girando = true;
          enquadramentoAtual = null;
        } else {
          girando = false;
          enquadramentoAtual = null;
          irPara({ ...mola.destino, alvo: [...mola.destino.alvo] as Vetor, azimute: mola.destino.azimute + 90 }, 5);
        }
        pedirQuadro();
      },
      zoom(passo) {
        interagir();
        interromperEntrada();
        if (vista) {
          vista.zoomAlvo = Math.min(1.35, Math.max(0.55, vista.zoomAlvo * (passo > 0 ? 0.85 : 1.18)));
          if (!movimento) vista.zoom = vista.zoomAlvo;
        } else {
          definirRaio(mola.destino.raio * (passo > 0 ? 0.8 : 1.25), false);
        }
        pedirQuadro();
      },
      definirAreaLivre(area) {
        areaLivre.esquerda = Math.max(0, area.esquerda);
        areaLivre.direita = Math.max(0, area.direita);
        areaLivre.topo = Math.max(0, area.topo);
        areaLivre.base = Math.max(0, area.base);
        if (enquadramentoAtual && !vista) {
          const destino = poseDoEnquadramento(enquadramentoAtual, lente());
          if (movimento) mola.destino.raio = destino.raio;
          else mola.cortar({ ...mola.atual, raio: destino.raio });
        }
        pedirQuadro();
      },
      aoEscolher: ouvir(ouvintes.escolher),
      aoPassar: ouvir(ouvintes.passar),
      // Quem assina depois da carga recebe o valor atual no próximo quadro.
      aoProjetar(ouvinte) {
        const cancelar = ouvir(ouvintes.projetar)(ouvinte);
        projecaoAnterior = undefined;
        pedirQuadro();
        return cancelar;
      },
      aoMudarRumo(ouvinte) {
        const cancelar = ouvir(ouvintes.rumo)(ouvinte);
        rumoAnterior = null;
        pedirQuadro();
        return cancelar;
      },
      aoMudarCamera: ouvir(ouvintes.camera),
      aoMudarContexto: ouvir(ouvintes.contexto),
      get diagnostico() {
        return { ...diagnostico };
      },
      descartar() {
        if (descartada) return;
        descartada = true;
        cancelAnimationFrame(pedido);
        observadorDeTamanho.disconnect();
        observadorDeTela.disconnect();
        document.removeEventListener('visibilitychange', aoMudarVisibilidade);
        canvas.removeEventListener('webglcontextlost', aoPerder);
        canvas.removeEventListener('webglcontextrestored', aoRecuperar);
        canvas.removeEventListener('pointerdown', aoApertar);
        canvas.removeEventListener('pointermove', aoMover);
        canvas.removeEventListener('pointerup', aoSoltar);
        canvas.removeEventListener('pointercancel', aoSoltar);
        canvas.removeEventListener('pointerleave', aoSair);
        canvas.removeEventListener('wheel', aoRodar);
        for (const conjunto of Object.values(ouvintes)) conjunto.clear();
        sairDaVista();
        torre.descartar();
        fachada.descartar();
        entorno.descartar();
        obra3d.descartar();
        for (const g of descartaveis.geometrias) g.dispose();
        for (const m of descartaveis.materiais) descartarMaterial(m);
        for (const t of materiaisDaTorre.texturas) t.dispose();
        sol.shadow.map?.dispose();
        renderer.renderLists.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      },
      interno: {
        renderer,
        cena,
        camera,
        get ajustes() {
          return ajustes;
        },
        desenhar,
        posar(nome) {
          interromperEntrada();
          enquadramentoAtual = nome;
          mola.cortar(poseDoEnquadramento(nome, lente()));
          desenhar();
        },
        estaAnimando: () => pedido !== 0 || transicao !== null || entrada !== null || mola.emMovimento || relogio < fimDasLuzes,
        depurar: () => ({
          pedido, transicao: transicao?.tipo ?? null, entrada, mola: mola.emMovimento, atual: mola.atual, destino: mola.destino, relogio, fimDasLuzes,
          girando, vista: vista !== null, deslocamento: { ...deslocamento }, ultimaInteracao, visivelNaTela, perdido, modoDaCamera,
        }),
      },
    };

    // Começa o laço: a entrada (se houver) roda a partir do próximo quadro visível.
    pedirQuadro();
    return cenaTorre;
  } catch (erro) {
    descartada = true;
    try {
      renderer.dispose();
      renderer.forceContextLoss();
    } catch {
      // Contexto já perdido: nada a devolver.
    }
    canvas.remove();
    throw erro;
  }
}

function iguais(a: Uint8Array, b: Uint8Array): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}
