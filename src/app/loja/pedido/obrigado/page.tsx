import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Section';
import { EsvaziarSacola } from '@/components/loja/EsvaziarSacola';
import { ROTA_DA_LOJA } from '@/lib/loja/tipos';

export const metadata: Metadata = {
  title: { absolute: 'Pedido feito — Loja Blajeen Labs' },
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ n?: string }> };

/**
 * Volta da página de pagamento do Asaas. Quem confirma o pagamento é o webhook, não esta página:
 * ela só agradece, mostra o número e esvazia a sacola.
 */
export default async function ObrigadoPage({ searchParams }: Props) {
  const { n } = await searchParams;
  const numero = /^BL-\d{6}-[A-Z0-9]{4}$/.test(n ?? '') ? n : null;
  return (
    <Container className="pb-[clamp(4rem,9vw,9rem)] pt-[clamp(3rem,7vw,6rem)]">
      <EsvaziarSacola />
      <p className="tecnica text-signal">LOJA / {numero ? `PEDIDO ${numero}` : 'PEDIDO FEITO'}</p>
      <h1 className="mt-5 max-w-[16ch] text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.94] tracking-[-0.055em]">Obrigado pela compra.</h1>
      <p className="medida-texto mt-6 text-[1.05rem] leading-relaxed text-mineral">
        Assim que o Asaas confirmar o pagamento, o pedido entra em preparação; se for um software, a gente fala com você
        para combinar a entrega do código. Pix costuma confirmar em instantes; boleto pode levar alguns dias úteis depois de
        pago. Se precisar falar do pedido, use a página de contato{numero ? ` e cite o número ${numero}` : ''}.
      </p>
      <Link href={ROTA_DA_LOJA} className="alvo-toque tecnica mt-8 inline-flex items-center gap-3 rounded-full border border-signal px-6 text-signal transition-colors hover:bg-signal hover:text-ink">
        Voltar à loja <span aria-hidden="true">→</span>
      </Link>
    </Container>
  );
}
