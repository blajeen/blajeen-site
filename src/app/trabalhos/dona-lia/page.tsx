import type { Metadata } from 'next';
import { WorkDetail } from '@/components/portfolio/WorkDetail';
import { trabalhoPorId } from '@/content/portfolio';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

const trabalho = trabalhoPorId('dona-lia');

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Pousada Dona Lia — Projeto da Blajeen Labs',
  descricao: trabalho.resumo,
  rota: ROTAS.trabalhoDonaLia,
  imagem: trabalho.capa,
  imagemAlt: trabalho.capaAlt,
});

export default function DonaLiaPage() {
  return <WorkDetail trabalho={trabalho} />;
}
