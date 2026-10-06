/**
 * A câmera da torre, sem three.js: poses esféricas em volta de um alvo, os enquadramentos prontos,
 * a aproximação de uma fachada para "Ver a vista" e uma mola criticamente amortecida. Puro, para
 * os testes provarem que nenhum caminho de câmera entra no prédio.
 *
 * Convenções de `predio.ts`: metros, y para cima, −z norte, +x leste. O azimute de uma pose é o
 * rumo do alvo até a câmera, em graus a partir do norte, no sentido horário; o rumo para onde a
 * câmera olha (a bússola) é o azimute mais 180°.
 */

export type Vetor = [number, number, number];

export type Pose = {
  azimute: number;
  /** Graus acima do horizonte, vistos do alvo. */
  elevacao: number;
  raio: number;
  alvo: Vetor;
};

export type NomeDoEnquadramento = 'frente' | 'lateral' | 'fundos' | 'rooftop' | 'abertura';

const RAD = Math.PI / 180;

export const normalizarGraus = (graus: number) => ((graus % 360) + 360) % 360;

/** A menor diferença angular de `de` para `para`, entre −180 e 180. */
export function menorDiferenca(de: number, para: number): number {
  const d = normalizarGraus(para - de);
  return d > 180 ? d - 360 : d;
}

export function posicaoDaPose(p: Pose): Vetor {
  const a = p.azimute * RAD;
  const e = p.elevacao * RAD;
  const horizontal = Math.cos(e) * p.raio;
  return [p.alvo[0] + Math.sin(a) * horizontal, p.alvo[1] + Math.sin(e) * p.raio, p.alvo[2] - Math.cos(a) * horizontal];
}

/** Para onde a câmera olha, em graus a partir do norte, no sentido horário. */
export const rumoDaPose = (p: Pose) => normalizarGraus(p.azimute + 180);

/** O rumo (graus a partir do norte, horário) de uma direção no plano. */
export const rumoDaDirecao = (x: number, z: number) => normalizarGraus(Math.atan2(x, -z) / RAD);

/**
 * O cilindro que envolve torre, embasamento, varandas e coroamento: a câmera do prédio nunca entra
 * nele. O embasamento tem 32 × 26 m (meia diagonal de 20,6 m); a torre com varandas, 27,2 × 19,2 m.
 */
export const CILINDRO_DO_PREDIO = { raio: 22, topo: 76 } as const;

export function dentroDoCilindro(v: readonly number[]): boolean {
  return Math.hypot(v[0]!, v[2]!) < CILINDRO_DO_PREDIO.raio && v[1]! < CILINDRO_DO_PREDIO.topo && v[1]! > -2;
}

export type Obstaculo = { min: readonly number[]; max: readonly number[] };

/**
 * Rede de segurança, aplicada a cada quadro: se a câmera cair dentro do prédio, sai pela lateral;
 * se cair dentro de outro prédio (com folga), sobe por cima dele. A mola sozinha já não entra no
 * prédio (os testes conferem); isto cobre o arrasto e a pinça em casos-limite.
 */
export function afastarDosObstaculos(posicao: Vetor, obstaculos: readonly Obstaculo[], folga = 2): Vetor {
  let [x, y, z] = posicao;
  if (y < CILINDRO_DO_PREDIO.topo && y > -2) {
    const r = Math.hypot(x, z);
    if (r < CILINDRO_DO_PREDIO.raio) {
      const escala = r < 1e-6 ? 0 : CILINDRO_DO_PREDIO.raio / r;
      x = r < 1e-6 ? CILINDRO_DO_PREDIO.raio : x * escala;
      z = r < 1e-6 ? 0 : z * escala;
    }
  }
  for (const o of obstaculos) {
    if (x > o.min[0]! - folga && x < o.max[0]! + folga && z > o.min[2]! - folga && z < o.max[2]! + folga && y < o.max[1]! + folga && y > o.min[1]! - folga) {
      y = o.max[1]! + folga;
    }
  }
  return [x, y, z];
}

// ---------------------------------------------------------------- enquadramentos

type Desenho = {
  azimute: number;
  elevacao: number;
  alvoY: number;
  /** A faixa de alturas que precisa caber (m); o alvo nem sempre fica no meio dela. */
  de: number;
  ate: number;
  largura: number;
};

