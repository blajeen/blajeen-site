import { MODELOS } from '@/content/contratos/modelos.generated';
import { SERVICOS_IDS, type ServicoId } from '@/content/contratos/tipos';
import { AdminContratos, type InfoServico, type PedidoParaContrato } from '@/components/admin/AdminContratos';
import { AdminShell } from '@/components/admin/AdminShell';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';
import { carregarCatalogo } from '@/lib/contracts/service';
import { buscarPedido } from '@/lib/pedidos/repository';
import { servicoSugerido } from '@/lib/pedidos/types';

export const dynamic = 'force-dynamic';

export default async function AdminContratosPage({ searchParams }: { searchParams: Promise<{ id?: string; pedido?: string }> }) {
  await exigirSessaoAdmin();
  const { id, pedido: pedidoId } = await searchParams;
  const catalogo = await carregarCatalogo();
  const info = Object.fromEntries(SERVICOS_IDS.map((s) => [s, {
    tituloCurto: MODELOS[s].tituloCurto, pagamento: MODELOS[s].pagamento, multiPlano: MODELOS[s].multiPlano,
  }])) as Record<ServicoId, InfoServico>;
  const origem = typeof pedidoId === 'string' ? await buscarPedido(pedidoId) : null;
  const pedido: PedidoParaContrato | null = origem
    ? { id: origem.id, nome: origem.nome, email: origem.email, telefone: origem.telefone, ideia: origem.ideia, servico: servicoSugerido(origem.tipo) }
    : null;

  return (
    <AdminShell titulo="Contratos." descricao="Crie o contrato com os valores que você vendeu, envie o link para o cliente preencher e acompanhe assinatura e pagamentos.">
      <AdminContratos catalogo={catalogo.servicos} info={info} pedido={pedido} idInicial={typeof id === 'string' ? id : undefined} />
    </AdminShell>
  );
}
