import type { Metadata } from 'next';
import { ProjectPage } from '@/components/projects/ProjectPage';
import { morvelio } from '@/content/projects';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: morvelio.metaTitulo,
  descricao: morvelio.metaDescricao,
  rota: ROTAS.projetoMorvelio,
  imagem: OG.morvelio,
  imagemAlt: morvelio.banner.alt,
  ogTitulo: 'MORVELIO',
  ogDescricao: morvelio.ogDescricao,
});

export default function Page() {
  return <ProjectPage projeto={morvelio} />;
}
