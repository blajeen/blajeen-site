'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { SERVICOS_IDS, type ServicoCatalogo, type ServicoId } from '@/content/contratos/tipos';
import { STATUS_ROTULO, type ContratoAdmin, type ContratoStatus } from '@/lib/contracts/types';
import { numeroBr, reais } from '@/lib/contracts/valores';
import { botaoPrimario, botaoSecundario, campoAdmin, painelAdmin } from './estilos';

export type InfoServico = { tituloCurto: string; pagamento: string; multiPlano: boolean };
export type PedidoParaContrato = { id: string; nome: string; email: string; telefone: string; ideia: string; servico: ServicoId };

type Campos = Record<string, string>;

const CHAVES_CLIENTE = /^(contratante_|port_sim$|cred_sim$)/;
const LEMBRAR = ['contratada_endereco', 'cidade_foro', 'local_assinatura'] as const;

function lerLembrados(): Campos {
  try {
    return JSON.parse(localStorage.getItem('bjl:painel:contratos') ?? '{}') as Campos;
  } catch {
    return {};
  }
}

function guardarLembrados(campos: Campos): void {
  try {
    localStorage.setItem('bjl:painel:contratos', JSON.stringify(Object.fromEntries(LEMBRAR.map((k) => [k, campos[k] ?? '']))));
  } catch {
    /* armazenamento indisponível: só não lembra para o próximo contrato */
  }
}

const corDoStatus: Record<ContratoStatus, string> = {
  AGUARDANDO_CLIENTE: 'border-line-strong text-paper', PREENCHIDO: 'border-signal text-signal',
  ASSINADO: 'border-signal/50 text-mineral', CANCELADO: 'border-line text-mineral-dim',
};

