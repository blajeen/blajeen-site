import {
  AdditiveBlending, BackSide, CanvasTexture, Color, DoubleSide, MeshStandardMaterial, NormalBlending, RepeatWrapping, ShaderMaterial,
  SRGBColorSpace, Vector3, type Material, type MeshStandardMaterialParameters, type Texture, type WebGLProgramParametersWithUniforms,
} from 'three';

/**
 * Materiais e shaders da torre e da paisagem. Uma única função de céu (`corDoCeu`) alimenta o domo,
 * a névoa direcional (os prédios longe ganham a cor do céu atrás deles, quente do lado do sol), o
 * reflexo do vidro e o da água: mudar a hora é só mudar uniforms, sem regenerar mapa de ambiente.
 *
 * A névoa entra antes do mapeamento de tons em todos os materiais (inclusive nos padrões do three,
 * remendados), para um prédio sumido na névoa ter exatamente a cor do horizonte do domo.
 */

type Uniforme<T> = { value: T };

/** Os uniforms que todos os materiais da cena compartilham (o mesmo objeto, então mudar um muda todos). */
export type Comuns = {
  uTempo: Uniforme<number>;
  uSolDir: Uniforme<Vector3>;
  uCeuZenite: Uniforme<Color>;
  uCeuHorizonte: Uniforme<Color>;
  uCeuOposto: Uniforme<Color>;
  uCeuChao: Uniforme<Color>;
  uBrilhoDoSol: Uniforme<Color>;
  /** Luz direta do sol (cor × intensidade), para o brilho especular nos shaders próprios. */
  uLuzDoSol: Uniforme<Color>;
  uHemiCeu: Uniforme<Color>;
  uHemiChao: Uniforme<Color>;
  uNoite: Uniforme<number>;
  uEstrelas: Uniforme<number>;
  uNevoa: Uniforme<number>;
};

export function criarComuns(): Comuns {
  return {
    uTempo: { value: 0 },
    uSolDir: { value: new Vector3(0, 1, 0) },
    uCeuZenite: { value: new Color() },
    uCeuHorizonte: { value: new Color() },
    uCeuOposto: { value: new Color() },
    uCeuChao: { value: new Color() },
    uBrilhoDoSol: { value: new Color() },
    uLuzDoSol: { value: new Color() },
    uHemiCeu: { value: new Color() },
    uHemiChao: { value: new Color() },
    uNoite: { value: 0 },
    uEstrelas: { value: 0 },
    uNevoa: { value: 0.001 },
  };
}

/** As cores do site, convertidas para o espaço linear de trabalho. */
export const PALETA = {
  sinal: new Color('#c9ff3d'),
  brilho: new Color('#e6ff9a'),
  papel: new Color('#e7e7df'),
  mineral: new Color('#a5ada1'),
  aco: new Color('#30352d'),
  tinta: new Color('#090a08'),
} as const;

const CEU = /* glsl */ `
uniform vec3 uSolDir;
uniform vec3 uCeuZenite;
uniform vec3 uCeuHorizonte;
uniform vec3 uCeuOposto;
uniform vec3 uCeuChao;
uniform vec3 uBrilhoDoSol;
uniform vec3 uLuzDoSol;
uniform vec3 uHemiCeu;
uniform vec3 uHemiChao;
uniform float uNoite;
uniform float uNevoa;
uniform float uTempo;

vec3 corDoCeu(vec3 d) {
  float y = d.y;
  float acima = clamp(y, 0.0, 1.0);
  vec2 dh = normalize(d.xz + vec2(1e-5));
  vec2 sh = normalize(uSolDir.xz + vec2(1e-5));
  float lado = dot(dh, sh);
  float mesmoLado = max(lado, 0.0);
  // O horizonte esquenta do lado do sol e esfria do lado oposto.
  vec3 horizonte = mix(uCeuOposto, uCeuHorizonte, smoothstep(-0.6, 0.85, lado));
  vec3 c = mix(horizonte, uCeuZenite, pow(acima, 0.5));
  c = mix(c, uCeuChao, smoothstep(0.0, -0.12, y));
  float mu = max(dot(d, uSolDir), 0.0);
  float perto = 1.0 - acima;
  float baixo = 1.0 - smoothstep(0.05, 0.5, uSolDir.y);
  float faixa = pow(mesmoLado, 3.0) * exp(-abs(y) * 6.0) * smoothstep(-0.3, 0.02, uSolDir.y) * baixo;
  c += uBrilhoDoSol * (0.07 * pow(mu, 6.0) + 0.22 * pow(mu, 40.0)) * (0.35 + 0.65 * perto);
  c += uBrilhoDoSol * faixa * 0.5;
  return c;
}

vec3 corDaNevoa(vec3 d) {
  return corDoCeu(normalize(vec3(d.x, clamp(d.y, -0.05, 1.0) * 0.4 + 0.012, d.z)));
}

/** Névoa de curva cúbica: a cidade perto fica nítida e o horizonte (além de ~1,2 km) some. */
float fatorDaNevoa(float distancia) {
  float x = distancia * uNevoa;
  return 1.0 - exp(-x * x * x);
}

vec3 aplicarNevoa(vec3 cor, vec3 mundo) {
  vec3 v = mundo - cameraPosition;
  float d = length(v);
  return mix(cor, corDaNevoa(v / max(d, 1e-3)), fatorDaNevoa(d));
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

/** Linha suavizada de largura w em torno de c, sem serrilhado e sem moiré de longe. */
float linhaAA(float x, float c, float w) {
  float fw = max(fwidth(x), 1e-5);
  float cobertura = clamp((w * 0.5 - abs(x - c)) / fw + 0.5, 0.0, 1.0);
  return cobertura * clamp(w / fw, 0.25, 1.0);
}
`;

