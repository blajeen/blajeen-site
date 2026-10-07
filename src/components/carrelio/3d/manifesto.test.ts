import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PONTOS_DO_INTERIOR, PORTAS } from '@/lib/carrelio/tipos';
import { JAECOO_5 } from '@/lib/carrelio/catalogo';
import type { ManifestoDoModelo } from './contrato';
import { ajusteDoModelo, caixaDosNos, caixaNoCarro, comprimentoEmZ, lerGlb, matrizDaRotacao, noCarro, noModelo, pontosDaVista, transformar, validarManifesto } from './manifesto';
import { manifestoDeIa, MODELO_ATUAL, MODELO_DE_TESTE_DA_MASCARA, MODELO_JAECOO_5, MODELO_PROVISORIO } from './modelos';
import { pesoDasRegioes } from './regioes';

const PUBLICO = join(process.cwd(), 'public');
const arquivo = (m: ManifestoDoModelo) => join(PUBLICO, m.url);
const glbDo = (m: ManifestoDoModelo) => lerGlb(readFileSync(arquivo(m)));

/** O carro no espaço do manifesto: a caixa da malha inteira, depois do ajuste. */
function caixaDoCarro(m: ManifestoDoModelo) {
  const glb = glbDo(m);
  const caixa = caixaDosNos(glb, { excluir: m.esconder, ...(m.rotacao ? { rotacao: m.rotacao } : {}) })!;
  const ajuste = ajusteDoModelo(caixa, m.comprimentoM);
  return { glb, caixa: caixaNoCarro(caixa, ajuste), ajuste };
}

const dentroDaCaixa = (p: readonly number[], c: { min: readonly number[]; max: readonly number[] }, folga = 0.12) =>
  p.every((v, i) => v >= c.min[i]! - folga && v <= c.max[i]! + folga);

