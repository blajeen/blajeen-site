import { randomUUID } from 'node:crypto';
import type { OnboardingBundle } from './types';
import { renderOnboardingSummaryHtml } from './summary';

export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';

async function databaseQuery(sql: string, params: unknown[]): Promise<void> {
  const connection = process.env.DATABASE_URL?.trim();
  if (!connection) return;
  const parsed = new URL(connection);
  const response = await fetch(`https://${parsed.hostname}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 'Neon-Connection-String': connection,
      'Neon-Raw-Text-Output': 'false', 'Neon-Array-Mode': 'true',
    },
    body: JSON.stringify({ query: sql, params }), cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Falha ao registrar a entrega (${response.status}).`);
}

export async function notifyOnboardingSubmission(bundle: OnboardingBundle): Promise<DeliveryStatus> {
  const id = randomUUID();
  const recipient = process.env.ONBOARDING_NOTIFICATION_EMAIL?.trim() || 'brg.ftw@gmail.com';
  const subject = `Novo briefing recebido — ${bundle.project.companyName}`;
  const html = renderOnboardingSummaryHtml(bundle);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ONBOARDING_EMAIL_FROM?.trim();

  await databaseQuery(
    `INSERT INTO onboarding_email_deliveries (id,project_id,recipient,subject,status) VALUES ($1,$2,$3,$4,'PENDING')`,
    [id, bundle.project.id, recipient, subject],
  );

  if (!apiKey || !from) return 'PENDING';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [recipient], subject, html }),
    });
    const payload = await response.json() as { id?: string; message?: string };
    if (!response.ok) throw new Error(payload.message ?? `Serviço de e-mail respondeu ${response.status}.`);
    await databaseQuery(
      `UPDATE onboarding_email_deliveries SET status='SENT',provider_message_id=$2,sent_at=now() WHERE id=$1`,
      [id, payload.id ?? null],
    );
    return 'SENT';
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 1000) : 'Falha desconhecida.';
    await databaseQuery(`UPDATE onboarding_email_deliveries SET status='FAILED',error=$2 WHERE id=$1`, [id, message]);
    return 'FAILED';
  }
}
