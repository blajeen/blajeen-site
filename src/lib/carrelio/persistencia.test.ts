import { describe, expect, it } from 'vitest';
import { estadoInicial, reduzir } from './estado';
import { consultaDoComando, hrefDoComando, lerLink } from './link';
import { lerRegistro, serializar } from './persistencia';

const quando = '2026-10-07T15:00:00.000Z';

describe('a persistência da demonstração', () => {
  it('lê de volta o que gravou', () => {
    let estado = reduzir(estadoInicial(), { tipo: 'estoque/quantidade', versao: 'prestige', cor: 'azul-gaia', quantidade: 4, quando });
    estado = reduzir(estado, { tipo: 'test-drive/pedir', versao: 'comfort', cor: 'preto-andromeda', dia: '2026-10-12', periodo: 'tarde', quando });
    expect(lerRegistro(serializar(estado, quando))).toEqual(estado);
  });

  it('descarta registro de outra versão, de outro carro ou com número fora da faixa', () => {
    const bruto = JSON.parse(serializar(estadoInicial(), quando));
    expect(lerRegistro(JSON.stringify({ ...bruto, v: 2 }))).toBeNull();
    expect(lerRegistro(JSON.stringify({ ...bruto, carro: 'outro' }))).toBeNull();
    const quebrado = structuredClone(bruto);
    quebrado.estado.estoque.comfort['azul-gaia'].quantidade = 500;
    expect(lerRegistro(JSON.stringify(quebrado))).toBeNull();
    const contraditorio = structuredClone(bruto);
    contraditorio.estado.estoque.comfort['branco-arctic'].chegaEmDias = 5;
    expect(lerRegistro(JSON.stringify(contraditorio))).toBeNull();
    const pedidoComNome = structuredClone(bruto);
    pedidoComNome.estado.testDrives = [{ id: 't1', versao: 'comfort', cor: 'x', dia: '2026-10-12', periodo: 'tarde', atendido: false }];
    expect(lerRegistro(JSON.stringify(pedidoComNome))).toBeNull();
    expect(lerRegistro('{')).toBeNull();
    expect(lerRegistro(null)).toBeNull();
  });
});

describe('o link da demonstração', () => {
  it('lê só o que é válido', () => {
    expect(lerLink('?versao=prestige&cor=azul-gaia&vista=dentro&ambiente=noite&farois=1&portas=abertas&aba=painel')).toEqual({
      aba: 'painel',
      versao: 'prestige',
      cor: 'azul-gaia',
      vista: 'dentro',
      portas: true,
      farois: true,
      ambiente: 'noite',
    });
    expect(lerLink('?versao=sport&cor=rosa&vista=lado&ponto=teto')).toEqual({});
    expect(lerLink('?ponto=bancoTraseiro')).toEqual({ ponto: 'bancoTraseiro', vista: 'dentro' });
    expect(lerLink('?garagem=sim')).toEqual({ garagem: true });
  });

  it('escreve a consulta na ordem de leitura e sem o que já é padrão', () => {
    expect(consultaDoComando({ versao: 'comfort', cor: 'branco-arctic', vista: 'fora', ambiente: 'estudio', aba: 'cliente' })).toBe(
      '?versao=comfort&cor=branco-arctic',
    );
    expect(consultaDoComando({ vista: 'dentro', ponto: 'portaMalas' })).toBe('?vista=dentro&ponto=portaMalas');
    expect(consultaDoComando({})).toBe('');
    expect(hrefDoComando({ ambiente: 'noite', farois: true })).toBe('/produtos/carrelio?farois=1&ambiente=noite#demonstracao');
  });

  it('ida e volta: o que a página escreve, a página lê', () => {
    const comando = { versao: 'prestige', cor: 'cinza-centaurus', vista: 'dentro', ponto: 'bancoTraseiro', ambiente: 'noite' } as const;
    expect(lerLink(consultaDoComando(comando))).toEqual(comando);
  });
});
