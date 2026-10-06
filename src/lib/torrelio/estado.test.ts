import { describe, expect, it } from 'vitest';
import { estadoInicial, reduzir, type AcaoTorrelio, type EstadoTorrelio } from './estado';
import { adicionarDias, quartoLivre, reservasIniciais } from './hotel';
import { QUARTOS } from './predio';
import { proximaDisponivel, resumoComercial } from './seletores';

const QUANDO = '2026-10-06T15:00:00.000Z';
const HOJE = '2026-10-06';

function congelar<T>(valor: T): T {
  if (valor && typeof valor === 'object' && !Object.isFrozen(valor)) {
    Object.freeze(valor);
    for (const filho of Object.values(valor)) congelar(filho);
  }
  return valor;
}

const aplicar = (estado: EstadoTorrelio, ...acoes: AcaoTorrelio[]) => acoes.reduce((e, a) => reduzir(e, { ...a, quando: QUANDO }), estado);

describe('o reducer da demonstração', () => {
  it('marca uma venda, muda o percentual e escreve no histórico, sem mexer no estado anterior', () => {
    const inicial = congelar(estadoInicial());
    const depois = aplicar(inicial, { tipo: 'unidade/status', ids: ['1803'], status: 'vendida' });
    expect(depois.unidades['1803']!.status).toBe('vendida');
    expect(inicial.unidades['1803']!.status).toBe('disponivel');
    expect(resumoComercial(depois).porStatus.vendida).toBe(42);
    expect(depois.historico[0]).toMatchObject({ texto: 'Unidade 1803 marcada como vendida', tipo: 'status', quando: QUANDO });
  });

  it('marca um andar inteiro de uma vez', () => {
    const depois = aplicar(estadoInicial(), { tipo: 'unidade/status', ids: ['1801', '1802', '1803', '1804'], status: 'reservada' });
    expect(depois.historico[0]!.texto).toBe('4 unidades do 18º marcadas como reservadas');
  });

  it('ignora ação inválida e devolve o mesmo estado', () => {
    const inicial = estadoInicial();
    const invalidas: AcaoTorrelio[] = [
      { tipo: 'unidade/status', ids: ['9999'], status: 'vendida' },
      { tipo: 'unidade/status', ids: ['1803'], status: 'disponivel' },
      { tipo: 'unidade/preco', id: '1803', precoCentavos: -5 },
      { tipo: 'tabela/reajustar', pontosBase: 5000, escopo: 'todas' },
      { tipo: 'obra/definir', obra: { fachadaAte: 15 } },
      { tipo: 'hotel/reservar', quarto: '1806', entrada: HOJE, saida: adicionarDias(HOJE, 2), hospedes: 2, origem: 'cliente' },
    ];
    for (const acao of invalidas) expect(aplicar(inicial, acao)).toBe(inicial);
  });

  it('reajusta só o escopo pedido e abre a tabela seguinte', () => {
    const inicial = estadoInicial();
    const depois = aplicar(inicial, { tipo: 'tabela/reajustar', pontosBase: 350, escopo: 'disponiveis' });
    expect(depois.tabelas.at(-1)).toMatchObject({ numero: 2, pontosBase: 350, afetadas: 27 });
    expect(depois.unidades['1803']!.precoCentavos).toBe(81_311_643);
    expect(depois.unidades['201']!.precoCentavos).toBe(inicial.unidades['201']!.precoCentavos);
    expect(depois.historico[0]!.texto).toBe('Tabela 2: reajuste de 3,5% em 27 disponíveis');
  });

  it('sobe a obra e recusa vidro acima da estrutura', () => {
    const depois = aplicar(estadoInicial(), { tipo: 'obra/definir', obra: { estruturaAte: 15, fachadaAte: 8 } });
    expect(depois.obra).toMatchObject({ estruturaAte: 15, fachadaAte: 8 });
    expect(depois.historico[0]!.texto).toBe('Obra: estrutura até o 15º, fachada até o 8º');
  });

  it('abre o hotel, reserva um quarto livre e o quarto deixa de estar livre', () => {
    const comHotel = aplicar(estadoInicial(), { tipo: 'hotel/iniciar', hoje: HOJE });
    const entrada = adicionarDias(HOJE, 14);
    const saida = adicionarDias(HOJE, 17);
    const quarto = QUARTOS.find((q) => q.capacidade >= 2 && quartoLivre(comHotel.hotel!, q.id, entrada, saida))!.id;
    const depois = aplicar(comHotel, { tipo: 'hotel/reservar', quarto, entrada, saida, hospedes: 2, origem: 'cliente' });
    expect(depois.hotel!.reservas).toHaveLength(1);
    expect(quartoLivre(depois.hotel!, quarto, entrada, saida)).toBe(false);
    expect(depois.historico[0]!.texto).toMatch(new RegExp(`^Quarto ${quarto} reservado de \\d\\d/\\d\\d a \\d\\d/\\d\\d \\(pelo cliente\\)$`));
    // Cancelar uma reserva inicial guarda só o id.
    const inicial = reservasIniciais(HOJE)[0]!;
    const cancelado = aplicar(depois, { tipo: 'hotel/cancelar', reservaId: inicial.id });
    expect(cancelado.hotel!.canceladas).toEqual([inicial.id]);
  });

  it('restaura com uma única linha no histórico', () => {
    const mexido = aplicar(estadoInicial(), { tipo: 'unidade/status', ids: ['1803'], status: 'vendida' }, { tipo: 'unidade/preco', id: '201', precoCentavos: 70_000_000 });
    const restaurado = aplicar(mexido, { tipo: 'demo/restaurar' });
    expect(restaurado.unidades).toEqual(estadoInicial().unidades);
    expect(restaurado.historico.map((h) => h.texto)).toEqual(['Demonstração restaurada']);
  });

  it('acha a próxima disponível nos dois sentidos', () => {
    const estado = estadoInicial();
    expect(proximaDisponivel(estado, '1803', 1)).toBe('1901');
    expect(proximaDisponivel(estado, '1803', -1)).toBe('1802');
  });
});
