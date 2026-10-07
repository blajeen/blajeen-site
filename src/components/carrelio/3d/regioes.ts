import type { RegiaoDoCarro } from './contrato';

/**
 * As regiões do manifesto (caixas inclinadas em X e cilindros deitados em X), sem three.js: o peso
 * de um ponto (0 fora, 1 dentro, com borda suave), igual ao do shader (`materiais.ts`), e o
 * empacotamento em floats para os uniforms. Puro, para os testes.
 */

/** Borda suave das regiões, em metros: metade para dentro, metade para fora do limite. */
export const BORDA_DA_REGIAO = 0.02;

export const ehCilindro = (r: RegiaoDoCarro): r is Extract<RegiaoDoCarro, { raio: number }> => 'raio' in r;

const suave = (de: number, ate: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - de) / (ate - de)));
  return t * t * (3 - 2 * t);
};

/** Quanto um ponto do espaço do carro está dentro da região (0 a 1). */
export function pesoDaRegiao(r: RegiaoDoCarro, p: readonly number[], borda = BORDA_DA_REGIAO): number {
  const dx = p[0]! - r.centro[0];
  const dy = p[1]! - r.centro[1];
  const dz = p[2]! - r.centro[2];
  let fora: number;
  if (ehCilindro(r)) {
    fora = Math.max(Math.hypot(dy, dz) - r.raio, Math.abs(dx) - r.meiaLargura);
  } else {
    // Volta a inclinação (rotação em torno de X) para medir na caixa reta.
    const a = ((r.inclinacao ?? 0) * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const y = c * dy + s * dz;
    const z = -s * dy + c * dz;
    fora = Math.max(Math.abs(dx) - r.meias[0], Math.abs(y) - r.meias[1], Math.abs(z) - r.meias[2]);
  }
  return 1 - suave(-borda / 2, borda / 2, fora);
}

/** O maior peso entre as regiões (0 sem regiões). */
export function pesoDasRegioes(regioes: readonly RegiaoDoCarro[], p: readonly number[]): number {
  let peso = 0;
  for (const r of regioes) peso = Math.max(peso, pesoDaRegiao(r, p));
  return peso;
}

/**
 * Oito floats por região, para dois `vec4` do shader: (centro, tipo) e (meias ou raio e meia
 * largura, inclinação em radianos). Tipo 0 é caixa, 1 é cilindro.
 */
export function empacotarRegioes(regioes: readonly RegiaoDoCarro[]): Float32Array {
  const r = new Float32Array(Math.max(1, regioes.length) * 8);
  regioes.forEach((regiao, i) => {
    const o = i * 8;
    r.set(regiao.centro, o);
    if (ehCilindro(regiao)) {
      r.set([1, regiao.raio, regiao.meiaLargura, 0, 0], o + 3);
    } else {
      r.set([0, regiao.meias[0], regiao.meias[1], regiao.meias[2], ((regiao.inclinacao ?? 0) * Math.PI) / 180], o + 3);
    }
  });
  return r;
}

/** O tamanho da região (o maior lado), para o halo de uma luz por região. */
export function tamanhoDaRegiao(r: RegiaoDoCarro): number {
  return ehCilindro(r) ? 2 * Math.max(r.raio, r.meiaLargura) : 2 * Math.max(r.meias[0], r.meias[1], r.meias[2]);
}

export function regiaoValida(r: RegiaoDoCarro): boolean {
  const numeros = ehCilindro(r) ? [...r.centro, r.raio, r.meiaLargura] : [...r.centro, ...r.meias, r.inclinacao ?? 0];
  if (!numeros.every((x) => Number.isFinite(x))) return false;
  return ehCilindro(r) ? r.raio > 0 && r.meiaLargura > 0 : r.meias.every((m) => m > 0);
}
