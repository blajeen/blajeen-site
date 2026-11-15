import { escHtml } from '@/lib/admin/email';
import { dailySummary, number } from './summary';
import type { Dashboard } from './types';
export function buildDailyEmail(data: Dashboard, today?: string) {
  if (data.demo) throw new Error('Dados de exemplo não podem gerar e-mail.');
  const s = dailySummary(data, today);
  const pct = (v: number | null) => v === null ? 'Sem dados publicados para essa data' : `${number(v)}%`;
  const lines: Array<{ text: string; alert: boolean }> = [
    { text: `Referência: ${s.yesterday}. Android vitals usa o dia de Los Angeles; avaliações usam Brasília.`, alert: false },
    { text: `Android · travamentos: ${pct(s.crash)} · ANR: ${pct(s.anr)}`, alert: s.crash !== null && s.crash > 1 || s.anr !== null && s.anr > 0.4 },
    { text: `Avaliações novas/atualizadas coletadas: ${s.newReviews.length}${data.play.status !== 'ok' || data.apple.status !== 'ok' ? ' (coleta incompleta)' : ''}. Média: ${number(s.newReviews.length ? s.newReviews.reduce((sum, r) => sum + r.rating, 0) / s.newReviews.length : null)}.`, alert: s.newReviews.some((r) => r.rating <= 2) },
    { text: `Semana · Play: ${number(s.averages.play.average)} (${s.averages.play.count}) · Apple: ${number(s.averages.apple.average)} (${s.averages.apple.count}). Apenas avaliações com texto coletadas.`, alert: [s.averages.play, s.averages.apple].some((s) => s.drop !== null && s.drop + 1e-9 >= 0.3) },
    { text: `Instalações Android: ${s.installs === null ? 'Sem dados publicados para essa data' : number(s.installs, 0)}. iOS: não integrado.`, alert: false },
    { text: s.alerts.length ? s.alerts.join(' ') : 'Nenhum alerta nos dados disponíveis. Dados ausentes não indicam normalidade.', alert: s.alerts.length > 0 },
    { text: data.history, alert: false },
  ];
  return { subject: `${s.alerts.length ? 'ALERTA · ' : ''}Morvelio · ${s.yesterday}`, html: `<div style="font:15px/1.5 Arial,sans-serif;max-width:640px;color:#181b16"><h1 style="font-size:22px">Morvelio · resumo diário</h1>${lines.map((l) => `<p style="${l.alert ? 'color:#b42318;font-weight:bold;' : ''}">${escHtml(l.text)}</p>`).join('')}<p><a href="https://blajeen.com.br/admin/analytics/morvelio">Abrir Analytics → Morvelio</a></p></div>` };
}
