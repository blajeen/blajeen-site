import { cookies } from 'next/headers';
import { adminCookie } from '@/lib/onboarding/security';

export async function POST() {
  (await cookies()).delete(adminCookie.name);
  return Response.json({ ok: true });
}

