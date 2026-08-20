import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteDocalio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: suporteDocalio.metaTitulo,
  descricao: suporteDocalio.metaDescricao,
  rota: suporteDocalio.rota,
  imagem: OG.docalio,
  imagemAlt: 'Docalio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={suporteDocalio} />;
}
