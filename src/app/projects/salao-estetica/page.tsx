import type { Metadata } from 'next';
import { UpcomingProductPage, type UpcomingProduct } from '@/components/projects/UpcomingProductPage';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Plataforma para estética e beleza — Blajeen Labs',
  descricao:
    'Produto digital em desenvolvimento para estética, unhas, sobrancelhas, cílios, maquiagem e produção de beleza.',
  rota: ROTAS.salaoEstetica,
  semImagem: true,
});

const product: UpcomingProduct = {
  icon: 'salao',
  eyebrow: 'PRODUTO 04 / ESTÉTICA E BELEZA',
  title: 'Plataforma para estética e beleza',
  headline: 'Todos os seus serviços de beleza em uma experiência própria.',
  introduction:
    'Uma linha separada dos salões de cabelo, pensada para espaços de estética, unhas, olhar, maquiagem e produção de beleza.',
  contactId: 'salao-estetica',
  contactLabel: 'Quero conversar sobre meu espaço de beleza',
  directions: [
    {
      title: 'Presença com identidade',
      text: 'A marca, os serviços, os profissionais e o ambiente orientam a experiência, sem transformar o negócio em mais um template genérico.',
    },
    {
      title: 'Jornada de atendimento',
      text: 'Descoberta, contato e organização do atendimento serão desenhados de acordo com a forma real de trabalhar de cada operação.',
    },
    {
      title: 'Regras respeitadas',
      text: 'Duração, combinações, profissionais e prioridades entram no escopo somente depois de entender como o espaço de beleza funciona.',
    },
  ],
  servicesTitle: 'Estética, unhas, olhar e produção de beleza sem misturar com cabelo.',
  servicesIntroduction:
    'A estrutura será preparada para organizar serviços individuais, produções completas e combinações definidas pelo negócio.',
  services: [
    'Estética facial',
    'Estética corporal',
    'Manicure',
    'Pedicure',
    'Nail Art',
    'Alongamento de unhas',
    'Sobrancelhas',
    'Brow Design',
    'Brow Lamination',
    'Extensão de cílios',
    'Lash Lifting',
    'Maquiagem',
    'Maquiagem social',
    'Maquiagem para eventos',
    'Noivas',
    'Produção de beleza',
    'Pacotes de beleza',
    'Serviços combinados',
  ],
};

export default function SalaoEsteticaPage() {
  return <UpcomingProductPage product={product} />;
}
