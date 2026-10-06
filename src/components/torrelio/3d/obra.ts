import { Color, DoubleSide, Group, Mesh, type Material } from 'three';
import { LOTE } from '@/lib/torrelio/entorno';
import { cota, PISO_A_PISO } from '@/lib/torrelio/predio';
import { linear } from './ceu';
import { Construtor, type Rgb } from './malha';
import { padrao, type Comuns } from './materiais';
import { CAMADA, CONTORNO_DA_LAJE, fachadaEfetiva } from './torre';

/**
 * O canteiro do modo obra (só no modo incorporadora): tapume em volta do lote, pilares e núcleo
 * subindo até a estrutura (o núcleo vai um andar à frente), formas no topo, telas escuras entre o
 * último andar com vidro e a estrutura, e o guindaste no lado leste, com a torre 15 m acima da
 * estrutura (e sempre acima da vizinha). A lança só gira com movimento ligado, por 5 s depois de
 * cada interação.
 */

const COR = {
  tapume: linear('#3a3f37'),
  poste: linear('#2b2f29'),
  concretoCru: linear('#a8a59c'),
  forma: linear('#9c7d55'),
  escora: linear('#6f6a60'),
  guindaste: linear('#b79a55'),
  cabine: linear('#d8d6cf'),
  contrapeso: linear('#77746c'),
  cabo: linear('#2a2a28'),
} as const;

const NIVEL_DO_TRELICADO = 1.8;
const MASTRO = { x: 18.4, z: 1.5, lado: 1.7 } as const;
/** A torre do guindaste nunca fica abaixo disto: a lança passa por cima da vizinha (43 m). */
const ALTURA_MINIMA_DO_GUINDASTE = 48;

/** Uma haste de seção quadrada entre dois pontos quaisquer. */
function haste(c: Construtor, a: readonly number[], b: readonly number[], e: number) {
  const d = [b[0]! - a[0]!, b[1]! - a[1]!, b[2]! - a[2]!];
  const l = Math.hypot(d[0]!, d[1]!, d[2]!);
  if (l < 1e-6) return;
  const w = d.map((v) => v / l);
  const ref = Math.abs(w[1]!) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  let u = [w[1]! * ref[2]! - w[2]! * ref[1]!, w[2]! * ref[0]! - w[0]! * ref[2]!, w[0]! * ref[1]! - w[1]! * ref[0]!];
  const lu = Math.hypot(u[0]!, u[1]!, u[2]!);
  u = u.map((v) => (v / lu) * (e / 2));
  let v = [w[1]! * u[2]! - w[2]! * u[1]!, w[2]! * u[0]! - w[0]! * u[2]!, w[0]! * u[1]! - w[1]! * u[0]!];
  const lv = Math.hypot(v[0]!, v[1]!, v[2]!);
  v = v.map((x) => (x / lv) * (e / 2));
  const canto = (p: readonly number[], su: number, sv: number): [number, number, number] => [p[0]! + u[0]! * su + v[0]! * sv, p[1]! + u[1]! * su + v[1]! * sv, p[2]! + u[2]! * su + v[2]! * sv];
  const lados: [number, number][] = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
  for (let i = 0; i < 4; i += 1) {
    const [su0, sv0] = lados[i]!;
    const [su1, sv1] = lados[(i + 1) % 4]!;
    const nx = (su0 + su1) / 2;
    const ny = (sv0 + sv1) / 2;
    const n: [number, number, number] = [u[0]! * nx + v[0]! * ny, u[1]! * nx + v[1]! * ny, u[2]! * nx + v[2]! * ny];
    const ln = Math.hypot(...n) || 1;
    c.quad(canto(a, su0, sv0), canto(a, su1, sv1), canto(b, su1, sv1), canto(b, su0, sv0), [n[0] / ln, n[1] / ln, n[2] / ln]);
  }
}

export type Obra3D = {
  grupo: Group;
  aplicar(obra: { estruturaAte: number; fachadaAte: number } | null): void;
  /** Gira a lança; devolve `true` enquanto há o que animar. */
  animar(dt: number, girando: boolean): boolean;
  descartar(): void;
};

