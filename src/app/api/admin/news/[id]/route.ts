import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { deleteManagedNews, updateManagedNews } from '@/lib/news/repository';
import { parseNewsInput } from '@/lib/news/validation';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const input = parseNewsInput(await request.json() as Record<string, unknown>);
    return Response.json({ item: await updateManagedNews(id, input) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    await deleteManagedNews(id);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
