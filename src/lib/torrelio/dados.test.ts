import { describe, expect, it } from 'vitest';
import { CONDICAO_INICIAL, precoInicialCentavos, statusInicial, TIPOLOGIAS, UNIDADE_EM_DESTAQUE, veOMar } from './dados';
import { UNIDADES } from './predio';

const unidade = (id: string) => UNIDADES.find((u) => u.id === id)!;

describe('os dados-base da demonstração', () => {
  it('abre com 41 vendidas, 4 reservadas, 2 indisponíveis e 27 disponíveis (55,4%)', () => {
    const contagem = { vendida: 0, reservada: 0, indisponivel: 0, disponivel: 0 };
    for (const u of UNIDADES) contagem[statusInicial(u)] += 1;
    expect(contagem).toEqual({ vendida: 41, reservada: 4, indisponivel: 2, disponivel: 27 });
    expect(((contagem.vendida / UNIDADES.length) * 100).toFixed(1)).toBe('55.4');
  });

  it('destaca a 1803: disponível e com vista para o mar', () => {
    const destaque = unidade(UNIDADE_EM_DESTAQUE);
    expect(statusInicial(destaque)).toBe('disponivel');
    expect(veOMar(destaque)).toBe(true);
    expect(veOMar(unidade('1103'))).toBe(false);
    expect(veOMar(unidade('1802'))).toBe(false);
  });

  it('sobe o preço a cada andar no mesmo final e mantém o m² numa faixa plausível', () => {
    for (const final of ['01', '02', '03', '04']) {
      const precos = UNIDADES.filter((u) => u.final === final && u.tipologia !== 'cobertura').map(precoInicialCentavos);
      expect(precos.every((p, i) => i === 0 || p > precos[i - 1]!)).toBe(true);
    }
    for (const u of UNIDADES) {
      const m2 = precoInicialCentavos(u) / (TIPOLOGIAS[u.tipologia].areaCentesimos / 100) / 100;
      expect(m2).toBeGreaterThanOrEqual(9_800);
      expect(m2).toBeLessThanOrEqual(14_500);
    }
    // 66,45 m² × R$ 9.800 × 1,16 (18º) × 1,04 (mar).
    expect(precoInicialCentavos(unidade('1803'))).toBe(78_561_974);
  });

  it('tem uma condição de pagamento que soma 100%', () => {
    expect(CONDICAO_INICIAL.grupos.reduce((soma, g) => soma + g.pontosBase, 0)).toBe(10_000);
  });
});
