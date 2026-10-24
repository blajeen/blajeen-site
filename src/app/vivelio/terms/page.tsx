import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosVivelio } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: termosVivelio.metaTitulo,
  descricao: termosVivelio.metaDescricao,
  rota: termosVivelio.rota,
});

export default function Page() {
  return <LegalPage documento={termosVivelio} />;
}
