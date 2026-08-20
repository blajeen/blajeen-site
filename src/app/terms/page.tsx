import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosEstudio } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: termosEstudio.metaTitulo,
  descricao: termosEstudio.metaDescricao,
  rota: termosEstudio.rota,
});

export default function Page() {
  return <LegalPage documento={termosEstudio} />;
}
