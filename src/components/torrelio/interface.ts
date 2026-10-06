import { CATEGORIAS } from '@/lib/torrelio/dados';
import { adicionarDias, type Dia } from '@/lib/torrelio/hotel';
import type { Comando } from '@/lib/torrelio/link';
import { QUARTOS, UNIDADES } from '@/lib/torrelio/predio';
import { posicaoDoSol } from '@/lib/torrelio/sol';
import type { CategoriaId, Enquadramento, Estacao, Fachada, Modo, Quarto, Unidade } from '@/lib/torrelio/tipos';
import { UNIDADE_EM_DESTAQUE } from '@/lib/torrelio/dados';

/**
 * O estado da interface da demonstração: aba, modo, unidade escolhida, hora, câmera. Fica na
 * memória da página (não vai para o armazenamento) e parte sempre do mesmo ponto, para o servidor
 * e o navegador desenharem igual.
 */

export type Aba = 'cliente' | 'painel';
export type Camada = 'comercial' | 'obra';
export type SubAbaDoPainel = 'unidades' | 'tabela' | 'pagamento' | 'obra' | 'historico';
export type SubAbaDoHotel = 'hoje' | 'reservas' | 'diarias' | 'bloqueios' | 'historico';

export type Periodo = { entrada: Dia; saida: Dia; hospedes: number };

export type EstadoDaInterface = {
  aba: Aba;
  modo: Modo;
  /** Unidade escolhida (incorporadora). */
  unidade: string;
  /** Quarto escolhido (hotel), ou nenhum até a pessoa escolher. */
  quarto: string | null;
  camada: Camada;
  hora: number;
  estacao: Estacao;
  enquadramento: Enquadramento;
  /** O botão "Contornar disponíveis"; de dia o contorno liga sozinho. */
  contornar: boolean;
  girando: boolean;
  /** A vista aberta: de qual unidade (ou quarto) e por qual fachada. */
  vista: { id: string; fachada: Fachada } | null;
  pavimentoEmDestaque: number | null;
  /** Hotel, visão do cliente: o período pedido (preenchido no navegador, depois de montar). */
  periodo: Periodo | null;
  categoria: CategoriaId | null;
  /** Hotel, painel: o dia que a fachada mostra, contado a partir do dia-base. */
  diaDoPainel: number;
  subAbaDoPainel: SubAbaDoPainel;
  subAbaDoHotel: SubAbaDoHotel;
};

export const PRESETS_DE_HORA = [
  { id: 'dia', rotulo: 'Dia', hora: 10 },
  { id: 'fim-de-tarde', rotulo: 'Fim de tarde', hora: 17.5 },
  { id: 'noite', rotulo: 'Noite', hora: 20.5 },
] as const;

export const ENQUADRAMENTOS: readonly { id: Enquadramento; rotulo: string }[] = [
  { id: 'frente', rotulo: 'Frente' },
  { id: 'lateral', rotulo: 'Lateral' },
  { id: 'fundos', rotulo: 'Fundos' },
  { id: 'rooftop', rotulo: 'Rooftop' },
];

export const NOMES_DAS_ESTACOES: Readonly<Record<Estacao, string>> = { verao: 'Verão', equinocio: 'Equinócio', inverno: 'Inverno' };

export const NOMES_DAS_FACHADAS: Readonly<Record<Fachada, string>> = {
  norte: 'frente (norte)',
  sul: 'fundos (sul)',
  leste: 'lateral leste',
  oeste: 'lateral oeste',
};

export function interfaceInicial(): EstadoDaInterface {
  return {
    aba: 'cliente',
    modo: 'incorporadora',
    unidade: UNIDADE_EM_DESTAQUE,
    quarto: null,
    camada: 'comercial',
    hora: 20.5,
    estacao: 'verao',
    enquadramento: 'frente',
    contornar: false,
    girando: false,
    vista: null,
    pavimentoEmDestaque: null,
    periodo: null,
    categoria: null,
    diaDoPainel: 0,
    subAbaDoPainel: 'unidades',
    subAbaDoHotel: 'hoje',
  };
}

export type AcaoDaInterface =
  | { tipo: 'aba'; aba: Aba }
  | { tipo: 'modo'; modo: Modo }
  | { tipo: 'unidade'; id: string }
  | { tipo: 'quarto'; id: string | null }
  | { tipo: 'camada'; camada: Camada }
  | { tipo: 'hora'; hora: number }
  | { tipo: 'estacao'; estacao: Estacao }
  | { tipo: 'enquadrar'; enquadramento: Enquadramento }
  | { tipo: 'contornar'; contornar: boolean }
  | { tipo: 'girar'; girando: boolean }
  | { tipo: 'vista'; vista: EstadoDaInterface['vista'] }
  | { tipo: 'destacar'; pavimento: number | null }
  | { tipo: 'periodo'; periodo: Periodo }
  | { tipo: 'categoria'; categoria: CategoriaId | null }
  | { tipo: 'dia-do-painel'; dia: number }
  | { tipo: 'sub-aba'; subAba: SubAbaDoPainel }
  | { tipo: 'sub-aba-do-hotel'; subAba: SubAbaDoHotel }
  | { tipo: 'comando'; comando: Comando };

