import {
  AdditiveBlending, BackSide, BoxGeometry, CircleGeometry, Color, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, PMREMGenerator, Scene, ShaderMaterial,
  SphereGeometry, Vector2, Vector3, Vector4, type Texture, type WebGLRenderer,
} from 'three';

/**
 * O estúdio do carro: o ambiente dos reflexos (uma sala escura com painéis de luz, passada no
 * `PMREMGenerator`, gerada aqui, sem HDRI baixado), o chão sem emenda e o fundo.
 *
 * A luz de um carro em foto de estúdio é quase toda reflexo: o que dá forma à lataria são as faixas
 * de luz longas e contínuas que correm por ela. Por isso a sala tem um softbox comprido no teto (o
 * reflexo no capô, no teto e no para-brisa), duas faixas laterais compridas na altura da cintura do
 * carro (a linha de luz que corre pelas portas), um rebatedor grande e fraco do lado da pose de
 * abertura e uma contraluz atrás. Paredes, teto e chão quase pretos, para combinar com o site.
 *
 * Chão e fundo não passam pelo tone mapping (as cores saem como estão): o chão some no fundo na
 * mesma cor do horizonte, sem emenda.
 */

type Painel = {
  centro: readonly [number, number, number];
  /** Largura e altura do painel, em metros. */
  tamanho: readonly [number, number];
  /** Para onde a face acesa aponta. */
  normal: readonly [number, number, number];
  /** Radiância (linear). */
  intensidade: number;
  /** Fração da borda que esmaece, em cada eixo (o difusor do softbox). */
  borda: readonly [number, number];
};

/**
 * A sala dos reflexos. Medidas no espaço do carro (frente para +Z, o carro tem ~4,4 m); radiância
 * linear (o PMREM guarda acima de 1). Um "túnel" de faixas horizontais nas quatro paredes, em duas
 * alturas: de qualquer ângulo da mesa, a lateral do carro reflete uma linha de luz contínua. O
 * softbox do teto desenha o capô e o teto; o rebatedor da frente esquerda dá o difuso da pose de
 * abertura. Paredes escuras, mas não pretas: é delas que vem o difuso das laterais.
 */
export const SALA = {
  parede: 0.014,
  teto: 0.012,
  chao: 0.05,
  meiaLargura: 7,
  meioComprimento: 8.5,
  paineis: [
    // Softbox grande no teto, ao longo do carro.
    { centro: [0, 5.2, 0], tamanho: [5, 10], normal: [0, -1, 0], intensidade: 6, borda: [0.4, 0.18] },
    // Faixas das paredes laterais: alta (na altura do teto do carro) e baixa.
    { centro: [6.9, 1.8, 0], tamanho: [14, 0.34], normal: [-1, 0, 0], intensidade: 11, borda: [0.05, 0.45] },
    { centro: [-6.9, 1.8, 0], tamanho: [14, 0.34], normal: [1, 0, 0], intensidade: 11, borda: [0.05, 0.45] },
    { centro: [6.9, 0.55, 0], tamanho: [14, 0.24], normal: [-1, 0, 0], intensidade: 7, borda: [0.05, 0.45] },
    { centro: [-6.9, 0.55, 0], tamanho: [14, 0.24], normal: [1, 0, 0], intensidade: 7, borda: [0.05, 0.45] },
    // Faixas das paredes da frente e de trás: alta e baixa.
    { centro: [0, 2.15, 8.4], tamanho: [12, 0.34], normal: [0, 0, -1], intensidade: 5, borda: [0.05, 0.45] },
    { centro: [0, 2.15, -8.4], tamanho: [12, 0.34], normal: [0, 0, 1], intensidade: 5, borda: [0.05, 0.45] },
    { centro: [0, 0.55, 8.4], tamanho: [12, 0.24], normal: [0, 0, -1], intensidade: 3.5, borda: [0.05, 0.45] },
    { centro: [0, 0.55, -8.4], tamanho: [12, 0.24], normal: [0, 0, 1], intensidade: 3.5, borda: [0.05, 0.45] },
    // Rebatedor grande e suave da frente esquerda (o lado da pose de abertura).
    { centro: [5.4, 2.6, 6.2], tamanho: [5, 3.4], normal: [-0.62, -0.18, -0.76], intensidade: 1.2, borda: [0.45, 0.45] },
  ] as Painel[],
};

function materialDoPainel(painel: Painel): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uCor: { value: new Vector3(painel.intensidade, painel.intensidade, painel.intensidade * 1.01) }, uBorda: { value: new Vector2(...painel.borda) } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
    fragmentShader: /* glsl */ `
      uniform vec3 uCor; uniform vec2 uBorda; varying vec2 vUv;
      void main() {
        vec2 d = abs( vUv - 0.5 ) * 2.0;
        float m = ( 1.0 - smoothstep( 1.0 - uBorda.x, 1.0, d.x ) ) * ( 1.0 - smoothstep( 1.0 - uBorda.y, 1.0, d.y ) );
        gl_FragColor = vec4( uCor * m, 1.0 );
      }`,
    side: DoubleSide,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
}

