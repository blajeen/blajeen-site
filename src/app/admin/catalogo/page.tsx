import { SERVICOS_BASE } from '@/content/contratos/modelos.generated';
import { AdminCatalogo } from '@/components/admin/AdminCatalogo';
import { AdminShell } from '@/components/admin/AdminShell';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';
import { carregarCatalogo } from '@/lib/contracts/service';

export const dynamic = 'force-dynamic';

export default async function AdminCatalogoPage() {
  await exigirSessaoAdmin();
  const catalogo = await carregarCatalogo();
  return (
    <AdminShell titulo="Catálogo." descricao="Ajuste preços e prazos dos serviços. O PDF do catálogo e os novos contratos usam os valores salvos aqui.">
      <AdminCatalogo base={SERVICOS_BASE} vigente={catalogo.servicos} validade={catalogo.validade} horaTecnica={catalogo.horaTecnica} />
    </AdminShell>
  );
}
