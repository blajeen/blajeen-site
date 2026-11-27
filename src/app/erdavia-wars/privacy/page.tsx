import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeErdaviaWars } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({
  titulo: privacidadeErdaviaWars.metaTitulo,
  descricao: privacidadeErdaviaWars.metaDescricao,
  rota: privacidadeErdaviaWars.rota,
  imagem: OG.erdaviaWars,
  imagemAlt: 'Erdavia Wars — Blajeen Labs',
});

export default function Page() {
  return <LegalPage documento={privacidadeErdaviaWars} />;
}