const FINAL = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;

/** Remenda um material padrão do three: céu e névoa direcional antes do mapeamento de tons. */
function remendarPadrao(
  material: MeshStandardMaterial,
  comuns: Comuns,
  chave: string,
  extra?: (shader: WebGLProgramParametersWithUniforms) => void,
): MeshStandardMaterial {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, comuns);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMundoPadrao;')
      .replace('#include <project_vertex>', `#include <project_vertex>
        #ifdef USE_INSTANCING
          vMundoPadrao = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
        #else
          vMundoPadrao = (modelMatrix * vec4(transformed, 1.0)).xyz;
        #endif`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vMundoPadrao;\n${CEU}\nvec3 nevoaDaVista(vec3 cor) {\n  return aplicarNevoa(cor, vMundoPadrao);\n}`)
      .replace('#include <tonemapping_fragment>', 'gl_FragColor.rgb = nevoaDaVista(gl_FragColor.rgb);\n#include <tonemapping_fragment>')
      .replace('#include <fog_fragment>', '');
    extra?.(shader);
  };
  material.customProgramCacheKey = () => `torrelio-${chave}`;
  return material;
}

export function padrao(comuns: Comuns, chave: string, parametros: MeshStandardMaterialParameters): MeshStandardMaterial {
  return remendarPadrao(new MeshStandardMaterial(parametros), comuns, chave);
}

// ------------------------------------------------------------------------- céu

export function materialDoCeu(comuns: Comuns): ShaderMaterial {
  return new ShaderMaterial({
    name: 'ceu',
    uniforms: { ...comuns },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vec4 mundo = modelMatrix * vec4(position, 1.0);
        vDir = mundo.xyz - cameraPosition;
        gl_Position = projectionMatrix * viewMatrix * mundo;
        gl_Position.z = gl_Position.w * 0.99999;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uEstrelas;
      ${CEU}
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        vec3 c = corDoCeu(d);
        float mu = dot(d, uSolDir);
        // Disco do sol, nítido, e uma coroa curta.
        float disco = smoothstep(0.99982, 0.99992, mu);
        c += uBrilhoDoSol * (disco * 16.0 + pow(max(mu, 0.0), 900.0) * 1.5) * smoothstep(-0.03, 0.01, uSolDir.y);
        // Estrelas por hash: pontos finos, mais densos no alto, nenhuma perto do horizonte.
        if (uEstrelas > 0.001 && d.y > 0.04) {
          vec3 p = d * 260.0;
          vec3 cel = floor(p);
          float h = hash13(cel);
          if (h > 0.9955) {
            vec3 centro = cel + 0.5 + (vec3(hash13(cel + 7.1), hash13(cel + 3.3), hash13(cel + 1.7)) - 0.5) * 0.6;
            float r = length(p - centro);
            float brilho = smoothstep(0.35, 0.0, r) * (0.35 + 0.65 * fract(h * 917.0));
            c += vec3(0.85, 0.9, 1.0) * brilho * uEstrelas * 0.55 * smoothstep(0.04, 0.3, d.y);
          }
        }
        gl_FragColor = vec4(c, 1.0);
        ${FINAL}
      }`,
    depthWrite: false,
    depthTest: false,
    side: BackSide,
  });
}

// ------------------------------------------------------------------------ vidro

export type UniformsDoVidro = {
  uSelecionada: Uniforme<number>;
  uPassando: Uniforme<number>;
  uPavimentoEmDestaque: Uniforme<number>;
  uVarredura: Uniforme<number>;
  uVarreduraForca: Uniforme<number>;
  uInteriores: Uniforme<number>;
  /** 0 a 1: no modo obra, a luz dos interiores some (ninguém mora num prédio em obra). */
  uLuzesDaObra: Uniforme<number>;
  uDuracao: Uniforme<number>;
  /** Escala da luz dos interiores (ajuste fino de arte). */
  uIntensidadeInterior: Uniforme<number>;
  uCorBrilho: Uniforme<Color>;
  uCorPapel: Uniforme<Color>;
};

/**
 * O vidro dos 480 vãos, instanciado. Por instância: `aLuz` (alvo, anterior, início, variação de
 * cortina) e `aDono` (a unidade ou o quarto). O vidro escuro reflete o céu por Fresnel (com uma
 * inclinação mínima por painel, para a fachada não virar um espelho perfeito), brilha com o sol e,
 * quando aceso, mostra um interior com profundidade: teto claro, piso, parede do fundo, cortinas.
 */
