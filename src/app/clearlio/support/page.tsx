import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteClearlio } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: suporteClearlio.metaTitulo,
  descricao: suporteClearlio.metaDescricao,
  rota: suporteClearlio.rota,
});

export default function Page() {
  return <LegalPage documento={suporteClearlio} />;
}
