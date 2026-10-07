import {
  Color, HalfFloatType, LinearFilter, Mesh, MeshBasicMaterial, NoBlending, OrthographicCamera, PlaneGeometry, RGBAFormat, Scene, ShaderMaterial, Vector2,
  Vector4, WebGLRenderTarget, type Box3, type Object3D, type WebGLRenderer,
} from 'three';

/**
 * A sombra de contato, assada: uma câmera ortográfica no chão olha para cima e desenha o carro com
 * a escuridão pela altura (o que encosta no chão, preto; o que está a um metro, nada). Duas
 * borradas separáveis dão os dois canais que o chão usa: R, a sombra nítida embaixo dos pneus e das
 * bordas baixas; G, a sombra larga e suave do carro inteiro (a oclusão do estúdio).
 *
 * É desenhada uma vez na carga (e de novo quando o contexto volta, ou quando as portas param de
 * mexer): no quadro a quadro, o chão só lê uma textura.
 */

/** Até que altura a sombra conta, em metros. */
const ALTURA = 1.3;
const MARGEM = 0.9;

const TELA_CHEIA = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4( position.xy * 2.0, 0.0, 1.0 ); }';

function materialDaBorrada(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uFonte: { value: null }, uPasso: { value: new Vector2() } },
    vertexShader: TELA_CHEIA,
    fragmentShader: /* glsl */ `
      uniform sampler2D uFonte; uniform vec2 uPasso; varying vec2 vUv;
      void main() {
        // Gaussiana de 9 amostras (pesos de sigma = 2 amostras).
        vec4 s = texture2D( uFonte, vUv ) * 0.2270270270;
        s += texture2D( uFonte, vUv + uPasso * 1.3846153846 ) * 0.3162162162;
        s += texture2D( uFonte, vUv - uPasso * 1.3846153846 ) * 0.3162162162;
        s += texture2D( uFonte, vUv + uPasso * 3.2307692308 ) * 0.0702702703;
        s += texture2D( uFonte, vUv - uPasso * 3.2307692308 ) * 0.0702702703;
        gl_FragColor = s;
      }`,
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
  });
}

function materialDaJuncao(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uNitida: { value: null }, uSuave: { value: null } },
    vertexShader: TELA_CHEIA,
    fragmentShader: /* glsl */ `
      uniform sampler2D uNitida; uniform sampler2D uSuave; varying vec2 vUv;
      void main() { gl_FragColor = vec4( texture2D( uNitida, vUv ).r, texture2D( uSuave, vUv ).g, 0.0, 1.0 ); }`,
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
  });
}

/** O material que desenha a escuridão pela altura (funciona com malha comum e com esqueleto). */
function materialDaAltura(): MeshBasicMaterial {
  const m = new MeshBasicMaterial({ color: 0xffffff });
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', 'varying float vAlturaDaSombra;\nvoid main() {')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n\tvAlturaDaSombra = ( modelMatrix * vec4( transformed, 1.0 ) ).y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `varying float vAlturaDaSombra;\nvoid main() {`)
      .replace(
        '#include <opaque_fragment>',
        `float carH = max( vAlturaDaSombra, 0.0 );
float carContato = 1.0 - smoothstep( 0.0, 0.07, carH );
float carOclusao = pow( 1.0 - clamp( carH / ${ALTURA.toFixed(2)}, 0.0, 1.0 ), 2.2 );
gl_FragColor = vec4( carContato, carOclusao, 0.0, 1.0 );`,
      );
  };
  m.customProgramCacheKey = () => 'carrelio:altura-da-sombra';
  return m;
}

export type SombraDeContato = {
  /** A textura que o chão lê (R nítida, G suave). */
  readonly textura: WebGLRenderTarget['texture'];
  /** Centro (x, z) e medidas (x, z) da área coberta, em metros. */
  readonly area: Vector4;
  /** Desenha de novo (contexto restaurado, portas paradas noutra posição). */
  assar(): void;
  descartar(): void;
};

