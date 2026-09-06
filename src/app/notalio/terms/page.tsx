import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosNotalio } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: termosNotalio.metaTitulo,
  descricao: termosNotalio.metaDescricao,
  rota: termosNotalio.rota,
});

export default function Page() {
  return <LegalPage documento={termosNotalio} />;
}
