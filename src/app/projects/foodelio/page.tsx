import type { Metadata } from 'next';
import { UpcomingProductPage, type UpcomingProduct } from '@/components/projects/UpcomingProductPage';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Foodelio — Blajeen Labs',
  descricao: 'SaaS em desenvolvimento para cardápios e pedidos de operações de alimentação.',
  rota: ROTAS.foodelio,
});

const produto: UpcomingProduct = {
  icon: 'food',
  eyebrow: 'SAAS 06 / ALIMENTAÇÃO',
  title: 'Foodelio',
  headline: 'Cardápio e pedidos com a identidade do seu negócio.',
  introduction: 'Uma base em desenvolvimento para restaurantes, lanchonetes e operações de alimentação apresentarem o cardápio e organizarem pedidos.',
  contactId: 'foodelio',
  contactLabel: 'Tenho interesse no Foodelio',
  directions: [
    { title: 'Cardápio próprio', text: 'Categorias, itens, complementos e informações organizados para facilitar a escolha.' },
    { title: 'Pedido sem ruído', text: 'Uma jornada objetiva para receber o pedido com contexto e confirmar o próximo passo.' },
    { title: 'Operação configurável', text: 'Horários, disponibilidade, retirada, entrega e regras ajustados à rotina de cada negócio.' },
  ],
};

export default function FoodelioPage() {
  return <UpcomingProductPage product={produto} />;
}
