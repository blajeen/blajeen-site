import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { getProjectBundle } from '@/lib/onboarding/repository';
import { adminTransition, onboardingUrl, regenerateCustomerLink, requestChanges, resolveReview } from '@/lib/onboarding/service';
import { decryptCustomerToken } from '@/lib/onboarding/security';
import { ONBOARDING_STATUSES, type OnboardingStatus } from '@/lib/onboarding/types';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const bundle = await getProjectBundle(id);
  if (!bundle) return jsonError(new Error('Onboarding não encontrado.'), 404);
  return Response.json({
    bundle: { ...bundle, project: { ...bundle.project, tokenHash: undefined, tokenEncrypted: undefined } },
    url: onboardingUrl(decryptCustomerToken(bundle.project.tokenEncrypted)),
  });
}

export async function PATCH(request: Request, context: Context) {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await context.params;
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action ?? '');
    if (action === 'regenerate-link') return Response.json(await regenerateCustomerLink(id));
    if (action === 'request-changes') {
      const review = await requestChanges(id, {
        section: String(body.section ?? ''), field: typeof body.field === 'string' && body.field ? body.field : null,
        message: String(body.message ?? ''), author: String(body.author ?? 'Blajeen'),
      });
      return Response.json({ review });
    }
    if (action === 'resolve-review') {
      await resolveReview(id, String(body.reviewId ?? ''));
      return Response.json({ ok: true });
    }
    if (action === 'transition') {
      const status = String(body.status ?? '') as OnboardingStatus;
      if (!ONBOARDING_STATUSES.includes(status)) throw new Error('Status inválido.');
      await adminTransition(id, status);
      return Response.json({ ok: true });
    }
    throw new Error('Ação administrativa inválida.');
  } catch (error) {
    return jsonError(error);
  }
}
