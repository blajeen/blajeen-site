import { describe, expect, it } from 'vitest';
import {
  alvoDaCaixa, cantosDaCaixa, direcaoDoOlhar, direcoesNaEsfera, ELEVACAO, folgaDoEnquadramento, fovDeDentro, fovDeFora, limitarElevacao, limitarInclinacao, limitesDoRaio,
  MolaVetorial, olharPara, pertoDe, poseDeAbertura, posicaoNaOrbita, projetarNaLente, raioParaCaber, silhuetaDosPontos, type Caixa, type Lente,
} from './orbita';

/** O Jaecoo ajustado: 4,38 m de comprimento, 2,2 m com os retrovisores, 1,73 m de altura. */
const CARRO: Caixa = { min: [-1.1, 0, -2.19], max: [1.1, 1.73, 2.19] };
const LENTES: Lente[] = [
  { fovVertical: fovDeFora(16 / 9), aspecto: 16 / 9 },
  { fovVertical: fovDeFora(4 / 5), aspecto: 4 / 5 },
  { fovVertical: fovDeFora(390 / 844), aspecto: 390 / 844 },
  { fovVertical: fovDeFora(16 / 9), aspecto: 16 / 9, livreX: 0.6 },
];

describe('a câmera do carro', () => {
  it('põe o azimute 0 na frente (+Z) e o 90 do lado do motorista (+X)', () => {
    const frente = posicaoNaOrbita({ azimute: 0, elevacao: 0, raio: 10, alvo: [0, 0, 0] });
    expect(frente[2]).toBeCloseTo(10, 6);
    const esquerda = posicaoNaOrbita({ azimute: 90, elevacao: 0, raio: 10, alvo: [0, 0, 0] });
    expect(esquerda[0]).toBeCloseTo(10, 6);
    const alto = posicaoNaOrbita({ azimute: 0, elevacao: 30, raio: 10, alvo: [0, 1, 0] });
    expect(alto[1]).toBeCloseTo(6, 6);
    expect(pertoDe(350, 10)).toBe(370);
  });

  it('enquadra o carro inteiro na parte livre da tela, deitado e em pé', () => {
    for (const lente of LENTES) {
      const pose = poseDeAbertura(CARRO, lente);
      const olho = posicaoNaOrbita(pose);
      for (const canto of cantosDaCaixa(CARRO)) {
        const ndc = projetarNaLente(canto, olho, pose.alvo, lente)!;
        expect(Math.abs(ndc[0]), JSON.stringify(lente)).toBeLessThanOrEqual(1);
        expect(Math.abs(ndc[1])).toBeLessThanOrEqual(1);
      }
      // E justo: um pouco mais perto, algum canto passa do respiro.
      const limite = 1 - folgaDoEnquadramento(lente.aspecto);
      const perto = { ...pose, raio: pose.raio * 0.97 };
      const passa = cantosDaCaixa(CARRO).some((c) => {
        const ndc = projetarNaLente(c, posicaoNaOrbita(perto), perto.alvo, lente);
        return !ndc || Math.abs(ndc[0]) > limite || Math.abs(ndc[1]) > limite;
      });
      expect(passa).toBe(true);
    }
    // Com painel cobrindo 40% da largura, a câmera recua.
    expect(poseDeAbertura(CARRO, LENTES[3]!).raio).toBeGreaterThan(poseDeAbertura(CARRO, LENTES[0]!).raio);
  });

  it('abre a pose ¾ de frente, um pouco acima dos olhos, mirando abaixo do meio do carro', () => {
    const pose = poseDeAbertura(CARRO, LENTES[0]!);
    expect(pose.azimute).toBeGreaterThan(20);
    expect(pose.azimute).toBeLessThan(60);
    const olho = posicaoNaOrbita(pose);
    expect(olho[1]).toBeGreaterThan(1.3);
    expect(olho[1]).toBeLessThan(2.4);
    expect(alvoDaCaixa(CARRO)[1]).toBeLessThan(1.73 / 2);
  });

  it('nunca deixa o zoom entrar no carro nem a inclinação sair de 2° a 35°', () => {
    const { minimo, maximo } = limitesDoRaio(CARRO, 8);
    expect(maximo).toBeGreaterThan(minimo);
    for (let azimute = 0; azimute < 360; azimute += 15) {
      for (const elevacao of [ELEVACAO.minima, ELEVACAO.maxima]) {
        const p = posicaoNaOrbita({ azimute, elevacao, raio: minimo, alvo: alvoDaCaixa(CARRO) });
        const dentro = p[0] > CARRO.min[0] && p[0] < CARRO.max[0] && p[1] < CARRO.max[1] && p[2] > CARRO.min[2] && p[2] < CARRO.max[2];
        expect(dentro, `${azimute} ${elevacao}`).toBe(false);
      }
    }
    expect(limitarElevacao(-10)).toBe(2);
    expect(limitarElevacao(80)).toBe(35);
    expect(limitarInclinacao(-90)).toBe(-60);
  });

  it('abre o FOV no celular em pé, de fora e de dentro', () => {
    expect(fovDeFora(16 / 9)).toBe(30);
    expect(fovDeFora(390 / 844)).toBeGreaterThan(40);
    expect(fovDeDentro(16 / 9)).toBe(70);
    expect(fovDeDentro(390 / 844)).toBeGreaterThan(80);
  });

  it('olha de dentro para o alvo e volta à mesma direção', () => {
    const olho = [0, 0.95, 0.1];
    const alvo = [0.4, 0.75, 1.4];
    const { rumo, inclinacao } = olharPara(olho, alvo);
    const d = direcaoDoOlhar(rumo, inclinacao);
    const n = Math.hypot(alvo[0]! - olho[0]!, alvo[1]! - olho[1]!, alvo[2]! - olho[2]!);
    expect(d[0]).toBeCloseTo((alvo[0]! - olho[0]!) / n, 6);
    expect(d[1]).toBeCloseTo((alvo[1]! - olho[1]!) / n, 6);
    expect(d[2]).toBeCloseTo((alvo[2]! - olho[2]!) / n, 6);
  });

  it('tem uma mola que assenta sem passar do ponto e para de pedir quadro', () => {
    const mola = new MolaVetorial([0, 10], [0.01, 0.001], 6);
    mola.destino = [90, 5];
    let maximo = 0;
    let quadros = 0;
    while (mola.passo(1 / 60) && quadros < 1000) {
      maximo = Math.max(maximo, mola.atual[0]!);
      quadros += 1;
    }
    expect(maximo).toBeLessThanOrEqual(90);
    expect(mola.atual).toEqual([90, 5]);
    expect(mola.emMovimento).toBe(false);
    expect(quadros).toBeLessThan(200);
  });

  it('acha a silhueta: o ponto mais longe em cada direção', () => {
    const pontos = [0, 0, 0, 2, 0, 0, -1, 0, 0, 0, 3, 0, 0, 0, -4, 0.5, 0.5, 0.5];
    const silhueta = silhuetaDosPontos(pontos, [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, 0, -1]]);
    expect(silhueta).toEqual([[2, 0, 0], [-1, 0, 0], [0, 3, 0], [0, 0, -4]]);
    const direcoes = direcoesNaEsfera(96);
    expect(direcoes).toHaveLength(96);
    for (const d of direcoes) expect(Math.hypot(...d)).toBeCloseTo(1, 6);
    // A silhueta enquadra mais justo que os cantos da caixa (que o carro não tem).
    const caixaPontos = cantosDaCaixa(CARRO).flat();
    expect(raioParaCaber(silhuetaDosPontos(caixaPontos, direcoes), 36, 8, alvoDaCaixa(CARRO), LENTES[0]!, 0.2)).toBeCloseTo(
      raioParaCaber(cantosDaCaixa(CARRO), 36, 8, alvoDaCaixa(CARRO), LENTES[0]!, 0.2),
      3,
    );
  });
});
