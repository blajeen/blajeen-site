import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminLogin } from '@/components/onboarding/AdminLogin';
import { adminCookie, verifyAdminSession } from '@/lib/onboarding/security';

export default async function AdminLoginPage() {
  if (verifyAdminSession((await cookies()).get(adminCookie.name)?.value)) redirect('/admin/onboardings');
  return <AdminLogin />;
}

