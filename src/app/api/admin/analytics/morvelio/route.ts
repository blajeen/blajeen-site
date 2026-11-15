import { adminGuard } from '@/lib/onboarding/http';
import { getDashboard } from '@/lib/analytics/dashboard';
import { demoDashboard } from '@/lib/analytics/demo';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const blocked = await adminGuard();
  if (blocked) return blocked;
  const data = new URL(request.url).searchParams.get('exemplo') === '1' ? demoDashboard() : await getDashboard();
  return Response.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
}
