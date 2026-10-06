/**
 * Números da demonstração do jeito que o Brasil lê. O `Intl` em pt-BR dá o mesmo texto no Node e no
 * navegador, então o espelho sai igual do servidor e não quebra a hidratação.
 */

const MOEDA = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const MOEDA_SEM_CENTAVOS = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const NUMERO = new Intl.NumberFormat('pt-BR');
const DECIMAL = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const UMA_CASA = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** "R$ 785.619,74" */
export function formatarCentavos(centavos: number): string {
  return MOEDA.format(centavos / 100);
}

/** "R$ 786 mil" ou "R$ 58,1 mi": para resumos, onde o centavo atrapalha a leitura. */
export function formatarCentavosCurto(centavos: number): string {
  const reais = centavos / 100;
  if (Math.abs(reais) >= 1_000_000) return `R$ ${UMA_CASA.format(reais / 1_000_000)} mi`;
  if (Math.abs(reais) >= 10_000) return `R$ ${NUMERO.format(Math.round(reais / 1000))} mil`;
  return MOEDA_SEM_CENTAVOS.format(reais);
}

/** O valor em duas partes, para o número grande com os centavos menores: ["R$ 785.619", ",74"]. */
export function partesDoValor(centavos: number): [string, string] {
  const texto = formatarCentavos(centavos);
  const virgula = texto.lastIndexOf(',');
  return [texto.slice(0, virgula), texto.slice(virgula)];
}

/** "66,45 m²" a partir de centésimos de m². */
export function formatarArea(centesimos: number): string {
  return `${DECIMAL.format(centesimos / 100)} m²`;
}

/** "+53,58 m" */
export function formatarCota(metros: number): string {
  return `+${DECIMAL.format(metros)} m`;
}

/** "55,4%" */
export function formatarPercentual(fracao: number): string {
  return `${UMA_CASA.format(fracao * 100)}%`;
}

/** "17h30", "10h": a hora solar como o painel mostra. */
export function formatarHora(hora: number): string {
  const h = Math.floor(hora);
  const min = Math.round((hora - h) * 60);
  if (min === 60) return `${h + 1}h`;
  return min ? `${h}h${String(min).padStart(2, '0')}` : `${h}h`;
}

/** "20/10" a partir de "2026-10-20". */
export function formatarDiaCurto(dia: string): string {
  const [, mes, d] = dia.split('-');
  return `${d}/${mes}`;
}

const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** "sex 23/10" */
export function formatarDiaComSemana(dia: string): string {
  const [a, m, d] = dia.split('-').map(Number) as [number, number, number];
  return `${SEMANA[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]} ${formatarDiaCurto(dia)}`;
}

/** "18º" */
export function formatarAndar(pavimento: number): string {
  return `${pavimento}º`;
}

/** "R$ 11.822/m²" */
export function formatarPrecoPorM2(centavos: number, areaCentesimos: number): string {
  return `${MOEDA_SEM_CENTAVOS.format(Math.round(centavos / areaCentesimos))}/m²`;
}

/** Lê "785.619,74", "785619.74" ou "R$ 785.619" e devolve centavos, ou `null`. */
export function lerValorEmReais(texto: string): number | null {
  const limpo = texto.replace(/[R$\s ]/g, '');
  if (!limpo) return null;
  // Com vírgula, o ponto é milhar; sem vírgula, um ponto seguido de 1 ou 2 dígitos é decimal.
  const normalizado = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : /\.\d{1,2}$/.test(limpo) ? limpo.replace(/\.(?=\d{3}(\.|$))/g, '') : limpo.replace(/\./g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) return null;
  return Math.round(Number(normalizado) * 100);
}
