import { randomUUID } from 'node:crypto';
import type { StatusEnvio } from '@/lib/admin/email';
import { arquivoLocal, bancoConfigurado, consultar, exigirBancoEmProducao, iso } from '@/lib/admin/banco';
import { removeStoredFile, storeFile, type ValidatedUpload } from '@/lib/onboarding/storage';
import { EXEMPLOS } from './exemplos';
import type {
  ConfiguracaoLoja, Endereco, Envio, FreteEscolhido, ImagemProduto, ItemPedido, Pagamento, PedidoLoja, PedidoLojaStatus, Produto,
} from './tipos';
import type { ContatoDoPedido, EntradaProduto } from './validacao';

/**
 * Produtos, pedidos e configuração da loja. Neon em produção; `.data/loja.json` no desenvolvimento.
 *
 * Os produtos de exemplo entram uma vez só, marcados em `admin_settings`: apagado no painel, um
 * exemplo não volta.
 */

type EstadoLocal = {
  produtos: Produto[];
  pedidos: PedidoLoja[];
  exemplos: boolean;
  eventos: string[];
  configuracao: ConfiguracaoLoja | null;
};
const local = arquivoLocal<EstadoLocal>('loja.json', () => ({ produtos: [], pedidos: [], exemplos: false, eventos: [], configuracao: null }));

const MARCA_DOS_EXEMPLOS = 'loja:exemplos';
const CHAVE_DA_CONFIGURACAO = 'loja:configuracao';
/** Pacote de reserva para produtos criados antes do campo existir. */
const PACOTE_PADRAO: Envio = { pesoKg: 0.5, alturaCm: 10, larguraCm: 15, comprimentoCm: 20 };
let exemplosGarantidos = false;

function json<T>(valor: unknown, padrao: T): T {
  if (typeof valor === 'string') {
    try { return JSON.parse(valor) as T; } catch { return padrao; }
  }
  return (valor ?? padrao) as T;
}

function produtoDaLinha(row: Record<string, unknown>): Produto {
  return {
    id: String(row.id),
    slug: String(row.slug),
    nome: String(row.name),
    resumo: String(row.summary ?? ''),
    descricao: String(row.description ?? ''),
    categoria: row.category as Produto['categoria'],
    colecao: String(row.collection ?? ''),
    disponibilidade: row.availability as Produto['disponibilidade'],
    status: row.status as Produto['status'],
    rotuloOpcoes: String(row.option_label ?? ''),
    opcoes: json(row.options, []),
    imagens: json(row.images, []),
    envio: json<Envio>(row.shipping, PACOTE_PADRAO),
    ordem: Number(row.position ?? 0),
    criadoEm: iso(row.created_at),
    atualizadoEm: iso(row.updated_at),
  };
}

function pedidoDaLinha(row: Record<string, unknown>): PedidoLoja {
  return {
    id: String(row.id),
    numero: String(row.number),
    nome: String(row.name),
    email: String(row.email),
    telefone: String(row.phone),
    cpfCnpj: String(row.cpf_cnpj ?? ''),
    endereco: json<Endereco | null>(row.address, null),
    mensagem: String(row.message ?? ''),
    itens: json<ItemPedido[]>(row.items, []),
    subtotalCentavos: Number(row.subtotal_cents),
    frete: json<FreteEscolhido | null>(row.shipping, null),
    totalCentavos: Number(row.total_cents),
    pagamento: json<Pagamento | null>(row.payment, null),
    status: row.status as PedidoLojaStatus,
    notas: String(row.notes ?? ''),
    emailStatus: row.email_status as StatusEnvio,
    criadoEm: iso(row.created_at),
    atualizadoEm: iso(row.updated_at),
  };
}

function ordenar(produtos: Produto[]): Produto[] {
  return produtos.sort((a, b) => a.ordem - b.ordem || a.criadoEm.localeCompare(b.criadoEm));
}

function novoProduto(entrada: EntradaProduto, imagens: ImagemProduto[] = []): Produto {
  const agora = new Date().toISOString();
  return { id: randomUUID(), ...entrada, imagens, criadoEm: agora, atualizadoEm: agora };
}

