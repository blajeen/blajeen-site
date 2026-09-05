import type { Metadata } from 'next';
import { ProjectPage } from '@/components/projects/ProjectPage';
import { mazelio } from '@/content/projects';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: mazelio.metaTitulo, descricao: mazelio.metaDescricao, rota: ROTAS.projetoMazelio,
  imagem: OG.mazelio, imagemAlt: mazelio.banner.alt, ogTitulo: 'MAZELIO', ogDescricao: mazelio.ogDescricao,
});
export default function Page() { return <ProjectPage projeto={mazelio} />; }
