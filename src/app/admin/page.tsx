import Link from 'next/link';
import { AdminShell } from '@/components/admin/AdminShell';
import { GraficoMensal } from '@/components/admin/GraficoMensal';
import { botaoPrimario, botaoSecundario, painelAdmin } from '@/components/admin/estilos';
import { indicadores, pendencias, resumoMensal, ultimosMeses } from '@/lib/admin/relatorios';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';
import { listarContratos } from '@/lib/contracts/repository';
import { reais } from '@/lib/contracts/valores';
import { listarPedidos } from '@/lib/pedidos/repository';

export const dynamic = 'force-dynamic';

function Numero({ rotulo, valor, detalhe, destaque = false }: { rotulo: string; valor: string; detalhe: string; destaque?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${destaque ? 'border-signal/60 bg-raised' : 'border-line-strong bg-surface'}`}>
      <p className="tecnica text-mineral-dim">{rotulo}</p>
      <p className="mt-3 text-[clamp(1.7rem,3vw,2.4rem)] leading-none tracking-[-0.03em] tabular-nums">{valor}</p>
      <p className="mt-2 text-sm text-mineral">{detalhe}</p>
    </div>
  );
}

export default async function AdminVisaoGeralPage() {
  await exigirSessaoAdmin();
  const ano = new Date().getFullYear();
  let dados: { pedidos: Awaited<ReturnType<typeof listarPedidos>>; contratos: Awaited<ReturnType<typeof listarContratos>> } | null = null;
  let falha = '';
  try {
    const [pedidos, contratos] = await Promise.all([listarPedidos(), listarContratos()]);
    dados = { pedidos, contratos };
  } catch (erro) {
    falha = erro instanceof Error ? erro.message : 'erro desconhecido';
  }

  let conteudo: React.ReactNode;
  if (dados) {
    const { pedidos, contratos } = dados;
    const n = indicadores(pedidos, contratos);
    const tarefas = pendencias(pedidos, contratos);
    const meses = resumoMensal(pedidos, contratos, ultimosMeses(6));
    conteudo = (
      <>
        <section aria-label="Indicadores" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Numero rotulo="PEDIDOS NOVOS" valor={String(n.pedidosNovos)} detalhe={`${n.pedidosTotal} pedidos no total`} destaque={n.pedidosNovos > 0} />
          <Numero rotulo="CONTRATOS COM O CLIENTE" valor={String(n.contratosAguardando)} detalhe="aguardando o cliente preencher" />
          <Numero rotulo="PRONTOS PARA ASSINAR" valor={String(n.contratosPreenchidos)} detalhe="envie pela plataforma de assinatura" destaque={n.contratosPreenchidos > 0} />
          <Numero rotulo="CONTRATOS ASSINADOS" valor={String(n.contratosAssinados)} detalhe={`conversão de pedidos: ${Math.round(n.conversao * 100)}%`} />
          <Numero rotulo={`VENDIDO EM ${ano}`} valor={reais(Math.round(n.vendidoAno))} detalhe="soma dos contratos assinados" />
          <Numero rotulo={`RECEBIDO EM ${ano}`} valor={reais(Math.round(n.recebidoAno))} detalhe="entradas e saldos registrados" />
          <Numero rotulo="A RECEBER" valor={reais(Math.round(n.aReceber))} detalhe="entradas e saldos em aberto" destaque={n.aReceber > 0} />
          <Numero rotulo="TICKET MÉDIO" valor={reais(Math.round(n.ticketMedio))} detalhe={`por contrato assinado em ${ano}`} />
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section aria-labelledby="pendencias-titulo" className={painelAdmin}>
            <h2 id="pendencias-titulo" className="text-2xl">O que precisa de você</h2>
            {tarefas.length ? (
              <ul className="mt-5 divide-y divide-line">
                {tarefas.slice(0, 12).map((t) => (
                  <li key={`${t.tipo}-${t.id}-${t.acao}`} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div><p className="text-base">{t.titulo}</p><p className="mt-1 text-sm text-mineral">{t.detalhe}</p></div>
                    <Link href={t.href} className={botaoSecundario}>{t.acao} →</Link>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-5 text-mineral">Tudo em dia. Nenhuma pendência agora.</p>}
          </section>
          <section aria-label="Recebimentos" className={painelAdmin}>
            <GraficoMensal linhas={meses} titulo="Recebido por mês (últimos 6 meses)" />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/admin/contratos" className={botaoPrimario}>NOVO CONTRATO →</Link>
              <Link href="/admin/relatorios" className={botaoSecundario}>Ver relatórios</Link>
            </div>
          </section>
        </div>
      </>
    );
  } else {
    conteudo = (
      <p role="alert" className="rounded-2xl border border-red-400/40 p-6 text-red-200">
        Não foi possível carregar os dados do painel: {falha}.
      </p>
    );
  }

  return (
    <AdminShell titulo="Visão geral." descricao="Pedidos, contratos e dinheiro entrando, em uma tela. Comece pelo que precisa de você.">
      {conteudo}
    </AdminShell>
  );
}
