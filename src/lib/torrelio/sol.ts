import { NORMAL_DA_FACHADA } from './predio';
import type { Estacao, Fachada } from './tipos';

/**
 * O sol sobre Porto Lume (fictícia): uma simulação aproximada, em hora solar (12h é o sol mais alto
 * do dia), no dia representativo de cada estação. Serve à luz da cena 3D e às frases do cartão
 * ("sol da manhã na lateral leste"); não é estudo de insolação, e a interface diz isso.
 *
 * Direções no sistema do prédio (`predio.ts`): +x leste, y para cima, −z norte.
 */

/** Uma latitude de litoral do Sudeste, para o sol ter o comportamento de lá. */
export const LATITUDE_FICTICIA = -20;

/** Declinação do sol (graus). No hemisfério sul, o verão é em dezembro, com o sol ao sul do equador celeste. */
const DECLINACAO: Readonly<Record<Estacao, number>> = { verao: -23.44, equinocio: 0, inverno: 23.44 };

const RAD = Math.PI / 180;

export type PosicaoDoSol = {
  /** Graus a partir do norte, no sentido horário: 90 é leste, 270 é oeste. */
  azimute: number;
  /** Graus acima do horizonte; negativa depois do pôr do sol. */
  elevacao: number;
};

/** O vetor unitário que aponta para o sol no sistema leste-norte-cima. */
function vetorLocal(hora: number, estacao: Estacao) {
  const latitude = LATITUDE_FICTICIA * RAD;
  const declinacao = DECLINACAO[estacao] * RAD;
  const anguloHorario = (hora - 12) * 15 * RAD;
  return {
    leste: -Math.cos(declinacao) * Math.sin(anguloHorario),
    norte: Math.sin(declinacao) * Math.cos(latitude) - Math.cos(declinacao) * Math.sin(latitude) * Math.cos(anguloHorario),
    cima: Math.sin(declinacao) * Math.sin(latitude) + Math.cos(declinacao) * Math.cos(latitude) * Math.cos(anguloHorario),
  };
}

export function posicaoDoSol(hora: number, estacao: Estacao): PosicaoDoSol {
  const { leste, norte, cima } = vetorLocal(hora, estacao);
  const azimute = (Math.atan2(leste, norte) / RAD + 360) % 360;
  const elevacao = Math.asin(Math.max(-1, Math.min(1, cima))) / RAD;
  return { azimute, elevacao };
}

/** Para onde fica o sol, como vetor unitário na cena 3D (+x leste, y para cima, −z norte). */
export function direcaoDoSol(hora: number, estacao: Estacao): [number, number, number] {
  const { leste, norte, cima } = vetorLocal(hora, estacao);
  return [leste, cima, -norte];
}

/** O sol "bate" na fachada acima de 5° de elevação e a mais de 10° do plano dela. */
const ELEVACAO_MINIMA = 5;
const INCIDENCIA_MINIMA = Math.sin(10 * RAD);
const PASSO_EM_HORAS = 5 / 60;

export type Intervalo = { de: number; ate: number };

/**
 * Os intervalos de hora solar em que a fachada recebe sol direto, amostrados de 5 em 5 minutos.
 * Ex.: a lateral leste só tem sol de manhã; os fundos (sul) só têm sol no verão, cedo e no fim da tarde.
 */
export function horasDeSol(fachada: Fachada, estacao: Estacao): readonly Intervalo[] {
  const normal = NORMAL_DA_FACHADA[fachada];
  const intervalos: Intervalo[] = [];
  let aberto: number | null = null;
  // Amostras inteiras, para a soma de frações não acumular erro: de 4h a 20h.
  for (let passo = 0; passo <= 16 * 12; passo += 1) {
    const hora = 4 + passo * PASSO_EM_HORAS;
    const sol = direcaoDoSol(hora, estacao);
    const incidencia = sol[0] * normal[0] + sol[1] * normal[1] + sol[2] * normal[2];
    const bate = posicaoDoSol(hora, estacao).elevacao > ELEVACAO_MINIMA && incidencia > INCIDENCIA_MINIMA;
    if (bate && aberto === null) aberto = hora;
    if (!bate && aberto !== null) {
      intervalos.push({ de: arredondar(aberto), ate: arredondar(hora) });
      aberto = null;
    }
  }
  if (aberto !== null) intervalos.push({ de: arredondar(aberto), ate: 20 });
  return intervalos;
}

const arredondar = (hora: number) => Math.round(hora * 12) / 12;

/** Nascer e pôr do sol (elevação 0), em hora solar, para os limites do controle de hora. */
export function nascerEPorDoSol(estacao: Estacao): { nascer: number; por: number } {
  const latitude = LATITUDE_FICTICIA * RAD;
  const declinacao = DECLINACAO[estacao] * RAD;
  const meioArco = Math.acos(-Math.tan(latitude) * Math.tan(declinacao)) / RAD / 15;
  return { nascer: 12 - meioArco, por: 12 + meioArco };
}