/** A sala dos reflexos, como cena (para o PMREM). Devolve também o que descartar. */
export function cenaDoEstudio(): { cena: Scene; descartar(): void } {
  const cena = new Scene();
  const descartaveis: { dispose(): void }[] = [];
  const cinza = (v: number) => new MeshBasicMaterial({ color: new Color(v, v, v), side: BackSide });
  const sala = new Mesh(new BoxGeometry(SALA.meiaLargura * 2, 12, SALA.meioComprimento * 2), [
    cinza(SALA.parede),
    cinza(SALA.parede),
    cinza(SALA.teto),
    cinza(SALA.chao),
    cinza(SALA.parede),
    cinza(SALA.parede),
  ]);
  sala.position.y = 6;
  cena.add(sala);
  descartaveis.push(sala.geometry, ...(sala.material as MeshBasicMaterial[]));
  // O chão aceso embaixo do softbox: o que a soleira e o para-choque refletem de baixo.
  const poca = new Mesh(new CircleGeometry(5, 48), new ShaderMaterial({
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
    fragmentShader: 'varying vec2 vUv; void main() { float r = length( vUv - 0.5 ) * 2.0; gl_FragColor = vec4( vec3( 0.05 * ( 1.0 - smoothstep( 0.2, 1.0, r ) ) ), 1.0 ); }',
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
  }));
  poca.rotation.x = -Math.PI / 2;
  poca.scale.set(0.8, 1.3, 1);
  poca.position.y = 0.002;
  cena.add(poca);
  descartaveis.push(poca.geometry, poca.material as ShaderMaterial);
  const geometria = new PlaneGeometry(1, 1);
  descartaveis.push(geometria);
  for (const painel of SALA.paineis) {
    const material = materialDoPainel(painel);
    const malha = new Mesh(geometria, material);
    malha.scale.set(painel.tamanho[0], painel.tamanho[1], 1);
    malha.position.set(...painel.centro);
    malha.lookAt(painel.centro[0] + painel.normal[0], painel.centro[1] + painel.normal[1], painel.centro[2] + painel.normal[2]);
    cena.add(malha);
    descartaveis.push(material);
  }
  return {
    cena,
    descartar() {
      for (const d of descartaveis) d.dispose();
    },
  };
}

/** Gera o ambiente dos reflexos (PMREM) a partir da sala. */
export function gerarAmbiente(renderer: WebGLRenderer, tamanho: 256 | 512): { textura: Texture; descartar(): void } {
  const pmrem = new PMREMGenerator(renderer);
  const sala = cenaDoEstudio();
  const alvo = pmrem.fromScene(sala.cena, 0, 0.1, 60, { size: tamanho, position: new Vector3(0, 0.75, 0) });
  sala.descartar();
  pmrem.dispose();
  return { textura: alvo.texture, descartar: () => alvo.dispose() };
}

// ------------------------------------------------------------------- chão e fundo

/** As cores do palco por ambiente (lineares, sem tone mapping). */
export type CoresDoPalco = { perto: Color; longe: Color; topo: Color };

export const CORES_DO_ESTUDIO: CoresDoPalco = {
  perto: new Color('#2a2d2b'),
  longe: new Color('#0e0f0e'),
  topo: new Color('#070807'),
};

export const CORES_DA_NOITE: CoresDoPalco = {
  perto: new Color('#0d1013'),
  longe: new Color('#06070a'),
  topo: new Color('#030405'),
};

export type UniformesDoPalco = {
  uCorPerto: { value: Color };
  uCorLonge: { value: Color };
  uCorTopo: { value: Color };
  uSombra: { value: Texture | null };
  /** Centro (x, z) e tamanho (largura em x, comprimento em z) da textura da sombra no chão. */
  uAreaDaSombra: { value: Vector4 };
  uForcaDaSombra: { value: Vector2 };
  /** Poças de luz dos faróis: centros (x, z) da esquerda e da direita e a força (0 a 1). */
  uPocaFarois: { value: Vector4 };
  uPocaForca: { value: number };
  uPocaLanternas: { value: Vector4 };
  uLanternaForca: { value: number };
  /** Raios (x, z) da elipse do chão aceso. */
  uElipse: { value: Vector2 };
};

export function criarUniformesDoPalco(): UniformesDoPalco {
  return {
    uCorPerto: { value: CORES_DO_ESTUDIO.perto.clone() },
    uCorLonge: { value: CORES_DO_ESTUDIO.longe.clone() },
    uCorTopo: { value: CORES_DO_ESTUDIO.topo.clone() },
    uSombra: { value: null },
    uAreaDaSombra: { value: new Vector4(0, 0, 1, 1) },
    uForcaDaSombra: { value: new Vector2(0.9, 0.62) },
    uPocaFarois: { value: new Vector4(0.7, 4.5, -0.7, 4.5) },
    uPocaForca: { value: 0 },
    uPocaLanternas: { value: new Vector4(0.6, -2.6, -0.6, -2.6) },
    uLanternaForca: { value: 0 },
    uElipse: { value: new Vector2(4.2, 6.2) },
  };
}

