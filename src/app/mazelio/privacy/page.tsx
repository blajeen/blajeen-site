import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { privacidadeMazelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';
export const metadata: Metadata = metadadosDaRota({ titulo: privacidadeMazelio.metaTitulo, descricao: privacidadeMazelio.metaDescricao, rota: privacidadeMazelio.rota, imagem: OG.mazelio, imagemAlt: 'Mazelio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={privacidadeMazelio} />; }
