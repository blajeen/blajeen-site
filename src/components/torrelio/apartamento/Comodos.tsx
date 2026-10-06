'use client';

import { formatarArea, PLANTA, type ComodoId } from '@/lib/torrelio/planta';
import styles from './Apartamento.module.css';

/** "01", "02"…: o mesmo número aparece no rótulo do cômodo na planta, no celular. */
export const numeroDoComodo = (id: ComodoId) => String(PLANTA.comodos.findIndex((c) => c.id === id) + 1).padStart(2, '0');

type Lista = {
  selecionado: ComodoId | null;
  aoEscolher(id: ComodoId): void;
  aoPassar(id: ComodoId | null): void;
};

/** Os cômodos como botões: o caminho de teclado e de leitor de tela para tudo o que o 3D faz. */
export function ListaDeComodos({ selecionado, aoEscolher, aoPassar }: Lista) {
  return (
    <div className={styles.grupo}>
      <h3 id="apartamento-comodos" className={styles.rotuloDoGrupo}>
        Cômodos
      </h3>
      <ul className={styles.lista} aria-labelledby="apartamento-comodos">
        {PLANTA.comodos.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={styles.itemDaLista}
              aria-pressed={selecionado === c.id}
              onClick={() => aoEscolher(c.id)}
              onPointerEnter={(evento) => {
                if (evento.pointerType === 'mouse') aoPassar(c.id);
              }}
              onPointerLeave={() => aoPassar(null)}
              onFocus={() => aoPassar(c.id)}
              onBlur={() => aoPassar(null)}
            >
              <span className={styles.numero} aria-hidden="true">
                {numeroDoComodo(c.id)}
              </span>
              <span>{c.nome}</span>
              <span className={styles.areaDoItem}>{formatarArea(c.areaCentesimos)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** O quadro de áreas da planta fictícia, com a área útil (soma dos cômodos) e a privativa. */
export function TabelaDeAreas({ selecionado }: { selecionado: ComodoId | null }) {
  return (
    <table className={styles.tabela}>
      <caption>Quadro de áreas · planta fictícia</caption>
      <thead>
        <tr>
          <th scope="col">Cômodo</th>
          <th scope="col">Área</th>
        </tr>
      </thead>
      <tbody>
        {PLANTA.comodos.map((c) => (
          <tr key={c.id} data-selecionado={selecionado === c.id ? 'sim' : 'nao'}>
            <th scope="row">{c.nome}</th>
            <td>{formatarArea(c.areaCentesimos)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Área útil (soma dos cômodos)</th>
          <td>{formatarArea(PLANTA.areaUtilCentesimos)}</td>
        </tr>
        <tr>
          <th scope="row">Área privativa (com paredes e varanda)</th>
          <td>{formatarArea(PLANTA.areaPrivativaCentesimos)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
