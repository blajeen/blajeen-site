import { AdminShell } from '@/components/admin/AdminShell';
import { botaoSecundario } from '@/components/admin/estilos';
import { AdminNews } from '@/components/news/AdminNews';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';

export default async function AdminNewsPage() {
  await exigirSessaoAdmin();
  return (
    <AdminShell titulo="Novidades." descricao="Escreva, revise e publique atualizações no site."
      acoes={<a href="/novidades" target="_blank" rel="noreferrer" className={botaoSecundario}>Ver página ↗</a>}>
      <AdminNews />
    </AdminShell>
  );
}
