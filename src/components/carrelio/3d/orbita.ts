import { menorDiferenca, normalizarGraus, passoDaMola } from '@/components/torrelio/3d/camera';

/**
 * A câmera do carro, sem three.js: a órbita de fora (azimute, elevação, raio em volta de um alvo),
 * o enquadramento que faz o carro caber na parte livre do palco, o olhar de dentro e a mola que
 * amortece tudo (a mesma mola criticamente amortecida do Torrelio). Puro, para os testes.
 *
 * Espaço do carro (o do manifesto): metros, +Y para cima, frente para +Z, lado esquerdo (o do
 * motorista no Brasil) para +X. Azimute 0 é a câmera de frente para o carro, 90 do lado esquerdo,
 * 180 atrás e 270 do lado direito; elevação em graus acima do horizonte, vista do alvo.
 */

export type Vetor = [number, number, number];
export type Caixa = { min: readonly [number, number, number]; max: readonly [number, number, number] };

export type PoseDeOrbita = { azimute: number; elevacao: number; raio: number; alvo: Vetor };

const RAD = Math.PI / 180;

export { menorDiferenca, normalizarGraus };

/** Inclinação permitida de fora: nunca rente ao chão nem de cima demais (o teto não é o assunto). */
export const ELEVACAO = { minima: 2, maxima: 35 } as const;
/** A pose de abertura (a do pôster): ¾ de frente pelo lado do motorista, um pouco acima dos olhos. */
export const ABERTURA = { azimute: 36, elevacao: 8.5 } as const;
/** Uma volta da mesa em 40 s. */
export const VOLTA_EM_SEGUNDOS = 40;
/** Olhar de dentro: livre para os lados, de 60° para baixo a 50° para cima. */
export const OLHAR = { baixo: -60, cima: 50 } as const;

export const limitarElevacao = (graus: number) => Math.min(ELEVACAO.maxima, Math.max(ELEVACAO.minima, graus));
export const limitarInclinacao = (graus: number) => Math.min(OLHAR.cima, Math.max(OLHAR.baixo, graus));

export function posicaoNaOrbita(p: PoseDeOrbita): Vetor {
  const a = p.azimute * RAD;
  const e = p.elevacao * RAD;
  const horizontal = Math.cos(e) * p.raio;
  return [p.alvo[0] + Math.sin(a) * horizontal, p.alvo[1] + Math.sin(e) * p.raio, p.alvo[2] + Math.cos(a) * horizontal];
}

/** O azimute de uma direção no plano (do alvo para a câmera). */
export const azimuteDaDirecao = (x: number, z: number) => normalizarGraus(Math.atan2(x, z) / RAD);

// --------------------------------------------------------------------- lentes

/**
 * O FOV vertical de fora: 30° deitado (pouca deformação, como nas fotos de catálogo). Em pé, o
 * carro é largo e a tela é estreita: o FOV abre até 46° para a câmera não ir longe demais (de
 * longe, o carro fica chapado).
 */
export function fovDeFora(aspecto: number): number {
  if (aspecto >= 1) return 30;
  const t = Math.min(1, Math.max(0, (1 - aspecto) / (1 - 0.46)));
  return 30 + 16 * t;
}

/** O FOV vertical de dentro: 70° deitado; em pé, abre até 84° para caber o painel. */
export function fovDeDentro(aspecto: number): number {
  if (aspecto >= 1) return 70;
  const t = Math.min(1, Math.max(0, (1 - aspecto) / (1 - 0.46)));
  return 70 + 14 * t;
}

export const FOV_DE_DENTRO = { minimo: 34, maximo: 92 } as const;

export type Lente = {
  /** FOV vertical, em graus. */
  fovVertical: number;
  /** Largura ÷ altura do palco. */
  aspecto: number;
  /** Fração do palco livre dos painéis, na horizontal e na vertical (1 = palco inteiro). */
  livreX?: number;
  livreY?: number;
};

/** Respiro em volta do carro: no celular em pé ele ocupa quase a largura toda; deitado, sobra ar. */
export const folgaDoEnquadramento = (aspecto: number) => (aspecto < 1 ? 0.08 : 0.2);

/**
 * Projeta um ponto na câmera que olha de `olho` para `alvo` (sem rolagem), em coordenadas
 * normalizadas da lente (−1 a 1 na parte livre). `null` se o ponto está atrás da câmera.
 */
