import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/Section';
import { PedidoLoja } from '@/components/loja/PedidoLoja';
import { asaasConfigurado } from '@/lib/loja/asaas';
import { melhorEnvioConfigurado } from '@/lib/loja/melhor-envio';
import { ROTA_DA_LOJA } from '@/lib/loja/tipos';

// A sacola é de cada visitante: a página não entra em busca nem no sitemap.
export const metadata: Metadata = {
  title: { absolute: 'Sua sacola — Loja Blajeen Labs' },
  description: 'Revise os itens, calcule o frete e finalize o pedido.',
  robots: { index: false, follow: true },
};

export default function PedidoPage() {
  return (
    <Container className="pb-[clamp(4rem,9vw,9rem)] pt-[clamp(2.5rem,6vw,5rem)]">
      <Link href={ROTA_DA_LOJA} className="tecnica alvo-toque inline-flex items-center gap-3 text-mineral transition-colors hover:text-signal">
        <span aria-hidden="true">←</span> CONTINUAR ESCOLHENDO
      </Link>
      <p className="tecnica mt-8 text-signal">LOJA / PEDIDO</p>
      <h1 className="mt-5 text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.94] tracking-[-0.055em]">Sua sacola.</h1>
      <div className="mt-10">
        <PedidoLoja pagamentoOnline={asaasConfigurado()} freteOnline={melhorEnvioConfigurado()} />
      </div>
    </Container>
  );
}
