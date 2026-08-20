import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosRevalio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: termosRevalio.metaTitulo,
  descricao: termosRevalio.metaDescricao,
  rota: termosRevalio.rota,
  imagem: OG.revalio,
  imagemAlt: 'Revalio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={termosRevalio} />;
}
