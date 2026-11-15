import { redirect } from 'next/navigation';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';
export const dynamic = 'force-dynamic';
export default async function MorvelioPage({ searchParams }: { searchParams: Promise<{ exemplo?: string }> }) {
  await exigirSessaoAdmin();
  redirect(`/admin/analytics/morvelio${(await searchParams).exemplo === '1' ? '?exemplo=1' : ''}`);
}
