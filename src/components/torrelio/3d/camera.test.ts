import { describe, expect, it } from 'vitest';
import { pontoDeVistaDa, raioLivre } from '@/lib/torrelio/entorno';
import { QUARTOS, UNIDADES } from '@/lib/torrelio/predio';
import type { Fachada } from '@/lib/torrelio/tipos';
import {
  afastarDosObstaculos, caminhoDaMola, CILINDRO_DO_PREDIO, dentroDoCilindro, fovDaVista, menorDiferenca, passoDaMola, poseDeAproximacao,
  poseDoEnquadramento, posicaoDaPose, rumoDaPose, type Lente, type NomeDoEnquadramento, type Pose, type Vetor,
} from './camera';

const LENTES: readonly Lente[] = [
  { fovVertical: 32, aspecto: 16 / 9 },
  { fovVertical: 32, aspecto: 4 / 5 },
  { fovVertical: 32, aspecto: 16 / 9, livreX: 0.55 },
];
const NOMES: readonly NomeDoEnquadramento[] = ['abertura', 'frente', 'lateral', 'fundos', 'rooftop'];
const livre = (de: Vetor, ate: Vetor) => raioLivre(de, ate);

function aproximacoes(): Pose[] {
  const poses: Pose[] = [];
  for (const alvo of [...UNIDADES, ...QUARTOS.filter((_, i) => i % 3 === 0)]) {
    for (const fachada of alvo.fachadas as Fachada[]) {
      const ponto = pontoDeVistaDa(alvo, fachada);
      poses.push(poseDeAproximacao(ponto.olho, ponto.direcao, livre));
    }
  }
  return poses;
}

describe('a câmera da torre', () => {
  it('põe o azimute 0 ao norte (−z) e olha para o rumo oposto', () => {
    const p = posicaoDaPose({ azimute: 0, elevacao: 0, raio: 100, alvo: [0, 0, 0] });
    expect(p[2]).toBeCloseTo(-100, 6);
    expect(rumoDaPose({ azimute: 0, elevacao: 0, raio: 100, alvo: [0, 0, 0] })).toBe(180);
    expect(posicaoDaPose({ azimute: 90, elevacao: 0, raio: 50, alvo: [0, 0, 0] })[0]).toBeCloseTo(50, 6);
    expect(menorDiferenca(350, 10)).toBe(20);
    expect(menorDiferenca(10, 350)).toBe(-20);
  });

  it('tem uma mola que assenta sem passar do ponto, estável com passo grande', () => {
    let x = 0;
    let v = 0;
    let maximo = 0;
    for (let i = 0; i < 240; i += 1) {
      [x, v] = passoDaMola(x, v, 1, 6, 1 / 60);
      maximo = Math.max(maximo, x);
    }
    expect(maximo).toBeLessThanOrEqual(1 + 1e-9);
    expect(x).toBeCloseTo(1, 3);
    const [grande] = passoDaMola(0, 0, 1, 6, 5);
    expect(grande).toBeGreaterThan(0.99);
    expect(grande).toBeLessThanOrEqual(1);
  });

  it('enquadra o prédio inteiro pelo FOV vertical, em 16:9 e em 4:5', () => {
    for (const lente of LENTES) {
      for (const nome of ['frente', 'lateral', 'fundos'] as const) {
        const pose = poseDoEnquadramento(nome, lente);
        const olho = posicaoDaPose(pose);
        // O coroamento (72 m) e a calçada (0 m) cabem no FOV vertical, vistos do olho.
        const meio = (lente.fovVertical / 2) * (Math.PI / 180);
        for (const y of [0, 72]) {
          const dx = -olho[0];
          const dz = -olho[2];
          const anguloDoPonto = Math.atan2(y - olho[1], Math.hypot(dx, dz));
          const anguloDoAlvo = Math.atan2(pose.alvo[1] - olho[1], Math.hypot(dx, dz));
          expect(Math.abs(anguloDoPonto - anguloDoAlvo), `${nome} ${y}`).toBeLessThan(meio);
        }
      }
    }
  });

  it('nunca entra no prédio, entre quaisquer enquadramentos e até a frente de qualquer varanda', () => {
    const destinos: Pose[] = [];
    for (const lente of LENTES) for (const nome of NOMES) destinos.push(poseDoEnquadramento(nome, lente));
    const vista = aproximacoes();
    expect(vista.length).toBeGreaterThan(150);
    const origens = destinos.slice(0, NOMES.length * 2);
    for (const de of origens) {
      for (const para of [...destinos, ...vista]) {
        for (const ponto of caminhoDaMola(de, para, 6, 2.5, 1 / 30)) {
          expect(dentroDoCilindro(ponto), JSON.stringify({ de, para, ponto })).toBe(false);
        }
      }
    }
    // E na volta: da frente de uma varanda para os enquadramentos.
    for (const de of vista.filter((_, i) => i % 7 === 0)) {
      for (const para of origens) {
        for (const ponto of caminhoDaMola(de, para, 6, 2.5, 1 / 30)) expect(dentroDoCilindro(ponto)).toBe(false);
      }
    }
  });

  it('aproxima a varanda do leste sem atravessar a torre vizinha, a 20 m', () => {
    for (const id of ['501', '504', '1301']) {
      const unidade = UNIDADES.find((u) => u.id === id)!;
      const ponto = pontoDeVistaDa(unidade, 'leste');
      const pose = poseDeAproximacao(ponto.olho, ponto.direcao, livre);
      const camera = posicaoDaPose(pose);
      expect(raioLivre(camera, [ponto.olho[0], ponto.olho[1], ponto.olho[2]]), id).toBe(true);
      const dentroDaVizinha = camera[0] > 30 && camera[0] < 54 && camera[2] > -18 && camera[2] < 42 && camera[1] < 45;
      expect(dentroDaVizinha, id).toBe(false);
      // Abaixo do topo da vizinha, a reta de frente para a fachada bate nela: a aproximação gira.
      // No 13º, a câmera (15° acima do olho) já passa por cima e vem de frente.
      expect(pose.azimute === 90, id).toBe(id === '1301');
    }
    const sul = pontoDeVistaDa(UNIDADES.find((u) => u.id === '1803')!, 'sul');
    expect(poseDeAproximacao(sul.olho, sul.direcao, livre).azimute).toBe(180);
  });

  it('tira a câmera de dentro do prédio e de cima dos outros, como rede de segurança', () => {
    expect(dentroDoCilindro(afastarDosObstaculos([3, 20, 4], []))).toBe(false);
    const fora = afastarDosObstaculos([40, 10, 0], [{ min: [32, 0, -16], max: [52, 43, 40] }]);
    expect(fora[1]).toBeGreaterThan(43);
    expect(Math.hypot(fora[0], fora[2])).toBeGreaterThanOrEqual(CILINDRO_DO_PREDIO.raio - 1e-9);
  });

  it('abre a vista da varanda com 55° em pé e cerca de 70° na horizontal deitado', () => {
    expect(fovDaVista(390 / 844)).toBe(55);
    const horizontal = 2 * Math.atan(Math.tan((fovDaVista(16 / 9) * Math.PI) / 360) * (16 / 9)) * (180 / Math.PI);
    expect(horizontal).toBeCloseTo(70, 0);
  });
});
