'use client';

import { useMemo, useState } from 'react';
import {
  fluxoDePagamento, formatarPontosBase, LIMITES_DAS_PARCELAS, LIMITES_DO_REAJUSTE, percentualDaObra, reajustar, validarCondicao,
} from '@/lib/torrelio/calculos';
import { NOMES_DOS_GRUPOS, PAVIMENTOS_DA_ESTRUTURA, type CondicaoPagamento, type Obra } from '@/lib/torrelio/dados';
import {
  NOMES_DO_STATUS, PRECO_MAXIMO_CENTAVOS, PRECO_MINIMO_CENTAVOS, tabelaVigente, type AcaoTorrelio, type EscopoDoReajuste, type EstadoTorrelio,
} from '@/lib/torrelio/estado';
import { formatarCentavos, formatarCentavosCurto, formatarPercentual, lerValorEmReais } from '@/lib/torrelio/formatar';
import { UNIDADES } from '@/lib/torrelio/predio';
import { linhasDoEspelho, resumoComercial } from '@/lib/torrelio/seletores';
import type { StatusUnidade } from '@/lib/torrelio/tipos';
import { Abas } from '../Abas';
import { EspelhoPorPavimento } from '../cliente/EspelhoPorPavimento';
import type { SubAbaDoPainel } from '../interface';
import styles from '../Torrelio.module.css';
import { Historico } from './Historico';

type Props = {
  estado: EstadoTorrelio;
  despachar(acao: AcaoTorrelio): void;
  selecionada: string;
  aoEscolher(id: string): void;
  aoDestacar(pavimento: number | null): void;
  subAba: SubAbaDoPainel;
  aoSubAba(sub: SubAbaDoPainel): void;
  /** Enquanto um controle da obra é arrastado, a torre mostra a prévia sem gravar. */
  aoPreviaDaObra(obra: Obra | null): void;
};

const SUB_ABAS: readonly { id: SubAbaDoPainel; rotulo: string }[] = [
  { id: 'unidades', rotulo: 'Unidades' },
  { id: 'tabela', rotulo: 'Tabela' },
  { id: 'pagamento', rotulo: 'Pagamento' },
  { id: 'obra', rotulo: 'Obra' },
  { id: 'historico', rotulo: 'Histórico' },
];

export function PainelDeControle({ estado, despachar, selecionada, aoEscolher, aoDestacar, subAba, aoSubAba, aoPreviaDaObra }: Props) {
  const resumo = useMemo(() => resumoComercial(estado), [estado]);
  const linhas = useMemo(() => linhasDoEspelho(estado), [estado]);
  const tabela = tabelaVigente(estado);
  return (
    <div className={styles.painelDeControle}>
      <dl className={styles.razao} aria-label="Resumo comercial (fictício)">
        <div>
          <dt>VGV de tabela</dt>
          <dd>{formatarCentavosCurto(resumo.vgvTabelaCentavos)}</dd>
        </div>
        <div>
          <dt>VGV vendido</dt>
          <dd>
            {formatarCentavosCurto(resumo.vgvVendidoCentavos)} <span>{formatarPercentual(resumo.fracaoVendida)}</span>
          </dd>
        </div>
        <div>
          <dt>Ticket médio</dt>
          <dd>{resumo.ticketMedioCentavos ? formatarCentavosCurto(resumo.ticketMedioCentavos) : '—'}</dd>
        </div>
        <div>
          <dt>m² das disponíveis</dt>
          <dd>{resumo.m2MedioDisponiveisCentavos ? `${formatarCentavosCurto(resumo.m2MedioDisponiveisCentavos)}` : '—'}</dd>
        </div>
        <div className={styles.razaoLarga}>
          <dt>Unidades</dt>
          <dd>
            {resumo.porStatus.vendida} vendidas · {resumo.porStatus.reservada} reservadas · {resumo.porStatus.indisponivel} indisponíveis ·{' '}
            {resumo.porStatus.disponivel} disponíveis
          </dd>
        </div>
        <div className={styles.razaoLarga}>
          <dt>Tabela vigente</dt>
          <dd>
            {tabela.numero === 1 ? 'Tabela 1 · lançamento' : `Tabela ${tabela.numero} · ${tabela.pontosBase > 0 ? '+' : '−'}${formatarPontosBase(Math.abs(tabela.pontosBase))}`}
          </dd>
        </div>
      </dl>

      <Abas rotulo="Seções do painel" abas={SUB_ABAS} ativa={subAba} aoMudar={aoSubAba} base="torrelio-painel" variante="secundaria" />

      <div role="tabpanel" id={`torrelio-painel-painel-${subAba}`} aria-labelledby={`torrelio-painel-aba-${subAba}`} className={styles.subPainel}>
        {subAba === 'unidades' ? (
          <div className={styles.unidadesDoPainel}>
            <EditorDaUnidade key={selecionada} estado={estado} id={selecionada} despachar={despachar} />
            <EspelhoPorPavimento
              linhas={linhas}
              selecionada={selecionada}
              aoEscolher={aoEscolher}
              aoDestacar={aoDestacar}
              comPreco
              rotulo="Espelho de edição: escolha a unidade para mudar status ou preço"
            />
          </div>
        ) : null}
        {subAba === 'tabela' ? <Reajuste estado={estado} despachar={despachar} /> : null}
        {subAba === 'pagamento' ? <Condicao key={JSON.stringify(estado.condicao)} estado={estado} despachar={despachar} selecionada={selecionada} /> : null}
        {subAba === 'obra' ? <ControlesDaObra key={JSON.stringify(estado.obra)} obra={estado.obra} despachar={despachar} aoPrevia={aoPreviaDaObra} /> : null}
        {subAba === 'historico' ? <Historico historico={estado.historico} /> : null}
      </div>
    </div>
  );
}