/**
 * Os enquadramentos prontos. `altura` e `largura` são o que precisa caber na tela (em metros, no
 * plano do alvo); o raio sai do FOV vertical, então a mesma pose serve em 16:9 e em 4:5.
 * A frente é a ¾ pelo noroeste: mostra a fachada da avenida, a lateral do pôr do sol e o 1803.
 */
const DESENHOS: Readonly<Record<NomeDoEnquadramento, Desenho>> = {
  frente: { azimute: 320, elevacao: 15, alvoY: 34, de: -2, ate: 76, largura: 44 },
  lateral: { azimute: 264, elevacao: 11, alvoY: 34, de: -2, ate: 76, largura: 40 },
  fundos: { azimute: 204, elevacao: 14, alvoY: 34, de: -2, ate: 76, largura: 44 },
  rooftop: { azimute: 316, elevacao: 44, alvoY: 63, de: 52, ate: 74, largura: 40 },
  // A pose do pôster: mais de frente, mais baixa e um pouco mais longe; a entrada desliza daqui
  // até a frente ¾.
  abertura: { azimute: 340, elevacao: 6, alvoY: 35, de: -6, ate: 80, largura: 48 },
};

export type Lente = {
  /** FOV vertical da câmera, em graus. */
  fovVertical: number;
  /** Largura ÷ altura do palco. */
  aspecto: number;
  /** Fração do palco livre dos painéis, na horizontal e na vertical (1 = palco inteiro). */
  livreX?: number;
  livreY?: number;
};

/** O raio que faz `altura` × `largura` metros caberem na parte livre da tela. */
export function raioParaCaber(altura: number, largura: number, lente: Lente): number {
  const meiaV = Math.tan((lente.fovVertical * RAD) / 2) * (lente.livreY ?? 1);
  const meiaH = Math.tan((lente.fovVertical * RAD) / 2) * lente.aspecto * (lente.livreX ?? 1);
  return Math.max(altura / 2 / meiaV, largura / 2 / meiaH);
}

export function poseDoEnquadramento(nome: NomeDoEnquadramento, lente: Lente): Pose {
  const d = DESENHOS[nome];
  // A faixa vista de fora do eixo: o lado mais longe do alvo manda, com 4% de respiro.
  const altura = 2 * Math.max(d.ate - d.alvoY, d.alvoY - d.de) * 1.04;
  return { azimute: d.azimute, elevacao: d.elevacao, raio: raioParaCaber(altura, d.largura, lente), alvo: [0, d.alvoY, 0] };
}

/** Os limites do zoom em volta do prédio: nunca perto a ponto de entrar nele ou no vizinho. */
export const RAIO_MINIMO = 75;
export const fatorMaximoDoZoom = 1.7;
export const ELEVACAO = { minima: 3, maxima: 72 } as const;

// -------------------------------------------------------------- aproximação da vista

/**
 * A pose de onde a câmera se aproxima de uma varanda antes do mergulho no escuro: 38 m para fora,
 * 15° acima do olho, de frente para a fachada. Se o caminho até lá bater em algum prédio (o
 * vizinho a 20 m do leste, por exemplo), a direção gira para os lados até achar um vão livre.
 */
export function poseDeAproximacao(
  olho: readonly number[],
  normal: readonly number[],
  livre: (de: Vetor, ate: Vetor) => boolean,
  distancia = 38,
): Pose {
  const base = rumoDaDirecao(normal[0]!, normal[2]!);
  const alvo: Vetor = [olho[0]!, olho[1]!, olho[2]!];
  const elevacao = 15;
  // Um corredor, não só uma linha: a reta até a varanda e duas paralelas a 3 m para os lados.
  const corredorLivre = (ponto: Vetor, rumo: number) => {
    const lado: Vetor = [Math.cos(rumo * RAD) * 3, 0, Math.sin(rumo * RAD) * 3];
    return [1, -1].every((s) => livre([ponto[0] + lado[0] * s, ponto[1], ponto[2] + lado[2] * s], [alvo[0] + lado[0] * s * 0.2, alvo[1], alvo[2] + lado[2] * s * 0.2]))
      && livre(ponto, alvo) && livre([ponto[0], ponto[1] + 3, ponto[2]], alvo);
  };
  for (const desvio of [0, 15, -15, 30, -30, 45, -45, 55, -55, 65, -65, 75, -75]) {
    const pose: Pose = { azimute: normalizarGraus(base + desvio), elevacao, raio: distancia, alvo };
    const ponto = posicaoDaPose(pose);
    if (!dentroDoCilindro(ponto) && corredorLivre(ponto, pose.azimute)) return pose;
  }
  return { azimute: base, elevacao: 40, raio: distancia, alvo };
}

