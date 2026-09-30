import { MODELOS } from '@/content/contratos/modelos.generated';
import { SERVICOS_IDS, type ServicoId } from '@/content/contratos/tipos';
import type { Contrato } from '@/lib/contracts/types';
import { lerValor } from '@/lib/contracts/valores';
import type { Pedido } from '@/lib/pedidos/types';

/**
 * Números do painel. Funções puras sobre as listas de pedidos e contratos.
 * Recebimentos seguem a política do estúdio: 50% de entrada e 50% de saldo final.
 */

export function valorDoContrato(contrato: Pick<Contrato, 'termos'>): number {
  return lerValor(contrato.termos.valor_total ?? '') ?? 0;
}

function mesDe(dataIso: string | null): string | null {
  return dataIso ? dataIso.slice(0, 7) : null;
}

export function ultimosMeses(quantidade: number, hoje = new Date()): string[] {
  const meses: string[] = [];
  for (let i = quantidade - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - i, 1));
    meses.push(d.toISOString().slice(0, 7));
  }
  return meses;
}

export function rotuloMes(mes: string): string {
  const [ano, m] = mes.split('-').map(Number);
  return new Date(Date.UTC(ano!, m! - 1, 15)).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }).replace('.', '');
}

export type LinhaMensal = { mes: string; pedidos: number; contratos: number; assinados: number; vendido: number; recebido: number };

export function resumoMensal(pedidos: Pedido[], contratos: Contrato[], meses: string[]): LinhaMensal[] {
  return meses.map((mes) => {
    const validos = contratos.filter((c) => c.status !== 'CANCELADO');
    const assinados = validos.filter((c) => mesDe(c.assinadoEm) === mes);
    const recebido = validos.reduce((total, c) => {
      const metade = valorDoContrato(c) / 2;
      return total + (mesDe(c.entradaRecebidaEm) === mes ? metade : 0) + (mesDe(c.saldoRecebidoEm) === mes ? metade : 0);
    }, 0);
    return {
      mes,
      pedidos: pedidos.filter((p) => mesDe(p.criadoEm) === mes).length,
      contratos: validos.filter((c) => mesDe(c.criadoEm) === mes).length,
      assinados: assinados.length,
      vendido: assinados.reduce((total, c) => total + valorDoContrato(c), 0),
      recebido,
    };
  });
}

export type Indicadores = {
  pedidosNovos: number;
  pedidosTotal: number;
  contratosAguardando: number;
  contratosPreenchidos: number;
  contratosAssinados: number;
  vendidoAno: number;
  recebidoAno: number;
  aReceber: number;
  ticketMedio: number;
  conversao: number;
};

export function indicadores(pedidos: Pedido[], contratos: Contrato[], hoje = new Date()): Indicadores {
  const ano = String(hoje.getFullYear());
  const validos = contratos.filter((c) => c.status !== 'CANCELADO');
  const assinados = validos.filter((c) => c.status === 'ASSINADO');
  const assinadosAno = assinados.filter((c) => c.assinadoEm?.startsWith(ano));
  const vendidoAno = assinadosAno.reduce((t, c) => t + valorDoContrato(c), 0);
  const recebidoAno = validos.reduce((t, c) => {
    const metade = valorDoContrato(c) / 2;
    return t + (c.entradaRecebidaEm?.startsWith(ano) ? metade : 0) + (c.saldoRecebidoEm?.startsWith(ano) ? metade : 0);
  }, 0);
  const aReceber = assinados.reduce((t, c) => {
    const metade = valorDoContrato(c) / 2;
    return t + (c.entradaRecebidaEm ? 0 : metade) + (c.saldoRecebidoEm ? 0 : metade);
  }, 0);
  const pedidosFechados = pedidos.filter((p) => p.status === 'FECHADO').length;
  return {
    pedidosNovos: pedidos.filter((p) => p.status === 'NOVO').length,
    pedidosTotal: pedidos.length,
    contratosAguardando: validos.filter((c) => c.status === 'AGUARDANDO_CLIENTE').length,
    contratosPreenchidos: validos.filter((c) => c.status === 'PREENCHIDO').length,
    contratosAssinados: assinados.length,
    vendidoAno,
    recebidoAno,
    aReceber,
    ticketMedio: assinadosAno.length ? vendidoAno / assinadosAno.length : 0,
    conversao: pedidos.length ? pedidosFechados / pedidos.length : 0,
  };
}

