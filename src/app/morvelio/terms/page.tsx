import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosMorvelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({ titulo: termosMorvelio.metaTitulo, descricao: termosMorvelio.metaDescricao, rota: termosMorvelio.rota, imagem: OG.morvelio, imagemAlt: 'Morvelio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={termosMorvelio} />; }
