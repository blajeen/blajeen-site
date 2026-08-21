import { jsonError } from '@/lib/onboarding/http';
import { submitCustomerOnboarding } from '@/lib/onboarding/service';

type Context = { params: Promise<{ token: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { token } = await context.params;
    const body = await request.json() as { termsAccepted?: unknown };
    const bundle = await submitCustomerOnboarding(token, body.termsAccepted === true);
    return Response.json({ ok: true, status: bundle.project.status });
  } catch (error) {
    return jsonError(error);
  }
}

