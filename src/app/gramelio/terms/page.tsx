import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosGramelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: termosGramelio.metaTitulo,
  descricao: termosGramelio.metaDescricao,
  rota: termosGramelio.rota,
  imagem: OG.gramelio,
  imagemAlt: 'Gramelio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={termosGramelio} />;
}
