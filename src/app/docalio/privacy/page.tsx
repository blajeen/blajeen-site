import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeDocalio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: privacidadeDocalio.metaTitulo,
  descricao: privacidadeDocalio.metaDescricao,
  rota: privacidadeDocalio.rota,
  imagem: OG.docalio,
  imagemAlt: 'Docalio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={privacidadeDocalio} />;
}
