import * as T from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { IDS_DOS_COMODOS, PLANTA, type ComodoId } from '@/lib/torrelio/planta';
import { direcaoDoSol, posicaoDoSol } from '@/lib/torrelio/sol';
import { cotasDesenhadas } from '../desenho';
import { criarCamera } from './camera-apartamento';
import type { CenaApartamento, EstadoDoApartamento, Projecao } from './contrato';
import * as G from './geometria-apartamento';
import { criarMateriais, criarUniformes } from './materiais-apartamento';
import { geometriaDoMovel, vidroDoBox } from './moveis-3d';

/**
 * A maquete do apartamento em three.js, com renderizador próprio (separado da torre).
 * Desenha sob demanda: só há quadro quando algo muda ou anima, e nada fora da tela.
 * Orçamento: ≤ 15 chamadas, ≤ 60 mil triângulos, sombra de 1024.
 */

const pausa = () => new Promise<void>((seguir) => window.setTimeout(seguir, 0));
const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const linear = (hex: number) => new T.Color().setHex(hex, T.SRGBColorSpace);
/** Na planta, as paredes baixam até aqui (o que passa comprime a 2%: o corte fica em ~0,12 m). */
const ALTURA_NA_PLANTA = 0.1;

/** Pontos de luz das lâmpadas, no desenho: acendem depois do pôr do sol. */
const LAMPADAS: readonly (readonly [number, number])[] = [
  [1.85, 2.0],
  [4.8, 1.7],
  [7.45, 1.7],
  [1.9, 5.4],
];

