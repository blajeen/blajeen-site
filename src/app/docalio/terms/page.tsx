import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosDocalio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: termosDocalio.metaTitulo,
  descricao: termosDocalio.metaDescricao,
  rota: termosDocalio.rota,
  imagem: OG.docalio,
  imagemAlt: 'Docalio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={termosDocalio} />;
}
