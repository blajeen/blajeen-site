import type { Metadata } from 'next';
import { ProjectPage } from '@/components/projects/ProjectPage';
import { revalio } from '@/content/projects';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: revalio.metaTitulo,
  descricao: revalio.metaDescricao,
  rota: ROTAS.projetoRevalio,
  imagem: OG.revalio,
  imagemAlt: revalio.banner.alt,
  ogTitulo: 'REVALIO',
  ogDescricao: revalio.ogDescricao,
});

export default function Page() {
  return <ProjectPage projeto={revalio} />;
}
