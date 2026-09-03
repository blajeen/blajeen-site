import type { Disponibilidade, Project, ProjectStatus } from './types';

/**
 * Estado de um produto na data em que a página é renderizada.
 *
 * Existe por causa de uma contradição real: o anúncio de lançamento do Revalio está datado para
 * 25/08/2026, mas o site precisava ser publicado antes disso. Anunciar "disponível" na véspera
 * seria falso; esperar alguém editar o site no dia seria frágil.
 *
 * A data de lançamento passou a ser a única fonte: antes dela o produto aparece como em
 * desenvolvimento e as lojas como "em breve"; a partir dela, disponível. As páginas que mostram
 * esse estado se regeneram de hora em hora, então a virada acontece sozinha.
 */

function hoje(agora: Date): string {
  return agora.toISOString().slice(0, 10);
}

function jaLancou(projeto: Project, agora: Date): boolean {
  return projeto.lancamento !== undefined && projeto.lancamento <= hoje(agora);
}

export function statusVisivel(projeto: Project, agora: Date = new Date()): ProjectStatus {
  return jaLancou(projeto, agora) ? 'DISPONÍVEL' : projeto.status;
}

export function disponibilidadeVisivel(
  projeto: Project,
  agora: Date = new Date(),
): readonly Disponibilidade[] {
  if (statusVisivel(projeto, agora) === 'DISPONÍVEL') return projeto.disponibilidade;
  return projeto.disponibilidade.map((loja) => ({ ...loja, estado: 'em-breve' as const }));
}
