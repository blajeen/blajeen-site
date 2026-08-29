import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeDogolio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({ titulo: privacidadeDogolio.metaTitulo, descricao: privacidadeDogolio.metaDescricao, rota: privacidadeDogolio.rota, imagem: OG.dogolio, imagemAlt: 'Dogolio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={privacidadeDogolio} />; }
