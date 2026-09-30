import { randomUUID } from 'node:crypto';
import type { StatusEnvio } from '@/lib/admin/email';
import { arquivoLocal, bancoConfigurado, consultar, exigirBancoEmProducao, iso } from '@/lib/admin/banco';
import type { Pedido, PedidoStatus } from './types';
import type { NovoPedido } from './validation';

/** Pedidos do "Crie seu projeto". Neon em produção; `.data/pedidos.json` no desenvolvimento. */

const local = arquivoLocal<{ pedidos: Pedido[] }>('pedidos.json', () => ({ pedidos: [] }));

function daLinha(row: Record<string, unknown>): Pedido {
  return {
    id: String(row.id),
    nome: String(row.name),
    email: String(row.email),
    telefone: String(row.phone),
    tipo: String(row.kind),
    ideia: String(row.idea),
    status: row.status as PedidoStatus,
    notas: String(row.notes ?? ''),
    origem: String(row.source),
    emailStatus: row.email_status as StatusEnvio,
    criadoEm: iso(row.created_at),
    atualizadoEm: iso(row.updated_at),
  };
}

export async function criarPedido(entrada: NovoPedido): Promise<Pedido> {
  exigirBancoEmProducao();
  const agora = new Date().toISOString();
  const pedido: Pedido = {
    id: randomUUID(), ...entrada, status: 'NOVO', notas: '', origem: 'crie-seu-projeto', emailStatus: 'PENDING', criadoEm: agora, atualizadoEm: agora,
  };
  if (!bancoConfigurado()) return local.alterar((estado) => { estado.pedidos.push(pedido); return pedido; });
  const rows = await consultar<Record<string, unknown>>(
    `INSERT INTO admin_project_requests (id,name,email,phone,kind,idea) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [pedido.id, pedido.nome, pedido.email, pedido.telefone, pedido.tipo, pedido.ideia],
  );
  if (!rows[0]) throw new Error('Não foi possível registrar o pedido.');
  return daLinha(rows[0]);
}

export async function listarPedidos(): Promise<Pedido[]> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return (await local.ler()).pedidos.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  return (await consultar<Record<string, unknown>>('SELECT * FROM admin_project_requests ORDER BY created_at DESC LIMIT 1000')).map(daLinha);
}

export async function buscarPedido(id: string): Promise<Pedido | null> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return (await local.ler()).pedidos.find((item) => item.id === id) ?? null;
  const rows = await consultar<Record<string, unknown>>('SELECT * FROM admin_project_requests WHERE id=$1', [id]);
  return rows[0] ? daLinha(rows[0]) : null;
}

export async function atualizarPedido(id: string, alteracao: { status?: PedidoStatus; notas?: string; emailStatus?: StatusEnvio }): Promise<Pedido> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) {
    return local.alterar((estado) => {
      const indice = estado.pedidos.findIndex((item) => item.id === id);
      if (indice < 0) throw new Error('Pedido não encontrado.');
      const atualizado = { ...estado.pedidos[indice]!, ...alteracao, atualizadoEm: new Date().toISOString() };
      estado.pedidos[indice] = atualizado;
      return atualizado;
    });
  }
  const atual = await buscarPedido(id);
  if (!atual) throw new Error('Pedido não encontrado.');
  const final = { ...atual, ...alteracao };
  const rows = await consultar<Record<string, unknown>>(
    'UPDATE admin_project_requests SET status=$2, notes=$3, email_status=$4, updated_at=now() WHERE id=$1 RETURNING *',
    [id, final.status, final.notas, final.emailStatus],
  );
  if (!rows[0]) throw new Error('Pedido não encontrado.');
  return daLinha(rows[0]);
}

export async function excluirPedido(id: string): Promise<void> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) {
    await local.alterar((estado) => {
      const indice = estado.pedidos.findIndex((item) => item.id === id);
      if (indice < 0) throw new Error('Pedido não encontrado.');
      estado.pedidos.splice(indice, 1);
    });
    return;
  }
  const rows = await consultar<Record<string, unknown>>('DELETE FROM admin_project_requests WHERE id=$1 RETURNING id', [id]);
  if (!rows[0]) throw new Error('Pedido não encontrado.');
}