describe('o manifesto do Jaecoo 5 (o modelo da página)', () => {
  it('é o modelo atual, com o crédito da licença e sem portas nem interior', () => {
    expect(MODELO_ATUAL).toBe(MODELO_JAECOO_5);
    expect(MODELO_ATUAL.provisorio).toBe(false);
    expect(MODELO_ATUAL.credito).toBe('Modelo 3D do Jaecoo 5 gerado com Tripo AI (CC BY 4.0)');
    expect(Object.keys(MODELO_ATUAL.portas)).toHaveLength(0);
    expect(Object.keys(MODELO_ATUAL.interior)).toHaveLength(0);
    expect(existsSync(arquivo(MODELO_ATUAL))).toBe(true);
  });

  it('bate com o arquivo e cabe no teto de peso da página', () => {
    const glb = glbDo(MODELO_ATUAL);
    expect(validarManifesto(MODELO_ATUAL, glb.json)).toEqual([]);
    expect(readFileSync(arquivo(MODELO_ATUAL)).byteLength).toBeLessThanOrEqual(3 * 1024 * 1024);
    // Textura em até 2048 px, índices de 16 bits.
    expect(glb.json.accessors?.find((a) => a.type === 'SCALAR')?.componentType).toBe(5123);
  });

  it('ajusta o carro a 4,38 m, frente para +Z, rodas no chão', () => {
    const { caixa } = caixaDoCarro(MODELO_ATUAL);
    expect(caixa.max[2] - caixa.min[2]).toBeCloseTo(4.38, 3);
    expect(caixa.min[1]).toBeCloseTo(0, 6);
    expect(caixa.min[0] + caixa.max[0]).toBeCloseTo(0, 3);
    expect(caixa.min[2] + caixa.max[2]).toBeCloseTo(0, 3);
    expect(comprimentoEmZ(caixa)).toBe(true);
    // A altura sai da escala pelo comprimento (o carro real tem 1,65 m sem o rack).
    expect(caixa.max[1]).toBeGreaterThan(1.6);
    expect(caixa.max[1]).toBeLessThan(1.8);
  });

  it('põe os pontos de fora do catálogo no carro, nos lugares certos', () => {
    const { caixa } = caixaDoCarro(MODELO_ATUAL);
    const deFora = JAECOO_5.pontos.filter((p) => p.vista === 'fora').map((p) => p.id);
    expect(Object.keys(MODELO_ATUAL.pontos).sort()).toEqual([...deFora].sort());
    expect(pontosDaVista(MODELO_ATUAL, 'fora').sort()).toEqual([...deFora].sort());
    expect(pontosDaVista(MODELO_ATUAL, 'dentro')).toEqual([]);
    for (const p of Object.values(MODELO_ATUAL.pontos)) expect(dentroDaCaixa(p, caixa)).toBe(true);
    const { farois, rodas, teto, portaMalas, entrar } = MODELO_ATUAL.pontos as Record<string, [number, number, number]>;
    // O "+" de entrar fica na porta da frente do motorista, por fora, na altura da maçaneta.
    expect(entrar![0]).toBeGreaterThan(caixa.max[0] - 0.2);
    expect(entrar![1]).toBeGreaterThan(0.8);
    expect(entrar![2]).toBeGreaterThan(-0.2);
    expect(entrar![2]).toBeLessThan(0.9);
    // O farol na frente, à esquerda; a roda da frente, por fora; o teto em cima; o porta-malas atrás.
    expect(farois![2]).toBeGreaterThan(1.8);
    expect(farois![0]).toBeGreaterThan(0);
    expect(rodas![0]).toBeGreaterThan(caixa.max[0] - 0.3);
    expect(rodas![2]).toBeGreaterThan(1);
    expect(teto![1]).toBeGreaterThan(caixa.max[1] - 0.05);
    expect(portaMalas![2]).toBeLessThan(caixa.min[2] + 0.1);
  });

  it('tira as rodas da máscara e acende as luzes na frente e atrás', () => {
    const mascara = MODELO_ATUAL.pinturaPorMascara!;
    const { rodas } = MODELO_ATUAL.pontos as Record<string, [number, number, number]>;
    expect(pesoDasRegioes(mascara.excluirRegioes!, [rodas![0] - 0.1, rodas![1], rodas![2]])).toBe(1);
    // O para-lama acima da roda continua pintado.
    expect(pesoDasRegioes(mascara.excluirRegioes!, [0.95, 0.85, 1.37])).toBe(0);
    for (const r of MODELO_ATUAL.regioesDeLuz!.farois!) expect(r.centro[2]).toBeGreaterThan(1.7);
    for (const r of MODELO_ATUAL.regioesDeLuz!.lanternas!) expect(r.centro[2]).toBeLessThan(-1.9);
  });
});

describe('o manifesto do modelo de IA', () => {
  it('nasce sem portas, sem interior e com verniz acetinado', () => {
    const m = manifestoDeIa({ id: 'x', url: '/x.glb', credito: 'Modelo 3D gerado com Tripo AI (CC BY 4.0)', comprimentoM: 4.38, pontos: {} });
    expect(m.portas).toEqual({});
    expect(m.interior).toEqual({});
    expect(m.pintura).toEqual([]);
    expect(m.verniz!.rugosidade).toBeGreaterThan(0.1);
  });

  it('acusa nomes, regiões e campos que não batem com o arquivo', () => {
    const json = { nodes: [{ name: 'Carro' }], materials: [{ name: 'Pintura' }] };
    const errado: ManifestoDoModelo = {
      ...MODELO_PROVISORIO,
      pintura: ['Tinta'],
      teto: ['Teto'],
      esconder: [],
      portas: { portaMalas: { no: 'Tampa', eixo: 'x', graus: 400 } },
      variante: 'Azul',
      pinturaPorMascara: { corBase: 'branco', tolerancia: 2 },
      vidrosPorRegiao: [{ centro: [0, 0, 0], meias: [0, 1, 1] }],
      farois: [],
      lanternas: [],
      telas: [],
      semMarcas: {},
      acabamentos: {},
    };
    const problemas = validarManifesto(errado, json).join('\n');
    for (const trecho of ['"Tinta"', '"Teto"', '"Tampa"', '400°', 'variante', 'corBase', 'tolerancia', 'vidrosPorRegiao']) expect(problemas).toContain(trecho);
    expect(validarManifesto({ ...MODELO_JAECOO_5, pinturaPorMascara: undefined } as unknown as ManifestoDoModelo, { nodes: [], materials: [] })).toContain(
      'pintura: sem materiais de pintura e sem pinturaPorMascara, a cor não muda.',
    );
  });
});

