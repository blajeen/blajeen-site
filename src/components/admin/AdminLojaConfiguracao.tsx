'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { ConfiguracaoLoja } from '@/lib/loja/tipos';
import { botaoPrimario, campoAdmin, painelAdmin } from './estilos';

type Integracoes = { asaas: boolean; asaasAmbiente: string; asaasWebhook: boolean; melhorEnvio: boolean; melhorEnvioAmbiente: string };

function Situacao({ ligado, rotulo, detalhe }: { ligado: boolean; rotulo: string; detalhe: string }) {
  return (
    <div className={`rounded-2xl border p-5 ${ligado ? 'border-signal/50' : 'border-line-strong'}`}>
      <p className={`tecnica ${ligado ? 'text-signal' : 'text-mineral-dim'}`}>{ligado ? 'LIGADO' : 'DESLIGADO'}</p>
      <p className="mt-2 text-lg">{rotulo}</p>
      <p className="mt-1 text-sm text-mineral">{detalhe}</p>
    </div>
  );
}

export function AdminLojaConfiguracao() {
  const router = useRouter();
  const [cep, setCep] = useState('');
  const [dias, setDias] = useState('3');
  const [integracoes, setIntegracoes] = useState<Integracoes | null>(null);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [webhook, setWebhook] = useState('');

  const carregar = useCallback(async () => {
    const resposta = await fetch('/api/admin/loja/configuracao', { cache: 'no-store' });
    if (resposta.status === 401) { router.push('/admin/login'); return; }
    const dados = await resposta.json() as { configuracao?: ConfiguracaoLoja; integracoes?: Integracoes; error?: string };
    if (!resposta.ok || !dados.configuracao) throw new Error(dados.error ?? 'Não foi possível carregar a configuração.');
    setCep(dados.configuracao.cepOrigem); setDias(String(dados.configuracao.diasParaPostar));
    setIntegracoes(dados.integracoes ?? null);
    setWebhook(`${window.location.origin}/api/loja/asaas`);
  }, [router]);

  useEffect(() => {
    // A carga assíncrona atualiza o estado somente quando a resposta chega.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar().catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Falha ao carregar.'));
  }, [carregar]);

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setErro(''); setAviso('');
    const resposta = await fetch('/api/admin/loja/configuracao', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cepOrigem: cep, diasParaPostar: Number(dias) }),
    });
    const dados = await resposta.json() as { error?: string };
    if (!resposta.ok) { setErro(dados.error ?? 'Não foi possível salvar.'); return; }
    setAviso('Configuração salva.');
  }

  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <section aria-labelledby="config-frete" className={painelAdmin}>
        <h2 id="config-frete" className="text-2xl">Envio</h2>
        <form onSubmit={salvar} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-mineral">CEP de onde os pacotes saem
            <input value={cep} onChange={(e) => setCep(e.target.value)} inputMode="numeric" placeholder="00000-000" className={campoAdmin} />
          </label>
          <label className="grid gap-2 text-sm text-mineral">Dias úteis até postar
            <input value={dias} onChange={(e) => setDias(e.target.value)} inputMode="numeric" className={campoAdmin} />
            <span className="text-xs text-mineral-dim">Somados ao prazo da transportadora no checkout.</span>
          </label>
          <div className="sm:col-span-2"><button type="submit" className={botaoPrimario}>SALVAR</button></div>
        </form>
        {erro ? <p role="alert" className="mt-4 text-sm text-red-300">{erro}</p> : null}
        {aviso ? <p role="status" className="mt-4 text-sm text-signal">{aviso}</p> : null}
      </section>

      <section aria-labelledby="config-integracoes" className={painelAdmin}>
        <h2 id="config-integracoes" className="text-2xl">Integrações</h2>
        {integracoes ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Situacao ligado={integracoes.asaas} rotulo="Pagamento · Asaas"
                detalhe={integracoes.asaas ? `Ambiente: ${integracoes.asaasAmbiente}.` : 'Sem a chave, os pedidos chegam sem pagamento online.'} />
              <Situacao ligado={integracoes.melhorEnvio} rotulo="Frete · Melhor Envio"
                detalhe={integracoes.melhorEnvio ? `Ambiente: ${integracoes.melhorEnvioAmbiente}.` : 'Sem o token, o frete fica a combinar e o pedido não vai para o pagamento online.'} />
            </div>
            <div className={`mt-4 rounded-2xl border p-5 text-sm leading-relaxed ${integracoes.asaasWebhook ? 'border-line-strong' : 'border-red-400/40'}`}>
              <p className="tecnica text-mineral-dim">WEBHOOK DO ASAAS {integracoes.asaasWebhook ? '' : '· FALTA O TOKEN'}</p>
              <p className="mt-2">É por ele que o pedido vira “Pago” sozinho. No painel do Asaas, em Integrações → Webhooks, cadastre:</p>
              <p className="mt-2 break-all rounded-xl bg-ink px-3 py-2 font-mono text-signal">{webhook}</p>
              <p className="mt-2 text-mineral">com o mesmo token de <code>ASAAS_WEBHOOK_TOKEN</code> e os eventos de cobrança.</p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-mineral-dim">
              As chaves ficam nas variáveis de ambiente da Vercel, nunca aqui. Depois de mudar uma variável, publique o site de novo para ela valer.
            </p>
          </>
        ) : <p className="mt-5 text-mineral">Carregando…</p>}
      </section>
    </div>
  );
}