export function materialDoVidro(comuns: Comuns): { material: ShaderMaterial; uniforms: UniformsDoVidro } {
  const uniforms: UniformsDoVidro = {
    uSelecionada: { value: -1 },
    uPassando: { value: -1 },
    uPavimentoEmDestaque: { value: -1 },
    uVarredura: { value: -100 },
    uVarreduraForca: { value: 0 },
    uInteriores: { value: 1 },
    uLuzesDaObra: { value: 1 },
    uDuracao: { value: 0.4 },
    uIntensidadeInterior: { value: 0.5 },
    uCorBrilho: { value: PALETA.brilho.clone() },
    uCorPapel: { value: PALETA.papel.clone() },
  };
  const material = new ShaderMaterial({
    name: 'vidro',
    uniforms: { ...comuns, ...uniforms },
    vertexShader: /* glsl */ `
      attribute vec4 aLuz;
      attribute float aDono;
      uniform float uTempo;
      uniform float uDuracao;
      varying vec2 vUv;
      varying vec3 vMundo;
      varying vec3 vNormal;
      varying vec3 vTangente;
      varying vec2 vTamanho;
      varying float vLuz;
      varying float vVar;
      flat varying float vDono;
      flat varying float vId;
      varying float vPav;
      void main() {
        vUv = uv;
        mat4 m = modelMatrix * instanceMatrix;
        vec4 mundo = m * vec4(position, 1.0);
        vMundo = mundo.xyz;
        vTamanho = vec2(length(m[0].xyz), length(m[1].xyz));
        vNormal = normalize(m[2].xyz);
        vTangente = normalize(m[0].xyz);
        float t = clamp((uTempo - aLuz.z) / uDuracao, 0.0, 1.0);
        t = t * t * (3.0 - 2.0 * t);
        vLuz = mix(aLuz.y, aLuz.x, t);
        vVar = aLuz.w;
        vDono = aDono;
        vId = float(gl_InstanceID);
        vPav = floor(vId / 24.0) + 2.0;
        gl_Position = projectionMatrix * viewMatrix * mundo;
      }`,
    fragmentShader: /* glsl */ `
      ${CEU}
      uniform float uSelecionada;
      uniform float uPassando;
      uniform float uPavimentoEmDestaque;
      uniform float uVarredura;
      uniform float uVarreduraForca;
      uniform float uInteriores;
      uniform float uLuzesDaObra;
      uniform float uIntensidadeInterior;
      uniform vec3 uCorBrilho;
      uniform vec3 uCorPapel;
      varying vec2 vUv;
      varying vec3 vMundo;
      varying vec3 vNormal;
      varying vec3 vTangente;
      varying vec2 vTamanho;
      varying float vLuz;
      varying float vVar;
      flat varying float vDono;
      flat varying float vId;
      varying float vPav;

      vec3 interior(vec3 V, vec3 N, vec3 T, vec2 p, float h1, float h2) {
        vec3 B = vec3(0.0, 1.0, 0.0);
        vec3 d = -V;
        vec3 dt = vec3(dot(d, T), dot(d, B), dot(d, N));
        float profundidade = 4.4 + 1.2 * h2;
        float teto = 2.68;
        float piso = -0.1;
        float tFundo = profundidade / max(-dt.z, 1e-3);
        float tY = dt.y > 0.0 ? (teto - p.y) / max(dt.y, 1e-4) : (piso - p.y) / min(dt.y, -1e-4);
        float t = min(tFundo, tY);
        vec3 q = vec3(p, 0.0) + dt * t;
        float prof = clamp(-q.z / profundidade, 0.0, 1.0);
        vec3 c;
        if (tFundo < tY) {
          // Parede do fundo: um móvel baixo em parte dela, uma porta mais escura de vez em quando.
          float movel = step(q.y, 0.55 + 0.4 * h1) * step(0.35, fract(q.x * 0.23 + h2));
          float porta = step(abs(fract(q.x * 0.17 + h1) - 0.5), 0.06) * step(q.y, 2.1);
          c = vec3(0.58, 0.53, 0.46) * (0.55 + 0.45 * smoothstep(0.0, 2.6, q.y));
          c = mix(c, vec3(0.16, 0.13, 0.11), movel * 0.85);
          c = mix(c, vec3(0.3, 0.26, 0.22), porta * 0.6);
        } else if (dt.y > 0.0) {
          // Teto: claro, com a luminária no meio do cômodo.
          float luminaria = exp(-pow(length(vec2(fract(q.x / 3.2 + h1) - 0.5, prof - 0.45) * vec2(1.0, 1.6)) * 3.0, 2.0));
          c = vec3(0.7, 0.66, 0.6) * (0.75 + 1.6 * luminaria);
        } else {
          c = vec3(0.32, 0.24, 0.17) * (0.65 + 0.35 * prof);
        }
        return c * mix(1.15, 0.5, prof);
      }

      void main() {
        vec3 N = normalize(vNormal);
        vec3 T = normalize(vTangente);
        vec3 V = normalize(cameraPosition - vMundo);
        vec2 tam = vTamanho;
        vec2 p = vUv * tam;
        float nPaineis = tam.x > 3.5 ? 3.0 : 2.0;
        float painel = floor(vUv.x * nPaineis);
        float h1 = hash12(vec2(vId, painel + 1.0));
        float h2 = hash12(vec2(painel + 3.0, vId * 1.37));
        float h3 = hash12(vec2(vId * 0.71, 9.0));

        // Reflexo: cada painel levemente fora do prumo, como vidro de verdade.
        vec3 Np = normalize(N + T * (h1 - 0.5) * 0.03 + vec3(0.0, (h2 - 0.5) * 0.022, 0.0));
        float cosV = max(dot(Np, V), 0.0);
        // Vidro revestido (refletivo), como nas torres de verdade: F0 bem acima do vidro comum.
        float fresnel = 0.16 + 0.84 * pow(1.0 - cosV, 5.0);
        vec3 R = reflect(-V, Np);
        vec3 horizonte = corDoCeu(normalize(vec3(R.x, 0.015, R.z)));
        vec3 chao = uHemiChao * 0.16 + horizonte * 0.12;
        vec3 reflexo = R.y >= 0.0 ? corDoCeu(R) : mix(chao, horizonte, exp(R.y * 7.0));
        float sol = max(dot(R, uSolDir), 0.0);
        vec3 brilhoDoSol = uLuzDoSol * (pow(sol, 900.0) * 9.0 + pow(sol, 70.0) * 0.18) * smoothstep(-0.02, 0.04, uSolDir.y);

        // Interior: a luz da unidade (com fade) e um fundo escuro de dia.
        // De dia o olho está acostumado ao céu claro: a mesma lâmpada aparece bem menos.
        float luz = vLuz * uLuzesDaObra * uIntensidadeInterior * mix(0.07, 1.0, uNoite * uNoite);
        vec3 lampada = mix(vec3(1.0, 0.62, 0.32), vec3(1.0, 0.78, 0.55), h3);
        vec3 dentro = uInteriores > 0.5 ? interior(V, N, T, p, h1, h2) : vec3(0.5, 0.46, 0.4) * (0.55 + 0.45 * vUv.y);
        // Nem todo cômodo aceso tem a mesma luz: uns mais fortes, um ou outro só com abajur.
        float comodo = hash12(vec2(vId * 0.37, 5.0));
        float intensidade = comodo < 0.18 ? 0.28 : 0.5 + 0.55 * comodo;
        vec3 transmitido = dentro * lampada * luz * intensidade + uHemiCeu * 0.03 * (0.6 + 0.4 * dentro);

        // Cortinas e persianas, sorteadas por vão.
        if (vVar > 0.62) {
          float abertura = 0.22 + 0.5 * fract(vVar * 13.0);
          float lado = fract(vVar * 31.0) > 0.5 ? vUv.x : 1.0 - vUv.x;
          float tecido = smoothstep(abertura - 0.02, abertura + 0.02, lado);
          vec3 voal = (lampada * luz * 0.7 + uHemiCeu * 0.08) * (0.8 + 0.2 * vUv.y);
          transmitido = mix(transmitido, voal, tecido * 0.72);
        } else if (vVar > 0.42) {
          float descida = 0.15 + 0.55 * fract(vVar * 7.0);
          float persiana = step(1.0 - descida, vUv.y);
          float lamina = 0.75 + 0.25 * smoothstep(0.35, 0.5, abs(fract(p.y * 8.0) - 0.5));
          vec3 cor = (lampada * luz * 0.45 + uHemiCeu * 0.05) * lamina;
          transmitido = mix(transmitido, cor, persiana * 0.85);
        }

        vec3 cor = transmitido * 0.8 * (1.0 - fresnel) + reflexo * fresnel + brilhoDoSol;

        // Caixilhos desenhados: montantes entre painéis e trilhos em cima e embaixo, em bronze.
        float caixilho = 0.0;
        for (float i = 1.0; i < 3.0; i += 1.0) {
          if (i < nPaineis) caixilho = max(caixilho, linhaAA(p.x, tam.x * i / nPaineis, 0.06));
        }
        caixilho = max(caixilho, 1.0 - smoothstep(0.05, 0.08, p.y));
        caixilho = max(caixilho, smoothstep(tam.y - 0.07, tam.y - 0.04, p.y));
        vec3 bronze = vec3(0.045, 0.034, 0.025) * (uHemiCeu * 1.4 + uLuzDoSol * max(dot(N, uSolDir), 0.0) * 0.9 + 0.02);
        cor = mix(cor, bronze, caixilho * 0.92);

        // Seleção, ponteiro, andar em destaque e a varredura da entrada.
        float ehSel = 1.0 - step(0.5, abs(vDono - uSelecionada));
        float ehPas = (1.0 - step(0.5, abs(vDono - uPassando))) * (1.0 - ehSel);
        float ehAndar = 1.0 - step(0.5, abs(vPav - uPavimentoEmDestaque));
        cor += uCorPapel * 0.04 * ehPas * (1.0 - ehSel) + uCorPapel * 0.03 * ehAndar;
        cor += uCorBrilho * uVarreduraForca * exp(-pow((vMundo.y - uVarredura) / 0.5, 2.0)) * 0.8;

        gl_FragColor = vec4(aplicarNevoa(cor, vMundo), 1.0);
        ${FINAL}
      }`,
  });
  return { material, uniforms };
}

