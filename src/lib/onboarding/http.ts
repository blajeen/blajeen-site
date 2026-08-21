import { cookies } from 'next/headers';
import { adminCookie, verifyAdminSession } from './security';

const attempts = new Map<string, { count: number; resetAt: number }>();

export function jsonError(error: unknown, status = 400): Response {
  const message = error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
  return Response.json({ error: message }, { status });
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local';
}

export function checkRateLimit(key: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}

export async function requireAdmin(): Promise<void> {
  const value = (await cookies()).get(adminCookie.name)?.value;
  if (!verifyAdminSession(value)) throw new Error('AUTH_REQUIRED');
}

export async function adminGuard(): Promise<Response | null> {
  try {
    await requireAdmin();
    return null;
  } catch {
    return jsonError(new Error('Sessão administrativa inválida ou expirada.'), 401);
  }
}

