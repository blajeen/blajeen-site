import { AdminLoja } from '@/components/admin/AdminLoja';
import { AdminShell } from '@/components/admin/AdminShell';
import { botaoSecundario } from '@/components/admin/estilos';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ pedido?: string; aba?: string }> };

export default async function AdminLojaPage({ searchParams }: Props) {
  await exigirSessaoAdmin();
  const { pedido, aba } = await searchParams;
  return (
    <AdminShell titulo="Loja." descricao="Pedidos, produtos e frete da loja de exclusivos. Preço, fotos e textos mudam aqui e aparecem no site na hora."
      acoes={<a href="/loja" target="_blank" rel="noreferrer" className={botaoSecundario}>Ver a loja ↗</a>}>
      <AdminLoja pedidoInicial={pedido} abaInicial={aba === 'produtos' || aba === 'configuracao' ? aba : 'pedidos'} />
    </AdminShell>
  );
}
