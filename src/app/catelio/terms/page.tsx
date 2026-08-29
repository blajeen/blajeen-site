import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosCatelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({ titulo: termosCatelio.metaTitulo, descricao: termosCatelio.metaDescricao, rota: termosCatelio.rota, imagem: OG.catelio, imagemAlt: 'Catelio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={termosCatelio} />; }
