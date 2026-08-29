import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeCatelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({ titulo: privacidadeCatelio.metaTitulo, descricao: privacidadeCatelio.metaDescricao, rota: privacidadeCatelio.rota, imagem: OG.catelio, imagemAlt: 'Catelio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={privacidadeCatelio} />; }
