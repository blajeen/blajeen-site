import { criarProduto, listarProdutos } from '@/lib/loja/repositorio';
import { revalidarLoja } from '@/lib/loja/revalidar';
import { parseProduto } from '@/lib/loja/validacao';
import { adminGuard, jsonError } from '@/lib/onboarding/http';

export async function GET() {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    return Response.json({ itens: await listarProdutos() });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: Request) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const produto = await criarProduto(parseProduto(await request.json()));
    revalidarLoja(produto.slug);
    return Response.json({ item: produto }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
