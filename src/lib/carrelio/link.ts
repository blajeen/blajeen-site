import { ehCor, ehVersao } from './estado';
import { LUZES, PONTOS_DO_INTERIOR, type Ambiente, type Aba, type CorId, type LuzId, type PontoDoInterior, type VersaoId, type Vista } from './tipos';

/**
 * O link profundo da demonstração: `?versao=prestige&cor=azul-gaia&vista=dentro` abre o carro já
 * nessa configuração, por dentro. Serve ao vendedor que manda o carro pelo WhatsApp e aos atalhos
 * da página, que funcionam sem JavaScript (com JavaScript, viram um comando, sem recarregar).
 *
 * A página é estática: a consulta é lida no cliente, uma vez, por `window.location.search`.
 */

export type Comando = {
  aba?: Aba;
  versao?: VersaoId;
  cor?: CorId;
  vista?: Vista;
  ponto?: PontoDoInterior;
  /** A cor da luz ambiente, que se vê por dentro. */
  luz?: LuzId;
  /** Abre (ou fecha) todas as portas e o porta-malas. */
  portas?: boolean;
  farois?: boolean;
  ambiente?: Ambiente;
  /** Abre o "ver na sua garagem" (realidade aumentada) ou a explicação dele. */
  garagem?: boolean;
  /** Para onde a página leva o foco depois do comando. */
  foco?: 'palco' | 'ficha';
};

export const ROTA_DA_DEMONSTRACAO = '/produtos/carrelio';

const sim = (valor: string | null) => valor === '1' || valor === 'sim';

/** Lê a consulta e devolve só o que for válido; o resto é ignorado em silêncio. */
export function lerLink(consulta: string): Comando {
  const parametros = new URLSearchParams(consulta);
  const comando: Comando = {};
  const aba = parametros.get('aba');
  if (aba === 'cliente' || aba === 'painel') comando.aba = aba;
  const versao = parametros.get('versao');
  if (ehVersao(versao)) comando.versao = versao;
  const cor = parametros.get('cor');
  if (ehCor(cor)) comando.cor = cor;
  const vista = parametros.get('vista');
  if (vista === 'fora' || vista === 'dentro') comando.vista = vista;
  const ponto = parametros.get('ponto');
  if (PONTOS_DO_INTERIOR.includes(ponto as PontoDoInterior)) {
    comando.ponto = ponto as PontoDoInterior;
    comando.vista ??= 'dentro';
  }
  // A luz ambiente só se vê por dentro: quem manda a cor quer ver o carro por dentro.
  const luz = parametros.get('luz');
  if (LUZES.includes(luz as LuzId)) {
    comando.luz = luz as LuzId;
    comando.vista ??= 'dentro';
  }
  const portas = parametros.get('portas');
  if (portas === 'abertas' || sim(portas)) comando.portas = true;
  if (sim(parametros.get('farois'))) comando.farois = true;
  const ambiente = parametros.get('ambiente');
  if (ambiente === 'estudio' || ambiente === 'noite') comando.ambiente = ambiente;
  if (sim(parametros.get('garagem'))) comando.garagem = true;
  return comando;
}

/** A consulta de um comando, na ordem em que um humano leria. Sem nada, devolve "". */
export function consultaDoComando(comando: Comando): string {
  const parametros = new URLSearchParams();
  if (comando.aba && comando.aba !== 'cliente') parametros.set('aba', comando.aba);
  if (comando.versao) parametros.set('versao', comando.versao);
  if (comando.cor) parametros.set('cor', comando.cor);
  if (comando.vista === 'dentro') parametros.set('vista', 'dentro');
  if (comando.ponto && comando.vista === 'dentro' && comando.ponto !== 'motorista') parametros.set('ponto', comando.ponto);
  if (comando.luz && comando.vista === 'dentro' && comando.luz !== LUZES[0]) parametros.set('luz', comando.luz);
  if (comando.portas) parametros.set('portas', 'abertas');
  if (comando.farois) parametros.set('farois', '1');
  if (comando.ambiente && comando.ambiente !== 'estudio') parametros.set('ambiente', comando.ambiente);
  if (comando.garagem) parametros.set('garagem', '1');
  const texto = parametros.toString();
  return texto ? `?${texto}` : '';
}

/** O endereço que funciona sem JavaScript: a página, a consulta e a âncora da demonstração. */
export function hrefDoComando(comando: Comando): string {
  return `${ROTA_DA_DEMONSTRACAO}${consultaDoComando(comando)}#demonstracao`;
}
