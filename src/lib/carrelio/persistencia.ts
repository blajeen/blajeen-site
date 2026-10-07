import { JAECOO_5 } from './catalogo';
import {
  CAMPANHA_MAXIMA, CHEGADA_MAXIMA_DIAS, HISTORICO_MAXIMO, PEDIDOS_MAXIMOS, PRECO_MAXIMO_CENTAVOS, PRECO_MINIMO_CENTAVOS, QUANTIDADE_MAXIMA,
  ehCor, ehDia, ehVersao, inteiroEntre, type EntradaDoHistorico, type Estoque, type EstadoCarrelio, type ItemDoEstoque, type PedidoDeTestDrive,
} from './estado';
import { CORES, VERSOES, type CorId, type VersaoId } from './tipos';

/**
 * O estado da demonstração no navegador de quem testa: só ali, sem servidor. O registro é
 * versionado e conferido campo a campo na leitura; qualquer coisa estranha (outra versão, outro
 * carro, uma cor desconhecida, um número fora da faixa) faz a demonstração voltar ao estado-base.
 */

export const CHAVE_DO_ARMAZENAMENTO = 'blajeen:carrelio:v1';

type Registro = { v: 1; carro: string; salvoEm: string; estado: EstadoCarrelio };

export function serializar(estado: EstadoCarrelio, salvoEm: string): string {
  const registro: Registro = { v: 1, carro: JAECOO_5.id, salvoEm, estado };
  return JSON.stringify(registro);
}

const objeto = (valor: unknown): valor is Record<string, unknown> => typeof valor === 'object' && valor !== null && !Array.isArray(valor);
const texto = (valor: unknown, maximo = 240): valor is string => typeof valor === 'string' && valor.length <= maximo;
const lista = (valor: unknown, maximo: number): valor is unknown[] => Array.isArray(valor) && valor.length <= maximo;

const TIPOS_DO_HISTORICO = new Set(['estoque', 'preco', 'campanha', 'test-drive', 'demo']);

function lerItem(valor: unknown): ItemDoEstoque | null {
  if (!objeto(valor) || !inteiroEntre(valor.quantidade, 0, QUANTIDADE_MAXIMA)) return null;
  const chega = valor.chegaEmDias;
  if (chega !== null && !inteiroEntre(chega, 1, CHEGADA_MAXIMA_DIAS)) return null;
  // Previsão de chegada só existe para quem não tem carro na loja.
  if (valor.quantidade > 0 && chega !== null) return null;
  return { quantidade: valor.quantidade, chegaEmDias: chega };
}

function lerEstoque(valor: unknown): Estoque | null {
  if (!objeto(valor) || Object.keys(valor).length !== VERSOES.length) return null;
  const estoque = {} as Record<VersaoId, Record<CorId, ItemDoEstoque>>;
  for (const versao of VERSOES) {
    const porCor = valor[versao];
    if (!objeto(porCor) || Object.keys(porCor).length !== CORES.length) return null;
    const linha = {} as Record<CorId, ItemDoEstoque>;
    for (const cor of CORES) {
      const item = lerItem(porCor[cor]);
      if (!item) return null;
      linha[cor] = item;
    }
    estoque[versao] = linha;
  }
  return estoque;
}

function lerPrecos(valor: unknown): Record<VersaoId, number> | null {
  if (!objeto(valor)) return null;
  const precos = {} as Record<VersaoId, number>;
  for (const versao of VERSOES) {
    const preco = valor[versao];
    if (!inteiroEntre(preco, PRECO_MINIMO_CENTAVOS, PRECO_MAXIMO_CENTAVOS)) return null;
    precos[versao] = preco;
  }
  return precos;
}

function lerPedido(valor: unknown): PedidoDeTestDrive | null {
  if (!objeto(valor) || !texto(valor.id, 40) || !ehVersao(valor.versao) || !ehCor(valor.cor) || !ehDia(valor.dia)) return null;
  if ((valor.periodo !== 'manha' && valor.periodo !== 'tarde') || typeof valor.atendido !== 'boolean') return null;
  return { id: valor.id, versao: valor.versao, cor: valor.cor, dia: valor.dia, periodo: valor.periodo, atendido: valor.atendido };
}

function lerHistorico(valor: unknown): EntradaDoHistorico[] | null {
  if (!lista(valor, HISTORICO_MAXIMO)) return null;
  const historico: EntradaDoHistorico[] = [];
  for (const item of valor) {
    if (!objeto(item) || !texto(item.id, 40) || !texto(item.quando, 40) || !texto(item.texto) || !TIPOS_DO_HISTORICO.has(item.tipo as string)) return null;
    historico.push({ id: item.id, quando: item.quando, texto: item.texto, tipo: item.tipo as EntradaDoHistorico['tipo'] });
  }
  return historico;
}

/** O estado guardado, conferido; `null` quando não há nada aproveitável. */
export function lerRegistro(bruto: string | null): EstadoCarrelio | null {
  if (!bruto) return null;
  let registro: unknown;
  try {
    registro = JSON.parse(bruto);
  } catch {
    return null;
  }
  if (!objeto(registro) || registro.v !== 1 || registro.carro !== JAECOO_5.id || !objeto(registro.estado)) return null;
  const { estado } = registro;
  if (estado.versao !== 1 || !inteiroEntre(estado.sequencia, 0, Number.MAX_SAFE_INTEGER)) return null;
  const estoque = lerEstoque(estado.estoque);
  const precos = lerPrecos(estado.precos);
  const campanha = estado.campanha;
  if (!objeto(campanha) || typeof campanha.ativa !== 'boolean' || !texto(campanha.texto, CAMPANHA_MAXIMA)) return null;
  if (!lista(estado.testDrives, PEDIDOS_MAXIMOS)) return null;
  const testDrives = estado.testDrives.map(lerPedido);
  const historico = lerHistorico(estado.historico);
  if (!estoque || !precos || testDrives.some((p) => !p) || !historico) return null;
  return {
    versao: 1,
    estoque,
    precos,
    campanha: { ativa: campanha.ativa, texto: campanha.texto },
    testDrives: testDrives as PedidoDeTestDrive[],
    historico,
    sequencia: estado.sequencia,
  };
}
