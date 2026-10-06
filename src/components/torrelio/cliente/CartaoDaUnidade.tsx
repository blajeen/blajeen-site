'use client';

import { memo, useEffect, useRef } from 'react';
import { fluxoDePagamento, formatarPontosBase, percentuaisDaObra, percentualDaObra, situacaoDoPavimento } from '@/lib/torrelio/calculos';
import { CANTO_DO_FINAL, ETAPAS, NOMES_DOS_GRUPOS, TIPOLOGIAS, type CondicaoPagamento, type Obra } from '@/lib/torrelio/dados';
import { resumoDaVista } from '@/lib/torrelio/entorno';
import { NOMES_DO_STATUS, type EstadoUnidade } from '@/lib/torrelio/estado';
import { formatarArea, formatarCentavos, formatarCota, formatarPrecoPorM2, partesDoValor } from '@/lib/torrelio/formatar';
import { cota } from '@/lib/torrelio/predio';
import type { Estacao, Unidade } from '@/lib/torrelio/tipos';
import { NOMES_DAS_FACHADAS } from '../interface';
import styles from '../Torrelio.module.css';
import { FaixaDoSol, resumoDoSol } from './FaixaDoSol';

type Props = {
  unidade: Unidade;
  situacao: EstadoUnidade;
  condicao: CondicaoPagamento;
  tabela: number;
  camada: 'comercial' | 'obra';
  obra: Obra;
  hora: number;
  estacao: Estacao;
  /** Não há outra disponível para onde ir. */
  semOutras: boolean;
  aoVerVista(): void;
  aoVerApartamento(): void;
  aoNavegar(sentido: 1 | -1): void;
  aoCompartilhar(): void;
  compartilhado: string | null;
};

const INDICES: Readonly<Record<CondicaoPagamento['indice'], string>> = {
  INCC: 'Parcelas corrigidas pelo INCC até as chaves (condição fictícia).',
  IPCA: 'Parcelas corrigidas pelo IPCA até as chaves (condição fictícia).',
  nenhum: 'Parcelas sem correção (condição fictícia).',
};

