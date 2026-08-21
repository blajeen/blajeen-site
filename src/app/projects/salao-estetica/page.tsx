import type { Metadata } from 'next';
import { UpcomingProductPage, type UpcomingProduct } from '@/components/projects/UpcomingProductPage';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Plataforma para salões e estética — Blajeen Labs',
  descricao:
    'Produto digital em desenvolvimento para salões de beleza e negócios de estética, adaptado à identidade e à rotina de cada operação.',
  rota: ROTAS.salaoEstetica,
  semImagem: true,
});

const product: UpcomingProduct = {
  icon: 'salao',
  eyebrow: 'PRODUTO 03 / SALÕES E ESTÉTICA',
  title: 'Plataforma para salões e estética',
  headline: 'Sua marca e sua rotina em uma experiência própria.',
  introduction:
    'Uma linha de produto para salões de beleza e negócios de estética apresentarem seu trabalho e construírem uma jornada de atendimento coerente com a operação.',
  contactId: 'salao-estetica',
  contactLabel: 'Quero conversar sobre meu salão',
  directions: [
    {
      title: 'Presença com identidade',
      text: 'A marca, os serviços, a equipe e o ambiente orientam a experiência, sem transformar o negócio em mais um template genérico.',
    },
    {
      title: 'Jornada de atendimento',
      text: 'Descoberta, contato e organização da agenda serão desenhados de acordo com a forma real de atender de cada operação.',
    },
    {
      title: 'Regras respeitadas',
      text: 'Horários, serviços, profissionais e prioridades entram no escopo somente depois de entender como o salão ou espaço de estética funciona.',
    },
  ],
};

export default function SalaoEsteticaPage() {
  return <UpcomingProductPage product={product} />;
}
