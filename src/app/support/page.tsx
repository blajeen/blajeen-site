import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteEstudio } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: suporteEstudio.metaTitulo,
  descricao: suporteEstudio.metaDescricao,
  rota: suporteEstudio.rota,
});

export default function Page() {
  return <LegalPage documento={suporteEstudio} />;
}
