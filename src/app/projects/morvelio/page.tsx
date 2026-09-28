import type { Metadata } from 'next';
import { MorvelioPage } from '@/components/morvelio/MorvelioPage';
import { morvelio } from '@/content/projects';
import { metadadosDaRota, OG } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: morvelio.metaTitulo,
  descricao: morvelio.metaDescricao,
  rota: ROTAS.projetoMorvelio,
  imagem: OG.morvelio,
  imagemAlt: 'Morvelio observa Velidor do alto da montanha, com o Orbe brilhando na bolsa.',
  ogTitulo: 'MORVELIO',
  ogDescricao: morvelio.ogDescricao,
});

export default function Page() {
  return <MorvelioPage />;
}
