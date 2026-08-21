import { adminGuard, jsonError } from '@/lib/onboarding/http';
import { createOnboarding } from '@/lib/onboarding/service';
import { listProjects } from '@/lib/onboarding/repository';
import { isProjectType } from '@/lib/onboarding/validation';
import { ONBOARDING_STATUSES, type OnboardingStatus, type ProjectType } from '@/lib/onboarding/types';

function safeProject<T extends { tokenHash: string; tokenEncrypted: string }>(project: T) {
  const { tokenHash, tokenEncrypted, ...safe } = project;
  void tokenHash; void tokenEncrypted;
  return safe;
}

export async function GET(request: Request) {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  const search = new URL(request.url).searchParams;
  const statusText = search.get('status');
  const typeText = search.get('projectType');
  const status = statusText && ONBOARDING_STATUSES.includes(statusText as OnboardingStatus) ? statusText as OnboardingStatus : undefined;
  const projectType = isProjectType(typeText) ? typeText : undefined;
  const filters: { query?: string; status?: OnboardingStatus; projectType?: ProjectType; assignedTo?: string } = {};
  const query = search.get('query');
  const assignedTo = search.get('assignedTo');
  if (query) filters.query = query;
  if (status) filters.status = status;
  if (projectType) filters.projectType = projectType;
  if (assignedTo) filters.assignedTo = assignedTo;
  return Response.json({ projects: (await listProjects(filters)).map(safeProject) });
}

export async function POST(request: Request) {
  const unauthorized = await adminGuard();
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json() as Record<string, unknown>;
    if (!isProjectType(body.projectType)) throw new Error('Selecione um tipo de projeto.');
    for (const key of ['customerName', 'customerEmail', 'customerPhone', 'companyName'] as const) {
      if (typeof body[key] !== 'string' || !body[key].trim()) throw new Error('Preencha todos os dados do cliente.');
    }
    const result = await createOnboarding({
      customerName: String(body.customerName).trim(), customerEmail: String(body.customerEmail).trim(),
      customerPhone: String(body.customerPhone).trim(), companyName: String(body.companyName).trim(), projectType: body.projectType,
      assignedTo: typeof body.assignedTo === 'string' && body.assignedTo.trim() ? body.assignedTo.trim() : null,
      sourceOrderId: typeof body.sourceOrderId === 'string' && body.sourceOrderId.trim() ? body.sourceOrderId.trim() : null,
      sourceOrderItemId: typeof body.sourceOrderItemId === 'string' && body.sourceOrderItemId.trim() ? body.sourceOrderItemId.trim() : null,
    });
    return Response.json({ project: safeProject(result.bundle.project), url: result.url, created: result.created }, { status: result.created ? 201 : 200 });
  } catch (error) {
    return jsonError(error);
  }
}
