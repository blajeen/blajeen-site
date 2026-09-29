/**
 * Renderizador WebGL2 do conduto.
 *
 * Um único draw por quadro: uma faixa de triângulos ao longo do trajeto. O fragment shader
 * reconstrói, a partir da posição através da faixa, o corte de um cilindro de vidro com líquido
 * dentro, como numa foto de estúdio: Fresnel de verdade (o vidro reflete pouco de frente e quase
 * tudo de lado), reflexos de caixas de luz em platô, um deles seguindo o ponteiro, dispersão na
 * silhueta, a lente do vidro ampliando o líquido, volume e escurecimento na borda da coluna,
 * menisco côncavo parado e esticado correndo, bolhas que sobem para o alto do tubo, espuma na
 * frente, sombra com o fio de luz verde que o tubo concentra no papel e as luvas de aço escovado
 * com o LED que acende quando o líquido passa. Só os pixels da faixa rodam o shader, então o custo
 * não cresce com a tela.
 *
 * Cores: nenhum hex aqui. Elas chegam dos tokens do tema, e o conduto acrescenta papéis que ficam
 * registrados no plano mestre: sinal (`--color-signal`) é o líquido e a luz verde que ele projeta;
 * tinta (`--color-ink`) é a profundidade, a borda escura da coluna e a sombra, nunca preto chapado;
 * brilho técnico (`--color-glow`) nos reflexos (menisco, bolhas, luz que volta de dentro do
 * líquido) e no núcleo aceso da coluna; papel (`--color-paper`), o branco do sistema, nos
 * reflexos do vidro; aço
 * (`--color-steel`) no metal das luvas. Nenhuma cor passa do valor do próprio token.
 */

import { FLOATS_POR_VERTICE, MAXIMO_DE_JUNTAS, MEIA_FAIXA, MEIA_LUVA, malha, type Trajeto } from './trajeto';

export type Rgb = [number, number, number];

/** Distância entre dois pulsos de energia ao longo do tubo, em px. */
export const ESPACO_DO_PULSO = 2600;

/** Sem compilação paralela, quanto esperar (ms) antes de perguntar se o shader ficou pronto. */
const ESPERA_SEM_COMPILACAO_PARALELA = 400;

export type Cores = {
  sinal: Rgb;
  brilho: Rgb;
  papel: Rgb;
  aco: Rgb;
  tinta: Rgb;
};

export type Quadro = {
  /** Canto superior esquerdo do canvas, nas coordenadas da camada (px CSS). */
  origemX: number;
  origemY: number;
  /** Tamanho do canvas em px CSS. */
  largura: number;
  altura: number;
  /** Frente do líquido, em comprimento de arco. */
  nivel: number;
  /** Comprimento do menisco: cresce com a velocidade, o líquido "estica" quando corre. */
  menisco: number;
  /** De 0 (parado) a 1 (correndo rápido): muda a forma do menisco e traz espuma para a frente. */
  correndo: number;
  /** Deslocamento acumulado da correnteza, em px. */
  fluxo: number;
  /** Fase do pulso de energia, em px. */
  pulso: number;
  /** 1 com movimento; 0 desliga o pulso (senão ele ficaria congelado como uma faixa clara). */
  pulsoLigado: number;
  tempo: number;
  /** Luz pontual: x e y na camada, z é a altura sobre a página. */
  luz: [number, number, number];
};

export type Renderizador = {
  /**
   * Começa a compilar o shader. Fica separado da criação do contexto: o contexto nasce cedo,
   * quando a GPU está livre, e a compilação espera a vez na fila (`fila-da-gpu.ts`).
   */
  compilar(): void;
  /**
   * `true` quando o programa já compilou e pode desenhar. Com `KHR_parallel_shader_compile` a
   * compilação corre fora da thread principal e isto só confere se ela acabou, sem esperar.
   */
  pronto(): boolean;
  /** A compilação falhou de vez: o conduto não aparece. */
  falhou(): boolean;
  /** O navegador tirou o contexto (GPU reiniciada); o evento `webglcontextrestored` devolve. */
  perdido(): boolean;
  trajeto(t: Trajeto): void;
  cores(c: Cores): void;
  tamanho(larguraPx: number, alturaPx: number): void;
  desenhar(q: Quadro): void;
  destruir(): void;
};

