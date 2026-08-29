import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { exclusaoDogolio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({ titulo: exclusaoDogolio.metaTitulo, descricao: exclusaoDogolio.metaDescricao, rota: exclusaoDogolio.rota, imagem: OG.dogolio, imagemAlt: 'Dogolio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={exclusaoDogolio} />; }
