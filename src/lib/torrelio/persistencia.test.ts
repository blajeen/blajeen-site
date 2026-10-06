import { describe, expect, it } from 'vitest';
import { estadoInicial, reduzir } from './estado';
import { adicionarDias, ehDia, ocupacaoDoDia, valorDaEstadia } from './hotel';
import { lerLink, hrefDoComando } from './link';
import { lerRegistro, serializar } from './persistencia';
import { luzesDaTorre } from './seletores';
import { LUZ } from './luz';

const QUANDO = '2026-10-06T15:00:00.000Z';

describe('a persistência no navegador', () => {
  it('faz a ida e a volta de um estado mexido, com hotel', () => {
    let estado = estadoInicial();
    estado = reduzir(estado, { tipo: 'unidade/status', ids: ['1803'], status: 'vendida', quando: QUANDO });
    estado = reduzir(estado, { tipo: 'tabela/reajustar', pontosBase: 200, escopo: 'todas', quando: QUANDO });
    estado = reduzir(estado, { tipo: 'hotel/iniciar', hoje: '2026-10-06', quando: QUANDO });
    estado = reduzir(estado, { tipo: 'hotel/bloquear', quarto: '2001', de: '2026-11-01', ate: '2026-11-03', quando: QUANDO });
    expect(lerRegistro(serializar(estado, QUANDO))).toEqual(estado);
  });

  it('descarta o que não confere: JSON quebrado, outra versão, outra base, id ou número estranho', () => {
    const valido = JSON.parse(serializar(estadoInicial(), QUANDO));
    expect(lerRegistro('{')).toBeNull();
    expect(lerRegistro(null)).toBeNull();
    expect(lerRegistro(JSON.stringify({ ...valido, v: 2 }))).toBeNull();
    expect(lerRegistro(JSON.stringify({ ...valido, base: 'outro' }))).toBeNull();
    const comIdEstranho = structuredClone(valido);
    comIdEstranho.estado.unidades['9999'] = { status: 'vendida', precoCentavos: 70_000_000 };
    expect(lerRegistro(JSON.stringify(comIdEstranho))).toBeNull();
    const comPrecoNegativo = structuredClone(valido);
    comPrecoNegativo.estado.unidades['1803'].precoCentavos = -1;
    expect(lerRegistro(JSON.stringify(comPrecoNegativo))).toBeNull();
    const comCondicaoErrada = structuredClone(valido);
    comCondicaoErrada.estado.condicao.grupos[3].pontosBase = 1;
    expect(lerRegistro(JSON.stringify(comCondicaoErrada))).toBeNull();
  });
});

describe('o link profundo', () => {
  it('lê só o que for válido', () => {
    expect(lerLink('?unidade=1803&vista=sul&hora=17.5')).toEqual({ unidade: '1803', vista: 'sul', hora: 17.5 });
    expect(lerLink('?unidade=9999&vista=cima&hora=40&modo=nave')).toEqual({});
    expect(lerLink('?quarto=1806&vista=1')).toEqual({ quarto: '1806', modo: 'hotel', vista: true });
    expect(lerLink('?holograma=vitrine')).toEqual({ holograma: 'vitrine' });
    expect(lerLink('?holograma=1')).toEqual({ holograma: 'piramide' });
    expect(lerLink('?holograma=disco')).toEqual({});
  });

  it('monta o endereço que funciona sem JavaScript', () => {
    expect(hrefDoComando({ unidade: '1803', vista: 'sul' })).toBe('/produtos/torrelio?unidade=1803&vista=sul#demonstracao');
    expect(hrefDoComando({ foco: 'apartamento', unidade: '1803' })).toBe('/produtos/torrelio?unidade=1803#apartamento');
    expect(hrefDoComando({})).toBe('/produtos/torrelio#demonstracao');
    expect(hrefDoComando({ holograma: 'piramide' })).toBe('/produtos/torrelio?holograma=piramide#demonstracao');
  });
});

describe('o hotel', () => {
  const comHotel = reduzir(estadoInicial(), { tipo: 'hotel/iniciar', hoje: '2026-10-06', quando: QUANDO });
  const hotel = comHotel.hotel!;

  it('confere datas e cobra o fim de semana', () => {
    expect(ehDia('2026-02-30')).toBe(false);
    expect(ehDia('2026-10-06')).toBe(true);
    // Quinta 08/10 a domingo 11/10: quinta normal, sexta e sábado de fim de semana.
    const estadia = valorDaEstadia(hotel, 'vista-mar', '2026-10-08', '2026-10-11');
    expect(estadia).toMatchObject({ noites: 3, noitesDeFimDeSemana: 2, diaria: 52_000, diariaFimDeSemana: 59_800 });
    expect(estadia.total).toBe(52_000 + 2 * 59_800);
  });

  it('enche mais no fim de semana e acende a fachada pela ocupação da noite', () => {
    const sexta = ocupacaoDoDia(hotel, '2026-10-09');
    const terca = ocupacaoDoDia(hotel, '2026-10-13');
    expect(sexta.percentual).toBeGreaterThan(terca.percentual);
    for (let d = 0; d < 28; d += 1) {
      const { percentual } = ocupacaoDoDia(hotel, adicionarDias('2026-10-06', d));
      expect(percentual).toBeGreaterThan(30);
      expect(percentual).toBeLessThan(90);
    }
    const luzes = luzesDaTorre(comHotel, 'hotel', '2026-10-09');
    expect(luzes).toHaveLength(146);
    expect(luzes.filter((l) => l === LUZ.acesa).length).toBe(sexta.ocupados);
  });
});
