import { afterEach, describe, expect, it, vi } from 'vitest';
import { avisoPorEmailConfigurado, destinoDosAvisos, enviarAvisoComDetalhe } from './email';

describe('aviso por e-mail', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it('sem chave e remetente, não envia e diz o que falta', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('ONBOARDING_EMAIL_FROM', '');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    expect(avisoPorEmailConfigurado()).toBe(false);
    expect(await enviarAvisoComDetalhe('Assunto', '<p>oi</p>')).toMatchObject({ status: 'PENDING', detalhe: expect.stringMatching(/RESEND_API_KEY/) });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('envia para o destino configurado e devolve o motivo quando o Resend recusa', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_teste');
    vi.stubEnv('ONBOARDING_EMAIL_FROM', 'Blajeen Labs <onboarding@resend.dev>');
    vi.stubEnv('ONBOARDING_NOTIFICATION_EMAIL', 'estudio@exemplo.com');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'You can only send testing emails to your own email address' }), { status: 403 }));
    vi.stubGlobal('fetch', fetch);

    expect(avisoPorEmailConfigurado()).toBe(true);
    expect(destinoDosAvisos()).toBe('estudio@exemplo.com');
    expect(await enviarAvisoComDetalhe('Assunto', '<p>oi</p>', 'cliente@exemplo.com')).toEqual({ status: 'SENT', detalhe: '' });
    const corpo = JSON.parse(String(fetch.mock.calls[0]![1].body)) as { to: string[]; reply_to: string };
    expect(corpo).toMatchObject({ to: ['estudio@exemplo.com'], reply_to: 'cliente@exemplo.com' });

    const falha = await enviarAvisoComDetalhe('Assunto', '<p>oi</p>');
    expect(falha.status).toBe('FAILED');
    expect(falha.detalhe).toMatch(/403.*own email address/);
  });
});
