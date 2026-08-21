import { jsonError } from '@/lib/onboarding/http';
import { uploadCustomerAsset } from '@/lib/onboarding/service';

type Context = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { token } = await context.params;
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new Error('Selecione um arquivo.');
    const asset = await uploadCustomerAsset(
      token,
      String(form.get('slot') ?? ''),
      file,
      String(form.get('altText') ?? ''),
      String(form.get('caption') ?? ''),
      form.get('consentConfirmed') === 'true',
    );
    const { storageKey: _storageKey, ...safeAsset } = asset;
    void _storageKey;
    return Response.json({ asset: safeAsset }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
