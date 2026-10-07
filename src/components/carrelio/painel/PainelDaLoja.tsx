'use client';

import { useId, useState } from 'react';
import type { Carro } from '@/lib/carrelio/catalogo';
import {
  CAMPANHA_MAXIMA, CHEGADA_MAXIMA_DIAS, NOMES_DO_PERIODO, PRECO_MAXIMO_CENTAVOS, PRECO_MINIMO_CENTAVOS, QUANTIDADE_MAXIMA, situacaoDe,
  type AcaoCarrelio, type EstadoCarrelio,
} from '@/lib/carrelio/estado';
import { formatarDiaComSemana, formatarDiferencaDaTabela, formatarReais, lerValorEmReais } from '@/lib/carrelio/formatar';
import type { CorId, VersaoId } from '@/lib/carrelio/tipos';
import styles from '../Carrelio.module.css';

/** O título dos pedidos de test drive: o "ver no painel da loja" do cartão leva a página até ele. */
export const ID_DOS_PEDIDOS = 'carrelio-pedidos';

type Props = {
  carro: Carro;
  estado: EstadoCarrelio;
  despachar(acao: AcaoCarrelio): void;
  versao: VersaoId;
  cor: CorId;
  /** Mostra no carro a cor e a versão da linha que a pessoa está mexendo. */
  aoMostrar(versao: VersaoId, cor: CorId): void;
};

/**
 * O painel da loja: o que a equipe muda e o cliente vê na hora, na outra aba (ou em outra janela
 * do mesmo navegador). Primeiro os pedidos de test drive (é o cliente esperando resposta), depois o
 * estoque por cor e versão, o preço da loja, a campanha e o que mudou.
 */