async function inserirProduto(p: Produto): Promise<Produto | null> {
  const rows = await consultar<Record<string, unknown>>(
    `INSERT INTO store_products (id,slug,name,summary,description,category,collection,availability,status,option_label,options,images,shipping,position)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,$14)
     ON CONFLICT (slug) DO NOTHING RETURNING *`,
    [p.id, p.slug, p.nome, p.resumo, p.descricao, p.categoria, p.colecao, p.disponibilidade, p.status, p.rotuloOpcoes,
      JSON.stringify(p.opcoes), JSON.stringify(p.imagens), JSON.stringify(p.envio), p.ordem],
  );
  return rows[0] ? produtoDaLinha(rows[0]) : null;
}

/** Semeia os exemplos na primeira vez em que a loja é lida. */
async function garantirExemplos(): Promise<void> {
  if (exemplosGarantidos) return;
  if (!bancoConfigurado()) {
    await local.alterar((estado) => {
      if (estado.exemplos) return;
      estado.produtos.push(...EXEMPLOS.map(({ imagens, ...resto }) => novoProduto(resto, imagens)));
      estado.exemplos = true;
    });
    exemplosGarantidos = true;
    return;
  }
  const marca = await consultar<Record<string, unknown>>('SELECT key FROM admin_settings WHERE key=$1', [MARCA_DOS_EXEMPLOS]);
  if (!marca.length) {
    for (const { imagens, ...resto } of EXEMPLOS) await inserirProduto(novoProduto(resto, imagens));
    await consultar(
      `INSERT INTO admin_settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING`,
      [MARCA_DOS_EXEMPLOS, JSON.stringify({ em: new Date().toISOString() })],
    );
  }
  exemplosGarantidos = true;
}

// ------------------------------------------------------------------ produtos

export async function listarProdutos(opcoes: { publicados?: boolean } = {}): Promise<Produto[]> {
  exigirBancoEmProducao();
  await garantirExemplos();
  if (!bancoConfigurado()) {
    const { produtos } = await local.ler();
    return ordenar(produtos.filter((p) => !opcoes.publicados || p.status === 'PUBLICADO'));
  }
  const rows = await consultar<Record<string, unknown>>(
    `SELECT * FROM store_products WHERE ($1::boolean = false OR status = 'PUBLICADO') ORDER BY position, created_at`,
    [Boolean(opcoes.publicados)],
  );
  return rows.map(produtoDaLinha);
}

export async function buscarProduto(id: string): Promise<Produto | null> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return (await local.ler()).produtos.find((p) => p.id === id) ?? null;
  const rows = await consultar<Record<string, unknown>>('SELECT * FROM store_products WHERE id=$1', [id]);
  return rows[0] ? produtoDaLinha(rows[0]) : null;
}

/** Página pública do produto: rascunho não aparece. */
export async function buscarProdutoPublicado(slug: string): Promise<Produto | null> {
  const produto = (await listarProdutos({ publicados: true })).find((p) => p.slug === slug);
  return produto ?? null;
}

async function slugLivre(slug: string, ignorarId?: string): Promise<string> {
  const todos = await listarProdutos();
  // `pedido` é a página da sacola (`/loja/pedido`): um produto com esse endereço ficaria escondido.
  const usados = new Set(['pedido', ...todos.filter((p) => p.id !== ignorarId).map((p) => p.slug)]);
  let candidato = slug;
  for (let n = 2; usados.has(candidato); n += 1) candidato = `${slug}-${n}`;
  return candidato;
}

export async function criarProduto(entrada: EntradaProduto): Promise<Produto> {
  exigirBancoEmProducao();
  const produto = novoProduto({ ...entrada, slug: await slugLivre(entrada.slug) });
  if (!bancoConfigurado()) return local.alterar((estado) => { estado.produtos.push(produto); return produto; });
  const criado = await inserirProduto(produto);
  if (!criado) throw new Error('Já existe um produto com esse endereço. Troque o nome ou o endereço.');
  return criado;
}

