import { AdminShell } from '@/components/admin/AdminShell';
import { GraficoMensal } from '@/components/admin/GraficoMensal';
import { botaoSecundario, painelAdmin } from '@/components/admin/estilos';
import { indicadores, porServico, resumoMensal, rotuloMes, ultimosMeses } from '@/lib/admin/relatorios';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';
import { listarContratos } from '@/lib/contracts/repository';
import { reais } from '@/lib/contracts/valores';
import { PEDIDO_ROTULO, PEDIDO_STATUS } from '@/lib/pedidos/types';
import { listarPedidos } from '@/lib/pedidos/repository';

export const dynamic = 'force-dynamic';

const th = 'tecnica border-b border-line-strong py-3 pr-4 text-left font-normal text-mineral-dim';
const td = 'border-b border-line py-3 pr-4 tabular-nums';

export default async function AdminRelatoriosPage() {
  await exigirSessaoAdmin();
  const [pedidos, contratos] = await Promise.all([listarPedidos(), listarContratos()]);
  const meses = resumoMensal(pedidos, contratos, ultimosMeses(12));
  const servicos = porServico(contratos);
  const n = indicadores(pedidos, contratos);
  const totalVendido = servicos.reduce((t, s) => t + s.vendido, 0);
  const funil = PEDIDO_STATUS.map((status) => ({ status, total: pedidos.filter((p) => p.status === status).length }));

  return (
    <AdminShell
      titulo="Relatórios."
      descricao="Pedidos, vendas e recebimentos dos últimos 12 meses. Recebimentos consideram 50% de entrada e 50% de saldo final."
      acoes={<a href="/api/admin/relatorios/csv" className={botaoSecundario}>Baixar planilha de contratos (CSV)</a>}
    >
      <div className="grid gap-8 xl:grid-cols-2">
        <section className={painelAdmin} aria-label="Recebido por mês">
          <GraficoMensal linhas={meses} titulo="Recebido por mês (últimos 12 meses)" />
        </section>
        <section className={painelAdmin} aria-labelledby="funil-titulo">
          <h2 id="funil-titulo" className="text-lg">Pedidos por situação</h2>
          <p className="mt-1 text-sm text-mineral">Conversão (pedidos fechados ÷ pedidos recebidos): {Math.round(n.conversao * 100)}%</p>
          <table className="mt-5 w-full text-sm">
            <thead><tr><th className={th}>Situação</th><th className={th}>Pedidos</th></tr></thead>
            <tbody>{funil.map((linha) => <tr key={linha.status}><td className={td}>{PEDIDO_ROTULO[linha.status]}</td><td className={td}>{linha.total}</td></tr>)}</tbody>
          </table>
        </section>
      </div>

      <section className={`${painelAdmin} mt-8 overflow-x-auto`} aria-labelledby="mensal-titulo">
        <h2 id="mensal-titulo" className="text-lg">Mês a mês</h2>
        <table className="mt-5 w-full min-w-[40rem] text-sm">
          <thead><tr><th className={th}>Mês</th><th className={th}>Pedidos</th><th className={th}>Contratos criados</th><th className={th}>Assinados</th><th className={th}>Vendido</th><th className={th}>Recebido</th></tr></thead>
          <tbody>
            {[...meses].reverse().map((l) => (
              <tr key={l.mes}><td className={td}>{rotuloMes(l.mes)}</td><td className={td}>{l.pedidos}</td><td className={td}>{l.contratos}</td><td className={td}>{l.assinados}</td><td className={td}>{reais(l.vendido)}</td><td className={td}>{reais(l.recebido)}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={`${painelAdmin} mt-8 overflow-x-auto`} aria-labelledby="servicos-titulo">
        <h2 id="servicos-titulo" className="text-lg">Por serviço (todo o período)</h2>
        <table className="mt-5 w-full min-w-[36rem] text-sm">
          <thead><tr><th className={th}>Serviço</th><th className={th}>Contratos</th><th className={th}>Assinados</th><th className={th}>Vendido</th><th className={th}>Participação</th></tr></thead>
          <tbody>
            {servicos.map((s) => {
              const parte = totalVendido > 0 ? s.vendido / totalVendido : 0;
              return (
                <tr key={s.servico}>
                  <td className={td}>{s.nome}</td><td className={td}>{s.contratos}</td><td className={td}>{s.assinados}</td><td className={td}>{reais(s.vendido)}</td>
                  <td className={td}>
                    <span className="flex items-center gap-3">
                      <span className="h-1.5 w-28 overflow-hidden rounded-full bg-steel" aria-hidden="true"><span className="block h-full rounded-full bg-signal" style={{ width: `${parte * 100}%` }} /></span>
                      {Math.round(parte * 100)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
