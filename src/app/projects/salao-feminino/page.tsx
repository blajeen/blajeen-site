import type { Metadata } from 'next';
import { UpcomingProductPage, type UpcomingProduct } from '@/components/projects/UpcomingProductPage';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Plataforma para salões de cabelo feminino — Blajeen Labs',
  descricao:
    'Produto digital em desenvolvimento para salões de cabelo feminino, adaptado à marca, aos serviços e à rotina de cada salão.',
  rota: ROTAS.salaoFeminino,
  semImagem: true,
});

const product: UpcomingProduct = {
  icon: 'cabelo',
  eyebrow: 'PRODUTO 03 / CABELO FEMININO',
  title: 'Plataforma para salões de cabelo feminino',
  headline: 'O trabalho do seu salão apresentado com a força da sua marca.',
  introduction:
    'Uma linha de produto dedicada à rotina de cabelo feminino, separada das operações de estética, unhas, cílios e maquiagem.',
  contactId: 'salao-feminino',
  contactLabel: 'Quero conversar sobre meu salão de cabelo',
  directions: [
    {
      title: 'Cabelo como especialidade',
      text: 'A apresentação do salão parte dos serviços de cabelo, da equipe e do posicionamento construído com as clientes.',
    },
    {
      title: 'Jornada coerente com o salão',
      text: 'Contato, organização dos serviços e atendimento serão desenhados conforme a rotina real dos profissionais.',
    },
    {
      title: 'Identidade sem template genérico',
      text: 'Marca, ambiente, linguagem e prioridades visuais serão tratados como parte central do produto.',
    },
  ],
};

export default function SalaoFemininoPage() {
  return <UpcomingProductPage product={product} />;
}
