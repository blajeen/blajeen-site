import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeGramelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: privacidadeGramelio.metaTitulo,
  descricao: privacidadeGramelio.metaDescricao,
  rota: privacidadeGramelio.rota,
  imagem: OG.gramelio,
  imagemAlt: 'Gramelio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={privacidadeGramelio} />;
}
