import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeVivelio } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: privacidadeVivelio.metaTitulo,
  descricao: privacidadeVivelio.metaDescricao,
  rota: privacidadeVivelio.rota,
});

export default function Page() {
  return <LegalPage documento={privacidadeVivelio} />;
}
