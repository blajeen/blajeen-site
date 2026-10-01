import { removerImagem } from '@/lib/loja/repositorio';
import { revalidarLoja } from '@/lib/loja/revalidar';
import { adminGuard, jsonError } from '@/lib/onboarding/http';

type Contexto = { params: Promise<{ id: string; imagemId: string }> };

export async function DELETE(_request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id, imagemId } = await params;
    const produto = await removerImagem(id, imagemId);
    revalidarLoja(produto.slug);
    return Response.json({ item: produto });
  } catch (error) {
    return jsonError(error);
  }
}
