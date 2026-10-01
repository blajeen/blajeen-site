'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { formatarPreco, ROTA_DA_LOJA, rotaDoProduto, type FreteEscolhido } from '@/lib/loja/tipos';
import { ROTAS } from '@/lib/routes';
import { alterarQuantidade, esvaziarSacola, MAXIMO_POR_ITEM, removerDaSacola, useSacola, type ItemDaSacola } from './sacola';

const EMAIL_RESERVA = 'brg.ftw@gmail.com';
const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

/** Se o servidor falhar, o pedido não se perde: o visitante pode mandá-lo pelo próprio e-mail. */
function emailDeReserva(itens: ItemDaSacola[], dados: Record<string, string>): string {
  const corpo = [
    'Olá, Blajeen Labs! Quero fazer um pedido da loja.', '',
    ...itens.map((i) => `${i.quantidade} × ${i.nome}${i.opcaoRotulo ? ` (${i.opcaoRotulo})` : ''}`), '',
    `Nome: ${dados.nome ?? ''}`, `E-mail: ${dados.email ?? ''}`, `Telefone: ${dados.telefone ?? ''}`,
    dados.cep ? `CEP: ${dados.cep}` : '', dados.mensagem ? `\n${dados.mensagem}` : '',
  ].filter((linha) => linha !== '').join('\n');
  return `mailto:${EMAIL_RESERVA}?subject=${encodeURIComponent('Pedido da loja — Blajeen Labs')}&body=${encodeURIComponent(corpo)}`;
}

const campo =
  'mt-2 min-h-12 w-full rounded-2xl border border-line-strong bg-surface px-4 py-3 text-paper outline-none transition-colors placeholder:text-mineral-dim focus:border-signal';
const semAssinatura = () => () => {};
const digitos = (valor: string) => valor.replace(/\D/g, '');

type Props = {
  /** Asaas configurado: o pedido termina na página de pagamento. */
  pagamentoOnline: boolean;
  /** Melhor Envio configurado: o frete é cotado pelo CEP. */
  freteOnline: boolean;
};

