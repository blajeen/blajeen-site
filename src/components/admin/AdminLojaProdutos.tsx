'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  CATEGORIA_ROTULO, CATEGORIAS, DISPONIBILIDADE_ROTULO, DISPONIBILIDADES, formatarPreco, lerPreco, mostraPreco, precoInicial,
  type Categoria, type Disponibilidade, type ImagemProduto, type Produto, type StatusProduto,
} from '@/lib/loja/tipos';
import { botaoPrimario, botaoSecundario, campoAdmin, painelAdmin } from './estilos';

type OpcaoNoFormulario = { id: string; rotulo: string; preco: string; digital: boolean };
type Formulario = {
  id: string | null;
  slug: string;
  nome: string;
  resumo: string;
  descricao: string;
  categoria: Categoria;
  colecao: string;
  disponibilidade: Disponibilidade;
  status: StatusProduto;
  rotuloOpcoes: string;
  ordem: string;
  opcoes: OpcaoNoFormulario[];
  envio: { pesoKg: string; alturaCm: string; larguraCm: string; comprimentoCm: string };
  imagens: ImagemProduto[];
};

const precoEmTexto = (centavos: number) => (centavos ? (centavos / 100).toFixed(2).replace('.', ',') : '');
const numeroEmTexto = (n: number) => String(n).replace('.', ',');

function doProduto(p: Produto): Formulario {
  return {
    id: p.id, slug: p.slug, nome: p.nome, resumo: p.resumo, descricao: p.descricao, categoria: p.categoria, colecao: p.colecao,
    disponibilidade: p.disponibilidade, status: p.status, rotuloOpcoes: p.rotuloOpcoes, ordem: String(p.ordem),
    opcoes: p.opcoes.map((o) => ({ id: o.id, rotulo: o.rotulo, preco: precoEmTexto(o.precoCentavos), digital: o.digital })),
    envio: {
      pesoKg: numeroEmTexto(p.envio.pesoKg), alturaCm: numeroEmTexto(p.envio.alturaCm),
      larguraCm: numeroEmTexto(p.envio.larguraCm), comprimentoCm: numeroEmTexto(p.envio.comprimentoCm),
    },
    imagens: p.imagens,
  };
}

const NOVO: Formulario = {
  id: null, slug: '', nome: '', resumo: '', descricao: '', categoria: 'colecionaveis', colecao: '', disponibilidade: 'EM_BREVE',
  status: 'RASCUNHO', rotuloOpcoes: '', ordem: '500', opcoes: [{ id: '', rotulo: 'Padrão', preco: '', digital: false }],
  envio: { pesoKg: '0,5', alturaCm: '10', larguraCm: '15', comprimentoCm: '20' }, imagens: [],
};

const rotulo = 'grid gap-2 text-sm text-mineral';

