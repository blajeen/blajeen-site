'use client';

import type { FormEvent } from 'react';

const EMAIL_DESTINO = 'brg.ftw@gmail.com';

const tipos = ['Site', 'Aplicativo', 'Sistema ou plataforma', 'E-commerce', 'Identidade e produto digital', 'Ainda não sei'] as const;

export function CustomProjectForm() {
  function prepararEmail(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const assunto = 'Novo projeto personalizado — Blajeen Labs';
    const corpo = [
      'Olá, Blajeen Labs!',
      '',
      'Quero conversar sobre um projeto personalizado.',
      `Tipo de projeto: ${String(dados.get('tipo')).trim()}`,
      `Nome: ${String(dados.get('nome')).trim()}`,
      `E-mail: ${String(dados.get('email')).trim()}`,
      `Telefone: ${String(dados.get('telefone')).trim()}`,
      '',
      'Ideia ou necessidade:',
      String(dados.get('ideia')).trim(),
    ].join('\n');

    window.location.href = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  }

  const campo =
    'mt-2 min-h-12 w-full rounded-2xl border border-line-strong bg-surface px-4 py-3 text-paper outline-none transition-colors placeholder:text-mineral-dim focus:border-[#55bfff]';

  return (
    <section id="comecar" aria-labelledby="comecar-titulo" className="scroll-mt-28 rounded-[var(--radius-panel)] border border-[#55bfff]/30 bg-raised/75 p-6 sm:p-8 lg:p-10">
      <p className="tecnica text-[#8bddff]">PRIMEIRO CONTATO</p>
      <h2 id="comecar-titulo" className="mt-5 max-w-[16ch] text-[clamp(2rem,4vw,3.6rem)] leading-[1] tracking-[-0.05em]">
        Conte o ponto de partida. O resto construímos juntos.
      </h2>
      <p className="medida-texto mt-5 text-sm leading-relaxed text-mineral">
        São só cinco informações. Ao continuar, seu aplicativo de e-mail abrirá com a mensagem pronta para {EMAIL_DESTINO}.
      </p>

      <form onSubmit={prepararEmail} className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="text-sm text-mineral">
          O que você imagina?
          <select name="tipo" defaultValue="Ainda não sei" className={campo}>
            {tipos.map((tipo) => <option key={tipo}>{tipo}</option>)}
          </select>
        </label>
        <label className="text-sm text-mineral">
          Nome
          <input name="nome" type="text" autoComplete="name" required placeholder="Como devemos chamar você?" className={campo} />
        </label>
        <label className="text-sm text-mineral">
          E-mail
          <input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" className={campo} />
        </label>
        <label className="text-sm text-mineral">
          Telefone
          <input name="telefone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="(00) 00000-0000" className={campo} />
        </label>
        <label className="text-sm text-mineral sm:col-span-2">
          Ideia ou necessidade
          <textarea name="ideia" rows={5} required placeholder="Conte o que você quer colocar em prática, mesmo que ainda esteja no começo." className={campo} />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-[#8bddff] bg-[#55bfff] px-6 text-ink transition-colors duration-150 hover:bg-[#8bddff]">
            Preparar conversa <span aria-hidden="true">→</span>
          </button>
          <p className="medida-texto mt-4 text-xs leading-relaxed text-mineral-dim">
            O site não armazena estes dados. A mensagem só será enviada quando você confirmar no seu aplicativo de e-mail.
          </p>
        </div>
      </form>
    </section>
  );
}

