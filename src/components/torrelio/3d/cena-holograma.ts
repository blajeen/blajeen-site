import {
  AdditiveBlending, Color, DirectionalLight, HemisphereLight, Mesh, MeshBasicMaterial, NeutralToneMapping, PerspectiveCamera, RingGeometry, Scene,
  SRGBColorSpace, WebGLRenderer, type Material,
} from 'three';
import { atmosferaPara, DIRECAO_DO_LUAR } from './ceu';
import { construirFachada } from './fachada';
import {
  azimuteDaVista, celulasDoHolograma, ladoDeDesenho, VOLTA_EM_SEGUNDOS, type CarregarHolograma, type CenaHolograma, type EstadoDoHolograma,
  type VideoDoHolograma,
} from './holograma';
import { criarComuns, descartarMaterial, materialDaAgua, materialDoAnel, materialDoContorno, materialDosHalos, materialDoVidro, PALETA } from './materiais';
import { ajustesDoNivel, escolherNivel, lerSinais } from './qualidade';
import { CAMADA, construirTorre, criarMateriaisDaTorre } from './torre';

/**
 * O holograma: só o prédio, num fundo preto, girando devagar numa mesa. No holograma de stand
 * (pirâmide, vitrine com vidro a 45°, ventilador de LED), o que é preto some e só a luz aparece:
 * por isso não há céu, névoa, chão nem cidade, e o reflexo do vidro também é preto.
 *
 * Um `WebGLRenderer` fora da página desenha cada vista num quadrado; um canvas 2D, que é o que
 * aparece (e o que é gravado), recebe as vistas giradas e espelhadas (`holograma.ts`). A 30 quadros
 * por segundo: a mesa gira devagar, e a pirâmide desenha o prédio quatro vezes por quadro.
 */

/** Campo de visão vertical das vistas: estreito, para o prédio não deformar nas bordas. */
const FOV = 28;
/**
 * O prédio vai da base (0 m) ao coroamento (~71 m); o enquadramento desce um pouco mais, para o
 * anel da base (que fica mais perto da câmera, e por isso mais baixo na imagem) caber inteiro.
 */
const ALVO_Y = 34;
const ALTURA_ENQUADRADA = 92;
/** Quase na altura dos olhos de quem olha a pirâmide de lado. */
const ELEVACAO = 8;
const DISTANCIA = ALTURA_ENQUADRADA / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);
/** O vídeo do ventilador: quadrado, como o disco de LED. */
const LADO_DO_VIDEO = 1080;
const QUADRO_MS = 1000 / 31;
const RAD = Math.PI / 180;

const TIPOS_DE_VIDEO = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'] as const;

const fatia = () => new Promise<void>((resolver) => setTimeout(resolver, 0));

function iguais(a: Uint8Array, b: Uint8Array): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}

type Gravacao = {
  ctx: CanvasRenderingContext2D;
  gravador: MediaRecorder;
  girado: number;
  cancelada: boolean;
  aoProgresso: ((fracao: number) => void) | undefined;
};

