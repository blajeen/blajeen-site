'use client';

import { memo, useRef, useState, type KeyboardEvent } from 'react';
import { CATEGORIAS } from '@/lib/torrelio/dados';
import type { EstadoTorrelio } from '@/lib/torrelio/estado';
import { formatarCentavos } from '@/lib/torrelio/formatar';
import { quartoLivre, validarPeriodo, type Dia } from '@/lib/torrelio/hotel';
import { PRIMEIRO_TIPO, QUARTOS, ULTIMO_TIPO } from '@/lib/torrelio/predio';
import { quartoServe, type FiltroDoHotel } from '@/lib/torrelio/seletores';
import type { CategoriaId, Quarto } from '@/lib/torrelio/tipos';
import { NOME_DA_CATEGORIA, type Periodo } from '../interface';
import styles from '../Torrelio.module.css';

type Props = {
  estado: EstadoTorrelio;
  periodo: Periodo;
  categoria: CategoriaId | null;
  quarto: string | null;
  aoPeriodo(periodo: Periodo): void;
  aoCategoria(categoria: CategoriaId | null): void;
  aoEscolher(id: string): void;
};

type Situacao = 'livre' | 'ocupado' | 'nao-serve';

function situacaoDo(estado: EstadoTorrelio, quarto: Quarto, filtro: FiltroDoHotel): Situacao {
  if (quartoServe(estado, quarto, filtro)) return 'livre';
  const hotel = estado.hotel;
  if (hotel && validarPeriodo(filtro.entrada, filtro.saida) === null && !quartoLivre(hotel, quarto.id, filtro.entrada, filtro.saida)) return 'ocupado';
  return 'nao-serve';
}

const NOMES_DA_SITUACAO: Readonly<Record<Situacao, string>> = { livre: 'livre no período', ocupado: 'ocupado', 'nao-serve': 'fora do filtro' };

/** As duas grades do hotel, frente e fundos, andar por andar, e as suítes da cobertura. */
export const EscolhaDoQuarto = memo(function EscolhaDoQuarto({ estado, periodo, categoria, quarto, aoPeriodo, aoCategoria, aoEscolher }: Props) {
  const filtro: FiltroDoHotel = { ...periodo, categoria };
  const erro = validarPeriodo(periodo.entrada, periodo.saida);
  const livres = erro ? 0 : QUARTOS.filter((q) => quartoServe(estado, q, filtro)).length;

  return (
    <section className={styles.escolhaDoQuarto} aria-labelledby="torrelio-escolha">
      <header>
        <p className={styles.seloFicticio}>HOTEL FICTÍCIO</p>
        <h3 id="torrelio-escolha" className={styles.nomeDoEmpreendimento}>
          Escolha o quarto pela vista
        </h3>
        <p className="text-mineral">146 quartos · o contorno marca os livres no período</p>
      </header>
      <div className={styles.periodo}>
        <label>
          <span>Entrada</span>
          <input type="date" value={periodo.entrada} onChange={(e) => aoPeriodo({ ...periodo, entrada: e.target.value as Dia })} />
        </label>
        <label>
          <span>Saída</span>
          <input type="date" value={periodo.saida} min={periodo.entrada} onChange={(e) => aoPeriodo({ ...periodo, saida: e.target.value as Dia })} />
        </label>
        <fieldset>
          <legend>Hóspedes</legend>
          <span role="group" aria-label="Hóspedes" className={styles.segmento}>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={periodo.hospedes === n}
                aria-label={`${n} ${n === 1 ? 'pessoa' : 'pessoas'}`}
                onClick={() => aoPeriodo({ ...periodo, hospedes: n })}
              >
                {n}
              </button>
            ))}
          </span>
        </fieldset>
      </div>
      <p className={styles.notaMiuda} aria-live="polite" data-erro={erro ? 'sim' : 'nao'}>
        {erro ?? `${livres} ${livres === 1 ? 'quarto livre' : 'quartos livres'} para ${periodo.hospedes} ${periodo.hospedes === 1 ? 'pessoa' : 'pessoas'}${categoria ? ` em ${NOME_DA_CATEGORIA[categoria]}` : ''}.`}
      </p>
      <div role="group" aria-label="Categoria" className={styles.chips}>
        <button type="button" aria-pressed={categoria === null} onClick={() => aoCategoria(null)}>
          Todas
        </button>
        {CATEGORIAS.map((c) => (
          <button key={c.id} type="button" aria-pressed={categoria === c.id} onClick={() => aoCategoria(c.id)}>
            {c.nome} <span>{formatarCentavos(estado.hotel?.diarias[c.id] ?? c.diariaCentavos).replace(',00', '')}</span>
          </button>
        ))}
      </div>
      <GradeDeQuartos estado={estado} filtro={filtro} quarto={quarto} aoEscolher={aoEscolher} />
      <ul className={styles.legenda} aria-label="Legenda dos quartos">
        <li data-situacao="livre">
          <span className={styles.marcaDoQuarto} aria-hidden="true" />
          Livre no período
        </li>
        <li data-situacao="ocupado">
          <span className={styles.marcaDoQuarto} aria-hidden="true" />
          Ocupado (luz acesa)
        </li>
        <li data-situacao="nao-serve">
          <span className={styles.marcaDoQuarto} aria-hidden="true" />
          Fora do filtro
        </li>
      </ul>
    </section>
  );
});

