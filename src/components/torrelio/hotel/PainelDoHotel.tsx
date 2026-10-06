'use client';

import { useMemo, useState } from 'react';
import { formatarPontosBase } from '@/lib/torrelio/calculos';
import { CATEGORIAS } from '@/lib/torrelio/dados';
import { DIARIA_MAXIMA_CENTAVOS, DIARIA_MINIMA_CENTAVOS, type AcaoTorrelio, type EstadoTorrelio } from '@/lib/torrelio/estado';
import { formatarDiaComSemana, formatarDiaCurto, lerValorEmReais } from '@/lib/torrelio/formatar';
import { adicionarDias, ocupacaoDoDia, quartoLivre, reservasValendo, validarPeriodo, type Dia, type EstadoHotel } from '@/lib/torrelio/hotel';
import { QUARTOS } from '@/lib/torrelio/predio';
import type { CategoriaId } from '@/lib/torrelio/tipos';
import { Abas } from '../Abas';
import type { SubAbaDoHotel } from '../interface';
import { Historico } from '../painel/Historico';
import styles from '../Torrelio.module.css';

type Props = {
  estado: EstadoTorrelio;
  hotel: EstadoHotel;
  despachar(acao: AcaoTorrelio): void;
  diaDoPainel: number;
  aoDia(dia: number): void;
  subAba: SubAbaDoHotel;
  aoSubAba(sub: SubAbaDoHotel): void;
  aoEscolherQuarto(id: string): void;
};

const SUB_ABAS: readonly { id: SubAbaDoHotel; rotulo: string }[] = [
  { id: 'hoje', rotulo: 'Ocupação' },
  { id: 'reservas', rotulo: 'Reservas' },
  { id: 'diarias', rotulo: 'Diárias' },
  { id: 'bloqueios', rotulo: 'Bloqueios' },
  { id: 'historico', rotulo: 'Histórico' },
];

/** O painel do hotel: a fachada dia a dia, reservas, diárias e quartos em manutenção. */
export function PainelDoHotel({ estado, hotel, despachar, diaDoPainel, aoDia, subAba, aoSubAba, aoEscolherQuarto }: Props) {
  const dia = adicionarDias(hotel.diaBase, diaDoPainel);
  const ocupacao = useMemo(() => ocupacaoDoDia(hotel, dia), [hotel, dia]);
  return (
    <div className={styles.painelDeControle}>
      <div className={styles.formulario}>
        <label htmlFor="torrelio-dia" className={styles.rotuloComValor}>
          Noite mostrada na fachada <strong>{diaDoPainel === 0 ? `hoje, ${formatarDiaCurto(dia)}` : formatarDiaComSemana(dia)}</strong>
        </label>
        <input
          id="torrelio-dia"
          type="range"
          min={0}
          max={13}
          value={diaDoPainel}
          aria-valuetext={formatarDiaComSemana(dia)}
          onChange={(e) => aoDia(Number(e.target.value))}
        />
        <p className={styles.notaMiuda}>Arraste pelos próximos 14 dias: o hotel enche no fim de semana e a fachada acende junto.</p>
      </div>
      <dl className={styles.razao} aria-label={`Ocupação na noite de ${formatarDiaCurto(dia)} (fictícia)`}>
        <div>
          <dt>Ocupação</dt>
          <dd>{ocupacao.percentual}%</dd>
        </div>
        <div>
          <dt>Ocupados</dt>
          <dd>{ocupacao.ocupados}</dd>
        </div>
        <div>
          <dt>Livres</dt>
          <dd>{ocupacao.livres}</dd>
        </div>
        <div>
          <dt>Manutenção</dt>
          <dd>{ocupacao.bloqueados}</dd>
        </div>
        <div>
          <dt>Chegadas</dt>
          <dd>{ocupacao.chegadas}</dd>
        </div>
        <div>
          <dt>Saídas</dt>
          <dd>{ocupacao.saidas}</dd>
        </div>
      </dl>

      <Abas rotulo="Seções do painel do hotel" abas={SUB_ABAS} ativa={subAba} aoMudar={aoSubAba} base="torrelio-hotel" variante="secundaria" />
      <div role="tabpanel" id={`torrelio-hotel-painel-${subAba}`} aria-labelledby={`torrelio-hotel-aba-${subAba}`} className={styles.subPainel}>
        {subAba === 'hoje' ? <Chegadas hotel={hotel} dia={dia} aoEscolherQuarto={aoEscolherQuarto} /> : null}
        {subAba === 'reservas' ? <Reservas hotel={hotel} dia={dia} despachar={despachar} aoEscolherQuarto={aoEscolherQuarto} /> : null}
        {subAba === 'diarias' ? <Diarias hotel={hotel} despachar={despachar} /> : null}
        {subAba === 'bloqueios' ? <Bloqueios hotel={hotel} dia={dia} despachar={despachar} /> : null}
        {subAba === 'historico' ? <Historico historico={estado.historico} /> : null}
      </div>
    </div>
  );
}

