'use client';

import { useState } from 'react';
import { SERVICOS_IDS, type ServicoCatalogo, type ServicoId } from '@/content/contratos/tipos';
import { reais } from '@/lib/contracts/valores';
import { botaoPrimario, botaoSecundario, campoAdmin, painelAdmin } from './estilos';

type Edicao = {
  validade: string;
  horaTecnica: string;
  servicos: Record<ServicoId, {
    planos: Record<string, { preco: string; prazo: string; aPartir: boolean }>;
    mensais: Record<string, { preco: string }>;
    adicionais: Record<string, { preco: string }>;
  }>;
};

function paraEdicao(servicos: Record<ServicoId, ServicoCatalogo>, validade: string, horaTecnica: number): Edicao {
  const saida = { validade, horaTecnica: String(horaTecnica), servicos: {} } as Edicao;
  for (const id of SERVICOS_IDS) {
    const s = servicos[id];
    saida.servicos[id] = {
      planos: Object.fromEntries(s.planos.map((p) => [p.id, { preco: String(p.preco), prazo: p.prazo, aPartir: p.aPartir }])),
      mensais: Object.fromEntries(s.mensais.map((m) => [m.id, { preco: String(m.preco) }])),
      adicionais: Object.fromEntries(s.adicionais.filter((a) => typeof a.preco === 'number').map((a) => [a.id, { preco: String(a.preco) }])),
    };
  }
  return saida;
}

function numero(texto: string): number | undefined {
  const limpo = texto.replace(/[^\d,.]/g, '');
  if (!limpo) return undefined;
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const valor = Number(normal);
  return Number.isFinite(valor) ? valor : undefined;
}

