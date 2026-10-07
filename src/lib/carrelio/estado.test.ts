import { describe, expect, it } from 'vitest';
import { JAECOO_5, temTetoPreto } from './catalogo';
import {
  CAMPANHA_INICIAL, PEDIDOS_MAXIMOS, diaLocal, estadoInicial, reduzir, situacaoDe, somarDias, validarTestDrive, type EstadoCarrelio,
} from './estado';
import { CORES, VERSOES } from './tipos';

const quando = '2026-10-07T15:00:00.000Z';

describe('o catálogo do Jaecoo 5', () => {
  it('tem as duas versões e as quatro cores, com os preços de lançamento divulgados', () => {
    expect(JAECOO_5.versoes.map((v) => v.id)).toEqual([...VERSOES]);
    expect(JAECOO_5.cores.map((c) => c.id)).toEqual([...CORES]);
    expect(JAECOO_5.versoes.map((v) => v.preco.lancamento)).toEqual([154_990, 179_990]);
    expect(JAECOO_5.versoes.map((v) => v.preco.depois)).toEqual([159_990, 184_990]);
    expect(JAECOO_5.fontes.length).toBeGreaterThan(0);
  });

  it('só o Branco Arctic no Prestige vem com o teto preto', () => {
    expect(temTetoPreto(JAECOO_5, 'prestige', 'branco-arctic')).toBe(true);
    expect(temTetoPreto(JAECOO_5, 'comfort', 'branco-arctic')).toBe(false);
    expect(temTetoPreto(JAECOO_5, 'prestige', 'azul-gaia')).toBe(false);
  });

  it('cada ponto de toque explica o item nas versões que o têm', () => {
    for (const ponto of JAECOO_5.pontos) expect(ponto.texto.prestige).toBeTruthy();
    expect(JAECOO_5.pontos.find((p) => p.id === 'teto')!.texto.comfort).toBeNull();
  });
});

