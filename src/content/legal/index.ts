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
];
