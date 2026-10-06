import { CATEGORIAS } from './dados';
import { QUARTOS } from './predio';
import type { CategoriaId } from './tipos';

/**
 * O prédio como hotel (fictício): reservas, bloqueios, ocupação e preço da estadia.
 *
 * Os dias são strings `AAAA-MM-DD` e a conta é feita em UTC, para não depender do fuso. As reservas
 * iniciais são geradas no navegador, com semente fixa, a partir do dia em que a pessoa abriu o modo
 * hotel (`diaBase`): nenhuma data entra no HTML do servidor, e o armazenamento guarda só o que a
 * pessoa mudou (reservas feitas, iniciais canceladas, bloqueios).
 */

export type Dia = string;

const MS_DIA = 86_400_000;
const PADRAO_DIA = /^\d{4}-\d{2}-\d{2}$/;

function paraUtc(dia: Dia): number {
  const [a, m, d] = dia.split('-').map(Number) as [number, number, number];
  return Date.UTC(a, m - 1, d);
}

function deUtc(ms: number): Dia {
  return new Date(ms).toISOString().slice(0, 10);
}

export function ehDia(valor: unknown): valor is Dia {
  if (typeof valor !== 'string' || !PADRAO_DIA.test(valor)) return false;
  return deUtc(paraUtc(valor)) === valor;
}

/** O dia de hoje no relógio de quem está vendo (o calendário dela, não o do servidor). */
export function hojeLocal(agora: Date = new Date()): Dia {
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function adicionarDias(dia: Dia, dias: number): Dia {
  return deUtc(paraUtc(dia) + dias * MS_DIA);
}

export function diasEntre(de: Dia, ate: Dia): number {
  return Math.round((paraUtc(ate) - paraUtc(de)) / MS_DIA);
}

/** 0 é domingo, 6 é sábado. */
export function diaDaSemana(dia: Dia): number {
  return new Date(paraUtc(dia)).getUTCDay();
}

/** Noite de sexta ou de sábado: a diária de fim de semana. */
export function ehNoiteDeFimDeSemana(dia: Dia): boolean {
  const semana = diaDaSemana(dia);
  return semana === 5 || semana === 6;
}

export type Reserva = {
  id: string;
  quarto: string;
  /** Primeira noite. */
  entrada: Dia;
  /** Dia da saída: a noite anterior é a última. */
  saida: Dia;
  hospedes: number;
  origem: 'inicial' | 'cliente' | 'painel';
};

/** Quarto fora de venda (manutenção) nas noites de `de` até a véspera de `ate`. */
export type Bloqueio = { id: string; quarto: string; de: Dia; ate: Dia };

export type EstadoHotel = {
  diaBase: Dia;
  diarias: Readonly<Record<CategoriaId, number>>;
  fimDeSemanaPb: number;
  /** Reservas feitas na demonstração (pelo cliente ou pelo painel). */
  reservas: readonly Reserva[];
  /** Ids das reservas iniciais canceladas no painel. */
  canceladas: readonly string[];
  bloqueios: readonly Bloqueio[];
};

/** Quantos dias, a partir do `diaBase`, as reservas iniciais cobrem. */
export const DIAS_GERADOS = 35;
/** Uma estadia na demonstração tem no máximo 14 noites. */
export const NOITES_MAXIMAS = 14;

export const DIARIAS_INICIAIS: Readonly<Record<CategoriaId, number>> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.id, c.diariaCentavos]),
) as Record<CategoriaId, number>;

