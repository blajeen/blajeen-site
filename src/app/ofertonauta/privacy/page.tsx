import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeOfertonauta } from '@/content/legal';
import { metadadosDaRota } from '@/lib/metadata';
const documento = privacidadeOfertonauta;
export const metadata: Metadata = metadadosDaRota({ titulo: documento.metaTitulo, descricao: documento.metaDescricao, rota: documento.rota });
export default function Page() { return <LegalPage documento={documento} />; }
