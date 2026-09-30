/** Formatação de valores em reais e valor por extenso, usados no contrato e no catálogo. */

/** 1490 -> 'R$ 1.490' | 39.9 -> 'R$ 39,90'. Texto passa direto ("sob orçamento"). */
export function reais(valor: number | string): string {
  if (typeof valor === 'string') return valor;
  const inteiro = Number.isInteger(valor);
  return valor.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: inteiro ? 0 : 2, maximumFractionDigits: 2,
  }).replace(/ /g, ' ');
}

/** 1490 -> '1.490,00' (formato dos campos de valor do contrato). */
export function numeroBr(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Lê um valor digitado ("1.490", "1490,5", "R$ 2.990,00") e devolve o número, ou null.
 * Ponto seguido de três dígitos é separador de milhar; vírgula é decimal.
 */
export function lerValor(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.]/g, '');
  if (!limpo) return null;
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo.replace(/\.(?=\d{3}(\D|$))/g, '');
  const valor = Number.parseFloat(normal);
  return Number.isFinite(valor) && valor >= 0 ? Math.round(valor * 100) / 100 : null;
}

const UNIDADES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze',
  'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function trio(n: number): string {
  if (n === 100) return 'cem';
  const partes: string[] = [];
  const c = Math.floor(n / 100);
  const r = n % 100;
  if (c) partes.push(CENTENAS[c]!);
  if (r) partes.push(r < 20 ? UNIDADES[r]! : DEZENAS[Math.floor(r / 10)]! + (r % 10 ? ` e ${UNIDADES[r % 10]}` : ''));
  return partes.join(' e ');
}

function inteiroPorExtenso(n: number): string {
  if (n === 0) return 'zero';
  const grupos: Array<[number, string, string]> = [[1e9, 'bilhão', 'bilhões'], [1e6, 'milhão', 'milhões'], [1e3, 'mil', 'mil']];
  const partes: string[] = [];
  let resto = n;
  for (const [base, singular, plural] of grupos) {
    const q = Math.floor(resto / base);
    if (!q) continue;
    partes.push(base === 1e3 && q === 1 ? 'mil' : `${trio(q)} ${q === 1 ? singular : plural}`);
    resto %= base;
  }
  if (resto) partes.push(trio(resto));
  if (partes.length === 1) return partes[0]!;
  // "e" antes da última parte quando ela é menor que cem ou centena exata: "dois mil e quinhentos".
  const ligacao = resto && (resto < 100 || resto % 100 === 0) ? ' e ' : ' ';
  return `${partes.slice(0, -1).join(' ')}${resto ? ligacao : ' e '}${partes[partes.length - 1]}`;
}

/** 1490 -> 'mil quatrocentos e noventa reais'. */
export function valorPorExtenso(valor: number): string {
  const centavosTotais = Math.round(valor * 100);
  const reaisInteiros = Math.floor(centavosTotais / 100);
  const centavos = centavosTotais % 100;
  const partes: string[] = [];
  if (reaisInteiros) {
    const texto = inteiroPorExtenso(reaisInteiros);
    const de = /(milhão|milhões|bilhão|bilhões)$/.test(texto) ? ' de' : '';
    partes.push(`${texto}${de} ${reaisInteiros === 1 ? 'real' : 'reais'}`);
  }
  if (centavos) partes.push(`${inteiroPorExtenso(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`);
  return partes.join(' e ') || 'zero reais';
}

/** 'YYYY-MM-DD' -> 'dd/mm/aaaa'; outro formato passa direto. */
export function dataBr(valor: string): string {
  const achado = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  return achado ? `${achado[3]}/${achado[2]}/${achado[1]}` : valor;
}
