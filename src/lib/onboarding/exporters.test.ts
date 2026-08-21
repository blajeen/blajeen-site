import { describe, expect, it } from 'vitest';
import { exportConfiguration } from './exporters';
import type { OnboardingBundle, OnboardingProject, ProjectType } from './types';

function bundle(projectType: ProjectType): OnboardingBundle {
  const now = '2026-08-20T12:00:00.000Z';
  const project: OnboardingProject = {
    id: 'project', customerName: 'Cliente', customerEmail: 'cliente@example.com', customerPhone: '11999999999', companyName: 'Empresa',
    projectType, status: 'APPROVED', tokenHash: 'x'.repeat(64), tokenEncrypted: 'encrypted', tokenExpiresAt: now,
    tokenRevokedAt: null, progress: 100, currentStep: 1, assignedTo: null, sourceOrderId: null, sourceOrderItemId: null,
    createdAt: now, updatedAt: now, submittedAt: now, approvedAt: now, publishedAt: null, schemaVersion: 1,
  };
  return { project, answers: { 'responsavel.nomeFantasia': 'Empresa', 'marca.nomeMarca': 'Marca' }, assets: [], reviews: [], events: [] };
}

describe('adaptadores de exportação', () => {
  it.each(['ECOMMERCE', 'BARBERSHOP', 'PERSONAL_TRAINER', 'BEAUTY_STUDIO'] as const)('gera contrato versionado para %s', (projectType) => {
    const output = exportConfiguration(bundle(projectType), '2026-08-20T13:00:00.000Z');
    expect(output.schemaVersion).toBe(1);
    expect(output.projectType).toBe(projectType);
    expect(output.customer.email).toBe('cliente@example.com');
    expect(output.business['responsavel.nomeFantasia']).toBe('Empresa');
  });
});

