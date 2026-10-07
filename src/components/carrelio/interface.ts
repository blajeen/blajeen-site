import type { Comando } from '@/lib/carrelio/link';
import { LUZES, type Aba, type Ambiente, type CorId, type LuzId, type PontoDoInterior, type PortaId, type VersaoId, type Vista } from '@/lib/carrelio/tipos';

/**
 * O estado da interface da demonstração (o que a pessoa está olhando), separado do estado da loja
 * (estoque, preços, pedidos), que mora em `loja.ts` e é o mesmo nas duas abas. Puro e testável.
 */

export type EstadoDaInterface = {
  aba: Aba;
  versao: VersaoId;
  cor: CorId;
  portas: Readonly<Record<PortaId, boolean>>;
  farois: boolean;
  vista: Vista;
  ponto: PontoDoInterior;
  ambiente: Ambiente;
  /** A cor da luz ambiente, por dentro. */
  luz: LuzId;
  /**
   * A mesa gira. `null` enquanto ninguém escolheu: segue a preferência de movimento (gira com
   * movimento, parado sem). Arrastar o carro ou apertar "Girar" vira escolha de quem olha.
   */
  girando: boolean | null;
  /** O ponto de toque aberto (o balão com a explicação), ou nenhum. */
  pontoAberto: string | null;
  /** O "ver na sua garagem" aberto. */
  garagem: boolean;
};

export type AcaoDaInterface =
  | { tipo: 'aba'; aba: Aba }
  | { tipo: 'versao'; versao: VersaoId }
  | { tipo: 'cor'; cor: CorId }
  | { tipo: 'porta'; porta: PortaId; aberta?: boolean }
  | { tipo: 'portas'; abertas: boolean }
  | { tipo: 'farois'; acesos: boolean }
  | { tipo: 'vista'; vista: Vista }
  | { tipo: 'ponto'; ponto: PontoDoInterior }
  | { tipo: 'ambiente'; ambiente: Ambiente }
  | { tipo: 'luz'; luz: LuzId }
  | { tipo: 'girar'; girando: boolean }
  | { tipo: 'ponto-de-toque'; id: string | null }
  | { tipo: 'garagem'; aberta: boolean }
  | { tipo: 'comando'; comando: Comando };

const FECHADAS: Readonly<Record<PortaId, boolean>> = {
  dianteiraEsquerda: false,
  dianteiraDireita: false,
  traseiraEsquerda: false,
  traseiraDireita: false,
  portaMalas: false,
};

const ABERTAS: Readonly<Record<PortaId, boolean>> = {
  dianteiraEsquerda: true,
  dianteiraDireita: true,
  traseiraEsquerda: true,
  traseiraDireita: true,
  portaMalas: true,
};

/** A demonstração abre no Prestige Azul Gaia, por fora, no estúdio (o mesmo quadro do pôster). */
export function interfaceInicial(): EstadoDaInterface {
  return {
    aba: 'cliente',
    versao: 'prestige',
    cor: 'azul-gaia',
    portas: FECHADAS,
    farois: false,
    vista: 'fora',
    ponto: 'motorista',
    ambiente: 'estudio',
    luz: LUZES[0]!,
    girando: null,
    pontoAberto: null,
    garagem: false,
  };
}

export function algumaPortaAberta(portas: Readonly<Record<PortaId, boolean>>): boolean {
  return Object.values(portas).some(Boolean);
}

export function reduzirInterface(estado: EstadoDaInterface, acao: AcaoDaInterface): EstadoDaInterface {
  switch (acao.tipo) {
    case 'aba':
      return estado.aba === acao.aba ? estado : { ...estado, aba: acao.aba, pontoAberto: null, garagem: false };
    case 'versao':
      return estado.versao === acao.versao ? estado : { ...estado, versao: acao.versao };
    case 'cor':
      return estado.cor === acao.cor ? estado : { ...estado, cor: acao.cor };
    case 'porta': {
      const aberta = acao.aberta ?? !estado.portas[acao.porta];
      return estado.portas[acao.porta] === aberta ? estado : { ...estado, portas: { ...estado.portas, [acao.porta]: aberta } };
    }
    case 'portas':
      return { ...estado, portas: acao.abertas ? ABERTAS : FECHADAS };
    case 'farois':
      return estado.farois === acao.acesos ? estado : { ...estado, farois: acao.acesos };
    case 'vista':
      return estado.vista === acao.vista ? estado : { ...estado, vista: acao.vista, pontoAberto: null };
    case 'ponto': {
      // Olhar o porta-malas por dentro só faz sentido com ele aberto.
      const portas = acao.ponto === 'portaMalas' ? { ...estado.portas, portaMalas: true } : estado.portas;
      return { ...estado, vista: 'dentro', ponto: acao.ponto, portas, pontoAberto: null };
    }
    case 'ambiente':
      // À noite, os faróis acendem junto: é o que a pessoa foi ver.
      return estado.ambiente === acao.ambiente ? estado : { ...estado, ambiente: acao.ambiente, farois: acao.ambiente === 'noite' ? true : estado.farois };
    case 'luz':
      return estado.luz === acao.luz ? estado : { ...estado, luz: acao.luz };
    case 'girar':
      return estado.girando === acao.girando ? estado : { ...estado, girando: acao.girando };
    case 'ponto-de-toque':
      return estado.pontoAberto === acao.id ? estado : { ...estado, pontoAberto: acao.id };
    case 'garagem':
      return estado.garagem === acao.aberta ? estado : { ...estado, garagem: acao.aberta };
    case 'comando': {
      const { comando } = acao;
      let proximo: EstadoDaInterface = { ...estado, pontoAberto: null };
      if (comando.aba) proximo.aba = comando.aba;
      if (comando.versao) proximo.versao = comando.versao;
      if (comando.cor) proximo.cor = comando.cor;
      if (comando.ambiente) proximo = reduzirInterface(proximo, { tipo: 'ambiente', ambiente: comando.ambiente });
      if (comando.farois !== undefined) proximo.farois = comando.farois;
      if (comando.portas !== undefined) proximo.portas = comando.portas ? ABERTAS : FECHADAS;
      if (comando.vista) proximo.vista = comando.vista;
      if (comando.ponto) proximo = reduzirInterface(proximo, { tipo: 'ponto', ponto: comando.ponto });
      if (comando.luz) proximo.luz = comando.luz;
      if (comando.garagem) proximo.garagem = true;
      // Um atalho mostra uma coisa: a mesa para, para a pessoa ver o que pediu.
      proximo.girando = false;
      return proximo;
    }
    default:
      return estado;
  }
}