const VERTICE = `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in float aS;
layout(location = 2) in float aV;
layout(location = 3) in vec2 aN;
uniform vec2 uOrigem;
uniform vec2 uTamanho;
out float vS;
out float vV;
out vec2 vN;
out vec2 vPx;
void main() {
  vec2 p = (aPos - uOrigem) / uTamanho;
  gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
  vS = aS;
  vV = aV;
  vN = aN;
  vPx = aPos;
}`;

const FRAGMENTO = `#version 300 es
precision highp float;

in float vS;
in float vV;
in vec2 vN;
in vec2 vPx;

uniform float uRaio;
uniform float uNivel;
uniform float uMenisco;
uniform float uCorrendo;
uniform float uFluxo;
uniform float uPulso;
uniform float uPulsoLigado;
uniform float uTempo;
uniform vec3 uLuz;
uniform vec3 uSinal;
uniform vec3 uBrilho;
uniform vec3 uPapel;
uniform vec3 uAco;
uniform vec3 uTinta;
uniform float uJuntas[${MAXIMO_DE_JUNTAS}];
uniform int uNJuntas;

out vec4 cor;

// Raio aparente do líquido. A parede tem cerca de 18% do raio, mas o vidro curvo funciona como lente
// e amplia o miolo: com líquido dentro, ele parece encher quase o tubo inteiro, como numa foto.
const float MIOLO = 0.88;
// Reflexão do vidro olhado de frente (Fresnel de Schlick, índice 1,5).
const float F0 = 0.04;
const float MEIA_FAIXA = ${MEIA_FAIXA.toFixed(2)};
const float MEIA_LUVA = ${MEIA_LUVA.toFixed(2)};
const float ESPACO_PULSO = ${ESPACO_DO_PULSO.toFixed(1)};

// "Hash without Sine", Copyright (c) 2014 David Hoskins, licença MIT
// (https://www.shadertoy.com/view/4djSRW): estável mesmo com coordenadas grandes.
float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1.0, 0.0)), f.x),
             mix(h12(i + vec2(0.0, 1.0)), h12(i + vec2(1.0, 1.0)), f.x), f.y);
}
vec4 sobre(vec4 cima, vec4 baixo) { return cima + baixo * (1.0 - cima.a); }
float fresnel(float c) {
  float m = max(1.0 - c, 0.0);
  float m2 = m * m;
  return F0 + (1.0 - F0) * m2 * m2 * m;
}
// Sino de Gauss. Sem pow: em GLSL ES, pow de base negativa é indefinido e alguns drivers devolvem
// NaN, o que apagaria o líquido.
float sino(float t) { return exp(-t * t); }

// Reflexo de uma caixa de luz de estúdio num cilindro. A normal de um cilindro nunca aponta ao
// longo do eixo, então a direção da luz é projetada no plano do corte. O resultado é um platô com
// bordas suaves (o reflexo de uma janela, e não de um ponto), esticado ao longo do tubo, e mais
// fraco quando a luz vem quase na direção do eixo. A comparação é pelos cossenos (os limites são
// constantes e o compilador os resolve), sem acos: o shader compila mais depressa.
float janela(vec3 R, vec3 L, vec3 T, float meia, float suave) {
  vec3 Lc = L - dot(L, T) * T;
  float k = length(Lc);
  return smoothstep(cos(meia + suave), cos(meia), dot(R, Lc / max(k, 1e-4))) * k;
}

// Linha fina de luz na silhueta do vidro, onde ele reflete quase tudo de lado.
float silhueta(float a, float aa) {
  return smoothstep(0.86, 0.99, a) * (1.0 - smoothstep(1.0 - aa, 1.0 + aa, a));
}

void main() {
  vec2 n = normalize(vN);
  vec3 T = vec3(n.y, -n.x, 0.0);
  float x = vV;
  float a = abs(x);
  float aa = max(fwidth(vV), 1e-4) * 1.25;
  float aaS = max(fwidth(vS), 1e-4) * 1.25;

  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 Lk = normalize(vec3(-0.55, -0.62, 0.56));     // caixa de luz principal, alto à esquerda
  vec3 Lr = normalize(vec3(0.85, 0.35, 0.12));       // contraluz rasante, à direita e embaixo
  vec3 Lp = normalize(vec3(uLuz.xy - vPx, uLuz.z));  // luz que acompanha o ponteiro

  float corpo = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, a);
  float miolo = 1.0 - smoothstep(MIOLO - aa, MIOLO + aa, a);
  float cheio = (1.0 - smoothstep(uNivel - 26.0, uNivel + 2.0, vS)) * step(0.0, vS);

  // ------------------------------------------------------------ superfície do vidro
  float cz = sqrt(max(0.0, 1.0 - x * x));
  vec3 N = normalize(vec3(n * x, cz));
  vec3 R = reflect(-V, N);
  float F = fresnel(cz);
  // Vidro de laboratório não é perfeito: o reflexo principal ondula de leve ao longo do tubo.
  float onda = sin(vS / 190.0) * 0.02 + sin(vS / 83.0 + 1.7) * 0.012;
  float ambiente =
      janela(R, normalize(Lk + vec3(n * onda, 0.0)), T, 0.11, 0.06) * 40.0
    + janela(R, Lr, T, 0.05, 0.06) * 10.0
    + janela(R, Lp, T, 0.08, 0.12) * 8.0
    + 0.3 + 0.4 * clamp(-R.y, 0.0, 1.0);
  float reflexo = (1.0 - exp(-ambiente * F)) * corpo;

  // Dispersão: na silhueta, o vermelho sai um pouco para fora e o azul um pouco para dentro.
  vec3 franja = vec3(silhueta(a * 0.985, aa), silhueta(a, aa), silhueta(a * 1.015, aa)) * 0.45;

  // ------------------------------------------------------------ líquido
  float xl = clamp(x / MIOLO, -1.0, 1.0);
  float czl = sqrt(max(0.0, 1.0 - xl * xl));
  // Menisco: parado, a superfície é côncava (o líquido molha o vidro e sobe pelas bordas);
  // correndo, a frente se estica para diante, como fluxo viscoso.
  float perfil = mix(-0.55 * (1.0 - czl), 1.0 - czl, uCorrendo);
  float dentro = uNivel - uMenisco * perfil - vS;
  float liquido = smoothstep(-aaS, aaS, dentro) * step(0.0, vS) * miolo;

  // Volume: a coluna de líquido brilha por dentro. Onde ela é mais espessa (o meio do tubo) há
  // mais líquido no caminho do olho: mais cor e um núcleo quase branco. Nas bordas ela é fina:
  // escura e translúcida, deixa o fundo aparecer. O pulso de energia acende o miolo.
  float fase = fract((vS - uPulso) / ESPACO_PULSO) * ESPACO_PULSO;
  float pulso = sino((fase - ESPACO_PULSO * 0.5) / 50.0) * cheio * uPulsoLigado;
  vec3 liq = mix(uTinta, uSinal, 0.18 + 0.72 * pow(czl, 1.25) + 0.1 * pulso);
  liq = mix(liq, uBrilho, smoothstep(0.75, 1.0, czl) * (0.2 + 0.35 * pulso));
  // Veios da correnteza, esticados no sentido do fluxo.
  float fio = ruido(vec2((vS - uFluxo) / 52.0, xl * 1.4 + 2.0)) * 0.6
            + ruido(vec2((vS - uFluxo * 1.35) / 17.0, xl * 2.8 - 5.0)) * 0.4;
  liq = mix(liq, mix(uTinta, uSinal, 0.6), (1.0 - fio) * 0.22);
  // Borda da coluna: ali a luz reflete para dentro e não chega ao olho, então escurece.
  liq = mix(liq, uTinta, smoothstep(0.78, 1.0, abs(xl)) * 0.6);
  // Reflexo interno, discreto: a luz que atravessa o líquido volta um pouco clara do lado dela.
  vec3 NL = normalize(vec3(n * xl, czl));
  liq = mix(liq, uBrilho, janela(reflect(-V, NL), Lk, T, 0.12, 0.35) * 0.18);
  // Foco: a coluna é uma lente cilíndrica e junta a luz num fio claro do lado oposto ao da luz.
  // O lado vem do ângulo da luz, sem salto: numa curva o fio passa de um lado ao outro aos poucos.
  float lado = clamp(-dot(n, normalize(Lk.xy)) * 1.6, -1.0, 1.0);
  float foco = sino((xl - lado * 0.6) / 0.12) * abs(lado);
  liq = mix(liq, uBrilho, foco * 0.3);
  // Superfície do menisco: reflete uma linha de luz; logo atrás, uma faixa mais escura.
  float linhaMenisco = sino((dentro - 1.2) / 1.1);
  float sombraMenisco = sino((dentro - 5.0) / 3.0);
  liq = mix(liq, uTinta, sombraMenisco * 0.3);
  liq = mix(liq, uBrilho, linhaMenisco * 0.85);

  // Bolhas. Correndo, a frente carrega espuma. Nos trechos horizontais elas sobem e correm
  // encostadas no alto do tubo, como no vidro de verdade.
  float u = vS - uFluxo * 0.8;
  float celula = floor(u / 22.0);
  float espuma = (1.0 - smoothstep(0.0, 150.0, uNivel - vS)) * uCorrendo;
  float limiar = mix(0.62, 0.15, espuma);
  float sobe = -n.y;
  float anel = 0.0;
  float vazioDaBolha = 0.0;
  // Sem desvios (continue, break, if): o compilador do Direct3D leva muito mais tempo com eles.
  for (int k = -1; k <= 1; k++) {
    float id = celula + float(k);
    float existe = step(limiar, h11(id * 1.37 + 0.11));
    float cu = (id + 0.5 + (h11(id * 7.13) - 0.5) * 0.6) * 22.0;
    float cv = (h11(id * 3.31) - 0.5) * 1.2 * MIOLO;
    cv = mix(cv, sobe * 0.6 * MIOLO + (h11(id * 9.7) - 0.5) * 0.25, abs(n.y) * 0.85);
    cv += sin(uTempo * 1.7 + id * 2.1) * 0.04;
    float rb = max(0.7, (0.07 + h11(id * 5.97) * 0.14) * uRaio);
    float d = length(vec2(u - cu, (x - cv) * uRaio));
    anel = max(anel, existe * smoothstep(rb - 1.1, rb - 0.35, d) * (1.0 - smoothstep(rb - 0.35, rb + 0.45, d)));
    vazioDaBolha = max(vazioDaBolha, existe * (1.0 - smoothstep(rb - 0.9, rb - 0.2, d)));
  }
  float nitidez = smoothstep(3.0, 6.0, uRaio);
  liq = mix(liq, mix(uTinta, liq, 0.72), vazioDaBolha * 0.5 * nitidez);
  liq = mix(liq, uBrilho, anel * 0.8 * nitidez);

  // Translúcido na borda, quase opaco no meio.
  float opacidade = (1.0 - exp(-2.4 * (0.15 + czl))) * liquido;

  // ------------------------------------------------------------ composição do tubo
  // De trás para a frente: o vidro escurece um pouco o que está atrás (mais nas bordas, onde a luz
  // atravessa mais vidro), o líquido, a parede tingida pelo líquido, a linha da superfície interna
  // e, por cima de tudo, os reflexos.
  float absorcao = (0.03 + 0.08 * (1.0 - cz)) * corpo;
  vec4 tubo = vec4(uTinta * absorcao, absorcao);
  tubo = sobre(vec4(liq * opacidade, opacidade), tubo);

  float paredeVerde = cheio * smoothstep(MIOLO - aa, 1.0, a) * corpo * 0.12;
  tubo = sobre(vec4(mix(uTinta, uSinal, 0.6) * paredeVerde, paredeVerde), tubo);

  float linhaInterna = sino((a - MIOLO) / (aa * 1.2 + 0.012)) * 0.3 * corpo;
  tubo = sobre(vec4(mix(uPapel, uBrilho, cheio) * linhaInterna, linhaInterna), tubo);

  vec3 luzes = clamp(uPapel * reflexo + uPapel * franja * corpo, 0.0, 1.0);
  tubo = sobre(vec4(luzes, max(luzes.r, max(luzes.g, luzes.b))), tubo);

  // ------------------------------------------------------------ no papel, fora do vidro
  float fora = smoothstep(1.0 - aa, 1.0 + aa, a) * (1.0 - smoothstep(MEIA_FAIXA - 0.45, MEIA_FAIXA, a));
  // A luz principal vem do alto à esquerda: a sombra cai para baixo e à direita. Ela é tinta mais
  // funda, não preto chapado.
  float dS = abs(x * uRaio - dot(n, vec2(3.5, 7.0)));
  float sombra = (1.0 - smoothstep(uRaio * 0.35, uRaio * 1.5, dS)) * mix(0.14, 0.32, cheio);
  // O cilindro funciona como lente e concentra um fio de luz no meio da sombra. Cheio, essa luz
  // passa pelo líquido e chega verde ao papel.
  float caustica = sino(dS / max(uRaio * 0.18, 0.7)) * mix(0.08, 0.24, cheio);
  vec3 corCaustica = mix(uPapel * 0.5, uSinal, cheio);
  float halo = exp(-max(a - 1.0, 0.0) * 4.0) * (0.02 + 0.1 * pulso) * cheio;
  vec4 luzNoPapel = vec4(corCaustica * caustica + uSinal * halo, caustica + halo);
  vec4 externo = sobre(luzNoPapel, vec4(uTinta * 0.35 * sombra, sombra)) * fora;

  vec4 resultado = sobre(tubo, externo);

  // ------------------------------------------------------------ luvas de metal
  float jd = 1e9;
  float js = 0.0;
  for (int i = 0; i < ${MAXIMO_DE_JUNTAS}; i++) {
    // Luva sem uso fica longe. Soma, e não mix(1e9, ...): com uma constante desse tamanho, o float
    // de 32 bits arredondaria a distância para múltiplos de 64 px e toda luva sairia larga demais.
    float usada = step(float(i) + 0.5, float(uNJuntas));
    float d = abs(vS - uJuntas[i]) + (1.0 - usada) * 1e9;
    js = mix(js, uJuntas[i], step(d, jd));
    jd = min(jd, d);
  }
  float jMeio = uRaio * MEIA_LUVA;
  float jRaio = 1.24;
  float naLuva = (1.0 - smoothstep(jMeio - aaS, jMeio + aaS, jd))
               * (1.0 - smoothstep(jRaio - aa, jRaio + aa, a));
  {
    float mv = clamp(x / jRaio, -1.0, 1.0);
    vec3 M = normalize(vec3(n * mv, sqrt(max(0.0, 1.0 - mv * mv))));
    vec3 Rm = reflect(-V, M);
    // Aço escovado: reflexos largos e macios, na cor do próprio metal.
    float luzMetal = janela(Rm, Lk, T, 0.2, 0.3) * 1.3 + janela(Rm, Lr, T, 0.12, 0.25) * 0.5
                   + janela(Rm, Lp, T, 0.14, 0.25) * 0.7 + 0.2 + 0.25 * clamp(-Rm.y, 0.0, 1.0);
    vec3 metal = mix(uAco, uPapel, 0.3) * clamp(luzMetal, 0.0, 1.0);
    // Anéis de vedação nas duas pontas da luva, onde ela abraça o vidro.
    float vedacao = smoothstep(jMeio - 2.4, jMeio - 1.6, jd);
    metal = mix(metal, uTinta, vedacao * 0.75);
    // LED: acende quando o líquido passa pela luva.
    float dLed = length(vec2(vS - js, x * uRaio));
    float led = 1.0 - smoothstep(1.1, 1.9, dLed);
    float aceso = step(js, uNivel);
    metal = mix(metal, mix(uTinta, uSinal, aceso), led);
    metal = mix(metal, uSinal, (1.0 - smoothstep(1.9, 4.5, dLed)) * aceso * 0.35 * (1.0 - led));
    resultado = sobre(vec4(metal * naLuva, naLuva), resultado);
  }

  // Pré-multiplicado válido: cor nunca acima do alfa, senão o compositor soma luz por conta própria.
  resultado = clamp(resultado, 0.0, 1.0);
  cor = vec4(min(resultado.rgb, vec3(resultado.a)), resultado.a);
}`;

