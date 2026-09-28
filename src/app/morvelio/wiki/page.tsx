import type { Metadata } from 'next';
import { WikiHome } from '@/components/morvelio/Wiki';
import { WIKI, ICON, type Query } from '@/content/morvelio/wiki/registry';
import { metadadosDaRota } from '@/lib/metadata';

export const metadata: Metadata = metadadosDaRota({ titulo: 'Morvelio Wiki — classes, itens, missões e mundo', descricao: 'Explore as classes, equipamentos, criaturas, missões e os cinco reinos de Erdávia na wiki oficial de Morvelio.', rota: WIKI, imagem: ICON, imagemAlt: 'Morvelio observa Velidor' });
export default async function Page({ searchParams }: { searchParams: Promise<Query> }) { return <WikiHome query={await searchParams}/>; }
