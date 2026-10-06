import { describe, expect, it } from 'vitest';
import { fluxoDePagamento, formatarPontosBase, percentualDaObra, reajustar, situacaoDoPavimento, validarCondicao } from './calculos';
import { CONDICAO_INICIAL, OBRA_INICIAL } from './dados';

describe('o fluxo de pagamento', () => {
  it('fecha no centavo para qualquer preço', () => {
    for (const preco of [78_561_974, 1, 99, 100_000_01, 243_600_000, 65_121_037]) {
      const { linhas, soma } = fluxoDePagamento(preco, CONDICAO_INICIAL);
      expect(soma).toBe(preco);
      for (const linha of linhas) expect(linha.valor * linha.parcelas + linha.ajusteNaPrimeira).toBe(linha.total);
    }
  });

  it('divide a 1803 em entrada, 36 mensais, 3 reforços e chaves', () => {
    const { linhas } = fluxoDePagamento(78_561_974, CONDICAO_INICIAL);
    const [entrada, mensais, reforcos, chaves] = linhas;
    // O centavo que sobra vai para o grupo com o maior resto (empate: o primeiro).
    expect(entrada).toMatchObject({ parcelas: 1, total: 7_856_198 });
    expect(mensais!.parcelas).toBe(36);
    expect(mensais!.ajusteNaPrimeira).toBeLessThan(36);
    expect(reforcos!.parcelas).toBe(3);
    expect(chaves!.total).toBe(47_137_184);
  });

  it('explica por que uma condição não vale', () => {
    expect(validarCondicao(CONDICAO_INICIAL)).toBeNull();
    const errada = { ...CONDICAO_INICIAL, grupos: CONDICAO_INICIAL.grupos.map((g) => (g.id === 'chaves' ? { ...g, pontosBase: 5500 } : g)) };
    expect(validarCondicao(errada)).toBe('A soma precisa dar 100%; está em 95%.');
    const semMensais = { ...CONDICAO_INICIAL, grupos: CONDICAO_INICIAL.grupos.map((g) => (g.id === 'mensais' ? { ...g, parcelas: 0 } : g)) };
    expect(validarCondicao(semMensais)).toMatch(/ao menos uma parcela/);
  });
});

describe('reajuste e obra', () => {
  it('reajusta arredondando ao centavo', () => {
    expect(reajustar(78_561_974, 350)).toBe(81_311_643);
    expect(reajustar(100, -1000)).toBe(90);
    expect(formatarPontosBase(350)).toBe('3,5%');
  });

  it('mede a obra pelas etapas ponderadas e diz a situação de cada andar', () => {
    expect(percentualDaObra(OBRA_INICIAL)).toBe(37);
    expect(situacaoDoPavimento(OBRA_INICIAL, 3)).toBe('fechado');
    expect(situacaoDoPavimento(OBRA_INICIAL, 12)).toBe('estrutura');
    expect(situacaoDoPavimento(OBRA_INICIAL, 18)).toBe('a-subir');
  });
});
