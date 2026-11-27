import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosErdaviaWars } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: termosErdaviaWars.metaTitulo,
  descricao: termosErdaviaWars.metaDescricao,
  rota: termosErdaviaWars.rota,
  imagem: OG.erdaviaWars,
  imagemAlt: 'Erdavia Wars — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={termosErdaviaWars} />;
}
