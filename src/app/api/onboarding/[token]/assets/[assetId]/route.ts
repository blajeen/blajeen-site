import { editCustomerAsset, removeCustomerAsset } from '@/lib/onboarding/service';
import { jsonError } from '@/lib/onboarding/http';

type Context = { params: Promise<{ token: string; assetId: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const { token, assetId } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    await editCustomerAsset(token, assetId, {
      altText: typeof body.altText === 'string' ? body.altText.slice(0, 300) : '',
      caption: typeof body.caption === 'string' ? body.caption.slice(0, 500) : '',
      sortOrder: typeof body.sortOrder === 'number' ? Math.max(0, Math.floor(body.sortOrder)) : 0,
      consentConfirmed: body.consentConfirmed === true,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { token, assetId } = await context.params;
    await removeCustomerAsset(token, assetId);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

