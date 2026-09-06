import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeClearlio } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: privacidadeClearlio.metaTitulo,
  descricao: privacidadeClearlio.metaDescricao,
  rota: privacidadeClearlio.rota,
});

export default function Page() {
  return <LegalPage documento={privacidadeClearlio} />;
}
