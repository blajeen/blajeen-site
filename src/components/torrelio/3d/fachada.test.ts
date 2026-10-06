import { describe, expect, it } from 'vitest';
import { LUZ } from '@/lib/torrelio/luz';
import { cota, QUARTOS, TORRE, UNIDADES } from '@/lib/torrelio/predio';
import { NIVEL_DA_LUZ, retangulosDoModo } from './fachada';

describe('a fachada viva', () => {
  it('separa as luzes: apagada e bloqueada no escuro, reservada em luz fria, vendida em luz quente', () => {
    expect(NIVEL_DA_LUZ[LUZ.apagada]).toBe(0);
    expect(NIVEL_DA_LUZ[LUZ.bloqueada]).toBe(0);
    // O sinal é a cor: negativo é a lâmpada fria da reservada, e ela aparece quase tão forte quanto a quente.
    expect(NIVEL_DA_LUZ[LUZ.baixa]).toBeLessThan(0);
    expect(Math.abs(NIVEL_DA_LUZ[LUZ.baixa]!)).toBeGreaterThanOrEqual(0.6);
    expect(NIVEL_DA_LUZ[LUZ.acesa]).toBe(1);
  });

  it('contorna cada trecho de fachada de cada unidade e de cada quarto, no plano do vidro', () => {
    const unidades = retangulosDoModo('incorporadora');
    // 72 apartamentos-tipo com 2 trechos, 2 coberturas com 3.
    expect(unidades).toHaveLength(72 * 2 + 2 * 3);
    expect(new Set(unidades.map((r) => r.dono)).size).toBe(UNIDADES.length);
    const quartos = retangulosDoModo('hotel');
    expect(new Set(quartos.map((r) => r.dono)).size).toBe(QUARTOS.length);
    for (const r of [...unidades, ...quartos]) {
      const meiaLargura = r.fachada === 'norte' || r.fachada === 'sul' ? TORRE.largura / 2 : TORRE.profundidade / 2;
      const ao = r.fachada === 'norte' || r.fachada === 'sul' ? r.centro[0] : r.centro[2];
      expect(Math.abs(ao) + r.largura / 2).toBeLessThanOrEqual(meiaLargura + 1e-9);
      expect(r.centro[1] - r.altura / 2).toBeGreaterThanOrEqual(cota(2));
      expect(r.centro[1] + r.altura / 2).toBeLessThanOrEqual(cota(22));
    }
    // A cobertura duplex tem contorno de dois andares; o apartamento-tipo, de um.
    const cobertura = unidades.find((r) => r.dono === UNIDADES.find((u) => u.id === '2001')!.indice)!;
    const tipo = unidades.find((r) => r.dono === UNIDADES.find((u) => u.id === '1803')!.indice)!;
    expect(cobertura.altura).toBeGreaterThan(tipo.altura * 2);
  });
});
