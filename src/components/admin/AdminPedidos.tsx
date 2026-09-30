'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PEDIDO_ROTULO, PEDIDO_STATUS, type Pedido, type PedidoStatus } from '@/lib/pedidos/types';
import { botaoPrimario, botaoSecundario, campoAdmin, painelAdmin } from './estilos';

function whatsapp(telefone: string, texto: string): string {
  const digitos = telefone.replace(/\D/g, '');
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function mensagem(pedido: Pedido): string {
  const primeiro = pedido.nome.split(' ')[0];
  return `Olá, ${primeiro}! Aqui é da Blajeen Labs. Recebi seu pedido (${pedido.tipo}) e adorei a ideia. `
    + 'Podemos conversar 15 minutos para eu entender melhor e te mostrar o melhor caminho? Qual horário fica bom para você?';
}

const corDoStatus: Record<PedidoStatus, string> = {
  NOVO: 'border-signal text-signal', EM_CONVERSA: 'border-line-strong text-paper', PROPOSTA: 'border-line-strong text-paper',
  FECHADO: 'border-signal/50 text-mineral', PERDIDO: 'border-line text-mineral-dim',
};

export function AdminPedidos({ idInicial }: { idInicial?: string | undefined }) {
  const router = useRouter();
  const [itens, setItens] = useState<Pedido[]>([]);
  const [filtro, setFiltro] = useState<PedidoStatus | 'TODOS'>('TODOS');
  const [selecionado, setSelecionado] = useState<string | null>(idInicial ?? null);
  const [notas, setNotas] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const resposta = await fetch('/api/admin/pedidos', { cache: 'no-store' });
    if (resposta.status === 401) { router.push('/admin/login'); return; }
    const dados = await resposta.json() as { itens?: Pedido[]; error?: string };
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

  function abrir(p: Pedido) {
    setSelecionado(p.id); setNotas(p.notas); setErro(''); setAviso('');
  }

  useEffect(() => {
    // Sincroniza o campo de notas quando o pedido pré-selecionado pela URL termina de carregar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pedido) setNotas(pedido.notas);
  }, [pedido]);

  async function alterar(id: string, corpo: { status?: PedidoStatus; notas?: string }, mensagemOk: string) {
    setErro(''); setAviso('');
    const resposta = await fetch(`/api/admin/pedidos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
    const dados = await resposta.json() as { error?: string };
    if (!resposta.ok) { setErro(dados.error ?? 'Não foi possível salvar.'); return; }
    setAviso(mensagemOk); await carregar();
  }

  async function excluir(p: Pedido) {
    if (!window.confirm(`Excluir o pedido de ${p.nome}? Esta ação não pode ser desfeita.`)) return;
    const resposta = await fetch(`/api/admin/pedidos/${p.id}`, { method: 'DELETE' });
    if (!resposta.ok) { setErro('Não foi possível excluir.'); return; }
    setSelecionado(null); await carregar();
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section aria-labelledby="lista-pedidos" className={painelAdmin}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="lista-pedidos" className="text-2xl">Pedidos recebidos</h2>
          <label className="flex items-center gap-2 text-sm text-mineral">Mostrar
            <select value={filtro} onChange={(e) => setFiltro(e.target.value as PedidoStatus | 'TODOS')} className={`${campoAdmin} w-auto`}>
              <option value="TODOS">Todos</option>
              {PEDIDO_STATUS.map((s) => <option key={s} value={s}>{PEDIDO_ROTULO[s]}</option>)}
            </select>
          </label>
        </div>
        {carregando ? <p className="mt-6 text-mineral">Carregando…</p> : visiveis.length ? (
          <ul className="mt-5 space-y-2">
            {visiveis.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => abrir(p)} aria-current={p.id === selecionado ? 'true' : undefined}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${p.id === selecionado ? 'border-signal bg-raised' : 'border-line-strong hover:border-mineral-dim'}`}>
                  <span className="flex items-start justify-between gap-3">
                    <span><span className="block text-base">{p.nome}</span><span className="mt-1 block text-sm text-mineral">{p.tipo} · {new Date(p.criadoEm).toLocaleDateString('pt-BR')}</span></span>
                    <span className={`tecnica flex-none rounded-full border px-3 py-1 ${corDoStatus[p.status]}`}>{PEDIDO_ROTULO[p.status]}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="mt-6 rounded-2xl border border-line p-6 text-mineral">Nenhum pedido {filtro === 'TODOS' ? 'recebido ainda' : 'nesta situação'}. Os pedidos do formulário “Crie seu projeto” aparecem aqui.</p>}
      </section>

      <section aria-labelledby="detalhe-pedido" className={painelAdmin}>
        {pedido ? (
          <>
            <p className="tecnica text-signal">PEDIDO · {new Date(pedido.criadoEm).toLocaleString('pt-BR')}</p>
            <h2 id="detalhe-pedido" className="mt-3 text-3xl leading-tight">{pedido.nome}</h2>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="tecnica text-mineral-dim">TIPO</dt><dd className="mt-1">{pedido.tipo}</dd></div>
              <div><dt className="tecnica text-mineral-dim">E-MAIL</dt><dd className="mt-1 break-all">{pedido.email}</dd></div>
              <div><dt className="tecnica text-mineral-dim">TELEFONE</dt><dd className="mt-1">{pedido.telefone}</dd></div>
              <div><dt className="tecnica text-mineral-dim">AVISO POR E-MAIL</dt><dd className="mt-1">{pedido.emailStatus === 'SENT' ? 'Enviado' : pedido.emailStatus === 'FAILED' ? 'Falhou' : 'Não configurado'}</dd></div>
            </dl>
            <div className="mt-5 rounded-2xl border-l-4 border-signal bg-raised p-4">
              <p className="tecnica text-mineral-dim">A IDEIA</p>
              <p className="mt-2 whitespace-pre-line leading-relaxed">{pedido.ideia}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/admin/contratos?pedido=${pedido.id}`} className={botaoPrimario}>CRIAR CONTRATO →</Link>
              <a href={whatsapp(pedido.telefone, mensagem(pedido))} target="_blank" rel="noreferrer" className={botaoSecundario}>Responder no WhatsApp ↗</a>
              <a href={`mailto:${pedido.email}?subject=${encodeURIComponent('Seu projeto com a Blajeen Labs')}&body=${encodeURIComponent(mensagem(pedido))}`} className={botaoSecundario}>Responder por e-mail</a>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-[14rem_1fr]">
              <label className="grid gap-2 text-sm text-mineral">Situação
                <select value={pedido.status} onChange={(e) => void alterar(pedido.id, { status: e.target.value as PedidoStatus }, 'Situação atualizada.')} className={campoAdmin}>
                  {PEDIDO_STATUS.map((s) => <option key={s} value={s}>{PEDIDO_ROTULO[s]}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-mineral">Anotações internas (o cliente não vê)
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={4} className={`${campoAdmin} p-3 leading-relaxed`} placeholder="Ex.: ligar na sexta, quer loja com Pix, orçamento até R$ 2 mil." />
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
            <h2 id="detalhe-pedido" className="text-2xl">Escolha um pedido</h2>
            <p className="mt-3 text-mineral">Veja a ideia, responda por WhatsApp ou e-mail e crie o contrato já com os dados do cliente.</p>
            {erro ? <p role="alert" className="mt-4 text-sm text-red-300">{erro}</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}
