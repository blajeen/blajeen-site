'use client';

import { useId, useState, type CSSProperties, type FormEvent } from 'react';
import { temTetoPreto, type Carro } from '@/lib/carrelio/catalogo';
import {
  JANELA_DO_TEST_DRIVE_DIAS, NOMES_DO_PERIODO, situacaoDe, somarDias, validarTestDrive, type Dia, type EstadoCarrelio, type ItemDoEstoque, type Periodo,
} from '@/lib/carrelio/estado';
import { formatarDiaComSemana, formatarDiferencaDaTabela, formatarReais } from '@/lib/carrelio/formatar';
import type { CorId, VersaoId } from '@/lib/carrelio/tipos';
import styles from '../Carrelio.module.css';

type Props = {
  carro: Carro;
  loja: string;
  estado: EstadoCarrelio;
  versao: VersaoId;
  cor: CorId;
  /** Hoje, no relógio de quem usa; `null` no servidor (o formulário do test drive espera a hidratação). */
  hoje: Dia | null;
  aoVersao(versao: VersaoId): void;
  aoCor(cor: CorId): void;
  aoCompartilhar(): void;
  compartilhado: string | null;
  aoPedirTestDrive(pedido: { dia: Dia; periodo: Periodo }): void;
  aoVerPainel(): void;
};

/** "Pronta entrega · 3 na loja", "Chega em cerca de 12 dias" ou "Sob encomenda". */
export function rotuloDoEstoque(item: ItemDoEstoque): string {
  const situacao = situacaoDe(item);
  if (situacao === 'pronta-entrega') return `Pronta entrega · ${item.quantidade} na loja`;
  if (situacao === 'a-caminho') return `Chega em cerca de ${item.chegaEmDias} ${item.chegaEmDias === 1 ? 'dia' : 'dias'}`;
  return 'Sob encomenda';
}

/**
 * O cartão do carro na visão do cliente: versão, cor (com a situação no estoque da loja), preço e
 * as ações logo no topo (pedido do titular: nada escondido no fim da rolagem); depois os itens da
 * versão, a ficha e as fontes.
 */
