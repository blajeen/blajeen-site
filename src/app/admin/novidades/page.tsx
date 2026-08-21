import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminNews } from '@/components/news/AdminNews';
import { adminCookie, verifyAdminSession } from '@/lib/onboarding/security';

export default async function AdminNewsPage() {
  if (!verifyAdminSession((await cookies()).get(adminCookie.name)?.value)) redirect('/admin/login');
  return <AdminNews />;
}
