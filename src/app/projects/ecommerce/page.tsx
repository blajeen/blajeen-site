import type { Metadata } from 'next';
import { UpcomingProductPage, type UpcomingProduct } from '@/components/projects/UpcomingProductPage';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'E-commerce sob medida — Blajeen Labs',
  descricao:
    'E-commerce em desenvolvimento para marcas que precisam de uma vitrine e uma jornada de compra coerentes com o próprio negócio.',
  rota: ROTAS.ecommerce,
  semImagem: true,
});

const product: UpcomingProduct = {
  slug: 'ecommerce',
  icon: 'ecommerce',
  eyebrow: 'PRODUTO 05 / E-COMMERCE',
  title: 'E-commerce sob medida',
  headline: 'Uma loja digital com a identidade da sua marca.',
  introduction:
    'Uma linha de produto para marcas que querem apresentar e vender seus produtos em uma experiência própria, pensada a partir do catálogo e da operação real.',
  contactId: 'ecommerce',
  contactLabel: 'Quero conversar sobre minha loja',
  directions: [
    {
      title: 'Vitrine com identidade',
      text: 'Direção visual, conteúdo e apresentação dos produtos partem da marca e do posicionamento do negócio.',
    },
    {
      title: 'Catálogo bem organizado',
      text: 'Categorias, informações e prioridades serão estruturadas conforme o tipo de produto e a maneira como o público escolhe.',
    },
    {
      title: 'Jornada de compra planejada',
      text: 'A experiência será definida antes da implementação; recursos e integrações só serão confirmados depois do escopo técnico.',
    },
  ],
};

export default function EcommercePage() {
  return <UpcomingProductPage product={product} />;
}
