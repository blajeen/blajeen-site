import type { Metadata } from 'next';
import { WorkDetail } from '@/components/portfolio/WorkDetail';
import { trabalhoPorId } from '@/content/portfolio';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

const trabalho = trabalhoPorId('lina-art-pet');

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Lina Art Pet — Trabalho da Blajeen Labs',
  descricao: trabalho.resumo,
  rota: ROTAS.trabalhoLinaArtPet,
  imagem: trabalho.capa,
  imagemAlt: trabalho.capaAlt,
});

export default function LinaArtPetPage() {
  return <WorkDetail trabalho={trabalho} />;
}