export function PedidoLoja({ pagamentoOnline, freteOnline }: Props) {
  const { itens, quantidade, totalCentavos: subtotal } = useSacola();
  // A sacola mora no navegador: no servidor ela parece vazia. Até ler o navegador, nada de
  // "sacola vazia" piscando na tela.
  const noCliente = useSyncExternalStore(semAssinatura, () => true, () => false);
  const [estado, setEstado] = useState<'editando' | 'enviando' | 'pagando'>('editando');
  const [numero, setNumero] = useState('');
  const [erro, setErro] = useState('');
  const [reserva, setReserva] = useState('');
  const [cep, setCep] = useState('');
  const [cotacao, setCotacao] = useState<{ chave: string; opcoes: FreteEscolhido[] } | null>(null);
  const [cotando, setCotando] = useState(false);
  const [erroDoFrete, setErroDoFrete] = useState('');
  const [freteId, setFreteId] = useState<number | null>(null);

  const precisaEnvio = itens.some((i) => !i.digital);
  // A cotação vale para esta sacola e este CEP: mudou um ou outro, ela some e o frete é cotado de novo.
  const chave = `${digitos(cep)}|${itens.map((i) => `${i.produtoId}:${i.opcaoId}:${i.quantidade}`).join(',')}`;
  const opcoesDeFrete = cotacao?.chave === chave ? cotacao.opcoes : null;
  const frete = opcoesDeFrete?.find((o) => o.servicoId === freteId) ?? null;
  const cobraFrete = precisaEnvio && freteOnline;
  const vaiPagar = pagamentoOnline && (!precisaEnvio || freteOnline);
  const total = subtotal + (frete?.precoCentavos ?? 0);

  async function cotar() {
    setErroDoFrete(''); setFreteId(null);
    if (digitos(cep).length !== 8) { setErroDoFrete('Informe um CEP com 8 números.'); return; }
    setCotando(true);
    try {
      const resposta = await fetch('/api/loja/frete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep, itens: itens.map(({ produtoId, opcaoId, quantidade: q }) => ({ produtoId, opcaoId, quantidade: q })) }),
      });
      const dados = await resposta.json().catch(() => ({})) as { opcoes?: FreteEscolhido[]; error?: string };
      if (!resposta.ok) throw new Error(dados.error ?? 'Não conseguimos calcular o frete agora.');
      setCotacao({ chave, opcoes: dados.opcoes ?? [] });
      setFreteId(dados.opcoes?.[0]?.servicoId ?? null);
    } catch (e) {
      setErroDoFrete(e instanceof Error ? e.message : 'Não conseguimos calcular o frete agora.');
    }
    setCotando(false);
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(''); setReserva('');
    if (cobraFrete && !frete) { setErro('Calcule e escolha uma opção de frete.'); return; }
    setEstado('enviando');
    const dados = Object.fromEntries([...new FormData(evento.currentTarget).entries()].map(([k, v]) => [k, String(v)]));
    const corpo = {
      nome: dados.nome, email: dados.email, telefone: dados.telefone, cpfCnpj: dados.cpfCnpj, mensagem: dados.mensagem, site: dados.site,
      endereco: precisaEnvio ? {
        cep, logradouro: dados.logradouro, numero: dados.numero, complemento: dados.complemento,
        bairro: dados.bairro, cidade: dados.cidade, uf: dados.uf,
      } : null,
      freteServicoId: frete?.servicoId ?? null,
      itens: itens.map(({ produtoId, opcaoId, quantidade: q }) => ({ produtoId, opcaoId, quantidade: q })),
    };
    try {
      const resposta = await fetch('/api/loja/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
      const retorno = await resposta.json().catch(() => ({})) as { error?: string; numero?: string; pagamentoUrl?: string };
      if (resposta.ok && retorno.pagamentoUrl) {
        // A sacola só é esvaziada na volta do pagamento (`/loja/pedido/obrigado`): quem desistir no
        // meio do caminho encontra os itens onde deixou.
        setEstado('pagando');
        window.location.assign(retorno.pagamentoUrl);
        return;
      }
      if (resposta.ok) {
        setNumero(retorno.numero ?? 'recebido');
        esvaziarSacola();
        setEstado('editando');
        return;
      }
      if (resposta.status >= 500 && resposta.status !== 502) setReserva(emailDeReserva(itens, { ...dados, cep }));
      setErro(retorno.error && (resposta.status < 500 || resposta.status === 502) ? retorno.error : 'Não conseguimos registrar o pedido agora.');
    } catch {
      setReserva(emailDeReserva(itens, { ...dados, cep }));
      setErro('Não conseguimos registrar o pedido agora.');
    }
    setEstado('editando');
  }

  if (numero) {
    return (
      <section role="status" aria-labelledby="pedido-feito" className="rounded-[var(--radius-panel)] border border-signal/40 bg-raised/75 p-7 sm:p-10">
        <p className="tecnica text-signal">PEDIDO {numero}</p>
        <h2 id="pedido-feito" className="mt-5 max-w-[18ch] text-[clamp(2rem,4vw,3.4rem)] leading-[1] tracking-[-0.05em]">Pedido recebido. Obrigado!</h2>
        <p className="medida-texto mt-5 leading-relaxed text-mineral">
          Vamos falar com você pelo WhatsApp ou pelo e-mail que você informou, para combinar frete e pagamento. Nada foi
          cobrado. Se quiser falar do pedido, cite o número {numero}.
        </p>
        <Link href={ROTA_DA_LOJA} className="alvo-toque tecnica mt-7 inline-flex items-center gap-3 rounded-full border border-signal px-6 text-signal transition-colors hover:bg-signal hover:text-ink">
          Voltar aos exclusivos <span aria-hidden="true">→</span>
        </Link>
      </section>
    );
  }

  if (!noCliente) {
    return <p className="rounded-[var(--radius-panel)] border border-line p-7 text-mineral">Abrindo a sacola…</p>;
  }

  if (!itens.length) {
    return (
      <section aria-labelledby="sacola-vazia" className="rounded-[var(--radius-panel)] border border-line bg-raised/60 p-7 sm:p-10">
        <h2 id="sacola-vazia" className="text-[clamp(1.8rem,3.4vw,2.6rem)] leading-tight tracking-[-0.04em]">Sua sacola está vazia.</h2>
        <p className="mt-3 text-mineral">Escolha um exclusivo e ele aparece aqui.</p>
        <Link href={ROTA_DA_LOJA} className="alvo-toque tecnica mt-7 inline-flex items-center gap-3 rounded-full bg-signal px-6 text-ink hover:bg-glow">
          Ver os exclusivos <span aria-hidden="true">→</span>
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={enviar} className="grid gap-8 lg:grid-cols-12 lg:items-start">
      <section aria-labelledby="itens-titulo" className="rounded-[var(--radius-panel)] border border-line bg-raised/60 p-6 sm:p-8 lg:sticky lg:top-24 lg:col-span-5">
        <h2 id="itens-titulo" className="tecnica text-mineral-dim">NA SACOLA · {quantidade} {quantidade === 1 ? 'ITEM' : 'ITENS'}</h2>
        <ul className="mt-5 divide-y divide-line">
          {itens.map((item) => (
            <li key={`${item.produtoId}:${item.opcaoId}`} className="flex gap-4 py-5 first:pt-0">
              <Link href={rotaDoProduto(item.slug)} tabIndex={-1} aria-hidden="true"
                className="relative size-20 flex-none overflow-hidden rounded-[var(--radius-control)] border border-line bg-surface">
                {item.imagem ? <Image src={item.imagem} alt="" fill sizes="80px" className="object-cover" /> : null}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                  <div>
                    <Link href={rotaDoProduto(item.slug)} className="text-lg leading-tight hover:text-signal">{item.nome}</Link>
                    {item.opcaoRotulo ? <p className="mt-1 text-sm text-mineral">{item.opcaoRotulo}</p> : null}
                  </div>
                  <p className="tabular-nums">{formatarPreco(item.precoCentavos * item.quantidade)}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div role="group" aria-label={`Quantidade de ${item.nome}`} className="inline-flex items-center rounded-full border border-line-strong">
                    <button type="button" aria-label="Diminuir quantidade" disabled={item.quantidade <= 1}
                      onClick={() => alterarQuantidade(item, item.quantidade - 1)} className="alvo-toque grid place-items-center rounded-full disabled:opacity-40">−</button>
                    <output aria-live="polite" className="min-w-7 text-center text-sm tabular-nums">{item.quantidade}</output>
                    <button type="button" aria-label="Aumentar quantidade" disabled={item.quantidade >= MAXIMO_POR_ITEM}
                      onClick={() => alterarQuantidade(item, item.quantidade + 1)} className="alvo-toque grid place-items-center rounded-full disabled:opacity-40">+</button>
                  </div>
                  <button type="button" onClick={() => removerDaSacola(item)} className="alvo-toque px-2 text-sm text-mineral underline-offset-4 hover:text-paper hover:underline">
                    Remover
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-2 grid gap-2 border-t border-line pt-5 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-mineral">Itens</dt><dd className="tabular-nums">{formatarPreco(subtotal)}</dd></div>
          {precisaEnvio ? (
            <div className="flex justify-between gap-4">
              <dt className="text-mineral">Frete</dt>
              <dd className="tabular-nums">{frete ? formatarPreco(frete.precoCentavos) : cobraFrete ? 'calcule pelo CEP' : 'a combinar'}</dd>
            </div>
          ) : null}
          <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-4">
            <dt className="text-base">Total</dt>
            <dd className="text-2xl tabular-nums">{formatarPreco(total)}</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-8 lg:col-span-7">
        {precisaEnvio ? (
          <section aria-labelledby="entrega-titulo" className="rounded-[var(--radius-panel)] border border-line bg-raised/60 p-6 sm:p-8">
            <p className="tecnica text-signal">01 · ENTREGA</p>
            <h2 id="entrega-titulo" className="mt-4 text-[clamp(1.6rem,3vw,2.2rem)] leading-tight tracking-[-0.04em]">Para onde vai?</h2>
            <div className="mt-6 flex flex-wrap items-end gap-3">
              <label className="text-sm text-mineral">
                CEP
                <input name="cep" value={cep} onChange={(e) => setCep(e.target.value)} inputMode="numeric" autoComplete="postal-code"
                  required placeholder="00000-000" className={`${campo} w-44`} />
              </label>
              {cobraFrete ? (
                <button type="button" onClick={() => void cotar()} disabled={cotando}
                  className="alvo-toque tecnica inline-flex items-center rounded-full border border-line-strong px-5 text-paper hover:border-signal disabled:opacity-60">
                  {cotando ? 'Calculando…' : opcoesDeFrete ? 'Calcular de novo' : 'Calcular frete'}
                </button>
              ) : null}
            </div>
            {cobraFrete ? (
              <div aria-live="polite">
                {erroDoFrete ? <p role="alert" className="mt-3 text-sm text-red-300">{erroDoFrete}</p> : null}
                {opcoesDeFrete?.length ? (
                  <fieldset className="mt-5">
                    <legend className="tecnica text-mineral-dim">OPÇÕES DE FRETE</legend>
                    <div className="mt-3 grid gap-2">
                      {opcoesDeFrete.map((o) => (
                        <label key={o.servicoId} className="flex cursor-pointer items-center gap-4 rounded-2xl border border-line-strong p-4 transition-colors has-[:checked]:border-signal has-[:checked]:bg-signal/5">
                          <input type="radio" name="frete" checked={freteId === o.servicoId} onChange={() => setFreteId(o.servicoId)} className="size-4 accent-[var(--color-signal)]" />
                          <span className="flex-1">
                            <span className="block">{o.servico}{o.transportadora ? <span className="text-mineral"> · {o.transportadora}</span> : null}</span>
                            <span className="text-sm text-mineral">até {o.prazoDias} {o.prazoDias === 1 ? 'dia útil' : 'dias úteis'}</span>
                          </span>
                          <span className="tabular-nums">{formatarPreco(o.precoCentavos)}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-mineral">O frete é combinado com você depois do pedido.</p>
            )}
            <div className="mt-6 grid gap-5 sm:grid-cols-6">
              <label className="text-sm text-mineral sm:col-span-4">Rua<input name="logradouro" autoComplete="address-line1" required className={campo} /></label>
              <label className="text-sm text-mineral sm:col-span-2">Número<input name="numero" required placeholder="ou s/n" className={campo} /></label>
              <label className="text-sm text-mineral sm:col-span-3">Complemento (opcional)<input name="complemento" autoComplete="address-line2" className={campo} /></label>
              <label className="text-sm text-mineral sm:col-span-3">Bairro<input name="bairro" required className={campo} /></label>
              <label className="text-sm text-mineral sm:col-span-4">Cidade<input name="cidade" autoComplete="address-level2" required className={campo} /></label>
              <label className="text-sm text-mineral sm:col-span-2">Estado
                <select name="uf" required defaultValue="" autoComplete="address-level1" className={campo}>
                  <option value="" disabled>UF</option>
                  {UFS.map((uf) => <option key={uf}>{uf}</option>)}
                </select>
              </label>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="contato-titulo" className="rounded-[var(--radius-panel)] border border-signal/30 bg-raised/75 p-6 sm:p-8">
          <p className="tecnica text-signal">{precisaEnvio ? '02' : '01'} · SEUS DADOS</p>
          <h2 id="contato-titulo" className="mt-4 text-[clamp(1.6rem,3vw,2.2rem)] leading-tight tracking-[-0.04em]">
            {vaiPagar ? 'Quem está comprando?' : 'Deixe seu contato. A gente confirma com você.'}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-mineral sm:col-span-2">Nome completo<input name="nome" autoComplete="name" required className={campo} /></label>
            <label className="text-sm text-mineral">E-mail<input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" className={campo} /></label>
            <label className="text-sm text-mineral">WhatsApp ou telefone<input name="telefone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="(00) 00000-0000" className={campo} /></label>
            {vaiPagar ? (
              <label className="text-sm text-mineral sm:col-span-2">
                CPF (ou CNPJ)
                <input name="cpfCnpj" inputMode="numeric" required placeholder="000.000.000-00" className={campo} />
                <span className="mt-2 block text-xs text-mineral-dim">O Asaas, que processa o pagamento, exige o documento de quem paga.</span>
              </label>
            ) : null}
            <label className="text-sm text-mineral sm:col-span-2">
              Quer contar algo? (opcional)
              <textarea name="mensagem" rows={3} maxLength={1500} placeholder="Ex.: é presente, preciso até tal data…" className={campo} />
            </label>
            <div aria-hidden="true" className="hidden">
              <label>Não preencha este campo<input name="site" type="text" tabIndex={-1} autoComplete="off" /></label>
            </div>
          </div>
          <div className="mt-7">
            <button type="submit" disabled={estado !== 'editando'}
              className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full bg-signal px-6 text-ink transition-colors hover:bg-glow disabled:opacity-60">
              {estado === 'pagando' ? 'Abrindo o pagamento…' : estado === 'enviando' ? 'Enviando…' : vaiPagar ? `Ir para o pagamento · ${formatarPreco(total)}` : 'Fazer o pedido'}
              <span aria-hidden="true">→</span>
            </button>
            {vaiPagar ? (
              <p className="mt-3 text-sm text-mineral">Você paga com Pix, cartão ou boleto na página segura do Asaas.</p>
            ) : (
              <p className="mt-3 text-sm text-mineral">Nenhum pagamento é feito aqui.</p>
            )}
            {erro ? (
              <p role="alert" className="mt-4 text-sm text-red-300">
                {erro}{reserva ? <> <a href={reserva} className="underline">Enviar pelo seu e-mail</a> — a mensagem abre pronta para {EMAIL_RESERVA}.</> : null}
              </p>
            ) : null}
            <p className="medida-texto mt-4 text-xs leading-relaxed text-mineral-dim">
              Usamos estes dados para processar e entregar o seu pedido, conforme a <a href={ROTAS.privacidade} className="underline">Política
              de Privacidade</a> e os <a href={ROTAS.termos} className="underline">Termos</a>.
            </p>
          </div>
        </section>
      </div>
    </form>
  );
}
