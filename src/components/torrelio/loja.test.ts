import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CHAVE_DO_ARMAZENAMENTO, serializar } from '@/lib/torrelio/persistencia';
import { estadoInicial, reduzir } from '@/lib/torrelio/estado';
import { criarLoja } from './loja';

function armazenamentoFalso() {
  const dados = new Map<string, string>();
  return {
    dados,
    getItem: (k: string) => dados.get(k) ?? null,
    setItem: (k: string, v: string) => void dados.set(k, v),
    removeItem: (k: string) => void dados.delete(k),
    clear: () => dados.clear(),
    key: () => null,
    get length() {
      return dados.size;
    },
  } as unknown as Storage & { dados: Map<string, string> };
}

function janelaFalsa() {
  const ouvintes = new Set<EventListener>();
  return {
    addEventListener: (_: string, f: EventListener) => void ouvintes.add(f),
    removeEventListener: (_: string, f: EventListener) => void ouvintes.delete(f),
    emitir: (evento: Partial<StorageEvent>) => ouvintes.forEach((f) => f(evento as Event)),
  };
}

const agora = () => new Date('2026-10-06T15:00:00.000Z');

describe('a loja da demonstração', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('grava com espera, relê ao remontar e desfaz em memória', () => {
    const armazenamento = armazenamentoFalso();
    const loja = criarLoja({ armazenamento: () => armazenamento, agora });
    loja.despachar({ tipo: 'unidade/status', ids: ['1803'], status: 'vendida' });
    expect(loja.obter().podeDesfazer).toBe(true);
    expect(armazenamento.dados.size).toBe(0);
    vi.advanceTimersByTime(200);
    expect(armazenamento.dados.has(CHAVE_DO_ARMAZENAMENTO)).toBe(true);

    const outra = criarLoja({ armazenamento: () => armazenamento, agora });
    expect(outra.obter().estado.unidades['1803']!.status).toBe('vendida');
    expect(outra.obter().podeDesfazer).toBe(false);

    loja.desfazer();
    expect(loja.obter().estado.unidades['1803']!.status).toBe('disponivel');
    expect(loja.obter().podeDesfazer).toBe(false);
  });

  it('cai para a memória quando o armazenamento falha, e avisa', () => {
    const quebrado = {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
    } as unknown as Storage;
    const loja = criarLoja({ armazenamento: () => quebrado, agora });
    expect(loja.obter().persistente).toBe(false);
    loja.despachar({ tipo: 'unidade/status', ids: ['1803'], status: 'vendida' });
    vi.advanceTimersByTime(200);
    expect(loja.obter().estado.unidades['1803']!.status).toBe('vendida');
  });

  it('segue a outra aba do navegador e zera o desfazer', () => {
    const armazenamento = armazenamentoFalso();
    const janela = janelaFalsa();
    const loja = criarLoja({ armazenamento: () => armazenamento, janela, agora });
    const ouvinte = vi.fn();
    loja.assinar(ouvinte);
    loja.despachar({ tipo: 'unidade/preco', id: '201', precoCentavos: 70_000_000 });
    const daOutraAba = reduzir(estadoInicial(), { tipo: 'unidade/status', ids: ['1902'], status: 'vendida', quando: agora().toISOString() });
    janela.emitir({ key: CHAVE_DO_ARMAZENAMENTO, newValue: serializar(daOutraAba, agora().toISOString()) });
    expect(loja.obter().estado.unidades['1902']!.status).toBe('vendida');
    expect(loja.obter().podeDesfazer).toBe(false);
    expect(ouvinte).toHaveBeenCalledTimes(2);
  });

  it('restaura com uma linha só no histórico e sem desfazer', () => {
    const loja = criarLoja({ armazenamento: () => armazenamentoFalso(), agora });
    loja.despachar({ tipo: 'unidade/status', ids: ['1803'], status: 'vendida' });
    loja.restaurar();
    expect(loja.obter().estado.historico.map((h) => h.texto)).toEqual(['Demonstração restaurada']);
    expect(loja.obter().podeDesfazer).toBe(false);
  });
});
