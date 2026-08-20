import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeEstudio } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: privacidadeEstudio.metaTitulo,
  descricao: privacidadeEstudio.metaDescricao,
  rota: privacidadeEstudio.rota,
});

export default function Page() {
  return <LegalPage documento={privacidadeEstudio} />;
}
