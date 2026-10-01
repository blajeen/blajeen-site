import { atualizarProduto, buscarProduto, excluirProduto, reorganizarImagens } from '@/lib/loja/repositorio';
import { revalidarLoja } from '@/lib/loja/revalidar';
import { parseImagens, parseProduto } from '@/lib/loja/validacao';
import { adminGuard, jsonError } from '@/lib/onboarding/http';

type Contexto = { params: Promise<{ id: string }> };

/** Salva o produto. Se vier `imagens`, salva também a ordem e as descrições das fotos. */
export async function PATCH(request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id } = await params;
    const antes = await buscarProduto(id);
    if (!antes) throw new Error('Produto não encontrado.');
    const corpo = await request.json() as Record<string, unknown>;
    let produto = await atualizarProduto(id, parseProduto(corpo));
    if (corpo.imagens !== undefined) {
      produto = await reorganizarImagens(id, parseImagens(corpo.imagens, antes.imagens.map((i) => i.id)));
    }
    revalidarLoja(antes.slug, produto.slug);
    return Response.json({ item: produto });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id } = await params;
    const produto = await excluirProduto(id);
    revalidarLoja(produto.slug);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