const VERTICE_DO_MUNDO = 'varying vec3 vMundo; void main() { vec4 m = modelMatrix * vec4( position, 1.0 ); vMundo = m.xyz; gl_Position = projectionMatrix * viewMatrix * m; }';

/** Ruído de ±meio degrau de 8 bits: o degradê escuro do chão não faz faixas. */
const PONTILHADO = 'float carRuido( vec2 p ) { return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); }';

/** O chão: aceso perto do carro, some no horizonte; recebe a sombra de contato e as poças de luz. */
export function criarChao(uniformes: UniformesDoPalco): Mesh {
  const material = new ShaderMaterial({
    uniforms: uniformes as unknown as Record<string, { value: unknown }>,
    vertexShader: VERTICE_DO_MUNDO,
    fragmentShader: /* glsl */ `
      uniform vec3 uCorPerto; uniform vec3 uCorLonge;
      uniform sampler2D uSombra; uniform vec4 uAreaDaSombra; uniform vec2 uForcaDaSombra;
      uniform vec4 uPocaFarois; uniform float uPocaForca; uniform vec4 uPocaLanternas; uniform float uLanternaForca;
      uniform vec2 uElipse;
      varying vec3 vMundo;
      ${PONTILHADO}
      float carPoca( vec2 p, vec2 centro, vec2 raio ) {
        vec2 d = ( p - centro ) / raio;
        return exp( - 2.2 * dot( d, d ) );
      }
      void main() {
        vec2 p = vMundo.xz;
        float r = length( p / uElipse );
        vec3 cor = mix( uCorPerto, uCorLonge, smoothstep( 0.05, 1.0, r ) );
        vec2 uv = ( p - uAreaDaSombra.xy ) / uAreaDaSombra.zw + 0.5;
        if ( uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0 ) {
          vec4 s = texture2D( uSombra, uv );
          cor *= 1.0 - clamp( s.r * uForcaDaSombra.x + s.g * uForcaDaSombra.y, 0.0, 0.96 );
        }
        // Poças dos faróis, compridas para a frente, e o vermelho fraco das lanternas atrás.
        // A poça abre em leque a partir do para-choque: estreita junto dele, larga e fraca longe.
        float pocaE = carPoca( p, uPocaFarois.xy, vec2( 0.5 + 0.26 * max( 0.0, p.y - uPocaFarois.y + 1.25 ), 1.7 ) );
        float pocaD = carPoca( p, uPocaFarois.zw, vec2( 0.5 + 0.26 * max( 0.0, p.y - uPocaFarois.w + 1.25 ), 1.7 ) );
        cor += vec3( 0.52, 0.56, 0.62 ) * ( pocaE + pocaD ) * uPocaForca * 0.16;
        float traseira = carPoca( p, uPocaLanternas.xy, vec2( 0.5, 0.3 ) ) + carPoca( p, uPocaLanternas.zw, vec2( 0.5, 0.3 ) );
        cor += vec3( 0.5, 0.02, 0.01 ) * traseira * uLanternaForca * uPocaForca * 0.06;
        cor += ( carRuido( gl_FragCoord.xy ) - 0.5 ) / 255.0;
        gl_FragColor = vec4( cor, 1.0 );
        #include <colorspace_fragment>
      }`,
    toneMapped: false,
    depthWrite: true,
  });
  const chao = new Mesh(new CircleGeometry(36, 96), material);
  chao.rotation.x = -Math.PI / 2;
  chao.renderOrder = -2;
  chao.name = 'carrelio:chao';
  return chao;
}

/** O fundo: uma cúpula com o horizonte na cor do chão longe e o alto mais escuro. */
export function criarFundo(uniformes: UniformesDoPalco): Mesh {
  const material = new ShaderMaterial({
    uniforms: { uCorLonge: uniformes.uCorLonge, uCorTopo: uniformes.uCorTopo },
    vertexShader: VERTICE_DO_MUNDO,
    fragmentShader: /* glsl */ `
      uniform vec3 uCorLonge; uniform vec3 uCorTopo; varying vec3 vMundo;
      ${PONTILHADO}
      void main() {
        vec3 direcao = normalize( vMundo - cameraPosition );
        float subida = smoothstep( 0.0, 0.55, direcao.y );
        vec3 cor = mix( uCorLonge, uCorTopo, subida );
        cor += ( carRuido( gl_FragCoord.xy ) - 0.5 ) / 255.0;
        gl_FragColor = vec4( cor, 1.0 );
        #include <colorspace_fragment>
      }`,
    side: BackSide,
    toneMapped: false,
    depthWrite: false,
  });
  const fundo = new Mesh(new SphereGeometry(60, 32, 16), material);
  fundo.renderOrder = -3;
  fundo.frustumCulled = false;
  fundo.name = 'carrelio:fundo';
  return fundo;
}