export const CartaoDaUnidade = memo(function CartaoDaUnidade({
  unidade, situacao, condicao, tabela, camada, obra, hora, estacao, semOutras, aoVerVista, aoVerApartamento, aoNavegar, aoCompartilhar, compartilhado,
}: Props) {
  const tipologia = TIPOLOGIAS[unidade.tipologia];
  const pavimento = unidade.pavimentos[0]!;
  const andares = unidade.pavimentos.map((p) => `${p}º`).join(' e ');
  const [inteiro, centavos] = partesDoValor(situacao.precoCentavos);
  const fluxo = fluxoDePagamento(situacao.precoCentavos, condicao);
  const ajuste = fluxo.linhas.find((l) => l.ajusteNaPrimeira > 0);
  const vista = [...new Set(unidade.fachadas.map((f) => resumoDaVista(unidade, f)))].join(' · ');
  const canto = unidade.tipologia === 'cobertura' ? (unidade.final === '01' ? 'frente' : 'fundos') : `canto ${CANTO_DO_FINAL[unidade.final]}`;
  const tituloId = `cartao-${unidade.id}`;

  // Outra unidade, cartão do começo: as ações ficam no topo e têm de aparecer sem rolar.
  const cartaoRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (cartaoRef.current) cartaoRef.current.scrollTop = 0;
  }, [unidade.id]);

  return (
    <article ref={cartaoRef} className={styles.cartao} aria-labelledby={tituloId} data-status={situacao.status}>
      <header className={styles.cartaoTopo}>
        <p className="tecnica text-mineral">
          {unidade.tipologia === 'cobertura' ? 'COBERTURA DUPLEX' : 'APARTAMENTO'} · FINAL {unidade.final}
        </p>
        <div className={styles.cartaoNumero}>
          <h3 id={tituloId}>{unidade.id}</h3>
          <span className={styles.selo} data-status={situacao.status}>
            <span className={styles.marcaDoStatus} aria-hidden="true" />
            {NOMES_DO_STATUS[situacao.status].singular}
          </span>
        </div>
        <p className={styles.cartaoTipologia}>
          {tipologia.nome} · {canto}, com varanda
        </p>
      </header>

      {/* As ações vêm logo depois do número: no fim do cartão elas ficavam escondidas pela rolagem. */}
      <div className={styles.acoes}>
        <button type="button" className={styles.botaoPrincipal} onClick={aoVerVista}>
          Ver a vista desta unidade <span aria-hidden="true">↗</span>
        </button>
        <div className={styles.acoesEmPar}>
          <button type="button" className={styles.botao} onClick={aoVerApartamento}>
            Ver por dentro <span aria-hidden="true">↓</span>
          </button>
          <button type="button" className={styles.botao} onClick={aoCompartilhar}>
            Compartilhar
          </button>
        </div>
        <div className={styles.navegarDisponiveis} role="group" aria-label="Navegar pelas disponíveis">
          <button type="button" className={styles.botaoPequeno} onClick={() => aoNavegar(-1)} disabled={semOutras} aria-label="Disponível anterior">
            <span aria-hidden="true">‹</span> Anterior
          </button>
          <span className={styles.rotuloDaNavegacao} aria-hidden="true">
            Disponíveis
          </span>
          <button type="button" className={styles.botaoPequeno} onClick={() => aoNavegar(1)} disabled={semOutras} aria-label="Próxima disponível">
            Próxima <span aria-hidden="true">›</span>
          </button>
        </div>
        {compartilhado ? (
          <p className={styles.notaMiuda} role="status">
            {compartilhado}
          </p>
        ) : null}
      </div>

      <dl className={styles.fichas}>
        <div>
          <dt>Área privativa</dt>
          <dd>{formatarArea(tipologia.areaCentesimos)}</dd>
        </div>
        <div>
          <dt>Pavimento</dt>
          <dd>
            {andares} · {formatarCota(cota(pavimento))}
          </dd>
        </div>
        <div>
          <dt>{tipologia.vagas > 1 ? 'Vagas' : 'Vaga'}</dt>
          <dd>{tipologia.vagas}</dd>
        </div>
        <div>
          <dt>Janelas</dt>
          <dd>{unidade.fachadas.map((f) => NOMES_DAS_FACHADAS[f]).join(' e ')}</dd>
        </div>
        <div>
          <dt>Vista</dt>
          <dd>{vista}</dd>
        </div>
        <div>
          <dt>Sol</dt>
          <dd>{resumoDoSol(unidade.fachadas, estacao)}</dd>
        </div>
      </dl>

      {camada === 'obra' ? (
        <section className={styles.cartaoBloco} aria-label="Obra do andar">
          <p className="tecnica text-mineral">OBRA · MÊS {obra.mes} DE {obra.meses}</p>
          <p className={styles.obraDoAndar}>
            {pavimento}º:{' '}
            {{ fechado: 'estrutura e fachada prontas', estrutura: 'estrutura pronta, fachada a fazer', 'a-subir': 'estrutura ainda a subir' }[situacaoDoPavimento(obra, pavimento)]}
          </p>
          <p className={styles.obraGlobal}>
            <strong>{percentualDaObra(obra)}%</strong> da obra
          </p>
          <ul className={styles.etapas}>
            {ETAPAS.map((etapa) => {
              const valor = percentuaisDaObra(obra)[etapa.id];
              return (
                <li key={etapa.id}>
                  <span>{etapa.nome}</span>
                  <span className={styles.barra} aria-hidden="true">
                    <span style={{ width: `${valor}%` }} />
                  </span>
                  <span>{valor}%</span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className={styles.cartaoBloco} aria-label="Valor e pagamento">
        <p className="tecnica text-mineral">VALOR DE TABELA</p>
        <p className={styles.valor}>
          {inteiro}
          <span>{centavos}</span>
        </p>
        <p className={styles.porM2}>{formatarPrecoPorM2(situacao.precoCentavos, tipologia.areaCentesimos)} privativo</p>
        <table className={styles.fluxo}>
          <caption className="sr-only">Fluxo de pagamento da unidade {unidade.id}</caption>
          <tbody>
            {fluxo.linhas
              .filter((linha) => linha.total > 0)
              .map((linha) => (
                <tr key={linha.id}>
                  <th scope="row">
                    {NOMES_DOS_GRUPOS[linha.id]}
                    <span>{formatarPontosBase(linha.pontosBase)}</span>
                  </th>
                  <td>
                    {linha.parcelas > 1 ? `${linha.parcelas} × ` : ''}
                    {formatarCentavos(linha.valor)}
                  </td>
                </tr>
              ))}
            <tr className={styles.soma}>
              <th scope="row">
                Soma<span>100%</span>
              </th>
              <td>{formatarCentavos(fluxo.soma)}</td>
            </tr>
          </tbody>
        </table>
        {ajuste ? (
          <p className={styles.notaMiuda}>
            A primeira parcela de {NOMES_DOS_GRUPOS[ajuste.id].toLowerCase()} leva {formatarCentavos(ajuste.ajusteNaPrimeira)} a mais, para a soma fechar no centavo.
          </p>
        ) : null}
        <p className={styles.notaMiuda}>{INDICES[condicao.indice]}</p>
      </section>

      <section className={styles.cartaoBloco} aria-label="Sol nas fachadas da unidade">
        <p className="tecnica text-mineral">SOL DIRETO · SIMULAÇÃO APROXIMADA</p>
        <FaixaDoSol fachadas={unidade.fachadas} estacao={estacao} hora={hora} />
      </section>

      <p className={styles.rodapeDoCartao}>Valores, condição e unidade fictícios · tabela {tabela}</p>
    </article>
  );
});
