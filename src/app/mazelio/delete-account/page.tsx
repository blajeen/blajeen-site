import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { exclusaoMazelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';
export const metadata: Metadata = metadadosDaRota({ titulo: exclusaoMazelio.metaTitulo, descricao: exclusaoMazelio.metaDescricao, rota: exclusaoMazelio.rota, imagem: OG.mazelio, imagemAlt: 'Mazelio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={exclusaoMazelio} />; }
