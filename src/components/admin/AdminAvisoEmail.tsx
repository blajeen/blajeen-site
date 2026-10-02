'use client';

import { useEffect, useState } from 'react';
import { botaoSecundario } from './estilos';

type Situacao = { configurado: boolean; destino: string; remetente: string };

/** Mostra se o aviso por e-mail dos pedidos está ligado e manda um e-mail de teste. */
export function AdminAvisoEmail() {
  const [situacao, setSituacao] = useState<Situacao | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);

  useEffect(() => {
    void fetch('/api/admin/aviso-email', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() as Promise<Situacao> : null))
      .then(setSituacao)
      .catch(() => setSituacao(null));
  }, []);

  async function testar() {
    setEnviando(true); setResultado(null);
    try {
      const resposta = await fetch('/api/admin/aviso-email', { method: 'POST' });
      const dados = await resposta.json() as { status?: string; detalhe?: string; destino?: string; error?: string };
      if (!resposta.ok) setResultado({ ok: false, texto: dados.error ?? 'Não foi possível testar agora.' });
      else if (dados.status === 'SENT') setResultado({ ok: true, texto: `Enviado para ${dados.destino}. Confira a caixa de entrada e o spam.` });
      else setResultado({ ok: false, texto: dados.detalhe || 'O e-mail não saiu.' });
    } catch {
      setResultado({ ok: false, texto: 'Não foi possível testar agora.' });
    }
    setEnviando(false);
  }

  if (!situacao) return null;
  return (
    <section aria-labelledby="aviso-email-titulo" className={`mb-6 rounded-2xl border p-5 ${situacao.configurado ? 'border-signal/40' : 'border-red-400/40'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="aviso-email-titulo" className={`tecnica ${situacao.configurado ? 'text-signal' : 'text-red-300'}`}>
            AVISO POR E-MAIL · {situacao.configurado ? 'LIGADO' : 'DESLIGADO'}
          </h2>
          <p className="mt-2 text-sm text-mineral">
            {situacao.configurado
              ? <>Cada pedido novo chega em <b className="text-paper">{situacao.destino}</b>, além de aparecer aqui.</>
              : <>Os pedidos aparecem só aqui. Para receber por e-mail, configure na Vercel <code>RESEND_API_KEY</code>, <code>ONBOARDING_EMAIL_FROM</code> e <code>ONBOARDING_NOTIFICATION_EMAIL</code> e publique o site de novo.</>}
          </p>
        </div>
        {situacao.configurado ? (
          <button type="button" onClick={() => void testar()} disabled={enviando} className={botaoSecundario}>
            {enviando ? 'ENVIANDO…' : 'ENVIAR E-MAIL DE TESTE'}
          </button>
        ) : null}
      </div>
      {resultado ? (
        <p role={resultado.ok ? 'status' : 'alert'} className={`mt-3 text-sm ${resultado.ok ? 'text-signal' : 'text-red-300'}`}>{resultado.texto}</p>
      ) : null}
    </section>
  );
}