export function CartaoDoCarro({
  carro, loja, estado, versao, cor, hoje, aoVersao, aoCor, aoCompartilhar, compartilhado, aoPedirTestDrive, aoVerPainel,
}: Props) {
  const id = useId();
  const versaoAtual = carro.versoes.find((v) => v.id === versao)!;
  const corAtual = carro.cores.find((c) => c.id === cor)!;
  const item = estado.estoque[versao][cor];
  const preco = estado.precos[versao];
  const diferenca = formatarDiferencaDaTabela(preco, versaoAtual.preco.lancamento * 100);
  const [pedindo, setPedindo] = useState(false);
  const [pedido, setPedido] = useState<{ dia: Dia; periodo: Periodo } | null>(null);
  const [dia, setDia] = useState<Dia>('');
  const [periodo, setPeriodo] = useState<Periodo>('manha');
  const [erro, setErro] = useState<string | null>(null);
  const comfort = carro.versoes[0]!;

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!hoje) return;
    const problema = validarTestDrive(dia, hoje);
    setErro(problema);
    if (problema) return;
    aoPedirTestDrive({ dia, periodo });
    setPedido({ dia, periodo });
    setPedindo(false);
  };

  return (
    <section className={styles.cartao} aria-labelledby={`${id}-titulo`} data-ancora="ficha">
      <header className={styles.cabecaDoCartao}>
        <p className={styles.selo}>{loja.toUpperCase()} · DEMONSTRAÇÃO</p>
        <h3 id={`${id}-titulo`} className={styles.nomeDoCarro}>
          {carro.nome}
        </h3>
        <p className={styles.resumoDoCarro}>{carro.resumo}</p>
      </header>

      <div className={styles.escolha}>
        <p className={styles.rotulo} id={`${id}-versao`}>
          Versão
        </p>
        <div role="group" aria-labelledby={`${id}-versao`} className={`${styles.segmento} ${styles.segmentoLargo}`}>
          {carro.versoes.map((v) => (
            <button key={v.id} type="button" aria-pressed={versao === v.id} onClick={() => aoVersao(v.id)}>
              {v.nome}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.escolha}>
        <p className={styles.rotulo} id={`${id}-cor`}>
          Cor <span className={styles.valorDoRotulo}>{corAtual.nome}{temTetoPreto(carro, versao, cor) ? ', teto preto' : ''}</span>
        </p>
        <div role="radiogroup" aria-labelledby={`${id}-cor`} className={styles.amostras}>
          {carro.cores.map((c) => {
            const doEstoque = estado.estoque[versao][c.id];
            const marcada = c.id === cor;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={marcada}
                tabIndex={marcada ? 0 : -1}
                aria-label={`${c.nome}: ${rotuloDoEstoque(doEstoque).toLowerCase()}`}
                className={styles.amostra}
                data-situacao={situacaoDe(doEstoque)}
                style={{ '--amostra': c.hex } as CSSProperties}
                onClick={() => aoCor(c.id)}
                onKeyDown={(evento) => {
                  const passo = evento.key === 'ArrowRight' || evento.key === 'ArrowDown' ? 1 : evento.key === 'ArrowLeft' || evento.key === 'ArrowUp' ? -1 : 0;
                  if (!passo) return;
                  evento.preventDefault();
                  const indice = (carro.cores.findIndex((x) => x.id === c.id) + passo + carro.cores.length) % carro.cores.length;
                  const proxima = carro.cores[indice]!;
                  aoCor(proxima.id);
                  (evento.currentTarget.parentElement?.children[indice] as HTMLElement | undefined)?.focus();
                }}
              />
            );
          })}
        </div>
        <p className={styles.situacao} data-situacao={situacaoDe(item)}>
          {rotuloDoEstoque(item)}
        </p>
      </div>

      <div className={styles.preco}>
        <p className={styles.rotulo}>Preço da loja</p>
        <p className={styles.valor}>{formatarReais(preco)}</p>
        {diferenca ? <p className={styles.diferenca}>{diferenca}</p> : null}
        <p className={styles.nota}>
          Tabela de lançamento da marca: {formatarReais(versaoAtual.preco.lancamento * 100)} no primeiro lote. Na loja, vale a tabela do dia.
        </p>
      </div>

      <div className={styles.acoes}>
        <button
          type="button"
          className={styles.botaoPrincipal}
          aria-expanded={pedindo}
          aria-controls={`${id}-test-drive`}
          onClick={() => {
            setPedindo((p) => !p);
            setPedido(null);
            if (!dia && hoje) setDia(somarDias(hoje, 1));
          }}
        >
          Agendar test drive
        </button>
        <button type="button" className={styles.botaoPequeno} onClick={aoCompartilhar}>
          Compartilhar
        </button>
      </div>
      {compartilhado ? (
        <p className={styles.nota} role="status">
          {compartilhado}
        </p>
      ) : null}

      {pedindo && hoje ? (
        <form id={`${id}-test-drive`} className={styles.testDrive} onSubmit={enviar} noValidate>
          <p className={styles.nota}>
            {versaoAtual.nome} {corAtual.nome}. Sem nome nem telefone: é demonstração. No projeto, o pedido pode ir para o WhatsApp da loja.
          </p>
          <label className={styles.campo}>
            <span>Dia</span>
            <input
              type="date"
              value={dia}
              min={hoje}
              max={somarDias(hoje, JANELA_DO_TEST_DRIVE_DIAS)}
              onChange={(evento) => setDia(evento.target.value)}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? `${id}-erro` : undefined}
              required
            />
          </label>
          <fieldset className={styles.campo}>
            <legend>Período</legend>
            <div className={`${styles.segmento} ${styles.segmentoLargo}`}>
              {(['manha', 'tarde'] as const).map((p) => (
                <button key={p} type="button" aria-pressed={periodo === p} onClick={() => setPeriodo(p)}>
                  {p === 'manha' ? 'Manhã' : 'Tarde'}
                </button>
              ))}
            </div>
          </fieldset>
          {erro ? (
            <p id={`${id}-erro`} className={styles.erro}>
              {erro}
            </p>
          ) : null}
          <div className={styles.acoes}>
            <button type="submit" className={styles.botaoPrincipal}>
              Pedir test drive
            </button>
            <button type="button" className={styles.botaoPequeno} onClick={() => setPedindo(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : null}
      {pedido ? (
        <div className={styles.confirmacao} role="status">
          <p>
            Pedido de demonstração feito: {formatarDiaComSemana(pedido.dia)}, {NOMES_DO_PERIODO[pedido.periodo]}.
          </p>
          <button type="button" className={styles.botaoPequeno} onClick={aoVerPainel}>
            Ver no painel da loja
          </button>
        </div>
      ) : null}

      {estado.campanha.ativa ? <p className={styles.campanha}>{estado.campanha.texto}</p> : null}

      <section className={styles.itens} aria-labelledby={`${id}-itens`}>
        <h4 id={`${id}-itens`} className={styles.rotulo}>
          {versao === 'prestige' ? `Tudo do ${comfort.nome}, e mais` : `De série no ${versaoAtual.nome}`}
        </h4>
        <ul>
          {versaoAtual.itens.map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ul>
      </section>

      <details className={styles.ficha}>
        <summary>Ficha técnica</summary>
        <dl>
          {carro.ficha.map((linha) => (
            <div key={linha.rotulo}>
              <dt>{linha.rotulo}</dt>
              <dd>{linha.valor}</dd>
            </div>
          ))}
        </dl>
      </details>

      <p className={styles.fontes}>
        Ficha, itens e preços de lançamento divulgados pela marca em 30/09/2026. Fontes:{' '}
        {carro.fontes.map((fonte, i) => (
          <span key={fonte.url}>
            {i > 0 ? ', ' : ''}
            <a href={fonte.url} target="_blank" rel="noopener noreferrer">
              {fonte.rotulo}
            </a>
          </span>
        ))}
        .
      </p>
    </section>
  );
}