export function AdminCatalogo({ base, vigente, validade, horaTecnica }: {
  base: Record<ServicoId, ServicoCatalogo>;
  vigente: Record<ServicoId, ServicoCatalogo>;
  validade: string;
  horaTecnica: number;
}) {
  const [edicao, setEdicao] = useState<Edicao>(() => paraEdicao(vigente, validade, horaTecnica));
  const [sujo, setSujo] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);

  function alterar(mutacao: (rascunho: Edicao) => void) {
    setEdicao((atual) => {
      const copia = structuredClone(atual);
      mutacao(copia);
      return copia;
    });
    setSujo(true); setAviso('');
  }

  async function salvar() {
    setErro(''); setAviso(''); setSalvando(true);
    const corpo = {
      validade: edicao.validade,
      horaTecnica: numero(edicao.horaTecnica),
      servicos: Object.fromEntries(SERVICOS_IDS.map((id) => {
        const s = edicao.servicos[id];
        return [id, {
          planos: Object.fromEntries(Object.entries(s.planos).map(([pid, p]) => [pid, { preco: numero(p.preco), prazo: p.prazo, aPartir: p.aPartir }])),
          mensais: Object.fromEntries(Object.entries(s.mensais).map(([mid, m]) => [mid, { preco: numero(m.preco) }])),
          adicionais: Object.fromEntries(Object.entries(s.adicionais).map(([aid, a]) => [aid, { preco: numero(a.preco) }])),
        }];
      })),
    };
    const resposta = await fetch('/api/admin/catalogo', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
    const dados = await resposta.json() as { error?: string };
    setSalvando(false);
    if (!resposta.ok) { setErro(dados.error ?? 'Não foi possível salvar os preços.'); return; }
    setSujo(false); setAviso('Preços salvos. Novos contratos e o PDF do catálogo já usam estes valores.');
  }

  function gerarPdf() {
    if (sujo && !window.confirm('Há preços não salvos. O PDF usa os últimos preços salvos. Abrir mesmo assim?')) return;
    window.open('/admin/catalogo/documento', '_blank', 'noopener');
  }

  function restaurar() {
    if (!window.confirm('Voltar todos os valores para os preços-base do kit? Você ainda precisa clicar em “Salvar preços”.')) return;
    setEdicao(paraEdicao(base, edicao.validade, Number(edicao.horaTecnica) || horaTecnica));
    setSujo(true);
  }

  const acoes = (
    <div className="sticky top-20 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-line-strong bg-ink/95 p-3 backdrop-blur">
      <button type="button" onClick={() => void salvar()} disabled={salvando} className={botaoPrimario}>{salvando ? 'SALVANDO…' : 'SALVAR PREÇOS'}</button>
      <button type="button" onClick={gerarPdf} className={botaoSecundario}>Gerar PDF do catálogo ↗</button>
      <button type="button" onClick={restaurar} className="min-h-11 px-2 text-sm text-mineral hover:text-paper">Restaurar preços-base</button>
      {sujo ? <span className="text-sm text-signal">Alterações não salvas</span> : null}
      {erro ? <span role="alert" className="text-sm text-red-300">{erro}</span> : null}
      {aviso ? <span role="status" className="text-sm text-signal">{aviso}</span> : null}
    </div>
  );

  return (
    <div className="grid gap-6">
      {acoes}
      <section className={painelAdmin} aria-labelledby="gerais-titulo">
        <h2 id="gerais-titulo" className="text-2xl">Geral</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-2 text-sm text-mineral">Valores válidos até
            <input value={edicao.validade} onChange={(e) => alterar((r) => { r.validade = e.target.value; })} placeholder="31/12/2026" className={campoAdmin} />
          </label>
          <label className="grid gap-2 text-sm text-mineral">Hora técnica (R$)
            <input value={edicao.horaTecnica} onChange={(e) => alterar((r) => { r.horaTecnica = e.target.value; })} inputMode="decimal" className={campoAdmin} />
          </label>
        </div>
      </section>

      {SERVICOS_IDS.map((id) => {
        const s = vigente[id];
        const e = edicao.servicos[id];
        return (
          <section key={id} className={painelAdmin} aria-labelledby={`servico-${id}`}>
            <p className="tecnica text-signal">{s.numero} / {s.rotulo}</p>
            <h2 id={`servico-${id}`} className="mt-2 text-3xl">{s.nome}.</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[42rem] text-sm">
                <thead><tr className="text-left">
                  <th className="tecnica py-2 pr-3 font-normal text-mineral-dim">Plano</th><th className="tecnica py-2 pr-3 font-normal text-mineral-dim">Preço (R$)</th>
                  <th className="tecnica py-2 pr-3 font-normal text-mineral-dim">Prazo</th><th className="tecnica py-2 font-normal text-mineral-dim">“A partir de”</th>
                </tr></thead>
                <tbody>
                  {s.planos.map((p) => (
                    <tr key={p.id} className="border-t border-line">
                      <td className="py-2 pr-3"><span className="text-paper">{p.nome}</span><span className="block text-xs text-mineral-dim">{p.nivel}{p.unidade ? ` · cobrança ${p.unidade}` : ''} · base {reais(base[id].planos.find((b) => b.id === p.id)?.preco ?? p.preco)}</span></td>
                      <td className="py-2 pr-3"><input aria-label={`Preço de ${p.nome}`} value={e.planos[p.id]?.preco ?? ''} inputMode="decimal" onChange={(ev) => alterar((r) => { r.servicos[id].planos[p.id]!.preco = ev.target.value; })} className={`${campoAdmin} w-32`} /></td>
                      <td className="py-2 pr-3"><input aria-label={`Prazo de ${p.nome}`} value={e.planos[p.id]?.prazo ?? ''} onChange={(ev) => alterar((r) => { r.servicos[id].planos[p.id]!.prazo = ev.target.value; })} className={campoAdmin} /></td>
                      <td className="py-2"><input type="checkbox" aria-label={`Mostrar “a partir de” em ${p.nome}`} checked={e.planos[p.id]?.aPartir ?? false} onChange={(ev) => alterar((r) => { r.servicos[id].planos[p.id]!.aPartir = ev.target.checked; })} className="h-5 w-5 accent-[#c9ff3d]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {s.mensais.length ? (
                <div>
                  <h3 className="tecnica text-mineral-dim">PLANOS MENSAIS</h3>
                  <ul className="mt-2 space-y-2">
                    {s.mensais.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-3 border-t border-line pt-2 text-sm">
                        <span>{m.nome}<span className="block text-xs text-mineral-dim">{m.unidade}</span></span>
                        <input aria-label={`Preço de ${m.nome}`} value={e.mensais[m.id]?.preco ?? ''} inputMode="decimal" onChange={(ev) => alterar((r) => { r.servicos[id].mensais[m.id]!.preco = ev.target.value; })} className={`${campoAdmin} w-32`} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div>
                <h3 className="tecnica text-mineral-dim">ADICIONAIS</h3>
                <ul className="mt-2 space-y-2">
                  {s.adicionais.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 border-t border-line pt-2 text-sm">
                      <span>{a.nome}{a.qualificador ? <span className="block text-xs text-mineral-dim">{a.qualificador}</span> : null}</span>
                      {typeof a.preco === 'number'
                        ? <input aria-label={`Preço de ${a.nome}`} value={e.adicionais[a.id]?.preco ?? ''} inputMode="decimal" onChange={(ev) => alterar((r) => { r.servicos[id].adicionais[a.id]!.preco = ev.target.value; })} className={`${campoAdmin} w-32`} />
                        : <span className="text-mineral">{a.preco}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
