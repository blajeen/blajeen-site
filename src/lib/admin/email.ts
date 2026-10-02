/**
 * Aviso por e-mail para a caixa do estúdio.
 *
 * Usa o mesmo provedor e as mesmas variáveis do onboarding (`RESEND_API_KEY`,
 * `ONBOARDING_EMAIL_FROM`, `ONBOARDING_NOTIFICATION_EMAIL`). Sem provedor configurado, nada é
 * enviado e o registro continua no painel — o aviso é conveniência, não o armazenamento.
 *
 * Com o remetente de teste do Resend (`onboarding@resend.dev`), o Resend só entrega para o e-mail
 * da própria conta: `ONBOARDING_NOTIFICATION_EMAIL` precisa ser esse e-mail. Com o domínio
 * verificado no Resend, o remetente pode ser `avisos@blajeen.com.br` e o destino, qualquer um.
 */
export type StatusEnvio = 'PENDING' | 'SENT' | 'FAILED';

export function destinoDosAvisos(): string {
  return process.env.ONBOARDING_NOTIFICATION_EMAIL?.trim() || 'brg.ftw@gmail.com';
}

export function avisoPorEmailConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.ONBOARDING_EMAIL_FROM?.trim());
}

/** O envio e, quando falha, o motivo que o Resend deu (para o painel e para os logs da Vercel). */
export async function enviarAvisoComDetalhe(
  assunto: string, html: string, responderPara?: string,
): Promise<{ status: StatusEnvio; detalhe: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.ONBOARDING_EMAIL_FROM?.trim();
  if (!apiKey || !from) return { status: 'PENDING', detalhe: 'Falta RESEND_API_KEY ou ONBOARDING_EMAIL_FROM na Vercel.' };
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [destinoDosAvisos()], subject: assunto, html, ...(responderPara ? { reply_to: responderPara } : {}) }),
    });
    if (response.ok) return { status: 'SENT', detalhe: '' };
    const corpo = await response.json().catch(() => ({})) as { message?: string };
    const detalhe = `Resend respondeu ${response.status}${corpo.message ? `: ${corpo.message}` : ''}`.slice(0, 300);
    console.error(`[aviso por e-mail] ${detalhe}`);
    return { status: 'FAILED', detalhe };
  } catch (erro) {
    const detalhe = `Sem resposta do Resend: ${erro instanceof Error ? erro.message : 'falha desconhecida'}`.slice(0, 300);
    console.error(`[aviso por e-mail] ${detalhe}`);
    return { status: 'FAILED', detalhe };
  }
}

export async function enviarAvisoAoEstudio(assunto: string, html: string, responderPara?: string): Promise<StatusEnvio> {
  return (await enviarAvisoComDetalhe(assunto, html, responderPara)).status;
}

export function escHtml(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** E-mail simples, legível em qualquer cliente, com a assinatura visual do estúdio. */
export function emailDoPainel(titulo: string, linhas: Array<[string, string]>, textoLivre: string, link: string, rotuloLink: string): string {
  const tabela = linhas.map(([rotulo, valor]) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6b6f64;font:12px monospace;text-transform:uppercase;letter-spacing:.08em;vertical-align:top">${escHtml(rotulo)}</td>`
    + `<td style="padding:6px 0;color:#13150f;font:15px Arial,sans-serif">${escHtml(valor)}</td></tr>`).join('');
  return `<div style="background:#f5f4ee;padding:24px"><div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e3e1d7">
<div style="background:#090a08;padding:18px 24px;color:#c9f36b;font:600 12px monospace;letter-spacing:.2em">BLAJEEN LABS · PAINEL</div>
<div style="padding:24px"><h1 style="margin:0 0 16px;font:600 22px Arial,sans-serif;color:#13150f">${escHtml(titulo)}</h1>
<table style="border-collapse:collapse">${tabela}</table>
${textoLivre ? `<p style="white-space:pre-line;font:15px/1.55 Arial,sans-serif;color:#22251e;background:#eef7d6;border-left:4px solid #b2de4c;padding:12px 14px;margin:18px 0">${escHtml(textoLivre)}</p>` : ''}
<a href="${escHtml(link)}" style="display:inline-block;margin-top:8px;background:#c9f36b;color:#0b0c09;text-decoration:none;font:600 14px Arial,sans-serif;padding:12px 18px;border-radius:999px">${escHtml(rotuloLink)} →</a>
</div></div></div>`;
}
