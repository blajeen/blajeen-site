import { BufferGeometry, Float32BufferAttribute, ShapeUtils, Uint32BufferAttribute, Vector2 } from 'three';

/**
 * Construtor de malhas: acumula caixas, quadriláteros, polígonos extrudados e cilindros direto em
 * arrays, sem criar uma geometria do three por peça (centenas de `BoxGeometry` mescladas pesariam na
 * montagem). Cada material da torre vira uma malha só, em ordem de pavimento: `marca()` guarda onde
 * cada pavimento termina, e o modo obra recorta com `setDrawRange`.
 *
 * UV em metros (dividido por `escalaUv`), pela face: serve às texturas de pedra e de madeira.
 */

export type Rgb = readonly [number, number, number];
type Ponto = readonly [number, number, number];

export class Construtor {
  private posicoes: number[] = [];
  private normais: number[] = [];
  private uvs: number[] = [];
  private cores: number[] = [];
  private extras = new Map<string, { tamanho: number; dados: number[] }>();
  private indices: number[] = [];
  private vertices = 0;
  private cor: Rgb = [1, 1, 1];
  private valoresExtras = new Map<string, readonly number[]>();
  private readonly comCor: boolean;
  escalaUv = 1;

  constructor(opcoes: { cor?: boolean; extras?: Readonly<Record<string, number>> } = {}) {
    this.comCor = opcoes.cor ?? false;
    for (const [nome, tamanho] of Object.entries(opcoes.extras ?? {})) {
      this.extras.set(nome, { tamanho, dados: [] });
      this.valoresExtras.set(nome, new Array<number>(tamanho).fill(0));
    }
  }

  /** Cor dos próximos vértices (linear). */
  pintar(cor: Rgb): this {
    this.cor = cor;
    return this;
  }

  /** Valor de um atributo extra para os próximos vértices. */
  extra(nome: string, valor: readonly number[] | number): this {
    this.valoresExtras.set(nome, typeof valor === 'number' ? [valor] : valor);
    return this;
  }

  /** Quantos índices já foram escritos: o fim do que foi construído até aqui. */
  marca(): number {
    return this.indices.length;
  }

  get vazio(): boolean {
    return this.indices.length === 0;
  }

  /** Quantos vértices já foram escritos. */
  get totalDeVertices(): number {
    return this.vertices;
  }

  /** Um vértice; devolve o índice. */
  vertice(p: Ponto, n: Ponto, u: number, v: number): number {
    this.posicoes.push(p[0], p[1], p[2]);
    this.normais.push(n[0], n[1], n[2]);
    this.uvs.push(u, v);
    if (this.comCor) this.cores.push(this.cor[0], this.cor[1], this.cor[2]);
    for (const [nome, { tamanho, dados }] of this.extras) {
      const valor = this.valoresExtras.get(nome)!;
      for (let i = 0; i < tamanho; i += 1) dados.push(valor[i] ?? 0);
    }
    return this.vertices++;
  }

  triangulo(a: number, b: number, c: number): void {
    this.indices.push(a, b, c);
  }

  /** Quadrilátero plano: `a b c d` em sentido anti-horário vistos do lado da normal. */
  quad(a: Ponto, b: Ponto, c: Ponto, d: Ponto, n: Ponto, uv?: readonly [number, number, number, number]): void {
    const [u0, v0, u1, v1] = uv ?? this.uvDaFace(a, c, n);
    const i = this.vertice(a, n, u0, v0);
    this.vertice(b, n, u1, v0);
    this.vertice(c, n, u1, v1);
    this.vertice(d, n, u0, v1);
    this.indices.push(i, i + 1, i + 2, i, i + 2, i + 3);
  }

  private uvDaFace(a: Ponto, c: Ponto, n: Ponto): [number, number, number, number] {
    const e = this.escalaUv;
    if (Math.abs(n[1]) > 0.5) return [a[0] / e, a[2] / e, c[0] / e, c[2] / e];
    if (Math.abs(n[0]) > 0.5) return [a[2] / e, a[1] / e, c[2] / e, c[1] / e];
    return [a[0] / e, a[1] / e, c[0] / e, c[1] / e];
  }

  /**
   * Caixa alinhada aos eixos. `sem` pula faces escondidas: 'b' baixo, 't' topo, 'n' norte (−z),
   * 's' sul (+z), 'l' leste (+x), 'o' oeste (−x).
   */
  caixa(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, sem = ''): void {
    const [xa, xb] = x0 < x1 ? [x0, x1] : [x1, x0];
    const [ya, yb] = y0 < y1 ? [y0, y1] : [y1, y0];
    const [za, zb] = z0 < z1 ? [z0, z1] : [z1, z0];
    if (!sem.includes('s')) this.quad([xa, ya, zb], [xb, ya, zb], [xb, yb, zb], [xa, yb, zb], [0, 0, 1]);
    if (!sem.includes('n')) this.quad([xb, ya, za], [xa, ya, za], [xa, yb, za], [xb, yb, za], [0, 0, -1]);
    if (!sem.includes('l')) this.quad([xb, ya, zb], [xb, ya, za], [xb, yb, za], [xb, yb, zb], [1, 0, 0]);
    if (!sem.includes('o')) this.quad([xa, ya, za], [xa, ya, zb], [xa, yb, zb], [xa, yb, za], [-1, 0, 0]);
    if (!sem.includes('t')) this.quad([xa, yb, zb], [xb, yb, zb], [xb, yb, za], [xa, yb, za], [0, 1, 0]);
    if (!sem.includes('b')) this.quad([xa, ya, za], [xb, ya, za], [xb, ya, zb], [xa, ya, zb], [0, -1, 0]);
  }

