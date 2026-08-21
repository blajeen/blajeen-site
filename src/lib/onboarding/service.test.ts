import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createOnboarding, getCustomerBundle, saveCustomerAnswers } from './service';
import { createOnboardingAfterPurchase } from './purchase-integration';

const dataDir = resolve(process.cwd(), '.data');
const databaseFile = resolve(dataDir, 'onboarding.json');

describe('persistência e integração de compra', () => {
  beforeAll(async () => {
    delete process.env.DATABASE_URL;
    process.env.ONBOARDING_SESSION_SECRET = 'segredo-de-teste-do-servico-comprido-123';
    await rm(dataDir, { recursive: true, force: true });
  });
  afterAll(async () => {
    await rm(dataDir, { recursive: true, force: true });
    delete process.env.ONBOARDING_SESSION_SECRET;
  });

  it('cria uma única vez por item de pedido, salva automaticamente e retoma depois', async () => {
    const input = {
      orderId: 'order-1', orderItemId: 'item-1', projectType: 'ECOMMERCE' as const,
      customer: { name: 'Cliente', email: 'cliente@example.com', phone: '11999999999', companyName: 'Empresa' },
    };
    const first = await createOnboardingAfterPurchase(input);
    const second = await createOnboardingAfterPurchase(input);
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.bundle.project.id).toBe(first.bundle.project.id);

    await saveCustomerAnswers(first.token, { 'responsavel.nomeResponsavel': 'Pessoa responsável' }, 2);
    const resumed = await getCustomerBundle(first.token);
    expect(resumed.answers['responsavel.nomeResponsavel']).toBe('Pessoa responsável');
    expect(resumed.project.currentStep).toBe(2);
    expect(resumed.project.status).toBe('IN_PROGRESS');
  });

  it('rejeita token expirado e revogado', async () => {
    const expired = await createOnboarding({ customerName: 'Expirado', customerEmail: 'e@example.com', customerPhone: '11999999999', companyName: 'Expirada', projectType: 'BARBERSHOP', tokenExpiresAt: '2020-01-01T00:00:00.000Z' });
    await expect(getCustomerBundle(expired.token)).rejects.toThrow(/expirou/);

    const active = await createOnboarding({ customerName: 'Revogado', customerEmail: 'r@example.com', customerPhone: '11999999999', companyName: 'Revogada', projectType: 'BEAUTY_STUDIO' });
    const state = JSON.parse(await readFile(databaseFile, 'utf8')) as { projects: Array<{ id: string; tokenRevokedAt: string | null }> };
    const project = state.projects.find((entry) => entry.id === active.bundle.project.id)!;
    project.tokenRevokedAt = new Date().toISOString();
    await mkdir(dataDir, { recursive: true });
    await writeFile(databaseFile, JSON.stringify(state), 'utf8');
    await expect(getCustomerBundle(active.token)).rejects.toThrow(/não está mais disponível/);
  });
});
