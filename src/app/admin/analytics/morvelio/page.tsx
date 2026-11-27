import { AdminShell } from '@/components/admin/AdminShell';
import { MorvelioAnalytics } from '@/components/admin/MorvelioAnalytics';
import { botaoSecundario } from '@/components/admin/estilos';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';
import { getDashboard } from '@/lib/analytics/dashboard';
import { demoDashboard } from '@/lib/analytics/demo';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export default async function MorvelioAnalyticsPage({ searchParams }: { searchParams: Promise<{ exemplo?: string }> }) {
  await exigirSessaoAdmin();
  const demo = (await searchParams).exemplo === '1';
  const data = demo ? demoDashboard() : await getDashboard();
  return <AdminShell titulo="Morvelio." descricao="Analytics / Morvelio · Jogadores, jornada, Cerco, estabilidade e lojas."
    acoes={<Link href={demo ? '/admin/analytics/morvelio' : '/admin/analytics/morvelio?exemplo=1'} className={botaoSecundario}>{demo ? 'Ver dados reais' : 'Ver dados de exemplo'}</Link>}>
    <MorvelioAnalytics data={data} />
  </AdminShell>;
}
