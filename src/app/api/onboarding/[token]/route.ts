import { calculateProgress } from '@/lib/onboarding/progress';
import { getOnboardingSchema } from '@/lib/onboarding/schema';
import { getCustomerBundle, saveCustomerAnswers } from '@/lib/onboarding/service';
import { checkRateLimit, clientIp, jsonError } from '@/lib/onboarding/http';
import type { AnswerMap } from '@/lib/onboarding/types';

type Context = { params: Promise<{ token: string }> };

function publicBundle(bundle: Awaited<ReturnType<typeof getCustomerBundle>>) {
  const schema = getOnboardingSchema(bundle.project.projectType);
  const progress = calculateProgress(schema, bundle.answers, bundle.assets);
  return {
    project: { ...bundle.project, tokenHash: undefined, tokenEncrypted: undefined },
    answers: bundle.answers,
    assets: bundle.assets.map(({ storageKey: _storageKey, ...asset }) => asset),
    reviews: bundle.reviews.filter((review) => review.status === 'OPEN'),
    schema,
    progress,
  };
}

export async function GET(request: Request, context: Context) {
  try {
    const { token } = await context.params;
    if (!checkRateLimit(`onboarding:${clientIp(request)}:${token.slice(0, 8)}`, 120)) return jsonError(new Error('Muitas solicitações. Aguarde um instante.'), 429);
    return Response.json(publicBundle(await getCustomerBundle(token)));
  } catch (error) {
    return jsonError(error, 404);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { token } = await context.params;
    if (!checkRateLimit(`save:${clientIp(request)}:${token.slice(0, 8)}`, 90)) return jsonError(new Error('Muitos salvamentos. Aguarde um instante.'), 429);
    const body = await request.json() as { answers?: unknown; currentStep?: unknown };
    if (!body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers)) throw new Error('Respostas inválidas.');
    const currentStep = typeof body.currentStep === 'number' ? Math.floor(body.currentStep) : 0;
    const bundle = await saveCustomerAnswers(token, body.answers as AnswerMap, currentStep);
    return Response.json(publicBundle(bundle));
  } catch (error) {
    return jsonError(error);
  }
}
