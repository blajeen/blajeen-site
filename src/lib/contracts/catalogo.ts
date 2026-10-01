import { HORA_TECNICA_BASE, SERVICOS_BASE } from '@/content/contratos/modelos.generated';
import {
  SERVICOS_IDS, type AdicionalCatalogo, type PlanoCatalogo, type ServicoCatalogo, type ServicoId,
} from '@/content/contratos/tipos';
import type { AjustesCatalogo } from './types';
import { reais } from './valores';

export const VALIDADE_BASE = '31/12/2026';

/** Uma linha sobre cada serviço, no menu do catálogo e na página de valores. */
export const DESCRICAO_CURTA: Record<ServicoId, string> = {
  site: 'Landing pages, sites institucionais, painéis e lojas virtuais.',
  sistema: 'Gestão, aplicativos e programas sob medida para a sua operação.',
  video: 'Reels, trends e vídeos institucionais para divulgar seu negócio.',
  jogo: 'Advergames, jogos educativos, mobile e projetos autorais.',
  projeto: 'Diagnóstico, identidade, sprints e banco de horas.',
};

/** O plano mais barato: o "a partir de" do serviço. */
export function planoInicial(servico: ServicoCatalogo): PlanoCatalogo {
  return [...servico.planos].sort((a, b) => a.preco - b.preco)[0]!;
}

/** "R$ 149", "a partir de R$ 449", "R$ 150/hora", "R$ 690 + deslocamento" ou o texto ("sob orçamento"). */
export function precoDoAdicional({ preco, qualificador }: Pick<AdicionalCatalogo, 'preco' | 'qualificador'>): string {
  if (typeof preco === 'string') return preco;
  if (qualificador === 'a partir de') return `a partir de ${reais(preco)}`;
  if (qualificador.startsWith('+')) return `${reais(preco)} ${qualificador}`;
  return `${reais(preco)}${qualificador}`;
}

export type CatalogoVigente = {
  validade: string;
  horaTecnica: number;
  servicos: Record<ServicoId, ServicoCatalogo>;
};

/** Aplica os preços publicados no painel sobre os preços-base do kit. */
export function catalogoVigente(ajustes: AjustesCatalogo = {}): CatalogoVigente {
  const servicos = {} as Record<ServicoId, ServicoCatalogo>;
  for (const id of SERVICOS_IDS) {
    const base = SERVICOS_BASE[id];
    const ajuste = ajustes.servicos?.[id];
    servicos[id] = {
      ...base,
      planos: base.planos.map((plano) => {
        const a = ajuste?.planos?.[plano.id];
        return {
          ...plano,
          ...(typeof a?.preco === 'number' ? { preco: a.preco } : {}),
          ...(a?.prazo ? { prazo: a.prazo } : {}),
          ...(typeof a?.aPartir === 'boolean' ? { aPartir: a.aPartir } : {}),
        };
      }),
      mensais: base.mensais.map((mensal) => {
        const preco = ajuste?.mensais?.[mensal.id]?.preco;
        return typeof preco === 'number' ? { ...mensal, preco } : mensal;
      }),
      adicionais: base.adicionais.map((adicional) => {
        const preco = ajuste?.adicionais?.[adicional.id]?.preco;
        return typeof preco === 'number' && typeof adicional.preco === 'number' ? { ...adicional, preco } : adicional;
      }),
    };
  }
  return {
    validade: ajustes.validade?.trim() || VALIDADE_BASE,
    horaTecnica: typeof ajustes.horaTecnica === 'number' ? ajustes.horaTecnica : HORA_TECNICA_BASE,
    servicos,
  };
}

function preco(valor: unknown): number | undefined {
  const numero = typeof valor === 'number' ? valor : typeof valor === 'string' && valor.trim() ? Number(valor.replace(',', '.')) : NaN;
  if (!Number.isFinite(numero)) return undefined;
  if (numero < 0 || numero > 10_000_000) throw new Error('Informe preços entre R$ 0 e R$ 10.000.000.');
  return Math.round(numero * 100) / 100;
}

function texto(valor: unknown, maximo: number): string | undefined {
  return typeof valor === 'string' && valor.trim() ? valor.trim().slice(0, maximo) : undefined;
}

/**
 * Valida o que o painel envia. Só entram ids que existem nos preços-base, e só os campos editáveis:
 * preço e prazo dos planos, "a partir de", preço de mensais e adicionais, validade e hora técnica.
 */
export function parseAjustesCatalogo(corpo: unknown): AjustesCatalogo {
  const entrada = (corpo ?? {}) as Record<string, unknown>;
  const saida: AjustesCatalogo = { servicos: {} };
  const validade = texto(entrada.validade, 20);
  if (validade) saida.validade = validade;
  const hora = preco(entrada.horaTecnica);
  if (hora !== undefined) saida.horaTecnica = hora;

  const servicos = (entrada.servicos ?? {}) as Record<string, Record<string, Record<string, Record<string, unknown>>>>;
  for (const id of SERVICOS_IDS) {
    const base = SERVICOS_BASE[id];
    const recebido = servicos[id];
    if (!recebido) continue;
    const alvo: NonNullable<NonNullable<AjustesCatalogo['servicos']>[ServicoId]> = { planos: {}, mensais: {}, adicionais: {} };
    for (const plano of base.planos) {
      const p = recebido.planos?.[plano.id];
      if (!p) continue;
      const item: { preco?: number; prazo?: string; aPartir?: boolean } = {};
      const valor = preco(p.preco);
      if (valor !== undefined) item.preco = valor;
      const prazo = texto(p.prazo, 60);
      if (prazo) item.prazo = prazo;
      if (typeof p.aPartir === 'boolean') item.aPartir = p.aPartir;
      alvo.planos![plano.id] = item;
    }
    for (const mensal of base.mensais) {
      const valor = preco(recebido.mensais?.[mensal.id]?.preco);
      if (valor !== undefined) alvo.mensais![mensal.id] = { preco: valor };
    }
    for (const adicional of base.adicionais) {
      if (typeof adicional.preco !== 'number') continue;
      const valor = preco(recebido.adicionais?.[adicional.id]?.preco);
      if (valor !== undefined) alvo.adicionais![adicional.id] = { preco: valor };
    }
    saida.servicos![id] = alvo;
  }
  return saida;
}
