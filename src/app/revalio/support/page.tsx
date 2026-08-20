import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteRevalio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: suporteRevalio.metaTitulo,
  descricao: suporteRevalio.metaDescricao,
  rota: suporteRevalio.rota,
  imagem: OG.revalio,
  imagemAlt: 'Revalio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={suporteRevalio} />;
}
