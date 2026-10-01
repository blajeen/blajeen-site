'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatarPreco, PEDIDO_LOJA_ROTULO, PEDIDO_LOJA_STATUS, type PedidoLoja, type PedidoLojaStatus } from '@/lib/loja/tipos';
import { botaoSecundario, campoAdmin, painelAdmin } from './estilos';

function whatsapp(telefone: string, texto: string): string {
  const digitos = telefone.replace(/\D/g, '');
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function mensagem(pedido: PedidoLoja): string {
  const primeiro = pedido.nome.split(' ')[0];
  if (pedido.status === 'PAGO') return `Olá, ${primeiro}! Aqui é da Blajeen Labs. Recebemos o pagamento do pedido ${pedido.numero} e já estamos preparando. Te aviso quando for postado!`;
  if (pedido.status === 'AGUARDANDO_PAGAMENTO') return `Olá, ${primeiro}! Aqui é da Blajeen Labs. Vi que o pedido ${pedido.numero} ainda está aguardando pagamento. Posso ajudar em alguma coisa?`;
  return `Olá, ${primeiro}! Aqui é da Blajeen Labs. Recebi seu pedido ${pedido.numero} da loja. Vamos combinar o frete e o pagamento?`;
}

/** Rótulos do estado da cobrança, como o Asaas informa. */
const STATUS_DO_ASAAS: Record<string, string> = {
  PENDING: 'Aguardando', RECEIVED: 'Recebido', CONFIRMED: 'Confirmado', OVERDUE: 'Vencido', REFUNDED: 'Estornado',
  RECEIVED_IN_CASH: 'Recebido em dinheiro', REFUND_REQUESTED: 'Estorno pedido', CHARGEBACK_REQUESTED: 'Contestação aberta',
};

const corDoStatus: Record<PedidoLojaStatus, string> = {
  AGUARDANDO_PAGAMENTO: 'border-line-strong text-paper', PAGO: 'border-signal text-signal', NOVO: 'border-signal text-signal',
  EM_CONTATO: 'border-line-strong text-paper', ENVIADO: 'border-signal/50 text-mineral', CANCELADO: 'border-line text-mineral-dim',
  ESTORNADO: 'border-line text-mineral-dim',
};

export function AdminLojaPedidos({ idInicial }: { idInicial?: string | undefined }) {
  const router = useRouter();
  const [itens, setItens] = useState<PedidoLoja[]>([]);
  const [filtro, setFiltro] = useState<PedidoLojaStatus | 'TODOS'>('TODOS');
  const [selecionado, setSelecionado] = useState<string | null>(idInicial ?? null);
  const [notas, setNotas] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const resposta = await fetch('/api/admin/loja/pedidos', { cache: 'no-store' });
    if (resposta.status === 401) { router.push('/admin/login'); return; }
    const dados = await resposta.json() as { itens?: PedidoLoja[]; error?: string };
    if (!resposta.ok) throw new Error(dados.error ?? 'Não foi possível carregar os pedidos.');
    setItens(dados.itens ?? []);
    setCarregando(false);
  }, [router]);

  useEffect(() => {
    // A carga assíncrona atualiza o estado somente quando a resposta chega.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar().catch((e: unknown) => { setErro(e instanceof Error ? e.message : 'Falha ao carregar.'); setCarregando(false); });
  }, [carregar]);

  const pedido = useMemo(() => itens.find((p) => p.id === selecionado) ?? null, [itens, selecionado]);
  const visiveis = itens.filter((p) => filtro === 'TODOS' || p.status === filtro);

  useEffect(() => {
    // Sincroniza as anotações quando o pedido aberto pela URL termina de carregar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pedido) setNotas(pedido.notas);
  }, [pedido]);

  async function alterar(id: string, corpo: { status?: PedidoLojaStatus; notas?: string }, ok: string) {
    setErro(''); setAviso('');
    const resposta = await fetch(`/api/admin/loja/pedidos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
    const dados = await resposta.json() as { error?: string };
    if (!resposta.ok) { setErro(dados.error ?? 'Não foi possível salvar.'); return; }
    setAviso(ok); await carregar();
  }

  async function excluir(p: PedidoLoja) {
    if (!window.confirm(`Excluir o pedido ${p.numero} de ${p.nome}? Esta ação não pode ser desfeita.`)) return;
    const resposta = await fetch(`/api/admin/loja/pedidos/${p.id}`, { method: 'DELETE' });
    if (!resposta.ok) { setErro('Não foi possível excluir.'); return; }
    setSelecionado(null); await carregar();
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section aria-labelledby="lista-pedidos-loja" className={painelAdmin}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="lista-pedidos-loja" className="text-2xl">Pedidos da loja</h2>
          <label className="flex items-center gap-2 text-sm text-mineral">Mostrar
            <select value={filtro} onChange={(e) => setFiltro(e.target.value as PedidoLojaStatus | 'TODOS')} className={`${campoAdmin} w-auto`}>
              <option value="TODOS">Todos</option>
              {PEDIDO_LOJA_STATUS.map((s) => <option key={s} value={s}>{PEDIDO_LOJA_ROTULO[s]}</option>)}
            </select>
          </label>
        </div>
        {carregando ? <p className="mt-6 text-mineral">Carregando…</p> : visiveis.length ? (
          <ul className="mt-5 space-y-2">
            {visiveis.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => { setSelecionado(p.id); setNotas(p.notas); setErro(''); setAviso(''); }}
                  aria-current={p.id === selecionado ? 'true' : undefined}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${p.id === selecionado ? 'border-signal bg-raised' : 'border-line-strong hover:border-mineral-dim'}`}>
                  <span className="flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-base">{p.nome}</span>
                      <span className="mt-1 block text-sm text-mineral">{p.numero} · {formatarPreco(p.totalCentavos)} · {new Date(p.criadoEm).toLocaleDateString('pt-BR')}</span>
                    </span>
                    <span className={`tecnica flex-none rounded-full border px-3 py-1 ${corDoStatus[p.status]}`}>{PEDIDO_LOJA_ROTULO[p.status]}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="mt-6 rounded-2xl border border-line p-6 text-mineral">Nenhum pedido {filtro === 'TODOS' ? 'ainda' : 'nesta situação'}. Os pedidos feitos em /loja aparecem aqui.</p>}
      </section>

      <section aria-labelledby="detalhe-pedido-loja" className={painelAdmin}>
        {pedido ? (
          <>
            <p className="tecnica text-signal">PEDIDO {pedido.numero} · {new Date(pedido.criadoEm).toLocaleString('pt-BR')}</p>
            <h2 id="detalhe-pedido-loja" className="mt-3 text-3xl leading-tight">{pedido.nome}</h2>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="tecnica text-mineral-dim">E-MAIL</dt><dd className="mt-1 break-all">{pedido.email}</dd></div>
              <div><dt className="tecnica text-mineral-dim">TELEFONE</dt><dd className="mt-1">{pedido.telefone}</dd></div>
              {pedido.cpfCnpj ? <div><dt className="tecnica text-mineral-dim">CPF / CNPJ</dt><dd className="mt-1">{pedido.cpfCnpj}</dd></div> : null}
              <div>
                <dt className="tecnica text-mineral-dim">PAGAMENTO</dt>
                <dd className="mt-1">
                  {pedido.pagamento
                    ? <>{STATUS_DO_ASAAS[pedido.pagamento.status] ?? pedido.pagamento.status} no Asaas{pedido.pagamento.url ? <> · <a href={pedido.pagamento.url} target="_blank" rel="noreferrer" className="underline">ver cobrança ↗</a></> : null}</>
                    : 'Sem cobrança online'}
                </dd>
              </div>
            </dl>

            <div className="mt-6 rounded-2xl border border-line">
              <ul className="divide-y divide-line">
                {pedido.itens.map((i) => (
                  <li key={`${i.produtoId}:${i.opcaoId}`} className="flex justify-between gap-4 p-4 text-sm">
                    <span>{i.quantidade} × <a href={`/loja/${i.slug}`} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">{i.nome}</a>
                      {i.opcaoRotulo ? <span className="text-mineral"> · {i.opcaoRotulo}</span> : null}{i.digital ? <span className="text-mineral"> · digital</span> : null}</span>
                    <span className="tabular-nums">{formatarPreco(i.precoCentavos * i.quantidade)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-4 p-4 text-sm">
                  <span className="text-mineral">Frete{pedido.frete ? ` · ${pedido.frete.servico} ${pedido.frete.transportadora}, até ${pedido.frete.prazoDias} dias úteis` : ''}</span>
                  <span className="tabular-nums">{pedido.frete ? formatarPreco(pedido.frete.precoCentavos) : pedido.endereco ? 'a combinar' : '—'}</span>
                </li>
                <li className="flex justify-between gap-4 p-4"><span>Total</span><span className="text-lg tabular-nums">{formatarPreco(pedido.totalCentavos)}</span></li>
              </ul>
            </div>

            {pedido.endereco ? (
              <div className="mt-5 rounded-2xl border-l-4 border-signal bg-raised p-4 text-sm leading-relaxed">
                <p className="tecnica text-mineral-dim">ENTREGA</p>
                <p className="mt-2">{pedido.endereco.logradouro}, {pedido.endereco.numero}{pedido.endereco.complemento ? ` — ${pedido.endereco.complemento}` : ''}<br />
                  {pedido.endereco.bairro} · {pedido.endereco.cidade}/{pedido.endereco.uf} · CEP {pedido.endereco.cep}</p>
              </div>
            ) : null}
            {pedido.mensagem ? (
              <div className="mt-4 rounded-2xl bg-raised p-4 text-sm"><p className="tecnica text-mineral-dim">MENSAGEM</p><p className="mt-2 whitespace-pre-line">{pedido.mensagem}</p></div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={whatsapp(pedido.telefone, mensagem(pedido))} target="_blank" rel="noreferrer" className={botaoSecundario}>Responder no WhatsApp ↗</a>
              <a href={`mailto:${pedido.email}?subject=${encodeURIComponent(`Seu pedido ${pedido.numero} — Blajeen Labs`)}&body=${encodeURIComponent(mensagem(pedido))}`} className={botaoSecundario}>Responder por e-mail</a>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-[15rem_1fr]">
              <label className="grid gap-2 text-sm text-mineral">Situação
                <select value={pedido.status} onChange={(e) => void alterar(pedido.id, { status: e.target.value as PedidoLojaStatus }, 'Situação atualizada.')} className={campoAdmin}>
                  {PEDIDO_LOJA_STATUS.map((s) => <option key={s} value={s}>{PEDIDO_LOJA_ROTULO[s]}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-mineral">Anotações internas (o cliente não vê)
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className={`${campoAdmin} p-3 leading-relaxed`}
                  placeholder="Ex.: código de rastreio, combinado com o cliente…" />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => void alterar(pedido.id, { notas }, 'Anotações salvas.')} className={botaoSecundario}>Salvar anotações</button>
              <button type="button" onClick={() => void excluir(pedido)} className="min-h-11 px-2 text-sm text-red-300">Excluir pedido</button>
            </div>
            {erro ? <p role="alert" className="mt-4 text-sm text-red-300">{erro}</p> : null}
            {aviso ? <p role="status" className="mt-4 text-sm text-signal">{aviso}</p> : null}
          </>
        ) : (
          <div>
            <h2 id="detalhe-pedido-loja" className="text-2xl">Escolha um pedido</h2>
            <p className="mt-3 text-mineral">Veja os itens, o frete e o endereço, acompanhe o pagamento no Asaas e responda pelo WhatsApp.</p>
            {erro ? <p role="alert" className="mt-4 text-sm text-red-300">{erro}</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}
