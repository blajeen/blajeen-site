import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeSocialio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';
export const metadata: Metadata = metadadosDaRota({ titulo: privacidadeSocialio.metaTitulo, descricao: privacidadeSocialio.metaDescricao, rota: privacidadeSocialio.rota, imagem: OG.socialio, imagemAlt: 'Socialio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={privacidadeSocialio} />; }
