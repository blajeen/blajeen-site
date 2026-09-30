import { randomUUID } from 'node:crypto';
import { MODELOS } from '@/content/contratos/modelos.generated';
import type { ServicoId } from '@/content/contratos/tipos';
import { arquivoLocal, bancoConfigurado, consultar, exigirBancoEmProducao, iso, isoOuNulo } from '@/lib/admin/banco';
import type { AjustesCatalogo, CamposContrato, Contrato, ContratoStatus } from './types';

/** Contratos e ajustes do catálogo. Neon em produção; `.data/contratos.json` no desenvolvimento. */

type EstadoLocal = { contratos: Contrato[]; ajustes: AjustesCatalogo };
const local = arquivoLocal<EstadoLocal>('contratos.json', () => ({ contratos: [], ajustes: {} }));

function campos(valor: unknown): CamposContrato {
  const bruto = typeof valor === 'string' ? JSON.parse(valor) as unknown : valor;
  if (!bruto || typeof bruto !== 'object') return {};
  return Object.fromEntries(Object.entries(bruto as Record<string, unknown>).map(([k, v]) => [k, String(v ?? '')]));
}

function daLinha(row: Record<string, unknown>): Contrato {
  return {
    id: String(row.id),
    numero: String(row.number),
    servico: row.service as ServicoId,
    status: row.status as ContratoStatus,
    termos: campos(row.terms),
    cliente: campos(row.client),
    tokenHash: String(row.token_hash),
    tokenEncrypted: String(row.token_encrypted),
    tokenExpiresAt: iso(row.token_expires_at),
    clienteEnviadoEm: isoOuNulo(row.client_submitted_at),
    assinadoEm: isoOuNulo(row.signed_at),
    entradaRecebidaEm: isoOuNulo(row.deposit_received_at),
    saldoRecebidoEm: isoOuNulo(row.balance_received_at),
    pedidoId: row.request_id === null || row.request_id === undefined ? null : String(row.request_id),
    criadoEm: iso(row.created_at),
    atualizadoEm: iso(row.updated_at),
  };
}

export async function listarContratos(): Promise<Contrato[]> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return (await local.ler()).contratos.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  return (await consultar<Record<string, unknown>>('SELECT * FROM admin_contracts ORDER BY created_at DESC LIMIT 1000')).map(daLinha);
}

export async function buscarContrato(id: string): Promise<Contrato | null> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return (await local.ler()).contratos.find((item) => item.id === id) ?? null;
  const rows = await consultar<Record<string, unknown>>('SELECT * FROM admin_contracts WHERE id=$1', [id]);
  return rows[0] ? daLinha(rows[0]) : null;
}

export async function buscarContratoPorToken(tokenHash: string): Promise<Contrato | null> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return (await local.ler()).contratos.find((item) => item.tokenHash === tokenHash) ?? null;
  const rows = await consultar<Record<string, unknown>>('SELECT * FROM admin_contracts WHERE token_hash=$1', [tokenHash]);
  return rows[0] ? daLinha(rows[0]) : null;
}

/** BJL-SITE-2026-001: sequência única por ano, compartilhada por todos os serviços. */
async function proximoNumero(servico: ServicoId, deslocamento: number): Promise<string> {
  const ano = new Date().getFullYear();
  let total: number;
  if (!bancoConfigurado()) {
    total = (await local.ler()).contratos.filter((item) => item.numero.includes(`-${ano}-`)).length;
  } else {
    const rows = await consultar<{ total: unknown }>('SELECT count(*) AS total FROM admin_contracts WHERE number LIKE $1', [`BJL-%-${ano}-%`]);
    total = Number(rows[0]?.total ?? 0);
  }
  return `BJL-${MODELOS[servico].codigo}-${ano}-${String(total + 1 + deslocamento).padStart(3, '0')}`;
}

export type NovoContrato = {
  servico: ServicoId;
  termos: CamposContrato;
  cliente: CamposContrato;
  tokenHash: string;
  tokenEncrypted: string;
  tokenExpiresAt: string;
  pedidoId?: string | null;
};

