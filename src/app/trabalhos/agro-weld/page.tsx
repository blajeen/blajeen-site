import type { Metadata } from 'next';
import { WorkDetail } from '@/components/portfolio/WorkDetail';
import { trabalhoPorId } from '@/content/portfolio';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

const trabalho = trabalhoPorId('agro-weld');

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Agro Weld — Projeto da Blajeen Labs',
  descricao: trabalho.resumo,
  rota: ROTAS.trabalhoAgroWeld,
  imagem: trabalho.capa,
  imagemAlt: trabalho.capaAlt,
});

export default function AgroWeldPage() {
  return <WorkDetail trabalho={trabalho} />;
}
