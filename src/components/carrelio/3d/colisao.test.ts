import { describe, expect, it } from 'vitest';
import { simplificarPorGrade } from './colisao';

/** Uma placa de n × n quadrados no plano y = 0, de 1 m de lado. */
function placa(n: number) {
  const posicoes: number[] = [];
  const indices: number[] = [];
  for (let z = 0; z <= n; z += 1) for (let x = 0; x <= n; x += 1) posicoes.push(x / n, 0, z / n);
  for (let z = 0; z < n; z += 1) {
    for (let x = 0; x < n; x += 1) {
      const a = z * (n + 1) + x;
      indices.push(a, a + n + 1, a + 1, a + 1, a + n + 1, a + n + 2);
    }
  }
  return { posicoes: new Float32Array(posicoes), indices: new Uint32Array(indices) };
}

describe('a malha de colisão', () => {
  it('simplifica por grade, sem triângulo degenerado nem repetido', () => {
    const { posicoes, indices } = placa(100);
    const simples = simplificarPorGrade(posicoes, indices, 0.05);
    expect(simples.indices.length / 3).toBeLessThan(indices.length / 3 / 10);
    expect(simples.indices.length).toBeGreaterThan(0);
    const vistos = new Set<string>();
    for (let t = 0; t < simples.indices.length; t += 3) {
      const [a, b, c] = [simples.indices[t]!, simples.indices[t + 1]!, simples.indices[t + 2]!];
      expect(a === b || b === c || a === c).toBe(false);
      const chave = [a, b, c].sort((x, y) => x - y).join(',');
      expect(vistos.has(chave)).toBe(false);
      vistos.add(chave);
    }
    // A superfície continua cobrindo a placa: os vértices novos ficam dentro dela.
    for (let i = 0; i < simples.posicoes.length; i += 3) {
      expect(simples.posicoes[i]).toBeGreaterThanOrEqual(0);
      expect(simples.posicoes[i]).toBeLessThanOrEqual(1);
      expect(simples.posicoes[i + 1]).toBe(0);
    }
  });

  it('aceita malha sem índice', () => {
    const { posicoes, indices } = placa(4);
    const soltas = new Float32Array(indices.length * 3);
    indices.forEach((v, i) => soltas.set(posicoes.subarray(v * 3, v * 3 + 3), i * 3));
    const simples = simplificarPorGrade(soltas, null, 0.01);
    expect(simples.indices.length).toBe(indices.length);
  });
});
