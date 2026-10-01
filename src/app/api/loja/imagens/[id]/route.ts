import { buscarArquivoDaImagem } from '@/lib/loja/repositorio';
import { readStoredFile, uploadBody } from '@/lib/onboarding/storage';

type Contexto = { params: Promise<{ id: string }> };

/**
 * Foto de produto enviada pelo painel. Cada envio ganha um id novo, então a resposta nunca muda e
 * pode ficar em cache para sempre; trocar a foto no painel troca o endereço.
 */
export async function GET(_request: Request, { params }: Contexto) {
  try {
    const { id } = await params;
    const arquivo = await buscarArquivoDaImagem(id);
    if (!arquivo) return new Response('Foto não encontrada.', { status: 404 });
    return new Response(uploadBody(await readStoredFile(arquivo.chave)), {
      headers: {
        'Content-Type': arquivo.tipo,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Foto indisponível.', { status: 404 });
  }
}
