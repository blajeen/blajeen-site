import { QUARTOS, UNIDADES } from './predio';
import type { Estacao, Fachada, Modo } from './tipos';

/**
 * O link profundo da demonstração: `?unidade=1803&vista=sul` abre a 1803 já na vista dos fundos.
 * Serve ao corretor que manda a unidade pelo WhatsApp e aos links "Ver na demonstração" da página,
 * que funcionam sem JavaScript (com JavaScript, viram um comando, sem recarregar).
 *
 * A página é estática: a consulta é lida no cliente, uma vez, por `window.location.search`.
 */

export type Comando = {
  aba?: 'cliente' | 'painel';
  modo?: Modo;
  unidade?: string;
  quarto?: string;
  /** Abre a vista da unidade (ou do quarto) por uma fachada; `true` escolhe a melhor. */
  vista?: Fachada | true;
  hora?: number;
  estacao?: Estacao;
  camada?: 'comercial' | 'obra';
  /** Para onde a página leva o foco depois do comando. */
  foco?: 'palco' | 'cartao' | 'apartamento';
  /** Abre o modo holograma (o PC do stand pode abrir direto nele). */
  holograma?: 'piramide' | 'vitrine';
};

export const ROTA_DA_DEMONSTRACAO = '/produtos/torrelio';

const FACHADAS = new Set<Fachada>(['norte', 'sul', 'leste', 'oeste']);
const ESTACOES = new Set<Estacao>(['verao', 'equinocio', 'inverno']);
const IDS_DAS_UNIDADES = new Set(UNIDADES.map((u) => u.id));
const IDS_DOS_QUARTOS = new Set(QUARTOS.map((q) => q.id));

/** Lê a consulta e devolve só o que for válido; o resto é ignorado em silêncio. */
export function lerLink(consulta: string): Comando {
  const parametros = new URLSearchParams(consulta);
  const comando: Comando = {};
  const aba = parametros.get('aba');
  if (aba === 'cliente' || aba === 'painel') comando.aba = aba;
  const modo = parametros.get('modo');
  if (modo === 'incorporadora' || modo === 'hotel') comando.modo = modo;
  const unidade = parametros.get('unidade');
  if (unidade && IDS_DAS_UNIDADES.has(unidade)) comando.unidade = unidade;
  const quarto = parametros.get('quarto');
  if (quarto && IDS_DOS_QUARTOS.has(quarto)) {
    comando.quarto = quarto;
    comando.modo ??= 'hotel';
  }
  const vista = parametros.get('vista');
  if (vista === '1' || vista === 'sim') comando.vista = true;
  else if (vista && FACHADAS.has(vista as Fachada)) comando.vista = vista as Fachada;
  const hora = Number(parametros.get('hora'));
  if (parametros.has('hora') && Number.isFinite(hora) && hora >= 5 && hora <= 23) comando.hora = Math.round(hora * 4) / 4;
  const estacao = parametros.get('estacao');
  if (estacao && ESTACOES.has(estacao as Estacao)) comando.estacao = estacao as Estacao;
  const camada = parametros.get('camada');
  if (camada === 'comercial' || camada === 'obra') comando.camada = camada;
  const holograma = parametros.get('holograma');
  if (holograma === 'piramide' || holograma === 'vitrine') comando.holograma = holograma;
  else if (holograma === '1' || holograma === 'sim') comando.holograma = 'piramide';
  return comando;
}

/** A consulta de um comando, na ordem em que um humano leria. Sem nada, devolve "". */
export function consultaDoComando(comando: Comando): string {
  const parametros = new URLSearchParams();
  if (comando.modo && comando.modo !== 'incorporadora') parametros.set('modo', comando.modo);
  if (comando.aba && comando.aba !== 'cliente') parametros.set('aba', comando.aba);
  if (comando.unidade) parametros.set('unidade', comando.unidade);
  if (comando.quarto) parametros.set('quarto', comando.quarto);
  if (comando.vista) parametros.set('vista', comando.vista === true ? '1' : comando.vista);
  if (comando.hora !== undefined) parametros.set('hora', String(comando.hora));
  if (comando.estacao) parametros.set('estacao', comando.estacao);
  if (comando.camada && comando.camada !== 'comercial') parametros.set('camada', comando.camada);
  if (comando.holograma) parametros.set('holograma', comando.holograma);
  const texto = parametros.toString();
  return texto ? `?${texto}` : '';
}

/** O endereço que funciona sem JavaScript: a página, a consulta e a âncora da seção. */
export function hrefDoComando(comando: Comando): string {
  const ancora = comando.foco === 'apartamento' ? '#apartamento' : '#demonstracao';
  return `${ROTA_DA_DEMONSTRACAO}${consultaDoComando(comando)}${ancora}`;
}