// ------------------------------------------------------------------------ a mola

/**
 * Um passo exato da mola criticamente amortecida (sem passar do ponto, sem balançar), estável para
 * qualquer `dt`. `omega` dá o tempo: assenta em cerca de 6,6/omega segundos.
 */
export function passoDaMola(x: number, v: number, alvo: number, omega: number, dt: number): [number, number] {
  const c1 = x - alvo;
  const c2 = v + omega * c1;
  const e = Math.exp(-omega * dt);
  return [alvo + (c1 + c2 * dt) * e, (c2 - omega * (c1 + c2 * dt)) * e];
}

const COMPONENTES = 6;

/** Uma pose que corre atrás do destino pela mola, componente a componente. */
export class PoseEmMola {
  atual: Pose;
  destino: Pose;
  omega = 6;
  private velocidade = new Float64Array(COMPONENTES);

  constructor(inicial: Pose) {
    this.atual = copiar(inicial);
    this.destino = copiar(inicial);
  }

  /** Vai até a pose pelo menor arco. */
  ir(destino: Pose, omega = this.omega): void {
    this.omega = omega;
    this.destino = { ...copiar(destino), azimute: this.atual.azimute + menorDiferenca(this.atual.azimute, destino.azimute) };
  }

  /** Corte seco: sem movimento. */
  cortar(destino: Pose): void {
    this.atual = copiar(destino);
    this.destino = copiar(destino);
    this.velocidade.fill(0);
  }

  /** Avança `dt` segundos; devolve `true` enquanto ainda se move. */
  passo(dt: number): boolean {
    const de = vetorDa(this.atual);
    const para = vetorDa(this.destino);
    let movendo = false;
    for (let i = 0; i < COMPONENTES; i += 1) {
      const [x, v] = passoDaMola(de[i]!, this.velocidade[i]!, para[i]!, this.omega, dt);
      const escala = i === 0 || i === 1 ? 0.01 : 0.002 * Math.max(1, Math.abs(para[i]!));
      if (Math.abs(x - para[i]!) < escala && Math.abs(v) < escala) {
        de[i] = para[i]!;
        this.velocidade[i] = 0;
      } else {
        de[i] = x;
        this.velocidade[i] = v;
        movendo = true;
      }
    }
    this.atual = poseDo(de);
    return movendo;
  }

  get emMovimento(): boolean {
    const de = vetorDa(this.atual);
    const para = vetorDa(this.destino);
    return de.some((x, i) => x !== para[i]);
  }
}

const copiar = (p: Pose): Pose => ({ azimute: p.azimute, elevacao: p.elevacao, raio: p.raio, alvo: [p.alvo[0], p.alvo[1], p.alvo[2]] });
const vetorDa = (p: Pose) => [p.azimute, p.elevacao, p.raio, p.alvo[0], p.alvo[1], p.alvo[2]];
const poseDo = (v: number[]): Pose => ({ azimute: v[0]!, elevacao: v[1]!, raio: v[2]!, alvo: [v[3]!, v[4]!, v[5]!] });

/** As posições da câmera ao longo de uma transição pela mola, para os testes. */
export function caminhoDaMola(de: Pose, para: Pose, omega = 6, segundos = 3, passo = 1 / 60): Vetor[] {
  const mola = new PoseEmMola(de);
  mola.ir(para, omega);
  const pontos: Vetor[] = [posicaoDaPose(mola.atual)];
  for (let t = 0; t < segundos; t += passo) {
    mola.passo(passo);
    pontos.push(posicaoDaPose(mola.atual));
  }
  return pontos;
}

/** O FOV vertical da vista da varanda: 55° no celular em pé; cerca de 70° na horizontal no computador. */
export function fovDaVista(aspecto: number): number {
  if (aspecto <= 1) return 55;
  return Math.min(55, (2 * Math.atan(Math.tan(35 * RAD) / aspecto)) / RAD);
}

/** Olhar em volta, na varanda: até 75° para os lados, de 30° para baixo a 15° para cima. */
export const OLHAR = { rumo: 75, baixo: -30, cima: 15, passoRumo: 25, passoInclinacao: 10 } as const;