function Chegadas({ hotel, dia, aoEscolherQuarto }: { hotel: EstadoHotel; dia: Dia; aoEscolherQuarto(id: string): void }) {
  const chegadas = useMemo(() => reservasValendo(hotel).filter((r) => r.entrada === dia).sort((a, b) => a.quarto.localeCompare(b.quarto, 'pt-BR', { numeric: true })), [hotel, dia]);
  return (
    <section aria-label="Chegadas da noite">
      <p className="tecnica text-mineral">CHEGADAS EM {formatarDiaCurto(dia)}</p>
      {chegadas.length ? (
        <ul className={styles.listaCompacta}>
          {chegadas.slice(0, 24).map((r) => (
            <li key={r.id}>
              <button type="button" className={styles.linkDeLista} onClick={() => aoEscolherQuarto(r.quarto)}>
                {r.quarto}
              </button>
              <span>
                até {formatarDiaCurto(r.saida)} · {r.hospedes} {r.hospedes === 1 ? 'hóspede' : 'hóspedes'}
                {r.origem !== 'inicial' ? ' · feita na demonstração' : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.vazio}>Nenhuma chegada nesta noite.</p>
      )}
    </section>
  );
}

function Reservas({ hotel, dia, despachar, aoEscolherQuarto }: { hotel: EstadoHotel; dia: Dia; despachar(a: AcaoTorrelio): void; aoEscolherQuarto(id: string): void }) {
  const [busca, setBusca] = useState('');
  const lista = useMemo(() => {
    const todas = reservasValendo(hotel).filter((r) => r.entrada <= dia && dia < r.saida);
    const feitas = hotel.reservas.filter((r) => !todas.includes(r));
    return [...feitas, ...todas]
      .filter((r) => !busca || r.quarto.includes(busca.trim()))
      .sort((a, b) => Number(b.origem !== 'inicial') - Number(a.origem !== 'inicial') || a.quarto.localeCompare(b.quarto, 'pt-BR', { numeric: true }));
  }, [hotel, dia, busca]);
  return (
    <section aria-label="Reservas">
      <label className={styles.linhaDeCampo}>
        <span>Quarto</span>
        <input inputMode="numeric" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="ex.: 1806" />
      </label>
      <p className="tecnica text-mineral">HOSPEDADOS NA NOITE DE {formatarDiaCurto(dia)} E FEITAS NA DEMONSTRAÇÃO</p>
      <ul className={styles.listaCompacta}>
        {lista.slice(0, 40).map((r) => (
          <li key={r.id}>
            <button type="button" className={styles.linkDeLista} onClick={() => aoEscolherQuarto(r.quarto)}>
              {r.quarto}
            </button>
            <span>
              {formatarDiaCurto(r.entrada)} a {formatarDiaCurto(r.saida)} · {r.hospedes} {r.hospedes === 1 ? 'hóspede' : 'hóspedes'}
              {r.origem === 'cliente' ? ' · pelo site' : r.origem === 'painel' ? ' · pelo painel' : ''}
            </span>
            <button type="button" className={styles.botaoPequeno} onClick={() => despachar({ tipo: 'hotel/cancelar', reservaId: r.id })}>
              Cancelar
            </button>
          </li>
        ))}
      </ul>
      {lista.length > 40 ? <p className={styles.notaMiuda}>Mostrando 40 de {lista.length}. Filtre pelo número do quarto.</p> : null}
    </section>
  );
}

function Diarias({ hotel, despachar }: { hotel: EstadoHotel; despachar(a: AcaoTorrelio): void }) {
  const [valores, setValores] = useState<Record<CategoriaId, string>>(
    () => Object.fromEntries(CATEGORIAS.map((c) => [c.id, (hotel.diarias[c.id] / 100).toLocaleString('pt-BR')])) as Record<CategoriaId, string>,
  );
  return (
    <section className={styles.formulario} aria-label="Diárias por categoria">
      {CATEGORIAS.map((c) => {
        const centavos = lerValorEmReais(valores[c.id]);
        const valido = centavos !== null && centavos >= DIARIA_MINIMA_CENTAVOS && centavos <= DIARIA_MAXIMA_CENTAVOS;
        return (
          <form
            key={c.id}
            className={styles.linhaDeCampo}
            onSubmit={(e) => {
              e.preventDefault();
              if (valido) despachar({ tipo: 'hotel/diaria', categoria: c.id, centavos: centavos! });
            }}
          >
            <label htmlFor={`torrelio-diaria-${c.id}`}>{c.nome}</label>
            <input
              id={`torrelio-diaria-${c.id}`}
              inputMode="decimal"
              value={valores[c.id]}
              aria-invalid={!valido}
              onChange={(e) => setValores((v) => ({ ...v, [c.id]: e.target.value }))}
            />
            <button type="submit" className={styles.botaoPequeno} disabled={!valido || centavos === hotel.diarias[c.id]}>
              Salvar
            </button>
          </form>
        );
      })}
      <label htmlFor="torrelio-fds" className={styles.rotuloComValor}>
        Fim de semana (sexta e sábado) <strong>+{formatarPontosBase(hotel.fimDeSemanaPb)}</strong>
      </label>
      <input
        id="torrelio-fds"
        type="range"
        min={0}
        max={5000}
        step={250}
        value={hotel.fimDeSemanaPb}
        aria-valuetext={`mais ${formatarPontosBase(hotel.fimDeSemanaPb)}`}
        onChange={(e) => despachar({ tipo: 'hotel/fim-de-semana', pontosBase: Number(e.target.value) })}
      />
      <p className={styles.notaMiuda}>Diárias fictícias. Valem para as próximas reservas feitas na demonstração.</p>
    </section>
  );
}

function Bloqueios({ hotel, dia, despachar }: { hotel: EstadoHotel; dia: Dia; despachar(a: AcaoTorrelio): void }) {
  const [quarto, setQuarto] = useState('2001');
  const [de, setDe] = useState(dia);
  const [ate, setAte] = useState(adicionarDias(dia, 2));
  const existe = QUARTOS.some((q) => q.id === quarto);
  const erro = !existe ? 'Esse quarto não existe.' : validarPeriodo(de, ate) ?? (quartoLivre(hotel, quarto, de, ate) ? null : 'O quarto tem reserva ou bloqueio nessas datas.');
  return (
    <section className={styles.formulario} aria-label="Quartos em manutenção">
      <form
        className={styles.bloqueioForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (!erro) despachar({ tipo: 'hotel/bloquear', quarto, de, ate });
        }}
      >
        <label>
          <span>Quarto</span>
          <input inputMode="numeric" value={quarto} onChange={(e) => setQuarto(e.target.value.trim())} />
        </label>
        <label>
          <span>De</span>
          <input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
        </label>
        <label>
          <span>Até</span>
          <input type="date" value={ate} min={de} onChange={(e) => setAte(e.target.value)} />
        </label>
        <button type="submit" className={styles.botao} disabled={Boolean(erro)}>
          Bloquear
        </button>
      </form>
      <p className={styles.notaMiuda} aria-live="polite" data-erro={erro ? 'sim' : 'nao'}>
        {erro ?? 'O quarto fica apagado na fachada, com contorno tracejado, e sai da escolha do cliente.'}
      </p>
      {hotel.bloqueios.length ? (
        <ul className={styles.listaCompacta}>
          {hotel.bloqueios.map((b) => (
            <li key={b.id}>
              <strong>{b.quarto}</strong>
              <span>
                {formatarDiaCurto(b.de)} a {formatarDiaCurto(b.ate)}
              </span>
              <button type="button" className={styles.botaoPequeno} onClick={() => despachar({ tipo: 'hotel/desbloquear', bloqueioId: b.id })}>
                Liberar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.vazio}>Nenhum quarto em manutenção.</p>
      )}
    </section>
  );
}
