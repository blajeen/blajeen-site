'use client';

import { useState, type FormEvent } from 'react';

export type ResumoParaCliente = {
  numero: string;
  servico: string;
  projeto: string;
  plano: string;
  valor: string;
  pagamento: string;
  parcelamento: string;
  prazo: string;
  combinado: string;
  contratada: string;
  expiraEm: string;
  jaEnviado: boolean;
  /** Dados que a Blajeen já tinha (por exemplo, do pedido): o cliente só confere. */
  iniciais: Partial<Record<'contratante_nome' | 'contratante_doc' | 'contratante_endereco' | 'contratante_email' | 'contratante_tel' | 'contratante_repr', string>>;
};

const campo = 'mt-2 min-h-12 w-full rounded-2xl border border-line-strong bg-surface px-4 py-3 text-paper outline-none transition-colors placeholder:text-mineral-dim focus:border-signal';

export function ContratoCliente({ token, resumo }: { token: string; resumo: ResumoParaCliente }) {
  const [enviado, setEnviado] = useState(resumo.jaEnviado);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [documento, setDocumento] = useState(resumo.iniciais.contratante_doc ?? '');
  const linkDocumento = `/contrato/${token}/documento`;
  const ehCnpj = documento.replace(/\D/g, '').length > 11;

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); setErro(''); setEnviando(true);
    const dados = new FormData(evento.currentTarget);
    const corpo = Object.fromEntries([...dados.entries()].map(([k, v]) => [k, String(v)]));
    const resposta = await fetch(`/api/contrato/${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
    const retorno = await resposta.json() as { error?: string };
    setEnviando(false);
    if (!resposta.ok) { setErro(retorno.error ?? 'Não foi possível enviar. Tente novamente.'); return; }
    setEnviado(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const linhas: Array<[string, string]> = [
    ['Serviço', resumo.servico], ['Projeto', resumo.projeto], ['Plano', resumo.plano],
    ['Investimento', resumo.valor ? `R$ ${resumo.valor}` : 'a definir'], ['Pagamento', resumo.pagamento],
    ['Parcelamento', resumo.parcelamento], ['Prazo estimado', resumo.prazo],
  ];

  return (
    <div className="mx-auto w-full max-w-[72rem] px-[var(--gutter)] py-14">
      <p className="tecnica text-signal">CONTRATO Nº {resumo.numero}</p>
      <h1 className="mt-5 max-w-[18ch] text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.98] tracking-[-0.05em]">
        {enviado ? 'Recebemos seus dados.' : 'Seu projeto com a Blajeen Labs.'}
      </h1>
      <p className="medida-texto mt-5 text-mineral">
        {enviado
          ? 'Obrigado! Agora preparamos a versão final e enviamos o contrato para assinatura eletrônica no seu e-mail. Se precisar corrigir algo, fale com a gente.'
          : 'Confira o resumo do que combinamos, leia o contrato completo e preencha seus dados. Leva menos de 3 minutos.'}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section aria-labelledby="resumo-titulo" className="self-start rounded-[var(--radius-panel)] border border-line-strong bg-raised/75 p-6 sm:p-8">
          <h2 id="resumo-titulo" className="text-2xl">O que combinamos</h2>
          <dl className="mt-5 divide-y divide-line text-sm">
            {linhas.filter(([, v]) => v).map(([rotulo, valor]) => (
              <div key={rotulo} className="grid grid-cols-[8.5rem_1fr] gap-3 py-3"><dt className="tecnica text-mineral-dim">{rotulo}</dt><dd className="text-paper">{valor}</dd></div>
            ))}
          </dl>
          {resumo.combinado ? (
            <div className="mt-5 rounded-2xl border-l-4 border-signal bg-surface p-4">
              <p className="tecnica text-mineral-dim">NAS NOSSAS PALAVRAS</p>
              <p className="mt-2 whitespace-pre-line leading-relaxed">{resumo.combinado}</p>
            </div>
          ) : null}
          <a href={linkDocumento} target="_blank" rel="noreferrer" className="alvo-toque tecnica mt-6 inline-flex items-center gap-2 rounded-full border border-signal px-5 text-signal hover:bg-signal hover:text-ink">
            {enviado ? 'VER CONTRATO PREENCHIDO' : 'LER O CONTRATO COMPLETO'} ↗
          </a>
          <ul className="mt-6 space-y-2 text-sm text-mineral">
            <li>→ 7 dias de garantia: se desistir, devolvemos 100% do valor pago.</li>
            <li>→ Você aprova cada etapa antes de seguirmos.</li>
            <li>→ Assinatura eletrônica com validade jurídica.</li>
          </ul>
        </section>

        {enviado ? (
          <section aria-labelledby="proximos-titulo" className="rounded-[var(--radius-panel)] border border-signal/40 bg-surface p-6 sm:p-8">
            <h2 id="proximos-titulo" className="text-2xl">Próximos passos</h2>
            <ol className="mt-5 space-y-4">
              {['Você recebe o contrato para assinatura eletrônica por e-mail.', 'Assinado o contrato, enviamos os dados para o pagamento da entrada (50%).', 'Com a entrada confirmada, marcamos a reunião de partida e começamos.'].map((texto, i) => (
                <li key={texto} className="flex gap-4"><span className="tecnica text-signal">{String(i + 1).padStart(2, '0')}</span><span>{texto}</span></li>
              ))}
            </ol>
          </section>
        ) : (
          <section aria-labelledby="dados-titulo" className="rounded-[var(--radius-panel)] border border-line-strong bg-surface p-6 sm:p-8">
            <h2 id="dados-titulo" className="text-2xl">Seus dados para o contrato</h2>
            <p className="mt-2 text-sm text-mineral">Use os dados de quem vai assinar: pessoa física (CPF) ou empresa (CNPJ).</p>
            <form onSubmit={enviar} className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm text-mineral sm:col-span-2">Nome completo ou razão social
                <input name="contratante_nome" required autoComplete="name" defaultValue={resumo.iniciais.contratante_nome} className={campo} />
              </label>
              <label className="text-sm text-mineral">CPF ou CNPJ
                <input name="contratante_doc" required inputMode="numeric" value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="000.000.000-00" className={campo} />
              </label>
              <label className="text-sm text-mineral">Telefone com DDD
                <input name="contratante_tel" required type="tel" inputMode="tel" autoComplete="tel" defaultValue={resumo.iniciais.contratante_tel} placeholder="(00) 00000-0000" className={campo} />
              </label>
              <label className="text-sm text-mineral sm:col-span-2">E-mail (é para ele que enviaremos o contrato para assinar)
                <input name="contratante_email" required type="email" autoComplete="email" defaultValue={resumo.iniciais.contratante_email} className={campo} />
              </label>
              <label className="text-sm text-mineral sm:col-span-2">Endereço completo com CEP
                <input name="contratante_endereco" required autoComplete="street-address" defaultValue={resumo.iniciais.contratante_endereco} placeholder="Rua, número, bairro, cidade/UF, CEP" className={campo} />
              </label>
              {ehCnpj ? (
                <label className="text-sm text-mineral sm:col-span-2">Representante legal (nome e CPF)
                  <input name="contratante_repr" required defaultValue={resumo.iniciais.contratante_repr} placeholder="Quem assina pela empresa" className={campo} />
                </label>
              ) : null}
              <fieldset className="grid gap-3 sm:col-span-2">
                <legend className="text-sm text-mineral">Portfólio (opcional)</legend>
                <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="port_sim" className="mt-1 h-5 w-5 accent-[#c9ff3d]" />Autorizo a Blajeen Labs a mostrar o projeto no portfólio, sem informações confidenciais.</label>
                <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="cred_sim" className="mt-1 h-5 w-5 accent-[#c9ff3d]" />Autorizo o crédito discreto “Desenvolvido por Blajeen Labs”.</label>
              </fieldset>
              <label className="flex items-start gap-3 rounded-2xl border border-line-strong p-4 text-sm sm:col-span-2">
                <input type="checkbox" name="aceite" required className="mt-1 h-5 w-5 accent-[#c9ff3d]" />
                <span>Li o <a href={linkDocumento} target="_blank" rel="noreferrer" className="text-signal underline">contrato completo</a> e concordo com os termos. A assinatura oficial acontece depois, por assinatura eletrônica.</span>
              </label>
              <div className="sm:col-span-2">
                <button type="submit" disabled={enviando} className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-6 text-ink transition-colors hover:bg-glow disabled:opacity-50">
                  {enviando ? 'ENVIANDO…' : 'ENVIAR MEUS DADOS'} <span aria-hidden="true">→</span>
                </button>
                {erro ? <p role="alert" className="mt-4 text-sm text-red-300">{erro}</p> : null}
                <p className="medida-texto mt-4 text-xs leading-relaxed text-mineral-dim">
                  Seus dados são usados somente para formalizar e executar este contrato, conforme a <a href="/privacy" className="underline">Política de Privacidade</a>. Contratada: {resumo.contratada}. Link válido até {new Date(resumo.expiraEm).toLocaleDateString('pt-BR')}.
                </p>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