function Secao({ numero, titulo, children, dica }: { numero: string; titulo: string; dica?: string; children: ReactNode }) {
  return (
    <fieldset className="mt-8 border-t border-line pt-6 first:mt-0 first:border-0 first:pt-0">
      <legend className="flex items-baseline gap-3"><span className="tecnica text-signal">{numero}</span><span className="text-xl">{titulo}</span></legend>
      {dica ? <p className="mt-2 text-sm text-mineral">{dica}</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Campo({ rotulo, largo, children }: { rotulo: string; largo?: boolean; children: ReactNode }) {
  return <label className={`grid gap-2 text-sm text-mineral ${largo ? 'sm:col-span-2' : ''}`}>{rotulo}{children}</label>;
}

async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    window.prompt('Copie o link:', texto);
    return false;
  }
}

export function AdminContratos({ catalogo, info, pedido, idInicial }: {
  catalogo: Record<ServicoId, ServicoCatalogo>;
  info: Record<ServicoId, InfoServico>;
  pedido: PedidoParaContrato | null;
  idInicial?: string | undefined;
}) {
  const router = useRouter();
  const [itens, setItens] = useState<ContratoAdmin[]>([]);
  const [filtro, setFiltro] = useState<ContratoStatus | 'TODOS'>('TODOS');
  const [editandoId, setEditandoId] = useState<string | null>(idInicial ?? null);
  const [servico, setServico] = useState<ServicoId>(pedido?.servico ?? 'site');
  const [campos, setCampos] = useState<Campos>({});
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const automaticos = useRef<Campos>({});
  const iniciado = useRef(false);

  const editando = useMemo(() => itens.find((c) => c.id === editandoId) ?? null, [itens, editandoId]);
  const s = catalogo[servico];
  const inf = info[servico];

  const carregar = useCallback(async () => {
    const resposta = await fetch('/api/admin/contratos', { cache: 'no-store' });
    if (resposta.status === 401) { router.push('/admin/login'); return []; }
    const dados = await resposta.json() as { itens?: ContratoAdmin[]; error?: string };
    if (!resposta.ok) throw new Error(dados.error ?? 'Não foi possível carregar os contratos.');
    setItens(dados.itens ?? []);
    return dados.itens ?? [];
  }, [router]);

  const novo = useCallback((origem: PedidoParaContrato | null, servicoInicial: ServicoId) => {
    setEditandoId(null); setErro(''); setAviso(''); automaticos.current = {};
    setServico(servicoInicial);
    setCampos({
      ...lerLembrados(),
      data_assinatura: new Date().toISOString().slice(0, 10),
      parcelamento: 'à vista',
      forma_pagamento: info[servicoInicial].pagamento,
      plano_mensal: 'Não contratado',
      ...(origem ? {
        contratante_nome: origem.nome, contratante_email: origem.email, contratante_tel: origem.telefone, resumo_combinado: origem.ideia,
      } : {}),
    });
  }, [info]);

  const abrir = useCallback((contrato: ContratoAdmin) => {
    setEditandoId(contrato.id); setErro(''); setAviso(''); automaticos.current = {};
    setServico(contrato.servico);
    setCampos({ ...contrato.termos, ...contrato.cliente });
  }, []);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    void carregar().then((lista) => {
      const alvo = idInicial ? lista.find((c) => c.id === idInicial) : undefined;
      if (alvo) abrir(alvo); else novo(pedido, pedido?.servico ?? 'site');
    }).catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Falha ao carregar.'));
  }, [carregar, abrir, novo, idInicial, pedido]);

  const definir = (chave: string, valor: string) => setCampos((atual) => ({ ...atual, [chave]: valor }));

  /** Preenche um campo sugerido só se estiver vazio ou ainda com a última sugestão automática. */
  function sugerir(atual: Campos, chave: string, valor: string): Campos {
    const corrente = atual[chave] ?? '';
    if (corrente && corrente !== automaticos.current[chave]) return atual;
    automaticos.current[chave] = valor;
    return { ...atual, [chave]: valor };
  }

  function escolherPlano(id: string, marcado: boolean) {
    setCampos((atual) => {
      let proximo = { ...atual };
      if (!inf.multiPlano) for (const p of s.planos) delete proximo[`plano_${p.id}`];
      if (marcado) proximo[`plano_${id}`] = '1'; else delete proximo[`plano_${id}`];
      const plano = s.planos.find((p) => p.id === id);
      if (marcado && plano) {
        proximo = sugerir(proximo, 'plano_nome', `${plano.nome} (${plano.nivel})`);
        proximo = sugerir(proximo, 'valor_total', numeroBr(plano.preco));
        proximo = sugerir(proximo, 'prazo', plano.prazo);
      }
      return proximo;
    });
  }

  function escolherMensal(id: string) {
    setCampos((atual) => {
      const proximo = { ...atual };
      for (const m of s.mensais) delete proximo[`mensal_${m.id}`];
      delete proximo.mensal_nao;
      const mensal = s.mensais.find((m) => m.id === id);
      if (mensal) {
        proximo[`mensal_${mensal.id}`] = '1';
        proximo.plano_mensal = `${mensal.nome} — ${reais(mensal.preco)}${mensal.unidade}`;
      } else {
        proximo.mensal_nao = '1';
        proximo.plano_mensal = 'Não contratado';
      }
      return proximo;
    });
  }

  function trocarServico(proximo: ServicoId) {
    setServico(proximo);
    setCampos((atual) => {
      const limpo = Object.fromEntries(Object.entries(atual).filter(([k]) => !/^(plano_|mensal_|add_|copart_|mod_)/.test(k) || k === 'plano_nome' || k === 'plano_mensal'));
      return { ...limpo, forma_pagamento: atual.forma_pagamento === info[servico].pagamento ? info[proximo].pagamento : (atual.forma_pagamento ?? '') };
    });
  }

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); setErro(''); setAviso(''); setSalvando(true);
    const termos = Object.fromEntries(Object.entries(campos).filter(([k]) => !CHAVES_CLIENTE.test(k)));
    const cliente = Object.fromEntries(Object.entries(campos).filter(([k]) => CHAVES_CLIENTE.test(k)));
    const resposta = await fetch(editando ? `/api/admin/contratos/${editando.id}` : '/api/admin/contratos', {
      method: editando ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editando ? { termos, cliente } : { servico, termos, cliente, pedidoId: pedido?.id ?? null }),
    });
    const dados = await resposta.json() as { item?: ContratoAdmin; error?: string };
    setSalvando(false);
    if (!resposta.ok || !dados.item) { setErro(dados.error ?? 'Não foi possível salvar.'); return; }
    guardarLembrados(campos);
    await carregar();
    abrir(dados.item);
    setAviso(editando ? 'Alterações salvas.' : `Contrato ${dados.item.numero} criado. Copie o link e envie ao cliente.`);
    if (!editando) router.replace(`/admin/contratos?id=${dados.item.id}`);
  }

  async function agir(acao: string, confirmacao?: string) {
    if (!editando) return;
    if (confirmacao && !window.confirm(confirmacao)) return;
    setErro(''); setAviso('');
    const resposta = await fetch(`/api/admin/contratos/${editando.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao }) });
    const dados = await resposta.json() as { item?: ContratoAdmin; error?: string };
    if (!resposta.ok || !dados.item) { setErro(dados.error ?? 'Não foi possível concluir.'); return; }
    await carregar(); abrir(dados.item); setAviso('Atualizado.');
  }

  async function excluir() {
    if (!editando || !window.confirm(`Excluir o contrato ${editando.numero}? O link do cliente deixa de funcionar e não há como desfazer.`)) return;
    const resposta = await fetch(`/api/admin/contratos/${editando.id}`, { method: 'DELETE' });
    if (!resposta.ok) { setErro('Não foi possível excluir.'); return; }
    await carregar(); novo(null, 'site'); router.replace('/admin/contratos');
  }

  const visiveis = itens.filter((c) => filtro === 'TODOS' || c.status === filtro);
  const primeiroNome = (campos.contratante_nome ?? '').split(' ')[0] || '';
  const mensagemCliente = editando ? `Olá${primeiroNome ? `, ${primeiroNome}` : ''}! Segue o link do seu contrato com a Blajeen Labs: ${editando.linkCliente}\n\nConfira o resumo, preencha seus dados e envie. Qualquer dúvida, me chama aqui.` : '';
  const telefone = (campos.contratante_tel ?? '').replace(/\D/g, '');
  const bloqueado = editando?.status === 'CANCELADO';

  return (
    <div className="grid gap-8 2xl:grid-cols-[minmax(20rem,0.62fr)_minmax(0,1.38fr)]">
      <section aria-labelledby="lista-contratos" className={`${painelAdmin} self-start`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="lista-contratos" className="text-2xl">Contratos</h2>
          <button type="button" onClick={() => { novo(null, 'site'); router.replace('/admin/contratos'); }} className={botaoSecundario}>+ Novo</button>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-mineral">Mostrar
          <select value={filtro} onChange={(e) => setFiltro(e.target.value as ContratoStatus | 'TODOS')} className={`${campoAdmin} w-auto`}>
            <option value="TODOS">Todos</option>
            {(Object.keys(STATUS_ROTULO) as ContratoStatus[]).map((st) => <option key={st} value={st}>{STATUS_ROTULO[st]}</option>)}
          </select>
        </label>
        {visiveis.length ? (
          <ul className="mt-4 space-y-2">
            {visiveis.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => { abrir(c); router.replace(`/admin/contratos?id=${c.id}`); }} aria-current={c.id === editandoId ? 'true' : undefined}
                  className={`w-full rounded-2xl border p-4 text-left transition-colors ${c.id === editandoId ? 'border-signal bg-raised' : 'border-line-strong hover:border-mineral-dim'}`}>
                  <span className="tecnica text-mineral-dim">{c.numero}</span>
                  <span className="mt-1 block text-base">{c.cliente.contratante_nome || c.termos.projeto_nome || 'Cliente a preencher'}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-2 text-sm text-mineral">
                    <span className={`tecnica rounded-full border px-2.5 py-0.5 ${corDoStatus[c.status]}`}>{STATUS_ROTULO[c.status]}</span>
                    {info[c.servico].tituloCurto}{c.termos.valor_total ? ` · R$ ${c.termos.valor_total}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="mt-5 rounded-2xl border border-line p-5 text-sm text-mineral">Nenhum contrato {filtro === 'TODOS' ? 'ainda' : 'nesta situação'}.</p>}
      </section>

      <section aria-labelledby="editor-contrato" className={painelAdmin}>
        {editando ? (
          <div className="mb-8 rounded-2xl border border-line-strong bg-raised p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="tecnica text-mineral-dim">{editando.numero} · {info[editando.servico].tituloCurto}</p>
                <p className={`tecnica mt-2 inline-block rounded-full border px-3 py-1 ${corDoStatus[editando.status]}`}>{STATUS_ROTULO[editando.status]}</p>
              </div>
              <a href={`/admin/contratos/${editando.id}/documento`} target="_blank" rel="noreferrer" className={botaoPrimario}>ABRIR CONTRATO / PDF ↗</a>
            </div>
            <div className="mt-5">
              <p className="text-sm text-mineral">Link do cliente {editando.status === 'AGUARDANDO_CLIENTE' ? `(válido até ${new Date(editando.tokenExpiresAt).toLocaleDateString('pt-BR')})` : ''}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input readOnly value={editando.linkCliente} aria-label="Link do cliente" onFocus={(e) => e.currentTarget.select()} className={`${campoAdmin} min-w-0 flex-1 font-mono text-xs`} />
                <button type="button" onClick={() => void copiar(editando.linkCliente).then((ok) => ok && setAviso('Link copiado.'))} className={botaoSecundario}>Copiar link</button>
                {telefone ? <a href={`https://wa.me/${telefone.length <= 11 ? `55${telefone}` : telefone}?text=${encodeURIComponent(mensagemCliente)}`} target="_blank" rel="noreferrer" className={botaoSecundario}>Enviar no WhatsApp ↗</a> : null}
                {campos.contratante_email ? <a href={`mailto:${campos.contratante_email}?subject=${encodeURIComponent(`Seu contrato ${editando.numero} — Blajeen Labs`)}&body=${encodeURIComponent(mensagemCliente)}`} className={botaoSecundario}>Enviar por e-mail</a> : null}
              </div>
            </div>
            <ol className="mt-5 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-5">
              {[
                ['Criado', editando.criadoEm], ['Cliente enviou', editando.clienteEnviadoEm], ['Assinado', editando.assinadoEm],
                ['Entrada (50%)', editando.entradaRecebidaEm], ['Saldo (50%)', editando.saldoRecebidoEm],
              ].map(([rotulo, data]) => (
                <li key={rotulo} className={`rounded-xl border p-3 ${data ? 'border-signal/50' : 'border-line'}`}>
                  <span className="tecnica block text-mineral-dim">{rotulo}</span>
                  <span className={data ? 'text-paper' : 'text-mineral-dim'}>{data ? new Date(data).toLocaleDateString('pt-BR') : 'pendente'}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              {editando.status !== 'ASSINADO'
                ? <button type="button" disabled={bloqueado} onClick={() => void agir('assinado')} className={botaoSecundario}>Marcar como assinado</button>
                : <button type="button" onClick={() => void agir('desfazer-assinado')} className={botaoSecundario}>Desfazer assinatura</button>}
              {!editando.entradaRecebidaEm
                ? <button type="button" disabled={bloqueado} onClick={() => void agir('entrada')} className={botaoSecundario}>Entrada recebida</button>
                : <button type="button" onClick={() => void agir('desfazer-entrada')} className={botaoSecundario}>Desfazer entrada</button>}
              {!editando.saldoRecebidoEm
                ? <button type="button" disabled={bloqueado} onClick={() => void agir('saldo')} className={botaoSecundario}>Saldo recebido</button>
                : <button type="button" onClick={() => void agir('desfazer-saldo')} className={botaoSecundario}>Desfazer saldo</button>}
              {editando.status === 'PREENCHIDO' ? <button type="button" onClick={() => void agir('reabrir', 'Liberar o link para o cliente corrigir os dados?')} className={botaoSecundario}>Reabrir para o cliente</button> : null}
              <button type="button" onClick={() => void agir('renovar-link', 'Gerar um link novo? O link anterior deixa de funcionar.')} className={botaoSecundario}>Gerar novo link</button>
              {editando.status !== 'CANCELADO'
                ? <button type="button" onClick={() => void agir('cancelar', `Cancelar o contrato ${editando.numero}? O link do cliente deixa de funcionar.`)} className="min-h-11 px-3 text-sm text-red-300">Cancelar contrato</button>
                : <button type="button" onClick={() => void agir('reabrir')} className={botaoSecundario}>Reativar</button>}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h2 id="editor-contrato" className="text-2xl">Novo contrato</h2>
            <p className="mt-2 text-sm text-mineral">
              {pedido ? `A partir do pedido de ${pedido.nome}. ` : ''}Defina os valores que você vendeu. Ao criar, o painel gera o número do contrato e o link para o cliente preencher os dados dele.
            </p>
          </div>
        )}
        {editando ? <h2 id="editor-contrato" className="sr-only">Editar contrato</h2> : null}

        <form onSubmit={salvar}>
          <Secao numero="01" titulo="Serviço e plano" dica="O plano sugere valor e prazo do catálogo; você pode mudar tudo na etapa seguinte.">
            <Campo rotulo="Serviço">
              <select value={servico} disabled={Boolean(editando)} onChange={(e) => trocarServico(e.target.value as ServicoId)} className={campoAdmin}>
                {SERVICOS_IDS.map((id) => <option key={id} value={id}>{info[id].tituloCurto}</option>)}
              </select>
            </Campo>
            <Campo rotulo="Nome do projeto"><input value={campos.projeto_nome ?? ''} onChange={(e) => definir('projeto_nome', e.target.value)} placeholder="Ex.: Site da Pousada Aurora" className={campoAdmin} /></Campo>
            <div className="grid gap-2 sm:col-span-2">
              <span className="text-sm text-mineral">{inf.multiPlano ? 'Itens contratados (pode marcar mais de um)' : 'Plano vendido'}</span>
              <div className="grid gap-2 md:grid-cols-2">
                {s.planos.map((p) => (
                  <label key={p.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${campos[`plano_${p.id}`] === '1' ? 'border-signal bg-raised' : 'border-line-strong'}`}>
                    <input type={inf.multiPlano ? 'checkbox' : 'radio'} name="plano" checked={campos[`plano_${p.id}`] === '1'} onChange={(e) => escolherPlano(p.id, e.target.checked)} className="mt-1 accent-[#c9ff3d]" />
                    <span><span className="block text-paper">{p.nome} <span className="text-mineral">· {p.nivel}</span></span>
                      <span className="text-sm text-mineral">{p.aPartir ? 'a partir de ' : ''}{reais(p.preco)}{p.unidade} · {p.prazo}</span></span>
                  </label>
                ))}
              </div>
            </div>
          </Secao>

          <Secao numero="02" titulo="Valores deste contrato" dica="Política padrão: 50% adiantado e 50% no final. O parcelamento tem juros por conta do cliente.">
            <Campo rotulo="Valor total (R$)"><input required value={campos.valor_total ?? ''} onChange={(e) => definir('valor_total', e.target.value)} inputMode="decimal" placeholder="1.490,00" className={campoAdmin} /></Campo>
            <Campo rotulo="Prazo estimado"><input value={campos.prazo ?? ''} onChange={(e) => definir('prazo', e.target.value)} placeholder="20 a 30 dias úteis" className={campoAdmin} /></Campo>
            <Campo rotulo="Condições de pagamento" largo><input value={campos.forma_pagamento ?? ''} onChange={(e) => definir('forma_pagamento', e.target.value)} className={campoAdmin} /></Campo>
            <Campo rotulo="Parcelamento"><input value={campos.parcelamento ?? ''} onChange={(e) => definir('parcelamento', e.target.value)} placeholder="à vista · ou 3x no cartão com juros" className={campoAdmin} /></Campo>
            <Campo rotulo="Nome do plano no contrato"><input value={campos.plano_nome ?? ''} onChange={(e) => definir('plano_nome', e.target.value)} className={campoAdmin} /></Campo>
            {s.mensais.length ? (
              <>
                <Campo rotulo="Plano mensal">
                  <select value={s.mensais.find((m) => campos[`mensal_${m.id}`] === '1')?.id ?? 'nao'} onChange={(e) => escolherMensal(e.target.value)} className={campoAdmin}>
                    <option value="nao">Não contratado</option>
                    {s.mensais.map((m) => <option key={m.id} value={m.id}>{m.nome} — {reais(m.preco)}{m.unidade}</option>)}
                  </select>
                </Campo>
                <Campo rotulo="Dia de vencimento da mensalidade"><input value={campos.dia_venc ?? ''} onChange={(e) => definir('dia_venc', e.target.value)} inputMode="numeric" placeholder="10" className={campoAdmin} /></Campo>
              </>
            ) : null}
          </Secao>

          <Secao numero="03" titulo="O combinado" dica="Escreva com suas palavras a ideia e o que foi acordado. Isso aparece em destaque no quadro-resumo do contrato.">
            <Campo rotulo="Resumo do combinado" largo>
              <textarea required rows={6} value={campos.resumo_combinado ?? ''} onChange={(e) => definir('resumo_combinado', e.target.value)} className={`${campoAdmin} p-3 leading-relaxed`}
                placeholder="Ex.: Site institucional para a pousada, com página de quartos, galeria, avaliações do Google e botão de WhatsApp. O cliente envia fotos e textos até dia 10." />
            </Campo>
            <Campo rotulo="Detalhamento técnico do escopo (opcional, vai para o Anexo I)" largo>
              <textarea rows={4} value={campos.escopo_detalhe ?? ''} onChange={(e) => definir('escopo_detalhe', e.target.value)} className={`${campoAdmin} p-3 leading-relaxed`} placeholder="Páginas, módulos, quantidades, integrações, referências." />
            </Campo>
            <div className="grid gap-2 sm:col-span-2">
              <span className="text-sm text-mineral">Itens adicionais incluídos</span>
              <div className="grid gap-2 md:grid-cols-2">
                {s.adicionais.map((a) => (
                  <label key={a.id} className="flex items-center gap-3 rounded-xl border border-line-strong p-3 text-sm">
                    <input type="checkbox" checked={campos[a.id] === '1'} onChange={(e) => definir(a.id, e.target.checked ? '1' : '')} className="accent-[#c9ff3d]" />
                    <span className="flex-1 text-paper">{a.nome}</span>
                    <span className="text-mineral">{typeof a.preco === 'number' ? `${a.qualificador === 'a partir de' ? 'a partir de ' : ''}${reais(a.preco)}${a.qualificador.startsWith('/') ? a.qualificador : ''}` : a.preco}</span>
                  </label>
                ))}
              </div>
            </div>
            {[1, 2].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_9rem] gap-2 sm:col-span-2">
                <input value={campos[`extra${i}_desc`] ?? ''} onChange={(e) => definir(`extra${i}_desc`, e.target.value)} placeholder={`Outro item negociado ${i} (opcional)`} aria-label={`Descrição do item negociado ${i}`} className={campoAdmin} />
                <input value={campos[`extra${i}_valor`] ?? ''} onChange={(e) => definir(`extra${i}_valor`, e.target.value)} placeholder="R$ 0,00" aria-label={`Valor do item negociado ${i}`} inputMode="decimal" className={campoAdmin} />
              </div>
            ))}
          </Secao>

          {servico === 'jogo' ? (
            <Secao numero="03B" titulo="Detalhes do jogo">
              <Campo rotulo="Plataformas"><input value={campos.plataformas ?? ''} onChange={(e) => definir('plataformas', e.target.value)} placeholder="navegador, Android e iOS" className={campoAdmin} /></Campo>
              <Campo rotulo="Engine"><input value={campos.engine ?? ''} onChange={(e) => definir('engine', e.target.value)} placeholder="Unity, Godot ou Unreal" className={campoAdmin} /></Campo>
              <Campo rotulo="Dispositivos de referência" largo><input value={campos.dispositivos ?? ''} onChange={(e) => definir('dispositivos', e.target.value)} placeholder="Android 10+ com 3 GB de RAM; iPhone 11+" className={campoAdmin} /></Campo>
              <Campo rotulo="Coparticipação nas receitas">
                <select value={campos.copart_sim === '1' ? 'sim' : 'nao'} onChange={(e) => setCampos((a) => ({ ...a, copart_sim: e.target.value === 'sim' ? '1' : '', copart_nao: e.target.value === 'sim' ? '' : '1' }))} className={campoAdmin}>
                  <option value="nao">Não se aplica</option><option value="sim">Aplica-se</option>
                </select>
              </Campo>
              {campos.copart_sim === '1' ? (
                <div className="grid grid-cols-2 gap-2">
                  <input value={campos.copart_pct ?? ''} onChange={(e) => definir('copart_pct', e.target.value)} placeholder="% da receita" aria-label="Percentual da receita" className={campoAdmin} />
                  <input value={campos.copart_meses ?? ''} onChange={(e) => definir('copart_meses', e.target.value)} placeholder="meses" aria-label="Prazo em meses" className={campoAdmin} />
                </div>
              ) : null}
            </Secao>
          ) : null}

          {servico === 'projeto' ? (
            <Secao numero="03B" titulo="Modalidade de execução">
              <Campo rotulo="Como a execução será cobrada" largo>
                <select value={['fechado', 'sprints', 'horas'].find((m) => campos[`mod_${m}`] === '1') ?? ''} onChange={(e) => setCampos((a) => ({ ...a, mod_fechado: e.target.value === 'fechado' ? '1' : '', mod_sprints: e.target.value === 'sprints' ? '1' : '', mod_horas: e.target.value === 'horas' ? '1' : '' }))} className={campoAdmin}>
                  <option value="">A definir após o Diagnóstico</option><option value="fechado">Preço fechado por escopo</option><option value="sprints">Sprints quinzenais</option><option value="horas">Banco de horas</option>
                </select>
              </Campo>
            </Secao>
          ) : null}

          <Secao numero="04" titulo="Assinatura e foro" dica="O painel lembra estes dados para o próximo contrato.">
            <Campo rotulo="Data do contrato"><input type="date" value={campos.data_assinatura ?? ''} onChange={(e) => definir('data_assinatura', e.target.value)} className={campoAdmin} /></Campo>
            <Campo rotulo="Cidade da assinatura"><input value={campos.local_assinatura ?? ''} onChange={(e) => definir('local_assinatura', e.target.value)} placeholder="Uberlândia/MG" className={campoAdmin} /></Campo>
            <Campo rotulo="Foro (comarca)"><input value={campos.cidade_foro ?? ''} onChange={(e) => definir('cidade_foro', e.target.value)} placeholder="Uberlândia/MG" className={campoAdmin} /></Campo>
            <Campo rotulo="Endereço da Blajeen Labs"><input value={campos.contratada_endereco ?? ''} onChange={(e) => definir('contratada_endereco', e.target.value)} placeholder="Endereço completo com CEP" className={campoAdmin} /></Campo>
          </Secao>

          <Secao numero="05" titulo="Dados do cliente (opcional)" dica="Deixe em branco para o cliente preencher pelo link. Se você já tem os dados, preencha e gere o PDF direto.">
            <Campo rotulo="Nome completo ou razão social"><input value={campos.contratante_nome ?? ''} onChange={(e) => definir('contratante_nome', e.target.value)} className={campoAdmin} /></Campo>
            <Campo rotulo="CPF ou CNPJ"><input value={campos.contratante_doc ?? ''} onChange={(e) => definir('contratante_doc', e.target.value)} className={campoAdmin} /></Campo>
            <Campo rotulo="Endereço completo com CEP" largo><input value={campos.contratante_endereco ?? ''} onChange={(e) => definir('contratante_endereco', e.target.value)} className={campoAdmin} /></Campo>
            <Campo rotulo="E-mail"><input type="email" value={campos.contratante_email ?? ''} onChange={(e) => definir('contratante_email', e.target.value)} className={campoAdmin} /></Campo>
            <Campo rotulo="Telefone"><input value={campos.contratante_tel ?? ''} onChange={(e) => definir('contratante_tel', e.target.value)} className={campoAdmin} /></Campo>
            <Campo rotulo="Representante legal (se CNPJ)" largo><input value={campos.contratante_repr ?? ''} onChange={(e) => definir('contratante_repr', e.target.value)} placeholder="Nome e CPF" className={campoAdmin} /></Campo>
          </Secao>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
            <button type="submit" disabled={salvando || bloqueado} className={botaoPrimario}>{salvando ? 'SALVANDO…' : editando ? 'SALVAR ALTERAÇÕES' : 'CRIAR CONTRATO E GERAR LINK'} →</button>
            {editando ? <button type="button" onClick={() => void excluir()} className="min-h-11 px-2 text-sm text-red-300">Excluir contrato</button> : null}
          </div>
          {erro ? <p role="alert" className="mt-4 text-sm text-red-300">{erro}</p> : null}
          {aviso ? <p role="status" className="mt-4 text-sm text-signal">{aviso}</p> : null}
        </form>
      </section>
    </div>
  );
}