export async function criarContrato(entrada: NovoContrato): Promise<Contrato> {
  exigirBancoEmProducao();
  const agora = new Date().toISOString();
  for (let tentativa = 0; tentativa < 5; tentativa += 1) {
    const numero = await proximoNumero(entrada.servico, tentativa);
    const contrato: Contrato = {
      id: randomUUID(), numero, servico: entrada.servico, status: 'AGUARDANDO_CLIENTE',
      termos: entrada.termos, cliente: entrada.cliente,
      tokenHash: entrada.tokenHash, tokenEncrypted: entrada.tokenEncrypted, tokenExpiresAt: entrada.tokenExpiresAt,
      clienteEnviadoEm: null, assinadoEm: null, entradaRecebidaEm: null, saldoRecebidoEm: null,
      pedidoId: entrada.pedidoId ?? null, criadoEm: agora, atualizadoEm: agora,
    };
    if (!bancoConfigurado()) {
      const criado = await local.alterar((estado) => {
        if (estado.contratos.some((item) => item.numero === numero)) return null;
        estado.contratos.push(contrato);
        return contrato;
      });
      if (criado) return criado;
      continue;
    }
    const rows = await consultar<Record<string, unknown>>(
      `INSERT INTO admin_contracts (id,number,service,status,terms,client,token_hash,token_encrypted,token_expires_at,request_id)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9,$10)
       ON CONFLICT (number) DO NOTHING RETURNING *`,
      [contrato.id, numero, contrato.servico, contrato.status, JSON.stringify(contrato.termos), JSON.stringify(contrato.cliente),
        contrato.tokenHash, contrato.tokenEncrypted, contrato.tokenExpiresAt, contrato.pedidoId],
    );
    if (rows[0]) return daLinha(rows[0]);
  }
  throw new Error('Não foi possível gerar um número de contrato único. Tente novamente.');
}

export type AlteracaoContrato = Partial<Pick<Contrato,
  'termos' | 'cliente' | 'status' | 'clienteEnviadoEm' | 'assinadoEm' | 'tokenExpiresAt' | 'entradaRecebidaEm' | 'saldoRecebidoEm'>>;

export async function atualizarContrato(id: string, alteracao: AlteracaoContrato): Promise<Contrato> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) {
    return local.alterar((estado) => {
      const indice = estado.contratos.findIndex((item) => item.id === id);
      if (indice < 0) throw new Error('Contrato não encontrado.');
      const atualizado = { ...estado.contratos[indice]!, ...alteracao, atualizadoEm: new Date().toISOString() };
      estado.contratos[indice] = atualizado;
      return atualizado;
    });
  }
  const atual = await buscarContrato(id);
  if (!atual) throw new Error('Contrato não encontrado.');
  const final = { ...atual, ...alteracao };
  const rows = await consultar<Record<string, unknown>>(
    `UPDATE admin_contracts SET terms=$2::jsonb, client=$3::jsonb, status=$4, client_submitted_at=$5, signed_at=$6,
       token_expires_at=$7, deposit_received_at=$8, balance_received_at=$9, updated_at=now() WHERE id=$1 RETURNING *`,
    [id, JSON.stringify(final.termos), JSON.stringify(final.cliente), final.status, final.clienteEnviadoEm, final.assinadoEm,
      final.tokenExpiresAt, final.entradaRecebidaEm, final.saldoRecebidoEm],
  );
  if (!rows[0]) throw new Error('Contrato não encontrado.');
  return daLinha(rows[0]);
}

export async function trocarTokenDoContrato(id: string, tokenHash: string, tokenEncrypted: string, tokenExpiresAt: string): Promise<Contrato> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) {
    return local.alterar((estado) => {
      const indice = estado.contratos.findIndex((item) => item.id === id);
      if (indice < 0) throw new Error('Contrato não encontrado.');
      const atualizado = { ...estado.contratos[indice]!, tokenHash, tokenEncrypted, tokenExpiresAt, atualizadoEm: new Date().toISOString() };
      estado.contratos[indice] = atualizado;
      return atualizado;
    });
  }
  const rows = await consultar<Record<string, unknown>>(
    'UPDATE admin_contracts SET token_hash=$2, token_encrypted=$3, token_expires_at=$4, updated_at=now() WHERE id=$1 RETURNING *',
    [id, tokenHash, tokenEncrypted, tokenExpiresAt],
  );
  if (!rows[0]) throw new Error('Contrato não encontrado.');
  return daLinha(rows[0]);
}

export async function excluirContrato(id: string): Promise<void> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) {
    await local.alterar((estado) => {
      const indice = estado.contratos.findIndex((item) => item.id === id);
      if (indice < 0) throw new Error('Contrato não encontrado.');
      estado.contratos.splice(indice, 1);
    });
    return;
  }
  const rows = await consultar<Record<string, unknown>>('DELETE FROM admin_contracts WHERE id=$1 RETURNING id', [id]);
  if (!rows[0]) throw new Error('Contrato não encontrado.');
}

const CHAVE_CATALOGO = 'catalogo';

export async function lerAjustesCatalogo(): Promise<AjustesCatalogo> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return (await local.ler()).ajustes;
  const rows = await consultar<{ value: unknown }>('SELECT value FROM admin_settings WHERE key=$1', [CHAVE_CATALOGO]);
  const valor = rows[0]?.value;
  if (!valor) return {};
  return (typeof valor === 'string' ? JSON.parse(valor) : valor) as AjustesCatalogo;
}

export async function salvarAjustesCatalogo(ajustes: AjustesCatalogo): Promise<void> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) {
    await local.alterar((estado) => { estado.ajustes = ajustes; });
    return;
  }
  await consultar(
    `INSERT INTO admin_settings (key,value) VALUES ($1,$2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`,
    [CHAVE_CATALOGO, JSON.stringify(ajustes)],
  );
}