  /** Caixa pelo centro (no plano) e pela base. */
  bloco(cx: number, cz: number, largura: number, profundidade: number, y0: number, y1: number, sem = ''): void {
    this.caixa(cx - largura / 2, y0, cz - profundidade / 2, cx + largura / 2, y1, cz + profundidade / 2, sem);
  }

  /**
   * Polígono (no plano xz, em qualquer sentido) extrudado de `y0` a `y1`, com tampas. Serve às lajes
   * com as varandas de canto.
   */
  extrudar(poligono: readonly (readonly [number, number])[], y0: number, y1: number, tampas: 'ambas' | 'topo' | 'base' | 'nenhuma' = 'ambas'): void {
    // Ordena para área positiva em (x, z): assim a normal externa de cada aresta é (dz, −dx).
    const ordem = ShapeUtils.isClockWise(poligono.map(([x, z]) => new Vector2(x, z))) ? [...poligono].reverse() : [...poligono];
    for (let i = 0; i < ordem.length; i += 1) {
      const [xa, za] = ordem[i]!;
      const [xb, zb] = ordem[(i + 1) % ordem.length]!;
      const comprimento = Math.hypot(xb - xa, zb - za);
      if (comprimento < 1e-6) continue;
      const n: Ponto = [(zb - za) / comprimento, 0, -(xb - xa) / comprimento];
      this.quad([xb, y0, zb], [xa, y0, za], [xa, y1, za], [xb, y1, zb], n);
    }
    if (tampas === 'nenhuma') return;
    const triangulos = ShapeUtils.triangulateShape(ordem.map(([x, z]) => new Vector2(x, z)), []);
    const tampa = (y: number, cima: boolean) => {
      const base = this.vertices;
      for (const [x, z] of ordem) this.vertice([x, y, z], [0, cima ? 1 : -1, 0], x / this.escalaUv, z / this.escalaUv);
      for (const [a, b, c] of triangulos) {
        const [xa, za] = ordem[a!]!;
        const [xb, zb] = ordem[b!]!;
        const [xc, zc] = ordem[c!]!;
        // Vista de cima (+y), um triângulo de frente tem área negativa em (x, z).
        const area = (xb - xa) * (zc - za) - (zb - za) * (xc - xa);
        if (area < 0 === cima) this.indices.push(base + a!, base + b!, base + c!);
        else this.indices.push(base + a!, base + c!, base + b!);
      }
    };
    if (tampas === 'ambas' || tampas === 'topo') tampa(y1, true);
    if (tampas === 'ambas' || tampas === 'base') tampa(y0, false);
  }

  /** Polígono plano horizontal (forros, tampas), virado para cima ou para baixo. */
  poligono(pontos: readonly (readonly [number, number])[], y: number, paraCima: boolean): void {
    const ordem = [...pontos];
    const triangulos = ShapeUtils.triangulateShape(ordem.map(([x, z]) => new Vector2(x, z)), []);
    const base = this.vertices;
    for (const [x, z] of ordem) this.vertice([x, y, z], [0, paraCima ? 1 : -1, 0], x / this.escalaUv, z / this.escalaUv);
    for (const [a, b, c] of triangulos) {
      const [xa, za] = ordem[a!]!;
      const [xb, zb] = ordem[b!]!;
      const [xc, zc] = ordem[c!]!;
      const area = (xb - xa) * (zc - za) - (zb - za) * (xc - xa);
      if (area < 0 === paraCima) this.indices.push(base + a!, base + b!, base + c!);
      else this.indices.push(base + a!, base + c!, base + b!);
    }
  }

  /** Cilindro vertical (ou tronco de cone) de `y0` a `y1`. */
  cilindro(cx: number, cz: number, raioBase: number, raioTopo: number, y0: number, y1: number, segmentos = 8, tampa = true): void {
    const base = this.vertices;
    const inclinacao = (raioBase - raioTopo) / Math.max(1e-6, y1 - y0);
    for (let i = 0; i <= segmentos; i += 1) {
      const a = (i / segmentos) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const n = Math.hypot(1, inclinacao);
      const normal: Ponto = [c / n, inclinacao / n, s / n];
      this.vertice([cx + c * raioBase, y0, cz + s * raioBase], normal, i / segmentos, 0);
      this.vertice([cx + c * raioTopo, y1, cz + s * raioTopo], normal, i / segmentos, 1);
    }
    for (let i = 0; i < segmentos; i += 1) {
      const a = base + i * 2;
      this.indices.push(a, a + 1, a + 3, a, a + 3, a + 2);
    }
    if (!tampa) return;
    const centro = this.vertice([cx, y1, cz], [0, 1, 0], 0.5, 0.5);
    const anel = this.vertices;
    for (let i = 0; i <= segmentos; i += 1) {
      const a = (i / segmentos) * Math.PI * 2;
      this.vertice([cx + Math.cos(a) * raioTopo, y1, cz + Math.sin(a) * raioTopo], [0, 1, 0], 0, 0);
    }
    for (let i = 0; i < segmentos; i += 1) this.indices.push(centro, anel + i + 1, anel + i);
  }

  geometria(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.posicoes, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.normais, 3));
    g.setAttribute('uv', new Float32BufferAttribute(this.uvs, 2));
    if (this.comCor) g.setAttribute('color', new Float32BufferAttribute(this.cores, 3));
    for (const [nome, { tamanho, dados }] of this.extras) g.setAttribute(nome, new Float32BufferAttribute(dados, tamanho));
    g.setIndex(new Uint32BufferAttribute(this.indices, 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }
}
