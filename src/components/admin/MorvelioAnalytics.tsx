import type { ReactNode } from 'react';
import { dailySummary, number, weekly } from '@/lib/analytics/summary';
import { dateInZone, shiftDate } from '@/lib/analytics/dates';
import { LIMITS, UNITY_PENDING, type Dashboard, type Daily, type Review, type Source } from '@/lib/analytics/types';
import type { Cohort } from '@/lib/analytics/unity';
import { MorvelioTabs, type MorvelioTab } from './MorvelioTabs';
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
type Tone = 'good' | 'bad' | 'neutral';
type Headline = { label: string; value: string; detail: string; tone: Tone; signal?: string };
function Summary({ items }: { items: Headline[] }) {
  return <section className={styles.summary} aria-label="Resumo do que importa">{items.map((m) => <div key={m.label} className={`${styles.metric} ${m.tone === 'bad' ? styles.toneBad : m.tone === 'good' ? styles.toneGood : ''}`}>
    <p>{m.label}</p><strong>{m.value}</strong>{m.signal && <span className={styles.signal}>{m.signal}</span>}<small>{m.detail}</small>
  </div>)}</section>;
}
function headlines(data: Dashboard): Headline[] {
  const u = data.unity.data; const crash = data.crash.data?.at(-1); const anr = data.anr.data?.at(-1);
  const out: Headline[] = [];
  if (u) {
    const week = u.newPerDay.slice(-7).reduce((a, d) => a + d.value, 0); const before = u.newPerDay.slice(-14, -7).reduce((a, d) => a + d.value, 0);
    const top = u.all.stops.filter((s) => s.quest !== null && s.quest !== 'FIM').sort((a, b) => b.accounts - a.accounts)[0];
    out.push(
      { label: 'Contas novas · 7 dias', value: number(u.recent.accounts, 0), detail: `${number(before, 0)} nos 7 dias anteriores`, tone: week > before ? 'good' : week < before ? 'bad' : 'neutral', signal: week > before ? '▲ subiu' : week < before ? '▼ caiu' : '= igual' },
      { label: 'Voltaram depois de 1 dia', value: pct(u.all.returned.d1, u.all.accounts), detail: 'Todas as contas · aproximado (último acesso − criação)', tone: 'neutral' },
      { label: 'Ativos em 3 dias', value: pct(u.all.active3, u.all.accounts), detail: `${number(u.all.active3, 0)} de ${number(u.all.accounts, 0)} contas`, tone: 'neutral' },
      { label: 'Maior parada da jornada', value: top?.quest ?? '—', detail: top ? `${top.title} · ${number(top.accounts, 0)} contas (${pct(top.accounts, u.all.withSave)} das com save)` : 'Sem contas com save', tone: 'neutral' },
      { label: 'Jogadores no Cerco', value: pct(u.all.cerco, u.all.accounts), detail: `${number(u.all.cerco, 0)} contas · mediana de ${number(u.all.cercoMedian, 0)} partidas`, tone: 'neutral' },
    );
  } else out.push({ label: 'Dentro do jogo', value: '—', detail: data.unity.message || 'Aguardando a coleta dos saves', tone: 'neutral' });
  for (const [label, point, alert] of [['Travamentos · Android', crash, 1], ['ANR · Android', anr, 0.4]] as const) {
    out.push(point ? { label, value: `${number(point.value)}%`, detail: `Último dia: ${date(point.date)} · alerta acima de ${number(alert, 1)}%`, tone: point.value > alert ? 'bad' : 'good', signal: point.value > alert ? '▲ acima do limite' : '✓ dentro do limite' } : { label, value: '—', detail: 'Aguardando dados da Google Play', tone: 'neutral' });
  }
  return out;
}
function Tiles({ items }: { items: Array<{ label: string; value: string; detail: string }> }) {
  return <div className={`${styles.unity} ${styles.cohort}`}>{items.map((m) => <section key={m.label}><h3>{m.label}</h3><strong>{m.value}</strong><small>{m.detail}</small></section>)}</div>;
}
type Snapshot = NonNullable<Dashboard['unity']['data']>;
const cohortDetail = (c: Cohort) => `${number(c.accounts, 0)} contas · ${number(c.withSave, 0)} com save na nuvem${c.unread ? ` · ${number(c.unread, 0)} ainda sem leitura do save` : ''}`;
function Players({ title, c }: { title: string; c: Cohort }) {
  return <Panel title={title} detail={cohortDetail(c)}><Tiles items={[
    { label: 'Contas', value: number(c.accounts, 0), detail: `${c.linked} vinculadas (${pct(c.linked, c.accounts)}) · ${c.guests} convidados (${pct(c.guests, c.accounts)}). Convidado não sobe save para a nuvem.` },
    { label: 'Voltaram depois de 1 · 3 · 7 dias', value: `${pct(c.returned.d1, c.accounts)} · ${pct(c.returned.d3, c.accounts)} · ${pct(c.returned.d7, c.accounts)}`, detail: 'Aproximado: último acesso menos criação da conta. Não é DAU nem retenção diária de verdade.' },
    { label: 'Ativos nos últimos 3 dias', value: pct(c.active3, c.accounts), detail: `${number(c.active3, 0)} contas com acesso nos últimos 3 dias` },
    { label: 'Economia: ouro · gemas', value: c.economyAccounts ? `${number(c.goldMedian, 0)} · ${number(c.gemsMedian, 0)}` : '—', detail: `Medianas do saldo no save da conta · ${number(c.economyAccounts, 0)} contas com save` },
  ]} /></Panel>;
}
function Cerco({ title, c }: { title: string; c: Cohort }) {
  return <Panel title={title} detail={cohortDetail(c)}><Tiles items={[
    { label: 'Jogaram o Cerco', value: pct(c.cerco, c.accounts), detail: `${number(c.cerco, 0)} de ${number(c.accounts, 0)} contas` },
    { label: 'Mediana de partidas', value: number(c.cercoMedian, 0), detail: 'Entre quem jogou pelo menos uma partida' },
    { label: 'Só Cerco', value: pct(c.onlyCerco, c.accounts), detail: `${number(c.onlyCerco, 0)} contas jogaram o Cerco sem concluir quest principal` },
  ]} /></Panel>;
}
function Journey({ title, c }: { title: string; c: Cohort }) {
  return <Panel title={title} detail={`${number(c.withSave, 0)} contas com save na nuvem`}>
    {c.stops.length ? <div className={styles.tableWrap}><table><thead><tr><th>Parou em</th><th>Contas</th><th>Acumulado</th></tr></thead><tbody>{c.stops.map((s) => <tr key={s.quest ?? 'none'}><td>{s.quest && s.quest !== 'FIM' ? `${s.quest} · ` : ''}{s.title || 'sem título'}</td><td>{number(s.accounts, 0)}</td><td>{number(100 * s.cumulative, 0)}%</td></tr>)}</tbody></table></div> : <p className={styles.empty}>Nenhuma conta com save na nuvem neste recorte.</p>}
  </Panel>;
}
/** Conteúdo das abas do jogo: aviso de coleta parcial, o conteúdo e a origem; sem coleta, o estado da fonte. */
function InGame({ source, render }: { source: Dashboard['unity']; render: (u: Snapshot) => ReactNode }) {
  const u = source.data;
  if (!u) return <Panel title="Dentro do jogo"><State source={source} /></Panel>;
  return <>
    {u.pending > 0 && <p className={`${styles.note} ${styles.bad}`}>{number(u.pending, 0)} contas ficaram para a próxima coleta (limite do Unity por execução). Os números usam a última leitura de cada conta.</p>}
    {render(u)}
    <p className={styles.note}>Saves de produção do Unity · coleta de {new Date(u.takenAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} · {number(u.read, 0)} saves relidos nesta coleta. Só agregados, sem ids nem nomes de jogadores.</p>
  </>;
}
export function MorvelioAnalytics({ data }: { data: Dashboard }) {
  const summary = dailySummary(data);
  const total = data.installs.data?.daily.reduce((sum, d) => sum + d.value, 0) ?? null;
  const tabs: MorvelioTab[] = [
    { id: 'jogadores', label: 'Jogadores', content: <InGame source={data.unity} render={(u) => <>
      <Panel title="Contas novas por dia" detail={`Brasília · últimos 30 dias · total de contas: ${number(u.total, 0)}`}><Trend source={{ ...data.unity, data: u.newPerDay }} title="Contas novas" unit="" /></Panel>
      <div className={styles.two}><Players title="Todas as contas" c={u.all} /><Players title="Criadas nos últimos 7 dias" c={u.recent} /></div>
      <div className={styles.unity}>{UNITY_PENDING.map((m) => <div key={m.label} className={styles.pending}><span className={styles.badge}>Em breve</span><h3>{m.label}</h3><small>{m.reason}</small></div>)}</div>
    </>} /> },
    { id: 'jornada', label: 'Jornada', content: <InGame source={data.unity} render={(u) => <>
      <p className={styles.note}>Onde a campanha parou: primeira quest principal, na ordem da jornada, que o aventureiro mais adiantado não concluiu; opcionais não contam. Acumulado = parou ali ou antes.</p>
      <div className={styles.two}><Journey title="Todas as contas" c={u.all} /><Journey title="Criadas nos últimos 7 dias" c={u.recent} /></div>
    </>} /> },
    { id: 'cerco', label: 'Cerco', content: <InGame source={data.unity} render={(u) => <div className={styles.two}><Cerco title="Todas as contas" c={u.all} /><Cerco title="Criadas nos últimos 7 dias" c={u.recent} /></div>} /> },
    { id: 'estabilidade', label: 'Estabilidade', content: <>
      {summary.alerts.length > 0 && <aside className={styles.alert} aria-label="Pontos de atenção"><strong>Atenção no dia {date(summary.yesterday)}</strong><ul>{summary.alerts.map((a) => <li key={a}>{a}</li>)}</ul></aside>}
      <div className={styles.two}>
        <Panel title="Travamentos percebidos pelo jogador" detail="Android vitals · limite ruim do Google: 1,09%"><Trend source={data.crash} title="Travamentos" limit={LIMITS.crash} /></Panel>
        <Panel title="App não responde (ANR)" detail="Android vitals · limite ruim do Google: 0,47%"><Trend source={data.anr} title="ANR" limit={LIMITS.anr} /></Panel>
      </div>
      <Panel title="5 aparelhos com mais travamentos" detail="Quantidade de relatórios de crash nos últimos 30 dias">
        {data.devices.data?.length ? <div className={styles.tableWrap}><table><thead><tr><th>Aparelho</th><th>Travamentos</th></tr></thead><tbody>{data.devices.data.map((d) => <tr key={d.model}><td>{d.model}</td><td>{number(d.crashes, 0)}</td></tr>)}</tbody></table></div> : <State source={data.devices} />}
      </Panel>
      <p className={styles.note}>O Android vitals agrupa dias no horário de Los Angeles. Os dados podem chegar com atraso; lacunas não são zero. As linhas mostram os limites gerais do Google; a avaliação de qualidade da loja considera, em geral, 28 dias.</p>
    </> },
    { id: 'lojas', label: 'Lojas', content: <>
      <div className={styles.metrics}>
        {[{ label: 'Avaliações · Google Play', value: number(weekly(data.play.data ?? []).average), detail: 'Média dos últimos 7 dias completos' }, { label: 'Avaliações · App Store', value: number(weekly(data.apple.data ?? []).average), detail: 'Média dos últimos 7 dias completos' }, { label: 'Instalações · Android', value: total === null ? '—' : number(total, 0), detail: `${data.installs.data?.daily.length ?? 0} dias com dados no período` }].map((m) => <section key={m.label} className={styles.metric}><p>{m.label}</p><strong>{m.value}</strong><small>{m.detail}</small></section>)}
      </div>
      <div className={styles.two}><Reviews source={data.play} title="Avaliações · Google Play" /><Reviews source={data.apple} title="Avaliações · App Store" /></div>
      <p className={styles.note}>A média usa apenas as avaliações com texto coletadas, não a nota geral da loja. Google Play retorna avaliações recentes criadas ou alteradas; Apple não informa versão nem idioma neste endpoint. {data.history}</p>
      <Panel title="Instalações por dia" detail="Android · novas instalações em dispositivos. Downloads do iOS ainda não integrados."><Trend source={{ ...data.installs, data: data.installs.data?.daily ?? null }} title="Instalações" unit="" /></Panel>
      <Panel title="Instalações por versão" detail={data.installs.data?.versionDate ? `Instalações atuais por código de versão · ${date(data.installs.data.versionDate)}` : 'Android · último relatório disponível'}>
        {data.installs.data?.versions.length ? <div className={styles.tableWrap}><table><thead><tr><th>Código de versão</th><th>Instalações atuais</th></tr></thead><tbody>{data.installs.data.versions.map((v) => <tr key={v.version}><td>{v.version}</td><td>{number(v.installs, 0)}</td></tr>)}</tbody></table></div> : <State source={data.installs} />}
      </Panel>
    </> },
    { id: 'conexoes', label: 'Conexões', content: <Panel title="Conexões e configuração" detail="Credenciais ficam somente no servidor. Cada fonte é independente.">
      <ul className={styles.sources}>{[['Travamentos', data.crash], ['ANR', data.anr], ['Aparelhos', data.devices], ['Avaliações Play', data.play], ['Avaliações Apple', data.apple], ['Instalações', data.installs], ['Saves do Unity', data.unity]].map(([label, raw]) => { const s = raw as Source<unknown>; return <li key={String(label)}><span aria-hidden="true" className={s.status === 'ok' ? styles.good : s.status === 'error' ? styles.bad : styles.neutral}>{s.status === 'ok' ? '✓' : s.status === 'error' ? '✕' : '○'}</span><strong>{String(label)}</strong><span>{s.status === 'ok' ? 'Consulta concluída' : s.message} · consulta {new Date(s.checkedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span></li>; })}</ul>
      <p className={styles.note}>Resumo diário às 08h de Brasília para blajeenlabs@outlook.com (padrão); coleta dos saves às 07h30. A ativação depende das variáveis de ambiente, banco e agendamento da hospedagem. Instruções em docs/technical/README_ANALYTICS_MORVELIO.md.</p>
    </Panel> },
  ];
  return <div className={styles.root}>
    {data.demo && <div className={styles.demo} role="status"><strong>Dados de exemplo</strong><span>Números fictícios para conferir o painel. Este modo não consulta as lojas nem envia e-mail.</span></div>}
    <Summary items={headlines(data)} />
    <MorvelioTabs tabs={tabs} />
  </div>;
}
