import type { Metadata } from 'next';
import { ProjectPage } from '@/components/projects/ProjectPage';
import { docalio } from '@/content/projects';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: docalio.metaTitulo,
  descricao: docalio.metaDescricao,
  rota: ROTAS.projetoDocalio,
  imagem: OG.docalio,
  imagemAlt: docalio.banner.alt,
  ogTitulo: 'DOCALIO',
  ogDescricao: docalio.ogDescricao,
});

export default function Page() {
  return <ProjectPage projeto={docalio} />;
}
