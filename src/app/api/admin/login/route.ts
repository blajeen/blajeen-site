import { cookies } from 'next/headers';
import { adminCookie, createAdminSession, verifyAdminPassword } from '@/lib/onboarding/security';
import { checkRateLimit, clientIp, jsonError } from '@/lib/onboarding/http';

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`admin-login:${clientIp(request)}`, 8, 15 * 60_000)) return jsonError(new Error('Muitas tentativas. Tente novamente mais tarde.'), 429);
    const body = await request.json() as { password?: unknown };
    if (typeof body.password !== 'string' || !verifyAdminPassword(body.password)) return jsonError(new Error('Senha inválida.'), 401);
    (await cookies()).set(adminCookie.name, createAdminSession(), adminCookie.options);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