export function projetarNaLente(ponto: readonly number[], olho: Vetor, alvo: Vetor, lente: Lente): [number, number] | null {
  let fx = alvo[0] - olho[0];
  let fy = alvo[1] - olho[1];
  let fz = alvo[2] - olho[2];
  const nf = Math.hypot(fx, fy, fz) || 1;
  fx /= nf;
  fy /= nf;
  fz /= nf;
  // direita = frente × cima (cima = +Y)
  let rx = -fz;
  let rz = fx;
  const nr = Math.hypot(rx, rz) || 1;
  rx /= nr;
  rz /= nr;
  // cima da câmera = direita × frente
  const ux = -rz * fy;
  const uy = rz * fx - rx * fz;
  const uz = rx * fy;
  const dx = ponto[0]! - olho[0];
  const dy = ponto[1]! - olho[1];
  const dz = ponto[2]! - olho[2];
  const profundidade = dx * fx + dy * fy + dz * fz;
  if (profundidade <= 1e-3) return null;
  const meiaV = Math.tan((lente.fovVertical * RAD) / 2);
  const meiaH = meiaV * lente.aspecto;
  return [(dx * rx + dz * rz) / (profundidade * meiaH) / (lente.livreX ?? 1), (dx * ux + dy * uy + dz * uz) / (profundidade * meiaV) / (lente.livreY ?? 1)];
}

export const cantosDaCaixa = (c: Caixa): Vetor[] => {
  const r: Vetor[] = [];
  for (const x of [c.min[0], c.max[0]]) for (const y of [c.min[1], c.max[1]]) for (const z of [c.min[2], c.max[2]]) r.push([x, y, z]);
  return r;
};

/**
 * O menor raio em que todos os pontos (a silhueta do carro, ou os cantos da caixa) cabem na parte
 * livre da lente, com `folga` de respiro (fração da meia largura). Busca binária: de mais longe,
 * tudo encolhe na tela.
 */
export function raioParaCaber(pontos: readonly (readonly number[])[], azimute: number, elevacao: number, alvo: Vetor, lente: Lente, folga: number): number {
  const limite = 1 - folga;
  const cabe = (raio: number) => {
    const olho = posicaoNaOrbita({ azimute, elevacao, raio, alvo });
    return pontos.every((p) => {
      const ndc = projetarNaLente(p, olho, alvo, lente);
      return ndc !== null && Math.abs(ndc[0]) <= limite && Math.abs(ndc[1]) <= limite;
    });
  };
  let perto = 0.5;
  let longe = 400;
  if (cabe(perto)) return perto;
  for (let i = 0; i < 40; i += 1) {
    const meio = (perto + longe) / 2;
    if (cabe(meio)) longe = meio;
    else perto = meio;
  }
  return longe;
}

/** O alvo da órbita: o centro da caixa, um pouco abaixo do meio da altura (o carro "assenta"). */
export function alvoDaCaixa(caixa: Caixa): Vetor {
  return [(caixa.min[0] + caixa.max[0]) / 2, caixa.min[1] + (caixa.max[1] - caixa.min[1]) * 0.42, (caixa.min[2] + caixa.max[2]) / 2];
}

/**
 * A pose de abertura enquadrada para a lente (a do pôster e a de "enquadrar"). Com a silhueta (os
 * pontos extremos da malha), o enquadramento é justo; só com a caixa, os cantos dela (que o carro
 * não tem) deixam o carro menor na tela.
 */
export function poseDeAbertura(caixa: Caixa, lente: Lente, silhueta?: readonly (readonly number[])[]): PoseDeOrbita {
  const alvo = alvoDaCaixa(caixa);
  const pontos = silhueta && silhueta.length >= 8 ? silhueta : cantosDaCaixa(caixa);
  return {
    azimute: ABERTURA.azimute,
    elevacao: ABERTURA.elevacao,
    raio: raioParaCaber(pontos, ABERTURA.azimute, ABERTURA.elevacao, alvo, lente, folgaDoEnquadramento(lente.aspecto)),
    alvo,
  };
}

/** Direções espalhadas na esfera (espiral de Fibonacci), para achar a silhueta de uma malha. */
export function direcoesNaEsfera(n: number): Vetor[] {
  const r: Vetor[] = [];
  const ouro = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i += 1) {
    const y = 1 - (2 * (i + 0.5)) / n;
    const raio = Math.sqrt(1 - y * y);
    r.push([Math.cos(ouro * i) * raio, y, Math.sin(ouro * i) * raio]);
  }
  return r;
}

