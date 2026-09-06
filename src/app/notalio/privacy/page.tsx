import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeNotalio } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: privacidadeNotalio.metaTitulo,
  descricao: privacidadeNotalio.metaDescricao,
  rota: privacidadeNotalio.rota,
});

export default function Page() {
  return <LegalPage documento={privacidadeNotalio} />;
}