/** Monta a sombra do `carro` (o grupo, já no lugar) sobre a caixa dele no chão. */
export function criarSombraDeContato(renderer: WebGLRenderer, carro: Object3D, caixa: Box3, lado: number, esconder: () => () => void): SombraDeContato {
  const largura = caixa.max.x - caixa.min.x + 2 * MARGEM;
  const profundidade = caixa.max.z - caixa.min.z + 2 * MARGEM;
  const centro = new Vector2((caixa.min.x + caixa.max.x) / 2, (caixa.min.z + caixa.max.z) / 2);
  const area = new Vector4(centro.x, centro.y, largura, profundidade);
  // Pixels quadrados no chão: o lado maior manda.
  const ladoX = Math.max(64, Math.round((lado * largura) / Math.max(largura, profundidade)));
  const ladoZ = Math.max(64, Math.round((lado * profundidade) / Math.max(largura, profundidade)));
  const opcoes = { type: HalfFloatType, format: RGBAFormat, minFilter: LinearFilter, magFilter: LinearFilter, depthBuffer: false } as const;
  const bruta = new WebGLRenderTarget(ladoX, ladoZ, { ...opcoes, depthBuffer: true });
  const a = new WebGLRenderTarget(ladoX, ladoZ, opcoes);
  const b = new WebGLRenderTarget(ladoX, ladoZ, opcoes);
  const nitida = new WebGLRenderTarget(ladoX, ladoZ, opcoes);
  const final = new WebGLRenderTarget(ladoX, ladoZ, opcoes);

  const camera = new OrthographicCamera(-largura / 2, largura / 2, profundidade / 2, -profundidade / 2, 0, ALTURA);
  camera.position.set(centro.x, -0.002, centro.y);
  camera.up.set(0, 0, 1);
  camera.lookAt(centro.x, 1, centro.y);
  camera.updateMatrixWorld();

  const altura = materialDaAltura();
  const borrada = materialDaBorrada();
  const juncao = materialDaJuncao();
  const quadro = new Mesh(new PlaneGeometry(1, 1));
  quadro.frustumCulled = false;
  const cenaDoQuadro = new Scene();
  cenaDoQuadro.add(quadro);
  const cameraDoQuadro = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function passar(fonte: WebGLRenderTarget, destino: WebGLRenderTarget, dx: number, dz: number) {
    quadro.material = borrada;
    borrada.uniforms['uFonte']!.value = fonte.texture;
    (borrada.uniforms['uPasso']!.value as Vector2).set(dx / ladoX, dz / ladoZ);
    renderer.setRenderTarget(destino);
    renderer.render(cenaDoQuadro, cameraDoQuadro);
  }

  function borrar(fonte: WebGLRenderTarget, destino: WebGLRenderTarget, raioEmMetros: number, vezes: number) {
    // Cada passada borra sigma ≈ 2 amostras; o passo leva o raio pedido para pixels.
    const pixels = (raioEmMetros / largura) * ladoX;
    let origem = fonte;
    for (let i = 0; i < vezes; i += 1) {
      const passo = Math.max(0.5, pixels / (2 * Math.sqrt(vezes)));
      passar(origem, b, passo, 0);
      passar(b, destino, 0, passo);
      origem = destino;
    }
  }

  function assar() {
    const anterior = renderer.getRenderTarget();
    const autoClear = renderer.autoClear;
    const corDeFundo = renderer.getClearColor(new Color());
    const alfa = renderer.getClearAlpha();
    const cena = new Scene();
    const pai = carro.parent;
    const restaurar = esconder();
    cena.add(carro);
    cena.overrideMaterial = altura;
    renderer.autoClear = true;
    renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(bruta);
    renderer.clear();
    renderer.render(cena, camera);
    cena.remove(carro);
    pai?.add(carro);
    restaurar();
    borrar(bruta, nitida, 0.035, 1);
    borrar(nitida, a, 0.3, 5);
    quadro.material = juncao;
    juncao.uniforms['uNitida']!.value = nitida.texture;
    juncao.uniforms['uSuave']!.value = a.texture;
    renderer.setRenderTarget(final);
    renderer.render(cenaDoQuadro, cameraDoQuadro);
    renderer.setRenderTarget(anterior);
    renderer.setClearColor(corDeFundo, alfa);
    renderer.autoClear = autoClear;
  }

  assar();

  return {
    textura: final.texture,
    area,
    assar,
    descartar() {
      for (const alvo of [bruta, a, b, nitida, final]) alvo.dispose();
      altura.dispose();
      borrada.dispose();
      juncao.dispose();
      quadro.geometry.dispose();
    },
  };
}
