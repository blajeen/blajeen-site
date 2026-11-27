import type { LegalDocument } from '../types';
import { exclusaoErdaviaWars, privacidadeErdaviaWars, suporteErdaviaWars, termosErdaviaWars } from './erdavia-wars';
import { privacidadeOfertonauta, suporteOfertonauta, termosOfertonauta, exclusaoOfertonauta } from './ofertonauta';
export { privacidadeOfertonauta, suporteOfertonauta, termosOfertonauta, exclusaoOfertonauta };
import { privacidadeClearlio, suporteClearlio, termosClearlio } from './clearlio';
import { privacidadeNotalio, suporteNotalio, termosNotalio } from './notalio';
import { privacidadeVivelio, suporteVivelio, termosVivelio } from './vivelio';
import { privacidadeEstudio, suporteEstudio, termosEstudio } from './blajeen';
import {
  exclusaoDocalio,
  privacidadeDocalio,
  suporteDocalio,
  termosDocalio,
} from './docalio';
import {
  exclusaoGramelio,
  privacidadeGramelio,
  suporteGramelio,
  termosGramelio,
} from './gramelio';
import {
  exclusaoCatelio,
  privacidadeCatelio,
  suporteCatelio,
  termosCatelio,
} from './catelio';
import {
  exclusaoMorvelio,
  privacidadeMorvelio,
  suporteMorvelio,
  termosMorvelio,
} from './morvelio';
import { exclusaoMazelio, privacidadeMazelio, suporteMazelio, termosMazelio } from './mazelio';
import { exclusaoSocialio, privacidadeSocialio, suporteSocialio, termosSocialio } from './socialio';
import {
  exclusaoRevalio,
  privacidadeRevalio,
  suporteRevalio,
  termosRevalio,
} from './revalio';

export {
  privacidadeClearlio,
  termosClearlio,
  suporteClearlio,
  privacidadeNotalio,
  termosNotalio,
  suporteNotalio,
  privacidadeVivelio,
  termosVivelio,
  suporteVivelio,
};

export {
  privacidadeEstudio,
  termosEstudio,
  suporteEstudio,
  privacidadeRevalio,
  termosRevalio,
  suporteRevalio,
  exclusaoRevalio,
  privacidadeDocalio,
  termosDocalio,
  suporteDocalio,
  exclusaoDocalio,
  privacidadeGramelio,
  termosGramelio,
  suporteGramelio,
  exclusaoGramelio,
  privacidadeCatelio,
  termosCatelio,
  suporteCatelio,
  exclusaoCatelio,
  privacidadeMorvelio,
  termosMorvelio,
  suporteMorvelio,
  exclusaoMorvelio,
  privacidadeMazelio,
  termosMazelio,
  suporteMazelio,
  exclusaoMazelio,
  privacidadeSocialio,
  termosSocialio,
  suporteSocialio,
  exclusaoSocialio,
  privacidadeErdaviaWars,
  termosErdaviaWars,
  suporteErdaviaWars,
  exclusaoErdaviaWars,
};

/** Todos os documentos públicos, na ordem em que aparecem no site. */
export const documentosLegais: readonly LegalDocument[] = [
  privacidadeOfertonauta, suporteOfertonauta, termosOfertonauta, exclusaoOfertonauta,
  privacidadeEstudio,
  termosEstudio,
  suporteEstudio,
  privacidadeRevalio,
  termosRevalio,
  suporteRevalio,
  exclusaoRevalio,
  privacidadeDocalio,
  termosDocalio,
  suporteDocalio,
  exclusaoDocalio,
  privacidadeGramelio,
  termosGramelio,
  suporteGramelio,
  exclusaoGramelio,
  privacidadeCatelio,
  termosCatelio,
  suporteCatelio,
  exclusaoCatelio,
  privacidadeMorvelio,
  termosMorvelio,
  suporteMorvelio,
  exclusaoMorvelio,
  privacidadeMazelio,
  termosMazelio,
  suporteMazelio,
  exclusaoMazelio,
  privacidadeSocialio,
  termosSocialio,
  suporteSocialio,
  exclusaoSocialio,
  privacidadeErdaviaWars,
  termosErdaviaWars,
  suporteErdaviaWars,
  exclusaoErdaviaWars,
  privacidadeClearlio,
  termosClearlio,
  suporteClearlio,
  privacidadeNotalio,
  termosNotalio,
  suporteNotalio,
  privacidadeVivelio,
  termosVivelio,
  suporteVivelio,
];