function compilar(gl: WebGL2RenderingContext, tipo: number, fonte: string) {
  const shader = gl.createShader(tipo);
  if (!shader) return null;
  gl.shaderSource(shader, fonte);
  // Sem consultar o status aqui: a consulta força a compilação a terminar na hora, na thread
  // principal. Quem pergunta é `pronto()`, quando a GPU avisa que acabou.
  gl.compileShader(shader);
  return shader;
}

type Estado = {
  programa: WebGLProgram;
  vao: WebGLVertexArrayObject;
  buffer: WebGLBuffer;
  u: Record<string, WebGLUniformLocation | null>;
};

const UNIFORMES = [
  'uOrigem',
  'uTamanho',
  'uRaio',
  'uNivel',
  'uMenisco',
  'uCorrendo',
  'uFluxo',
  'uPulso',
  'uPulsoLigado',
  'uTempo',
  'uLuz',
  'uSinal',
  'uBrilho',
  'uPapel',
  'uAco',
  'uTinta',
  'uJuntas',
  'uNJuntas',
] as const;

export function criarRenderizador(canvas: HTMLCanvasElement): Renderizador | null {
  const contexto = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
    preserveDrawingBuffer: false,
  });
  if (!contexto) return null;
  const gl: WebGL2RenderingContext = contexto;

  // Extensões não voltam sozinhas depois de um contexto restaurado: `aoRecuperar` busca de novo.
  let paralelo = gl.getExtension('KHR_parallel_shader_compile');
  let estado: Estado | null = null;
  let pendente: { programa: WebGLProgram; vs: WebGLShader; fs: WebGLShader; desde: number } | null =
    null;
  let falha = false;
  let compilacaoPedida = false;
  let trajeto: Trajeto | null = null;
  let vertices = 0;
  const juntas = new Float32Array(MAXIMO_DE_JUNTAS);
  let cores: Cores | null = null;

  function compilarPrograma() {
    const vs = compilar(gl, gl.VERTEX_SHADER, VERTICE);
    const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTO);
    const programa = gl.createProgram();
    if (!vs || !fs || !programa) {
      falha = !gl.isContextLost();
      return;
    }
    gl.attachShader(programa, vs);
    gl.attachShader(programa, fs);
    gl.linkProgram(programa);
    pendente = { programa, vs, fs, desde: performance.now() };
  }

  /** Termina a preparação quando a compilação acabou. Não bloqueia se ela ainda corre. */
  function concluir(): boolean {
    if (estado) return true;
    if (!pendente || falha || gl.isContextLost()) return false;
    const { programa, vs, fs } = pendente;
    if (paralelo && !gl.getProgramParameter(programa, paralelo.COMPLETION_STATUS_KHR)) return false;
    // Sem a extensão, perguntar pelo resultado trava até a compilação acabar. O driver compila em
    // segundo plano assim que recebe o programa; dando a ele este tempo antes de perguntar, a
    // resposta volta pronta, sem tarefa longa.
    if (!paralelo && performance.now() - pendente.desde < ESPERA_SEM_COMPILACAO_PARALELA) return false;
    pendente = null;
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
      console.warn(
        '[conduto] shader:',
        gl.getShaderInfoLog(vs) || gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(programa),
      );
      falha = true;
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (falha) {
      gl.deleteProgram(programa);
      return false;
    }

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    if (!vao || !buffer) {
      falha = true;
      return false;
    }
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const passo = FLOATS_POR_VERTICE * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, passo, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, passo, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, passo, 12);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, passo, 16);
    gl.bindVertexArray(null);

    const u: Estado['u'] = {};
    for (const nome of UNIFORMES) u[nome] = gl.getUniformLocation(programa, nome);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    // Saída pré-multiplicada, como o canvas espera.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    estado = { programa, vao, buffer, u };
    enviarTrajeto();
    return true;
  }

  function enviarTrajeto() {
    if (!estado || !trajeto) return;
    const dados = malha(trajeto);
    gl.bindBuffer(gl.ARRAY_BUFFER, estado.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, dados, gl.STATIC_DRAW);
    vertices = dados.length / FLOATS_POR_VERTICE;
  }

  // Contexto perdido (GPU reiniciada, aba em segundo plano no celular): o conduto é decorativo,
  // então só para de desenhar e se reconstrói quando o navegador devolver o contexto.
  const aoPerder = (evento: Event) => {
    evento.preventDefault();
    estado = null;
    pendente = null;
  };
  const aoRecuperar = () => {
    paralelo = gl.getExtension('KHR_parallel_shader_compile');
    falha = false;
    if (compilacaoPedida) compilarPrograma();
  };
  canvas.addEventListener('webglcontextlost', aoPerder);
  canvas.addEventListener('webglcontextrestored', aoRecuperar);

  return {
    compilar() {
      if (compilacaoPedida) return;
      compilacaoPedida = true;
      compilarPrograma();
    },
    pronto: concluir,
    falhou: () => falha,
    perdido: () => gl.isContextLost(),
    trajeto(t) {
      trajeto = t;
      juntas.fill(0);
      juntas.set(t.juntas.slice(0, MAXIMO_DE_JUNTAS));
      enviarTrajeto();
    },
    cores(c) {
      cores = c;
    },
    tamanho(larguraPx, alturaPx) {
      if (canvas.width !== larguraPx) canvas.width = larguraPx;
      if (canvas.height !== alturaPx) canvas.height = alturaPx;
    },
    desenhar(q) {
      if (!concluir() || !estado || !trajeto || !cores || gl.isContextLost()) return;
      const { u } = estado;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(estado.programa);
      gl.uniform2f(u.uOrigem ?? null, q.origemX, q.origemY);
      gl.uniform2f(u.uTamanho ?? null, q.largura, q.altura);
      gl.uniform1f(u.uRaio ?? null, trajeto.raio);
      gl.uniform1f(u.uNivel ?? null, q.nivel);
      gl.uniform1f(u.uMenisco ?? null, q.menisco);
      gl.uniform1f(u.uCorrendo ?? null, q.correndo);
      gl.uniform1f(u.uFluxo ?? null, q.fluxo);
      gl.uniform1f(u.uPulso ?? null, q.pulso);
      gl.uniform1f(u.uPulsoLigado ?? null, q.pulsoLigado);
      gl.uniform1f(u.uTempo ?? null, q.tempo);
      gl.uniform3f(u.uLuz ?? null, ...q.luz);
      gl.uniform3f(u.uSinal ?? null, ...cores.sinal);
      gl.uniform3f(u.uBrilho ?? null, ...cores.brilho);
      gl.uniform3f(u.uPapel ?? null, ...cores.papel);
      gl.uniform3f(u.uAco ?? null, ...cores.aco);
      gl.uniform3f(u.uTinta ?? null, ...cores.tinta);
      gl.uniform1fv(u.uJuntas ?? null, juntas);
      gl.uniform1i(u.uNJuntas ?? null, Math.min(trajeto.juntas.length, MAXIMO_DE_JUNTAS));
      gl.bindVertexArray(estado.vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices);
      gl.bindVertexArray(null);
    },
    destruir() {
      canvas.removeEventListener('webglcontextlost', aoPerder);
      canvas.removeEventListener('webglcontextrestored', aoRecuperar);
      if (estado && !gl.isContextLost()) {
        gl.deleteBuffer(estado.buffer);
        gl.deleteVertexArray(estado.vao);
        gl.deleteProgram(estado.programa);
      }
      estado = null;
      pendente = null;
      // Devolve a GPU na hora, sem esperar o coletor de lixo.
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