export const criarCenaHolograma: CarregarHolograma = async (host, inicial) => {
  const ajustes = ajustesDoNivel(escolherNivel(lerSinais()), typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
  const renderer = new WebGLRenderer({ antialias: ajustes.nivel !== 'baixo', alpha: false, stencil: false, powerPreference: 'default' });
  const gl = renderer.domElement;
  const saida = document.createElement('canvas');
  const ctx = saida.getContext('2d', { alpha: false });
  let descartada = false;
  if (!ctx) {
    renderer.dispose();
    throw new Error('Sem canvas 2D.');
  }

  try {
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NeutralToneMapping;
    renderer.shadowMap.enabled = false;
    renderer.setClearColor(0x000000, 1);
    saida.setAttribute('aria-hidden', 'true');
    Object.assign(saida.style, { display: 'block', width: '100%', height: '100%' });
    host.appendChild(saida);

    // --------------------------------------------------------------- cena
    const cena = new Scene();
    const comuns = criarComuns();
    const sol = new DirectionalLight(0xffffff, 0);
    const lua = new DirectionalLight(new Color('#90a4c8'), 0);
    lua.position.set(DIRECAO_DO_LUAR[0] * 300, DIRECAO_DO_LUAR[1] * 300, DIRECAO_DO_LUAR[2] * 300);
    const hemi = new HemisphereLight(0xffffff, 0x444444, 1);
    cena.add(sol, sol.target, lua, lua.target, hemi);
    const camera = new PerspectiveCamera(FOV, 1, 20, 600);
    camera.layers.enable(CAMADA.torre);
    await fatia();

    const materiaisDaTorre = criarMateriaisDaTorre(comuns);
    const agua = materialDaAgua(comuns);
    const torre = construirTorre(materiaisDaTorre, agua);
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
    torre.recortar(null);
    fachada.recortar(null);
    fachada.selecionar(null);
    contorno.uniforms.uContornar.value = 1;

    // A base do holograma: um anel fino no chão, no verde do site, para o prédio não flutuar solto.
    const anelDaBase = new Mesh(
      new RingGeometry(23.4, 23.8, 160),
      new MeshBasicMaterial({ color: PALETA.sinal, transparent: true, opacity: 0.7, blending: AdditiveBlending, depthWrite: false, toneMapped: false }),
    );
    anelDaBase.rotation.x = -Math.PI / 2;
    anelDaBase.position.y = 0.05;
    cena.add(anelDaBase);
    await fatia();

    const materiais: Material[] = [
      ...Object.values(materiaisDaTorre).filter((m): m is Material => !Array.isArray(m)),
      agua, vidro.material, halos.material, contorno.material, anelMaterial, anelDaBase.material,
    ];

    // ------------------------------------------------------------- estado
    let estado: EstadoDoHolograma = inicial;
    let relogio = 0;
    let fimDasLuzes = Number.NEGATIVE_INFINITY;
    let giro = 0;
    let pedido = 0;
    let ultimoDesenho = 0;
    let perdido = false;
    let ladoGl = 0;
    let gravacao: Gravacao | null = null;
    const ouvintesDoContexto = new Set<(situacao: 'perdido' | 'restaurado') => void>();

    function aplicarAtmosfera() {
      const a = atmosferaPara(estado.hora, estado.estacao);
      comuns.uSolDir.value.set(...a.direcaoDoSol);
      // Fundo preto: sem céu (o vidro reflete preto), sem brilho de sol no céu, sem névoa nem estrelas.
      for (const cor of [comuns.uCeuZenite, comuns.uCeuHorizonte, comuns.uCeuOposto, comuns.uCeuChao, comuns.uBrilhoDoSol]) cor.value.setRGB(0, 0, 0);
      comuns.uLuzDoSol.value.setRGB(a.corDoSol[0] * a.intensidadeDoSol, a.corDoSol[1] * a.intensidadeDoSol, a.corDoSol[2] * a.intensidadeDoSol);
      comuns.uHemiCeu.value.setRGB(a.hemisferioCeu[0] * a.intensidadeHemisferio, a.hemisferioCeu[1] * a.intensidadeHemisferio, a.hemisferioCeu[2] * a.intensidadeHemisferio);
      comuns.uHemiChao.value.setRGB(a.hemisferioChao[0] * a.intensidadeHemisferio, a.hemisferioChao[1] * a.intensidadeHemisferio, a.hemisferioChao[2] * a.intensidadeHemisferio);
      comuns.uNoite.value = a.noite;
      comuns.uEstrelas.value = 0;
      comuns.uNevoa.value = 0;
      sol.color.setRGB(...a.corDoSol);
      sol.intensity = a.intensidadeDoSol;
      sol.position.set(a.direcaoDoSol[0] * 300, 30 + a.direcaoDoSol[1] * 300, a.direcaoDoSol[2] * 300);
      sol.target.position.set(0, 30, 0);
      sol.target.updateMatrixWorld();
      lua.intensity = a.intensidadeDoLuar;
      hemi.color.setRGB(...a.hemisferioCeu);
      hemi.groundColor.setRGB(...a.hemisferioChao);
      hemi.intensity = a.intensidadeHemisferio;
      renderer.toneMappingExposure = a.exposicao;
    }

    fachada.definirModo(estado.modo);
    contorno.uniforms.uBloqueios.value = estado.modo === 'hotel' ? 1 : 0;
    fimDasLuzes = fachada.aplicarLuzes(estado.luzes, relogio, 'instantaneo');
    fachada.aplicarDisponiveis(estado.disponiveis, estado.luzes);
    aplicarAtmosfera();

    // ------------------------------------------------------------- desenho
    function garantirLado(lado: number) {
      if (lado <= ladoGl) return;
      ladoGl = lado;
      renderer.setSize(lado, lado, false);
    }

    /** Desenha uma vista no canto de baixo do canvas do WebGL (no lado pedido) e devolve o recorte. */
    function renderizarVista(lado: number, azimute: number, ladoEmCss: number) {
      const a = azimute * RAD;
      const e = ELEVACAO * RAD;
      const horizontal = Math.cos(e) * DISTANCIA;
      camera.position.set(Math.sin(a) * horizontal, ALVO_Y + Math.sin(e) * DISTANCIA, -Math.cos(a) * horizontal);
      camera.lookAt(0, ALVO_Y, 0);
      camera.updateMatrixWorld();
      // A espessura do contorno das disponíveis acompanha o tamanho da vista.
      contorno.uniforms.uMundoPorPixel.value = (2 * Math.tan((FOV * RAD) / 2)) / Math.max(1, ladoEmCss);
      renderer.setViewport(0, 0, lado, lado);
      renderer.setScissor(0, 0, lado, lado);
      renderer.setScissorTest(true);
      renderer.render(cena, camera);
      renderer.setScissorTest(false);
      return { sx: 0, sy: ladoGl - lado, lado };
    }

    function desenhar() {
      const densidade = Math.max(1, Math.min(2, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1));
      const celulas = celulasDoHolograma(estado.layout, saida.width, saida.height, estado.girar180);
      const teto = estado.layout === 'vitrine' ? 2048 : 1400;
      garantirLado(Math.max(...celulas.map((c) => ladoDeDesenho(c, teto)), gravacao ? LADO_DO_VIDEO : 0));
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.fillStyle = '#000';
      ctx!.fillRect(0, 0, saida.width, saida.height);
      for (const celula of celulas) {
        const lado = ladoDeDesenho(celula, teto);
        const r = renderizarVista(lado, azimuteDaVista(giro, celula.volta), celula.lado / densidade);
        ctx!.save();
        ctx!.translate(celula.cx, celula.cy);
        ctx!.rotate(celula.giro * RAD);
        if (estado.espelhar) ctx!.scale(-1, 1);
        ctx!.drawImage(gl, r.sx, r.sy, r.lado, r.lado, -celula.lado / 2, -celula.lado / 2, celula.lado, celula.lado);
        ctx!.restore();
      }
      if (gravacao) {
        // O vídeo do ventilador: a vista da frente, sem espelho, na mesma volta da mesa.
        const r = renderizarVista(LADO_DO_VIDEO, azimuteDaVista(giro, 0), LADO_DO_VIDEO / 2);
        gravacao.ctx.drawImage(gl, r.sx, r.sy, r.lado, r.lado, 0, 0, LADO_DO_VIDEO, LADO_DO_VIDEO);
      }
    }

    function pedirQuadro() {
      if (pedido || descartada || perdido || document.hidden) return;
      pedido = requestAnimationFrame(quadro);
    }

    function quadro(agora: number) {
      pedido = 0;
      if (descartada || perdido) return;
      const girando = (estado.girando && estado.movimento) || gravacao !== null;
      const animando = girando || (estado.movimento && relogio < fimDasLuzes + 0.05);
      // 30 quadros por segundo bastam: a mesa gira devagar.
      if (animando && ultimoDesenho && agora - ultimoDesenho < QUADRO_MS) {
        pedirQuadro();
        return;
      }
      // Gravando, o tempo é o real (a volta dura o mesmo em PC lento); na tela, um quadro atrasado
      // não vira um salto.
      const dt = ultimoDesenho ? Math.min(gravacao ? 1 : 0.25, (agora - ultimoDesenho) / 1000) : 1 / 30;
      ultimoDesenho = animando ? agora : 0;
      if (estado.movimento) relogio += dt;
      comuns.uTempo.value = relogio;
      const passo = girando ? (360 / VOLTA_EM_SEGUNDOS) * dt : 0;
      giro = (giro + passo) % 360;
      desenhar();
      if (gravacao) {
        gravacao.girado += passo;
        gravacao.aoProgresso?.(Math.min(1, gravacao.girado / 360));
        if (gravacao.girado >= 360 && gravacao.gravador.state === 'recording') gravacao.gravador.stop();
      }
      if (animando) pedirQuadro();
    }

    // ------------------------------------------------------------- tamanho
    function redimensionar() {
      const densidade = Math.max(1, Math.min(2, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1));
      const w = Math.max(1, Math.round(host.clientWidth * densidade));
      const h = Math.max(1, Math.round(host.clientHeight * densidade));
      if (w === saida.width && h === saida.height) return;
      saida.width = w;
      saida.height = h;
      pedirQuadro();
    }
    redimensionar();
    const observador = new ResizeObserver(redimensionar);
    observador.observe(host);
    const aoMudarVisibilidade = () => {
      if (!document.hidden) {
        ultimoDesenho = 0;
        pedirQuadro();
      }
    };
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    const aoPerder = (e: Event) => {
      e.preventDefault();
      perdido = true;
      cancelAnimationFrame(pedido);
      pedido = 0;
      ouvintesDoContexto.forEach((f) => f('perdido'));
    };
    const aoRecuperar = () => {
      perdido = false;
      ultimoDesenho = 0;
      ouvintesDoContexto.forEach((f) => f('restaurado'));
      pedirQuadro();
    };
    gl.addEventListener('webglcontextlost', aoPerder);
    gl.addEventListener('webglcontextrestored', aoRecuperar);

    // ----------------------------------------------- compilação e 1º quadro
    garantirLado(512);
    camera.position.set(0, ALVO_Y, -DISTANCIA);
    camera.lookAt(0, ALVO_Y, 0);
    await renderer.compileAsync(cena, camera);
    if (descartada) throw new Error('O holograma foi descartado durante a carga.');
    desenhar();
    pedirQuadro();

    const cenaHolograma: CenaHolograma = {
      aplicar(novo) {
        const anterior = estado;
        estado = novo;
        const mudouModo = anterior.modo !== novo.modo;
        if (mudouModo) {
          fachada.definirModo(novo.modo);
          contorno.uniforms.uBloqueios.value = novo.modo === 'hotel' ? 1 : 0;
        }
        if (mudouModo || !iguais(anterior.luzes, novo.luzes)) {
          fimDasLuzes = Math.max(fimDasLuzes, fachada.aplicarLuzes(novo.luzes, relogio, novo.movimento && !mudouModo ? 'fade' : 'instantaneo'));
        }
        if (mudouModo || !iguais(anterior.disponiveis, novo.disponiveis) || !iguais(anterior.luzes, novo.luzes)) {
          fachada.aplicarDisponiveis(novo.disponiveis, novo.luzes);
        }
        if (anterior.hora !== novo.hora || anterior.estacao !== novo.estacao) aplicarAtmosfera();
        ultimoDesenho = 0;
        pedirQuadro();
      },
      girarUmPasso() {
        giro = (giro + 90) % 360;
        pedirQuadro();
      },
      gravar(aoProgresso) {
        if (gravacao || typeof MediaRecorder === 'undefined') return Promise.resolve(null);
        const tipo = TIPOS_DE_VIDEO.find((t) => MediaRecorder.isTypeSupported(t));
        const tela = document.createElement('canvas');
        tela.width = LADO_DO_VIDEO;
        tela.height = LADO_DO_VIDEO;
        const ctxDoVideo = tela.getContext('2d', { alpha: false });
        if (!tipo || !ctxDoVideo || typeof tela.captureStream !== 'function') return Promise.resolve(null);
        ctxDoVideo.fillStyle = '#000';
        ctxDoVideo.fillRect(0, 0, LADO_DO_VIDEO, LADO_DO_VIDEO);
        const fluxo = tela.captureStream(30);
        const gravador = new MediaRecorder(fluxo, { mimeType: tipo, videoBitsPerSecond: 10_000_000 });
        const pedacos: Blob[] = [];
        gravador.ondataavailable = (e) => {
          if (e.data.size > 0) pedacos.push(e.data);
        };
        return new Promise<VideoDoHolograma | null>((resolver) => {
          gravador.onstop = () => {
            fluxo.getTracks().forEach((t) => t.stop());
            const cancelada = gravacao?.cancelada ?? true;
            gravacao = null;
            if (cancelada || pedacos.length === 0) {
              resolver(null);
              return;
            }
            const mime = tipo.split(';')[0]!;
            resolver({ arquivo: new Blob(pedacos, { type: mime }), extensao: mime === 'video/mp4' ? 'mp4' : 'webm' });
          };
          gravacao = { ctx: ctxDoVideo, gravador, girado: 0, cancelada: false, aoProgresso };
          gravador.start(1000);
          ultimoDesenho = 0;
          pedirQuadro();
        });
      },
      pararGravacao() {
        if (!gravacao) return;
        gravacao.cancelada = true;
        if (gravacao.gravador.state === 'recording') gravacao.gravador.stop();
      },
      aoMudarContexto(ouvinte) {
        ouvintesDoContexto.add(ouvinte);
        return () => {
          ouvintesDoContexto.delete(ouvinte);
        };
      },
      descartar() {
        if (descartada) return;
        descartada = true;
        cancelAnimationFrame(pedido);
        if (gravacao) {
          gravacao.cancelada = true;
          if (gravacao.gravador.state === 'recording') gravacao.gravador.stop();
        }
        observador.disconnect();
        document.removeEventListener('visibilitychange', aoMudarVisibilidade);
        gl.removeEventListener('webglcontextlost', aoPerder);
        gl.removeEventListener('webglcontextrestored', aoRecuperar);
        torre.descartar();
        fachada.descartar();
        anelDaBase.geometry.dispose();
        for (const m of materiais) descartarMaterial(m);
        for (const t of materiaisDaTorre.texturas) t.dispose();
        renderer.renderLists.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        saida.remove();
      },
    };
    return cenaHolograma;
  } catch (erro) {
    descartada = true;
    try {
      renderer.dispose();
      renderer.forceContextLoss();
    } catch {
      // Contexto já perdido: nada a devolver.
    }
    saida.remove();
    throw erro;
  }
};