export function construirObra(comuns: Comuns): { obra: Obra3D; materiais: Material[] } {
  const material = padrao(comuns, 'obra', { vertexColors: true, roughness: 0.85, metalness: 0.05 });
  const tela = padrao(comuns, 'tela', { color: new Color('#1b1f1a'), roughness: 1, metalness: 0, transparent: true, opacity: 0.8, side: DoubleSide });

  // ---------------------------------------------------- tapume, pilares e núcleo
  const estatica = new Construtor({ cor: true });
  const pintar = (c: Construtor, cor: Rgb) => c.pintar(cor);
  pintar(estatica, COR.tapume);
  const t = 0.12;
  const altura = 2.4;
  const { xMin, xMax, zMin, zMax } = LOTE;
  estatica.caixa(xMin, 0, zMin - t, -4, altura, zMin);
  estatica.caixa(4, 0, zMin - t, xMax, altura, zMin);
  estatica.caixa(xMin, 0, zMax, xMax, altura, zMax + t);
  estatica.caixa(xMin - t, 0, zMin, xMin, altura, zMax);
  estatica.caixa(xMax, 0, zMin, xMax + t, altura, zMax);
  pintar(estatica, COR.poste);
  for (let x = xMin; x <= xMax; x += 4) {
    estatica.caixa(x - 0.06, 0, zMin - 0.2, x + 0.06, altura + 0.1, zMin - t);
    estatica.caixa(x - 0.06, 0, zMax + t, x + 0.06, altura + 0.1, zMax + 0.2);
  }
  const fimDoPavimento: number[] = [];
  fimDoPavimento[1] = estatica.marca();
  const colunas: [number, number][] = [[-6, -4], [0, -4], [6, -4], [-6, 4], [0, 4], [6, 4], [-12, 0], [12, 0], [-6, -8], [6, -8], [-6, 8], [6, 8]];
  for (let pavimento = 2; pavimento <= 22; pavimento += 1) {
    const de = pavimento === 2 ? 7.5 : cota(pavimento - 1) + 0.1;
    const ate = cota(pavimento) - 0.38;
    pintar(estatica, COR.concretoCru);
    for (const [x, z] of colunas) estatica.bloco(x, z, 0.5, 0.5, de, ate, 'bt');
    // O núcleo de elevadores e escada, oco por dentro.
    const y0 = cota(pavimento - 1);
    const y1 = cota(pavimento);
    estatica.caixa(-3.6, y0, -2.9, 3.6, y1, -2.6, 'bt');
    estatica.caixa(-3.6, y0, 2.6, 3.6, y1, 2.9, 'bt');
    estatica.caixa(-3.6, y0, -2.6, -3.3, y1, 2.6, 'bt');
    estatica.caixa(3.3, y0, -2.6, 3.6, y1, 2.6, 'bt');
    fimDoPavimento[pavimento] = estatica.marca();
  }
  const malhaEstatica = new Mesh(estatica.geometria(), material);
  malhaEstatica.name = 'obra';
  malhaEstatica.castShadow = true;
  malhaEstatica.receiveShadow = true;

  // ------------------------------------------------------- formas no topo
  const formas = new Construtor({ cor: true });
  pintar(formas, COR.forma);
  formas.extrudar(CONTORNO_DA_LAJE, -0.2, 0);
  pintar(formas, COR.escora);
  for (let x = -10.5; x <= 10.5; x += 3) for (let z = -6; z <= 6; z += 3) formas.bloco(x, z, 0.08, 0.08, -PISO_A_PISO + 0.48, -0.2, 'bt');
  const malhaFormas = new Mesh(formas.geometria(), material);
  malhaFormas.name = 'formas';
  malhaFormas.castShadow = true;

  // ------------------------------------------------------------------ telas
  const telas = new Construtor();
  const afastadas = CONTORNO_DA_LAJE.map(([x, z]) => [x * 1.012, z * 1.018] as [number, number]);
  telas.extrudar(afastadas, 0, 1, 'nenhuma');
  const malhaTelas = new Mesh(telas.geometria(), tela);
  malhaTelas.name = 'telas';
  malhaTelas.renderOrder = 1;

  // --------------------------------------------------------------- guindaste
  const mastro = new Construtor({ cor: true });
  pintar(mastro, COR.guindaste);
  const meio = MASTRO.lado / 2;
  const cantos: [number, number][] = [[-meio, -meio], [meio, -meio], [meio, meio], [-meio, meio]];
  const fimDoNivel: number[] = [0];
  const niveis = Math.ceil(80 / NIVEL_DO_TRELICADO);
  for (let k = 0; k < niveis; k += 1) {
    const y0 = k * NIVEL_DO_TRELICADO;
    const y1 = y0 + NIVEL_DO_TRELICADO;
    for (let i = 0; i < 4; i += 1) {
      const [ax, az] = cantos[i]!;
      const [bx, bz] = cantos[(i + 1) % 4]!;
      haste(mastro, [MASTRO.x + ax, y0, MASTRO.z + az], [MASTRO.x + ax, y1, MASTRO.z + az], 0.14);
      haste(mastro, [MASTRO.x + ax, y1, MASTRO.z + az], [MASTRO.x + bx, y1, MASTRO.z + bz], 0.07);
      haste(mastro, [MASTRO.x + ax, y0, MASTRO.z + az], [MASTRO.x + bx, y1, MASTRO.z + bz], 0.06);
    }
    fimDoNivel.push(mastro.marca());
  }
  const malhaMastro = new Mesh(mastro.geometria(), material);
  malhaMastro.name = 'mastro';
  malhaMastro.castShadow = true;

  // A lança, montada na origem do grupo que gira (no topo do mastro).
  const lanca = new Construtor({ cor: true });
  pintar(lanca, COR.guindaste);
  const comprimento = 40;
  const contra = 13;
  const alto = 1.4;
  const tri = (x: number): [number, number, number][] => [[x, 0, -0.65], [x, 0, 0.65], [x, alto, 0]];
  for (let x = -contra; x < comprimento; x += 2) {
    const a = tri(x);
    const b = tri(Math.min(comprimento, x + 2));
    for (let i = 0; i < 3; i += 1) {
      haste(lanca, a[i]!, b[i]!, 0.1);
      haste(lanca, a[i]!, a[(i + 1) % 3]!, 0.05);
      haste(lanca, a[i]!, b[(i + 1) % 3]!, 0.045);
    }
  }
  // Ápice, tirantes, cabine, contrapeso, carrinho e o cabo do gancho.
  haste(lanca, [-meio, 0, -meio], [0, 6.5, 0], 0.16);
  haste(lanca, [meio, 0, meio], [0, 6.5, 0], 0.16);
  haste(lanca, [-meio, 0, meio], [0, 6.5, 0], 0.16);
  haste(lanca, [meio, 0, -meio], [0, 6.5, 0], 0.16);
  pintar(lanca, COR.cabo);
  haste(lanca, [0, 6.5, 0], [comprimento * 0.62, alto, 0], 0.05);
  haste(lanca, [0, 6.5, 0], [-contra + 1, alto, 0], 0.05);
  pintar(lanca, COR.cabine);
  lanca.caixa(0.9, -2.4, -1.4, 3.2, -0.2, -0.3);
  pintar(lanca, COR.contrapeso);
  lanca.caixa(-contra + 0.3, -1.6, -1, -contra + 3.4, 0.2, 1);
  pintar(lanca, COR.cabo);
  lanca.caixa(22.5, -0.5, -0.5, 24, 0, 0.5);
  haste(lanca, [23.25, -0.5, 0], [23.25, -26, 0], 0.04);
  lanca.caixa(22.9, -27, -0.3, 23.6, -26, 0.3);
  const malhaLanca = new Mesh(lanca.geometria(), material);
  malhaLanca.name = 'lanca';
  malhaLanca.castShadow = true;
  const giro = new Group();
  giro.name = 'giro-do-guindaste';
  giro.position.set(MASTRO.x, 50, MASTRO.z);
  giro.rotation.y = 2.4;
  giro.add(malhaLanca);

  const grupo = new Group();
  grupo.name = 'obra';
  grupo.add(malhaEstatica, malhaFormas, malhaTelas, malhaMastro, giro);
  grupo.traverse((o) => o.layers.set(CAMADA.torre));
  grupo.visible = false;

  return {
    materiais: [material, tela],
    obra: {
      grupo,
      aplicar(obra) {
        grupo.visible = obra !== null;
        if (!obra) return;
        const estrutura = Math.max(1, Math.min(22, obra.estruturaAte));
        const fachada = fachadaEfetiva(obra);
        // Pilares e núcleo até um andar acima da última laje: a estrutura subindo.
        malhaEstatica.geometry.setDrawRange(0, fimDoPavimento[Math.min(22, estrutura + 1)] ?? fimDoPavimento[1]!);
        malhaFormas.visible = estrutura < 22;
        malhaFormas.position.y = cota(Math.min(22, estrutura + 1)) - 0.38;
        malhaTelas.visible = estrutura > fachada + 1;
        const y0 = cota(fachada + 1) - 0.38;
        const y1 = cota(estrutura) + 1.2;
        malhaTelas.position.y = y0;
        malhaTelas.scale.y = Math.max(0.01, y1 - y0);
        const topo = Math.max(ALTURA_MINIMA_DO_GUINDASTE, cota(estrutura) + 15);
        const nivel = Math.min(fimDoNivel.length - 1, Math.ceil(topo / NIVEL_DO_TRELICADO));
        malhaMastro.geometry.setDrawRange(0, fimDoNivel[nivel]!);
        giro.position.y = nivel * NIVEL_DO_TRELICADO;
      },
      animar(dt, girando) {
        if (!grupo.visible || !girando) return false;
        giro.rotation.y += dt * 0.11;
        return true;
      },
      descartar() {
        for (const m of [malhaEstatica, malhaFormas, malhaTelas, malhaMastro, malhaLanca]) m.geometry.dispose();
      },
    },
  };
}