export function reduzirInterface(estado: EstadoDaInterface, acao: AcaoDaInterface): EstadoDaInterface {
  switch (acao.tipo) {
    case 'aba':
      return { ...estado, aba: acao.aba };
    case 'modo':
      // Trocar de modo fecha a vista: a unidade de um não é o quarto do outro.
      return acao.modo === estado.modo ? estado : { ...estado, modo: acao.modo, vista: null };
    case 'unidade':
      return {
        ...estado,
        unidade: acao.id,
        vista: estado.vista && estado.modo === 'incorporadora' ? { id: acao.id, fachada: fachadaDaVista(unidadePorId(acao.id)!, estado.vista.fachada) } : estado.vista,
      };
    case 'quarto':
      return {
        ...estado,
        quarto: acao.id,
        vista: estado.vista && estado.modo === 'hotel' && acao.id ? { id: acao.id, fachada: fachadaDaVista(quartoPorId(acao.id)!, estado.vista.fachada) } : estado.vista,
      };
    case 'camada':
      return { ...estado, camada: acao.camada };
    case 'hora':
      return { ...estado, hora: Math.min(23, Math.max(5, acao.hora)) };
    case 'estacao':
      return { ...estado, estacao: acao.estacao };
    case 'enquadrar':
      return { ...estado, enquadramento: acao.enquadramento, vista: null };
    case 'contornar':
      return { ...estado, contornar: acao.contornar };
    case 'girar':
      return { ...estado, girando: acao.girando };
    case 'vista':
      return { ...estado, vista: acao.vista, girando: acao.vista ? false : estado.girando };
    case 'destacar':
      return estado.pavimentoEmDestaque === acao.pavimento ? estado : { ...estado, pavimentoEmDestaque: acao.pavimento };
    case 'periodo':
      return { ...estado, periodo: acao.periodo };
    case 'categoria':
      return { ...estado, categoria: acao.categoria };
    case 'dia-do-painel':
      return { ...estado, diaDoPainel: Math.min(13, Math.max(0, acao.dia)) };
    case 'sub-aba':
      return { ...estado, subAbaDoPainel: acao.subAba };
    case 'sub-aba-do-hotel':
      return { ...estado, subAbaDoHotel: acao.subAba };
    case 'comando':
      return aplicarComando(estado, acao.comando);
  }
}

function aplicarComando(estado: EstadoDaInterface, comando: Comando): EstadoDaInterface {
  let proximo = { ...estado };
  if (comando.aba) proximo.aba = comando.aba;
  if (comando.modo) proximo = { ...proximo, modo: comando.modo, vista: comando.modo === estado.modo ? proximo.vista : null };
  if (comando.unidade && unidadePorId(comando.unidade)) proximo.unidade = comando.unidade;
  if (comando.quarto && quartoPorId(comando.quarto)) proximo.quarto = comando.quarto;
  if (comando.hora !== undefined) proximo.hora = comando.hora;
  if (comando.estacao) proximo.estacao = comando.estacao;
  if (comando.camada) proximo.camada = comando.camada;
  if (comando.vista) {
    const alvo = proximo.modo === 'hotel' ? (proximo.quarto ? quartoPorId(proximo.quarto) : null) : unidadePorId(proximo.unidade);
    if (alvo) proximo.vista = { id: alvo.id, fachada: fachadaDaVista(alvo, comando.vista === true ? undefined : comando.vista) };
  }
  return proximo;
}

export const unidadePorId = (id: string): Unidade | undefined => UNIDADES.find((u) => u.id === id);
export const quartoPorId = (id: string): Quarto | undefined => QUARTOS.find((q) => q.id === id);

/** A fachada principal (a de mais vãos) ou a pedida, se a unidade tiver janela nela. */
export function fachadaDaVista(alvo: Unidade | Quarto, pedida?: Fachada): Fachada {
  if (pedida && alvo.fachadas.includes(pedida)) return pedida;
  const vaos = (f: Fachada) => alvo.trechos.filter((t) => t.fachada === f).reduce((a, t) => a + t.ate - t.de, 0);
  return [...alvo.fachadas].sort((a, b) => vaos(b) - vaos(a))[0]!;
}

/** De dia a luz das janelas não aparece; o contorno das disponíveis liga sozinho. */
export function ehDeDia(hora: number, estacao: Estacao): boolean {
  return posicaoDoSol(hora, estacao).elevacao > 4;
}

/** O preset que corresponde à hora, se houver (para o grupo Dia | Fim de tarde | Noite). */
export function presetDaHora(hora: number): (typeof PRESETS_DE_HORA)[number]['id'] | null {
  return PRESETS_DE_HORA.find((p) => p.hora === hora)?.id ?? null;
}

/** O período padrão do hotel: daqui a duas semanas, três noites, duas pessoas. */
export function periodoPadrao(hoje: Dia): Periodo {
  return { entrada: adicionarDias(hoje, 14), saida: adicionarDias(hoje, 17), hospedes: 2 };
}

export const NOME_DA_CATEGORIA: Readonly<Record<CategoriaId, string>> = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.nome])) as Record<CategoriaId, string>;
