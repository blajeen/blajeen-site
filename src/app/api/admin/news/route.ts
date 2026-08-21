import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { createManagedNews, listManagedNews } from '@/lib/news/repository';
import { parseNewsInput } from '@/lib/news/validation';

export async function GET() {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  return Response.json({ items: await listManagedNews() });
}

export async function POST(request: Request) {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  try {
    const input = parseNewsInput(await request.json() as Record<string, unknown>);
    return Response.json({ item: await createManagedNews(input) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
