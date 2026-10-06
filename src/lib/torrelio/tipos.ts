/**
 * Torrelio: os tipos da demonstração (pedido do titular em 06/10/2026).
 *
 * Tudo o que estes tipos descrevem é fictício: o Residencial Vértice, em Porto Lume, não existe, e
 * unidades, valores, condições, obra, quartos e diárias foram inventados para a demonstração.
 *
 * Coordenadas do prédio em metros, com y para cima, −z para o norte (a frente) e +x para o leste.
 */

/** Uma demonstração, dois usos: o mesmo prédio vira empreendimento à venda ou hotel. */
export type Modo = 'incorporadora' | 'hotel';

/** Na interface: "frente (norte)", "fundos (sul)", "lateral leste", "lateral oeste". */
export type Fachada = 'norte' | 'sul' | 'leste' | 'oeste';

export type Estacao = 'verao' | 'equinocio' | 'inverno';

export type StatusUnidade = 'disponivel' | 'reservada' | 'vendida' | 'indisponivel';

/** Vãos `[de, ate)` de uma fachada, contados de oeste para leste (norte e sul) ou de norte para sul (leste e oeste). */
export type Trecho = { fachada: Fachada; de: number; ate: number };

export type TipologiaId = 'tipo-3d' | 'tipo-2d' | 'cobertura';

/** Um apartamento à venda. `indice` é a posição em `UNIDADES` e é o que a cena 3D recebe. */
export type Unidade = {
  id: string;
  indice: number;
  /** As coberturas são duplex: ocupam dois pavimentos. */
  pavimentos: readonly number[];
  final: string;
  tipologia: TipologiaId;
  trechos: readonly Trecho[];
  fachadas: readonly Fachada[];
};

export type CategoriaId = 'cidade' | 'canto-cidade' | 'vista-parque' | 'vista-mar' | 'suite-cobertura';

/** Um quarto do hotel. `indice` é a posição em `QUARTOS` e é o que a cena 3D recebe no modo hotel. */
export type Quarto = {
  id: string;
  indice: number;
  /** O andar do quarto. */
  pavimento: number;
  /** Os andares que ele ocupa: só as suítes da cobertura ocupam dois. */
  pavimentos: readonly number[];
  final: string;
  categoria: CategoriaId;
  capacidade: number;
  trechos: readonly Trecho[];
  fachadas: readonly Fachada[];
};

/** As quatro câmeras prontas do prédio. */
export type Enquadramento = 'frente' | 'lateral' | 'fundos' | 'rooftop';
