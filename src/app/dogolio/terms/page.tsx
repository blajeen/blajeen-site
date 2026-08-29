import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosDogolio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({ titulo: termosDogolio.metaTitulo, descricao: termosDogolio.metaDescricao, rota: termosDogolio.rota, imagem: OG.dogolio, imagemAlt: 'Dogolio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={termosDogolio} />; }