export async function atualizarProduto(id: string, entrada: EntradaProduto): Promise<Produto> {
  exigirBancoEmProducao();
  const slug = await slugLivre(entrada.slug, id);
  if (!bancoConfigurado()) {
    return local.alterar((estado) => {
      const i = estado.produtos.findIndex((p) => p.id === id);
      if (i < 0) throw new Error('Produto não encontrado.');
      const atualizado = { ...estado.produtos[i]!, ...entrada, slug, atualizadoEm: new Date().toISOString() };
      estado.produtos[i] = atualizado;
      return atualizado;
    });
  }
  const rows = await consultar<Record<string, unknown>>(
    `UPDATE store_products SET slug=$2,name=$3,summary=$4,description=$5,category=$6,collection=$7,availability=$8,status=$9,
       option_label=$10,options=$11::jsonb,shipping=$12::jsonb,position=$13,updated_at=now() WHERE id=$1 RETURNING *`,
    [id, slug, entrada.nome, entrada.resumo, entrada.descricao, entrada.categoria, entrada.colecao, entrada.disponibilidade,
      entrada.status, entrada.rotuloOpcoes, JSON.stringify(entrada.opcoes), JSON.stringify(entrada.envio), entrada.ordem],
  );
  if (!rows[0]) throw new Error('Produto não encontrado.');
  return produtoDaLinha(rows[0]);
}

export async function excluirProduto(id: string): Promise<Produto> {
  exigirBancoEmProducao();
  const produto = await buscarProduto(id);
  if (!produto) throw new Error('Produto não encontrado.');
  if (!bancoConfigurado()) {
    await local.alterar((estado) => { estado.produtos = estado.produtos.filter((p) => p.id !== id); });
  } else {
    await consultar('DELETE FROM store_products WHERE id=$1', [id]);
  }
  // As fotos enviadas saem junto; os desenhos dos exemplos são arquivos do site e ficam.
  await Promise.all(produto.imagens.filter((i) => i.chave).map((i) => removeStoredFile(i.chave!).catch(() => undefined)));
  return produto;
}

async function gravarImagens(id: string, imagens: ImagemProduto[]): Promise<Produto> {
  if (!bancoConfigurado()) {
    return local.alterar((estado) => {
      const i = estado.produtos.findIndex((p) => p.id === id);
      if (i < 0) throw new Error('Produto não encontrado.');
      const atualizado = { ...estado.produtos[i]!, imagens, atualizadoEm: new Date().toISOString() };
      estado.produtos[i] = atualizado;
      return atualizado;
    });
  }
  const rows = await consultar<Record<string, unknown>>(
    'UPDATE store_products SET images=$2::jsonb, updated_at=now() WHERE id=$1 RETURNING *', [id, JSON.stringify(imagens)],
  );
  if (!rows[0]) throw new Error('Produto não encontrado.');
  return produtoDaLinha(rows[0]);
}

export const MAXIMO_DE_FOTOS = 8;

export async function adicionarImagem(produtoId: string, arquivo: ValidatedUpload, alt: string): Promise<Produto> {
  exigirBancoEmProducao();
  const produto = await buscarProduto(produtoId);
  if (!produto) throw new Error('Produto não encontrado.');
  if (produto.imagens.length >= MAXIMO_DE_FOTOS) throw new Error(`Cada produto aceita até ${MAXIMO_DE_FOTOS} fotos.`);
  const chave = await storeFile(`loja/${produtoId}`, arquivo);
  const id = randomUUID();
  const imagem: ImagemProduto = { id, url: `/api/loja/imagens/${id}`, alt: alt || produto.nome, chave, tipo: arquivo.mimeType };
  try {
    return await gravarImagens(produtoId, [...produto.imagens, imagem]);
  } catch (erro) {
    await removeStoredFile(chave).catch(() => undefined);
    throw erro;
  }
}

export async function removerImagem(produtoId: string, imagemId: string): Promise<Produto> {
  exigirBancoEmProducao();
  const produto = await buscarProduto(produtoId);
  if (!produto) throw new Error('Produto não encontrado.');
  const imagem = produto.imagens.find((i) => i.id === imagemId);
  if (!imagem) throw new Error('Foto não encontrada.');
  const atualizado = await gravarImagens(produtoId, produto.imagens.filter((i) => i.id !== imagemId));
  if (imagem.chave) await removeStoredFile(imagem.chave).catch(() => undefined);
  return atualizado;
}

