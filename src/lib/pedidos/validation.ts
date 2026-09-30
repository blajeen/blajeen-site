import { isValidPhone } from '@/lib/onboarding/validation';
import { PEDIDO_STATUS, TIPOS_DE_PROJETO, type PedidoStatus } from './types';

export type NovoPedido = { nome: string; email: string; telefone: string; tipo: string; ideia: string };

function texto(valor: unknown, maximo: number): string {
  return typeof valor === 'string' ? valor.replace(/\r\n/g, '\n').trim().slice(0, maximo) : '';
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Formulário público. O campo `site` é uma armadilha para robôs: pessoas não o veem nem preenchem. */
export function parseNovoPedido(corpo: unknown): { pedido: NovoPedido; robo: boolean } {
  const bruto = (corpo ?? {}) as Record<string, unknown>;
  const robo = texto(bruto.site, 200).length > 0;
  const tipo = texto(bruto.tipo, 60);
  const pedido: NovoPedido = {
    nome: texto(bruto.nome, 120),
    email: texto(bruto.email, 200).toLowerCase(),
    telefone: texto(bruto.telefone, 40),
    tipo: (TIPOS_DE_PROJETO as readonly string[]).includes(tipo) ? tipo : 'Ainda não sei',
    ideia: texto(bruto.ideia, 4000),
  };
  if (pedido.nome.length < 2) throw new Error('Informe seu nome.');
  if (!EMAIL.test(pedido.email)) throw new Error('Informe um e-mail válido.');
  if (!isValidPhone(pedido.telefone)) throw new Error('Informe um telefone com DDD.');
  if (pedido.ideia.length < 10) throw new Error('Conte um pouco mais sobre a sua ideia (pelo menos 10 caracteres).');
  return { pedido, robo };
}

export function parseAlteracaoPedido(corpo: unknown): { status?: PedidoStatus; notas?: string } {
  const bruto = (corpo ?? {}) as Record<string, unknown>;
  const saida: { status?: PedidoStatus; notas?: string } = {};
  if (typeof bruto.status === 'string') {
    if (!(PEDIDO_STATUS as string[]).includes(bruto.status)) throw new Error('Situação inválida.');
    saida.status = bruto.status as PedidoStatus;
  }
  if (typeof bruto.notas === 'string') saida.notas = texto(bruto.notas, 4000);
  return saida;
}
