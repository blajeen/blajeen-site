import { bancoConfigurado, consultar } from '@/lib/admin/banco';
import { getDashboard } from '@/lib/analytics/dashboard';
import { dateInZone } from '@/lib/analytics/dates';
import { buildDailyEmail } from '@/lib/analytics/email';
import { cronAutorizado } from '@/lib/analytics/cron';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
export async function GET(request: Request) {
  if (!cronAutorizado(request)) return Response.json({ error: 'Não autorizado.' }, { status: 401 });
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ONBOARDING_EMAIL_FROM;
  if (!key || !from || !bancoConfigurado()) return Response.json({ error: 'Configure Resend, remetente e DATABASE_URL; aplique a migration 009.' }, { status: 503 });
  const day = dateInZone();
  let claimed = false;
  try {
    const rows = await consultar(`INSERT INTO morvelio_daily_emails (day, state) VALUES ($1, 'sending')
      ON CONFLICT (day) DO UPDATE SET state = 'sending', claimed_at = now()
      WHERE morvelio_daily_emails.state <> 'sent' AND morvelio_daily_emails.claimed_at < now() - interval '10 minutes'
      RETURNING day`, [day]);
    if (!rows.length) return Response.json({ status: 'already_sent_or_running' });
    claimed = true;
    const data = await getDashboard();
    const email = buildDailyEmail(data, day);
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', signal: AbortSignal.timeout(20_000), headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `morvelio-daily-${day}` }, body: JSON.stringify({ from, to: [process.env.MORVELIO_ALERT_EMAIL?.trim() || 'blajeenlabs@outlook.com'], subject: email.subject, html: email.html }) });
    if (!response.ok) throw new Error('Falha no envio.');
    await consultar("UPDATE morvelio_daily_emails SET state = 'sent', sent_at = now() WHERE day = $1", [day]);
    return Response.json({ status: 'sent', day });
  } catch {
    if (claimed) await consultar("UPDATE morvelio_daily_emails SET state = 'failed', claimed_at = now() - interval '11 minutes' WHERE day = $1 AND state <> 'sent'", [day]).catch(() => undefined);
    return Response.json({ error: 'Resumo não concluído. Confira banco, APIs e Resend. O envio pode ser tentado novamente.' }, { status: 503 });
  }
}
