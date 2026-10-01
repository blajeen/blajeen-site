import type { StatusEnvio } from '@/lib/admin/email';

/**
 * Loja de exclusivos: bonecos 3D, camisetas, canecas e livros dos jogos do estúdio.
 *
 * Com o Asaas configurado, o pedido termina na página de pagamento dele (Pix, cartão ou boleto) e
 * o frete vem do Melhor Envio. Sem as chaves, a loja cai no pedido com contato: a pessoa deixa os
 * dados e o estúdio confirma valor, frete e pagamento por WhatsApp ou e-mail.
 *
 * Atenção ao nome: no resto do código, `ROTAS_DE_LOJA` são as páginas exigidas pelas lojas de
 * aplicativo (Google Play, App Store). Esta pasta é outra coisa.
 */

export const CATEGORIAS = ['colecionaveis', 'vestuario', 'casa', 'livros'] as const;
export type Categoria = (typeof CATEGORIAS)[number];
export const CATEGORIA_ROTULO: Record<Categoria, string> = {
  colecionaveis: 'Bonecos 3D',
  vestuario: 'Camisetas',
  casa: 'Canecas e copos',
  livros: 'Livros',
};

export const DISPONIBILIDADES = ['EM_BREVE', 'DISPONIVEL', 'SOB_ENCOMENDA', 'PRE_VENDA', 'ESGOTADO'] as const;
export type Disponibilidade = (typeof DISPONIBILIDADES)[number];
export const DISPONIBILIDADE_ROTULO: Record<Disponibilidade, string> = {
  EM_BREVE: 'Em breve',
  DISPONIVEL: 'Disponível',
  SOB_ENCOMENDA: 'Sob encomenda',
  PRE_VENDA: 'Pré-venda',
  ESGOTADO: 'Esgotado',
};

export type StatusProduto = 'RASCUNHO' | 'PUBLICADO';

/** Uma escolha dentro do produto: um tamanho, uma versão do livro. Cada uma tem o próprio preço. */
export type Opcao = {
  id: string;
  rotulo: string;
  precoCentavos: number;
  /** Entrega digital (o e-book, por exemplo): não pede endereço nem frete. */
  digital: boolean;
};

/**
 * Foto do produto. As enviadas pelo painel têm `chave` (onde o arquivo mora) e são servidas por
 * `/api/loja/imagens/<id>`; as dos exemplos são desenhos estáticos em `/public/loja/exemplos`.
 */
export type ImagemProduto = {
  id: string;
  url: string;
  alt: string;
  chave?: string;
  tipo?: string;
};

/** Pacote para a cotação do frete: o produto já embalado, em quilos e centímetros. */
export type Envio = {
  pesoKg: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
};

export type Produto = {
  id: string;
  slug: string;
  nome: string;
  resumo: string;
  descricao: string;
  categoria: Categoria;
  /** Jogo ou linha a que o produto pertence ("Morvelio", "Blajeen Labs"). */
  colecao: string;
  disponibilidade: Disponibilidade;
  status: StatusProduto;
  /** Como as opções se chamam na página: "Tamanho", "Versão". */
  rotuloOpcoes: string;
  opcoes: Opcao[];
  imagens: ImagemProduto[];
  envio: Envio;
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
};

export const PEDIDO_LOJA_STATUS = ['AGUARDANDO_PAGAMENTO', 'PAGO', 'NOVO', 'EM_CONTATO', 'ENVIADO', 'CANCELADO', 'ESTORNADO'] as const;
export type PedidoLojaStatus = (typeof PEDIDO_LOJA_STATUS)[number];
export const PEDIDO_LOJA_ROTULO: Record<PedidoLojaStatus, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PAGO: 'Pago',
  NOVO: 'Novo (sem pagamento online)',
  EM_CONTATO: 'Em contato',
  ENVIADO: 'Enviado ou entregue',
  CANCELADO: 'Cancelado',
  ESTORNADO: 'Estornado',
};

export type Endereco = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

/** A opção de frete escolhida, com o preço cotado no momento do pedido. */
export type FreteEscolhido = {
  servicoId: number;
  servico: string;
  transportadora: string;
  precoCentavos: number;
  prazoDias: number;
};

