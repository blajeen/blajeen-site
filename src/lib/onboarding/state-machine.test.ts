import { describe, expect, it } from 'vitest';
import { assertTransition, canTransition, isCustomerEditable } from './state-machine';

describe('máquina de estados', () => {
  it('permite o fluxo aprovado e impede saltos inválidos', () => {
    expect(canTransition('WAITING_FOR_CUSTOMER', 'IN_PROGRESS')).toBe(true);
    expect(canTransition('SUBMITTED', 'APPROVED')).toBe(true);
    expect(canTransition('APPROVED', 'PUBLISHED')).toBe(false);
    expect(() => assertTransition('IN_PROGRESS', 'APPROVED')).toThrow(/Transição inválida/);
  });

  it('bloqueia edição depois do envio', () => {
    expect(isCustomerEditable('CHANGES_REQUESTED')).toBe(true);
    expect(isCustomerEditable('SUBMITTED')).toBe(false);
    expect(isCustomerEditable('APPROVED')).toBe(false);
  });
});

