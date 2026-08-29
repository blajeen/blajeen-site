import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteCatelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({ titulo: suporteCatelio.metaTitulo, descricao: suporteCatelio.metaDescricao, rota: suporteCatelio.rota, imagem: OG.catelio, imagemAlt: 'Catelio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={suporteCatelio} />; }
