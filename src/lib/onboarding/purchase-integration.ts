import { createOnboarding } from './service';
import type { ProjectType } from './types';

export type PurchasedProject = {
  orderId: string;
  orderItemId: string;
  projectType: ProjectType;
  customer: { name: string; email: string; phone: string; companyName: string };
};

/**
 * Ponto de integração idempotente para uma futura confirmação de compra.
 * O site ainda não possui checkout; quando existir, o webhook chama esta função após validar o pedido.
 */
export async function createOnboardingAfterPurchase(item: PurchasedProject) {
  return createOnboarding({
    customerName: item.customer.name,
    customerEmail: item.customer.email,
    customerPhone: item.customer.phone,
    companyName: item.customer.companyName,
    projectType: item.projectType,
    sourceOrderId: item.orderId,
    sourceOrderItemId: item.orderItemId,
  });
}

