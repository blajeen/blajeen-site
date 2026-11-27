import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { exclusaoErdaviaWars } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: exclusaoErdaviaWars.metaTitulo,
  descricao: exclusaoErdaviaWars.metaDescricao,
  rota: exclusaoErdaviaWars.rota,
  imagem: OG.erdaviaWars,
  imagemAlt: 'Erdavia Wars — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={exclusaoErdaviaWars} />;
}
