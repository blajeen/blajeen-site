import type { Metadata } from 'next';
import { ProjectPage } from '@/components/projects/ProjectPage';
import { gramelio } from '@/content/projects';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: gramelio.metaTitulo,
  descricao: gramelio.metaDescricao,
  rota: ROTAS.projetoGramelio,
  imagem: OG.gramelio,
  imagemAlt: gramelio.banner.alt,
  ogTitulo: 'GRAMELIO',
  ogDescricao: gramelio.ogDescricao,
});

export default function Page() {
  return <ProjectPage projeto={gramelio} />;
}
