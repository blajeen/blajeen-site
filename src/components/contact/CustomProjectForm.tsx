'use client';

import { useState, type FormEvent } from 'react';
import { ROTAS } from '@/lib/routes';
import { TIPOS_DE_PROJETO } from '@/lib/pedidos/types';

/**
 * Primeiro contato do "Crie seu projeto".
 *
 * O pedido vai para o painel da Blajeen Labs (e um aviso segue para o e-mail do estúdio). O campo
 * `site` fica escondido: pessoas não o veem, robôs costumam preenchê-lo e são descartados.
 */
const EMAIL_RESERVA = 'brg.ftw@gmail.com';

/** Se o servidor falhar, o pedido não se perde: o visitante pode mandá-lo pelo próprio e-mail. */
function emailDeReserva(dados: Record<string, string>): string {
  const corpo = [
    'Olá, Blajeen Labs!', '', 'Quero conversar sobre um projeto personalizado.',
    `Tipo de projeto: ${dados.tipo ?? ''}`, `Nome: ${dados.nome ?? ''}`, `E-mail: ${dados.email ?? ''}`, `Telefone: ${dados.telefone ?? ''}`,
    '', 'Ideia ou necessidade:', dados.ideia ?? '',
  ].join('\n');
  return `mailto:${EMAIL_RESERVA}?subject=${encodeURIComponent('Novo projeto personalizado — Blajeen Labs')}&body=${encodeURIComponent(corpo)}`;
}

export function CustomProjectForm({ ideiaInicial = '' }: { ideiaInicial?: string }) {
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'enviado'>('editando');
  const [erro, setErro] = useState('');
  const [reserva, setReserva] = useState('');

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(''); setReserva(''); setEstado('enviando');
    const dados = Object.fromEntries([...new FormData(evento.currentTarget).entries()].map(([k, v]) => [k, String(v)]));
    try {
      const resposta = await fetch('/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
      const retorno = await resposta.json().catch(() => ({})) as { error?: string };
      if (resposta.ok) { setEstado('enviado'); return; }
      // Erro de preenchimento: a pessoa corrige. Erro do servidor: oferece o e-mail como alternativa.
      if (resposta.status >= 500) setReserva(emailDeReserva(dados));
      setErro(retorno.error && resposta.status < 500 ? retorno.error : 'Não conseguimos registrar o pedido agora.');
    } catch {
      setReserva(emailDeReserva(dados));
      setErro('Não conseguimos registrar o pedido agora.');
    }
    setEstado('editando');
  }

  const campo =
    'mt-2 min-h-12 w-full rounded-2xl border border-line-strong bg-surface px-4 py-3 text-paper outline-none transition-colors placeholder:text-mineral-dim focus:border-[#55bfff]';

  return (
    <section id="comecar" aria-labelledby="comecar-titulo" className="scroll-mt-28 rounded-[var(--radius-panel)] border border-[#55bfff]/30 bg-raised/75 p-6 sm:p-8 lg:p-10">
      <p className="tecnica text-[#8bddff]">PRIMEIRO CONTATO</p>
      <h2 id="comecar-titulo" className="mt-5 max-w-[16ch] text-[clamp(2rem,4vw,3.6rem)] leading-[1] tracking-[-0.05em]">
        {estado === 'enviado' ? 'Pedido recebido. Obrigado!' : 'Conte o ponto de partida. O resto construímos juntos.'}
      </h2>

      {estado === 'enviado' ? (
        <div role="status" className="mt-6">
          <p className="medida-texto leading-relaxed text-mineral">
            Sua ideia chegou à Blajeen Labs. Vamos responder pelo e-mail ou pelo telefone que você informou para marcar uma conversa rápida.
          </p>
          <a href={ROTAS.trabalhos} className="alvo-toque tecnica mt-6 inline-flex items-center gap-3 rounded-full border border-[#8bddff] px-6 text-[#8bddff] transition-colors hover:bg-[#55bfff] hover:text-ink">
            Enquanto isso, veja projetos feitos <span aria-hidden="true">→</span>
          </a>
        </div>
      ) : (
        <>
          <p className="medida-texto mt-5 text-sm leading-relaxed text-mineral">
            São só cinco informações. Seu pedido chega direto à equipe da Blajeen Labs.
          </p>

          <form onSubmit={enviar} className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-mineral">
              O que você imagina?
              <select name="tipo" defaultValue="Ainda não sei" className={campo}>
                {TIPOS_DE_PROJETO.map((tipo) => <option key={tipo}>{tipo}</option>)}
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
              <textarea name="ideia" rows={5} required minLength={10} defaultValue={ideiaInicial} placeholder="Conte o que você quer colocar em prática, mesmo que ainda esteja no começo." className={campo} />
            </label>
            <div aria-hidden="true" className="hidden">
              <label>Não preencha este campo<input name="site" type="text" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={estado === 'enviando'} className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-[#8bddff] bg-[#55bfff] px-6 text-ink transition-colors duration-150 hover:bg-[#8bddff] disabled:opacity-60">
                {estado === 'enviando' ? 'Enviando…' : 'Enviar pedido'} <span aria-hidden="true">→</span>
              </button>
              {erro ? (
                <p role="alert" className="mt-4 text-sm text-red-300">
                  {erro}{reserva ? <> <a href={reserva} className="underline">Enviar pelo seu e-mail</a> — a mensagem abre pronta para {EMAIL_RESERVA}.</> : null}
                </p>
              ) : null}
              <p className="medida-texto mt-4 text-xs leading-relaxed text-mineral-dim">
                Usamos estes dados somente para responder ao seu pedido e preparar uma proposta, conforme a <a href={ROTAS.privacidade} className="underline">Política de Privacidade</a>.
              </p>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
