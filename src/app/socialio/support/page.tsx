import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteSocialio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';
export const metadata: Metadata = metadadosDaRota({ titulo: suporteSocialio.metaTitulo, descricao: suporteSocialio.metaDescricao, rota: suporteSocialio.rota, imagem: OG.socialio, imagemAlt: 'Socialio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={suporteSocialio} />; }