// ------------------------------------------------------------------------ halos

/** Brilho aditivo em volta das janelas acesas, sem pós-processamento: uma chamada para todos. */
export function materialDosHalos(comuns: Comuns): { material: ShaderMaterial; forca: Uniforme<number> } {
  const forca = { value: 1 };
  const material = new ShaderMaterial({
    name: 'halos',
    uniforms: { ...comuns, uDuracao: { value: 0.4 }, uForca: forca, uLuzesDaObra: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec4 aLuz;
      uniform float uTempo;
      uniform float uDuracao;
      uniform float uLuzesDaObra;
      varying vec2 vUv;
      varying float vLuz;
      varying vec3 vMundo;
      void main() {
        float t = clamp((uTempo - aLuz.z) / uDuracao, 0.0, 1.0);
        t = t * t * (3.0 - 2.0 * t);
        vLuz = mix(aLuz.y, aLuz.x, t) * uLuzesDaObra;
        vUv = uv;
        vec4 mundo = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vMundo = mundo.xyz;
        gl_Position = vLuz < 0.01 ? vec4(0.0, 0.0, 2.0, 1.0) : projectionMatrix * viewMatrix * mundo;
      }`,
    fragmentShader: /* glsl */ `
      ${CEU}
      uniform float uForca;
      varying vec2 vUv;
      varying float vLuz;
      varying vec3 vMundo;
      void main() {
        vec2 q = (vUv - 0.5) * vec2(2.0, 2.0);
        float d = length(q * vec2(1.0, 1.15));
        float a = pow(max(1.0 - d, 0.0), 2.2);
        float longe = 1.0 - fatorDaNevoa(length(vMundo - cameraPosition));
        vec3 cor = vec3(1.0, 0.66, 0.36) * a * vLuz * uForca * 0.26 * uNoite * longe;
        gl_FragColor = vec4(cor, 1.0);
        ${FINAL}
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  return { material, forca };
}

// ---------------------------------------------------------------------- contorno

export type UniformsDoContorno = {
  uContornar: Uniforme<number>;
  uSelecionada: Uniforme<number>;
  uMundoPorPixel: Uniforme<number>;
  uOndaY: Uniforme<number>;
  uOnda: Uniforme<number>;
  /** 1 no modo hotel: os quartos bloqueados aparecem com tracejado mineral. */
  uBloqueios: Uniforme<number>;
};

/**
 * Contorno das disponíveis (`#C9FF3D`, o único verde do 3D), tracejado mineral dos quartos
 * bloqueados e o marcador da selecionada (`#E6FF9A`), num só desenho: uma instância por trecho de
 * fachada de cada unidade. A espessura acompanha a distância, para a linha não sumir de longe.
 */
export function materialDoContorno(): { material: ShaderMaterial; uniforms: UniformsDoContorno } {
  const uniforms: UniformsDoContorno = {
    uContornar: { value: 0 },
    uSelecionada: { value: -1 },
    uMundoPorPixel: { value: 0.001 },
    uOndaY: { value: -100 },
    uOnda: { value: 0 },
    uBloqueios: { value: 0 },
  };
  const material = new ShaderMaterial({
    name: 'contorno',
    uniforms: {
      ...uniforms,
      uSinal: { value: PALETA.sinal.clone() },
      uBrilho: { value: PALETA.brilho.clone() },
      uMineral: { value: PALETA.mineral.clone() },
    },
    vertexShader: /* glsl */ `
      attribute vec2 aTamanho;
      attribute float aDono;
      attribute vec2 aEstado;
      uniform float uMundoPorPixel;
      uniform float uSelecionada;
      varying vec2 vMetros;
      varying vec2 vTamanho;
      varying float vPixel;
      flat varying vec2 vEstado;
      flat varying float vSel;
      varying float vCentroY;
      void main() {
        vec4 centro = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        vec4 mundo = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vPixel = length(cameraPosition - centro.xyz) * uMundoPorPixel;
        vTamanho = aTamanho;
        vMetros = uv * aTamanho;
        vEstado = aEstado;
        vSel = 1.0 - step(0.5, abs(aDono - uSelecionada));
        vCentroY = centro.y;
        gl_Position = projectionMatrix * viewMatrix * mundo;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uContornar;
      uniform float uOndaY;
      uniform float uOnda;
      uniform float uBloqueios;
      uniform vec3 uSinal;
      uniform vec3 uBrilho;
      uniform vec3 uMineral;
      varying vec2 vMetros;
      varying vec2 vTamanho;
      varying float vPixel;
      flat varying vec2 vEstado;
      flat varying float vSel;
      varying float vCentroY;
      float faixa(float dBorda, float largura, float px) {
        return 1.0 - smoothstep(largura - px * 0.75, largura + px * 0.75, dBorda);
      }
      void main() {
        vec2 p = vMetros;
        float dBorda = min(min(p.x, vTamanho.x - p.x), min(p.y, vTamanho.y - p.y));
        float px = max(vPixel, 1e-4);
        vec4 cor = vec4(0.0);
        if (vSel > 0.5) {
          float largura = max(0.07, 1.9 * px);
          cor = vec4(uBrilho, faixa(dBorda, largura, px));
        } else if (vEstado.y > 0.5 && uBloqueios > 0.5) {
          float largura = max(0.05, 1.5 * px);
          float s = (p.y < largura * 2.0 || p.y > vTamanho.y - largura * 2.0) ? p.x : p.y;
          float traco = step(0.45, fract(s / max(0.55, 14.0 * px)));
          cor = vec4(uMineral, faixa(dBorda, largura, px) * traco * 0.9);
        } else if (vEstado.x > 0.5) {
          float onda = uOnda * exp(-pow((vCentroY - uOndaY) / 5.0, 2.0));
          float alfa = max(uContornar, onda);
          float largura = max(0.06, 1.7 * px);
          cor = vec4(uSinal, faixa(dBorda, largura, px) * alfa);
        }
        if (cor.a < 0.004) discard;
        gl_FragColor = cor;
        ${FINAL}
      }`,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    side: DoubleSide,
    blending: NormalBlending,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  return { material, uniforms };
}

// -------------------------------------------------------------------------- anel

/** O anel fino no nível da laje da unidade selecionada (instância 0) e a faixa do andar em destaque (1). */
export function materialDoAnel(): ShaderMaterial {
  return new ShaderMaterial({
    name: 'anel',
    uniforms: { uBrilho: { value: PALETA.brilho.clone() }, uPapel: { value: PALETA.papel.clone() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      flat varying float vQual;
      void main() {
        vUv = uv;
        vQual = float(gl_InstanceID);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uBrilho;
      uniform vec3 uPapel;
      varying vec2 vUv;
      flat varying float vQual;
      void main() {
        vec4 cor;
        if (vQual < 0.5) {
          cor = vec4(uBrilho, 0.95);
        } else {
          float borda = max(smoothstep(0.92, 1.0, vUv.y), 1.0 - smoothstep(0.0, 0.08, vUv.y));
          cor = vec4(uPapel, 0.07 + 0.55 * borda);
        }
        gl_FragColor = cor;
        ${FINAL}
      }`,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    side: DoubleSide,
  });
}

// ------------------------------------------------------------------------- água

/** Mar, lago e piscina: reflexo do céu por Fresnel, brilho do sol e ondulação leve. */
export function materialDaAgua(comuns: Comuns): ShaderMaterial {
  return new ShaderMaterial({
    name: 'agua',
    uniforms: { ...comuns },
    vertexShader: /* glsl */ `
      attribute vec3 aCorDaAgua;
      attribute float aBrilho;
      varying vec3 vMundo;
      varying vec3 vCor;
      varying float vBrilho;
      void main() {
        vec4 mundo = modelMatrix * vec4(position, 1.0);
        vMundo = mundo.xyz;
        vCor = aCorDaAgua;
        vBrilho = aBrilho;
        gl_Position = projectionMatrix * viewMatrix * mundo;
      }`,
    fragmentShader: /* glsl */ `
      ${CEU}
      varying vec3 vMundo;
      varying vec3 vCor;
      varying float vBrilho;
      void main() {
        vec2 q = vMundo.xz;
        float t = uTempo;
        float dist = length(cameraPosition - vMundo);
        vec2 g = vec2(0.0);
        g += vec2(cos(dot(q, vec2(0.071, 0.043)) + t * 0.8), cos(dot(q, vec2(-0.037, 0.083)) + t * 0.95)) * 0.05;
        g += vec2(cos(dot(q, vec2(0.23, -0.17)) + t * 1.6), cos(dot(q, vec2(0.13, 0.29)) + t * 1.75)) * 0.025;
        g += vec2(cos(dot(q, vec2(0.61, 0.47)) + t * 2.3), cos(dot(q, vec2(-0.53, 0.71)) + t * 2.6)) * 0.012;
        g *= 1.0 / (1.0 + dist * 0.006);
        vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
        vec3 V = normalize(cameraPosition - vMundo);
        // Longe, as ondas viram rugosidade: o reflexo pega um céu mais alto (mais escuro) e o mar
        // não some contra o horizonte, como nas fotos do litoral.
        float rugosidade = smoothstep(80.0, 900.0, dist) * 0.22;
        float fresnel = min(0.52, 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0));
        vec3 R = reflect(-V, N);
        R = normalize(vec3(R.x, max(R.y, 0.0) + rugosidade, R.z));
        vec3 reflexo = corDoCeu(R) * 0.78;
        float sol = max(dot(reflect(-V, N), uSolDir), 0.0);
        vec3 brilho = uLuzDoSol * (pow(sol, 260.0) * 3.0 + pow(sol, 18.0) * 0.12) * smoothstep(-0.02, 0.05, uSolDir.y);
        vec3 fundo = vCor * (uHemiCeu * 0.95 + uLuzDoSol * 0.1 * max(uSolDir.y, 0.0));
        vec3 cor = mix(fundo, reflexo, fresnel) + brilho;
        // A piscina do rooftop acende de noite, em água-marinha discreta.
        cor += vec3(0.08, 0.32, 0.30) * vBrilho * uNoite * (0.8 + 0.2 * sin(q.x * 3.0 + t));
        gl_FragColor = vec4(aplicarNevoa(cor, vMundo), 1.0);
        ${FINAL}
      }`,
  });
}

// ------------------------------------------------------------------------ cidade

/**
 * Os prédios da cidade: caixas instanciadas com janelas procedurais (grade por `fract`, acesas por
 * hash à noite). Por instância: `aJanela` (altura do andar, módulo horizontal, fração acesa,
 * semente) e `aEstilo` (altura do térreo de lojas, tipo: 0 prédio, 1 casa, 2 equipamento, 3 escritório).
 */
export function materialDosPredios(comuns: Comuns): MeshStandardMaterial {
  const material = new MeshStandardMaterial({ roughness: 0.86, metalness: 0, name: 'predios' });
  return remendarPadrao(material, comuns, 'predios', (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec4 aJanela;
        attribute vec2 aEstilo;
        varying vec3 vPredio;
        varying vec3 vNormalLocal;
        varying vec4 vJanela;
        varying vec3 vEstilo;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vPredio = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;
        vNormalLocal = normal;
        vJanela = aJanela;
        vEstilo = vec3(aEstilo, length(instanceMatrix[1].xyz));
        vPredio.y -= instanceMatrix[3].y;`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec3 vPredio;
        varying vec3 vNormalLocal;
        varying vec4 vJanela;
        varying vec3 vEstilo;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float mascaraJanela = 0.0;
        vec3 luzDaJanela = vec3(0.0);
        {
          vec3 nL = normalize(vNormalLocal);
          float tipo = vEstilo.y;
          float altura = vEstilo.z;
          if (abs(nL.y) < 0.5 && (tipo < 1.5 || tipo > 2.5)) {
            float s = abs(nL.x) > 0.5 ? vPredio.z : vPredio.x;
            float y = vPredio.y;
            float andar = vJanela.x;
            float modulo = vJanela.y;
            float terreo = vEstilo.x;
            float topo = altura - (tipo > 0.5 ? 0.0 : 1.0);
            float fs = s / modulo;
            float fy = (y - terreo) / andar;
            float largura = tipo > 3.5 ? 0.9 : tipo > 2.5 ? 0.84 : tipo > 0.5 ? 0.34 : 0.56;
            float alturaJ = tipo > 3.5 ? 0.5 : tipo > 2.5 ? 0.7 : tipo > 0.5 ? 0.42 : 0.52;
            float ax = fract(fs);
            float ay = fract(fy);
            float jx = smoothstep(0.5 - largura * 0.5 - 0.03, 0.5 - largura * 0.5, ax) * (1.0 - smoothstep(0.5 + largura * 0.5, 0.5 + largura * 0.5 + 0.03, ax));
            float jy = smoothstep(0.24, 0.27, ay) * (1.0 - smoothstep(0.24 + alturaJ, 0.27 + alturaJ, ay));
            float dentro = step(terreo + 0.2, y) * step(y, topo - 0.25);
            // De longe, a grade vira média: sem moiré.
            float nitidez = clamp(1.6 - max(fwidth(fs), fwidth(fy)) * 2.2, 0.0, 1.0);
            float grade = mix(largura * alturaJ, jx * jy, nitidez);
            float loja = terreo > 0.5 ? step(0.6, y) * step(y, terreo - 0.5) * (1.0 - 0.6 * step(0.86, fract(s / 6.0))) : 0.0;
            mascaraJanela = max(grade * dentro, loja);
            // Escritórios acendem por andar inteiro (faixas, como nas fotos de skyline); casas e
            // apartamentos, janela a janela.
            bool ehEscritorio = tipo > 2.5 && tipo < 3.5;
            float coluna = tipo > 3.5 ? floor(fs / 4.0) : floor(fs);
            float sorteio = ehEscritorio ? hash13(vec3(floor(fy), floor(fs / 9.0), vJanela.w)) : hash13(vec3(floor(fy), coluna, vJanela.w));
            float acesa = step(sorteio, vJanela.z) * dentro + loja * step(0.45, hash12(vec2(floor(s / 6.0), vJanela.w)));
            vec3 morna = mix(vec3(1.0, 0.52, 0.22), vec3(1.0, 0.7, 0.42), fract(sorteio * 7.0));
            vec3 fria = vec3(0.72, 0.8, 0.9);
            vec3 tom = ehEscritorio ? mix(fria, morna, step(0.6, fract(sorteio * 3.0))) : morna;
            float escritorio = ehEscritorio ? 0.38 : 1.0;
            luzDaJanela = tom * acesa * mascaraJanela * uNoite * escritorio * (0.35 + 0.5 * fract(sorteio * 13.0)) * mix(1.0, 0.45, 1.0 - nitidez);
            vec3 vidroDia = mix(uCeuOposto, uCeuZenite, 0.4) * 0.3 + vec3(0.01, 0.013, 0.016);
            diffuseColor.rgb = mix(diffuseColor.rgb, vidroDia, mascaraJanela * 0.9);
          } else if (nL.y > 0.5) {
            diffuseColor.rgb *= 0.72 + 0.12 * hash12(floor(vPredio.xz / 3.0));
          }
        }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.22, mascaraJanela);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += luzDaJanela * 0.8;`);
  });
}

/** Material com vértices "acesos": cabeças dos postes, forro das varandas, banho do coroamento. */
export function materialComBrilho(
  comuns: Comuns,
  chave: string,
  parametros: MeshStandardMaterialParameters,
  brilho: { atributo: 'aAceso' | 'aBanho' | 'aLuzForro'; cor: Color; forca: number; curva?: boolean; banhoDaBase?: boolean },
): MeshStandardMaterial {
  const material = new MeshStandardMaterial(parametros);
  const uDuracao = { value: 0.4 };
  const uLuzesDaObra = { value: 1 };
  material.userData['uLuzesDaObra'] = uLuzesDaObra;
  return remendarPadrao(material, comuns, chave, (shader) => {
    shader.uniforms['uCorDoBrilho'] = { value: brilho.cor };
    shader.uniforms['uForcaDoBrilho'] = { value: brilho.forca };
    shader.uniforms['uDuracao'] = uDuracao;
    shader.uniforms['uLuzesDaObra'] = uLuzesDaObra;
    const tipo = brilho.atributo === 'aLuzForro' ? 'vec3' : 'float';
    const calculo = brilho.atributo === 'aLuzForro'
      ? `float tF = clamp((uTempo - aLuzForro.z) / uDuracao, 0.0, 1.0); tF = tF * tF * (3.0 - 2.0 * tF); vAceso = mix(aLuzForro.y, aLuzForro.x, tF) * uLuzesDaObra * mix(0.22, 1.0, uNoite);`
      : `vAceso = ${brilho.atributo} * uNoite;`;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        attribute ${tipo} ${brilho.atributo};
        uniform float uTempo;
        uniform float uNoite;
        uniform float uDuracao;
        uniform float uLuzesDaObra;
        varying float vAceso;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        ${calculo}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec3 uCorDoBrilho;
        uniform float uForcaDoBrilho;
        varying float vAceso;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance += uCorDoBrilho * uForcaDoBrilho * ${brilho.curva ? 'vAceso * vAceso * vAceso' : 'vAceso'};
        ${brilho.banhoDaBase ? `{
          // Luz de baixo para cima nos primeiros andares, a partir das jardineiras do terraço.
          float acima = vMundoPadrao.y - 7.6;
          float lateral = 1.0 - abs(normalize(vNormal).y);
          totalEmissiveRadiance += vec3(1.0, 0.72, 0.45) * 0.07 * uNoite * lateral * step(0.0, acima) * exp(-acima / 9.0);
        }` : ''}`);
  });
}

// ------------------------------------------------------------------- luzes da rua

/**
 * Poças de luz no chão e brilho das lâmpadas (postes, marquise, farol, pergolado): quads aditivos
 * instanciados, uma chamada. `aTipo`: 0 poça no chão, 1 brilho voltado para a câmera, 2 o farol.
 */
export function materialDasLuzes(comuns: Comuns): ShaderMaterial {
  return new ShaderMaterial({
    name: 'luzes',
    uniforms: { ...comuns, uFarol: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec3 aCorDaLuz;
      attribute float aTipo;
      varying vec2 vUv;
      varying vec3 vCor;
      flat varying float vTipo;
      varying vec3 vMundo;
      void main() {
        vUv = uv;
        vCor = aCorDaLuz;
        vTipo = aTipo;
        vec4 centro = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        if (aTipo > 0.5) {
          float tamanho = length(instanceMatrix[0].xyz);
          vec4 vista = viewMatrix * centro;
          vista.xy += position.xy * tamanho;
          vMundo = centro.xyz;
          gl_Position = projectionMatrix * vista;
        } else {
          vec4 mundo = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vMundo = mundo.xyz;
          gl_Position = projectionMatrix * viewMatrix * mundo;
        }
      }`,
    fragmentShader: /* glsl */ `
      ${CEU}
      uniform float uFarol;
      varying vec2 vUv;
      varying vec3 vCor;
      flat varying float vTipo;
      varying vec3 vMundo;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = vTipo < 0.5 ? pow(max(1.0 - d, 0.0), 1.8) * 0.5 : pow(max(1.0 - d, 0.0), 3.0) + smoothstep(0.16, 0.0, d) * 1.5;
        float forca = uNoite;
        if (vTipo > 1.5) {
          // O farol gira devagar e pisca quando o facho passa pela câmera; parado, fica aceso.
          vec2 paraCamera = normalize(cameraPosition.xz - vMundo.xz);
          float facho = uTempo * 0.9;
          float alinhado = pow(max(dot(paraCamera, vec2(cos(facho), sin(facho))), 0.0), 24.0);
          forca *= mix(0.55, 0.35 + 2.4 * alinhado, uFarol);
        }
        float longe = 1.0 - fatorDaNevoa(length(vMundo - cameraPosition)) * 0.85;
        gl_FragColor = vec4(vCor * a * forca * longe, 1.0);
        ${FINAL}
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

// --------------------------------------------------------------------- mergulho

/** O mergulho no escuro entre o voo e a vista: um quadro preto na tela inteira. */
export function materialDoMergulho(): ShaderMaterial {
  return new ShaderMaterial({
    name: 'mergulho',
    uniforms: { uAlfa: { value: 0 } },
    vertexShader: 'void main() { gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }',
    fragmentShader: `uniform float uAlfa; void main() { gl_FragColor = vec4(0.012, 0.014, 0.012, uAlfa); }`,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
}

// ------------------------------------------------------------------- texturas

function canvas(lado: number) {
  const c = document.createElement('canvas');
  c.width = lado;
  c.height = lado;
  return { c, g: c.getContext('2d')! };
}

function sorteio(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function textura(c: HTMLCanvasElement, repetir = true): Texture {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  if (repetir) {
    t.wrapS = RepeatWrapping;
    t.wrapT = RepeatWrapping;
  }
  t.anisotropy = 4;
  return t;
}

/** Pedra cinza-quente em placas de 1,2 × 0,6 m com juntas finas; a textura cobre 4,8 × 4,8 m. */
export function texturaDePedra(): Texture {
  const { c, g } = canvas(512);
  const s = sorteio(77);
  const px = 512 / 4.8;
  for (let linha = 0; linha < 8; linha += 1) {
    const deslocamento = (linha % 2) * 0.6;
    for (let coluna = -1; coluna < 5; coluna += 1) {
      const x = (coluna * 1.2 + deslocamento) * px;
      const y = linha * 0.6 * px;
      const tom = 206 + Math.round((s() - 0.5) * 22);
      g.fillStyle = `rgb(${tom + 8}, ${tom + 3}, ${tom - 6})`;
      g.fillRect(x, y, 1.2 * px, 0.6 * px);
      for (let i = 0; i < 90; i += 1) {
        const k = Math.round((s() - 0.5) * 30);
        g.fillStyle = `rgba(${tom + k}, ${tom + k - 4}, ${tom + k - 10}, 0.35)`;
        g.fillRect(x + s() * 1.2 * px, y + s() * 0.6 * px, 1 + s() * 3, 1 + s() * 2);
      }
    }
  }
  g.fillStyle = 'rgba(70, 64, 58, 0.7)';
  for (let linha = 0; linha <= 8; linha += 1) g.fillRect(0, linha * 0.6 * px - 1, 512, 2);
  for (let linha = 0; linha < 8; linha += 1) {
    const deslocamento = (linha % 2) * 0.6;
    for (let coluna = -1; coluna < 5; coluna += 1) g.fillRect((coluna * 1.2 + deslocamento) * px - 1, linha * 0.6 * px, 2, 0.6 * px);
  }
  return textura(c);
}

/** Forro de madeira em réguas de 12 cm; a textura cobre 2 × 2 m. */
export function texturaDeMadeira(): Texture {
  const { c, g } = canvas(256);
  const s = sorteio(31);
  const px = 256 / 2;
  for (let i = 0; i < 2 / 0.12; i += 1) {
    const tom = 160 + Math.round((s() - 0.5) * 40);
    g.fillStyle = `rgb(${tom}, ${Math.round(tom * 0.82)}, ${Math.round(tom * 0.68)})`;
    g.fillRect(0, i * 0.12 * px, 256, 0.12 * px);
    for (let k = 0; k < 14; k += 1) {
      g.fillStyle = `rgba(70, 40, 20, ${0.08 + s() * 0.1})`;
      g.fillRect(0, i * 0.12 * px + s() * 0.12 * px, 256, 1);
    }
    g.fillStyle = 'rgba(30, 18, 10, 0.8)';
    g.fillRect(0, (i + 1) * 0.12 * px - 1.5, 256, 1.5);
  }
  return textura(c);
}

/** Descarta materiais e as texturas deles. */
export function descartarMaterial(m: Material): void {
  for (const valor of Object.values(m as unknown as Record<string, unknown>)) {
    if (valor && typeof valor === 'object' && 'isTexture' in valor) (valor as Texture).dispose();
  }
  m.dispose();
}
