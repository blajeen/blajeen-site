import {
  ETAPAS, PAVIMENTOS_DA_ESTRUTURA, type CondicaoPagamento, type EtapaId, type GrupoDePagamento, type Obra,
} from './dados';
import { PRIMEIRO_TIPO } from './predio';

/**
 * Contas da demonstração, todas em centavos e pontos-base (1000 = 10%), sem float em dinheiro.
 * O fluxo de pagamento fecha no centavo: a soma das parcelas é sempre o preço.
 */

export type LinhaDoFluxo = {
  id: GrupoDePagamento;
  pontosBase: number;
  parcelas: number;
  /** Valor de cada parcela. */
  valor: number;
  /** Centavos que sobram da divisão e vão na primeira parcela do grupo. */
  ajusteNaPrimeira: number;
  total: number;
};

export function fluxoDePagamento(precoCentavos: number, condicao: CondicaoPagamento): { linhas: readonly LinhaDoFluxo[]; soma: number } {
  // Maiores restos: cada grupo leva o piso da sua fração, e os centavos que sobram vão para os
  // grupos com o maior resto, em ordem. Conta inteira (preço × pontos-base cabe folgado num double).
  const produtos = condicao.grupos.map((g) => precoCentavos * g.pontosBase);
  const totais = produtos.map((p) => Math.floor(p / 10_000));
  let sobra = precoCentavos - totais.reduce((a, b) => a + b, 0);
  const ordem = produtos.map((p, i) => ({ i, resto: p % 10_000 })).sort((a, b) => b.resto - a.resto || a.i - b.i);
  for (const { i } of ordem) {
    if (sobra <= 0) break;
    totais[i]! += 1;
    sobra -= 1;
  }
  const linhas = condicao.grupos.map((g, i) => {
    const total = totais[i]!;
    const valor = Math.floor(total / g.parcelas);
    return { id: g.id, pontosBase: g.pontosBase, parcelas: g.parcelas, valor, ajusteNaPrimeira: total - valor * g.parcelas, total };
  });
  return { linhas, soma: linhas.reduce((a, l) => a + l.total, 0) };
}

export const LIMITES_DAS_PARCELAS: Readonly<Record<GrupoDePagamento, { min: number; max: number }>> = {
  entrada: { min: 1, max: 6 },
  mensais: { min: 0, max: 120 },
  reforcos: { min: 0, max: 10 },
  chaves: { min: 1, max: 1 },
};

/** Explica o que impede a condição de valer, ou `null` se ela vale. */
export function validarCondicao(condicao: CondicaoPagamento): string | null {
  const soma = condicao.grupos.reduce((a, g) => a + g.pontosBase, 0);
  if (soma !== 10_000) return `A soma precisa dar 100%; está em ${formatarPontosBase(soma)}.`;
  for (const g of condicao.grupos) {
    const { min, max } = LIMITES_DAS_PARCELAS[g.id];
    if (!Number.isInteger(g.pontosBase) || g.pontosBase < 0) return 'Os percentuais não podem ser negativos.';
    if (!Number.isInteger(g.parcelas) || g.parcelas < min || g.parcelas > max) return `Parcelas fora do intervalo (${min} a ${max}).`;
    if (g.pontosBase > 0 && g.parcelas === 0) return 'Um grupo com percentual precisa de ao menos uma parcela.';
    if (g.pontosBase === 0 && g.parcelas > 0 && g.id !== 'chaves' && g.id !== 'entrada') return 'Um grupo sem percentual não pode ter parcelas.';
  }
  return null;
}

/** "15%" ou "3,5%": pontos-base em percentual, sem zeros sobrando. */
export function formatarPontosBase(pontosBase: number): string {
  const valor = pontosBase / 100;
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
}

/** Preço reajustado, arredondado ao centavo. */
export function reajustar(precoCentavos: number, pontosBase: number): number {
  return Math.round((precoCentavos * (10_000 + pontosBase)) / 10_000);
}

export const LIMITES_DO_REAJUSTE = { min: -1000, max: 3000 } as const;

/** Percentual de cada etapa, com estrutura e fachada medidas em pavimentos. */
export function percentuaisDaObra(obra: Obra): Readonly<Record<EtapaId, number>> {
  return {
    fundacao: obra.etapas.fundacao,
    estrutura: Math.round((100 * obra.estruturaAte) / PAVIMENTOS_DA_ESTRUTURA),
    alvenaria: obra.etapas.alvenaria,
    instalacoes: obra.etapas.instalacoes,
    fachada: Math.round((100 * Math.max(0, obra.fachadaAte - PRIMEIRO_TIPO + 1)) / 20),
    acabamento: obra.etapas.acabamento,
  };
}

/** Andamento global, pela média ponderada das etapas. */
export function percentualDaObra(obra: Obra): number {
  const etapas = percentuaisDaObra(obra);
  const pesoTotal = ETAPAS.reduce((a, e) => a + e.peso, 0);
  return Math.round(ETAPAS.reduce((a, e) => a + e.peso * etapas[e.id], 0) / pesoTotal);
}

/** O que a obra diz de um pavimento, para o cartão no modo obra. */
export function situacaoDoPavimento(obra: Obra, pavimento: number): 'fechado' | 'estrutura' | 'a-subir' {
  if (pavimento <= obra.fachadaAte) return 'fechado';
  if (pavimento <= obra.estruturaAte) return 'estrutura';
  return 'a-subir';
}
