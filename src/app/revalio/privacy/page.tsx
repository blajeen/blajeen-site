import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeRevalio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: privacidadeRevalio.metaTitulo,
  descricao: privacidadeRevalio.metaDescricao,
  rota: privacidadeRevalio.rota,
  imagem: OG.revalio,
  imagemAlt: 'Revalio — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={privacidadeRevalio} />;
}
