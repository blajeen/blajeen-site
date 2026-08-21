import type { OnboardingStatus } from './types';

const transitions: Record<OnboardingStatus, readonly OnboardingStatus[]> = {
  WAITING_FOR_CUSTOMER: ['IN_PROGRESS', 'ARCHIVED'],
  IN_PROGRESS: ['SUBMITTED', 'ARCHIVED'],
  SUBMITTED: ['CHANGES_REQUESTED', 'APPROVED', 'ARCHIVED'],
  CHANGES_REQUESTED: ['IN_PROGRESS', 'SUBMITTED', 'ARCHIVED'],
  APPROVED: ['IMPLEMENTING', 'ARCHIVED'],
  IMPLEMENTING: ['PUBLISHED', 'ARCHIVED'],
  PUBLISHED: ['ARCHIVED'],
  ARCHIVED: [],
};

export function canTransition(from: OnboardingStatus, to: OnboardingStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: OnboardingStatus, to: OnboardingStatus): void {
  if (!canTransition(from, to)) throw new Error(`Transição inválida: ${from} → ${to}`);
}

export function isCustomerEditable(status: OnboardingStatus): boolean {
  return status === 'WAITING_FOR_CUSTOMER' || status === 'IN_PROGRESS' || status === 'CHANGES_REQUESTED';
}

