import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { suporteMazelio } from '@/content/legal';
import { metadadosDaRota, OG } from '@/lib/metadata';
export const metadata: Metadata = metadadosDaRota({ titulo: suporteMazelio.metaTitulo, descricao: suporteMazelio.metaDescricao, rota: suporteMazelio.rota, imagem: OG.mazelio, imagemAlt: 'Mazelio — Blajeen Labs' });
export default function Page() { return <LegalPage documento={suporteMazelio} />; }
