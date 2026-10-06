/**
 * Como a janela de cada unidade (ou quarto) aparece na torre. É o que o domínio calcula
 * (`luzesDaTorre`) e o que a cena 3D desenha; fica aqui para os dois lados lerem a mesma tabela.
 */
export const LUZ = {
  /** Disponível, ou quarto livre: luz apagada. */
  apagada: 0,
  /** Reservada: luz fria, azulada (o nome ficou do tempo em que era só uma luz mais fraca). */
  baixa: 1,
  /** Vendida, indisponível ou quarto ocupado: luz acesa. */
  acesa: 2,
  /** Quarto bloqueado para manutenção: apagado, com contorno tracejado. */
  bloqueada: 3,
} as const;
export type Luz = (typeof LUZ)[keyof typeof LUZ];
