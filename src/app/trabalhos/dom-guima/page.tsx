import type { Metadata } from 'next';
import { WorkDetail } from '@/components/portfolio/WorkDetail';
import { trabalhoPorId } from '@/content/portfolio';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

const trabalho = trabalhoPorId('dom-guima');

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Dom Guima — Trabalho da Blajeen Labs',
  descricao: trabalho.resumo,
  rota: ROTAS.trabalhoDomGuima,
  imagem: trabalho.capa,
  imagemAlt: trabalho.capaAlt,
});

export default function DomGuimaPage() {
  return <WorkDetail trabalho={trabalho} />;
}