export async function criarCenaApartamento(host: HTMLElement, inicial: EstadoDoApartamento): Promise<CenaApartamento> {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  // O gerador do pôster (`tools/torrelio-poster-apartamento.mjs`) pede um canvas mais denso.
  const dprMaximo = (window as Window & { __dprDaMaquete?: number }).__dprDaMaquete ?? 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprMaximo));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');

  const cena = new T.Scene();
  const raiz = new T.Group();
  cena.add(raiz);
  const geometrias: T.BufferGeometry[] = [];
  const guardar = <G extends T.BufferGeometry>(g: G) => {
    geometrias.push(g);
    return g;
  };

  // Ambiente de estúdio (PMREM), refeito se a GPU devolver o contexto.
  let ambiente: T.WebGLRenderTarget | null = null;
  const gerarAmbiente = () => {
    ambiente?.dispose();
    const sala = new RoomEnvironment();
    const pmrem = new T.PMREMGenerator(renderer);
    ambiente = pmrem.fromScene(sala, 0.04);
    cena.environment = ambiente.texture;
    sala.dispose();
    pmrem.dispose();
  };
  gerarAmbiente();

  const u = criarUniformes();
  const m = criarMateriais(u);
  await pausa();

  const pisos = new T.Mesh(guardar(G.geometriaDosPisos()), m.pisos);
  pisos.receiveShadow = true;
  const laje = new T.Mesh(guardar(G.geometriaDaLaje()), m.laje);
  laje.receiveShadow = true;
  const paredes = new T.Mesh(guardar(G.geometriaDasParedes()), m.paredes);
  paredes.receiveShadow = true;
  const sombraSo = new T.Mesh(guardar(G.geometriaDaSombra()), m.sombraSo);
  sombraSo.castShadow = true;
  raiz.add(pisos, laje, paredes, sombraSo);
  await pausa();

  const moveis = new T.Mesh(guardar(mesclarMoveis()), m.moveis);
  moveis.castShadow = true;
  moveis.receiveShadow = true;
  const vidrosDosBoxes = PLANTA.moveis.filter((x) => x.tipo === 'box').map((x) => vidroDoBox(x, G.paraMundo));
  const vidros = new T.Mesh(guardar(G.geometriaDosVidros(vidrosDosBoxes)), m.vidros);
  vidros.renderOrder = 2;
  raiz.add(moveis, vidros);
  await pausa();

  const textura = G.texturaDaSombra();
  const contatos = G.sombrasDeContato();
  const materialDoContato = new T.MeshBasicMaterial({ color: 0x000000, map: textura, transparent: true, opacity: 0.34, depthWrite: false });
  const quad = guardar(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
  const sombras = new T.InstancedMesh(quad, materialDoContato, contatos.length);
  const auxiliar = new T.Object3D();
  contatos.forEach((s, i) => {
    auxiliar.position.set(s.x, 0.006, s.z);
    auxiliar.rotation.set(0, s.angulo, 0);
    auxiliar.scale.set(s.largura, 1, s.profundidade);
    auxiliar.updateMatrix();
    sombras.setMatrixAt(i, auxiliar.matrix);
  });
  sombras.renderOrder = 1;
  const linhas = new T.LineSegments(guardar(G.geometriaDasLinhas()), m.linhas);
  linhas.renderOrder = 3;
  const contornos = new T.LineSegments(guardar(G.geometriaDosContornos()), m.contornos);
  contornos.renderOrder = 4;
  raiz.add(sombras, linhas, contornos);

  const chao = new T.Mesh(guardar(new T.PlaneGeometry(40, 40).rotateX(-Math.PI / 2)), m.chao);
  chao.position.y = -0.185;
  chao.receiveShadow = true;
  cena.add(chao);

  // ------------------------------------------------------------------ luz
  const ceu = new T.HemisphereLight(linear(0xe6ecea), linear(0x45463f), 1);
  const sol = new T.DirectionalLight(0xffffff, 2.6);
  sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024);
  Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 70 });
  sol.shadow.bias = -0.0006;
  sol.shadow.normalBias = 0.03;
  sol.shadow.radius = 3;
  cena.add(ceu, sol, sol.target);
  const lampadas = LAMPADAS.map(([x, y]) => {
    const luz = new T.PointLight(linear(0xffc98a), 0, 7, 2);
    const [lx, lz] = G.paraMundo(x, y);
    luz.position.set(lx, 2.15, lz);
    raiz.add(luz);
    return luz;
  });

  // -------------------------------------------------------------- câmera
  const camera = criarCamera(inicial);
  let estado = inicial;
  let largura = 1;
  let altura = 1;

  const aplicarLuz = () => {
    const { elevacao } = posicaoDoSol(estado.hora, estado.estacao);
    const [lx, ly, lz] = direcaoDoSol(estado.hora, estado.estacao);
    const b = (estado.norteGraus * Math.PI) / 180;
    // O sol vem no sistema da torre (+x leste, −z norte); gira até o norte do desenho.
    sol.position.set(lx * Math.cos(b) - lz * Math.sin(b), ly, lx * Math.sin(b) + lz * Math.cos(b)).multiplyScalar(30);
    const dia = suave(-1, 6, elevacao);
    const noite = 1 - suave(-5, 1, elevacao);
    sol.intensity = 3.4 * dia;
    sol.color.copy(linear(0xffb06a)).lerp(linear(0xfff3e2), suave(4, 28, elevacao));
    // Hemisférica e ambiente em unidades físicas: perto de π devolve o albedo nas áreas sem sol.
    ceu.intensity = 2.3 - 1.85 * noite;
    ceu.color.copy(linear(0xe6ecea)).lerp(linear(0x52627a), noite);
    cena.environmentIntensity = 0.5 - 0.38 * noite;
    lampadas.forEach((l) => (l.intensity = 5.5 * noite));
    renderer.shadowMap.needsUpdate = true;
  };

  const aplicarFoco = () => {
    const indice = (id: ComodoId | null) => (id ? IDS_DOS_COMODOS.indexOf(id) : -1);
    if (estado.selecionado) u.uSelecionado.value = indice(estado.selecionado);
    if (estado.destacado) u.uDestaque.value = indice(estado.destacado);
  };

  // ------------------------------------------------------------- laço
  let quadroPedido = 0;
  let visivel = true;
  let perdido = false;
  let descartada = false;
  let ultimo = performance.now();
  const diagnostico = { quadros: 0, chamadas: 0, triangulos: 0 };
  const ouvintes = {
    escolher: new Set<(id: ComodoId | null) => void>(),
    passar: new Set<(id: ComodoId | null) => void>(),
    rotulos: new Set<(c: ReadonlyMap<ComodoId, Projecao>, cotas: readonly Projecao[]) => void>(),
    rumo: new Set<(graus: number) => void>(),
    contexto: new Set<(e: 'perdido' | 'restaurado') => void>(),
  };

  const pedirQuadro = () => {
    if (quadroPedido || descartada || perdido || !visivel) return;
    quadroPedido = requestAnimationFrame(desenhar);
  };

  const ponto = new T.Vector3();
  const projetar = (x: number, y: number, z: number): Projecao => {
    ponto.set(x, y, z).applyMatrix4(raiz.matrixWorld).project(camera.camera);
    const px = ((ponto.x + 1) / 2) * largura;
    const py = ((1 - ponto.y) / 2) * altura;
    return { x: px, y: py, visivel: ponto.z < 1 && px > -20 && px < largura + 20 && py > -20 && py < altura + 20 };
  };
  const cotas = cotasDesenhadas();
  const avisarProjecoes = () => {
    const alturaDoRotulo = estado.modo === 'planta' ? 0.05 : 1.15;
    const comodos = new Map<ComodoId, Projecao>();
    for (const c of PLANTA.comodos) {
      const [x, z] = G.paraMundo(c.rotulo[0], c.rotulo[1]);
      comodos.set(c.id, projetar(x, alturaDoRotulo, z));
    }
    const textos = cotas.map((c) => {
      const [x, z] = G.paraMundo(c.meio[0], c.meio[1]);
      return projetar(x, -0.17, z);
    });
    ouvintes.rotulos.forEach((f) => f(comodos, textos));
    ouvintes.rumo.forEach((f) => f((((estado.norteGraus + camera.azimuteEmGraus()) % 360) + 360) % 360));
  };

  function desenhar(agora: number) {
    quadroPedido = 0;
    if (descartada || perdido) return;
    const dt = Math.min(0.05, Math.max(0, (agora - ultimo) / 1000));
    ultimo = agora;
    const k = estado.movimento ? 1 - Math.exp(-dt * 5.5) : 1;
    let anima = camera.passo(k);
    const alvoDaAltura = estado.modo === 'planta' ? ALTURA_NA_PLANTA : PLANTA.alturaDoCorte;
    const aproximar = (atual: number, alvo: number) => {
      const proximo = Math.abs(alvo - atual) < 0.002 ? alvo : atual + (alvo - atual) * k;
      if (proximo !== alvo) anima = true;
      return proximo;
    };
    u.uAltura.value = aproximar(u.uAltura.value, alvoDaAltura);
    m.linhas.opacity = aproximar(m.linhas.opacity, estado.modo === 'planta' ? 0.95 : 0);
    linhas.visible = m.linhas.opacity > 0.01;
    u.uForcaSelecionado.value = aproximar(u.uForcaSelecionado.value, estado.selecionado ? 1 : 0);
    u.uForcaDestaque.value = aproximar(u.uForcaDestaque.value, estado.destacado && estado.destacado !== estado.selecionado ? 1 : 0);
    raiz.updateMatrixWorld();
    renderer.render(cena, camera.camera);
    diagnostico.quadros += 1;
    diagnostico.chamadas = renderer.info.render.calls;
    diagnostico.triangulos = renderer.info.render.triangles;
    host.dataset['quadros'] = String(diagnostico.quadros);
    host.dataset['chamadas'] = String(diagnostico.chamadas);
    host.dataset['triangulos'] = String(diagnostico.triangulos);
    avisarProjecoes();
    if (anima) pedirQuadro();
  }

  const redimensionar = () => {
    largura = Math.max(1, host.clientWidth);
    altura = Math.max(1, host.clientHeight);
    renderer.setSize(largura, altura, false);
    camera.redimensionar(largura / altura);
    camera.pousar(estado, false);
    pedirQuadro();
  };
  const observadorDeTamanho = new ResizeObserver(redimensionar);
  const observadorDeTela = new IntersectionObserver(([entrada]) => {
    visivel = Boolean(entrada?.isIntersecting) && !document.hidden;
    pedirQuadro();
  });
  const aoMudarAba = () => {
    visivel = !document.hidden;
    pedirQuadro();
  };

  // ----------------------------------------------------------- ponteiro
  const raio = new T.Raycaster();
  const ndc = new T.Vector2();
  const ponteiros = new Map<number, { x: number; y: number }>();
  let arrasto: { x: number; y: number; moveu: boolean } | null = null;
  let distanciaDaPinca = 0;
  let passarPendente: PointerEvent | null = null;
  let ultimoPassado: ComodoId | null = null;

  const comodoNoPonteiro = (e: PointerEvent): ComodoId | null => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raio.setFromCamera(ndc, camera.camera);
    const acerto = raio.intersectObject(pisos, false)[0];
    if (!acerto?.face) return null;
    const indice = (pisos.geometry.getAttribute('aComodo') as T.BufferAttribute).getX(acerto.face.a);
    return IDS_DOS_COMODOS[Math.round(indice)] ?? null;
  };

  const aoApertar = (e: PointerEvent) => {
    ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ponteiros.size === 1) arrasto = { x: e.clientX, y: e.clientY, moveu: false };
    if (ponteiros.size === 2) {
      const [a, b] = [...ponteiros.values()];
      distanciaDaPinca = Math.hypot(a!.x - b!.x, a!.y - b!.y);
    }
  };
  const aoMover = (e: PointerEvent) => {
    const antes = ponteiros.get(e.pointerId);
    if (antes && ponteiros.size === 2) {
      ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...ponteiros.values()];
      const distancia = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (distanciaDaPinca > 0) camera.zoom(distanciaDaPinca / distancia);
      distanciaDaPinca = distancia;
      if (arrasto) arrasto.moveu = true;
      pedirQuadro();
      return;
    }
    if (antes && arrasto) {
      const dx = e.clientX - antes.x;
      const dy = e.clientY - antes.y;
      ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!arrasto.moveu && Math.hypot(e.clientX - arrasto.x, e.clientY - arrasto.y) > 5) {
        arrasto.moveu = true;
        canvas.setPointerCapture(e.pointerId);
      }
      if (arrasto.moveu && estado.modo === 'maquete') {
        camera.orbitar(dx, dy);
        pedirQuadro();
      }
      return;
    }
    if (e.pointerType === 'mouse') {
      if (!passarPendente) requestAnimationFrame(passarAgora);
      passarPendente = e;
    }
  };
  const passarAgora = () => {
    const e = passarPendente;
    passarPendente = null;
    if (!e || descartada) return;
    const id = comodoNoPonteiro(e);
    canvas.style.cursor = id ? 'pointer' : estado.modo === 'maquete' ? 'grab' : '';
    if (id === ultimoPassado) return;
    ultimoPassado = id;
    ouvintes.passar.forEach((f) => f(id));
  };
  const aoSoltar = (e: PointerEvent) => {
    ponteiros.delete(e.pointerId);
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (arrasto && !arrasto.moveu && ponteiros.size === 0) {
      const id = comodoNoPonteiro(e);
      ouvintes.escolher.forEach((f) => f(id));
    }
    if (ponteiros.size === 0) arrasto = null;
  };
  const aoCancelar = (e: PointerEvent) => {
    ponteiros.delete(e.pointerId);
    if (ponteiros.size === 0) arrasto = null;
  };
  const aoSair = () => {
    if (ultimoPassado === null) return;
    ultimoPassado = null;
    ouvintes.passar.forEach((f) => f(null));
  };
  // A roda sozinha rola a página; zoom só com Ctrl (ou a pinça do trackpad, que chega assim).
  const aoRodar = (e: WheelEvent) => {
    if (!e.ctrlKey || estado.modo !== 'maquete') return;
    e.preventDefault();
    camera.zoom(Math.exp(e.deltaY * 0.01));
    pedirQuadro();
  };

  // ------------------------------------------------------------ contexto
  const aoPerder = (e: Event) => {
    e.preventDefault();
    perdido = true;
    cancelAnimationFrame(quadroPedido);
    quadroPedido = 0;
    ouvintes.contexto.forEach((f) => f('perdido'));
  };
  const aoRecuperar = () => {
    perdido = false;
    gerarAmbiente();
    renderer.shadowMap.needsUpdate = true;
    ouvintes.contexto.forEach((f) => f('restaurado'));
    pedirQuadro();
  };

  // ----------------------------------------------------------- montagem
  raiz.scale.x = inicial.espelhada ? -1 : 1;
  aplicarFoco();
  aplicarLuz();
  host.appendChild(canvas);
  largura = Math.max(1, host.clientWidth);
  altura = Math.max(1, host.clientHeight);
  renderer.setSize(largura, altura, false);
  camera.redimensionar(largura / altura);
  camera.pousar(inicial, true);
  camera.passo(1);
  u.uAltura.value = inicial.modo === 'planta' ? ALTURA_NA_PLANTA : PLANTA.alturaDoCorte;
  m.linhas.opacity = inicial.modo === 'planta' ? 0.95 : 0;
  await renderer.compileAsync(cena, camera.camera);
  if (!renderer.getContext()) throw new Error('Sem contexto WebGL.');

  observadorDeTamanho.observe(host);
  observadorDeTela.observe(host);
  document.addEventListener('visibilitychange', aoMudarAba);
  canvas.addEventListener('pointerdown', aoApertar);
  canvas.addEventListener('pointermove', aoMover);
  canvas.addEventListener('pointerup', aoSoltar);
  canvas.addEventListener('pointercancel', aoCancelar);
  canvas.addEventListener('pointerleave', aoSair);
  canvas.addEventListener('wheel', aoRodar, { passive: false });
  canvas.addEventListener('webglcontextlost', aoPerder);
  canvas.addEventListener('webglcontextrestored', aoRecuperar);
  desenhar(performance.now());

  const ouvir = <F>(conjunto: Set<F>) => (f: F) => {
    conjunto.add(f);
    pedirQuadro();
    return () => {
      conjunto.delete(f);
    };
  };

  return {
    diagnostico,
    aplicar(proximo) {
      const anterior = estado;
      estado = proximo;
      if (proximo.espelhada !== anterior.espelhada) {
        raiz.scale.x = proximo.espelhada ? -1 : 1;
        renderer.shadowMap.needsUpdate = true;
      }
      if (proximo.hora !== anterior.hora || proximo.estacao !== anterior.estacao || proximo.norteGraus !== anterior.norteGraus || proximo.espelhada !== anterior.espelhada) aplicarLuz();
      aplicarFoco();
      camera.pousar(proximo, proximo.modo !== anterior.modo || proximo.giro !== anterior.giro || proximo.espelhada !== anterior.espelhada);
      if (!proximo.movimento) camera.passo(1);
      pedirQuadro();
    },
    aoEscolher: ouvir(ouvintes.escolher),
    aoPassar: ouvir(ouvintes.passar),
    aoProjetarRotulos: ouvir(ouvintes.rotulos),
    aoMudarRumo: ouvir(ouvintes.rumo),
    aoMudarContexto: ouvir(ouvintes.contexto),
    descartar() {
      if (descartada) return;
      descartada = true;
      cancelAnimationFrame(quadroPedido);
      observadorDeTamanho.disconnect();
      observadorDeTela.disconnect();
      document.removeEventListener('visibilitychange', aoMudarAba);
      canvas.removeEventListener('pointerdown', aoApertar);
      canvas.removeEventListener('pointermove', aoMover);
      canvas.removeEventListener('pointerup', aoSoltar);
      canvas.removeEventListener('pointercancel', aoCancelar);
      canvas.removeEventListener('pointerleave', aoSair);
      canvas.removeEventListener('wheel', aoRodar);
      canvas.removeEventListener('webglcontextlost', aoPerder);
      canvas.removeEventListener('webglcontextrestored', aoRecuperar);
      Object.values(ouvintes).forEach((conjunto) => conjunto.clear());
      geometrias.forEach((g) => g.dispose());
      Object.values(m).forEach((material) => material.dispose());
      materialDoContato.dispose();
      textura.dispose();
      sombras.dispose();
      ambiente?.dispose();
      sol.shadow.map?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

function mesclarMoveis(): T.BufferGeometry {
  const pecas = PLANTA.moveis.map((m) => geometriaDoMovel(m, G.paraMundo));
  const geometria = new T.BufferGeometry();
  // Todas as peças têm posição, normal e cor: a mescla é direta.
  const total = pecas.reduce((n, g) => n + g.getAttribute('position').count, 0);
  for (const nome of ['position', 'normal', 'color'] as const) {
    const destino = new Float32Array(total * 3);
    let deslocamento = 0;
    for (const g of pecas) {
      const origem = g.getAttribute(nome).array as Float32Array;
      destino.set(origem, deslocamento);
      deslocamento += origem.length;
    }
    geometria.setAttribute(nome, new T.BufferAttribute(destino, 3));
  }
  // Os móveis baixam com as paredes na planta: base 0 em todas as peças.
  geometria.setAttribute('aBase', new T.BufferAttribute(new Float32Array(total), 1));
  pecas.forEach((g) => g.dispose());
  return geometria;
}
