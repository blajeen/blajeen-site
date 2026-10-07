import {
  Mesh, NeutralToneMapping, PerspectiveCamera, PlaneGeometry, Quaternion, Raycaster, Scene, ShaderMaterial, Sprite, SRGBColorSpace, Vector2, Vector3,
  WebGLRenderer, type Color, type Texture,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { PortaId } from '@/lib/carrelio/tipos';
import { avancar, anguloDaPeca, cortina, DURACAO, intensidadeDasLuzes, interpolarNumero, Transicao } from './animacao';
import type { CenaCarro, EstadoVisualCarro, OpcoesDoCarro, Projecao } from './contrato';
import { acabamentoDaCor, corDaPintura, misturar, type Rgb } from './cores';
import { CORES_DA_NOITE, CORES_DO_ESTUDIO, criarChao, criarFundo, criarUniformesDoPalco, gerarAmbiente } from './estudio';
import { exportarCarroEmUsdz } from './exportacao';
import { pontosDaVista, validarManifesto } from './manifesto';
import { criarUniformesDaPintura, materialDoHalo, pintar, texturaDoHalo, COR_DA_LANTERNA, COR_DO_FAROL } from './materiais';
import { aplicarVariante, montarCarro, type CarroMontado } from './montagem';
import { criarSombraDeContato } from './sombra';
import {
  azimuteDaDirecao, direcaoDoOlhar, FOV_DE_DENTRO, fovDeDentro, fovDeFora, limitarElevacao, limitarInclinacao, limitesDoRaio, MolaVetorial,
  olharPara, pertoDe, poseDeAbertura, posicaoNaOrbita, VOLTA_EM_SEGUNDOS, type Caixa, type Lente,
} from './orbita';
import {
  ajustesDoCarro, desenhaSemGpu, escolherNivel, lerSinais, MedidorDeQuadros, nivelAbaixo, type AjustesDoCarro, type NivelDeQualidade,
} from './qualidade';

/**
 * A cena do carro: um `WebGLRenderer` próprio, desenho sob demanda e o contrato `CenaCarro`.
 *
 * - Laço: um rAF só quando há o que animar (mola da câmera, portas, troca de cor, luzes, ambiente,
 *   cortina) ou com a mesa girando. Fora da tela ou com a aba oculta, nada desenha.
 * - Sem movimento: portas, cor, luzes e câmera vão direto ao fim. O giro da mesa é escolha de quem
 *   olha e continua valendo.
 * - Montagem em fatias com `await`, texturas enviadas aos poucos, `compileAsync` e o primeiro quadro
 *   antes de resolver a promessa.
 */

const PERTO_DE_FORA = 0.1;
const PERTO_DE_DENTRO = 0.02;
const LONGE = 160;
const OMEGA = { transicao: 5, arrasto: 14, zoom: 7, dentro: 12 } as const;
const GIRO_POR_PIXEL = 0.34;
const ELEVACAO_POR_PIXEL = 0.16;
const OLHAR_POR_PIXEL = 0.2;
const LIMIAR_DO_ARRASTO = 6;
/** O vidro de fora é escuro; de dentro, quase claro (a vista não pode ficar preta). */
const OPACIDADE_DO_VIDRO = { fora: 0.55, dentro: 0.14 } as const;
/** Intensidade dos reflexos do estúdio e exposição, por ambiente. */
const AMBIENTE = {
  // Exposição conferida no QA: a média da porta (de cima a baixo) fica no tom da amostra da cor.
  estudio: { reflexos: 1, exposicao: 1.15 },
  noite: { reflexos: 0.2, exposicao: 1.1 },
} as const;
const PRETO_DO_TETO = '#0c0d0f';

/** Opções internas (pôster e QA): nível de qualidade fixo. */
export type OpcoesInternas = OpcoesDoCarro & { qualidade?: NivelDeQualidade };

export type CenaCarroInterna = CenaCarro & {
  readonly interno: {
    renderer: WebGLRenderer;
    cena: Scene;
    camera: PerspectiveCamera;
    readonly ajustes: AjustesDoCarro;
    carro: CarroMontado;
    /** Desenha um quadro agora (capturas). */
    desenhar(): void;
    estaAnimando(): boolean;
    /** O ponto do carro sob um pixel do palco (QA). */
    tocar(x: number, y: number): { ponto: [number, number, number]; parte: number } | null;
    /** Pose da órbita, para o QA: azimute, elevação e fator do raio do enquadramento. */
    orbitar(azimute: number, elevacao: number, fatorDoRaio?: number): void;
    /** Tempos da carga, em ms. */
    tempos: Record<string, number>;
    depurar(): Record<string, unknown>;
  };
};

type Pintura = { cor: Rgb; metal: number; rugosidade: number; flocos: number };
type Luzes = { farol: number; lanterna: number; halo: number; poca: number };

const misturarPintura = (a: Pintura, b: Pintura, t: number): Pintura => ({
  cor: misturar(a.cor, b.cor, t),
  metal: interpolarNumero(a.metal, b.metal, t),
  rugosidade: interpolarNumero(a.rugosidade, b.rugosidade, t),
  flocos: interpolarNumero(a.flocos, b.flocos, t),
});

const misturarLuzes = (a: Luzes, b: Luzes, t: number): Luzes => ({
  farol: interpolarNumero(a.farol, b.farol, t),
  lanterna: interpolarNumero(a.lanterna, b.lanterna, t),
  halo: interpolarNumero(a.halo, b.halo, t),
  poca: interpolarNumero(a.poca, b.poca, t),
});

function pinturaDe(hex: string): Pintura {
  const a = acabamentoDaCor(hex);
  return { cor: corDaPintura(hex, a.metalico), metal: a.metalico, rugosidade: a.rugosidade, flocos: a.flocos };
}

const fatia = () =>
  new Promise<void>((resolver) => {
    const agendador = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (agendador?.yield) void agendador.yield().then(resolver);
    else setTimeout(resolver, 0);
  });

const agora = () => (typeof performance === 'undefined' ? Date.now() : performance.now());

/**
 * O nome da placa que o WebGL informa. O Firefox já dá o nome de verdade em `RENDERER`; o Chrome e o
 * Safari dão um genérico ("WebKit WebGL") e o de verdade só pela extensão de depuração.
 */
function nomeDoRenderizador(gl: WebGLRenderingContext | WebGL2RenderingContext): string {
  try {
    const nome = String(gl.getParameter(gl.RENDERER));
    if (!/webkit webgl/i.test(nome)) return nome;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : nome;
  } catch {
    return '';
  }
}

export async function criarCenaCarro(host: HTMLElement, opcoes: OpcoesInternas): Promise<CenaCarroInterna> {
  const inicio = agora();
  const tempos: Record<string, number> = {};
  const manifesto = opcoes.modelo;
  const nivel = opcoes.qualidade ?? escolherNivel(lerSinais());
  let ajustes = ajustesDoCarro(nivel, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
  let estado: EstadoVisualCarro = opcoes.estado;
  let movimento = estado.movimento;

  // ---------------------------------------------------------------- renderizador
  const renderer = new WebGLRenderer({ antialias: ajustes.msaa, alpha: false, stencil: false, powerPreference: 'default' });
  const canvas = renderer.domElement;
  let descartada = false;
  try {
    // Sem GPU (desenho por software), o nível cai para baixo antes de qualquer trabalho: o estúdio
    // em 512 e a sombra em 1024 levavam segundos. O MSAA já foi decidido na criação e fica.
    if (!opcoes.qualidade && ajustes.nivel !== 'baixo' && desenhaSemGpu(nomeDoRenderizador(renderer.getContext()))) {
      ajustes = { ...ajustesDoCarro('baixo', typeof devicePixelRatio === 'number' ? devicePixelRatio : 1), msaa: ajustes.msaa };
    }
    renderer.setPixelRatio(ajustes.dpr);
    renderer.outputColorSpace = SRGBColorSpace;
    // Neutral (Khronos PBR): as cores da pintura saem fiéis à amostra, sem o desbotado do AgX.
    renderer.toneMapping = NeutralToneMapping;
    renderer.setClearColor(CORES_DO_ESTUDIO.topo, 1);
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%', touchAction: 'pan-y', cursor: 'grab', outline: 'none' });
    host.appendChild(canvas);
  } catch (erro) {
    renderer.dispose();
    throw erro;
  }

  // Daqui em diante, qualquer falha tira o canvas e devolve a GPU antes de rejeitar: o pôster fica.
  let carro: CarroMontado | null = null;
  try {
    const cena = new Scene();
    const camera = new PerspectiveCamera(30, 16 / 9, PERTO_DE_FORA, LONGE);
    cena.add(camera);
    let largura = Math.max(1, host.clientWidth || 960);
    let altura = Math.max(1, host.clientHeight || 540);
    renderer.setSize(largura, altura, false);

    // ------------------------------------------------------------- estúdio
    let ambiente = gerarAmbiente(renderer, ajustes.reflexos);
    cena.environment = ambiente.textura;
    const palco = criarUniformesDoPalco();
    const chao = criarChao(palco);
    const fundo = criarFundo(palco);
    cena.add(fundo, chao);
    tempos['estudio'] = agora() - inicio;
    await fatia();

    // ---------------------------------------------------------------- carro
    const gltf = await new GLTFLoader().loadAsync(manifesto.url);
    if (descartada) throw new Error('A cena foi descartada durante a carga.');
    tempos['arquivo'] = agora() - inicio;
    for (const problema of validarManifesto(manifesto, gltf.parser.json)) console.warn(`[carrelio] ${problema}`);
    if (manifesto.variante) await aplicarVariante(gltf, manifesto.variante);
    await fatia();
    const uniformes = criarUniformesDaPintura();
    carro = await montarCarro(gltf, { manifesto, uniformes, fatia });
    const montado = carro;
    cena.add(montado.grupo);
    tempos['montagem'] = agora() - inicio;
    await fatia();

    const caixa: Caixa = { min: montado.caixa.min.toArray() as [number, number, number], max: montado.caixa.max.toArray() as [number, number, number] };

    // ------------------------------------------------------------- halos
    const texturaDosHalos = ajustes.halos ? texturaDoHalo() : null;
    const halos: { sprite: Sprite; normal: Vector3; parte: number; tipo: 'farol' | 'lanterna' }[] = [];
    if (texturaDosHalos) {
      for (const fonte of montado.fontesDeLuz) {
        const material = materialDoHalo(texturaDosHalos, fonte.tipo === 'farol' ? COR_DO_FAROL : COR_DA_LANTERNA);
        const sprite = new Sprite(material);
        const escala = montado.ajuste.escala;
        // Um pouco à frente da lente (para o halo não entrar na lataria) e do tamanho da luz.
        sprite.position.copy(fonte.naPeca).addScaledVector(fonte.normal, 0.07 / escala);
        const lado = Math.max(0.28, fonte.tamanho * (fonte.tipo === 'farol' ? 1.35 : 1.1)) / escala;
        sprite.scale.set(lado, lado * 0.62, 1);
        sprite.renderOrder = 10;
        sprite.visible = false;
        montado.partes[fonte.parte]!.add(sprite);
        halos.push({ sprite, normal: fonte.normal.clone(), parte: fonte.parte, tipo: fonte.tipo });
      }
    }
    // Poças de luz no chão: na frente dos faróis e atrás das lanternas.
    const farois = montado.fontesDeLuz.filter((f) => f.tipo === 'farol');
    const lanternas = montado.fontesDeLuz.filter((f) => f.tipo === 'lanterna');
    const frente = caixa.max[2];
    const tras = caixa.min[2];
    const pocaDe = (lista: typeof farois, z: number, padraoX: number) => {
      const esquerda = lista.filter((f) => f.noCarro.x >= 0).map((f) => f.noCarro.x);
      const direita = lista.filter((f) => f.noCarro.x < 0).map((f) => f.noCarro.x);
      const media = (xs: number[], padrao: number) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : padrao);
      return [media(esquerda, padraoX), z, media(direita, -padraoX), z] as const;
    };
    palco.uPocaFarois.value.set(...pocaDe(farois, frente + 1.25, 0.7));
    palco.uPocaLanternas.value.set(...pocaDe(lanternas, tras - 0.12, 0.6));
    palco.uElipse.value.set(Math.max(3.4, (caixa.max[0] - caixa.min[0]) * 1.9), Math.max(5, (caixa.max[2] - caixa.min[2]) * 1.4));

    // -------------------------------------------------------- sombra de contato
    const esconderParaSombra = () => {
      const antes = halos.map((h) => h.sprite.visible);
      for (const h of halos) h.sprite.visible = false;
      return () => halos.forEach((h, i) => (h.sprite.visible = antes[i]!));
    };
    const sombra = criarSombraDeContato(renderer, montado.grupo, montado.caixa, ajustes.sombraDeContato, esconderParaSombra);
    palco.uSombra.value = sombra.textura;
    palco.uAreaDaSombra.value.copy(sombra.area);
    tempos['sombra'] = agora() - inicio;
    await fatia();

    // --------------------------------------------------------- cortina
    const materialDaCortina = new ShaderMaterial({
      uniforms: { uOpacidade: { value: 0 }, uCor: { value: CORES_DO_ESTUDIO.topo.clone() } },
      vertexShader: 'void main() { gl_Position = vec4( position.xy * 2.0, 0.0, 1.0 ); }',
      fragmentShader: 'uniform float uOpacidade; uniform vec3 uCor; void main() { gl_FragColor = vec4( uCor, uOpacidade ); }',
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const cortinaMalha = new Mesh(new PlaneGeometry(1, 1), materialDaCortina);
    cortinaMalha.frustumCulled = false;
    cortinaMalha.renderOrder = 1000;
    cortinaMalha.visible = false;
    cena.add(cortinaMalha);

    // ---------------------------------------------------------------- estado
    const areaLivre = { esquerda: 0, direita: 0, topo: 0, base: 0 };
    const deslocamento = { x: 0, y: 0 };
    const lente = (): Lente => ({
      fovVertical: fovDeFora(largura / altura),
      aspecto: largura / altura,
      livreX: Math.max(0.3, (largura - areaLivre.esquerda - areaLivre.direita) / largura),
      livreY: Math.max(0.3, (altura - areaLivre.topo - areaLivre.base) / altura),
    });
    const abertura = () => poseDeAbertura(caixa, lente(), montado.silhueta);
    const pose0 = abertura();
    // [azimute, elevação, raio, alvo x, y, z]
    const orbita = new MolaVetorial([pose0.azimute, pose0.elevacao, pose0.raio, ...pose0.alvo], [0.01, 0.01, 0.001, 0.0005, 0.0005, 0.0005], OMEGA.transicao);
    let enquadrado = true;
    let raioDoEnquadramento = pose0.raio;
    // Olhar de dentro: [rumo, inclinação, fov]
    const olhar = new MolaVetorial([0, 0, 70], [0.01, 0.01, 0.01], OMEGA.dentro);
    let dentro: { ponto: EstadoVisualCarro['ponto']; olho: Vector3 } | null = null;
    let transicao: { t: number; trocar: () => void; trocou: boolean } | null = null;
    const pecas = new Map<PortaId, { progresso: number; alvo: number }>();
    for (const p of montado.pecas) pecas.set(p.id, { progresso: 0, alvo: 0 });
    let sombraSuja = false;
    const pintura = new Transicao<Pintura>(pinturaDe(estado.pintura), DURACAO.cor, misturarPintura);
    const tetoPintura = new Transicao<Pintura>(estado.tetoPreto ? pinturaDe(PRETO_DO_TETO) : pinturaDe(estado.pintura), DURACAO.cor, misturarPintura);
    const luzes = new Transicao<Luzes>(intensidadeDasLuzes(estado.farois, estado.ambiente === 'noite'), DURACAO.luzes, misturarLuzes);
    const noite = new Transicao<number>(estado.ambiente === 'noite' ? 1 : 0, DURACAO.ambiente, interpolarNumero);
    const fatorDeDentro = new Transicao<number>(0, DURACAO.cortina, interpolarNumero);
    let girando = estado.girando;
    let arrastando = false;
    const diagnostico = { quadros: 0, chamadas: 0, triangulos: 0 };

    // ------------------------------------------------------ aplicar o estado
    function aplicarPintura(p: Pintura) {
      if (montado.materiais.tinta) pintar(montado.materiais.tinta, p.cor, p.metal, p.rugosidade, p.flocos);
      uniformes.uCorDaPintura.value.setRGB(p.cor[0], p.cor[1], p.cor[2]);
      uniformes.uMetalDaPintura.value = p.metal;
      uniformes.uRugosidadeDaPintura.value = p.rugosidade;
    }

    const tetoDaRegiao = new Transicao<{ preto: number; vidro: number }>(
      { preto: estado.tetoPreto ? 1 : 0, vidro: estado.tetoPanoramico ? 1 : 0 },
      DURACAO.cor,
      (a, b, t) => ({ preto: interpolarNumero(a.preto, b.preto, t), vidro: interpolarNumero(a.vidro, b.vidro, t) }),
    );

    function aplicarTeto() {
      uniformes.uTetoPreto.value = tetoDaRegiao.valor.preto;
      uniformes.uTetoVidro.value = tetoDaRegiao.valor.vidro;
      const t = montado.teto;
      if (!t) return;
      const vidro = estado.tetoPanoramico;
      t.vidro.visible = vidro;
      t.tinta.visible = !vidro;
      const p = tetoPintura.valor;
      if (montado.materiais.tetoTinta) pintar(montado.materiais.tetoTinta, p.cor, p.metal, p.rugosidade, p.flocos);
    }

    function aplicarLuzes(l: Luzes) {
      for (const luz of montado.materiais.luzes) luz.acender(luz.tipo === 'farol' ? l.farol : l.lanterna);
      uniformes.uFarol.value = l.farol;
      uniformes.uLanterna.value = l.lanterna;
      palco.uPocaForca.value = l.poca;
      palco.uLanternaForca.value = l.lanterna;
    }

    const misturarCor = (a: Color, b: Color, t: number, alvo: Color) => alvo.copy(a).lerp(b, t);
    function aplicarAmbiente(n: number) {
      // Dentro do carro, a luz do estúdio chega pelos vidros: mais reflexo e mais exposição para os
      // materiais escuros do interior aparecerem.
      const d = fatorDeDentro.valor;
      cena.environmentIntensity = interpolarNumero(AMBIENTE.estudio.reflexos, AMBIENTE.noite.reflexos, n) * interpolarNumero(1, 2.4, d);
      renderer.toneMappingExposure = interpolarNumero(AMBIENTE.estudio.exposicao, AMBIENTE.noite.exposicao, n) * interpolarNumero(1, 1.2, d);
      misturarCor(CORES_DO_ESTUDIO.perto, CORES_DA_NOITE.perto, n, palco.uCorPerto.value);
      misturarCor(CORES_DO_ESTUDIO.longe, CORES_DA_NOITE.longe, n, palco.uCorLonge.value);
      misturarCor(CORES_DO_ESTUDIO.topo, CORES_DA_NOITE.topo, n, palco.uCorTopo.value);
      (materialDaCortina.uniforms['uCor']!.value as Color).copy(palco.uCorTopo.value);
      montado.materiais.vidro.opacidade.value = interpolarNumero(OPACIDADE_DO_VIDRO.fora, OPACIDADE_DO_VIDRO.dentro, fatorDeDentro.valor);
    }

    function alvoDasPecas() {
      for (const [id, peca] of pecas) {
        // Olhando o porta-malas por dentro, a tampa abre sozinha (a câmera está atrás do carro).
        const forcada = id === 'portaMalas' && dentro?.ponto === 'portaMalas';
        peca.alvo = estado.portas[id] || forcada ? 1 : 0;
      }
    }

    function posarPecas() {
      const q = new Quaternion();
      for (const p of montado.pecas) {
        const peca = pecas.get(p.id)!;
        q.setFromAxisAngle(p.eixo, (anguloDaPeca(peca.progresso, p.graus) * Math.PI) / 180);
        p.osso.quaternion.copy(p.repouso).multiply(q);
      }
    }

    aplicarPintura(pintura.valor);
    aplicarTeto();
    aplicarLuzes(luzes.valor);
    aplicarAmbiente(noite.valor);
    if (montado.rack.length) for (const r of montado.rack) r.visible = estado.rackDeTeto;

    // ------------------------------------------------------------- câmera
    function cameraDeDentro(ponto: EstadoVisualCarro['ponto']) {
      return manifesto.interior[ponto] ?? null;
    }

    function entrar(ponto: EstadoVisualCarro['ponto']) {
      const c = cameraDeDentro(ponto);
      if (!c) return;
      dentro = { ponto, olho: new Vector3(...c.olho) };
      const { rumo, inclinacao } = olharPara(c.olho, c.alvo);
      olhar.cortar([rumo, inclinacao, fovDeDentro(largura / altura)]);
      fatorDeDentro.ir(1, false);
      alvoDasPecas();
    }

    function sair() {
      dentro = null;
      fatorDeDentro.ir(0, false);
      alvoDasPecas();
    }

    /** Troca de vista: com movimento, pela cortina; sem, na hora. */
    function trocarVista(trocar: () => void) {
      if (!movimento) {
        trocar();
        transicao = null;
        cortinaMalha.visible = false;
        return;
      }
      transicao = { t: 0, trocar, trocou: false };
    }

    function irParaVista(vista: EstadoVisualCarro['vista'], ponto: EstadoVisualCarro['ponto']) {
      const querDentro = vista === 'dentro' && cameraDeDentro(ponto) !== null;
      if (querDentro && dentro?.ponto === ponto) return;
      if (!querDentro && !dentro) return;
      trocarVista(() => {
        if (querDentro) entrar(ponto);
        else sair();
      });
    }

    function atualizarProjecao() {
      camera.aspect = largura / altura;
      camera.fov = dentro ? olhar.atual[2]! : fovDeFora(largura / altura);
      camera.near = dentro ? PERTO_DE_DENTRO : PERTO_DE_FORA;
      if (Math.abs(deslocamento.x) > 0.25 || Math.abs(deslocamento.y) > 0.25) {
        camera.setViewOffset(largura, altura, -deslocamento.x, -deslocamento.y, largura, altura);
      } else {
        camera.clearViewOffset();
      }
      camera.updateProjectionMatrix();
    }

    function posicionarCamera() {
      if (dentro) {
        const [rumo, inclinacao] = olhar.atual as [number, number, number];
        const d = direcaoDoOlhar(rumo, inclinacao);
        camera.position.copy(dentro.olho);
        camera.lookAt(dentro.olho.x + d[0], dentro.olho.y + d[1], dentro.olho.z + d[2]);
        return;
      }
      const [azimute, elevacao, raio, ax, ay, az] = orbita.atual as [number, number, number, number, number, number];
      const p = posicaoNaOrbita({ azimute, elevacao, raio, alvo: [ax, ay, az] });
      camera.position.set(p[0], p[1], p[2]);
      camera.lookAt(ax, ay, az);
    }

    function irPara(destino: readonly number[], omega: number) {
      const d = [...destino];
      d[0] = pertoDe(orbita.atual[0]!, d[0]!);
      orbita.omega = omega;
      if (movimento) orbita.destino = d;
      else orbita.cortar(d);
    }

    function reenquadrar() {
      const pose = abertura();
      raioDoEnquadramento = pose.raio;
      if (!enquadrado || dentro) return;
      const destino = [...orbita.destino];
      destino[2] = pose.raio;
      destino[3] = pose.alvo[0];
      destino[4] = pose.alvo[1];
      destino[5] = pose.alvo[2];
      if (movimento) orbita.destino = destino;
      else orbita.cortar(destino);
    }

    // --------------------------------------------------------- projeções
    const ouvintes = {
      projetar: new Set<(pontos: readonly Projecao[]) => void>(),
      tocar: new Set<(peca: PortaId) => void>(),
      arrastar: new Set<() => void>(),
      contexto: new Set<(situacao: 'perdido' | 'restaurado') => void>(),
    };
    const ouvir = <T>(conjunto: Set<T>) => (ouvinte: T) => {
      conjunto.add(ouvinte);
      return () => {
        conjunto.delete(ouvinte);
      };
    };

    const raycaster = new Raycaster();
    const colisoes = montado.colisao.map((c) => c.malha);
    const ocultos = new Map<string, boolean>();
    /** Quantos pontos ainda precisam de um raio desde a última vez que a câmera mexeu. */
    let oclusoesPendentes = 0;
    let proximaOclusao = 0;
    let ultimaPoseDaOclusao = '';
    let projecoesAnteriores: Projecao[] | null = null;
    const vetor = new Vector3();
    const direcao = new Vector3();

    function testarOclusao(id: string, ponto: readonly number[]) {
      vetor.set(ponto[0]!, ponto[1]!, ponto[2]!);
      direcao.copy(vetor).sub(camera.position);
      const distancia = direcao.length();
      raycaster.set(camera.position, direcao.normalize());
      raycaster.far = Math.max(0, distancia - 0.04);
      ocultos.set(id, raycaster.intersectObjects(colisoes, false).length > 0);
    }

    function projetar(): Projecao[] {
      const vista = dentro ? 'dentro' : 'fora';
      const ids = pontosDaVista(manifesto, vista);
      // A oclusão (um raio contra a malha de colisão) refaz-se aos poucos quando a câmera mexe: um
      // ponto por quadro, em rodízio, até todos terem sido conferidos depois do último movimento.
      const chave = `${camera.position.x.toFixed(2)},${camera.position.y.toFixed(2)},${camera.position.z.toFixed(2)},${vista}`;
      if (chave !== ultimaPoseDaOclusao) {
        ultimaPoseDaOclusao = chave;
        oclusoesPendentes = ids.length;
      }
      if (oclusoesPendentes > 0 && ids.length > 0) {
        const id = ids[proximaOclusao % ids.length]!;
        proximaOclusao += 1;
        oclusoesPendentes -= 1;
        testarOclusao(id, manifesto.pontos[id]!);
      }
      return ids.map((id) => {
        const p = manifesto.pontos[id]!;
        vetor.set(p[0], p[1], p[2]).project(camera);
        const x = ((vetor.x + 1) / 2) * largura;
        const y = ((1 - vetor.y) / 2) * altura;
        const naTela = vetor.z < 1 && vetor.x > -1 && vetor.x < 1 && vetor.y > -1 && vetor.y < 1;
        if (!ocultos.has(id)) testarOclusao(id, p);
        return { id, x, y, visivel: naTela && !ocultos.get(id) };
      });
    }

    function emitirProjecoes() {
      if (ouvintes.projetar.size === 0) return;
      const atuais = projetar();
      const anteriores = projecoesAnteriores;
      const mudou = !anteriores || anteriores.length !== atuais.length
        || atuais.some((p, i) => {
          const a = anteriores[i]!;
          return a.id !== p.id || a.visivel !== p.visivel || Math.abs(a.x - p.x) > 0.4 || Math.abs(a.y - p.y) > 0.4;
        });
      if (!mudou) return;
      projecoesAnteriores = atuais;
      ouvintes.projetar.forEach((f) => f(atuais));
    }

    // -------------------------------------------------------------- halos
    const quaternionDaParte = new Quaternion();
    const normalNoMundo = new Vector3();
    const posicaoNoMundo = new Vector3();
    function atualizarHalos(intensidade: number) {
      for (const h of halos) {
        if (intensidade <= 0.001) {
          h.sprite.visible = false;
          continue;
        }
        montado.partes[h.parte]!.getWorldQuaternion(quaternionDaParte);
        normalNoMundo.copy(h.normal).applyQuaternion(quaternionDaParte).normalize();
        h.sprite.getWorldPosition(posicaoNoMundo);
        direcao.copy(camera.position).sub(posicaoNoMundo).normalize();
        const frente = normalNoMundo.dot(direcao);
        const fator = Math.min(1, Math.max(0, (frente - 0.05) / 0.55));
        const opacidade = intensidade * fator * fator * (h.tipo === 'farol' ? 1 : 0.8);
        h.sprite.visible = opacidade > 0.004 && !dentro;
        (h.sprite.material as { opacity: number }).opacity = opacidade;
      }
    }

    // ------------------------------------------------------------------ laço
    let pedido = 0;
    let visivelNaTela = true;
    let perdido = false;
    let ultimoQuadro = 0;
    let animandoAntes = false;
    const medidor = new MedidorDeQuadros();

    function pedirQuadro() {
      if (pedido || descartada || perdido || !visivelNaTela || document.hidden) return;
      pedido = requestAnimationFrame(quadro);
    }

    /** Movimento desligado no meio de algo: tudo vai direto para o fim. */
    function encerrarAnimacoes() {
      pintura.terminar();
      tetoPintura.terminar();
      tetoDaRegiao.terminar();
      luzes.terminar();
      noite.terminar();
      fatorDeDentro.terminar();
      for (const peca of pecas.values()) peca.progresso = peca.alvo;
      if (transicao) {
        if (!transicao.trocou) transicao.trocar();
        transicao = null;
      }
      cortinaMalha.visible = false;
      orbita.cortar(orbita.destino);
      olhar.cortar(olhar.destino);
    }

    function atualizar(dt: number): boolean {
      let anima = false;
      if (pintura.passo(dt)) anima = true;
      if (tetoPintura.passo(dt)) anima = true;
      if (tetoDaRegiao.passo(dt)) anima = true;
      aplicarPintura(pintura.valor);
      aplicarTeto();
      if (luzes.passo(dt)) anima = true;
      aplicarLuzes(luzes.valor);
      const noiteAndando = noite.passo(dt);
      const dentroAndando = fatorDeDentro.passo(dt);
      if (noiteAndando || dentroAndando) anima = true;
      aplicarAmbiente(noite.valor);

      // Portas: progresso linear, ângulo pela curva; parou, a sombra de contato se refaz.
      let portasAndando = false;
      for (const peca of pecas.values()) {
        const antes = peca.progresso;
        peca.progresso = avancar(peca.progresso, peca.alvo, dt, DURACAO.porta, movimento);
        if (peca.progresso !== antes) portasAndando = true;
      }
      if (portasAndando) {
        posarPecas();
        anima = true;
        sombraSuja = true;
        // A porta que abre pode cobrir ou descobrir um ponto: a oclusão se refaz.
        ultimaPoseDaOclusao = '';
      } else if (sombraSuja) {
        sombraSuja = false;
        sombra.assar();
      }

      // Cortina das trocas de vista.
      if (transicao) {
        transicao.t += dt;
        const c = cortina(transicao.t);
        materialDaCortina.uniforms['uOpacidade']!.value = c.opacidade;
        cortinaMalha.visible = c.opacidade > 0.002;
        if (c.trocar && !transicao.trocou) {
          transicao.trocou = true;
          transicao.trocar();
        }
        if (c.fim) {
          transicao = null;
          cortinaMalha.visible = false;
        }
        anima = true;
      }

      // Giro da mesa: uma volta em 40 s, parado durante o arrasto.
      if (girando && !dentro && !arrastando) {
        orbita.destino[0] = orbita.destino[0]! + (360 / VOLTA_EM_SEGUNDOS) * dt;
        orbita.atual[0] = orbita.atual[0]! + (360 / VOLTA_EM_SEGUNDOS) * dt;
        anima = true;
      }
      if (dentro ? olhar.passo(dt) : orbita.passo(dt)) anima = true;

      // Deslocamento da lente para centrar o carro entre os painéis.
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
      return anima;
    }

    function desenhar() {
      atualizarProjecao();
      posicionarCamera();
      camera.updateMatrixWorld();
      atualizarHalos(luzes.valor.halo);
      renderer.render(cena, camera);
      diagnostico.quadros += 1;
      diagnostico.chamadas = renderer.info.render.calls;
      diagnostico.triangulos = renderer.info.render.triangles;
      emitirProjecoes();
    }

    function quadro(agoraMs: number) {
      pedido = 0;
      if (descartada || perdido) return;
      const continuo = ultimoQuadro !== 0;
      const dt = continuo ? Math.min(0.25, Math.max(0.001, (agoraMs - ultimoQuadro) / 1000)) : 1 / 60;
      const anima = atualizar(dt);
      desenhar();
      if (anima && continuo) medidor.registrar(agoraMs - ultimoQuadro);
      if (animandoAntes && !anima && medidor.fecharAnimacao()) descerNivel();
      animandoAntes = anima;
      ultimoQuadro = anima ? agoraMs : 0;
      // A oclusão dos pontos ainda pendentes pede mais quadros (um ponto por quadro).
      if (anima || oclusoesPendentes > 0) pedirQuadro();
    }

    function descerNivel() {
      const novo = nivelAbaixo(ajustes.nivel);
      if (novo === ajustes.nivel) return;
      ajustes = { ...ajustesDoCarro(novo, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1), msaa: ajustes.msaa };
      renderer.setPixelRatio(novo === 'medio' ? Math.min(1.5, ajustes.dpr) : 1);
      renderer.setSize(largura, altura, false);
      if (!ajustes.halos) for (const h of halos) h.sprite.visible = false;
      // Mudar o tamanho apaga o canvas: sem um quadro novo, a cena ficava em branco.
      pedirQuadro();
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
      reenquadrar();
      if (!movimento || !enquadrado) orbita.cortar(orbita.destino);
      pedirQuadro();
    }

    // ------------------------------------------------- compilação e 1º quadro
    alvoDasPecas();
    for (const peca of pecas.values()) peca.progresso = peca.alvo;
    posarPecas();
    if (estado.vista === 'dentro') entrar(estado.ponto);
    aplicarAmbiente(noite.valor);
    atualizarProjecao();
    posicionarCamera();
    // As texturas sobem para a GPU aos poucos, antes do primeiro quadro (não num quadro só).
    const texturas = new Set<Texture>();
    cena.traverse((o) => {
      const material = (o as Mesh).material;
      for (const m of Array.isArray(material) ? material : material ? [material] : []) {
        for (const valor of Object.values(m as unknown as Record<string, unknown>)) {
          if (valor && typeof valor === 'object' && 'isTexture' in valor) texturas.add(valor as Texture);
        }
      }
    });
    for (const textura of texturas) {
      textura.anisotropy = Math.max(textura.anisotropy, ajustes.anisotropia);
      renderer.initTexture(textura);
      await fatia();
    }
    await renderer.compileAsync(cena, camera);
    if (descartada) throw new Error('A cena foi descartada durante a carga.');
    tempos['compilacao'] = agora() - inicio;
    await fatia();
    desenhar();
    tempos['primeiroQuadro'] = agora() - inicio;

    // --------------------------------------------------------------- eventos
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
      // O que só existia na GPU (o PMREM e a sombra assada) precisa ser feito de novo. O PMREM velho
      // não é descartado: os objetos dele morreram com o contexto, e o descarte faria o three apagar
      // nomes que não existem mais (avisos no console).
      ambiente = gerarAmbiente(renderer, ajustes.reflexos);
      cena.environment = ambiente.textura;
      sombra.assar();
      ultimoQuadro = 0;
      ouvintes.contexto.forEach((f) => f('restaurado'));
      pedirQuadro();
    };
    canvas.addEventListener('webglcontextlost', aoPerder);
    canvas.addEventListener('webglcontextrestored', aoRecuperar);

    // ------------------------------------------------------------- ponteiro
    const ndc = new Vector2();
    const ponteiros = new Map<number, { x: number; y: number }>();
    let gesto: { x: number; y: number; arrastou: boolean; azimute: number; elevacao: number; rumo: number; inclinacao: number; amostras: { t: number; x: number }[]; tipo: string } | null = null;
    let pinca: { distancia: number; raio: number; fov: number } | null = null;
    let passandoNumaPeca = false;
    let ultimoPasso = 0;

    function pecaNoPonto(clientX: number, clientY: number): { parte: number; ponto: Vector3 } | null {
      const r = canvas.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
      camera.updateMatrixWorld();
      raycaster.setFromCamera(ndc, camera);
      raycaster.far = Infinity;
      const acerto = raycaster.intersectObjects(colisoes, false)[0];
      if (!acerto) return null;
      const parte = montado.colisao.find((c) => c.malha === acerto.object)?.parte ?? 0;
      return { parte, ponto: acerto.point };
    }

    const idDaParte = (parte: number): PortaId | null => (parte > 0 ? (montado.pecas[parte - 1]?.id ?? null) : null);

    const cursor = () => {
      canvas.style.cursor = gesto?.arrastou ? 'grabbing' : passandoNumaPeca ? 'pointer' : 'grab';
    };

    function aoApertar(e: PointerEvent) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ponteiros.size === 2) {
        const [a, b] = [...ponteiros.values()];
        pinca = { distancia: Math.hypot(a!.x - b!.x, a!.y - b!.y) || 1, raio: orbita.destino[2]!, fov: olhar.destino[2]! };
        gesto = null;
        return;
      }
      gesto = {
        x: e.clientX, y: e.clientY, arrastou: false, azimute: orbita.destino[0]!, elevacao: orbita.destino[1]!, rumo: olhar.destino[0]!, inclinacao: olhar.destino[1]!,
        amostras: [{ t: agora(), x: e.clientX }], tipo: e.pointerType,
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
        const fator = pinca.distancia / (Math.hypot(a!.x - b!.x, a!.y - b!.y) || 1);
        if (dentro) definirFov(pinca.fov * fator, true);
        else definirRaio(pinca.raio * fator, true);
        pedirQuadro();
        return;
      }
      if (gesto) {
        const dx = e.clientX - gesto.x;
        const dy = e.clientY - gesto.y;
        if (!gesto.arrastou && Math.hypot(dx, dy) > LIMIAR_DO_ARRASTO) {
          gesto.arrastou = true;
          arrastando = true;
          girando = false;
          ouvintes.arrastar.forEach((f) => f());
          cursor();
        }
        if (!gesto.arrastou || transicao) return;
        gesto.amostras.push({ t: agora(), x: e.clientX });
        if (gesto.amostras.length > 6) gesto.amostras.shift();
        if (dentro) {
          olhar.destino[0] = gesto.rumo + dx * OLHAR_POR_PIXEL;
          if (gesto.tipo === 'mouse') olhar.destino[1] = limitarInclinacao(gesto.inclinacao + dy * OLHAR_POR_PIXEL * 0.8);
          olhar.omega = OMEGA.dentro;
          if (!movimento) olhar.cortar(olhar.destino);
        } else {
          enquadrado = false;
          orbita.destino[0] = gesto.azimute - dx * GIRO_POR_PIXEL;
          if (gesto.tipo === 'mouse') orbita.destino[1] = limitarElevacao(gesto.elevacao + dy * ELEVACAO_POR_PIXEL);
          orbita.omega = OMEGA.arrasto;
          if (!movimento) orbita.cortar(orbita.destino);
        }
        pedirQuadro();
        return;
      }
      if (e.pointerType !== 'mouse' || transicao || montado.pecas.length === 0) return;
      const instante = agora();
      if (instante - ultimoPasso < 60) return;
      ultimoPasso = instante;
      const sobre = pecaNoPonto(e.clientX, e.clientY);
      const numaPeca = sobre !== null && idDaParte(sobre.parte) !== null;
      if (numaPeca !== passandoNumaPeca) {
        passandoNumaPeca = numaPeca;
        cursor();
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
        if (movimento && !dentro && g.amostras.length >= 2) {
          const a = g.amostras[0]!;
          const b = g.amostras.at(-1)!;
          const velocidade = (b.x - a.x) / Math.max(16, b.t - a.t);
          orbita.destino[0] = orbita.destino[0]! - Math.max(-45, Math.min(45, velocidade * GIRO_POR_PIXEL * 260));
          orbita.omega = OMEGA.transicao;
        }
        pedirQuadro();
        return;
      }
      if (e.type === 'pointercancel' || transicao) return;
      const sobre = pecaNoPonto(e.clientX, e.clientY);
      const id = sobre ? idDaParte(sobre.parte) : null;
      if (id) ouvintes.tocar.forEach((f) => f(id));
    }

    function aoSair() {
      if (passandoNumaPeca) {
        passandoNumaPeca = false;
        cursor();
      }
    }

    function definirRaio(raio: number, imediato: boolean) {
      const limites = limitesDoRaio(caixa, raioDoEnquadramento);
      enquadrado = false;
      orbita.destino[2] = Math.min(limites.maximo, Math.max(limites.minimo, raio));
      orbita.omega = imediato ? OMEGA.arrasto : OMEGA.zoom;
      if (!movimento) orbita.cortar(orbita.destino);
    }

    function definirFov(fov: number, imediato: boolean) {
      olhar.destino[2] = Math.min(FOV_DE_DENTRO.maximo, Math.max(FOV_DE_DENTRO.minimo, fov));
      olhar.omega = imediato ? OMEGA.arrasto : OMEGA.zoom;
      if (!movimento) olhar.cortar(olhar.destino);
    }

    function aoRodar(e: WheelEvent) {
      // A roda sozinha rola a página; só Ctrl/⌘ + roda (a pinça do trackpad) aproxima.
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const fator = Math.exp(Math.max(-60, Math.min(60, e.deltaY)) * 0.006);
      if (dentro) definirFov(olhar.destino[2]! * fator, true);
      else definirRaio(orbita.destino[2]! * fator, true);
      pedirQuadro();
    }

    canvas.addEventListener('pointerdown', aoApertar);
    canvas.addEventListener('pointermove', aoMover);
    canvas.addEventListener('pointerup', aoSoltar);
    canvas.addEventListener('pointercancel', aoSoltar);
    canvas.addEventListener('pointerleave', aoSair);
    canvas.addEventListener('wheel', aoRodar, { passive: false });

    // -------------------------------------------------------------- contrato
    const cenaCarro: CenaCarroInterna = {
      aplicar(novo) {
        const anterior = estado;
        estado = novo;
        const mudouMovimento = novo.movimento !== movimento;
        movimento = novo.movimento;
        if (mudouMovimento && !movimento) encerrarAnimacoes();
        if (anterior.pintura !== novo.pintura) pintura.ir(pinturaDe(novo.pintura), movimento);
        if (anterior.pintura !== novo.pintura || anterior.tetoPreto !== novo.tetoPreto) {
          tetoPintura.ir(novo.tetoPreto ? pinturaDe(PRETO_DO_TETO) : pinturaDe(novo.pintura), movimento);
        }
        if (anterior.tetoPreto !== novo.tetoPreto || anterior.tetoPanoramico !== novo.tetoPanoramico) {
          tetoDaRegiao.ir({ preto: novo.tetoPreto ? 1 : 0, vidro: novo.tetoPanoramico ? 1 : 0 }, movimento);
        }
        if (anterior.rackDeTeto !== novo.rackDeTeto) for (const r of montado.rack) r.visible = novo.rackDeTeto;
        if (anterior.farois !== novo.farois || anterior.ambiente !== novo.ambiente) {
          luzes.ir(intensidadeDasLuzes(novo.farois, novo.ambiente === 'noite'), movimento);
        }
        if (anterior.ambiente !== novo.ambiente) noite.ir(novo.ambiente === 'noite' ? 1 : 0, movimento);
        if (anterior.vista !== novo.vista || anterior.ponto !== novo.ponto) irParaVista(novo.vista, novo.ponto);
        alvoDasPecas();
        if (novo.girando !== anterior.girando) girando = novo.girando;
        if (mudouMovimento) ultimoQuadro = 0;
        aplicarTeto();
        pedirQuadro();
      },
      enquadrar() {
        if (dentro) {
          const c = cameraDeDentro(dentro.ponto);
          if (c) {
            const { rumo, inclinacao } = olharPara(c.olho, c.alvo);
            olhar.destino = [pertoDe(olhar.atual[0]!, rumo), inclinacao, fovDeDentro(largura / altura)];
            olhar.omega = OMEGA.transicao;
            if (!movimento) olhar.cortar(olhar.destino);
          }
        } else {
          enquadrado = true;
          const pose = abertura();
          raioDoEnquadramento = pose.raio;
          irPara([pose.azimute, pose.elevacao, pose.raio, ...pose.alvo], OMEGA.transicao);
        }
        pedirQuadro();
      },
      zoom(passo) {
        if (dentro) definirFov(olhar.destino[2]! * (passo > 0 ? 0.85 : 1.18), false);
        else definirRaio(orbita.destino[2]! * (passo > 0 ? 0.82 : 1.22), false);
        pedirQuadro();
      },
      definirAreaLivre(area) {
        areaLivre.esquerda = Math.max(0, area.esquerda);
        areaLivre.direita = Math.max(0, area.direita);
        areaLivre.topo = Math.max(0, area.topo);
        areaLivre.base = Math.max(0, area.base);
        reenquadrar();
        pedirQuadro();
      },
      // Quem assina depois da carga recebe o valor atual no próximo quadro.
      aoProjetar(ouvinte) {
        const cancelar = ouvir(ouvintes.projetar)(ouvinte);
        projecoesAnteriores = null;
        pedirQuadro();
        return cancelar;
      },
      aoTocarPeca: ouvir(ouvintes.tocar),
      aoArrastar: ouvir(ouvintes.arrastar),
      aoMudarContexto: ouvir(ouvintes.contexto),
      async exportarUsdz() {
        if (descartada) return null;
        try {
          return await exportarCarroEmUsdz(renderer, montado, manifesto);
        } catch (erro) {
          console.warn('[carrelio] A exportação USDZ falhou.', erro);
          return null;
        }
      },
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
        montado.descartar();
        for (const h of halos) h.sprite.material.dispose();
        texturaDosHalos?.dispose();
        sombra.descartar();
        ambiente.descartar();
        for (const malha of [chao, fundo, cortinaMalha]) {
          malha.geometry.dispose();
          (malha.material as ShaderMaterial).dispose();
        }
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
        carro: montado,
        desenhar,
        estaAnimando: () => pedido !== 0 || transicao !== null || orbita.emMovimento || olhar.emMovimento || pintura.ativa || luzes.ativa || noite.ativa,
        tocar(x, y) {
          const r = canvas.getBoundingClientRect();
          const sobre = pecaNoPonto(r.left + x, r.top + y);
          return sobre ? { ponto: [sobre.ponto.x, sobre.ponto.y, sobre.ponto.z], parte: sobre.parte } : null;
        },
        orbitar(azimute, elevacao, fatorDoRaio = 1) {
          enquadrado = false;
          const pose = abertura();
          // Sem os limites da órbita: o QA pode olhar de cima.
          orbita.cortar([azimute, Math.min(89, Math.max(-10, elevacao)), pose.raio * fatorDoRaio, ...pose.alvo]);
          desenhar();
        },
        tempos,
        depurar: () => ({
          pedido, transicao: transicao !== null, orbita: [...orbita.atual], destino: [...orbita.destino], olhar: [...olhar.atual], dentro: dentro?.ponto ?? null,
          girando, deslocamento: { ...deslocamento }, visivelNaTela, perdido, nivel: ajustes.nivel, azimute: azimuteDaDirecao(camera.position.x, camera.position.z),
          pecas: Object.fromEntries([...pecas].map(([id, p]) => [id, { ...p }])),
          triangulosDaColisao: colisoes.reduce((soma, m) => soma + (m.geometry.index?.count ?? 0) / 3, 0),
          triangulosDoCarro: montado.triangulos,
        }),
      },
    };

    pedirQuadro();
    return cenaCarro;
  } catch (erro) {
    descartada = true;
    try {
      carro?.descartar();
      renderer.dispose();
      renderer.forceContextLoss();
    } catch {
      // Contexto já perdido: nada a devolver.
    }
    canvas.remove();
    throw erro;
  }
}