/**
 * A silhueta de uma nuvem de pontos (x, y, z em sequência): o ponto mais extremo em cada direção.
 * É o que precisa caber na tela; dentro do fecho dela, nada aparece fora do quadro.
 */
export function silhuetaDosPontos(posicoes: ArrayLike<number>, direcoes: readonly Vetor[]): Vetor[] {
  const melhores = direcoes.map(() => ({ valor: -Infinity, ponto: [0, 0, 0] as Vetor }));
  for (let i = 0; i + 2 < posicoes.length; i += 3) {
    const x = posicoes[i]!;
    const y = posicoes[i + 1]!;
    const z = posicoes[i + 2]!;
    for (let d = 0; d < direcoes.length; d += 1) {
      const dir = direcoes[d]!;
      const valor = x * dir[0] + y * dir[1] + z * dir[2];
      const melhor = melhores[d]!;
      if (valor > melhor.valor) {
        melhor.valor = valor;
        melhor.ponto = [x, y, z];
      }
    }
  }
  return melhores.filter((m) => Number.isFinite(m.valor)).map((m) => m.ponto);
}

/**
 * Limites do zoom de fora: de perto, a câmera não entra no carro (fica a uns 70 cm da caixa, em
 * qualquer azimute); de longe, até 1,6 vez o enquadramento.
 */
export function limitesDoRaio(caixa: Caixa, raioDoEnquadramento: number): { minimo: number; maximo: number } {
  const meiaDiagonal = Math.hypot(caixa.max[0] - caixa.min[0], caixa.max[2] - caixa.min[2]) / 2;
  const minimo = meiaDiagonal + 0.7;
  return { minimo, maximo: Math.max(minimo + 0.5, raioDoEnquadramento * 1.6) };
}

// ------------------------------------------------------------------ de dentro

/** Rumo (graus, 0 para +Z, 90 para +X) e inclinação (graus) de quem olha de `olho` para `alvo`. */
export function olharPara(olho: readonly number[], alvo: readonly number[]): { rumo: number; inclinacao: number } {
  const dx = alvo[0]! - olho[0]!;
  const dy = alvo[1]! - olho[1]!;
  const dz = alvo[2]! - olho[2]!;
  return { rumo: Math.atan2(dx, dz) / RAD, inclinacao: Math.atan2(dy, Math.hypot(dx, dz)) / RAD };
}

export function direcaoDoOlhar(rumo: number, inclinacao: number): Vetor {
  const r = rumo * RAD;
  const i = inclinacao * RAD;
  return [Math.sin(r) * Math.cos(i), Math.sin(i), Math.cos(r) * Math.cos(i)];
}

// ---------------------------------------------------------------------- a mola

/**
 * Um vetor que corre atrás do destino pela mola, componente a componente. `tolerancias` diz quando
 * cada componente assentou (graus, metros), para o laço parar de desenhar.
 */
export class MolaVetorial {
  atual: number[];
  destino: number[];
  omega: number;
  private readonly velocidade: number[];
  private readonly tolerancias: readonly number[];

  constructor(inicial: readonly number[], tolerancias: readonly number[], omega = 6) {
    this.atual = [...inicial];
    this.destino = [...inicial];
    this.velocidade = inicial.map(() => 0);
    this.tolerancias = tolerancias;
    this.omega = omega;
  }

  /** Corte seco: sem movimento. */
  cortar(valor: readonly number[]): void {
    this.atual = [...valor];
    this.destino = [...valor];
    this.velocidade.fill(0);
  }

  /** Avança `dt` segundos; devolve `true` enquanto ainda se move. */
  passo(dt: number): boolean {
    let movendo = false;
    for (let i = 0; i < this.atual.length; i += 1) {
      const [x, v] = passoDaMola(this.atual[i]!, this.velocidade[i]!, this.destino[i]!, this.omega, dt);
      const tol = this.tolerancias[i] ?? 1e-3;
      if (Math.abs(x - this.destino[i]!) < tol && Math.abs(v) < tol) {
        this.atual[i] = this.destino[i]!;
        this.velocidade[i] = 0;
      } else {
        this.atual[i] = x;
        this.velocidade[i] = v;
        movendo = true;
      }
    }
    return movendo;
  }

  get emMovimento(): boolean {
    return this.atual.some((x, i) => x !== this.destino[i]);
  }
}

/** Ângulo de destino pelo menor arco a partir do atual (para a mola não dar a volta inteira). */
export const pertoDe = (atual: number, destino: number) => atual + menorDiferenca(atual, destino);
