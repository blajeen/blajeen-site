import type { ServicoId } from '@/content/contratos/tipos';
import { MODELOS } from '@/content/contratos/modelos.generated';
import { SITE_URL } from '@/content/site';
import { emailDoPainel, enviarAvisoAoEstudio } from '@/lib/admin/email';
import { createCustomerToken, decryptCustomerToken, encryptCustomerToken, hashCustomerToken } from '@/lib/onboarding/security';
import { catalogoVigente, type CatalogoVigente } from './catalogo';
import { atualizarContrato, buscarContratoPorToken, criarContrato, lerAjustesCatalogo, trocarTokenDoContrato } from './repository';
import type { CamposContrato, Contrato, ContratoAdmin, ContratoPublico } from './types';
import { parseCliente } from './validation';
import { numeroBr } from './valores';

function validadeDoLink(): string {
  const configurado = Number(process.env.ONBOARDING_TOKEN_TTL_DAYS ?? '30');
  const dias = Number.isFinite(configurado) && configurado > 0 ? Math.min(configurado, 365) : 30;
  return new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Origem dos links enviados ao cliente e nos avisos por e-mail.
 * `SITE_URL` já resolve `NEXT_PUBLIC_SITE_URL` e cai no domínio oficial quando a variável não existe —
 * sem isso, a produção gerava links para localhost.
 */
export function baseDoSite(): string {
  return SITE_URL.replace(/\/$/, '');
}

export function linkDoCliente(contrato: Pick<Contrato, 'tokenEncrypted'>): string {
  try {
    return `${baseDoSite()}/contrato/${decryptCustomerToken(contrato.tokenEncrypted)}`;
  } catch {
    return '';
  }
}

export function paraAdmin(contrato: Contrato): ContratoAdmin {
  return {
    id: contrato.id, numero: contrato.numero, servico: contrato.servico, status: contrato.status,
    termos: contrato.termos, cliente: contrato.cliente, tokenExpiresAt: contrato.tokenExpiresAt,
    clienteEnviadoEm: contrato.clienteEnviadoEm, assinadoEm: contrato.assinadoEm,
    entradaRecebidaEm: contrato.entradaRecebidaEm, saldoRecebidoEm: contrato.saldoRecebidoEm, pedidoId: contrato.pedidoId,
    criadoEm: contrato.criadoEm, atualizadoEm: contrato.atualizadoEm, linkCliente: linkDoCliente(contrato),
  };
}

export function paraCliente(contrato: Contrato): ContratoPublico {
  return {
    numero: contrato.numero, servico: contrato.servico, status: contrato.status,
    termos: contrato.termos, cliente: contrato.cliente, expiraEm: contrato.tokenExpiresAt,
  };
}

export async function carregarCatalogo(): Promise<CatalogoVigente> {
  return catalogoVigente(await lerAjustesCatalogo());
}

function novoToken() {
  const token = createCustomerToken();
  return { tokenHash: hashCustomerToken(token), tokenEncrypted: encryptCustomerToken(token), tokenExpiresAt: validadeDoLink() };
}

export async function novoContrato(servico: ServicoId, termos: CamposContrato, cliente: CamposContrato, pedidoId: string | null): Promise<Contrato> {
  // Pagamento padrão do estúdio: 50% adiantado e 50% no final, com parcelamento com juros.
  // A hora técnica vigente fica gravada no contrato: mudar o catálogo depois não altera contratos já feitos.
  const catalogo = await carregarCatalogo();
  const completos: CamposContrato = {
    forma_pagamento: MODELOS[servico].pagamento,
    parcelamento: 'à vista',
    hora_tecnica: numeroBr(catalogo.horaTecnica).replace(/,00$/, ''),
    ...termos,
  };
  return criarContrato({ servico, termos: completos, cliente, pedidoId, ...novoToken() });
}

/** Gera um link novo (o anterior deixa de funcionar) e renova a validade. */
export async function renovarLink(id: string): Promise<Contrato> {
  const { tokenHash, tokenEncrypted, tokenExpiresAt } = novoToken();
  return trocarTokenDoContrato(id, tokenHash, tokenEncrypted, tokenExpiresAt);
}

export type EstadoDoLink =
  | { tipo: 'invalido' }
  | { tipo: 'expirado' }
  | { tipo: 'cancelado' }
  | { tipo: 'ok'; contrato: Contrato };

export async function contratoDoLink(token: string): Promise<EstadoDoLink> {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return { tipo: 'invalido' };
  const contrato = await buscarContratoPorToken(hashCustomerToken(token));
  if (!contrato) return { tipo: 'invalido' };
  if (contrato.status === 'CANCELADO') return { tipo: 'cancelado' };
  if (new Date(contrato.tokenExpiresAt).getTime() < Date.now() && contrato.status === 'AGUARDANDO_CLIENTE') return { tipo: 'expirado' };
  return { tipo: 'ok', contrato };
}

/** Envio do cliente pelo link: valida, grava, trava a edição e avisa o estúdio. */
export async function receberDadosDoCliente(token: string, corpo: unknown): Promise<Contrato> {
  const estado = await contratoDoLink(token);
  if (estado.tipo !== 'ok') throw new Error('Este link não está mais disponível. Fale com a Blajeen Labs para receber um novo.');
  if (estado.contrato.status !== 'AGUARDANDO_CLIENTE') throw new Error('Os dados deste contrato já foram enviados.');
  const cliente = parseCliente(corpo, true);
  const atualizado = await atualizarContrato(estado.contrato.id, {
    cliente, status: 'PREENCHIDO', clienteEnviadoEm: new Date().toISOString(),
  });
  const modelo = MODELOS[atualizado.servico];
  await enviarAvisoAoEstudio(
    `Contrato preenchido — ${atualizado.numero} · ${cliente.contratante_nome ?? ''}`,
    emailDoPainel(
      'O cliente preencheu o contrato',
      [
        ['Contrato', atualizado.numero], ['Serviço', modelo.tituloCurto], ['Cliente', cliente.contratante_nome ?? ''],
        ['E-mail', cliente.contratante_email ?? ''], ['Valor', atualizado.termos.valor_total ? `R$ ${atualizado.termos.valor_total}` : '—'],
      ],
      'Próximo passo: abra o contrato no painel, salve o PDF e envie para assinatura eletrônica.',
      `${baseDoSite()}/admin/contratos`, 'Abrir no painel',
    ),
    cliente.contratante_email,
  );
  return atualizado;
}
