import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminOnboardings } from '@/components/onboarding/AdminOnboardings';
import { adminCookie, verifyAdminSession } from '@/lib/onboarding/security';

export default async function AdminOnboardingsPage() {
  if (!verifyAdminSession((await cookies()).get(adminCookie.name)?.value)) redirect('/admin/login');
  return <AdminOnboardings />;
}

