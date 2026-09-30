import { SERVICOS_IDS, type ServicoId } from '@/content/contratos/tipos';
import { isValidCnpj, isValidCpfCnpj, isValidPhone } from '@/lib/onboarding/validation';
import type { CamposContrato, ContratoStatus } from './types';
import { lerValor, numeroBr } from './valores';

/** Campos de texto que o painel pode definir, com o tamanho máximo de cada um. */
const TERMOS_TEXTO: Record<string, number> = {
  projeto_nome: 160, resumo_combinado: 4000, plano_nome: 200, valor_total: 20, forma_pagamento: 400, parcelamento: 160,
  prazo: 120, plano_mensal: 200, escopo_detalhe: 4000, dia_venc: 2, cidade_foro: 120, local_assinatura: 120,
  data_assinatura: 10, contratada_endereco: 300, plataformas: 200, engine: 120, dispositivos: 300, copart_pct: 5,
  copart_meses: 5, extra1_desc: 160, extra1_valor: 20, extra2_desc: 160, extra2_valor: 20, test1_nome: 160, test1_cpf: 20,
  test2_nome: 160, test2_cpf: 20, hora_tecnica: 20,
};

/** Caixas de seleção dos anexos e cláusulas opcionais. */
const TERMOS_CAIXA = /^(plano_[a-z0-9]+|mensal_[a-z0-9]+|add_\d{1,2}|copart_(sim|nao)|mod_(fechado|sprints|horas))$/;

/** Dados do CONTRATANTE. O cliente envia pelo link; o painel também pode preencher. */
const CLIENTE_TEXTO: Record<string, number> = {
  contratante_nome: 200, contratante_doc: 20, contratante_endereco: 300, contratante_email: 200, contratante_tel: 40, contratante_repr: 200,
};
const CLIENTE_CAIXA = new Set(['port_sim', 'cred_sim']);

function texto(valor: unknown, maximo: number): string {
  return typeof valor === 'string' ? valor.replace(/\r\n/g, '\n').trim().slice(0, maximo) : '';
}

export function isServico(valor: unknown): valor is ServicoId {
  return typeof valor === 'string' && (SERVICOS_IDS as readonly string[]).includes(valor);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Termos definidos pela Blajeen. Campos desconhecidos são descartados. */
export function parseTermos(entrada: unknown): CamposContrato {
  const bruto = (entrada ?? {}) as Record<string, unknown>;
  const termos: CamposContrato = {};
  for (const [chave, maximo] of Object.entries(TERMOS_TEXTO)) {
    const valor = texto(bruto[chave], maximo);
    if (valor) termos[chave] = valor;
  }
  for (const [chave, valor] of Object.entries(bruto)) {
    if (TERMOS_CAIXA.test(chave) && (valor === true || valor === '1' || valor === 'on')) termos[chave] = '1';
  }
  if (termos.valor_total) {
    const numero = lerValor(termos.valor_total);
    if (numero === null) throw new Error('Informe o valor total em reais, por exemplo 1.490,00.');
    termos.valor_total = numeroBr(numero);
  }
  for (const chave of ['extra1_valor', 'extra2_valor']) {
    if (!termos[chave]) continue;
    const numero = lerValor(termos[chave]!);
    if (numero === null) throw new Error('Informe o valor dos itens adicionais em reais.');
    termos[chave] = numeroBr(numero);
  }
  if (termos.data_assinatura && !/^\d{4}-\d{2}-\d{2}$/.test(termos.data_assinatura)) throw new Error('Data de assinatura inválida.');
  if (termos.dia_venc && !/^([1-9]|[12]\d|3[01])$/.test(termos.dia_venc)) throw new Error('Dia de vencimento deve ser entre 1 e 31.');
  return termos;
}

/**
 * Dados do cliente.
 * `exigirCompleto` vale para o envio pelo link: todos os campos obrigatórios e o aceite dos termos.
 * No painel, a Blajeen pode salvar dados parciais.
 */
export function parseCliente(entrada: unknown, exigirCompleto: boolean): CamposContrato {
  const bruto = (entrada ?? {}) as Record<string, unknown>;
  const cliente: CamposContrato = {};
  for (const [chave, maximo] of Object.entries(CLIENTE_TEXTO)) {
    const valor = texto(bruto[chave], maximo);
    if (valor) cliente[chave] = valor;
  }
  for (const chave of CLIENTE_CAIXA) {
    const valor = bruto[chave];
    if (valor === true || valor === '1' || valor === 'on') cliente[chave] = '1';
  }

  if (cliente.contratante_doc && !isValidCpfCnpj(cliente.contratante_doc)) throw new Error('Informe um CPF ou CNPJ válido.');
  if (cliente.contratante_email && !EMAIL.test(cliente.contratante_email)) throw new Error('Informe um e-mail válido.');
  if (cliente.contratante_tel && !isValidPhone(cliente.contratante_tel)) throw new Error('Informe um telefone com DDD.');

  if (exigirCompleto) {
    const faltando = [
      ['contratante_nome', 'nome ou razão social'], ['contratante_doc', 'CPF ou CNPJ'], ['contratante_endereco', 'endereço completo'],
      ['contratante_email', 'e-mail'], ['contratante_tel', 'telefone'],
    ].filter(([chave]) => !cliente[chave!]).map(([, rotulo]) => rotulo);
    if (faltando.length) throw new Error(`Preencha: ${faltando.join(', ')}.`);
    if (isValidCnpj(cliente.contratante_doc ?? '') && !cliente.contratante_repr) {
      throw new Error('Para CNPJ, informe o nome e o CPF do representante legal.');
    }
    if (bruto.aceite !== true && bruto.aceite !== '1' && bruto.aceite !== 'on') {
      throw new Error('Para enviar, confirme que leu e concorda com os termos do contrato.');
    }
    cliente.aceite_em = new Date().toISOString();
  }
  return cliente;
}

const STATUS: ContratoStatus[] = ['AGUARDANDO_CLIENTE', 'PREENCHIDO', 'ASSINADO', 'CANCELADO'];

export function isStatusContrato(valor: unknown): valor is ContratoStatus {
  return typeof valor === 'string' && (STATUS as string[]).includes(valor);
}