export function AdminLojaProdutos() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState<Categoria | 'TODAS'>('TODAS');
  const [form, setForm] = useState<Formulario | null>(null);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [foto, setFoto] = useState<File | null>(null);
  const [altDaFoto, setAltDaFoto] = useState('');

  const carregar = useCallback(async () => {
    const resposta = await fetch('/api/admin/loja/produtos', { cache: 'no-store' });
    if (resposta.status === 401) { router.push('/admin/login'); return []; }
    const dados = await resposta.json() as { itens?: Produto[]; error?: string };
    if (!resposta.ok) throw new Error(dados.error ?? 'Não foi possível carregar os produtos.');
    setProdutos(dados.itens ?? []);
    setCarregando(false);
    return dados.itens ?? [];
  }, [router]);

  useEffect(() => {
    // A carga assíncrona atualiza o estado somente quando a resposta chega.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar().catch((e: unknown) => { setErro(e instanceof Error ? e.message : 'Falha ao carregar.'); setCarregando(false); });
  }, [carregar]);

  const visiveis = produtos.filter((p) => filtro === 'TODAS' || p.categoria === filtro);
  const muda = <K extends keyof Formulario>(chave: K, valor: Formulario[K]) => setForm((f) => (f ? { ...f, [chave]: valor } : f));
  const mudaOpcao = (i: number, alteracao: Partial<OpcaoNoFormulario>) =>
    setForm((f) => (f ? { ...f, opcoes: f.opcoes.map((o, j) => (j === i ? { ...o, ...alteracao } : o)) } : f));

  function abrir(p: Produto | null) {
    setForm(p ? doProduto(p) : { ...NOVO }); setErro(''); setAviso(''); setFoto(null); setAltDaFoto('');
  }

  function aplicar(atualizado: Produto, mensagem: string) {
    setProdutos((lista) => (lista.some((p) => p.id === atualizado.id) ? lista.map((p) => (p.id === atualizado.id ? atualizado : p)) : [...lista, atualizado]));
    setForm(doProduto(atualizado)); setAviso(mensagem);
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    if (!form) return;
    setErro(''); setAviso('');
    const opcoes = [];
    for (const o of form.opcoes) {
      const preco = o.preco.trim() ? lerPreco(o.preco) : 0;
      if (preco === null) { setErro(`Confira o preço de “${o.rotulo || 'opção'}”. Use, por exemplo, 89,90.`); return; }
      opcoes.push({ id: o.id, rotulo: o.rotulo, precoCentavos: preco, digital: o.digital });
    }
    const corpo = {
      nome: form.nome, slug: form.slug, resumo: form.resumo, descricao: form.descricao, categoria: form.categoria, colecao: form.colecao,
      disponibilidade: form.disponibilidade, status: form.status, rotuloOpcoes: form.rotuloOpcoes, ordem: Number(form.ordem) || 0, opcoes,
      envio: form.envio,
      ...(form.id ? { imagens: form.imagens.map(({ id, alt }) => ({ id, alt })) } : {}),
    };
    setSalvando(true);
    const resposta = await fetch(form.id ? `/api/admin/loja/produtos/${form.id}` : '/api/admin/loja/produtos', {
      method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo),
    });
    const dados = await resposta.json() as { item?: Produto; error?: string };
    setSalvando(false);
    if (!resposta.ok || !dados.item) { setErro(dados.error ?? 'Não foi possível salvar.'); return; }
    aplicar(dados.item, form.id ? 'Produto salvo. O site já mostra a versão nova.' : 'Produto criado. Agora você pode enviar fotos.');
  }

  async function excluir() {
    if (!form?.id || !window.confirm(`Excluir “${form.nome}”? Ele sai da loja e as fotos enviadas são apagadas.`)) return;
    const resposta = await fetch(`/api/admin/loja/produtos/${form.id}`, { method: 'DELETE' });
    if (!resposta.ok) { setErro('Não foi possível excluir.'); return; }
    setForm(null); await carregar();
  }

  async function enviarFoto() {
    if (!form?.id || !foto) return;
    setErro(''); setAviso('');
    const dados = new FormData();
    dados.set('arquivo', foto); dados.set('alt', altDaFoto);
    const resposta = await fetch(`/api/admin/loja/produtos/${form.id}/imagens`, { method: 'POST', body: dados });
    const retorno = await resposta.json() as { item?: Produto; error?: string };
    if (!resposta.ok || !retorno.item) { setErro(retorno.error ?? 'Não foi possível enviar a foto.'); return; }
    setFoto(null); setAltDaFoto('');
    aplicar(retorno.item, 'Foto enviada.');
  }

  async function removerFoto(imagem: ImagemProduto) {
    if (!form?.id || !window.confirm('Remover esta foto do produto?')) return;
    const resposta = await fetch(`/api/admin/loja/produtos/${form.id}/imagens/${imagem.id}`, { method: 'DELETE' });
    const retorno = await resposta.json() as { item?: Produto; error?: string };
    if (!resposta.ok || !retorno.item) { setErro(retorno.error ?? 'Não foi possível remover a foto.'); return; }
    aplicar(retorno.item, 'Foto removida.');
  }

  function moverFoto(i: number, direcao: -1 | 1) {
    setForm((f) => {
      if (!f) return f;
      const imagens = [...f.imagens];
      const destino = i + direcao;
      if (destino < 0 || destino >= imagens.length) return f;
      [imagens[i], imagens[destino]] = [imagens[destino]!, imagens[i]!];
      return { ...f, imagens };
    });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
      <section aria-labelledby="lista-produtos" className={painelAdmin}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="lista-produtos" className="text-2xl">Produtos</h2>
          <button type="button" onClick={() => abrir(null)} className={botaoPrimario}>NOVO PRODUTO</button>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-mineral">Mostrar
          <select value={filtro} onChange={(e) => setFiltro(e.target.value as Categoria | 'TODAS')} className={`${campoAdmin} w-auto`}>
            <option value="TODAS">Todas as categorias</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{CATEGORIA_ROTULO[c]}</option>)}
          </select>
        </label>
        {carregando ? <p className="mt-6 text-mineral">Carregando…</p> : (
          <ul className="mt-5 space-y-2">
            {visiveis.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => abrir(p)} aria-current={form?.id === p.id ? 'true' : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${form?.id === p.id ? 'border-signal bg-raised' : 'border-line-strong hover:border-mineral-dim'}`}>
                  <span className="relative size-12 flex-none overflow-hidden rounded-xl border border-line bg-ink">
                    {p.imagens[0] ? <Image src={p.imagens[0].url} alt="" fill sizes="48px" className="object-cover" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{p.nome}</span>
                    <span className="mt-0.5 block text-sm text-mineral">
                      {DISPONIBILIDADE_ROTULO[p.disponibilidade]}{mostraPreco(p) ? ` · ${formatarPreco(precoInicial(p))}` : ''}{p.status === 'RASCUNHO' ? ' · rascunho' : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="editor-produto" className={painelAdmin}>
        {form ? (
          <form onSubmit={salvar}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 id="editor-produto" className="text-3xl leading-tight">{form.id ? form.nome || 'Produto' : 'Novo produto'}</h2>
              {form.id && form.status === 'PUBLICADO' ? <a href={`/loja/${form.slug}`} target="_blank" rel="noreferrer" className={botaoSecundario}>Ver na loja ↗</a> : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className={`${rotulo} sm:col-span-2`}>Nome<input value={form.nome} onChange={(e) => muda('nome', e.target.value)} required className={campoAdmin} /></label>
              <label className={rotulo}>Disponibilidade
                <select value={form.disponibilidade} onChange={(e) => muda('disponibilidade', e.target.value as Disponibilidade)} className={campoAdmin}>
                  {DISPONIBILIDADES.map((d) => <option key={d} value={d}>{DISPONIBILIDADE_ROTULO[d]}</option>)}
                </select>
              </label>
              <label className={rotulo}>Na loja
                <select value={form.status} onChange={(e) => muda('status', e.target.value as StatusProduto)} className={campoAdmin}>
                  <option value="PUBLICADO">Publicado (aparece no site)</option>
                  <option value="RASCUNHO">Rascunho (escondido)</option>
                </select>
              </label>
              <label className={rotulo}>Categoria
                <select value={form.categoria} onChange={(e) => muda('categoria', e.target.value as Categoria)} className={campoAdmin}>
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{CATEGORIA_ROTULO[c]}</option>)}
                </select>
              </label>
              <label className={rotulo}>Jogo ou linha<input value={form.colecao} onChange={(e) => muda('colecao', e.target.value)} placeholder="Ex.: Morvelio" className={campoAdmin} /></label>
              {form.categoria === 'software' ? (
                <p className="text-sm leading-relaxed text-mineral sm:col-span-2">
                  Software é venda única: não tem quantidade, e quando o pagamento é confirmado (pelo Asaas ou marcando o pedido
                  como pago) ele vira “Esgotado” sozinho e aparece como “Vendido”. A demonstração, os recursos e as legendas das
                  telas vêm da ficha do sistema no código, pelo endereço da página: não troque o endereço dos sistemas que já têm ficha.
                </p>
              ) : null}
              <label className={`${rotulo} sm:col-span-2`}>Resumo (aparece no cartão)<input value={form.resumo} onChange={(e) => muda('resumo', e.target.value)} maxLength={240} className={campoAdmin} /></label>
              <label className={`${rotulo} sm:col-span-2`}>Descrição (uma linha em branco separa os parágrafos)
                <textarea value={form.descricao} onChange={(e) => muda('descricao', e.target.value)} rows={6} className={`${campoAdmin} p-3 leading-relaxed`} />
              </label>
            </div>

            <fieldset className="mt-7 rounded-2xl border border-line p-5">
              <legend className="tecnica px-2 text-mineral-dim">OPÇÕES E PREÇOS</legend>
              <p className="text-sm text-mineral">
                {form.disponibilidade === 'EM_BREVE'
                  ? 'Em breve: o preço pode ficar em branco. Para tirar de “Em breve”, toda opção precisa de preço.'
                  : 'Cada opção tem o próprio preço. Use, por exemplo, 89,90.'}
              </p>
              {form.opcoes.length > 1 ? (
                <label className={`${rotulo} mt-4 max-w-xs`}>Como as opções se chamam<input value={form.rotuloOpcoes} onChange={(e) => muda('rotuloOpcoes', e.target.value)} placeholder="Tamanho, Versão…" className={campoAdmin} /></label>
              ) : null}
              <ul className="mt-4 grid gap-3">
                {form.opcoes.map((o, i) => (
                  <li key={i} className="grid items-end gap-3 sm:grid-cols-[1fr_9rem_auto_auto]">
                    <label className={rotulo}>Opção<input value={o.rotulo} onChange={(e) => mudaOpcao(i, { rotulo: e.target.value })} required className={campoAdmin} /></label>
                    <label className={rotulo}>Preço (R$)<input value={o.preco} onChange={(e) => mudaOpcao(i, { preco: e.target.value })} inputMode="decimal" placeholder="0,00" className={campoAdmin} /></label>
                    <label className="flex min-h-11 items-center gap-2 text-sm text-mineral"><input type="checkbox" checked={o.digital} onChange={(e) => mudaOpcao(i, { digital: e.target.checked })} /> Digital</label>
                    <button type="button" disabled={form.opcoes.length === 1} onClick={() => muda('opcoes', form.opcoes.filter((_, j) => j !== i))}
                      className="min-h-11 px-2 text-sm text-red-300 disabled:opacity-30">Remover</button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => muda('opcoes', [...form.opcoes, { id: '', rotulo: '', preco: '', digital: false }])} className={`${botaoSecundario} mt-4`}>
                Adicionar opção
              </button>
            </fieldset>

            <fieldset className="mt-5 rounded-2xl border border-line p-5">
              <legend className="tecnica px-2 text-mineral-dim">PACOTE PARA O FRETE</legend>
              <p className="text-sm text-mineral">O produto já embalado. É o que o Melhor Envio usa para cotar o frete (opções digitais não contam).</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {([['pesoKg', 'Peso (kg)'], ['alturaCm', 'Altura (cm)'], ['larguraCm', 'Largura (cm)'], ['comprimentoCm', 'Comprimento (cm)']] as const).map(([chave, nome]) => (
                  <label key={chave} className={rotulo}>{nome}
                    <input value={form.envio[chave]} onChange={(e) => muda('envio', { ...form.envio, [chave]: e.target.value })} inputMode="decimal" required className={campoAdmin} />
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-5 rounded-2xl border border-line p-5">
              <legend className="tecnica px-2 text-mineral-dim">FOTOS</legend>
              {form.id ? (
                <>
                  {form.imagens.length ? (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {form.imagens.map((imagem, i) => (
                        <li key={imagem.id} className="flex gap-3 rounded-2xl border border-line p-3">
                          <span className="relative size-20 flex-none overflow-hidden rounded-xl border border-line bg-ink">
                            <Image src={imagem.url} alt="" fill sizes="80px" className="object-cover" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <label className="grid gap-1 text-xs text-mineral">Descrição da foto (para leitores de tela)
                              <input value={imagem.alt} onChange={(e) => muda('imagens', form.imagens.map((x) => (x.id === imagem.id ? { ...x, alt: e.target.value } : x)))}
                                className={`${campoAdmin} min-h-9 text-xs`} />
                            </label>
                            <div className="mt-2 flex flex-wrap gap-1 text-sm">
                              <button type="button" aria-label="Mover para antes" disabled={i === 0} onClick={() => moverFoto(i, -1)} className="min-h-9 rounded-full border border-line-strong px-3 disabled:opacity-30">↑</button>
                              <button type="button" aria-label="Mover para depois" disabled={i === form.imagens.length - 1} onClick={() => moverFoto(i, 1)} className="min-h-9 rounded-full border border-line-strong px-3 disabled:opacity-30">↓</button>
                              <button type="button" onClick={() => void removerFoto(imagem)} className="min-h-9 px-2 text-red-300">Remover</button>
                            </div>
                            {i === 0 ? <p className="tecnica mt-1 text-signal">CAPA</p> : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-mineral">Sem fotos ainda.</p>}
                  <p className="mt-3 text-xs text-mineral-dim">A primeira foto é a capa. Ordem e descrições são salvas com “Salvar produto”.</p>
                  <div className="mt-5 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <label className={rotulo}>Nova foto (PNG, JPEG ou WEBP, até 4 MB)
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} className="text-sm text-paper" />
                    </label>
                    <label className={rotulo}>Descrição<input value={altDaFoto} onChange={(e) => setAltDaFoto(e.target.value)} placeholder="Ex.: camiseta preta, de frente" className={campoAdmin} /></label>
                    <button type="button" disabled={!foto} onClick={() => void enviarFoto()} className={botaoSecundario}>Enviar foto</button>
                  </div>
                </>
              ) : <p className="text-sm text-mineral">Salve o produto primeiro; depois as fotos podem ser enviadas aqui.</p>}
            </fieldset>

            <details className="mt-5 rounded-2xl border border-line p-5">
              <summary className="cursor-pointer text-sm text-mineral">Endereço e ordem na vitrine</summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className={rotulo}>Endereço da página (/loja/…)<input value={form.slug} onChange={(e) => muda('slug', e.target.value)} placeholder="gerado pelo nome" className={campoAdmin} /></label>
                <label className={rotulo}>Ordem (menor aparece antes)<input value={form.ordem} onChange={(e) => muda('ordem', e.target.value)} inputMode="numeric" className={campoAdmin} /></label>
              </div>
            </details>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
              <button type="submit" disabled={salvando} className={botaoPrimario}>{salvando ? 'SALVANDO…' : 'SALVAR PRODUTO'}</button>
              {form.id ? <button type="button" onClick={() => void excluir()} className="min-h-11 px-2 text-sm text-red-300">Excluir produto</button> : null}
            </div>
            {erro ? <p role="alert" className="mt-4 text-sm text-red-300">{erro}</p> : null}
            {aviso ? <p role="status" className="mt-4 text-sm text-signal">{aviso}</p> : null}
          </form>
        ) : (
          <div>
            <h2 id="editor-produto" className="text-2xl">Escolha um produto</h2>
            <p className="mt-3 text-mineral">
              Edite nome, descrição, preço, fotos e o pacote do frete. Para começar a vender um item “Em breve”, defina o preço e troque a
              disponibilidade.
            </p>
            {erro ? <p role="alert" className="mt-4 text-sm text-red-300">{erro}</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}
