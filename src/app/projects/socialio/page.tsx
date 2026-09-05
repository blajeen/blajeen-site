import type { Metadata } from 'next';
import { ProjectPage } from '@/components/projects/ProjectPage';
import { socialio } from '@/content/projects';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: socialio.metaTitulo, descricao: socialio.metaDescricao, rota: ROTAS.projetoSocialio,
  imagem: OG.socialio, imagemAlt: socialio.banner.alt, ogTitulo: 'SOCIALIO', ogDescricao: socialio.ogDescricao,
});
export default function Page() { return <ProjectPage projeto={socialio} />; }
