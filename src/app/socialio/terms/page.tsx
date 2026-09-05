import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosSocialio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';
export const metadata: Metadata = metadadosDaRota({ titulo: termosSocialio.metaTitulo, descricao: termosSocialio.metaDescricao, rota: termosSocialio.rota, imagem: OG.socialio, imagemAlt: 'Socialio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={termosSocialio} />; }
