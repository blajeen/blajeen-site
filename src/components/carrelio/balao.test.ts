import { describe, expect, it } from 'vitest';
import { alturaDoBalao, posicaoDoBalao } from './balao';
import { DETALHES_DO_JAECOO_5 } from './detalhes';

const PALCO = { largura: 780, altura: 600, base: 64 };

describe('o balão do ponto', () => {
  it('a foto com abas deixa o balão bem mais alto que o de texto', () => {
    const texto = alturaDoBalao({ id: 'rodas', rotulo: 'Rodas', texto: 'Liga leve de 18".' });
    const comAbas = alturaDoBalao({ id: 'portaMalas', rotulo: 'Porta-malas', texto: '410 l.', detalhe: DETALHES_DO_JAECOO_5['portaMalas'] });
    const semAbas = alturaDoBalao({ id: 'teto', rotulo: 'Teto', texto: 'Fixo.', detalhe: DETALHES_DO_JAECOO_5['teto'] });
    expect(comAbas).toBeGreaterThan(semAbas);
    expect(semAbas).toBeGreaterThan(texto * 2);
  });

  it('abre em cima quando cabe; embaixo quando só embaixo cabe', () => {
    expect(posicaoDoBalao({ x: 400, y: 500 }, PALCO, 260)).toEqual({ lado: 'meio', vertical: 'acima', ajuste: 0 });
    expect(posicaoDoBalao({ x: 400, y: 120 }, PALCO, 260)).toEqual({ lado: 'meio', vertical: 'abaixo', ajuste: 0 });
    // Perto da borda, abre para dentro.
    expect(posicaoDoBalao({ x: 60, y: 500 }, PALCO, 60).lado).toBe('inicio');
    expect(posicaoDoBalao({ x: 740, y: 500 }, PALCO, 60).lado).toBe('fim');
  });

  it('sem espaço em cima nem embaixo, abre de lado, para o lado com espaço, sem sair do palco', () => {
    // O porta-malas no meio do palco do computador: o balão de 280 px não cabe nem em cima nem embaixo.
    const meio = posicaoDoBalao({ x: 495, y: 275 }, PALCO, 280);
    expect(meio).toEqual({ lado: 'fim', vertical: 'lado', ajuste: 0 });
    expect(posicaoDoBalao({ x: 200, y: 275 }, PALCO, 280).lado).toBe('inicio');
    // Perto do pé, o balão sobe para não passar da barra.
    const baixo = posicaoDoBalao({ x: 495, y: 420 }, { ...PALCO, altura: 500 }, 400);
    expect(baixo.vertical).toBe('lado');
    expect(420 - 400 / 2 + baixo.ajuste + 400).toBeLessThanOrEqual(500 - 64 - 10);
  });
});
