'use client';

import type { FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';

const EMAIL_DESTINO = 'brg.ftw@gmail.com';

const produtos = {
  barbearia: 'Barbelio',
  'personal-studio': 'Studelio',
  'salao-estetica': 'Beautelio',
  ecommerce: 'Lojalio',
  'clinica-medica': 'Doutelio',
  'projeto-personalizado': 'Projeto personalizado',
  outro: 'Outro projeto',
} as const;

type ProdutoId = keyof typeof produtos;

function produtoValido(valor: string | null): ProdutoId {
  return valor && valor in produtos ? (valor as ProdutoId) : 'outro';
}

export function InterestForm() {
  const searchParams = useSearchParams();
  const produtoInicial = produtoValido(searchParams.get('produto'));

  function prepararEmail(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const produto = produtoValido(String(dados.get('produto')));
    const assunto = `Interesse — ${produtos[produto]}`;
    const corpo = [
      'Olá, Blajeen Labs!',
      '',
      `Tenho interesse em: ${produtos[produto]}`,
      `Nome: ${String(dados.get('nome')).trim()}`,
      `E-mail: ${String(dados.get('email')).trim()}`,
      `Telefone: ${String(dados.get('telefone')).trim()}`,
      'Garantia informada: 7 dias para cancelamento e solicitação de devolução do valor pago.',
      '',
      'Mensagem:',
      String(dados.get('mensagem')).trim() || 'Gostaria de conversar sobre este projeto.',
    ].join('\n');

    window.location.href = `mailto:${EMAIL_DESTINO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  }

  const campo =
    'mt-2 min-h-12 w-full rounded-2xl border border-line-strong bg-surface px-4 py-3 text-paper outline-none transition-colors placeholder:text-mineral-dim focus:border-signal';

  return (
    <section
      id="interesse"
      aria-labelledby="interesse-titulo"
      className="mt-14 scroll-mt-28 rounded-[var(--radius-panel)] border border-line-strong bg-raised/70 p-6 sm:p-8"
    >
      <p className="tecnica text-signal">INTERESSE EM UM PROJETO</p>
      <h2
        id="interesse-titulo"
        className="mt-5 max-w-[18ch] text-[clamp(1.8rem,4vw,3rem)] leading-[1.03] tracking-[-0.045em]"
      >
        Conte como podemos falar com você.
      </h2>
      <p className="medida-texto mt-4 max-w-[68ch] text-sm leading-relaxed text-mineral">
        Ao continuar, seu aplicativo de e-mail abrirá com a mensagem pronta para{' '}
        <span className="text-paper">{EMAIL_DESTINO}</span>. Revise os dados e confirme o envio por lá.
      </p>
      <p className="medida-texto mt-4 max-w-[68ch] border-l border-signal pl-4 text-sm leading-relaxed text-mineral">
        Projetos comerciais incluem <strong className="text-paper">7 dias de garantia</strong>. Nesse
        prazo, você pode cancelar a contratação e solicitar a devolução do valor pago.
      </p>

      <form onSubmit={prepararEmail} className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="text-sm text-mineral">
          Projeto de interesse
          <select name="produto" defaultValue={produtoInicial} className={campo}>
            {Object.entries(produtos).map(([id, rotulo]) => (
              <option key={id} value={id}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-mineral">
          Nome
          <input
            name="nome"
            type="text"
            autoComplete="name"
            required
            placeholder="Como devemos chamar você?"
            className={campo}
          />
        </label>

        <label className="text-sm text-mineral">
          E-mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@exemplo.com"
            className={campo}
          />
        </label>

        <label className="text-sm text-mineral">
          Telefone de contato
          <input
            name="telefone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="(00) 00000-0000"
            className={campo}
          />
        </label>

        <label className="text-sm text-mineral sm:col-span-2">
          Mensagem <span className="text-mineral-dim">(opcional)</span>
          <textarea
            name="mensagem"
            rows={5}
            placeholder="Conte um pouco sobre seu negócio e o que você procura."
            className={campo}
          />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-5 text-ink transition-colors duration-150 hover:bg-signal-pale"
          >
            Preparar e-mail de interesse
            <span aria-hidden="true">→</span>
          </button>
          <p className="medida-texto mt-4 max-w-[66ch] text-xs leading-relaxed text-mineral-dim">
            O formulário não envia nem armazena seus dados no site. O envio só acontece quando você
            confirma a mensagem no seu aplicativo de e-mail.
          </p>
        </div>
      </form>
    </section>
  );
}
