import type { Metadata } from 'next';
import { ProjectPage } from '@/components/projects/ProjectPage';
import { erdaviaWars } from '@/content/projects';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: erdaviaWars.metaTitulo,
  descricao: erdaviaWars.metaDescricao,
  rota: ROTAS.projetoErdaviaWars,
  imagem: OG.erdaviaWars,
  imagemAlt: erdaviaWars.banner.alt,
  ogDescricao: erdaviaWars.ogDescricao,
});

export default function Page() {
  return <ProjectPage projeto={erdaviaWars} />;
}
