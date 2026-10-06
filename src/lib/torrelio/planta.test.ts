import { describe, expect, it } from 'vitest';
import { TIPOLOGIAS } from './dados';
import {
  ABERTURAS_DE_PASSAGEM,
  areaDoPoligono,
  comodoNoPonto,
  comprimentoDaParede,
  contemPonto,
  direcaoDaParede,
  formatarArea,
  IDS_DOS_COMODOS,
  ladosDaAbertura,
  norteDaUnidade,
  parede,
  pegadaDoMovel,
  PLANTA,
  pontoNaParede,
  type ComodoId,
} from './planta';

const centesimos = (m2: number) => Math.round(m2 * 100);

describe('planta fictícia de 2 dormitórios', () => {
  it('tem os nove cômodos combinados, sem repetição', () => {
    expect([...IDS_DOS_COMODOS].sort()).toEqual(
      ['banho-social', 'banho-suite', 'circulacao', 'cozinha', 'dormitorio', 'sala', 'servico', 'suite', 'varanda'].sort(),
    );
  });

  it('declara em cada cômodo a área que o polígono tem (shoelace, ±0,01 m²)', () => {
    for (const c of PLANTA.comodos) {
      expect(Math.abs(areaDoPoligono(c.poligono) - c.areaCentesimos / 100), c.id).toBeLessThanOrEqual(0.01);
    }
  });

  it('soma a área útil com as áreas dos cômodos, e a privativa é a da tipologia', () => {
    const soma = PLANTA.comodos.reduce((total, c) => total + c.areaCentesimos, 0);
    expect(soma).toBe(PLANTA.areaUtilCentesimos);
    expect(PLANTA.areaPrivativaCentesimos).toBe(6645);
    expect(PLANTA.areaPrivativaCentesimos).toBe(TIPOLOGIAS['tipo-2d'].areaCentesimos);
    expect(centesimos(areaDoPoligono(PLANTA.contorno))).toBe(6645);
    // A útil é menor que a privativa: a diferença são paredes, guarda-corpo e o shaft.
    expect(PLANTA.areaUtilCentesimos).toBeLessThan(PLANTA.areaPrivativaCentesimos);
  });

  it('não sobrepõe cômodos nem os põe fora do contorno (grade de 5 cm)', () => {
    const passo = 0.05;
    let celulas = 0;
    for (let x = -1.2 + passo / 2; x < 9; x += passo) {
      for (let y = -1.2 + passo / 2; y < 6.5; y += passo) {
        const dentro = PLANTA.comodos.filter((c) => contemPonto(c.poligono, [x, y]));
        expect(dentro.length, `(${x.toFixed(3)}, ${y.toFixed(3)})`).toBeLessThanOrEqual(1);
        if (dentro.length === 1) {
          celulas += 1;
          expect(contemPonto(PLANTA.contorno, [x, y])).toBe(true);
        }
      }
    }
    expect(celulas * passo * passo).toBeCloseTo(PLANTA.areaUtilCentesimos / 100, 0);
  });

  it('põe as paredes entre os cômodos, nunca por cima deles', () => {
    for (const p of PLANTA.paredes) {
      const comprimento = comprimentoDaParede(p);
      for (let d = 0.05; d < comprimento - 0.05; d += 0.05) {
        expect(comodoNoPonto(pontoNaParede(p, d)), `${p.id} a ${d.toFixed(2)} m`).toBeNull();
      }
    }
  });

  it('assenta cada abertura inteira na sua parede, sem duas no mesmo trecho', () => {
    for (const p of PLANTA.paredes) {
      const nela = PLANTA.aberturas.filter((a) => a.parede === p.id).sort((a, b) => a.centro - b.centro);
      for (const a of nela) {
        expect(a.centro - a.largura / 2, a.id).toBeGreaterThanOrEqual(0.05);
        expect(a.centro + a.largura / 2, a.id).toBeLessThanOrEqual(comprimentoDaParede(p) - 0.05);
        expect(a.peitoril + a.altura, a.id).toBeLessThanOrEqual(PLANTA.peDireito);
      }
      for (let i = 1; i < nela.length; i += 1) {
        const anterior = nela[i - 1]!;
        const atual = nela[i]!;
        expect(atual.centro - atual.largura / 2, `${anterior.id} e ${atual.id}`).toBeGreaterThan(anterior.centro + anterior.largura / 2 + 0.1);
      }
    }
  });

  it('liga dois lados diferentes em toda porta, e a folha abre para um deles', () => {
    for (const a of PLANTA.aberturas) {
      const [um, outro] = ladosDaAbertura(a);
      expect(um, a.id).not.toBe(outro);
      if (a.abre) expect([um, outro], a.id).toContain(a.abre.para);
      if (a.tipo === 'porta') expect(a.abre, a.id).not.toBeNull();
    }
  });

  it('põe as janelas só nas fachadas, e a entrada no corredor do prédio', () => {
    for (const a of PLANTA.aberturas.filter((x) => x.tipo === 'janela')) {
      expect(parede(a.parede).externa, a.id).toBe(true);
      expect(ladosDaAbertura(a), a.id).toContain('fora');
      expect(a.peitoril, a.id).toBeGreaterThanOrEqual(0.9);
    }
    const entrada = PLANTA.aberturas.find((a) => a.id === PLANTA.entrada)!;
    expect(parede(entrada.parede).id).toBe('sul');
    expect(parede(entrada.parede).externa).toBe(false);
    expect(ladosDaAbertura(entrada)).toContain('fora');
    expect(entrada.abre?.para).toBe('cozinha');
  });

  it('dá luz natural aos cômodos de permanência longa', () => {
    const iluminados = new Set<ComodoId | 'fora'>();
    for (const a of PLANTA.aberturas.filter((x) => x.tipo === 'janela' || x.tipo === 'porta-de-correr')) {
      ladosDaAbertura(a).forEach((lado) => iluminados.add(lado));
    }
    for (const id of ['sala', 'dormitorio', 'suite', 'cozinha'] as const) expect(iluminados, id).toContain(id);
  });

  it('alcança todos os cômodos a partir da porta de entrada, pelas portas e passagens', () => {
    const vizinhos = new Map<string, Set<string>>();
    const ligar = (a: string, b: string) => {
      if (!vizinhos.has(a)) vizinhos.set(a, new Set());
      vizinhos.get(a)!.add(b);
    };
    for (const a of PLANTA.aberturas.filter((x) => ABERTURAS_DE_PASSAGEM.includes(x.tipo))) {
      const [um, outro] = ladosDaAbertura(a);
      ligar(um, outro);
      ligar(outro, um);
    }
    const entrada = PLANTA.aberturas.find((a) => a.id === PLANTA.entrada)!;
    const primeiro = ladosDaAbertura(entrada).find((lado) => lado !== 'fora')!;
    const vistos = new Set<string>([primeiro]);
    const fila = [primeiro as string];
    while (fila.length) {
      const atual = fila.shift()!;
      for (const proximo of vizinhos.get(atual) ?? []) {
        if (proximo === 'fora' || vistos.has(proximo)) continue;
        vistos.add(proximo);
        fila.push(proximo);
      }
    }
    expect([...vistos].sort()).toEqual([...IDS_DOS_COMODOS].sort());
  });

  it('chega aos quartos sem atravessar banheiro, e ao banho da suíte só pela suíte', () => {
    const ligacoes = PLANTA.aberturas
      .filter((x) => ABERTURAS_DE_PASSAGEM.includes(x.tipo))
      .map((a) => [...ladosDaAbertura(a)].sort().join('|'));
    expect(ligacoes).toContain(['circulacao', 'dormitorio'].sort().join('|'));
    expect(ligacoes).toContain(['circulacao', 'suite'].sort().join('|'));
    expect(ligacoes.filter((l) => l.includes('banho-suite'))).toEqual([['banho-suite', 'suite'].sort().join('|')]);
  });

  it('cabe cada móvel inteiro no seu cômodo', () => {
    for (const m of PLANTA.moveis) {
      const c = PLANTA.comodos.find((x) => x.id === m.comodo)!;
      for (const [x, y] of pegadaDoMovel(m)) {
        // Encostar na parede vale: o canto é puxado 1 mm para dentro.
        const [cx, cy] = m.posicao;
        expect(contemPonto(c.poligono, [x + Math.sign(cx - x) * 0.001, y + Math.sign(cy - y) * 0.001]), `${m.tipo} em ${m.comodo}`).toBe(true);
      }
    }
  });

  it('põe o rótulo de cada cômodo dentro dele', () => {
    for (const c of PLANTA.comodos) expect(contemPonto(c.poligono, c.rotulo), c.id).toBe(true);
  });

  it('gira o norte do final 03, espelhado de norte para sul', () => {
    expect(norteDaUnidade(false)).toBe(0);
    expect(norteDaUnidade(true)).toBe(180);
  });

  it('escreve áreas e direções como na planta', () => {
    expect(formatarArea(6645)).toBe('66,45 m²');
    expect(direcaoDaParede(parede('norte'))).toEqual([1, 0]);
  });
});
