import { describe, expect, it } from 'vitest';
import type { Contrato } from '@/lib/contracts/types';
import type { Pedido } from '@/lib/pedidos/types';
import { parseNovoPedido } from '@/lib/pedidos/validation';
import { baseDoSite } from '@/lib/contracts/service';
import { iso } from './banco';
import { contratosCsv, indicadores, pendencias, resumoMensal } from './relatorios';

const pedido = (parcial: Partial<Pedido>): Pedido => ({
  id: 'p1', nome: 'Ana', email: 'ana@exemplo.com', telefone: '34999999999', tipo: 'Site', ideia: 'Um site para a loja',
  status: 'NOVO', notas: '', origem: 'crie-seu-projeto', emailStatus: 'PENDING', criadoEm: '2026-09-10T10:00:00.000Z', atualizadoEm: '2026-09-10T10:00:00.000Z',
  ...parcial,
});

const contrato = (parcial: Partial<Contrato>): Contrato => ({
  id: 'c1', numero: 'BJL-SITE-2026-001', servico: 'site', status: 'ASSINADO', termos: { valor_total: '2.000,00' }, cliente: { contratante_nome: 'Ana' },
  tokenHash: 'h', tokenEncrypted: 'e', tokenExpiresAt: '2099-01-01T00:00:00.000Z', clienteEnviadoEm: '2026-09-11T10:00:00.000Z',
  assinadoEm: '2026-09-12T10:00:00.000Z', entradaRecebidaEm: '2026-09-12T10:00:00.000Z', saldoRecebidoEm: null, pedidoId: null,
  criadoEm: '2026-09-11T09:00:00.000Z', atualizadoEm: '2026-09-12T10:00:00.000Z',
  ...parcial,
});

describe('banco', () => {
  it('converte o timestamptz do Postgres em ISO que qualquer navegador entende', () => {
    expect(iso('2026-09-30 17:46:50.25+00')).toBe('2026-09-30T17:46:50.250Z');
    expect(iso('2026-09-30 14:00:00-03')).toBe('2026-09-30T17:00:00.000Z');
    expect(iso('2026-09-30T17:46:50.250Z')).toBe('2026-09-30T17:46:50.250Z');
  });
});

describe('links', () => {
  it('nunca gera link de cliente para localhost em produção', () => {
    expect(baseDoSite()).not.toContain('localhost');
    expect(baseDoSite()).toMatch(/^https:\/\//);
  });
});

describe('pedidos', () => {
  it('valida o formulário público e identifica robôs pelo campo escondido', () => {
    expect(parseNovoPedido({ nome: 'Ana', email: 'ana@exemplo.com', telefone: '(34) 99999-9999', tipo: 'Jogo', ideia: 'Um jogo para a escola' }).pedido.tipo).toBe('Jogo');
    expect(parseNovoPedido({ nome: 'Ana', email: 'ana@exemplo.com', telefone: '(34) 99999-9999', tipo: 'x', ideia: 'Um jogo para a escola' }).pedido.tipo).toBe('Ainda não sei');
    expect(parseNovoPedido({ nome: 'Ana', email: 'ana@exemplo.com', telefone: '(34) 99999-9999', ideia: 'Um jogo para a escola', site: 'spam' }).robo).toBe(true);
    expect(() => parseNovoPedido({ nome: 'Ana', email: 'nao-e-email', telefone: '(34) 99999-9999', ideia: 'Um jogo para a escola' })).toThrow();
  });
});

describe('relatórios', () => {
  const hoje = new Date('2026-09-30T12:00:00.000Z');

  it('soma vendido, recebido e a receber pela regra de 50% + 50%', () => {
    const n = indicadores([pedido({ status: 'FECHADO' }), pedido({ id: 'p2' })], [contrato({})], hoje);
    expect(n.vendidoAno).toBe(2000);
    expect(n.recebidoAno).toBe(1000);
    expect(n.aReceber).toBe(1000);
    expect(n.conversao).toBe(0.5);
    expect(n.pedidosNovos).toBe(1);
  });

  it('ignora contratos cancelados e agrupa por mês', () => {
    const linhas = resumoMensal([pedido({})], [contrato({}), contrato({ id: 'c2', status: 'CANCELADO' })], ['2026-08', '2026-09']);
    expect(linhas[1]).toMatchObject({ mes: '2026-09', pedidos: 1, contratos: 1, assinados: 1, vendido: 2000, recebido: 1000 });
    expect(linhas[0]).toMatchObject({ pedidos: 0, vendido: 0 });
  });

  it('lista o que precisa de atenção', () => {
    const lista = pendencias([pedido({})], [contrato({ status: 'PREENCHIDO', assinadoEm: null }), contrato({ id: 'c3', entradaRecebidaEm: null })], hoje);
    expect(lista.map((p) => p.titulo)).toEqual(expect.arrayContaining(['Responder Ana', 'Enviar BJL-SITE-2026-001 para assinatura', 'Cobrar entrada de BJL-SITE-2026-001']));
  });

  it('exporta CSV que o Excel em português abre', () => {
    const csv = contratosCsv([contrato({ termos: { valor_total: '2.000,00', projeto_nome: 'Site; loja' } })]);
    expect(csv.startsWith('﻿Número;')).toBe(true);
    expect(csv).toContain('"Site; loja"');
  });
});
