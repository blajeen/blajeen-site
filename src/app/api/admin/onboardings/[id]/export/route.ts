import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { exportProject } from '@/lib/onboarding/service';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await context.params;
    const configuration = await exportProject(id);
    return new Response(`${JSON.stringify(configuration, null, 2)}\n`, {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="blajeen-onboarding-${id}.json"`, 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return jsonError(error);
  }
}