export async function reorganizarImagens(produtoId: string, lista: Array<{ id: string; alt: string }>): Promise<Produto> {
  exigirBancoEmProducao();
  const produto = await buscarProduto(produtoId);
  if (!produto) throw new Error('Produto não encontrado.');
  const imagens = lista.map(({ id, alt }) => ({ ...produto.imagens.find((i) => i.id === id)!, alt: alt || produto.nome }));
  return gravarImagens(produtoId, imagens);
}

/** Onde mora a foto enviada pelo painel, para a rota pública que a entrega. */
export async function buscarArquivoDaImagem(imagemId: string): Promise<{ chave: string; tipo: string } | null> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) {
    for (const p of (await local.ler()).produtos) {
      const imagem = p.imagens.find((i) => i.id === imagemId);
      if (imagem?.chave) return { chave: imagem.chave, tipo: imagem.tipo ?? 'application/octet-stream' };
    }
    return null;
  }
  const rows = await consultar<Record<string, unknown>>(
    `SELECT img->>'chave' AS chave, img->>'tipo' AS tipo FROM store_products, jsonb_array_elements(images) AS img
     WHERE img->>'id' = $1 LIMIT 1`, [imagemId],
  );
  const row = rows[0];
  return row?.chave ? { chave: String(row.chave), tipo: String(row.tipo ?? 'application/octet-stream') } : null;
}

// ------------------------------------------------------------------- pedidos

export type NovoPedidoLoja = {
  numero: string;
  contato: ContatoDoPedido;
  endereco: Endereco | null;
  itens: ItemPedido[];
  subtotalCentavos: number;
  frete: FreteEscolhido | null;
  status: PedidoLojaStatus;
};

export async function criarPedidoLoja(novo: NovoPedidoLoja): Promise<PedidoLoja> {
  exigirBancoEmProducao();
  const agora = new Date().toISOString();
  const totalCentavos = novo.subtotalCentavos + (novo.frete?.precoCentavos ?? 0);
  const pedido: PedidoLoja = {
    id: randomUUID(), numero: novo.numero, ...novo.contato, endereco: novo.endereco, itens: novo.itens,
    subtotalCentavos: novo.subtotalCentavos, frete: novo.frete, totalCentavos, pagamento: null, status: novo.status,
    notas: '', emailStatus: 'PENDING', criadoEm: agora, atualizadoEm: agora,
  };
  if (!bancoConfigurado()) return local.alterar((estado) => { estado.pedidos.push(pedido); return pedido; });
  const rows = await consultar<Record<string, unknown>>(
    `INSERT INTO store_orders (id,number,name,email,phone,cpf_cnpj,address,message,items,subtotal_cents,shipping,total_cents,status)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9::jsonb,$10,$11::jsonb,$12,$13) RETURNING *`,
    [pedido.id, pedido.numero, pedido.nome, pedido.email, pedido.telefone, pedido.cpfCnpj, JSON.stringify(pedido.endereco),
      pedido.mensagem, JSON.stringify(pedido.itens), pedido.subtotalCentavos, JSON.stringify(pedido.frete), totalCentavos, pedido.status],
  );
  if (!rows[0]) throw new Error('Não foi possível registrar o pedido.');
  return pedidoDaLinha(rows[0]);
}

export async function listarPedidosLoja(): Promise<PedidoLoja[]> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return (await local.ler()).pedidos.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  return (await consultar<Record<string, unknown>>('SELECT * FROM store_orders ORDER BY created_at DESC LIMIT 1000')).map(pedidoDaLinha);
}

export async function buscarPedidoLoja(id: string): Promise<PedidoLoja | null> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return (await local.ler()).pedidos.find((p) => p.id === id) ?? null;
  const rows = await consultar<Record<string, unknown>>('SELECT * FROM store_orders WHERE id=$1', [id]);
  return rows[0] ? pedidoDaLinha(rows[0]) : null;
}

