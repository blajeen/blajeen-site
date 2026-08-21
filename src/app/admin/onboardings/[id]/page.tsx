import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminOnboardingDetail } from '@/components/onboarding/AdminOnboardingDetail';
import { adminCookie, verifyAdminSession } from '@/lib/onboarding/security';

export default async function AdminOnboardingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminSession((await cookies()).get(adminCookie.name)?.value)) redirect('/admin/login');
  const { id } = await params;
  return <AdminOnboardingDetail id={id} />;
}

