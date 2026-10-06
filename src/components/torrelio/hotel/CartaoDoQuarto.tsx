'use client';

import { CATEGORIAS } from '@/lib/torrelio/dados';
import { resumoDaVista } from '@/lib/torrelio/entorno';
import type { AcaoTorrelio, EstadoTorrelio } from '@/lib/torrelio/estado';
import { formatarPontosBase } from '@/lib/torrelio/calculos';
import { formatarCentavos, formatarCota, formatarDiaComSemana } from '@/lib/torrelio/formatar';
import { quartoLivre, validarPeriodo, valorDaEstadia } from '@/lib/torrelio/hotel';
import { cota } from '@/lib/torrelio/predio';
import type { Quarto } from '@/lib/torrelio/tipos';
import { NOMES_DAS_FACHADAS, type Periodo } from '../interface';
import styles from '../Torrelio.module.css';

type Props = {
  estado: EstadoTorrelio;
  quarto: Quarto;
  periodo: Periodo;
  despachar(acao: AcaoTorrelio): void;
  aoVerVista(): void;
  reservado: boolean;
  aoReservar(): void;
};

/** O cartão do quarto: categoria, andar, vista, o preço do período e a reserva de mentira. */
export function CartaoDoQuarto({ estado, quarto, periodo, despachar, aoVerVista, reservado, aoReservar }: Props) {
  const hotel = estado.hotel;
  const categoria = CATEGORIAS.find((c) => c.id === quarto.categoria)!;
  const erro = validarPeriodo(periodo.entrada, periodo.saida);
  const livre = hotel && !erro ? quartoLivre(hotel, quarto.id, periodo.entrada, periodo.saida) : false;
  const cabe = quarto.capacidade >= periodo.hospedes;
  const estadia = hotel && !erro ? valorDaEstadia(hotel, quarto.categoria, periodo.entrada, periodo.saida) : null;
  const fundos = quarto.fachadas.includes('sul');
  const tituloId = `quarto-${quarto.id}`;

  return (
    <article className={styles.cartao} aria-labelledby={tituloId} data-status={livre && cabe ? 'disponivel' : 'vendida'}>
      <header className={styles.cartaoTopo}>
        <p className="tecnica text-mineral">QUARTO · {categoria.nome.toUpperCase()}</p>
        <div className={styles.cartaoNumero}>
          <h3 id={tituloId}>{quarto.id}</h3>
          <span className={styles.selo} data-status={livre && cabe ? 'disponivel' : 'vendida'}>
            <span className={styles.marcaDoStatus} aria-hidden="true" />
            {erro ? 'escolha as datas' : !livre ? 'ocupado no período' : !cabe ? `até ${quarto.capacidade} pessoas` : 'livre no período'}
          </span>
        </div>
        <p className={styles.cartaoTipologia}>
          {quarto.pavimentos.map((p) => `${p}º`).join(' e ')} · {fundos ? 'fundos' : 'frente'} · até {quarto.capacidade} pessoas
        </p>
      </header>
      <dl className={styles.fichas}>
        <div>
          <dt>Altura</dt>
          <dd>{formatarCota(cota(quarto.pavimento))}</dd>
        </div>
        <div>
          <dt>Janelas</dt>
          <dd>{quarto.fachadas.map((f) => NOMES_DAS_FACHADAS[f]).join(' e ')}</dd>
        </div>
        <div>
          <dt>Vista</dt>
          <dd>{[...new Set(quarto.fachadas.map((f) => resumoDaVista(quarto, f)))].join(' · ')}</dd>
        </div>
        <div>
          <dt>Diária</dt>
          <dd>
            {formatarCentavos(hotel?.diarias[quarto.categoria] ?? categoria.diariaCentavos)}
            {hotel ? <span className="text-mineral"> · fim de semana +{formatarPontosBase(hotel.fimDeSemanaPb)}</span> : null}
          </dd>
        </div>
      </dl>
      {estadia && estadia.noites > 0 ? (
        <section className={styles.cartaoBloco} aria-label="Valor do período">
          <p className="tecnica text-mineral">
            {formatarDiaComSemana(periodo.entrada).toUpperCase()} → {formatarDiaComSemana(periodo.saida).toUpperCase()}
          </p>
          <p className={styles.valor}>{formatarCentavos(estadia.total)}</p>
          <p className={styles.porM2}>
            {estadia.noites} {estadia.noites === 1 ? 'diária' : 'diárias'}
            {estadia.noitesDeFimDeSemana ? `, ${estadia.noitesDeFimDeSemana} de fim de semana (${formatarCentavos(estadia.diariaFimDeSemana)})` : ''}
          </p>
        </section>
      ) : null}
      <div className={styles.acoes}>
        <button type="button" className={styles.botao} onClick={aoVerVista}>
          Ver a vista deste quarto <span aria-hidden="true">↗</span>
        </button>
        <button
          type="button"
          className={styles.botaoPrincipal}
          disabled={!livre || !cabe || Boolean(erro)}
          onClick={() => {
            despachar({ tipo: 'hotel/reservar', quarto: quarto.id, entrada: periodo.entrada, saida: periodo.saida, hospedes: periodo.hospedes, origem: 'cliente' });
            aoReservar();
          }}
        >
          Reservar (demonstração)
        </button>
        {reservado ? (
          <p className={styles.notaMiuda} role="status">
            Reserva de demonstração feita: ela aparece agora no painel do hotel. Nada foi cobrado e nenhum dado pessoal foi pedido.
          </p>
        ) : null}
      </div>
      <p className={styles.rodapeDoCartao}>Hotel, quartos, diárias e reservas fictícios</p>
    </article>
  );
}
