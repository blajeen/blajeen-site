import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { exclusaoMorvelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({ titulo: exclusaoMorvelio.metaTitulo, descricao: exclusaoMorvelio.metaDescricao, rota: exclusaoMorvelio.rota, imagem: OG.morvelio, imagemAlt: 'Morvelio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={exclusaoMorvelio} />; }
