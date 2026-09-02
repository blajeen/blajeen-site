import type { LegalDocument } from '../types';
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
  exclusaoDogolio,
  privacidadeDogolio,
  suporteDogolio,
  termosDogolio,
} from './dogolio';
import {
  exclusaoMorvelio,
  privacidadeMorvelio,
  suporteMorvelio,
  termosMorvelio,
} from './morvelio';
import {
  exclusaoRevalio,
  privacidadeRevalio,
  suporteRevalio,
  termosRevalio,
} from './revalio';

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
  privacidadeDogolio,
  termosDogolio,
  suporteDogolio,
  exclusaoDogolio,
  privacidadeMorvelio,
  termosMorvelio,
  suporteMorvelio,
  exclusaoMorvelio,
};

/** Todos os documentos públicos, na ordem em que aparecem no site. */
export const documentosLegais: readonly LegalDocument[] = [
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
  privacidadeDogolio,
  termosDogolio,
  suporteDogolio,
  exclusaoDogolio,
  privacidadeMorvelio,
  termosMorvelio,
  suporteMorvelio,
  exclusaoMorvelio,
];
