import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { getProjectBundle } from '@/lib/onboarding/repository';
import { renderOnboardingSummaryHtml } from '@/lib/onboarding/summary';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const bundle = await getProjectBundle(id);
    if (!bundle) throw new Error('Formulário não encontrado.');
    const filename = bundle.project.companyName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'briefing';
    return new Response(renderOnboardingSummaryHtml(bundle), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="briefing-${filename}.html"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
