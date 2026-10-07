/**
 * Números do Carrelio do jeito que o Brasil lê. Reaproveita os formatos do Torrelio (mesmo `Intl`
 * em pt-BR, igual no servidor e no navegador) e acrescenta o preço de carro, que não tem centavos.
 */

export { formatarDiaComSemana, formatarDiaCurto, lerValorEmReais } from '@/lib/torrelio/formatar';

const REAIS = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/** "R$ 154.990", a partir de centavos (arredonda para o real). */
export function formatarReais(centavos: number): string {
  return REAIS.format(Math.round(centavos / 100));
}

/** "R$ 4.000 abaixo da tabela" ou "R$ 2.000 acima da tabela"; vazio quando é igual. */
export function formatarDiferencaDaTabela(precoDaLoja: number, precoDaTabela: number): string {
  const diferenca = precoDaLoja - precoDaTabela;
  if (Math.abs(diferenca) < 100) return '';
  return `${formatarReais(Math.abs(diferenca))} ${diferenca < 0 ? 'abaixo' : 'acima'} da tabela`;
}
