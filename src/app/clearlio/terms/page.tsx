import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosClearlio } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: termosClearlio.metaTitulo,
  descricao: termosClearlio.metaDescricao,
  rota: termosClearlio.rota,
});

export default function Page() {
  return <LegalPage documento={termosClearlio} />;
}