describe('o estado da loja', () => {
  it('abre com o estoque de demonstração, os preços de lançamento e a campanha do primeiro lote', () => {
    const estado = estadoInicial();
    expect(estado.precos).toEqual({ comfort: 154_990_00, prestige: 179_990_00 });
    expect(estado.campanha).toEqual({ ativa: true, texto: CAMPANHA_INICIAL });
    expect(situacaoDe(estado.estoque.comfort['branco-arctic'])).toBe('pronta-entrega');
    expect(situacaoDe(estado.estoque.comfort['cinza-centaurus'])).toBe('a-caminho');
    expect(situacaoDe(estado.estoque.prestige['preto-andromeda'])).toBe('sob-encomenda');
  });

  it('muda a quantidade, apaga a previsão quando o carro chega e anota no histórico', () => {
    const chegou = reduzir(estadoInicial(), { tipo: 'estoque/quantidade', versao: 'comfort', cor: 'cinza-centaurus', quantidade: 2, quando });
    expect(chegou.estoque.comfort['cinza-centaurus']).toEqual({ quantidade: 2, chegaEmDias: null });
    expect(chegou.historico[0]).toMatchObject({ tipo: 'estoque', texto: 'Comfort Cinza Centaurus: 0 → 2 na loja.', quando });
    const acabou = reduzir(chegou, { tipo: 'estoque/quantidade', versao: 'comfort', cor: 'cinza-centaurus', quantidade: 0, quando });
    expect(situacaoDe(acabou.estoque.comfort['cinza-centaurus'])).toBe('sob-encomenda');
    expect(acabou.historico[0]!.texto).toBe('Comfort Cinza Centaurus: acabou na loja (sob encomenda).');
  });

  it('previsão de chegada só para quem não tem carro na loja', () => {
    const inicial = estadoInicial();
    expect(reduzir(inicial, { tipo: 'estoque/chegada', versao: 'comfort', cor: 'branco-arctic', dias: 10 })).toBe(inicial);
    const aCaminho = reduzir(inicial, { tipo: 'estoque/chegada', versao: 'prestige', cor: 'preto-andromeda', dias: 7, quando });
    expect(situacaoDe(aCaminho.estoque.prestige['preto-andromeda'])).toBe('a-caminho');
    expect(aCaminho.historico[0]!.texto).toBe('Prestige Preto Andromeda: a caminho, chega em 7 dias.');
  });

  it('recusa quantidade, prazo e preço fora da faixa sem mudar nada', () => {
    const inicial = estadoInicial();
    expect(reduzir(inicial, { tipo: 'estoque/quantidade', versao: 'comfort', cor: 'azul-gaia', quantidade: -1 })).toBe(inicial);
    expect(reduzir(inicial, { tipo: 'estoque/quantidade', versao: 'comfort', cor: 'azul-gaia', quantidade: 1.5 })).toBe(inicial);
    expect(reduzir(inicial, { tipo: 'estoque/chegada', versao: 'prestige', cor: 'preto-andromeda', dias: 0 })).toBe(inicial);
    expect(reduzir(inicial, { tipo: 'preco', versao: 'prestige', centavos: 1_000 })).toBe(inicial);
  });

  it('muda o preço da loja e anota a diferença', () => {
    const estado = reduzir(estadoInicial(), { tipo: 'preco', versao: 'prestige', centavos: 175_990_00, quando });
    expect(estado.precos.prestige).toBe(175_990_00);
    expect(estado.historico[0]!.texto).toMatch(/^Prestige: preço da loja de R\$\s179\.990 para R\$\s175\.990\.$/);
  });

  it('liga, troca e tira a campanha do ar; campanha no ar não pode ser vazia', () => {
    const inicial = estadoInicial();
    const fora = reduzir(inicial, { tipo: 'campanha', ativa: false, quando });
    expect(fora.campanha.ativa).toBe(false);
    expect(reduzir(inicial, { tipo: 'campanha', ativa: true, texto: '   ' })).toBe(inicial);
    const nova = reduzir(fora, { tipo: 'campanha', ativa: true, texto: '  Test drive  no sábado ', quando });
    expect(nova.campanha).toEqual({ ativa: true, texto: 'Test drive no sábado' });
  });

  it('guarda o pedido de test drive sem dado pessoal, confirma e remove', () => {
    const pedido = reduzir(estadoInicial(), { tipo: 'test-drive/pedir', versao: 'prestige', cor: 'azul-gaia', dia: '2026-10-10', periodo: 'manha', quando });
    expect(pedido.testDrives).toEqual([{ id: 't1', versao: 'prestige', cor: 'azul-gaia', dia: '2026-10-10', periodo: 'manha', atendido: false }]);
    expect(pedido.historico[0]!.texto).toBe('Pedido de test drive: Prestige Azul Gaia, 10/10 de manhã.');
    const confirmado = reduzir(pedido, { tipo: 'test-drive/atender', id: 't1', quando });
    expect(confirmado.testDrives[0]!.atendido).toBe(true);
    expect(reduzir(confirmado, { tipo: 'test-drive/atender', id: 't1' })).toBe(confirmado);
    expect(reduzir(confirmado, { tipo: 'test-drive/remover', id: 't1', quando }).testDrives).toEqual([]);
  });

  it('não passa do limite de pedidos guardados', () => {
    let estado: EstadoCarrelio = estadoInicial();
    for (let i = 0; i < PEDIDOS_MAXIMOS + 3; i += 1) {
      estado = reduzir(estado, { tipo: 'test-drive/pedir', versao: 'comfort', cor: 'branco-arctic', dia: '2026-10-10', periodo: 'tarde', quando });
    }
    expect(estado.testDrives).toHaveLength(PEDIDOS_MAXIMOS);
  });

  it('restaura o estado-base e deixa a linha no histórico', () => {
    const mudado = reduzir(estadoInicial(), { tipo: 'preco', versao: 'comfort', centavos: 150_000_00, quando });
    const restaurado = reduzir(mudado, { tipo: 'demo/restaurar', quando });
    expect(restaurado.precos).toEqual(estadoInicial().precos);
    expect(restaurado.historico).toHaveLength(1);
    expect(restaurado.historico[0]!.texto).toBe('Demonstração restaurada.');
  });
});

describe('os dias do test drive', () => {
  it('aceita de hoje até 30 dias à frente', () => {
    expect(validarTestDrive('2026-10-07', '2026-10-07')).toBeNull();
    expect(validarTestDrive('2026-10-06', '2026-10-07')).toBe('Esse dia já passou.');
    expect(validarTestDrive(somarDias('2026-10-07', 31), '2026-10-07')).toMatch(/próximos 30 dias/);
    expect(validarTestDrive('2026-02-30', '2026-01-07')).toBe('Escolha um dia.');
  });

  it('usa o dia do relógio local, não o de UTC', () => {
    expect(diaLocal(new Date(2026, 9, 7, 23, 30))).toBe('2026-10-07');
  });
});
