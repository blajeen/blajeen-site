import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { exclusaoGramelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: exclusaoGramelio.metaTitulo,
  descricao: exclusaoGramelio.metaDescricao,
  rota: exclusaoGramelio.rota,
  imagem: OG.gramelio,
  imagemAlt: 'Gramelio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={exclusaoGramelio} />;
}
