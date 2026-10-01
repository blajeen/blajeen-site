import { adicionarImagem } from '@/lib/loja/repositorio';
import { revalidarLoja } from '@/lib/loja/revalidar';
import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { validateUpload } from '@/lib/onboarding/storage';

type Contexto = { params: Promise<{ id: string }> };

/** Foto de produto: PNG, JPEG ou WEBP de até 4 MB. SVG e PDF ficam de fora da vitrine. */
const FORMATOS = new Set(['image/png', 'image/jpeg', 'image/webp']);

export async function POST(request: Request, { params }: Contexto) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const { id } = await params;
    const formulario = await request.formData();
    const arquivo = formulario.get('arquivo');
    if (!(arquivo instanceof File)) throw new Error('Escolha uma foto para enviar.');
    const validado = await validateUpload(arquivo);
    if (!FORMATOS.has(validado.mimeType)) throw new Error('Use uma foto em PNG, JPEG ou WEBP.');
    const alt = String(formulario.get('alt') ?? '').trim().slice(0, 240);
    const produto = await adicionarImagem(id, validado, alt);
    revalidarLoja(produto.slug);
    return Response.json({ item: produto }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