const STATUS: readonly StatusUnidade[] = ['disponivel', 'reservada', 'vendida', 'indisponivel'];

function EditorDaUnidade({ estado, id, despachar }: { estado: EstadoTorrelio; id: string; despachar(acao: AcaoTorrelio): void }) {
  const unidade = UNIDADES.find((u) => u.id === id)!;
  const situacao = estado.unidades[id]!;
  const [preco, setPreco] = useState(() => (situacao.precoCentavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
  const centavos = lerValorEmReais(preco);
  const erro =
    centavos === null ? 'Digite um valor em reais, como 785.619,74.'
      : centavos < PRECO_MINIMO_CENTAVOS || centavos > PRECO_MAXIMO_CENTAVOS ? 'Valor fora da faixa da demonstração.'
        : null;
  const andar = UNIDADES.filter((u) => u.pavimentos[0] === unidade.pavimentos[0] && u.tipologia === unidade.tipologia).map((u) => u.id);
  const rotuloDoAndar = unidade.pavimentos.map((p) => `${p}º`).join('–');

  return (
    <section className={styles.editor} aria-labelledby="torrelio-editor" data-ancora="ficha">
      <h3 id="torrelio-editor">
        Unidade {id} <span className="text-mineral">· {rotuloDoAndar} · final {unidade.final}</span>
      </h3>
      <fieldset className={styles.radios}>
        <legend>Status</legend>
        {STATUS.map((status) => (
          <label key={status} data-status={status}>
            <input
              type="radio"
              name="torrelio-status"
              checked={situacao.status === status}
              onChange={() => despachar({ tipo: 'unidade/status', ids: [id], status })}
            />
            <span className={styles.marcaDoStatus} aria-hidden="true" />
            {NOMES_DO_STATUS[status].singular}
          </label>
        ))}
      </fieldset>
      <form
        className={styles.linhaDeCampo}
        onSubmit={(evento) => {
          evento.preventDefault();
          if (centavos !== null && !erro) despachar({ tipo: 'unidade/preco', id, precoCentavos: centavos });
        }}
      >
        <label htmlFor="torrelio-preco">Preço de tabela (R$)</label>
        <input
          id="torrelio-preco"
          inputMode="decimal"
          autoComplete="off"
          value={preco}
          aria-invalid={Boolean(erro)}
          aria-describedby="torrelio-preco-ajuda"
          onChange={(e) => setPreco(e.target.value)}
        />
        <button type="submit" className={styles.botao} disabled={Boolean(erro) || centavos === situacao.precoCentavos}>
          Salvar preço
        </button>
        <p id="torrelio-preco-ajuda" className={styles.notaMiuda} aria-live="polite">
          {erro ?? `Atual: ${formatarCentavos(situacao.precoCentavos)}`}
        </p>
      </form>
      {andar.length > 1 ? (
        <div className={styles.lote} role="group" aria-label={`Andar ${rotuloDoAndar} inteiro`}>
          <span className="tecnica text-mineral">{rotuloDoAndar} INTEIRO</span>
          <button type="button" className={styles.botao} onClick={() => despachar({ tipo: 'unidade/status', ids: andar, status: 'vendida' })}>
            Marcar como vendido
          </button>
          <button type="button" className={styles.botao} onClick={() => despachar({ tipo: 'unidade/status', ids: andar, status: 'disponivel' })}>
            Liberar
          </button>
        </div>
      ) : null}
    </section>
  );
}

const ESCOPOS: readonly { id: EscopoDoReajuste; rotulo: string }[] = [
  { id: 'disponiveis', rotulo: 'Só as disponíveis' },
  { id: 'nao-vendidas', rotulo: 'Todas as não vendidas' },
  { id: 'todas', rotulo: 'Todas as unidades' },
];

function Reajuste({ estado, despachar }: { estado: EstadoTorrelio; despachar(acao: AcaoTorrelio): void }) {
  const [pontosBase, setPontosBase] = useState(350);
  const [escopo, setEscopo] = useState<EscopoDoReajuste>('disponiveis');
  const previa = useMemo(() => {
    let antes = 0;
    let depois = 0;
    let afetadas = 0;
    for (const { status, precoCentavos } of Object.values(estado.unidades)) {
      antes += precoCentavos;
      const entra = escopo === 'todas' || status === 'disponivel' || (escopo === 'nao-vendidas' && status !== 'vendida');
      depois += entra ? reajustar(precoCentavos, pontosBase) : precoCentavos;
      if (entra) afetadas += 1;
    }
    return { antes, depois, afetadas };
  }, [estado, pontosBase, escopo]);
  const proxima = tabelaVigente(estado).numero + 1;
  const sinal = pontosBase > 0 ? '+' : pontosBase < 0 ? '−' : '';

  return (
    <section className={styles.formulario} aria-labelledby="torrelio-reajuste">
      <h3 id="torrelio-reajuste">Reajuste de tabela</h3>
      <label htmlFor="torrelio-reajuste-valor" className={styles.rotuloComValor}>
        Percentual <strong>{sinal}{formatarPontosBase(Math.abs(pontosBase))}</strong>
      </label>
      <input
        id="torrelio-reajuste-valor"
        type="range"
        min={LIMITES_DO_REAJUSTE.min}
        max={LIMITES_DO_REAJUSTE.max}
        step={50}
        value={pontosBase}
        aria-valuetext={`${sinal}${formatarPontosBase(Math.abs(pontosBase))}`}
        onChange={(e) => setPontosBase(Number(e.target.value))}
      />
      <fieldset className={styles.radios}>
        <legend>Em quais unidades</legend>
        {ESCOPOS.map((e) => (
          <label key={e.id}>
            <input type="radio" name="torrelio-escopo" checked={escopo === e.id} onChange={() => setEscopo(e.id)} />
            {e.rotulo}
          </label>
        ))}
      </fieldset>
      <p className={styles.previa}>
        VGV de tabela: {formatarCentavosCurto(previa.antes)} → <strong>{formatarCentavosCurto(previa.depois)}</strong> · {previa.afetadas} unidades
      </p>
      <button
        type="button"
        className={styles.botaoPrincipal}
        disabled={pontosBase === 0 || previa.afetadas === 0}
        onClick={() => despachar({ tipo: 'tabela/reajustar', pontosBase, escopo })}
      >
        Aplicar e abrir a tabela {proxima}
      </button>
      <ol className={styles.tabelas} aria-label="Tabelas">
        {[...estado.tabelas].reverse().map((t) => (
          <li key={t.numero}>
            <strong>Tabela {t.numero}</strong>{' '}
            {t.numero === 1 ? 'de lançamento (fictícia)' : `${t.pontosBase > 0 ? '+' : '−'}${formatarPontosBase(Math.abs(t.pontosBase))} em ${t.afetadas} unidades`}
            {t.quando ? <span className="text-mineral"> · {new Date(t.quando).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Condicao({ estado, despachar, selecionada }: { estado: EstadoTorrelio; despachar(acao: AcaoTorrelio): void; selecionada: string }) {
  const [rascunho, setRascunho] = useState<CondicaoPagamento>(estado.condicao);
  const erro = validarCondicao(rascunho);
  const igual = JSON.stringify(rascunho) === JSON.stringify(estado.condicao);
  const preco = estado.unidades[selecionada]!.precoCentavos;
  const fluxo = erro ? null : fluxoDePagamento(preco, rascunho);
  const mudarGrupo = (indice: number, campo: 'pontosBase' | 'parcelas', valor: number) =>
    setRascunho((atual) => ({ ...atual, grupos: atual.grupos.map((g, i) => (i === indice ? { ...g, [campo]: valor } : g)) }));

  return (
    <form
      className={styles.formulario}
      aria-labelledby="torrelio-condicao"
      onSubmit={(evento) => {
        evento.preventDefault();
        if (!erro && !igual) despachar({ tipo: 'condicao/definir', condicao: rascunho });
      }}
    >
      <h3 id="torrelio-condicao">Condição de pagamento</h3>
      <table className={styles.tabelaDeCampos}>
        <thead>
          <tr>
            <th scope="col">Grupo</th>
            <th scope="col">%</th>
            <th scope="col">Parcelas</th>
          </tr>
        </thead>
        <tbody>
          {rascunho.grupos.map((g, i) => {
            const limites = LIMITES_DAS_PARCELAS[g.id];
            return (
              <tr key={g.id}>
                <th scope="row">{NOMES_DOS_GRUPOS[g.id]}</th>
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step={0.5}
                    aria-label={`${NOMES_DOS_GRUPOS[g.id]}: percentual`}
                    value={g.pontosBase / 100}
                    onChange={(e) => mudarGrupo(i, 'pontosBase', Math.round(Number(e.target.value) * 100))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={limites.min}
                    max={limites.max}
                    step={1}
                    disabled={limites.min === limites.max}
                    aria-label={`${NOMES_DOS_GRUPOS[g.id]}: parcelas`}
                    value={g.parcelas}
                    onChange={(e) => mudarGrupo(i, 'parcelas', Math.round(Number(e.target.value)))}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <label className={styles.linhaDeCampo}>
        <span>Correção até as chaves</span>
        <select value={rascunho.indice} onChange={(e) => setRascunho((a) => ({ ...a, indice: e.target.value as CondicaoPagamento['indice'] }))}>
          <option value="INCC">INCC</option>
          <option value="IPCA">IPCA</option>
          <option value="nenhum">Sem correção</option>
        </select>
      </label>
      <p className={styles.notaMiuda} aria-live="polite" data-erro={erro ? 'sim' : 'nao'}>
        {erro ?? `Soma: 100%. Prévia na unidade ${selecionada}: ${fluxo!.linhas.filter((l) => l.total > 0).map((l) => `${NOMES_DOS_GRUPOS[l.id].toLowerCase()} ${l.parcelas > 1 ? `${l.parcelas} × ` : ''}${formatarCentavos(l.valor)}`).join(' · ')}.`}
      </p>
      <div className={styles.linhaDeBotoes}>
        <button type="submit" className={styles.botaoPrincipal} disabled={Boolean(erro) || igual}>
          Salvar condição
        </button>
        <button type="button" className={styles.botao} disabled={igual} onClick={() => setRascunho(estado.condicao)}>
          Descartar
        </button>
      </div>
    </form>
  );
}

function ControlesDaObra({ obra, despachar, aoPrevia }: { obra: Obra; despachar(acao: AcaoTorrelio): void; aoPrevia(obra: Obra | null): void }) {
  const [rascunho, setRascunho] = useState(obra);
  const mudar = (parcial: Partial<Obra>) => {
    const proximo = { ...rascunho, ...parcial };
    if (proximo.fachadaAte > Math.min(21, proximo.estruturaAte)) proximo.fachadaAte = Math.min(21, proximo.estruturaAte);
    setRascunho(proximo);
    aoPrevia(proximo);
  };
  // Grava ao soltar o controle (ou ao mudar pelo teclado): uma linha de histórico por gesto.
  const confirmar = () => {
    aoPrevia(null);
    if (JSON.stringify(rascunho) !== JSON.stringify(obra)) despachar({ tipo: 'obra/definir', obra: rascunho });
  };
  const gatilhos = { onPointerUp: confirmar, onKeyUp: confirmar, onBlur: confirmar };
  const estrutura = rascunho.estruturaAte === 1 ? 'térreo' : rascunho.estruturaAte >= PAVIMENTOS_DA_ESTRUTURA ? 'coroamento' : `${rascunho.estruturaAte}º`;
  const fachada = rascunho.fachadaAte <= 1 ? 'por começar' : `até o ${rascunho.fachadaAte}º`;

  return (
    <section className={styles.formulario} aria-labelledby="torrelio-obra">
      <h3 id="torrelio-obra">
        Obra · <span className="text-mineral">{percentualDaObra(rascunho)}% concluída (fictícia)</span>
      </h3>
      <label htmlFor="torrelio-mes" className={styles.rotuloComValor}>
        Mês da obra <strong>{rascunho.mes} de {rascunho.meses}</strong>
      </label>
      <input id="torrelio-mes" type="range" min={0} max={rascunho.meses} value={rascunho.mes} onChange={(e) => mudar({ mes: Number(e.target.value) })} {...gatilhos} />
      <label htmlFor="torrelio-estrutura" className={styles.rotuloComValor}>
        Estrutura até <strong>{estrutura}</strong>
      </label>
      <input
        id="torrelio-estrutura"
        type="range"
        min={1}
        max={PAVIMENTOS_DA_ESTRUTURA}
        value={rascunho.estruturaAte}
        aria-valuetext={estrutura}
        onChange={(e) => mudar({ estruturaAte: Number(e.target.value) })}
        {...gatilhos}
      />
      <label htmlFor="torrelio-fachada" className={styles.rotuloComValor}>
        Fachada (vidro) <strong>{fachada}</strong>
      </label>
      <input
        id="torrelio-fachada"
        type="range"
        min={1}
        max={Math.min(21, rascunho.estruturaAte)}
        value={rascunho.fachadaAte}
        aria-valuetext={fachada}
        onChange={(e) => mudar({ fachadaAte: Number(e.target.value) })}
        {...gatilhos}
      />
      {(['fundacao', 'alvenaria', 'instalacoes', 'acabamento'] as const).map((etapa) => (
        <div key={etapa}>
          <label htmlFor={`torrelio-etapa-${etapa}`} className={styles.rotuloComValor}>
            {{ fundacao: 'Fundação', alvenaria: 'Alvenaria', instalacoes: 'Instalações', acabamento: 'Acabamento' }[etapa]}{' '}
            <strong>{rascunho.etapas[etapa]}%</strong>
          </label>
          <input
            id={`torrelio-etapa-${etapa}`}
            type="range"
            min={0}
            max={100}
            step={5}
            value={rascunho.etapas[etapa]}
            onChange={(e) => mudar({ etapas: { ...rascunho.etapas, [etapa]: Number(e.target.value) } })}
            {...gatilhos}
          />
        </div>
      ))}
      <p className={styles.notaMiuda}>Ligue a camada Obra na barra da maquete para ver a torre no andamento escolhido.</p>
    </section>
  );
}
