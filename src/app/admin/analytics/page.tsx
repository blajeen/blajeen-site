import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { painelAdmin, botaoSecundario } from '@/components/admin/estilos';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';
export const dynamic = 'force-dynamic';
export default async function AnalyticsPage() {
  await exigirSessaoAdmin();
  return <AdminShell titulo="Analytics." descricao="Saúde, avaliações e crescimento dos produtos da Blajeen Labs.">
    <section className={`${painelAdmin} max-w-3xl`}>
      <p className="tecnica text-signal">Jogo mobile · Android e iOS</p>
      <h2 className="mt-4 text-3xl">Morvelio</h2>
      <p className="mt-3 mb-6 text-mineral">Acompanhe a estabilidade do Android, o retorno dos jogadores e as instalações. Telemetria do jogo em breve.</p>
      <div className="flex flex-wrap gap-3"><Link href="/admin/analytics/morvelio" className={botaoSecundario}>Abrir Morvelio →</Link><Link href="/admin/analytics/morvelio?exemplo=1" className={botaoSecundario}>Ver dados de exemplo</Link></div>
    </section>
  </AdminShell>;
}
