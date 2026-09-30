import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminCookie, verifyAdminSession } from '@/lib/onboarding/security';

/** Páginas do painel: sem sessão válida, volta para o login. */
export async function exigirSessaoAdmin(): Promise<void> {
  if (!verifyAdminSession((await cookies()).get(adminCookie.name)?.value)) redirect('/admin/login');
}

export async function temSessaoAdmin(): Promise<boolean> {
  return verifyAdminSession((await cookies()).get(adminCookie.name)?.value);
}
