import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { termosMazelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';
export const metadata: Metadata = metadadosDaRota({ titulo: termosMazelio.metaTitulo, descricao: termosMazelio.metaDescricao, rota: termosMazelio.rota, imagem: OG.mazelio, imagemAlt: 'Mazelio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={termosMazelio} />; }
