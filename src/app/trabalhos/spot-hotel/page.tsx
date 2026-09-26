import type { Metadata } from 'next';
import { WorkDetail } from '@/components/portfolio/WorkDetail';
import { trabalhoPorId } from '@/content/portfolio';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

const trabalho = trabalhoPorId('spot-hotel');

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Spot Hotel e Pousada — Projeto da Blajeen Labs',
  descricao: trabalho.resumo,
  rota: ROTAS.trabalhoSpotHotel,
  imagem: trabalho.capa,
  imagemAlt: trabalho.capaAlt,
});

export default function SpotHotelPage() {
  return <WorkDetail trabalho={trabalho} />;
}
