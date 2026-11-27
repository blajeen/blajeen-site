import type { ReactNode } from 'react';
import { dailySummary, number, weekly } from '@/lib/analytics/summary';
import { dateInZone, shiftDate } from '@/lib/analytics/dates';
import { LIMITS, UNITY_PENDING, type Dashboard, type Daily, type Review, type Source } from '@/lib/analytics/types';
import type { Cohort } from '@/lib/analytics/unity';
import styles from './MorvelioAnalytics.module.css';

function date(value: string) { return new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }); }
function Panel({ title, detail, children }: { title: string; detail?: string; children: ReactNode }) {
  return <section className={styles.panel}><header className={styles.panelHeader}><h2>{title}</h2>{detail && <p>{detail}</p>}</header>{children}</section>;
}
function State<T>({ source }: { source: Source<T> }) {
  return <p className={styles.empty}>{source.status === 'missing' ? 'Configurar · ' : source.status === 'error' ? 'Indisponível · ' : 'Sem dados · '}{source.message || 'A fonte ainda não publicou números para este período.'}</p>;
}
function Trend({ source, title, limit, unit = '%' }: { source: Source<Daily[]>; title: string; limit?: number; unit?: string }) {
  if (!source.data?.length) return <State source={source} />;
  const data = source.data;
  const end = dateInZone(new Date(), 'America/Los_Angeles');
  const start = shiftDate(end, -30);
  const max = Math.max(limit ?? 0, ...data.map((p) => p.value), 1) * 1.2;
  const x = (day: string) => 44 + (Date.parse(`${day}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000 / 29 * 612;
  const y = (value: number) => 160 - value / max * 132;
  const segments: Daily[][] = [];
  for (const point of data) {
    const last = segments.at(-1);
    if (last?.at(-1) && shiftDate(last.at(-1)!.date, 1) === point.date) last.push(point);
    else segments.push([point]);
  }
  return <><svg className={styles.chart} viewBox="0 0 680 200" role="img" aria-label={`${title}. ${data.length} dias com dados. ${limit ? `Linha de limite: ${number(limit)}%.` : ''}`}>
    {[0, max / 2, max].map((value) => <g key={value}><line x1="44" y1={y(value)} x2="656" y2={y(value)} stroke="currentColor" opacity=".12" /><text x="36" y={y(value) + 4} textAnchor="end">{number(value, unit ? 2 : 0)}{unit}</text></g>)}
    {limit !== undefined && <g className={styles.limit}><line x1="44" x2="656" y1={y(limit)} y2={y(limit)} stroke="currentColor" strokeDasharray="6 5" /><text x="650" y={y(limit) - 7} textAnchor="end">Google · {number(limit)}%</text></g>}
    {segments.map((segment, i) => <polyline key={i} points={segment.map((p) => `${x(p.date)},${y(p.value)}`).join(' ')} fill="none" stroke="var(--color-signal, #c9f36b)" strokeWidth="2.5" />)}
    {data.map((p) => <circle key={p.date} cx={x(p.date)} cy={y(p.value)} r="3" fill={limit !== undefined && p.value >= limit ? '#f99a91' : '#c9f36b'}><title>{`${date(p.date)}: ${number(p.value)}${unit}`}</title></circle>)}
    <text x="44" y="190">{date(start)}</text><text x="656" y="190" textAnchor="end">{date(shiftDate(end, -1))}</text>
  </svg><details className={styles.details}><summary>Ver valores por dia</summary><div className={styles.tableWrap}><table><thead><tr><th>Data</th><th>{title}</th></tr></thead><tbody>{[...data].reverse().map((p) => <tr key={p.date}><td>{date(p.date)}</td><td>{number(p.value, unit ? 2 : 0)}{unit}</td></tr>)}</tbody></table></div></details></>;
}
function Reviews({ source, title }: { source: Source<Review[]>; title: string }) {
  const stats = weekly(source.data ?? []);
  return <Panel title={title} detail="Últimas avaliações com texto · 7 dias completos para a média">
    {source.status !== 'ok' || !source.data?.length ? <State source={source} /> : <>
      <div className={styles.rating}><strong>{number(stats.average)}</strong><span>/ 5 · {stats.count} avaliações na semana</span></div>
      <p className={styles.muted}>{stats.drop === null ? 'Comparação ainda sem amostra na semana anterior.' : `${stats.drop > 0 ? 'Queda' : 'Variação'} de ${number(Math.abs(stats.drop))} ponto(s) em relação aos 7 dias anteriores.`}</p>
      <div className={styles.reviews}>{[...source.data].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map((r) => <article key={r.id} className={styles.review}>
        <div className={styles.reviewHeader}><span className={r.rating <= 2 ? styles.bad : styles.stars} aria-label={`${r.rating} de 5 estrelas`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span><time dateTime={r.date}>{dateInZone(new Date(r.date)).split('-').reverse().join('/')}</time></div>
        <p>{r.text || 'Sem comentário.'}</p><small>Versão: {r.version ?? 'não informada pela API'} · Idioma: {r.language ?? 'não informado pela API'}</small>
      </article>)}</div>
    </>}
  </Panel>;
}
function pct(part: number, whole: number) { return whole ? `${number(100 * part / whole, 0)}%` : '—'; }
function CohortView({ title, c }: { title: string; c: Cohort }) {
  const tiles = [
    { label: 'Contas', value: number(c.accounts, 0), detail: `${c.linked} vinculadas (${pct(c.linked, c.accounts)}) · ${c.guests} convidados (${pct(c.guests, c.accounts)}). Convidado não sobe save para a nuvem.` },
    { label: 'Voltaram depois de 1 · 3 · 7 dias', value: `${pct(c.returned.d1, c.accounts)} · ${pct(c.returned.d3, c.accounts)} · ${pct(c.returned.d7, c.accounts)}`, detail: 'Aproximado: último acesso menos criação da conta. Não é DAU nem retenção diária de verdade.' },
    { label: 'Ativos nos últimos 3 dias', value: pct(c.active3, c.accounts), detail: `${number(c.active3, 0)} contas com acesso nos últimos 3 dias` },
    { label: 'Jogaram o Cerco', value: pct(c.cerco, c.accounts), detail: `Mediana de ${number(c.cercoMedian, 0)} partidas de quem jogou · só Cerco, sem quest da campanha: ${pct(c.onlyCerco, c.accounts)}` },
    { label: 'Economia: ouro · gemas', value: c.economyAccounts ? `${number(c.goldMedian, 0)} · ${number(c.gemsMedian, 0)}` : '—', detail: `Medianas do saldo no save da conta · ${number(c.economyAccounts, 0)} contas com save` },
  ];
  return <Panel title={title} detail={`${number(c.accounts, 0)} contas · ${number(c.withSave, 0)} com save na nuvem${c.unread ? ` · ${number(c.unread, 0)} ainda sem leitura do save` : ''}`}>
    <div className={`${styles.unity} ${styles.cohort}`}>{tiles.map((m) => <section key={m.label}><h3>{m.label}</h3><strong>{m.value}</strong><small>{m.detail}</small></section>)}</div>
    <h3 className={styles.subhead}>Onde a campanha parou</h3>
    <p className={styles.muted}>Primeira quest não concluída do aventureiro mais adiantado, só contas com save na nuvem.</p>
    {c.stops.length ? <div className={styles.tableWrap}><table><thead><tr><th>Parou em</th><th>Contas</th><th>Acumulado</th></tr></thead><tbody>{c.stops.map((s) => <tr key={s.quest ?? 'none'}><td>{s.quest && s.quest !== 'FIM' ? `${s.quest} · ` : ''}{s.title || 'sem título'}</td><td>{number(s.accounts, 0)}</td><td>{number(100 * s.cumulative, 0)}%</td></tr>)}</tbody></table></div> : <p className={styles.empty}>Nenhuma conta com save na nuvem neste recorte.</p>}
  </Panel>;
}
function InGame({ source }: { source: Dashboard['unity'] }) {
  const u = source.data;
  return <>
    <Panel title="Dentro do jogo" detail={u ? `Saves de produção do Unity · coleta de ${new Date(u.takenAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} · ${number(u.read, 0)} saves relidos nesta coleta` : 'Saves de produção do Unity · coleta diária às 07:30'}>
      {u ? <>
        {u.pending > 0 && <p className={styles.bad}>{number(u.pending, 0)} contas ficaram para a próxima coleta (limite do Unity por execução). Os números abaixo usam a última leitura de cada conta.</p>}
        <Trend source={{ ...source, data: u.newPerDay }} title="Contas novas" unit="" />
        <p className={styles.muted}>Contas novas por dia (Brasília), últimos 30 dias. Total de contas: {number(u.total, 0)}.</p>
      </> : <State source={source} />}
      <div className={styles.unity}>{UNITY_PENDING.map((m) => <div key={m.label} className={styles.pending}><span className={styles.badge}>Em breve</span><h3>{m.label}</h3><small>{m.reason}</small></div>)}</div>
    </Panel>
    {u && <div className={styles.two}><CohortView title="Todas as contas" c={u.all} /><CohortView title="Criadas nos últimos 7 dias" c={u.recent} /></div>}
    {u && <p className={styles.note}>Leitura só dos saves que o jogo sobe para o Cloud Save (itens morvelio_save_v1_* e morvelio_royale_v1). O painel guarda e mostra apenas agregados, sem ids nem nomes de jogadores.</p>}
  </>;
}
export function MorvelioAnalytics({ data }: { data: Dashboard }) {
  const summary = dailySummary(data);
  const crash = data.crash.data?.at(-1); const anr = data.anr.data?.at(-1);
  const total = data.installs.data?.daily.reduce((sum, d) => sum + d.value, 0) ?? null;
  return <div className={styles.root}>
    {data.demo && <div className={styles.demo} role="status"><strong>Dados de exemplo</strong><span>Números fictícios para conferir o painel. Este modo não consulta as lojas nem envia e-mail.</span></div>}
    <div className={styles.status}><span className={styles.dot} />Android + iOS<span>Últimos 30 dias · cache de 1 hora</span><span>Resumo diário · 08h Brasília</span></div>
    <div className={styles.metrics}>
      {[{ label: 'Travamentos · Android', value: crash ? `${number(crash.value)}%` : '—', detail: crash ? `Último dia: ${date(crash.date)} · alerta acima de 1%` : 'Aguardando dados da Google Play', bad: crash && crash.value > 1 }, { label: 'App não responde · Android', value: anr ? `${number(anr.value)}%` : '—', detail: anr ? `Último dia: ${date(anr.date)} · alerta acima de 0,4%` : 'Aguardando dados da Google Play', bad: anr && anr.value > 0.4 }, { label: 'Avaliações · Google Play', value: number(weekly(data.play.data ?? []).average), detail: 'Média dos últimos 7 dias completos', bad: false }, { label: 'Instalações · Android', value: total === null ? '—' : number(total, 0), detail: `${data.installs.data?.daily.length ?? 0} dias com dados no período`, bad: false }].map((m) => <section key={m.label} className={styles.metric}><p>{m.label}</p><strong className={m.bad ? styles.bad : ''}>{m.value}</strong><small>{m.detail}</small></section>)}
    </div>
    {summary.alerts.length > 0 && <aside className={styles.alert} aria-label="Pontos de atenção"><strong>Atenção no dia {date(summary.yesterday)}</strong><ul>{summary.alerts.map((a) => <li key={a}>{a}</li>)}</ul></aside>}
    <div className={styles.two}>
      <Panel title="Travamentos percebidos pelo jogador" detail="Android vitals · limite ruim do Google: 1,09%"><Trend source={data.crash} title="Travamentos" limit={LIMITS.crash} /></Panel>
      <Panel title="App não responde (ANR)" detail="Android vitals · limite ruim do Google: 0,47%"><Trend source={data.anr} title="ANR" limit={LIMITS.anr} /></Panel>
    </div>
    <p className={styles.note}>O Android vitals agrupa dias no horário de Los Angeles. Os dados podem chegar com atraso; lacunas não são zero. As linhas mostram os limites gerais do Google; a avaliação de qualidade da loja considera, em geral, 28 dias.</p>
    <div className={styles.two}>
      <Panel title="5 aparelhos com mais travamentos" detail="Quantidade de relatórios de crash nos últimos 30 dias">
        {data.devices.data?.length ? <div className={styles.tableWrap}><table><thead><tr><th>Aparelho</th><th>Travamentos</th></tr></thead><tbody>{data.devices.data.map((d) => <tr key={d.model}><td>{d.model}</td><td>{number(d.crashes, 0)}</td></tr>)}</tbody></table></div> : <State source={data.devices} />}
      </Panel>
      <Panel title="Instalações por versão" detail={data.installs.data?.versionDate ? `Instalações atuais por código de versão · ${date(data.installs.data.versionDate)}` : 'Android · último relatório disponível'}>
        {data.installs.data?.versions.length ? <div className={styles.tableWrap}><table><thead><tr><th>Código de versão</th><th>Instalações atuais</th></tr></thead><tbody>{data.installs.data.versions.map((v) => <tr key={v.version}><td>{v.version}</td><td>{number(v.installs, 0)}</td></tr>)}</tbody></table></div> : <State source={data.installs} />}
      </Panel>
    </div>
    <Panel title="Instalações por dia" detail="Android · novas instalações em dispositivos. Downloads do iOS ainda não integrados."><Trend source={{ ...data.installs, data: data.installs.data?.daily ?? null }} title="Instalações" unit="" /></Panel>
    <div className={styles.two}><Reviews source={data.play} title="Avaliações · Google Play" /><Reviews source={data.apple} title="Avaliações · App Store" /></div>
    <p className={styles.note}>A média usa apenas as avaliações com texto coletadas, não a nota geral da loja. Google Play retorna avaliações recentes criadas ou alteradas; Apple não informa versão nem idioma neste endpoint. {data.history}</p>
    <InGame source={data.unity} />
    <details className={styles.config}><summary>Conexões e configuração</summary><p>Credenciais ficam somente no servidor. Cada fonte é independente.</p><ul>{[['Travamentos', data.crash], ['ANR', data.anr], ['Aparelhos', data.devices], ['Avaliações Play', data.play], ['Avaliações Apple', data.apple], ['Instalações', data.installs], ['Saves do Unity', data.unity]].map(([label, raw]) => { const s = raw as Source<unknown>; return <li key={String(label)}><strong>{String(label)}</strong>: {s.status === 'ok' ? 'Consulta concluída' : s.message} · consulta {new Date(s.checkedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</li>; })}</ul><p>Resumo destinado a blajeenlabs@outlook.com (padrão). A ativação depende das variáveis de ambiente, banco e agendamento da hospedagem. Instruções em docs/technical/README_ANALYTICS_MORVELIO.md.</p></details>
  </div>;
}
