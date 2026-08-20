import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { exclusaoDocalio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: exclusaoDocalio.metaTitulo,
  descricao: exclusaoDocalio.metaDescricao,
  rota: exclusaoDocalio.rota,
  imagem: OG.docalio,
  imagemAlt: 'Docalio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={exclusaoDocalio} />;
}
