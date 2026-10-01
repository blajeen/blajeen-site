import { randomUUID } from 'node:crypto';
import { isValidPhone } from '@/lib/onboarding/validation';
import {
  aceitaPedido, CATEGORIAS, DISPONIBILIDADES, PEDIDO_LOJA_STATUS, slugDe,
  type Categoria, type ConfiguracaoLoja, type Disponibilidade, type Endereco, type Envio, type ItemPedido, type Opcao,
  type PedidoLojaStatus, type Produto, type StatusProduto,
} from './tipos';

function texto(valor: unknown, maximo: number): string {
  return typeof valor === 'string' ? valor.replace(/\r\n/g, '\n').trim().slice(0, maximo) : '';
}

const digitos = (valor: string) => valor.replace(/\D/g, '');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Teto de um preço: R$ 100 mil. Acima disso é erro de digitação, não produto. */
const PRECO_MAXIMO = 10_000_000;
const MAXIMO_POR_ITEM = 20;
const MAXIMO_DE_ITENS = 20;
const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export type EntradaProduto = Omit<Produto, 'id' | 'imagens' | 'criadoEm' | 'atualizadoEm'>;

function medida(valor: unknown, rotulo: string, minimo: number, maximo: number): number {
  const numero = Number(typeof valor === 'string' ? valor.replace(',', '.') : valor);
  if (!Number.isFinite(numero) || numero < minimo || numero > maximo) throw new Error(`Confira ${rotulo} do pacote.`);
  return Math.round(numero * 1000) / 1000;
}

function parseEnvio(bruto: unknown): Envio {
  const e = (bruto ?? {}) as Record<string, unknown>;
  // Faixas aceitas pelas transportadoras do Melhor Envio para um pacote comum.
  return {
    pesoKg: medida(e.pesoKg, 'o peso', 0.01, 30),
    alturaCm: medida(e.alturaCm, 'a altura', 1, 100),
    larguraCm: medida(e.larguraCm, 'a largura', 1, 100),
    comprimentoCm: medida(e.comprimentoCm, 'o comprimento', 1, 100),
  };
}

/** O que o painel manda ao criar ou salvar um produto. As fotos têm rotas próprias. */
export function parseProduto(corpo: unknown): EntradaProduto {
  const bruto = (corpo ?? {}) as Record<string, unknown>;
  const nome = texto(bruto.nome, 120);
  if (nome.length < 2) throw new Error('Dê um nome ao produto.');
  const categoria = texto(bruto.categoria, 40);
  const disponibilidadeBruta = texto(bruto.disponibilidade, 40);
  const disponibilidade = (DISPONIBILIDADES as readonly string[]).includes(disponibilidadeBruta)
    ? disponibilidadeBruta as Disponibilidade : 'EM_BREVE';
  const status: StatusProduto = texto(bruto.status, 20) === 'PUBLICADO' ? 'PUBLICADO' : 'RASCUNHO';
  const opcoesBrutas = Array.isArray(bruto.opcoes) ? bruto.opcoes.slice(0, 30) : [];
  const ids = new Set<string>();
  const opcoes: Opcao[] = opcoesBrutas.map((item, indice) => {
    const o = (item ?? {}) as Record<string, unknown>;
    const rotulo = texto(o.rotulo, 80);
    const preco = Number(o.precoCentavos);
    if (!rotulo) throw new Error(`Dê um nome à opção ${indice + 1}.`);
    if (!Number.isInteger(preco) || preco < 0 || preco > PRECO_MAXIMO) throw new Error(`Confira o preço de “${rotulo}”.`);
    // "Em breve" pode ficar sem preço; fora dele, toda opção precisa de um, ou o site venderia de graça.
    if (disponibilidade !== 'EM_BREVE' && preco === 0) {
      throw new Error(`Defina o preço de “${rotulo}” antes de tirar o produto de “Em breve”.`);
    }
    let id = slugDe(texto(o.id, 40) || rotulo).slice(0, 40);
    while (ids.has(id)) id = `${id}-${indice + 1}`;
    ids.add(id);
    return { id, rotulo, precoCentavos: preco, digital: o.digital === true };
  });
  if (!opcoes.length) throw new Error('O produto precisa de pelo menos uma opção.');
  const ordem = Number(bruto.ordem);
  return {
    slug: slugDe(texto(bruto.slug, 70) || nome),
    nome,
    resumo: texto(bruto.resumo, 240),
    descricao: texto(bruto.descricao, 6000),
    categoria: (CATEGORIAS as readonly string[]).includes(categoria) ? categoria as Categoria : 'colecionaveis',
    colecao: texto(bruto.colecao, 60),
    disponibilidade,
    status,
    rotuloOpcoes: opcoes.length > 1 ? texto(bruto.rotuloOpcoes, 40) || 'Opção' : texto(bruto.rotuloOpcoes, 40),
    opcoes,
    envio: parseEnvio(bruto.envio),
    ordem: Number.isFinite(ordem) ? Math.max(0, Math.min(9999, Math.round(ordem))) : 0,
  };
}

