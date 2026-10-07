'use client';

import { useId, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { temTetoPreto, type Carro } from '@/lib/carrelio/catalogo';
import {
  JANELA_DO_TEST_DRIVE_DIAS, NOMES_DO_PERIODO, situacaoDe, somarDias, validarTestDrive, type Dia, type EstadoCarrelio, type ItemDoEstoque, type Periodo,
} from '@/lib/carrelio/estado';
import { formatarDiaComSemana, formatarDiferencaDaTabela, formatarReais } from '@/lib/carrelio/formatar';
import type { CorId, VersaoId } from '@/lib/carrelio/tipos';
import styles from '../Carrelio.module.css';

/** Quantos itens de série aparecem antes do "mais N itens": os que mais diferenciam a versão. */
const ITENS_A_VISTA = 6;

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
 * O cartão do carro na visão do cliente, na ordem em que a pessoa decide (pedido do titular: nada
 * importante no fim da rolagem): versão, cor com a situação no estoque da loja, preço com a
 * campanha, e o test drive. Depois, os itens da versão (os seis que mais pesam, e o resto num
 * toque), a ficha e as fontes.
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
  const [pedido, setPedido] = useState<{ dia: Dia; periodo: Periodo; carro: string } | null>(null);
  const [dia, setDia] = useState<Dia>('');
  const [periodo, setPeriodo] = useState<Periodo>('manha');
  const [erro, setErro] = useState<string | null>(null);
  const [todosOsItens, setTodosOsItens] = useState(false);
  const confirmacao = useRef<HTMLDivElement>(null);
  const comfort = carro.versoes[0]!;
  const nomeDoCarro = `${versaoAtual.nome} ${corAtual.nome}`;
  const itens = todosOsItens ? versaoAtual.itens : versaoAtual.itens.slice(0, ITENS_A_VISTA);
  const escondidos = versaoAtual.itens.length - ITENS_A_VISTA;

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!hoje) return;
    const problema = validarTestDrive(dia, hoje);
    setErro(problema);
    if (problema) return;
    aoPedirTestDrive({ dia, periodo });
    // O formulário some com o botão que tinha o foco: o foco vai para a confirmação, que é lida.
    flushSync(() => {
      setPedido({ dia, periodo, carro: nomeDoCarro });
      setPedindo(false);
    });
    confirmacao.current?.focus();
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
        {estado.campanha.ativa ? (
          <p className={styles.campanha}>
            <span className={styles.seloDaCampanha}>CAMPANHA</span>
            {estado.campanha.texto}
          </p>
        ) : null}
        <p className={styles.nota}>
          Tabela de lançamento da marca, no primeiro lote: {formatarReais(versaoAtual.preco.lancamento * 100)}. Na loja, vale a tabela do dia.
        </p>
      </div>

      <div className={styles.acoes}>
        <button
          type="button"
          className={`${styles.botaoPrincipal} ${styles.botaoDoTestDrive}`}
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
        <form id={`${id}-test-drive`} className={styles.testDrive} onSubmit={enviar} noValidate aria-labelledby={`${id}-test-drive-titulo`}>
          <p id={`${id}-test-drive-titulo`} className={styles.tituloDoTestDrive}>
            Test drive do {nomeDoCarro}
          </p>
          <div className={styles.camposDoTestDrive}>
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
          </div>
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
          <p className={styles.nota}>Sem nome nem telefone: é demonstração. No projeto, o pedido pode ir para o WhatsApp da loja.</p>
        </form>
      ) : null}
      {pedido ? (
        <div ref={confirmacao} tabIndex={-1} className={styles.confirmacao}>
          <p>
            <strong>Pedido de demonstração feito.</strong> {pedido.carro}, {formatarDiaComSemana(pedido.dia)}, {NOMES_DO_PERIODO[pedido.periodo]}.
          </p>
          <button type="button" className={styles.botaoPequeno} onClick={aoVerPainel}>
            Ver no painel da loja <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}

      <section className={styles.itens} aria-labelledby={`${id}-itens`}>
        <h4 id={`${id}-itens`} className={styles.rotulo}>
          {versao === 'prestige' ? `Tudo do ${comfort.nome}, e mais` : `De série no ${versaoAtual.nome}`}
        </h4>
        <ul id={`${id}-lista-de-itens`}>
          {itens.map((linha) => (
            <li key={linha}>{linha}</li>
          ))}
        </ul>
        {escondidos > 0 ? (
          <button
            type="button"
            className={styles.botaoDeTexto}
            aria-expanded={todosOsItens}
            aria-controls={`${id}-lista-de-itens`}
            onClick={() => setTodosOsItens((todos) => !todos)}
          >
            {todosOsItens ? 'Mostrar menos' : `Mais ${escondidos} ${escondidos === 1 ? 'item' : 'itens'}`}
          </button>
        ) : null}
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
