'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { botaoPrimario, botaoSecundario, campoAdmin, painelAdmin } from './estilos';
import { ESTADO_ENVIO, NOME_REDE, REDES } from '@/lib/social/types';
import type { PainelSocial, PublicacaoSocial, Rede, TipoMidia } from '@/lib/social/types';
import { validarArquivo } from '@/lib/social/validation';

async function resposta<T>(r: Response): Promise<T> {
  const body = await r.json() as T & { error?: string };
  if (!r.ok) throw new Error(body.error || 'Não foi possível concluir. Tente atualizar a página.'); return body;
}
function enviar<T>(url: string, body: unknown = {}) { return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(resposta<T>); }
const PROVEDORES = [
  { id: 'meta', nome: 'Instagram e Facebook', detalhe: 'Instagram profissional vinculado a uma Página do Facebook.' },
  { id: 'youtube', nome: 'YouTube', detalhe: 'Seu canal do YouTube.' },
  { id: 'twitter', nome: 'X / Twitter', detalhe: 'Sua conta do X, com acesso à API.' },
  { id: 'tiktok', nome: 'TikTok', detalhe: 'Envio para você finalizar no aplicativo.' },
] as const;

function validarVideo(arquivo: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video'); const url = URL.createObjectURL(arquivo);
    const limpar = () => { URL.revokeObjectURL(url); video.removeAttribute('src'); video.load(); };
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const valido = Number.isFinite(video.duration) && video.duration >= 4 && video.duration <= 60 && video.videoHeight >= 960 && video.videoWidth >= 540 && Math.abs(video.videoWidth / video.videoHeight - 9 / 16) < 0.02;
      limpar();
      if (!valido) reject(new Error('Para compartilhar o mesmo vídeo nas redes, use um MP4 vertical 9:16, de 4 a 60 segundos, com pelo menos 540 × 960 pixels.')); else resolve();
    };
    video.onerror = () => { limpar(); reject(new Error('Não foi possível abrir este vídeo. Exporte em MP4 com vídeo H.264 e áudio AAC.')); };
    video.src = url;
  });
}