export function PainelDaLoja({ carro, estado, despachar, versao, cor, aoMostrar }: Props) {
  const id = useId();
  const novos = estado.testDrives.filter((p) => !p.atendido).length;
  return (
    <div className={styles.painelDaLoja}>
      <section aria-labelledby={ID_DOS_PEDIDOS} className={styles.bloco}>
        <h3 id={ID_DOS_PEDIDOS} className={styles.tituloDoBloco} tabIndex={-1}>
          Pedidos de test drive
          {novos ? <span className={styles.contagem}>{novos === 1 ? '1 novo' : `${novos} novos`}</span> : null}
        </h3>
        {estado.testDrives.length === 0 ? (
          <p className={styles.nota}>Nenhum pedido ainda. Peça um na visão do cliente: ele aparece aqui.</p>
        ) : (
          <ul className={styles.pedidos}>
            {estado.testDrives.map((pedido) => {
              const nome = `${carro.versoes.find((v) => v.id === pedido.versao)!.nome} ${carro.cores.find((c) => c.id === pedido.cor)!.nome}`;
              return (
                <li key={pedido.id} data-atendido={pedido.atendido ? 'sim' : 'nao'}>
                  <p>
                    <span className={styles.seloDoPedido}>{pedido.atendido ? 'CONFIRMADO' : 'NOVO'}</span>
                    <strong>{formatarDiaComSemana(pedido.dia)}</strong>, {NOMES_DO_PERIODO[pedido.periodo]} · {nome}
                  </p>
                  <span className={styles.acoes}>
                    {!pedido.atendido ? (
                      <button type="button" className={styles.botaoPequeno} onClick={() => despachar({ tipo: 'test-drive/atender', id: pedido.id })}>
                        Confirmar
                      </button>
                    ) : null}
                    <button type="button" className={styles.botaoPequeno} onClick={() => despachar({ tipo: 'test-drive/remover', id: pedido.id })}>
                      Remover
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby={`${id}-estoque`} className={`${styles.bloco} ${styles.blocoDoEstoque}`}>
        <h3 id={`${id}-estoque`} className={styles.tituloDoBloco}>
          Estoque
        </h3>
        <p className={styles.nota}>Ponha ou tire carros: a situação da cor muda na hora para quem vê o carro.</p>
        {carro.versoes.map((v) => (
          <table key={v.id} className={styles.tabelaDoEstoque}>
            <caption>{v.nome}</caption>
            <thead>
              <tr>
                <th scope="col">Cor</th>
                <th scope="col">Na loja</th>
                <th scope="col">Para o cliente</th>
              </tr>
            </thead>
            <tbody>
              {carro.cores.map((c) => {
                const item = estado.estoque[v.id][c.id];
                const atual = versao === v.id && cor === c.id;
                return (
                  <tr key={c.id} data-atual={atual ? 'sim' : 'nao'} data-situacao={situacaoDe(item)}>
                    <th scope="row">
                      <button type="button" className={styles.linkDaCor} onClick={() => aoMostrar(v.id, c.id)} aria-pressed={atual}>
                        <span className={styles.bolinha} style={{ background: c.hex }} aria-hidden="true" />
                        {c.nome}
                      </button>
                    </th>
                    <td>
                      <span className={styles.contador} role="group" aria-label={`${v.nome} ${c.nome}: carros na loja`}>
                        <button
                          type="button"
                          aria-label="Tirar um"
                          disabled={item.quantidade === 0}
                          onClick={() => despachar({ tipo: 'estoque/quantidade', versao: v.id, cor: c.id, quantidade: item.quantidade - 1 })}
                        >
                          −
                        </button>
                        <output>{item.quantidade}</output>
                        <button
                          type="button"
                          aria-label="Pôr mais um"
                          disabled={item.quantidade >= QUANTIDADE_MAXIMA}
                          onClick={() => despachar({ tipo: 'estoque/quantidade', versao: v.id, cor: c.id, quantidade: item.quantidade + 1 })}
                        >
                          +
                        </button>
                      </span>
                    </td>
                    <td>
                      {item.quantidade > 0 ? (
                        <span className={styles.prontaEntrega}>Pronta entrega</span>
                      ) : (
                        <Chegada
                          // Outra aba mudou a previsão: o rascunho recomeça dela.
                          key={String(item.chegaEmDias)}
                          rotulo={`${v.nome} ${c.nome}`}
                          dias={item.chegaEmDias}
                          aoMudar={(dias) => despachar({ tipo: 'estoque/chegada', versao: v.id, cor: c.id, dias })}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}
      </section>

      <section aria-labelledby={`${id}-precos`} className={styles.bloco}>
        <h3 id={`${id}-precos`} className={styles.tituloDoBloco}>
          Preço da loja
        </h3>
        <div className={styles.precosDaLoja}>
          {carro.versoes.map((v) => (
            <PrecoDaVersao
              key={v.id}
              rotulo={v.nome}
              centavos={estado.precos[v.id]}
              tabela={v.preco.lancamento * 100}
              aoMudar={(centavos) => despachar({ tipo: 'preco', versao: v.id, centavos })}
            />
          ))}
        </div>
      </section>

      <Campanha key={estado.campanha.texto} estado={estado} despachar={despachar} />

      <section aria-labelledby={`${id}-historico`} className={styles.bloco}>
        <h3 id={`${id}-historico`} className={styles.tituloDoBloco}>
          O que mudou
        </h3>
        {estado.historico.length === 0 ? (
          <p className={styles.nota}>Cada mudança deste painel aparece aqui.</p>
        ) : (
          <ol className={styles.historico}>
            {estado.historico.slice(0, 8).map((linha) => (
              <li key={linha.id}>{linha.texto}</li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

/** Sem carro na loja: sob encomenda, ou a caminho com a previsão em dias. */
function Chegada({ rotulo, dias, aoMudar }: { rotulo: string; dias: number | null; aoMudar(dias: number | null): void }) {
  const [rascunho, setRascunho] = useState(dias === null ? '' : String(dias));
  const id = useId();
  return (
    <span className={styles.chegada}>
      <select
        aria-label={`${rotulo}: situação sem carro na loja`}
        value={dias === null ? 'encomenda' : 'caminho'}
        onChange={(evento) => {
          if (evento.target.value === 'encomenda') aoMudar(null);
          else {
            const padrao = Number(rascunho) || 15;
            setRascunho(String(padrao));
            aoMudar(padrao);
          }
        }}
      >
        <option value="encomenda">Sob encomenda</option>
        <option value="caminho">A caminho</option>
      </select>
      {dias !== null ? (
        <label htmlFor={id} className={styles.dias}>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={1}
            max={CHEGADA_MAXIMA_DIAS}
            value={rascunho}
            aria-label={`${rotulo}: chega em quantos dias`}
            onChange={(evento) => setRascunho(evento.target.value)}
            onBlur={() => {
              const numero = Number(rascunho);
              if (Number.isInteger(numero) && numero >= 1 && numero <= CHEGADA_MAXIMA_DIAS) aoMudar(numero);
              else setRascunho(String(dias));
            }}
          />
          <span aria-hidden="true">dias</span>
        </label>
      ) : null}
    </span>
  );
}

function PrecoDaVersao({ rotulo, centavos, tabela, aoMudar }: { rotulo: string; centavos: number; tabela: number; aoMudar(centavos: number): void }) {
  const [rascunho, setRascunho] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const id = useId();
  const confirmar = () => {
    if (rascunho === null) return;
    const valor = lerValorEmReais(rascunho);
    if (valor === null || valor < PRECO_MINIMO_CENTAVOS || valor > PRECO_MAXIMO_CENTAVOS) {
      setErro(`Use um valor entre ${formatarReais(PRECO_MINIMO_CENTAVOS)} e ${formatarReais(PRECO_MAXIMO_CENTAVOS)}.`);
      return;
    }
    setErro(null);
    setRascunho(null);
    aoMudar(Math.round(valor / 100) * 100);
  };
  const diferenca = formatarDiferencaDaTabela(centavos, tabela);
  return (
    <div className={styles.campo}>
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        inputMode="decimal"
        value={rascunho ?? formatarReais(centavos)}
        onFocus={() => setRascunho(String(Math.round(centavos / 100)))}
        onChange={(evento) => setRascunho(evento.target.value)}
        onBlur={confirmar}
        onKeyDown={(evento) => {
          if (evento.key === 'Enter') (evento.target as HTMLInputElement).blur();
          if (evento.key === 'Escape') {
            setRascunho(null);
            setErro(null);
          }
        }}
        aria-invalid={erro ? true : undefined}
        aria-describedby={`${id}-tabela${erro ? ` ${id}-erro` : ''}`}
      />
      <p id={`${id}-tabela`} className={styles.nota}>
        Tabela da marca: {formatarReais(tabela)}
        {diferenca ? ` · ${diferenca}` : ''}
      </p>
      {erro ? (
        <p id={`${id}-erro`} className={styles.erro}>
          {erro}
        </p>
      ) : null}
    </div>
  );
}

function Campanha({ estado, despachar }: { estado: EstadoCarrelio; despachar(acao: AcaoCarrelio): void }) {
  const [texto, setTexto] = useState(estado.campanha.texto);
  const id = useId();
  return (
    <section aria-labelledby={`${id}-campanha`} className={styles.bloco}>
      <h3 id={`${id}-campanha`} className={styles.tituloDoBloco}>
        Campanha
      </h3>
      <label className={styles.interruptor}>
        <input type="checkbox" checked={estado.campanha.ativa} onChange={(evento) => despachar({ tipo: 'campanha', ativa: evento.target.checked, texto })} />
        <span>No ar, no cartão do carro</span>
      </label>
      <div className={styles.campo}>
        <label htmlFor={id}>Texto</label>
        {/* Duas linhas: a frase inteira cabe à vista, até no celular. Enter guarda, como nos preços. */}
        <textarea
          id={id}
          rows={2}
          value={texto}
          maxLength={CAMPANHA_MAXIMA}
          onChange={(evento) => setTexto(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key !== 'Enter') return;
            evento.preventDefault();
            evento.currentTarget.blur();
          }}
          onBlur={() => despachar({ tipo: 'campanha', ativa: estado.campanha.ativa, texto })}
          aria-describedby={`${id}-contagem`}
        />
        <p id={`${id}-contagem`} className={styles.nota}>
          {texto.length}/{CAMPANHA_MAXIMA}
        </p>
      </div>
    </section>
  );
}