/** mulberry32: pequeno, rápido e igual em qualquer navegador. */
function gerador(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Procura maior nos fins de semana e nas vistas melhores; a suíte é mais rara. */
const PROCURA: Readonly<Record<CategoriaId, number>> = {
  cidade: 0.34,
  'canto-cidade': 0.36,
  'vista-parque': 0.38,
  'vista-mar': 0.4,
  'suite-cobertura': 0.2,
};

let memoria: { diaBase: Dia; reservas: readonly Reserva[] } | null = null;

/** As reservas fictícias com que o hotel abre, sempre as mesmas para o mesmo `diaBase`. */
export function reservasIniciais(diaBase: Dia): readonly Reserva[] {
  if (memoria?.diaBase === diaBase) return memoria.reservas;
  const aleatorio = gerador(0x70_72_65_64);
  const lista: Reserva[] = [];
  for (const quarto of QUARTOS) {
    // Começa dois dias antes: há hóspedes no hotel no dia em que a pessoa abre o modo.
    let dia = -2;
    while (dia < DIAS_GERADOS) {
      const data = adicionarDias(diaBase, dia);
      const procura = PROCURA[quarto.categoria] * (ehNoiteDeFimDeSemana(data) ? 2 : 1);
      if (aleatorio() < procura) {
        const noites = 1 + Math.floor(aleatorio() * (ehNoiteDeFimDeSemana(data) ? 3 : 4));
        lista.push({
          id: `i-${quarto.id}-${dia + 2}`,
          quarto: quarto.id,
          entrada: data,
          saida: adicionarDias(data, noites),
          hospedes: 1 + Math.floor(aleatorio() * quarto.capacidade),
          origem: 'inicial',
        });
        dia += noites + Math.floor(aleatorio() * 2);
      } else {
        dia += 1;
      }
    }
  }
  memoria = { diaBase, reservas: lista };
  return lista;
}

const indices = new WeakMap<EstadoHotel, Map<string, Reserva[]>>();

/** Reservas valendo (iniciais não canceladas e as feitas na demonstração), agrupadas por quarto. */
function porQuarto(hotel: EstadoHotel): Map<string, Reserva[]> {
  const pronto = indices.get(hotel);
  if (pronto) return pronto;
  const canceladas = new Set(hotel.canceladas);
  const mapa = new Map<string, Reserva[]>();
  for (const reserva of [...reservasIniciais(hotel.diaBase), ...hotel.reservas]) {
    if (canceladas.has(reserva.id)) continue;
    const lista = mapa.get(reserva.quarto);
    if (lista) lista.push(reserva);
    else mapa.set(reserva.quarto, [reserva]);
  }
  indices.set(hotel, mapa);
  return mapa;
}

export function reservasValendo(hotel: EstadoHotel): readonly Reserva[] {
  return [...porQuarto(hotel).values()].flat();
}

/** A reserva que ocupa o quarto na noite do dia, se houver. */
export function reservaNaNoite(hotel: EstadoHotel, quarto: string, dia: Dia): Reserva | null {
  return porQuarto(hotel).get(quarto)?.find((r) => r.entrada <= dia && dia < r.saida) ?? null;
}

export function bloqueioNaNoite(hotel: EstadoHotel, quarto: string, dia: Dia): Bloqueio | null {
  return hotel.bloqueios.find((b) => b.quarto === quarto && b.de <= dia && dia < b.ate) ?? null;
}

/** Livre em todas as noites de `entrada` até a véspera de `saida`, sem reserva nem bloqueio. */
export function quartoLivre(hotel: EstadoHotel, quarto: string, entrada: Dia, saida: Dia): boolean {
  const cruza = (de: Dia, ate: Dia) => de < saida && entrada < ate;
  if (porQuarto(hotel).get(quarto)?.some((r) => cruza(r.entrada, r.saida))) return false;
  return !hotel.bloqueios.some((b) => b.quarto === quarto && cruza(b.de, b.ate));
}

export type OcupacaoDoDia = { ocupados: number; livres: number; bloqueados: number; chegadas: number; saidas: number; percentual: number };

export function ocupacaoDoDia(hotel: EstadoHotel, dia: Dia): OcupacaoDoDia {
  let ocupados = 0;
  let bloqueados = 0;
  let chegadas = 0;
  let saidas = 0;
  const mapa = porQuarto(hotel);
  for (const quarto of QUARTOS) {
    const reservas = mapa.get(quarto.id) ?? [];
    if (reservas.some((r) => r.entrada === dia)) chegadas += 1;
    if (reservas.some((r) => r.saida === dia)) saidas += 1;
    if (reservas.some((r) => r.entrada <= dia && dia < r.saida)) ocupados += 1;
    else if (bloqueioNaNoite(hotel, quarto.id, dia)) bloqueados += 1;
  }
  const livres = QUARTOS.length - ocupados - bloqueados;
  const vendaveis = QUARTOS.length - bloqueados;
  return { ocupados, livres, bloqueados, chegadas, saidas, percentual: vendaveis ? Math.round((100 * ocupados) / vendaveis) : 0 };
}

export function diariaDeFimDeSemana(diaria: number, fimDeSemanaPb: number): number {
  return Math.round((diaria * (10_000 + fimDeSemanaPb)) / 10_000);
}

export type ValorDaEstadia = { noites: number; noitesDeFimDeSemana: number; diaria: number; diariaFimDeSemana: number; total: number };

export function valorDaEstadia(hotel: EstadoHotel, categoria: CategoriaId, entrada: Dia, saida: Dia): ValorDaEstadia {
  const noites = Math.max(0, diasEntre(entrada, saida));
  let noitesDeFimDeSemana = 0;
  for (let i = 0; i < noites; i += 1) if (ehNoiteDeFimDeSemana(adicionarDias(entrada, i))) noitesDeFimDeSemana += 1;
  const diaria = hotel.diarias[categoria];
  const diariaFimDeSemana = diariaDeFimDeSemana(diaria, hotel.fimDeSemanaPb);
  return { noites, noitesDeFimDeSemana, diaria, diariaFimDeSemana, total: (noites - noitesDeFimDeSemana) * diaria + noitesDeFimDeSemana * diariaFimDeSemana };
}

/** Explica o que impede o período de valer, ou `null`. */
export function validarPeriodo(entrada: string, saida: string): string | null {
  if (!ehDia(entrada) || !ehDia(saida)) return 'Escolha as datas de entrada e de saída.';
  const noites = diasEntre(entrada, saida);
  if (noites < 1) return 'A saída precisa ser depois da entrada.';
  if (noites > NOITES_MAXIMAS) return `Na demonstração, a estadia vai até ${NOITES_MAXIMAS} noites.`;
  return null;
}
