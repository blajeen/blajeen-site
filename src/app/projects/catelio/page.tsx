import type { Metadata } from 'next';
import { ProjectPage } from '@/components/projects/ProjectPage';
import { catelio } from '@/content/projects';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: catelio.metaTitulo,
  descricao: catelio.metaDescricao,
  rota: ROTAS.projetoCatelio,
  imagem: OG.catelio,
  imagemAlt: catelio.banner.alt,
  ogTitulo: 'CATELIO',
  ogDescricao: catelio.ogDescricao,
});

export default function Page() {
  return <ProjectPage projeto={catelio} />;
}
