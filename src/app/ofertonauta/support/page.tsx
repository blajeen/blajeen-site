import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteOfertonauta } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';
const documento = suporteOfertonauta;
export const metadata: Metadata = metadadosDaRota({ titulo: documento.metaTitulo, descricao: documento.metaDescricao, rota: documento.rota });
export default function Page() { return <LegalPage documento={documento} />; }
