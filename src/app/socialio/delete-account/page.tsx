import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { exclusaoSocialio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';
export const metadata: Metadata = metadadosDaRota({ titulo: exclusaoSocialio.metaTitulo, descricao: exclusaoSocialio.metaDescricao, rota: exclusaoSocialio.rota, imagem: OG.socialio, imagemAlt: 'Socialio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={exclusaoSocialio} />; }
