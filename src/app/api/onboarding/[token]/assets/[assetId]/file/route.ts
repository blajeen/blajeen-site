import { getCustomerBundle } from '@/lib/onboarding/service';
import { readStoredFile, uploadBody } from '@/lib/onboarding/storage';
import { jsonError } from '@/lib/onboarding/http';

type Context = { params: Promise<{ token: string; assetId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { token, assetId } = await context.params;
    const bundle = await getCustomerBundle(token);
    const asset = bundle.assets.find((entry) => entry.id === assetId);
    if (!asset) return jsonError(new Error('Arquivo não encontrado.'), 404);
    return new Response(uploadBody(await readStoredFile(asset.storageKey)), {
      headers: { 'Content-Type': asset.mimeType, 'Content-Disposition': `inline; filename="arquivo${asset.mimeType === 'application/pdf' ? '.pdf' : ''}"`, 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return jsonError(error, 404);
  }
}