export type AlteracaoPedidoLoja = { status?: PedidoLojaStatus; notas?: string; emailStatus?: StatusEnvio; pagamento?: Pagamento };

export async function atualizarPedidoLoja(id: string, alteracao: AlteracaoPedidoLoja): Promise<PedidoLoja> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) {
    return local.alterar((estado) => {
      const i = estado.pedidos.findIndex((p) => p.id === id);
      if (i < 0) throw new Error('Pedido não encontrado.');
      const atualizado = { ...estado.pedidos[i]!, ...alteracao, atualizadoEm: new Date().toISOString() };
      estado.pedidos[i] = atualizado;
      return atualizado;
    });
  }
  const rows = await consultar<Record<string, unknown>>(
    `UPDATE store_orders SET status=COALESCE($2,status), notes=COALESCE($3,notes), email_status=COALESCE($4,email_status),
       payment=COALESCE($5::jsonb,payment), updated_at=now() WHERE id=$1 RETURNING *`,
    [id, alteracao.status ?? null, alteracao.notas ?? null, alteracao.emailStatus ?? null,
      alteracao.pagamento ? JSON.stringify(alteracao.pagamento) : null],
  );
  if (!rows[0]) throw new Error('Pedido não encontrado.');
  return pedidoDaLinha(rows[0]);
}

export async function excluirPedidoLoja(id: string): Promise<void> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) {
    await local.alterar((estado) => {
      const antes = estado.pedidos.length;
      estado.pedidos = estado.pedidos.filter((p) => p.id !== id);
      if (estado.pedidos.length === antes) throw new Error('Pedido não encontrado.');
    });
    return;
  }
  const rows = await consultar<Record<string, unknown>>('DELETE FROM store_orders WHERE id=$1 RETURNING id', [id]);
  if (!rows[0]) throw new Error('Pedido não encontrado.');
}

/**
 * Marca um evento do webhook como tratado. Devolve `false` se ele já tinha chegado: o Asaas entrega
 * "pelo menos uma vez", e o mesmo evento pode vir repetido.
 */
export async function registrarEventoDePagamento(eventoId: string, evento: string, cobrancaId: string): Promise<boolean> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) {
    return local.alterar((estado) => {
      if (estado.eventos.includes(eventoId)) return false;
      estado.eventos.push(eventoId);
      return true;
    });
  }
  const rows = await consultar<Record<string, unknown>>(
    'INSERT INTO store_payment_events (id,event,payment_id) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING RETURNING id',
    [eventoId, evento, cobrancaId],
  );
  return rows.length > 0;
}

/** Se o tratamento do evento falhar, ele sai do registro para o Asaas poder entregá-lo de novo. */
export async function esquecerEventoDePagamento(eventoId: string): Promise<void> {
  if (!bancoConfigurado()) {
    await local.alterar((estado) => { estado.eventos = estado.eventos.filter((e) => e !== eventoId); });
    return;
  }
  await consultar('DELETE FROM store_payment_events WHERE id=$1', [eventoId]);
}

// --------------------------------------------------------------- configuração

export const CONFIGURACAO_PADRAO: ConfiguracaoLoja = { cepOrigem: '', diasParaPostar: 3, prazoEncomendaDe: 10, prazoEncomendaAte: 20 };

export async function lerConfiguracaoLoja(): Promise<ConfiguracaoLoja> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return { ...CONFIGURACAO_PADRAO, ...(await local.ler()).configuracao };
  const rows = await consultar<Record<string, unknown>>('SELECT value FROM admin_settings WHERE key=$1', [CHAVE_DA_CONFIGURACAO]);
  return { ...CONFIGURACAO_PADRAO, ...json<Partial<ConfiguracaoLoja>>(rows[0]?.value, {}) };
}

export async function salvarConfiguracaoLoja(configuracao: ConfiguracaoLoja): Promise<ConfiguracaoLoja> {
  exigirBancoEmProducao();
  if (!bancoConfigurado()) return local.alterar((estado) => { estado.configuracao = configuracao; return configuracao; });
  await consultar(
    `INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`,
    [CHAVE_DA_CONFIGURACAO, JSON.stringify(configuracao)],
  );
  return configuracao;
}