export function AdminRedesSociais({ inicial, erroInicial, conexao }: { inicial: PainelSocial | null; erroInicial: string; conexao: string }) {
  const [dados, setDados] = useState<PainelSocial | null>(inicial);
  const [erro, setErro] = useState(erroInicial || (conexao === 'erro' ? 'A conexão não foi concluída. Confira as credenciais, as URLs de retorno e as permissões do aplicativo nas instruções abaixo.' : ''));
  const [aviso, setAviso] = useState(conexao === 'ok' ? 'Autorização recebida. Confira as contas abaixo.' : '');
  const [arquivo, setArquivo] = useState<File | null>(null); const [tipo, setTipo] = useState<TipoMidia>('video');
  const [previa, setPrevia] = useState(''); const [legenda, setLegenda] = useState('');
  const [escolhas, setEscolhas] = useState<Partial<Record<Rede, string>>>(() => Object.fromEntries(REDES.map((r) => [r, inicial?.contas.find((c) => c.rede === r && c.disponivel)?.id || ''])));
  const [ocupado, setOcupado] = useState(false); const [progresso, setProgresso] = useState<number | null>(null);
  const [registrada, setRegistrada] = useState(false);
  const identificador = useRef(''); const arquivoId = useRef(''); const campoArquivo = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    const data = await fetch('/api/admin/social', { cache: 'no-store' }).then(resposta<PainelSocial>);
    setDados(data);
  }, []);
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);

  const selecionadas = (dados?.contas || []).filter((c) => c.disponivel && escolhas[c.rede] === c.id && !(tipo === 'image' && c.rede === 'youtube'));
  const limiteX = selecionadas.some((c) => c.rede === 'twitter');
  const legendaInvalida = !legenda.trim() || legenda.length > 2200 || (limiteX && Array.from(legenda.trim()).length > 280);

  async function selecionar(file: File | undefined) {
    if (!file) return;
    setErro(''); setAviso(''); setOcupado(true);
    try {
      const tipo = validarArquivo(file.name, file.type, file.size);
      if (tipo === 'video') await validarVideo(file);
      setArquivo(file); setTipo(tipo); setPrevia(URL.createObjectURL(file));
      arquivoId.current = ''; identificador.current = crypto.randomUUID(); setRegistrada(false); setProgresso(null);
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível selecionar este arquivo.'); if (campoArquivo.current) campoArquivo.current.value = ''; }
    finally { setOcupado(false); }
  }
  async function executar(item: PublicacaoSocial, verificar = false) {
    const envios = item.envios.filter((e) => e.estado === (verificar ? 'aceito' : 'pendente'));
    const resultados = await Promise.allSettled(envios.map((e) => enviar(`/api/admin/social/envios/${e.id}${verificar ? '?verificar=1' : ''}`)));
    await carregar();
    if (resultados.some((r) => r.status === 'rejected')) setErro('Uma ou mais redes não confirmaram o envio. Confira o histórico antes de reenviar.');
  }
  async function publicar() {
    if (!arquivo || legendaInvalida || !selecionadas.length || registrada) return;
    setOcupado(true); setErro(''); setAviso('Enviando o arquivo…');
    try {
      if (!arquivoId.current) {
        const id = crypto.randomUUID(); const extensao = arquivo.name.split('.').pop()!.toLowerCase();
        await upload(`social/${id}.${extensao}`, arquivo, { access: 'public', contentType: arquivo.type, multipart: arquivo.size > 4 * 1024 * 1024, handleUploadUrl: '/api/admin/social/upload',
          clientPayload: JSON.stringify({ nome: arquivo.name, mime: arquivo.type, tamanho: arquivo.size }), onUploadProgress: (p) => setProgresso(Math.round(p.percentage)),
        });
        await enviar('/api/admin/social/upload/confirmar', { id }); arquivoId.current = id;
      }
      setAviso('Enviando para as redes selecionadas…');
      const { item } = await enviar<{ item: PublicacaoSocial }>('/api/admin/social/publicacoes', { id: identificador.current, arquivoId: arquivoId.current, legenda, contas: selecionadas.map((c) => c.id) });
      setRegistrada(true); await executar(item);
      setAviso('Envios registrados. Confira o resultado de cada rede no histórico abaixo.');
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível confirmar o envio. Confira o histórico.'); setAviso(''); await carregar().catch(() => undefined); }
    finally { setOcupado(false); setProgresso(null); }
  }
  async function atualizar(item: PublicacaoSocial, verificar: boolean) {
    setOcupado(true); setErro('');
    try { await executar(item, verificar); } catch { setErro('Não foi possível atualizar os resultados.'); } finally { setOcupado(false); }
  }
  async function conectar(provedor: string) {
    setOcupado(true); setErro('');
    try {
      const { url } = await enviar<{ url: string }>(`/api/admin/social/oauth/${provedor}`);
      // Navegação explícita: não depende de redirecionamento externo de um formulário.
      window.location.assign(url);
    } catch (e) { setErro(e instanceof Error ? e.message : 'Não foi possível iniciar a conexão.'); setOcupado(false); }
  }
  function nova() {
    setArquivo(null); setPrevia(''); setLegenda(''); setRegistrada(false); arquivoId.current = ''; identificador.current = crypto.randomUUID(); setErro(''); setAviso('');
    if (campoArquivo.current) campoArquivo.current.value = '';
  }

  return <>
    {erro ? <p role="alert" className="mb-5 rounded-xl border border-red-400/50 p-4 text-red-200">{erro}</p> : null}
    {aviso ? <p role="status" className="mb-5 rounded-xl border border-signal/40 p-4 text-paper">{aviso}</p> : null}
    <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
      <section className={painelAdmin} aria-labelledby="publicacao-titulo">
        <h2 id="publicacao-titulo" className="text-2xl">Nova publicação</h2>
        <form className="mt-6 space-y-6" onSubmit={(e) => { e.preventDefault(); void publicar(); }}>
          <div>
            <label htmlFor="social-arquivo" className="mb-2 block text-sm">1. Escolha uma imagem ou um vídeo</label>
            <input ref={campoArquivo} id="social-arquivo" type="file" accept="image/jpeg,image/png,video/mp4" disabled={ocupado || registrada} onChange={(e) => void selecionar(e.target.files?.[0])}
              className="block w-full min-w-0 rounded-xl border border-dashed border-line-strong bg-ink p-4 text-sm text-mineral file:mr-4 file:rounded-full file:border-0 file:bg-raised file:px-4 file:py-3 file:text-paper" />
            <p className="mt-2 text-sm text-mineral">Imagem JPG/PNG até 5 MB. Vídeo MP4 vertical 9:16, de 4 a 60 segundos, até 500 MB.</p>
          </div>
          {arquivo && previa ? <figure className="overflow-hidden rounded-xl border border-line bg-ink">
            {/* Prévia local do arquivo escolhido, nunca uma imagem remota. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {tipo === 'image' ? <img src={previa} alt="Prévia da imagem a publicar" className="max-h-80 w-full object-contain" /> : <video src={previa} controls preload="metadata" className="max-h-80 w-full" />}
            <figcaption className="break-words px-4 py-3 text-sm text-mineral">{arquivo.name} · {(arquivo.size / 1024 / 1024).toFixed(1)} MB</figcaption>
          </figure> : null}
          <div>
            <label htmlFor="social-legenda" className="mb-2 block text-sm">2. Escreva a legenda</label>
            <textarea id="social-legenda" value={legenda} maxLength={2200} rows={6} disabled={ocupado || registrada} onChange={(e) => { setLegenda(e.target.value); }}
              placeholder="A mesma legenda será usada nas redes selecionadas." className={`${campoAdmin} resize-y py-3`} aria-describedby="social-legenda-ajuda" />
            <p id="social-legenda-ajuda" className={`mt-2 text-sm ${limiteX && Array.from(legenda.trim()).length > 280 ? 'text-red-200' : 'text-mineral'}`}>
              {Array.from(legenda.trim()).length} / {limiteX ? '280' : '2.200'} caracteres{limiteX ? ' · limite comum com o X selecionado.' : '.'}
            </p>
          </div>
          <fieldset disabled={ocupado || registrada}><legend className="mb-3 text-sm">3. Publicar em</legend>
            <div className="space-y-2">{REDES.map((rede) => {
              const contas = dados?.contas.filter((c) => c.rede === rede) || []; const escolha = contas.find((c) => c.id === escolhas[rede]);
              const semImagem = tipo === 'image' && rede === 'youtube'; const habilitada = contas.some((c) => c.disponivel) && !semImagem;
              return <div key={rede} className="rounded-xl border border-line px-4 py-3">
                <label className="flex min-h-8 cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={habilitada && Boolean(escolha?.disponivel)} disabled={!habilitada} className="h-5 w-5 accent-[var(--color-signal)]" onChange={(e) => setEscolhas((v) => ({ ...v, [rede]: e.target.checked ? contas.find((c) => c.disponivel)?.id || '' : '' }))} />
                  <span className="text-sm">{NOME_REDE[rede]}</span>
                  <span className="ml-auto text-right text-xs text-mineral">{semImagem ? 'Somente vídeos' : escolha?.disponivel ? escolha.nome : contas.length ? 'Selecione ou reconecte' : 'Não conectada'}</span>
                </label>
                {contas.length > 1 && habilitada ? <select aria-label={`Conta de ${NOME_REDE[rede]}`} className={`${campoAdmin} mt-2`} value={escolhas[rede] || ''} onChange={(e) => setEscolhas((v) => ({ ...v, [rede]: e.target.value }))}>
                  <option value="">Não publicar nesta rede</option>{contas.map((c) => <option key={c.id} value={c.id} disabled={!c.disponivel}>{c.nome}{!c.disponivel ? ' — reconectar' : ''}</option>)}
                </select> : null}
              </div>;
            })}</div>
          </fieldset>
          {tipo === 'image' ? <p className="text-sm text-mineral">O YouTube não recebe imagens pela API. A imagem será enviada às demais redes selecionadas.</p> : <p className="text-sm text-mineral">No YouTube, o título vem do início da legenda. O envio solicita publicação pública; confira também as configurações de público do seu canal.</p>}
          {selecionadas.some((c) => c.rede === 'tiktok') ? <p className="rounded-xl border border-line-strong p-4 text-sm text-mineral">No TikTok, você recebe o arquivo no aplicativo para revisar e publicar. Para vídeos, copie a legenda do painel ao finalizar.</p> : null}
          {dados?.avisos.map((a) => <p key={a} className="text-sm text-mineral">{a}</p>)}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className={botaoPrimario} disabled={ocupado || registrada || !arquivo || legendaInvalida || !selecionadas.length || !dados?.armazenamento}>{ocupado ? progresso !== null ? `ENVIANDO ARQUIVO · ${progresso}%` : 'AGUARDE…' : `PUBLICAR EM ${selecionadas.length} ${selecionadas.length === 1 ? 'REDE' : 'REDES'} →`}</button>
            {registrada ? <button type="button" className={botaoSecundario} disabled={ocupado} onClick={nova}>Nova publicação</button> : null}
          </div>
          {progresso !== null ? <progress max={100} value={progresso} aria-label="Progresso do envio do arquivo" className="w-full accent-[var(--color-signal)]" /> : null}
        </form>
      </section>
      <aside className={painelAdmin} aria-labelledby="contas-titulo">
        <h2 id="contas-titulo" className="text-2xl">Suas contas</h2>
        <p className="mt-3 text-sm text-mineral">Conecte uma vez. Depois, publique por aqui. A autorização acontece na própria rede.</p>
        <ul className="mt-5 divide-y divide-line">{PROVEDORES.map((p) => <li key={p.id} className="py-4">
          <h3 className="text-base">{p.nome}</h3><p className="mt-1 text-sm text-mineral">{p.detalhe}</p>
          <div className="mt-3"><button type="button" className={botaoSecundario} disabled={ocupado || !dados?.provedores[p.id]} onClick={() => void conectar(p.id)}>Conectar / reconectar</button></div>
          {dados && !dados.provedores[p.id] ? <p className="mt-2 text-xs text-mineral">Aplicativo ainda não configurado.</p> : null}
        </li>)}</ul>
        {dados?.contas.length ? <ul className="mt-4 space-y-3 border-t border-line pt-4">{dados.contas.map((c) => <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>{NOME_REDE[c.rede]} · {c.nome}<span className="block text-xs text-mineral">{c.disponivel ? 'Autorização salva' : c.motivo}</span></span>
          <button type="button" disabled={ocupado} className={botaoSecundario} onClick={() => { setOcupado(true); void fetch('/api/admin/social/contas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: c.id }) }).then(resposta).then(carregar).catch(() => setErro('Não foi possível desconectar.')).finally(() => setOcupado(false)); }}>Desconectar</button>
        </li>)}</ul> : null}
        <details className="mt-6 border-t border-line pt-5"><summary className="cursor-pointer text-sm text-mineral">Configuração inicial</summary>
          <div className="mt-4 space-y-3 break-words text-sm text-mineral">
            <p>É necessário cadastrar seu aplicativo nos consoles Meta, Google, X e TikTok e configurar as credenciais na hospedagem. Não envie suas senhas ou chaves pelo chat.</p>
            <p>As instruções completas estão no arquivo <code>docs/REDES_SOCIAIS.md</code> do repositório.</p>
            <p>Facebook: Página administrada por você. Instagram: conta profissional ligada à Página. TikTok: permissão de upload aprovada; para imagens, domínio verificado. O X exige acesso pago à API.</p>
          </div>
        </details>
      </aside>
    </div>
    <section className={`${painelAdmin} mt-7`} aria-labelledby="historico-titulo">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="historico-titulo" className="text-2xl">Histórico de envios</h2><button className={botaoSecundario} disabled={ocupado} onClick={() => { setOcupado(true); void carregar().catch(() => setErro('Não foi possível atualizar o histórico.')).finally(() => setOcupado(false)); }}>Atualizar histórico</button></div>
      {!dados ? <p className="mt-5 text-mineral">Carregando…</p> : !dados.publicacoes.length ? <p className="mt-5 text-mineral">Sua primeira publicação aparecerá aqui.</p> : <ul className="mt-5 divide-y divide-line">{dados.publicacoes.map((p) => <li key={p.id} className="py-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="break-words text-sm text-mineral">{new Date(p.criadoEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} · {p.arquivoNome}</p><p className="mt-2 max-w-[75ch] whitespace-pre-wrap break-words">{p.legenda}</p></div>
          <button className={botaoSecundario} onClick={() => void navigator.clipboard.writeText(p.legenda).then(() => setAviso('Legenda copiada.')).catch(() => setErro('Não foi possível copiar. Selecione o texto da legenda.'))}>Copiar legenda</button></div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{p.envios.map((e) => <li key={e.id} className="rounded-xl border border-line p-4 text-sm">
          <p>{NOME_REDE[e.rede]} · {e.contaNome}</p><p className={`mt-2 ${e.estado === 'publicado' ? 'text-signal' : 'text-mineral'}`}>{ESTADO_ENVIO[e.estado]}</p>
          {e.erro ? <p className="mt-2 text-xs text-mineral">{e.erro}</p> : null}
        </li>)}</ul>
        <div className="mt-4 flex flex-wrap gap-3">
          {p.envios.some((e) => e.estado === 'pendente') ? <button className={botaoSecundario} disabled={ocupado} onClick={() => void atualizar(p, false)}>Continuar envios pendentes</button> : null}
          {p.envios.some((e) => e.estado === 'aceito') ? <button className={botaoSecundario} disabled={ocupado} onClick={() => void atualizar(p, true)}>Atualizar resultados</button> : null}
        </div>
      </li>)}</ul>}
    </section>
  </>;
}
