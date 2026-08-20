import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteGramelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: suporteGramelio.metaTitulo,
  descricao: suporteGramelio.metaDescricao,
  rota: suporteGramelio.rota,
  imagem: OG.gramelio,
  imagemAlt: 'Gramelio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={suporteGramelio} />;
}