const LADOS = [
  { id: 'frente', titulo: 'Frente · cidade', finais: ['01', '02', '03', '04'] },
  { id: 'fundos', titulo: 'Fundos · parque e mar', finais: ['05', '06', '07', '08'] },
] as const;

const ANDARES = Array.from({ length: ULTIMO_TIPO - PRIMEIRO_TIPO + 1 }, (_, i) => ULTIMO_TIPO - i);

type PropsDaGrade = { estado: EstadoTorrelio; filtro: FiltroDoHotel; quarto: string | null; aoEscolher(id: string): void };

/** As suítes no topo e um lado do hotel por vez, numa grade de 4 colunas (44 px no celular). */
function GradeDeQuartos(props: PropsDaGrade) {
  const doFiltro = props.filtro.categoria === 'cidade' || props.filtro.categoria === 'canto-cidade' ? 'frente' : props.filtro.categoria ? 'fundos' : null;
  const [escolhido, setEscolhido] = useState<'frente' | 'fundos'>('fundos');
  const ladoId = doFiltro ?? escolhido;
  const lado = LADOS.find((l) => l.id === ladoId)!;
  return (
    <div className={styles.gradesDoHotel}>
      <Grade {...props} rotulo="Suítes da cobertura" linhas={[{ rotulo: 'Suítes', ids: ['2001', '2002'] }]} />
      <div role="group" aria-label="Lado do hotel" className={styles.segmento}>
        {LADOS.map((l) => (
          <button key={l.id} type="button" aria-pressed={l.id === ladoId} onClick={() => setEscolhido(l.id)} disabled={doFiltro !== null && doFiltro !== l.id}>
            {l.titulo}
          </button>
        ))}
      </div>
      <Grade
        key={lado.id}
        {...props}
        rotulo={`Quartos da ${lado.titulo.toLowerCase()}`}
        linhas={ANDARES.map((andar) => ({ rotulo: `${andar}º`, ids: lado.finais.map((f) => `${andar}${f}`) }))}
      />
    </div>
  );
}

function Grade({ estado, filtro, quarto, aoEscolher, rotulo, titulo, linhas }: PropsDaGrade & { rotulo: string; titulo?: string; linhas: { rotulo: string; ids: string[] }[] }) {
  const raiz = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState<string | null>(null);
  const todos = linhas.flatMap((l) => l.ids);
  const focavel = ativo && todos.includes(ativo) ? ativo : quarto && todos.includes(quarto) ? quarto : todos[0]!;

  function mover(evento: KeyboardEvent<HTMLButtonElement>, l: number, c: number) {
    const ultima = linhas.length - 1;
    const largura = linhas[l]!.ids.length;
    const destino: [number, number] | null =
      evento.key === 'ArrowRight' ? [l, Math.min(c + 1, largura - 1)]
        : evento.key === 'ArrowLeft' ? [l, Math.max(c - 1, 0)]
          : evento.key === 'ArrowDown' ? [Math.min(l + 1, ultima), c]
            : evento.key === 'ArrowUp' ? [Math.max(l - 1, 0), c]
              : evento.key === 'Home' ? (evento.ctrlKey ? [0, 0] : [l, 0])
                : evento.key === 'End' ? (evento.ctrlKey ? [ultima, linhas[ultima]!.ids.length - 1] : [l, largura - 1])
                  : null;
    if (!destino) return;
    evento.preventDefault();
    const alvo = linhas[destino[0]]!.ids[Math.min(destino[1], linhas[destino[0]]!.ids.length - 1)]!;
    setAtivo(alvo);
    raiz.current?.querySelector<HTMLButtonElement>(`[data-quarto="${alvo}"]`)?.focus();
  }

  return (
    <div className={styles.gradeDoHotel}>
      {titulo ? (
        <p className="tecnica text-mineral" aria-hidden="true">
          {titulo.toUpperCase()}
        </p>
      ) : null}
      <div ref={raiz} role="grid" aria-label={rotulo}>
        {linhas.map((linha, l) => (
          <div key={linha.rotulo} role="row" className={styles.linhaDoHotel}>
            <span role="rowheader" className={styles.andarDoHotel}>
              {linha.rotulo}
            </span>
            {linha.ids.map((id, c) => {
              const q = QUARTOS.find((x) => x.id === id)!;
              const situacao = situacaoDo(estado, q, filtro);
              return (
                <span key={id} role="gridcell" aria-selected={id === quarto} className={styles.celulaDoHotel}>
                  <button
                    type="button"
                    data-quarto={id}
                    data-situacao={situacao}
                    tabIndex={id === focavel ? 0 : -1}
                    className={styles.celulaDoQuarto}
                    aria-label={`Quarto ${id}, ${NOME_DA_CATEGORIA[q.categoria]}, ${q.pavimento}º andar, até ${q.capacidade} pessoas, ${NOMES_DA_SITUACAO[situacao]}`}
                    onClick={() => {
                      setAtivo(id);
                      aoEscolher(id);
                    }}
                    onKeyDown={(e) => mover(e, l, c)}
                  >
                    <span className={styles.marcaDoQuarto} aria-hidden="true" />
                    {id}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