/** Nova ordem e textos alternativos das fotos. Toda foto existente precisa estar na lista. */
export function parseImagens(corpo: unknown, existentes: string[]): Array<{ id: string; alt: string }> {
  const lista = Array.isArray(corpo) ? corpo : [];
  const saida = lista.map((item) => {
    const i = (item ?? {}) as Record<string, unknown>;
    return { id: texto(i.id, 80), alt: texto(i.alt, 240) };
  });
  const ids = saida.map((i) => i.id);
  if (ids.length !== existentes.length || existentes.some((id) => !ids.includes(id))) {
    throw new Error('A lista de fotos mudou. Recarregue a página e tente de novo.');
  }
  return saida;
}

export function parseConfiguracao(corpo: unknown): ConfiguracaoLoja {
  const bruto = (corpo ?? {}) as Record<string, unknown>;
  const cep = digitos(texto(bruto.cepOrigem, 20));
  if (cep && cep.length !== 8) throw new Error('O CEP de origem tem 8 números.');
  const dias = Number(bruto.diasParaPostar);
  if (!Number.isInteger(dias) || dias < 0 || dias > 60) throw new Error('Os dias para postar vão de 0 a 60.');
  return { cepOrigem: cep, diasParaPostar: dias };
}

function digitosVerificadores(base: string, pesos: number[]): number {
  const soma = [...base].reduce((total, d, i) => total + Number(d) * pesos[i]!, 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/** CPF ou CNPJ com dígitos verificadores certos. O Asaas exige um dos dois para cobrar. */
export function cpfCnpjValido(valor: string): boolean {
  const n = digitos(valor);
  if (/^(\d)\1+$/.test(n)) return false;
  if (n.length === 11) {
    const d1 = digitosVerificadores(n.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
    const d2 = digitosVerificadores(n.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
    return n.endsWith(`${d1}${d2}`);
  }
  if (n.length === 14) {
    const d1 = digitosVerificadores(n.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const d2 = digitosVerificadores(n.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return n.endsWith(`${d1}${d2}`);
  }
  return false;
}

export type ContatoDoPedido = { nome: string; email: string; telefone: string; cpfCnpj: string; mensagem: string };
export type ItemSolicitado = { produtoId: string; opcaoId: string; quantidade: number };

export function parseItens(bruto: unknown): ItemSolicitado[] {
  const lista = Array.isArray(bruto) ? bruto : [];
  if (!lista.length) throw new Error('Sua sacola está vazia.');
  if (lista.length > MAXIMO_DE_ITENS) throw new Error('São itens demais num pedido só. Fale com a gente pelo contato.');
  return lista.map((item) => {
    const i = (item ?? {}) as Record<string, unknown>;
    const quantidade = Number(i.quantidade);
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > MAXIMO_POR_ITEM) {
      throw new Error(`A quantidade de cada item vai de 1 a ${MAXIMO_POR_ITEM}.`);
    }
    return { produtoId: texto(i.produtoId, 80), opcaoId: texto(i.opcaoId, 40), quantidade };
  });
}

export function parseCep(valor: unknown): string {
  const cep = digitos(texto(valor, 20));
  if (cep.length !== 8) throw new Error('Informe um CEP com 8 números.');
  return cep;
}

function parseEndereco(bruto: unknown): Endereco | null {
  const e = (bruto ?? null) as Record<string, unknown> | null;
  if (!e) return null;
  return {
    cep: digitos(texto(e.cep, 20)),
    logradouro: texto(e.logradouro, 160),
    numero: texto(e.numero, 20),
    complemento: texto(e.complemento, 80),
    bairro: texto(e.bairro, 80),
    cidade: texto(e.cidade, 80),
    uf: texto(e.uf, 2).toUpperCase(),
  };
}

/** O endereço só é conferido quando há algo para enviar. */
export function validarEndereco(endereco: Endereco | null): Endereco {
  if (!endereco) throw new Error('Informe o endereço de entrega.');
  if (endereco.cep.length !== 8) throw new Error('Informe um CEP com 8 números.');
  if (endereco.logradouro.length < 3) throw new Error('Informe a rua do endereço de entrega.');
  if (!endereco.numero) throw new Error('Informe o número do endereço (ou “s/n”).');
  if (endereco.bairro.length < 2) throw new Error('Informe o bairro.');
  if (endereco.cidade.length < 2) throw new Error('Informe a cidade.');
  if (!UFS.includes(endereco.uf)) throw new Error('Informe o estado (UF), como MG ou SP.');
  return endereco;
}

/**
 * Formulário público do pedido. O campo `site` é a armadilha para robôs, como no "Crie seu
 * projeto". O CPF só é exigido quando o pedido vai para o pagamento online (`exigirDocumento`).
 */
export function parsePedidoLoja(corpo: unknown, opcoes: { exigirDocumento: boolean }): {
  contato: ContatoDoPedido; endereco: Endereco | null; freteServicoId: number | null; itens: ItemSolicitado[]; robo: boolean;
} {
  const bruto = (corpo ?? {}) as Record<string, unknown>;
  const robo = texto(bruto.site, 200).length > 0;
  const contato: ContatoDoPedido = {
    nome: texto(bruto.nome, 120),
    email: texto(bruto.email, 200).toLowerCase(),
    telefone: texto(bruto.telefone, 40),
    cpfCnpj: digitos(texto(bruto.cpfCnpj, 30)),
    mensagem: texto(bruto.mensagem, 1500),
  };
  if (contato.nome.length < 2) throw new Error('Informe seu nome.');
  if (!EMAIL.test(contato.email)) throw new Error('Informe um e-mail válido.');
  if (!isValidPhone(contato.telefone)) throw new Error('Informe um telefone ou WhatsApp com DDD.');
  if ((opcoes.exigirDocumento || contato.cpfCnpj) && !cpfCnpjValido(contato.cpfCnpj)) throw new Error('Confira o CPF (ou CNPJ).');
  const frete = Number(bruto.freteServicoId);
  return {
    contato,
    endereco: parseEndereco(bruto.endereco),
    freteServicoId: Number.isInteger(frete) && frete > 0 ? frete : null,
    itens: parseItens(bruto.itens),
    robo,
  };
}

/**
 * Monta o pedido com os preços do banco, nunca com os que vieram do navegador: a sacola guarda o
 * preço só para mostrar, e quem decide o valor é o catálogo no momento do pedido. Itens repetidos
 * (mesmo produto e opção) viram uma linha só.
 */
export function calcularPedido(solicitados: ItemSolicitado[], produtos: Produto[]): { itens: ItemPedido[]; subtotalCentavos: number } {
  const linhas = new Map<string, ItemPedido>();
  for (const pedido of solicitados) {
    const produto = produtos.find((p) => p.id === pedido.produtoId);
    if (!produto || produto.status !== 'PUBLICADO') throw new Error('Um item da sacola saiu da loja. Remova-o e tente de novo.');
    if (!aceitaPedido(produto)) {
      throw new Error(produto.disponibilidade === 'EM_BREVE'
        ? `${produto.nome} ainda não está à venda. Remova-o da sacola para continuar.`
        : `${produto.nome} está esgotado. Remova-o da sacola para continuar.`);
    }
    const opcao = produto.opcoes.find((o) => o.id === pedido.opcaoId);
    if (!opcao) throw new Error(`A opção escolhida de ${produto.nome} não existe mais. Escolha de novo na página do produto.`);
    const chave = `${produto.id}:${opcao.id}`;
    const atual = linhas.get(chave);
    const quantidade = Math.min(MAXIMO_POR_ITEM, (atual?.quantidade ?? 0) + pedido.quantidade);
    linhas.set(chave, {
      produtoId: produto.id, slug: produto.slug, nome: produto.nome, opcaoId: opcao.id,
      opcaoRotulo: produto.opcoes.length > 1 ? opcao.rotulo : '', precoCentavos: opcao.precoCentavos, quantidade, digital: opcao.digital,
    });
  }
  const itens = [...linhas.values()];
  return { itens, subtotalCentavos: itens.reduce((soma, i) => soma + i.precoCentavos * i.quantidade, 0) };
}

/** Endereço e frete só fazem falta quando algo precisa ser enviado. Um pedido só de e-book não pede. */
export function precisaEnvio(itens: Array<Pick<ItemPedido, 'digital'>>): boolean {
  return itens.some((i) => !i.digital);
}

export function parseAlteracaoPedidoLoja(corpo: unknown): { status?: PedidoLojaStatus; notas?: string } {
  const bruto = (corpo ?? {}) as Record<string, unknown>;
  const saida: { status?: PedidoLojaStatus; notas?: string } = {};
  if (typeof bruto.status === 'string') {
    if (!(PEDIDO_LOJA_STATUS as readonly string[]).includes(bruto.status)) throw new Error('Situação inválida.');
    saida.status = bruto.status as PedidoLojaStatus;
  }
  if (typeof bruto.notas === 'string') saida.notas = texto(bruto.notas, 4000);
  return saida;
}

/** Número curto para falar do pedido no WhatsApp: "BL-261001-7K3Q". */
export function numeroDoPedido(agora = new Date()): string {
  const data = agora.toISOString().slice(2, 10).replace(/-/g, '');
  const sufixo = randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase();
  return `BL-${data}-${sufixo}`;
}