export type Pagamento = {
  provedor: 'asaas';
  cobrancaId: string;
  url: string;
  /** Último estado informado pelo Asaas: PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED… */
  status: string;
};

/** Retrato do item no momento do pedido: se o preço mudar depois, o pedido guarda o de então. */
export type ItemPedido = {
  produtoId: string;
  slug: string;
  nome: string;
  opcaoId: string;
  opcaoRotulo: string;
  precoCentavos: number;
  quantidade: number;
  digital: boolean;
};

export type PedidoLoja = {
  id: string;
  numero: string;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  /** Vazio num pedido só de itens digitais. */
  endereco: Endereco | null;
  mensagem: string;
  itens: ItemPedido[];
  subtotalCentavos: number;
  frete: FreteEscolhido | null;
  totalCentavos: number;
  pagamento: Pagamento | null;
  status: PedidoLojaStatus;
  notas: string;
  emailStatus: StatusEnvio;
  criadoEm: string;
  atualizadoEm: string;
};

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarPreco(centavos: number): string {
  // O Intl separa "R$" do valor com um espaço que não quebra; aqui ele vira espaço comum para o
  // texto copiado do painel colar limpo no WhatsApp.
  return BRL.format(centavos / 100).replace(/ /g, ' ');
}

/** "89,90", "89.90", "R$ 1.249,00" → centavos. `null` quando não é um valor. */
export function lerPreco(texto: string): number | null {
  const limpo = texto.replace(/[R$\s]/g, '');
  if (!limpo) return null;
  // Com vírgula, o ponto é separador de milhar; sem vírgula, o ponto é o decimal.
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  if (!/^\d+(\.\d{1,2})?$/.test(normal)) return null;
  return Math.round(Number(normal) * 100);
}

export function precoInicial(produto: Pick<Produto, 'opcoes'>): number {
  return Math.min(...produto.opcoes.map((o) => o.precoCentavos));
}

/** Mais de um preço entre as opções: o cartão mostra "a partir de". */
export function temPrecosDiferentes(produto: Pick<Produto, 'opcoes'>): boolean {
  return new Set(produto.opcoes.map((o) => o.precoCentavos)).size > 1;
}

export function aceitaPedido(produto: Pick<Produto, 'status' | 'disponibilidade'>): boolean {
  return produto.status === 'PUBLICADO' && produto.disponibilidade !== 'ESGOTADO' && produto.disponibilidade !== 'EM_BREVE';
}

/** "Em breve" esconde o preço: ele ainda não foi definido. */
export function mostraPreco(produto: Pick<Produto, 'disponibilidade'>): boolean {
  return produto.disponibilidade !== 'EM_BREVE';
}

/** Configuração da loja editada no painel. As chaves do Asaas e do Melhor Envio ficam na Vercel. */
export type ConfiguracaoLoja = {
  /** CEP de onde os pacotes saem, para a cotação do frete. */
  cepOrigem: string;
  /** Dias úteis entre o pagamento e a postagem, somados ao prazo da transportadora. */
  diasParaPostar: number;
  /**
   * Prazo, em dias, de um item "Sob encomenda" chegar: a produção depois do pagamento e o
   * transporte juntos. Aparece na página do produto e na sacola; com ele, os dias para postar não
   * entram na conta do frete, que passa a mostrar só o tempo do transporte.
   */
  prazoEncomendaDe: number;
  prazoEncomendaAte: number;
};

/** "10 a 20 dias", ou "15 dias" quando o prazo é um número só. */
export function textoDoPrazoDeEncomenda(configuracao: Pick<ConfiguracaoLoja, 'prazoEncomendaDe' | 'prazoEncomendaAte'>): string {
  const { prazoEncomendaDe: de, prazoEncomendaAte: ate } = configuracao;
  return de === ate ? `${ate} ${ate === 1 ? 'dia' : 'dias'}` : `${de} a ${ate} dias`;
}

export function slugDe(nome: string): string {
  return nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'produto';
}

export const ROTA_DA_LOJA = '/loja';
export const ROTA_DO_PEDIDO = '/loja/pedido';
export const rotaDoProduto = (slug: string) => `${ROTA_DA_LOJA}/${slug}`;
