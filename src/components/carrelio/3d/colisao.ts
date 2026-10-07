/**
 * A malha de colisão do carro, sem three.js: a superfície simplificada por grade (vertex
 * clustering), para os toques e para saber se um ponto de toque está atrás da lataria. Um raio
 * contra 50 mil triângulos custa milissegundos; contra a malha simplificada, uma fração disso.
 *
 * Cada célula da grade vira um vértice (a média dos vértices que caíram nela); triângulos que
 * encolhem para uma aresta ou um ponto somem, e os repetidos também. Erro máximo: a diagonal da
 * célula, o que os pontos de toque toleram (eles ficam a uns 8 cm da lataria).
 */
export function simplificarPorGrade(
  posicoes: Float32Array,
  indices: Uint16Array | Uint32Array | null,
  passo: number,
): { posicoes: Float32Array; indices: Uint32Array } {
  const total = posicoes.length / 3;
  const celulaDoVertice = new Int32Array(total);
  const celulas = new Map<string, number>();
  const somas: number[] = [];
  const contagens: number[] = [];
  for (let i = 0; i < total; i += 1) {
    const x = posicoes[i * 3]!;
    const y = posicoes[i * 3 + 1]!;
    const z = posicoes[i * 3 + 2]!;
    const chave = `${Math.floor(x / passo)},${Math.floor(y / passo)},${Math.floor(z / passo)}`;
    let celula = celulas.get(chave);
    if (celula === undefined) {
      celula = contagens.length;
      celulas.set(chave, celula);
      somas.push(0, 0, 0);
      contagens.push(0);
    }
    somas[celula * 3] = somas[celula * 3]! + x;
    somas[celula * 3 + 1] = somas[celula * 3 + 1]! + y;
    somas[celula * 3 + 2] = somas[celula * 3 + 2]! + z;
    contagens[celula] = contagens[celula]! + 1;
    celulaDoVertice[i] = celula;
  }
  const novas = new Float32Array(contagens.length * 3);
  for (let c = 0; c < contagens.length; c += 1) {
    const n = contagens[c]!;
    novas[c * 3] = somas[c * 3]! / n;
    novas[c * 3 + 1] = somas[c * 3 + 1]! / n;
    novas[c * 3 + 2] = somas[c * 3 + 2]! / n;
  }
  const triangulos = indices ? indices.length / 3 : total / 3;
  const saida: number[] = [];
  const vistos = new Set<string>();
  for (let t = 0; t < triangulos; t += 1) {
    const a = celulaDoVertice[indices ? indices[t * 3]! : t * 3]!;
    const b = celulaDoVertice[indices ? indices[t * 3 + 1]! : t * 3 + 1]!;
    const c = celulaDoVertice[indices ? indices[t * 3 + 2]! : t * 3 + 2]!;
    if (a === b || b === c || a === c) continue;
    // A mesma face, em qualquer rotação dos vértices, entra uma vez (a orientação é mantida).
    const menor = Math.min(a, b, c);
    const chave = menor === a ? `${a},${b},${c}` : menor === b ? `${b},${c},${a}` : `${c},${a},${b}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push(a, b, c);
  }
  return { posicoes: novas, indices: Uint32Array.from(saida) };
}
