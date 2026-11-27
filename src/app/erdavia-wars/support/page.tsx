import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteErdaviaWars } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: suporteErdaviaWars.metaTitulo,
  descricao: suporteErdaviaWars.metaDescricao,
  rota: suporteErdaviaWars.rota,
  imagem: OG.erdaviaWars,
  imagemAlt: 'Erdavia Wars — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={suporteErdaviaWars} />;
}
