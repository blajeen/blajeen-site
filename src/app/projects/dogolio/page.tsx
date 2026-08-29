import type { Metadata } from 'next';
import { ProjectPage } from '@/components/projects/ProjectPage';
import { dogolio } from '@/content/projects';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: dogolio.metaTitulo,
  descricao: dogolio.metaDescricao,
  rota: ROTAS.projetoDogolio,
  imagem: OG.dogolio,
  imagemAlt: dogolio.banner.alt,
  ogTitulo: 'DOGOLIO',
  ogDescricao: dogolio.ogDescricao,
});

export default function Page() {
  return <ProjectPage projeto={dogolio} />;
}