export type LinhaServico = { servico: ServicoId; nome: string; contratos: number; assinados: number; vendido: number };

export function porServico(contratos: Contrato[]): LinhaServico[] {
  return SERVICOS_IDS.map((servico) => {
    const doServico = contratos.filter((c) => c.servico === servico && c.status !== 'CANCELADO');
    const assinados = doServico.filter((c) => c.status === 'ASSINADO');
    return {
      servico, nome: MODELOS[servico].tituloCurto, contratos: doServico.length, assinados: assinados.length,
      vendido: assinados.reduce((t, c) => t + valorDoContrato(c), 0),
    };
  });
}

export type Pendencia = { tipo: 'pedido' | 'contrato'; id: string; titulo: string; detalhe: string; acao: string; href: string };

/** O que precisa da atenção do titular agora, em ordem de urgência. */
export function pendencias(pedidos: Pedido[], contratos: Contrato[], hoje = new Date()): Pendencia[] {
  const dias = (iso: string) => Math.floor((hoje.getTime() - new Date(iso).getTime()) / 86_400_000);
  const quando = (iso: string) => {
    const d = dias(iso);
    return d <= 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} dias`;
  };
  const lista: Pendencia[] = [];
  for (const p of pedidos.filter((x) => x.status === 'NOVO')) {
    lista.push({ tipo: 'pedido', id: p.id, titulo: `Responder ${p.nome}`, detalhe: `${p.tipo} · recebido ${quando(p.criadoEm)}`, acao: 'Responder', href: `/admin/pedidos?id=${p.id}` });
  }
  for (const c of contratos.filter((x) => x.status === 'PREENCHIDO')) {
    lista.push({ tipo: 'contrato', id: c.id, titulo: `Enviar ${c.numero} para assinatura`, detalhe: `${c.cliente.contratante_nome ?? 'Cliente'} preencheu os dados`, acao: 'Abrir contrato', href: `/admin/contratos?id=${c.id}` });
  }
  for (const c of contratos.filter((x) => x.status === 'AGUARDANDO_CLIENTE' && dias(x.criadoEm) >= 3)) {
    lista.push({ tipo: 'contrato', id: c.id, titulo: `Lembrar o cliente de ${c.numero}`, detalhe: `Link enviado há ${dias(c.criadoEm)} dias e ainda sem preenchimento`, acao: 'Ver link', href: `/admin/contratos?id=${c.id}` });
  }
  for (const c of contratos.filter((x) => x.status === 'ASSINADO' && !x.entradaRecebidaEm)) {
    lista.push({ tipo: 'contrato', id: c.id, titulo: `Cobrar entrada de ${c.numero}`, detalhe: `50% adiantado · ${c.termos.valor_total ? `R$ ${c.termos.valor_total} no total` : 'valor não informado'}`, acao: 'Registrar pagamento', href: `/admin/contratos?id=${c.id}` });
  }
  return lista;
}

function celulaCsv(valor: string | number): string {
  const texto = String(valor);
  return /[";\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** CSV separado por ponto e vírgula, que o Excel em português abre direto. */
export function contratosCsv(contratos: Contrato[]): string {
  const cabecalho = ['Número', 'Serviço', 'Situação', 'Cliente', 'Projeto', 'Valor total', 'Criado em', 'Assinado em', 'Entrada recebida em', 'Saldo recebido em'];
  const linhas = contratos.map((c) => [
    c.numero, MODELOS[c.servico].tituloCurto, c.status, c.cliente.contratante_nome ?? '', c.termos.projeto_nome ?? '',
    valorDoContrato(c).toLocaleString('pt-BR', { minimumFractionDigits: 2 }), c.criadoEm.slice(0, 10), c.assinadoEm?.slice(0, 10) ?? '',
    c.entradaRecebidaEm?.slice(0, 10) ?? '', c.saldoRecebidoEm?.slice(0, 10) ?? '',
  ]);
  return `﻿${[cabecalho, ...linhas].map((linha) => linha.map(celulaCsv).join(';')).join('\n')}\n`;
}
