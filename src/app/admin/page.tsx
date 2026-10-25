import Link from 'next/link';
import { AdminIcon, type AdminIconName } from '@/components/admin/AdminIcon';
import { AdminShell } from '@/components/admin/AdminShell';
import { GraficoMensal } from '@/components/admin/GraficoMensal';
import { botaoPrimario, botaoSecundario, painelAdmin } from '@/components/admin/estilos';
import { indicadores, pendencias, resumoMensal, ultimosMeses } from '@/lib/admin/relatorios';
import { exigirSessaoAdmin } from '@/lib/admin/sessao';
import { listarContratos } from '@/lib/contracts/repository';
import { reais } from '@/lib/contracts/valores';
import { listarPedidos } from '@/lib/pedidos/repository';
import styles from '@/components/admin/AdminOverview.module.css';

export const dynamic = 'force-dynamic';

function Numero({ rotulo, valor, detalhe, icone, destaque = false }: { rotulo: string; valor: string; detalhe: string; icone: AdminIconName; destaque?: boolean }) {
  return (
    <div className={`${styles.metric} ${destaque ? styles.highlight : ''}`}>
      <div className={styles.metricHeader}>
        <p className={styles.label}>{rotulo}</p>
        <span className={styles.icon}><AdminIcon name={icone} /></span>
      </div>
      <p className={styles.value}>{valor}</p>
      <p className={styles.detail}>{detalhe}</p>
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
        <section aria-label="Indicadores" className={styles.metrics}>
          <Numero icone="orders" rotulo="Pedidos novos" valor={String(n.pedidosNovos)} detalhe={`${n.pedidosTotal} pedidos no total`} destaque={n.pedidosNovos > 0} />
          <Numero icone="contracts" rotulo="Com o cliente" valor={String(n.contratosAguardando)} detalhe="contratos aguardando preenchimento" />
          <Numero icone="contracts" rotulo="Prontos para assinar" valor={String(n.contratosPreenchidos)} detalhe="envie pela plataforma de assinatura" destaque={n.contratosPreenchidos > 0} />
          <Numero icone="contracts" rotulo="Contratos assinados" valor={String(n.contratosAssinados)} detalhe={`conversão de pedidos: ${Math.round(n.conversao * 100)}%`} />
          <Numero icone="reports" rotulo={`Vendido em ${ano}`} valor={reais(Math.round(n.vendidoAno))} detalhe="soma dos contratos assinados" />
          <Numero icone="reports" rotulo={`Recebido em ${ano}`} valor={reais(Math.round(n.recebidoAno))} detalhe="entradas e saldos registrados" />
          <Numero icone="reports" rotulo="A receber" valor={reais(Math.round(n.aReceber))} detalhe="entradas e saldos em aberto" destaque={n.aReceber > 0} />
          <Numero icone="reports" rotulo="Ticket médio" valor={reais(Math.round(n.ticketMedio))} detalhe={`por contrato assinado em ${ano}`} />
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
    <AdminShell titulo="Visão geral." descricao="Pedidos, contratos e recebimentos. Comece pelo que precisa de você."
      acoes={<><Link href="/admin/pedidos" className={botaoSecundario}><AdminIcon name="orders" className="h-4 w-4" />Ver pedidos</Link><Link href="/admin/contratos" className={botaoPrimario}><AdminIcon name="contracts" className="h-4 w-4" />Novo contrato</Link></>}>
      {conteudo}
    </AdminShell>
  );
}