describe('o ajuste e a rotação do modelo', () => {
  it('põe a frente para +Z quando o arquivo vem de lado, com a rotação do manifesto', () => {
    // Um carro de 4 × 2 × 1,5 com o comprimento em X: girado −90° em Y, o comprimento vai para Z.
    const caixa = { min: [-2, 0.1, -1], max: [2, 1.6, 1] } as const;
    const r = matrizDaRotacao([0, -90, 0]);
    const cantos = [transformar(r, caixa.min), transformar(r, caixa.max)];
    const girada = { min: [0, 1, 2].map((i) => Math.min(cantos[0]![i]!, cantos[1]![i]!)) as [number, number, number], max: [0, 1, 2].map((i) => Math.max(cantos[0]![i]!, cantos[1]![i]!)) as [number, number, number] };
    expect(comprimentoEmZ(girada)).toBe(true);
    // O que estava em +X (a frente, neste arquivo) vai para +Z.
    expect(transformar(r, [2, 0, 0])[2]).toBeCloseTo(2, 6);
    const ajuste = ajusteDoModelo(girada, 4.38);
    const noEspaco = caixaNoCarro(girada, ajuste);
    expect(noEspaco.max[2] - noEspaco.min[2]).toBeCloseTo(4.38, 6);
    expect(noEspaco.min[1]).toBeCloseTo(0, 6);
    const p = [0.3, 0.7, -1.2];
    const volta = noCarro(noModelo(p, ajuste), ajuste);
    for (let i = 0; i < 3; i += 1) expect(volta[i]).toBeCloseTo(p[i]!, 9);
  });
});

// O Car Concept é só de desenvolvimento: o arquivo não é publicado. Os testes dele rodam quando o
// arquivo está na máquina (em public/produtos/carrelio/modelos/conceito.glb).
const temConceito = existsSync(arquivo(MODELO_PROVISORIO));

describe.skipIf(!temConceito)('o manifesto do Car Concept (desenvolvimento)', () => {
  it('bate com o arquivo, nas duas variantes', () => {
    const glb = glbDo(MODELO_PROVISORIO);
    expect(validarManifesto(MODELO_PROVISORIO, glb.json)).toEqual([]);
    expect(validarManifesto(MODELO_DE_TESTE_DA_MASCARA, glb.json)).toEqual([]);
  });

  it('tem as portas que o arquivo tem e câmeras de dentro no carro', () => {
    expect(Object.keys(MODELO_PROVISORIO.portas).every((p) => (PORTAS as readonly string[]).includes(p))).toBe(true);
    expect(MODELO_PROVISORIO.portas.traseiraEsquerda).toBeUndefined();
    const { caixa } = caixaDoCarro(MODELO_PROVISORIO);
    for (const ponto of PONTOS_DO_INTERIOR) {
      const camera = MODELO_PROVISORIO.interior[ponto]!;
      expect(camera).toBeDefined();
      if (ponto !== 'portaMalas') expect(dentroDaCaixa(camera.olho, caixa, 0)).toBe(true);
    }
    const deDentro = JAECOO_5.pontos.filter((p) => p.vista === 'dentro').map((p) => p.id);
    expect(pontosDaVista(MODELO_PROVISORIO, 'dentro').sort()).toEqual([...deDentro].sort());
    for (const p of Object.values(MODELO_PROVISORIO.pontos)) expect(dentroDaCaixa(p, caixa)).toBe(true);
  });
});
