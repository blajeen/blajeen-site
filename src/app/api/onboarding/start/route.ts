import { checkRateLimit, clientIp, jsonError } from '@/lib/onboarding/http';
import { createOnboarding, saveCustomerAnswers } from '@/lib/onboarding/service';
import type { ProjectType } from '@/lib/onboarding/types';

const productTypes: Record<string, ProjectType> = {
  barbearia: 'BARBERSHOP',
  'personal-studio': 'PERSONAL_TRAINER',
  'salao-feminino': 'BEAUTY_STUDIO',
  'salao-estetica': 'BEAUTY_STUDIO',
  ecommerce: 'ECOMMERCE',
};

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  try {
    if (!checkRateLimit(`onboarding-start:${clientIp(request)}`, 5, 15 * 60_000)) {
      return jsonError(new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.'), 429);
    }
    const body = await request.json() as Record<string, unknown>;
    if (text(body.website, 200)) return Response.json({ ok: true, path: '/projects' });
    const projectType = productTypes[text(body.product, 40)];
    const customerName = text(body.customerName, 140);
    const customerEmail = text(body.customerEmail, 200).toLowerCase();
    const customerPhone = text(body.customerPhone, 40);
    const companyName = text(body.companyName, 180);
    if (!projectType) throw new Error('Produto inválido.');
    if (!customerName || !companyName || !customerPhone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      throw new Error('Confira seu nome, negócio, e-mail e telefone.');
    }
    if (body.purchaseConfirmed !== true) throw new Error('Confirme que deseja contratar este projeto.');

    const created = await createOnboarding({ customerName, customerEmail, customerPhone, companyName, projectType });
    await saveCustomerAnswers(created.token, {
      'responsavel.nomeResponsavel': customerName,
      'responsavel.emailResponsavel': customerEmail,
      'responsavel.telefoneResponsavel': customerPhone,
      'responsavel.nomeFantasia': companyName,
    }, 0);
    return Response.json({ path: `/onboarding/${created.token}` }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
