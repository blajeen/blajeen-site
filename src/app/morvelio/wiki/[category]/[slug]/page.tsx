import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WikiEntry } from '@/components/morvelio/Wiki';
import { entries, ICON, entryPath, type Query } from '@/content/morvelio/wiki/registry';
import { metadadosDaRota } from '@/lib/metadata';

type Props = {params:Promise<{category:string;slug:string}>;searchParams:Promise<Query>};
async function find(params:Props['params']){const p=await params;const e=entries.find(x=>x.category===p.category&&x.slug===p.slug);if(!e)notFound();return e;}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const e=await find(params);
 return metadadosDaRota({titulo:`${e.spoiler?'Arquivo de história':e.title} — Morvelio Wiki`,descricao:e.spoiler?'Esta ficha contém revelações. Escolha o nível de spoilers para consultar a história.':e.summary,rota:entryPath(e),imagem:ICON,imagemAlt:'Morvelio Wiki'});
}
export default async function Page({params,searchParams}:Props){return <WikiEntry entry={await find(params)} query={await searchParams}/>;}
