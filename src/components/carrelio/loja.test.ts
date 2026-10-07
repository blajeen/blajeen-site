import { afterEach, describe, expect, it, vi } from 'vitest';
import { estadoInicial } from '@/lib/carrelio/estado';
import { CHAVE_DO_ARMAZENAMENTO, serializar } from '@/lib/carrelio/persistencia';
import { criarLoja } from './loja';

function memoria(): Storage {
  const dados = new Map<string, string>();
  return {
    get length() {
      return dados.size;
    },
    clear: () => dados.clear(),
    getItem: (chave) => dados.get(chave) ?? null,
    key: (i) => [...dados.keys()][i] ?? null,
    removeItem: (chave) => void dados.delete(chave),
    setItem: (chave, valor) => void dados.set(chave, valor),
  };
}

describe('a loja da demonstração', () => {
  afterEach(() => vi.useRealTimers());

  it('despacha, grava depois de um instante e desfaz', () => {
    vi.useFakeTimers();
    const armazenamento = memoria();
    const loja = criarLoja({ armazenamento: () => armazenamento });
    loja.despachar({ tipo: 'estoque/quantidade', versao: 'comfort', cor: 'azul-gaia', quantidade: 5 });
    expect(loja.obter().estado.estoque.comfort['azul-gaia'].quantidade).toBe(5);
    expect(loja.obter().podeDesfazer).toBe(true);
    expect(armazenamento.getItem(CHAVE_DO_ARMAZENAMENTO)).toBeNull();
    vi.advanceTimersByTime(200);
    expect(armazenamento.getItem(CHAVE_DO_ARMAZENAMENTO)).toContain('"quantidade":5');
    loja.desfazer();
    expect(loja.obter().estado.estoque.comfort['azul-gaia'].quantidade).toBe(1);
    expect(loja.obter().podeDesfazer).toBe(false);
  });

  it('ação que não muda nada não entra no desfazer', () => {
    const loja = criarLoja({ armazenamento: () => memoria() });
    loja.despachar({ tipo: 'estoque/quantidade', versao: 'comfort', cor: 'azul-gaia', quantidade: 1 });
    expect(loja.obter().podeDesfazer).toBe(false);
  });

  it('segue outra aba pelo evento storage', () => {
    const ouvintes: ((e: StorageEvent) => void)[] = [];
    const janela = {
      addEventListener: (_: string, f: EventListener) => void ouvintes.push(f as (e: StorageEvent) => void),
      removeEventListener: () => {},
    };
    const loja = criarLoja({ armazenamento: () => memoria(), janela });
    const avisos = vi.fn();
    loja.assinar(avisos);
    const outra = { ...estadoInicial(), precos: { comfort: 150_000_00, prestige: 170_000_00 } };
    ouvintes.forEach((f) => f({ key: CHAVE_DO_ARMAZENAMENTO, newValue: serializar(outra, '2026-10-07T00:00:00Z') } as StorageEvent));
    expect(loja.obter().estado.precos.comfort).toBe(150_000_00);
    expect(avisos).toHaveBeenCalled();
  });

  it('sem armazenamento, funciona em memória e avisa que não guarda', () => {
    vi.useFakeTimers();
    const loja = criarLoja({ armazenamento: () => null });
    loja.despachar({ tipo: 'campanha', ativa: false });
    vi.advanceTimersByTime(200);
    expect(loja.obter().estado.campanha.ativa).toBe(false);
    expect(loja.obter().persistente).toBe(false);
  });
});
