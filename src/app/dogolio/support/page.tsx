import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteDogolio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({ titulo: suporteDogolio.metaTitulo, descricao: suporteDogolio.metaDescricao, rota: suporteDogolio.rota, imagem: OG.dogolio, imagemAlt: 'Dogolio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={suporteDogolio} />; }
