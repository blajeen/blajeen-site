import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { getProjectBundle } from '@/lib/onboarding/repository';
import { readStoredFile, uploadBody } from '@/lib/onboarding/storage';

type Context = { params: Promise<{ id: string; assetId: string }> };

export async function GET(_request: Request, context: Context) {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  try {
    const { id, assetId } = await context.params;
    const bundle = await getProjectBundle(id);
    const asset = bundle?.assets.find((entry) => entry.id === assetId);
    if (!asset) return jsonError(new Error('Arquivo não encontrado.'), 404);
    return new Response(uploadBody(await readStoredFile(asset.storageKey)), {
      headers: { 'Content-Type': asset.mimeType, 'Content-Disposition': 'inline', 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return jsonError(error, 404);
  }
}
