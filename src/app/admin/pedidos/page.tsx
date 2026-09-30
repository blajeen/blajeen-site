import { AdminPedidos } from '@/components/admin/AdminPedidos';
import { AdminShell } from '@/components/admin/AdminShell';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';

export const dynamic = 'force-dynamic';

export default async function AdminPedidosPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await exigirSessaoAdmin();
  const { id } = await searchParams;
  return (
    <AdminShell titulo="Pedidos." descricao="Tudo que chega pelo formulário “Crie seu projeto”. Responda rápido: quem responde primeiro sai na frente.">
      <AdminPedidos idInicial={typeof id === 'string' ? id : undefined} />
    </AdminShell>
  );
}
